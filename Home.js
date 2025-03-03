import React, { useRef } from 'react';
import { View, StyleSheet, Animated, Easing} from 'react-native';
import { Image } from 'expo-image';
import { TouchableOpacity } from 'react-native';
import CustomText from './CustomText';
import axios from 'axios';
import FontLoader from './FontLoader';
import API_ENDPOINTS from './api';
import { useEffect, useState } from 'react';
import useProfile from './get_session';
import { useNavigate } from 'react-router-native';

export default function Home() {
const { imageSource, handleImageError } = useProfile();
const [profileData, setProfileData] = useState({ username: '', profile_image: '' })
const navigate = useNavigate();
const moveAnim = new Animated.Value(0);


useEffect(() => {
  const fetchProfileData = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.profile, { withCredentials: true }); 
      setProfileData(response.data); 
    } catch (error) {
      console.error('Error fetching profile data:', error);
      alert('Failed to fetch profile information.');
    }
  };

  fetchProfileData();
}, []);


useEffect(() => {
  const moveWitch = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(moveAnim, {
          toValue: 1, 
          duration: 5000, 
          easing: Easing.linear,
          useNativeDriver: true, 
        }),
        Animated.delay(10000),
      ])
    ).start();
  };

  moveWitch(); 

  return () => moveAnim.stopAnimation();
}, [moveAnim]);


const translateX = moveAnim.interpolate({
  inputRange: [0, 1],
  outputRange: [-100, 650], 
});

const handleProfilePress = () => {
  navigate('/profile'); 
};
const handleCraftPress = () => {
        navigate('/select'); 
      };
const handleGamePress = () => {
        navigate('/game'); 
      };
const handleAProfilePress = () => {
        navigate('/game'); 
      };
const handleSearchPress = () => {
        navigate('/search'); 
      };
const handleMapGamePress = () => {
        navigate('/run2'); 
      };
    
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.profileContainer} onPress={handleProfilePress}>
      <Image
          source={imageSource || handleImageError()} 
          style={styles.profileImage}
          onError={handleImageError} 
        />
        <CustomText style={styles.username}>{profileData.username}</CustomText>
      </TouchableOpacity>
      {/* <TouchableOpacity style={styles.profileButton} onPress={handleAProfilePress}>
          <CustomText style={styles.profileButtonText}>Check this Profile!</CustomText>
      </TouchableOpacity> */}
      <TouchableOpacity style={styles.logoContainer}>
      <Image
        source={require('./assets/logo.png')} 
          style={styles.logoImage}
        />
      </TouchableOpacity>
      {/* <View>
        <Animated.Image
          source={require('./assets/witch.gif')}
          style={[{ transform: [{ translateX }] }, styles.witchImage]}
        />
      </View> */}
      <TouchableOpacity style={styles.searchContainer} onPress={handleSearchPress}>
      <Image
        source={require('./assets/search.png')} 
          style={styles.searchImage}
        />
      </TouchableOpacity>
      <TouchableOpacity style={styles.craftButton} onPress={handleCraftPress}>
      <Image
        source={require('./assets/edit.png')} 
          style={styles.editImage}
        />
      </TouchableOpacity>
      <TouchableOpacity style={styles.dashboardButton} >
      <CustomText style={styles.dashboardButtonText}>Dashboard</CustomText>
      </TouchableOpacity>

      <View style={styles.sectionContainer}>
        {/* First Container */}
        <View style={styles.section}>
          <CustomText style={styles.title}>Recommended For You</CustomText>
          {/* Add content for user search here */}
          <TouchableOpacity style={styles.gameButton} onPress={handleMapGamePress}>
          <CustomText style={styles.gameButtonText}>Try This Game!</CustomText>
        </TouchableOpacity>
        </View>

        {/* Second Container */}
        <View style={styles.section}>
          <CustomText style={styles.title}>Continue</CustomText>
          {/* Add content for game search here */}
        </View>

        {/* Third Container */}
        <View style={styles.section}>
          <CustomText style={styles.title}>Explore</CustomText>
          {/* Add content for code search here */}
        </View>
      </View>
      {/* <TouchableOpacity style={styles.gameButton} onPress={handleGamePress}>
      <CustomText style={styles.gameButtonText}>Game</CustomText>
      </TouchableOpacity> */}

      <View>
      {/* <Animated.View
        style={[
          styles.gameButtonContainer,
          {
            transform: [{ translateY: animationValue }],
          },
        ]}
      > */}
      {/* </Animated.View> */}
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  profileButton: {
    position: 'absolute',
    backgroundColor: 'transparent',
    top: 110, 
    zIndex: 1000,
  },
  profileButtonText: {
    color: '#CE55F2',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    paddingLeft: 10,
    marginLeft: 120,
  },
  profileContainer: {
    position: 'absolute',
    top: 70,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    backgroundColor: '#CE55F2',
  },
  witchImage: {
    position: 'absolute',
    width: 90,
    height: 90,
    left: -200,
    top: 140,
  },
  searchContainer: {
    position: 'absolute',
    bottom: 20,
    right: 90,
    backgroundColor: 'transparent',
    padding: 10,
    borderRadius: 5,
  },
  searchImage: {
    resizeMode: 'contain',
    width: 25,
    height: 25,
  },
  editImage: {
    resizeMode: 'contain',
    width: 25,
    height: 25,
  },
  logoContainer: {
    position: 'absolute',
    top: 40,
    left: 165,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    resizeMode: 'contain',
    width: 40,
    height: 40,
    opacity: 0.5,
  },
  username: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
    container: {
      flex: 1,
      backgroundColor: '#000000',
    },
    text: {
      fontSize: 20,
      color: '#FFFFFF',
    },
    craftButton: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      backgroundColor: 'transparent',
      padding: 10,
      borderRadius: 5,
    },
    craftButtonText: {
      color: '#f1f1f1',
      textAlign: 'center',
      textDecorationLine: 'underline',
      fontSize: 16,
      fontWeight: 'bold',
    },
    dashboardButton: {
      position: 'absolute',
      bottom: 20,
      left: 20,
      backgroundColor: 'transparent',
      padding: 10,
      borderRadius: 5,
    },
    dashboardButtonText: {
      color: '#f1f1f1',
      textAlign: 'center',
      fontSize: 16,
      fontWeight: 'bold',
    },
    gameButton: {
      position: 'absolute',
      backgroundColor: 'transparent',
      top: 440, 
    },
    gameButtonText: {
      color: 'white',
      textAlign: 'center',
      fontSize: 16,
      fontWeight: 'bold',
      paddingLeft: 10,
      marginLeft: 0,
    },
    sectionContainer: {
      position: 'absolute',
      flex: 1,
      backgroundColor: '#000000',
      top: 250,
      width: '100%',
    },
    section: {
      marginLeft: 0,
      marginBottom: 20,
      height: 130,
      width: '100%',
      backgroundColor: 'rgba(80, 80, 80, 0.5)',
    },
    title: {
      padding: 10,
      fontSize: 18,
      color: 'white',
      fontFamily: 'Minecraft Regular',
    },
  
});
