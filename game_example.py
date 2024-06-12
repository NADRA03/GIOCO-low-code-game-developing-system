import pygame
import sys
import threading

# Initialize Pygame
pygame.init()

# Set up the game window
screen_width, screen_height = 800, 600
screen = pygame.display.set_mode((screen_width, screen_height))
pygame.display.set_caption("Hero vs Enemy")

# Load images
hero_image = pygame.image.load("./png_examples/hero.png")
enemy_image = pygame.image.load("./png_examples/enemy.png")
background_image = pygame.image.load("./png_examples/background.png")  # Load the background image

# Resize images
hero_image = pygame.transform.scale(hero_image, (100, 100))
enemy_image = pygame.transform.scale(enemy_image, (110, 110))
background_image = pygame.transform.scale(background_image, (screen_width, screen_height))  # Resize the background image

# Set initial positions
hero_x = 0
hero_y = screen_height - 45 - hero_image.get_height()

# Set movement variables
move_right = False
jump = False
left = False
right = False
jump_count = 10
fall_count = 0

# Enemy variables
enemy_x = screen_width - enemy_image.get_width()
enemy_y = screen_height - 45 - enemy_image.get_height()
global enemy_speed
enemy_speed = 0.7  # Adjust the speed as per your preference

# Function to update hero position
def update_hero_position():
    global hero_x, hero_y, jump, right, left, jump_count, fall_count
    while True:
        if jump:
            if jump_count >= -10:
                neg = 2
                if jump_count < 0:
                    neg = -2
                hero_y -= (jump_count ** 2) * 0.5 * neg
                hero_x += 15
                jump_count -= 1
            else:
                jump = False
                jump_count = 10
        else:
            if hero_y < screen_height - hero_image.get_height() - 45:
                fall_count += 1
                hero_y += fall_count * 0.2
            else:
                if hero_x > 0:
                 hero_x -= 3
                fall_count = 0
        if right:
                hero_x += 14
                if not right:
                 break
        if left:
             hero_x -= 14
             if not left:
                 break       
        pygame.time.delay(15)


# Function to update enemy position
def update_enemy_position():
    global enemy_x
    global enemy_speed
    while True:
        enemy_x -= enemy_speed
        if enemy_x < 0:
            enemy_x = screen_width - enemy_image.get_width()
            enemy_speed += 0.05

        pygame.time.delay(1)  # Delay to control the speed of enemy movement


# Create threads for hero and enemy movement
hero_thread = threading.Thread(target=update_hero_position, daemon=True)
hero_thread.start()
enemy_thread = threading.Thread(target=update_enemy_position, daemon=True)
enemy_thread.start()


# Function to check if a point is inside a rectangle
def is_inside_rect(point, rect):
    x, y = point
    rx, ry, rw, rh = rect
    return rx <= x <= rx + rw and ry <= y <= ry + rh


# Function to start the game
def start_game():
    global game_started
    game_started = True


# Button properties
button_width = 200
button_height = 50
button_x = (screen_width - button_width) // 2
button_y = (screen_height - button_height) // 2

# Game loop
game_started = False
while True:
    # Draw the background image
    screen.blit(background_image, (0, 0))

    # Event handling
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            pygame.quit()
            sys.exit()
        elif event.type == pygame.KEYDOWN:
            if event.key == pygame.K_SPACE and not jump:
                jump = True
            if event.key == pygame.K_RIGHT:
                right = True
            if event.key == pygame.K_LEFT:
                left = True
        elif event.type == pygame.KEYUP:
            if event.key == pygame.K_RIGHT:
                right = False
            if event.key == pygame.K_LEFT:
                left = False
        elif event.type == pygame.MOUSEBUTTONDOWN and not game_started:
            mouse_pos = pygame.mouse.get_pos()
            if is_inside_rect(mouse_pos, (button_x, button_y, button_width, button_height)):
                start_game()

    # Check for collision
    if game_started:
        hero_rect = pygame.Rect(hero_x, hero_y, hero_image.get_width(), hero_image.get_height())
        enemy_rect = pygame.Rect(enemy_x, enemy_y, enemy_image.get_width(), enemy_image.get_height())
        if hero_rect.colliderect(enemy_rect):
            print("Game Over!")
            pygame.quit()
            sys.exit()

        # Draw images
        screen.blit(hero_image, (hero_x, hero_y))
        screen.blit(enemy_image, (enemy_x, enemy_y))

    # Draw button
    if not game_started:
        pygame.draw.rect(screen, (255, 0, 0), (button_x, button_y, button_width, button_height))
        font = pygame.font.Font(None, 36)
        text = font.render("Start Game", True, (255, 255, 255))
        text_rect = text.get_rect(center=(button_x + button_width // 2, button_y + button_height // 2))
        screen.blit(text, text_rect)

    # Update the display
    pygame.display.flip()
    pygame.time.delay(10)  # Add a slight delay to control the game loop speed
d