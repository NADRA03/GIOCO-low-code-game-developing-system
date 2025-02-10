import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useNavigate } from 'react-router-native';
import { Easing } from 'react-native';
import CustomText from './CustomText';
import { Dimensions } from 'react-native';

export default function Run() {
  let [time, setTime] = useState(60);
  let [intervalId, setIntervalId] = useState(null);
  let [heartCount, setHeartCount] = useState(3);
  let [score, setScore] = useState(0);
  let navigate = useNavigate();
  let levels = 1;
  let [level, setLevel] = useState(0); 
  let [blocks, setBlocks] = useState([]); 
  let [cameraPosition, setCameraPosition] = useState({ x: 0, y: 0 });  
  let GROUND_Y = 0;
  let [heroPosition, setHeroPosition] = useState({ x: 0, y: initialHeroY})
  let initialHeroY = 0; 
  let [direction, setDirection] = useState('+'); 
  let gameWidth = 1600; 
  let jumpHeight = -150; 
  let jumpDuration = 500; 
  let stepSize = 20;
  let jumpSize = 100;
  let endPosition = 100;


  let [isJumping, setIsJumping] = useState(false);
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);; 
  let jumpValue = useRef(new Animated.Value(0)).current; 
  let heroXValue = useRef(new Animated.Value(0)).current;
  let getHeroImage = () => {
    if (isJumping) {
      return direction === '+' ? jumpRightImage : jumpLeftImage;
    } else {
      return direction === '+' ? heroRightImage : heroLeftImage;
    }
  };
  
  useEffect(() => {
    heroXValue.addListener(({ value }) => {
      setHeroPosition((prevPos) => ({ ...prevPos, x: value }));
    });
    return () => {
      heroXValue.removeAllListeners();
    };
  }, []);

  let heroRightImage = require('./assets/hero.gif');
  let heroLeftImage = require('./assets/hero-left.gif');
  let jumpRightImage = require('./assets/hero.gif');
  let jumpLeftImage = require('./assets/hero-left.gif');
  let backgroundImage = require('./assets/background.png');
  let heartImage = require('./assets/heart.png');
  let buttonImage = require('./assets/startButton.png');
  let restartImage = require('./assets/restart.png');
  let resumeImage = require('./assets/start.png');
  let pauseImage = require('./assets/pause.png');
  let blockImage = require('./assets/block.png');
  
  const updateCameraPosition = () => {
    // Ensure the camera follows the hero, but doesn't go beyond the game world
    let cameraX = Math.max(0, Math.min(heroPosition.x - screenWidth / 2, gameWidth - screenWidth));
    setCameraPosition({ x: cameraX, y: 0 });
  };

  const handleLayout = (event) => {
    const { width } = event.nativeEvent.layout;
    setScreenWidth(width); // Update screenWidth when gameContainer layout changes
  };

  useEffect(() => {
    generateLevel(); 
    renderBlocks();
  }, [level]);
  

  let backgroundImageStyle = {
    position: 'absolute',
    width: gameWidth * 2,
    height: '100%',
    resizeMode: 'contain',
  };
  
  let timerStyle = {
    fontSize: 24,
    fontWeight: 'bold',
    position: 'absolute',
    color: 'white',
    left: 20,
    top: 40,
  };
  
  let scoreStyle = {
    fontSize: 18,
    position: 'absolute',
    color: 'white',
    left: 20,
    top: 80,
  };
  
  let heartImageStyle = {
    width: 30,
    height: 30,
    position: 'absolute',
    left: 300,
    top: 80,
    resizeMode: 'contain'
  };
  
  let heroImageStyle = {
    position: 'absolute',
    left: heroPosition.x - cameraPosition.x,
    transform: [{ translateY: jumpValue }],
    bottom: 0,
    width: 100,
    height: 100,
    resizeMode: 'contain'
  };
  
  let buttonStyle = {
    position: 'absolute',
    width: 70, height: 70,
  };
  
  let resumeButtonStyle = {
    position: 'absolute',
    left: 300,
    top: 40,
    width: 30,
    height: 30,
  };
  
  let pauseButtonStyle = {
    position: 'absolute',
    left: 300,
    top: 40,
    width: 30,
    height: 30,
  };
  
  let restartButtonStyle = {
    position: 'absolute',
    left: 250,
    top: 40,
    width: 30,
    height: 30,
  };

  let blockStyle = {
    width: 50,  
    height: 50, 
    resizeMode: 'contain',
  };


  const moveHeroLeft = () => {
    if (heroPosition.x > 0) {
      setDirection('-');
      const newX = heroPosition.x - stepSize;
      setHeroPosition((prevPos) => ({
        ...prevPos,
        x: newX,
      }));
      heroXValue.setValue(newX); // Update heroXValue
      updateCameraPosition();
    }
  };
  

  const moveHeroRight = () => {
    if (heroPosition.x < gameWidth - endPosition) {
      setDirection('+');
      const newX = heroPosition.x + stepSize;
      setHeroPosition((prevPos) => ({
        ...prevPos,
        x: newX,
      }));
      heroXValue.setValue(newX); // Update heroXValue
      updateCameraPosition();
    }
  };

  const startTimer = () => {
    setTime(60);
  };

  const generateLevel = () => {
    let newBlocks = []; 
    if (level === 0) {
      newBlocks = [
        { x: 100, y: 150, width: 50, height: 50 },
        { x: 200, y: 200, width: 50, height: 50 },
      ];
    } else if (level === 1) {
      newBlocks = [
        { x: 150, y: 250, width: 50, height: 50 },
        { x: 300, y: 300, width: 50, height: 50 },
        { x: 400, y: 400, width: 50, height: 50 },
      ];
    } else {
      newBlocks = [
        { x: 250, y: 350, width: 50, height: 50 },
        { x: 500, y: 450, width: 50, height: 50 },
        { x: 600, y: 500, width: 50, height: 50 },
      ];
    }
    setBlocks(newBlocks); 
  };
  
  const renderBlocks = () => {
    return blocks
      .filter((block) => {
        // Ensure the block is within the viewport
        return block.x + block.width > cameraPosition.x &&
               block.x < cameraPosition.x + screenWidth;
      })
      .map((block, index) => (
        <Image
          key={index}
          source={blockImage}
          style={{
            position: 'absolute',
            left: block.x - cameraPosition.x, 
            bottom: block.y,
            width: block.width,
            height: block.height,
            resizeMode: 'contain',
          }}
        />
      ));
  };

  const handleJump = () => {
    if (isJumping) return;
  
    setIsJumping(true);
    
    // Set initial values for the jump
    let jumpHeight = -150;  // How high the hero jumps
    let jumpDuration = 500; // Duration of the jump in milliseconds
    let gravity = 5; // How quickly the hero falls after reaching the peak
    
    let startTime = Date.now();
    let jumpLoop = setInterval(() => {
      let elapsedTime = Date.now() - startTime;
      let progress = elapsedTime / jumpDuration; // Get progress between 0 and 1
    
      if (progress < 0.5) {
        // Ascend (go up)
        let newY = heroPosition.y + jumpHeight * progress * 2; // Progress * 2 to speed up ascent
        setHeroPosition((prevPos) => ({ ...prevPos, y: newY }));
      } else {
        // Descend (fall down)
        let newY = heroPosition.y + jumpHeight - gravity * (progress - 0.5) * jumpDuration; // Apply gravity for fall
        setHeroPosition((prevPos) => ({ ...prevPos, y: newY }));
      }
    
      if (progress >= 1) {
        // When the jump is complete, stop the interval and reset the position
        clearInterval(jumpLoop);
        setHeroPosition((prevPos) => ({ ...prevPos, y: 0 }));  // Reset to ground level
        setIsJumping(false);
      }
    }, 16); // Run at ~60 FPS (16ms intervals)
  };
  
  return (
    <View style={styles.container}>
           <TouchableOpacity style={styles.backButton} onPress={() => navigate(-1)}>
              <CustomText style={styles.backButtonText}>&lt;</CustomText>
           </TouchableOpacity>
      <View style={styles.gameContainer} onLayout={handleLayout}>  

      <Image source={backgroundImage} style={backgroundImageStyle} />

      <CustomText style={timerStyle}>
        Timer: {time}s
      </CustomText>

      <CustomText style={scoreStyle}>
        Score: {score}
      </CustomText>

      <Image source={heartImage} style={heartImageStyle}/>

      <Animated.Image key={direction} source={getHeroImage()} style={[heroImageStyle, { transform: [{ translateY: jumpValue }] }]} />

      {/* <TouchableOpacity onPress={startTimer}  style={buttonStyle}>
        <Image source={buttonImage} style={{ width: '100%', height: '100%', resizeMode: 'contain' }} />
      </TouchableOpacity> */}

     <TouchableOpacity style={restartButtonStyle}>
        <Image source={restartImage} style={{ width: '100%', height: '100%', resizeMode: 'contain'}}  />
     </TouchableOpacity>

     <TouchableOpacity style={resumeButtonStyle}>
        <Image source={resumeImage} style={{ width: '100%', height: '100%', resizeMode: 'contain' }}  />
     </TouchableOpacity>
     
     <TouchableOpacity style={pauseButtonStyle}>
        <Image source={pauseImage} style={{ width: '100%', height: '100%', resizeMode: 'contain' }}  />
     </TouchableOpacity>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={moveHeroLeft} style={styles.button}>
          <CustomText style={styles.buttonText}>{"<"}</CustomText>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleJump} style={styles.button}>
          <CustomText style={styles.buttonText}>{"^"}</CustomText>
        </TouchableOpacity>

        <TouchableOpacity onPress={moveHeroRight} style={styles.button}>
          <CustomText style={styles.buttonText}>{">"}</CustomText>
        </TouchableOpacity>
      </View>

     {renderBlocks()}

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    left: 20,
    top: 50,
    width: 110,
    height: 110,
    position: 'absolute',
  },
  backButtonText: {
        color: '#ffffff',
        fontSize: 35,
  },
  container: {
    backgroundColor: 'black',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white'
  },
  gameContainer: {
    marginTop: '120', 
    backgroundColor: 'grey',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    width: '100%',
    height: '100%',
    marginBottom: 100,
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: -1,
  },
  timer: {
    fontSize: 24,
    fontWeight: 'bold',
    position: 'absolute',
    color: 'white'
  },
  score: {
    fontSize: 18,
    position: 'absolute',
    color: 'white'
  },
  heartsContainer: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  heartImage: {
    width: 30,
    height: 30,
    margin: 2,
  },
  heroImage: {
    position: 'absolute',
  },
  button: {
    position: 'absolute',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  button: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
  },
});