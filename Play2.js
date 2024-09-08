import React, { useEffect, useRef, useState } from 'react';
import { View, Image, Animated, TouchableOpacity, Dimensions, StyleSheet, Text } from 'react-native';
import CustomText from './CustomText';

const { width, height } = Dimensions.get('window');

const PlayScreen = () => {
  const [heroPosition, setHeroPosition] = useState({ x: 0, y: height - 150 });
  const [jumping, setJumping] = useState(false);
  const [movingDirection, setMovingDirection] = useState(null);
  const [objects, setObjects] = useState([]);
  const [jumpComplete, setJumpComplete] = useState(true);
  const [onObject, setOnObject] = useState(false);
  const [falling, setFalling] = useState(false);
  const jumpAnim = useRef(new Animated.Value(0)).current;
  const jumpXAnim = useRef(new Animated.Value(0)).current;

  const objectPosition = { x: width / 2, y: height - 200 }; 
  const objectWidth = 300;
  const objectHeight = 50;




//Jumping 
  useEffect(() => {
    if (jumping) {
      setOnObject(false);
      const jumpAnimation = Animated.parallel([
        Animated.sequence([
          Animated.timing(jumpAnim, {
            toValue: -350,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(jumpAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(jumpXAnim, {
          toValue: 200,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]);

      jumpAnimation.start(() => {
        setHeroPosition(prevPosition => ({
          ...prevPosition,
          x: Math.min(prevPosition.x + 200, width - 70),
          y: height - 150,
        }));
        jumpXAnim.setValue(0);
        setJumping(false);
        setJumpComplete(true);
      });

      const intervalId = setInterval(() => {
        const heroX = heroPosition.x + jumpXAnim.__getValue();
        const heroY = heroPosition.y + jumpAnim.__getValue(); 
        if (
          heroX + 70 > objectPosition.x &&
          heroX < objectPosition.x + objectWidth &&
          heroY + 70 > objectPosition.y &&
          heroY < objectPosition.y + objectHeight
        ) {
          jumpAnimation.stop();
          clearInterval(intervalId);
          setHeroPosition(prevPosition => ({
            ...prevPosition,
            y: objectPosition.y - 70, 
          }));
          setOnObject(true);
          
          console.log('Hero X:', heroX);
          console.log('Hero Y:', heroY);
          console.log('Object X:', objectPosition.x);
          console.log('Object Y:', objectPosition.y);
        }
      }, 16); 

      return () => clearInterval(intervalId);
    }
  }, [jumping, heroPosition.x, heroPosition.y]);


  useEffect(() => {
    if (onObject && !falling) {
      const intervalId = setInterval(() => {
        const heroX = heroPosition.x;

        // Check if hero passed object dimensions
        if (heroX + 70 < objectPosition.x || heroX > objectPosition.x + objectWidth) {
          setFalling(true);
          setOnObject(false);

          // Falling animation
          Animated.timing(jumpAnim, {
            toValue: 0, // Adjust this value based on the height of the fall
            duration: 500,
            useNativeDriver: true,
          }).start(() => {
            setHeroPosition(prevPosition => ({
              ...prevPosition,
              y: height - 150, // Reset hero to the ground level
            }));
            setFalling(false);
          });
        }
      }, 16);

      return () => clearInterval(intervalId);
    }
  }, [onObject, heroPosition.x]);




  const handleKeyPress = (e) => {
    if (e.key === ' ') {
      if (!jumping && jumpComplete) {
        setJumping(true);
        setJumpComplete(false);
        setOnObject(false);
      }
    } else if (e.key === 'ArrowLeft') {
      setMovingDirection('left');
      setHeroPosition(prevPosition => ({
        ...prevPosition,
        x: Math.max(prevPosition.x - 30, 0) 
      }));
    } else if (e.key === 'ArrowRight') {
      setMovingDirection('right');
      setHeroPosition(prevPosition => ({
        ...prevPosition,
        x: Math.min(prevPosition.x + 30, width - 70) 
      }));
    }
  };

  const handleKeyUp = (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      setMovingDirection(null);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [jumping, movingDirection]);

  const handleButtonPress = (direction) => {
    if (direction === 'left') {
      setHeroPosition(prevPosition => ({
        ...prevPosition,
        x: Math.max(prevPosition.x - 30, 0) 
      }));
    } else if (direction === 'right') {
      setHeroPosition(prevPosition => ({
        ...prevPosition,
        x: Math.min(prevPosition.x + 30, width - 100) 
      }));
    }
  };

  const handleButtonRelease = () => {
    setMovingDirection(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.heroContainer}>
        <Animated.View
          style={[
            styles.hero,
            {
              transform: [
                { translateY: jumpAnim },
                { translateX: jumpXAnim }
              ],
              left: heroPosition.x
            }
          ]}
        >
         <Image source={require('./assets/hero.gif')} style={styles.heroImage} />
          <View style={[styles.collisionDot, { left: 20 }]} />
          <View style={[styles.collisionDot, { left: 50 }]} />
         </Animated.View>
    </View>
    <View style={[styles.object, { left: objectPosition.x, top: objectPosition.y }]}>
          <Image source={require('./assets/14.png')} style={styles.objectImage} />
    </View>
<View style={styles.controls}>
<TouchableOpacity
  style={[styles.controlButton, styles.leftButton]}
  onPressIn={() => handleButtonPress('left')}
  onPressOut={handleButtonRelease}
>
  <Text style={styles.buttonText}>Left</Text>
</TouchableOpacity>
<TouchableOpacity
  style={styles.jumpButton}
  onPress={() => { if (!jumping) setJumping(true); }}
>
  <Text style={styles.buttonText}>Jump</Text>
</TouchableOpacity>
<TouchableOpacity
  style={[styles.controlButton, styles.rightButton]}
  onPressIn={() => handleButtonPress('right')}
  onPressOut={handleButtonRelease}
>
  <Text style={styles.buttonText}>Right</Text>
</TouchableOpacity>
</View>
</View>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#87CEEB',
    overflow: 'hidden',
  },
  heroContainer: {
    position: 'absolute',
    bottom: 50, 
    width: width,
    alignItems: 'flex-start',
    zIndex: 10, 
  },
  hero: {
    width: 70,
    height: 70,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  button: {
    padding: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    marginHorizontal: 5,
    position: 'absolute',
    bottom: 500,
    left: (width / 2) - 50,
    width: 100,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#000000',
    fontFamily: 'Minecraft Regular',
    fontSize: 16,
  },
  controls: {
    position: 'absolute',
    bottom: 5,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  controlButton: {
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    width: 80,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  leftButton: {
    left: 70,
    bottom: 240,
  },
  rightButton: {
    right: 70,
    bottom: 240,
  },
  jumpButton: {
    padding: 10,
    bottom: 300,
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    width: 80,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  collisionDot: {
    position: 'absolute',
    width: 5,
    height: 5,
    backgroundColor: 'red',
  },
trap: {
  position: 'absolute',
  width: 300,
  height: 50,
  zIndex: 5,
},
trapImage: {
  width: '100%',
  height: '100%',
},


//object
object: {
  position: 'absolute',
  width: 300,
  height: 50,
  zIndex: 5,
},
objectImage: {
  width: '100%',
  height: '100%', 
},
});

export default PlayScreen;