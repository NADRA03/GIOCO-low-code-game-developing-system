import React, { useEffect, useRef, useState } from 'react';
import { View, Image, Animated, TouchableOpacity, Dimensions, StyleSheet, Text } from 'react-native';
import CustomText from './CustomText';

const { width, height } = Dimensions.get('window');

const PlayScreen = () => {
  const [heroPosition, setHeroPosition] = useState({ x: 0, y: height - 150 });
  const [enemies, setEnemies] = useState([]);
  const [jumping, setJumping] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [movingDirection, setMovingDirection] = useState(null);
  const [score, setScore] = useState(0);
  const [playTime, setPlayTime] = useState(0);
  const intervalOptions = [4000, 5000, 6000, 7000, 8000];

  const jumpAnim = useRef(new Animated.Value(0)).current;
  const jumpXAnim = useRef(new Animated.Value(0)).current;

  const getRandomInterval = () => {
    const weightFactor = Math.max((playTime / 60000) * 1000, 0); 
    const weightedOptions = intervalOptions.map(interval => Math.max(interval - weightFactor, 1000));

    const totalWeight = weightedOptions.reduce((acc, interval) => acc + interval, 0);
    let randomValue = Math.random() * totalWeight;

    for (let i = 0; i < weightedOptions.length; i++) {
      if (randomValue < weightedOptions[i]) {
        return weightedOptions[i];
      }
      randomValue -= weightedOptions[i];
    }

    return intervalOptions[intervalOptions.length - 1];
  }

  useEffect(() => {
    const spawnEnemy = () => {
      const numEnemies = Math.floor(Math.random() * 3) + 1; 
      const newEnemies = [];

      for (let i = 0; i < numEnemies; i++) {
        newEnemies.push({ id: Date.now() + i, x: width, y: height - 150 });
      }

      setEnemies(prev => [...prev, ...newEnemies]);
    };

    const enemyInterval = getRandomInterval();
    const enemyIntervalId = setInterval(spawnEnemy, enemyInterval);

    return () => {
      clearInterval(enemyIntervalId);
    };
  }, [playTime]);

  useEffect(() => {
    const moveEnemies = () => {
      setEnemies(prev => prev.map(enemy => ({
        ...enemy,
        x: enemy.x - 7
      })));

      setEnemies(prev => {
        const passedEnemies = prev.filter(enemy => enemy.x <= -70);
        if (passedEnemies.length > 0) {
          setScore(prevScore => prevScore + 100 * passedEnemies.length);
        }
        return prev.filter(enemy => enemy.x > -70);
      });
    };
  
    const interval = setInterval(moveEnemies, 30);

    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    if (jumping) {
      Animated.parallel([
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
        })
      ]).start(() => {
        setHeroPosition(prevPosition => ({
          ...prevPosition,
          x: Math.min(prevPosition.x + 200, width - 70) 
        }));
        jumpXAnim.setValue(0);
        setJumping(false);
      });
    }
  }, [jumping]);

  useEffect(() => {
    const heroRect = { 
      left: heroPosition.x + jumpXAnim._value + 20,
      right: heroPosition.x + jumpXAnim._value + 50,
      top: heroPosition.y + jumpAnim._value + 10,
      bottom: heroPosition.y + jumpAnim._value + 60
    };
  
    const collisionWithEnemies = enemies.some(enemy => {
      const enemyRect = { 
        left: enemy.x + 20, 
        right: enemy.x + 50, 
        top: enemy.y + 10,   
        bottom: enemy.y + 60 
      };
  
      const isCollision = !(heroRect.right < enemyRect.left || 
        heroRect.left > enemyRect.right || 
        heroRect.bottom < enemyRect.top || 
        heroRect.top > enemyRect.bottom);
  
      if (isCollision) {
        console.log(`Collision detected! Hero position: ${JSON.stringify(heroRect)}, Enemy position: ${JSON.stringify(enemyRect)}`);
      }
  
      return isCollision;
    });
  
    if (collisionWithEnemies) {
      setGameOver(true);
      setEnemies([]);
    }
  }, [heroPosition, enemies, jumpAnim, jumpXAnim]);

  const handleKeyPress = (e) => {
    if (e.key === ' ') {
      if (!jumping) {
        setJumping(true);
      }
    } else if (e.key === 'ArrowLeft') {
      setMovingDirection('left');
      setHeroPosition(prevPosition => ({
        ...prevPosition,
        x: Math.max(prevPosition.x - 30, 0) // Move left by 30 units, ensuring the hero doesn't move off-screen.
      }));
    } else if (e.key === 'ArrowRight') {
      setMovingDirection('right');
      setHeroPosition(prevPosition => ({
        ...prevPosition,
        x: Math.min(prevPosition.x + 30, width - 70) // Move right by 30 units, ensuring the hero doesn't move off-screen.
      }));
    }
  };

  const handleKeyUp = (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      setMovingDirection(null);
    }
  };

  // useEffect(() => {
  //   window.addEventListener('keydown', handleKeyPress);
  //   window.addEventListener('keyup', handleKeyUp);

  //   return () => {
  //     window.removeEventListener('keydown', handleKeyPress);
  //     window.removeEventListener('keyup', handleKeyUp);
  //   };
  // }, [jumping, movingDirection]);

  const handleReplay = () => {
    setHeroPosition({ x: 0, y: height - 150 });
    setEnemies([]);
    setGameOver(false);
    setScore(0);
    setPlayTime(0);
  };

  const handleButtonPress = (direction) => {
    if (direction === 'left') {
      setHeroPosition(prevPosition => ({
        ...prevPosition,
        x: Math.max(prevPosition.x - 30, 0) // Move left by 30 units.
      }));
    } else if (direction === 'right') {
      setHeroPosition(prevPosition => ({
        ...prevPosition,
        x: Math.min(prevPosition.x + 30, width - 100) // Move right by 30 units.
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
          {/* Dots representing the collision area */}
          <View style={[styles.collisionDot, { left: 20 }]} />
          <View style={[styles.collisionDot, { left: 50 }]} />
        </Animated.View>
      </View>
      {enemies.map(enemy => (
        <View key={enemy.id} style={[styles.enemy, { left: enemy.x }]}>
          <Image source={{ uri: 'https://68.media.tumblr.com/8472e9ec42ca15e316c9bbe9c7164cb4/tumblr_nwwq08auNz1undzuio1_1280.gif' }} style={styles.enemyImage} />
          {/* Dots representing the collision area */}
          <View style={[styles.collisionDot, { left: 20 }]} />
          <View style={[styles.collisionDot, { left: 50 }]} />
        </View>
      ))}

      {gameOver && (
        <TouchableOpacity style={styles.button} onPress={handleReplay}>
          <CustomText style={styles.buttonText}>Replay</CustomText>
        </TouchableOpacity>
      )}

      <View style={styles.scoreContainer}>
        <CustomText style={styles.scoreText}>Score: {score}</CustomText>
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
  },
  hero: {
    width: 70,
    height: 70,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  enemy: {
    position: 'absolute',
    bottom: 50, 
    width: 70,
    height: 70,
  },
  enemyImage: {
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
  scoreContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    paddingTop: 40,
    fontSize: 20,
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
});

export default PlayScreen;