import React, { useRef } from 'react';
import { View, StyleSheet, Animated, Image} from 'react-native';
import { TouchableOpacity } from 'react-native';
import CustomText from './CustomText';
import axios from 'axios';
import FontLoader from './FontLoader';
import API_ENDPOINTS from './api';
import { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-native';
export default function Home() {
const [profileData, setProfileData] = useState({ username: '', profile_image: '' })
const [imageUri, setImageUri] = useState(null);
const navigate = useNavigate();
const animationValue = useRef(new Animated.Value(0)).current;

useEffect(() => {
  const fetchProfileData = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.profile, { withCredentials: true }); 
      setProfileData(response.data); 
      setImageUri(response.data.profile_image); 
    } catch (error) {
      console.error('Error fetching profile data:', error);
      alert('Failed to fetch profile information.');
    }
  };

  fetchProfileData();
}, []);

useEffect(() => {
  const startAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animationValue, {
          toValue: -10, 
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(animationValue, {
          toValue: 0, 
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.delay(500), 
      ])
    ).start();
  };

  startAnimation();
}, [animationValue]);

const handleProfilePress = () => {
  navigate('/profile'); 
};
const handleCraftPress = () => {
        navigate('/select'); 
      };
const handleGamePress = () => {
        navigate('/game'); 
      };
const handleSearchPress = () => {
        navigate('/search'); 
      };
const handleMapGamePress = () => {
        navigate('/run2'); 
      };
const handleImageError = () => {
        setImageUri(require('./assets/profile.png')); 
      };
    
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.profileContainer} onPress={handleProfilePress}>
      <Image
        source={require('./assets/profile.png')} 
        // source={imageUri ? { uri: imageUri } : require('./assets/profile.png')}
          style={styles.profileImage}
          onError={handleImageError} 
        />
        <CustomText style={styles.username}>{profileData.username}</CustomText>
      </TouchableOpacity>
      <TouchableOpacity style={styles.logoContainer}>
      <Image
        source={require('./assets/logo.png')} 
          style={styles.logoImage}
        />
      </TouchableOpacity>
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
          <CustomText style={styles.title}>User Search</CustomText>
          {/* Add content for user search here */}
          <TouchableOpacity style={styles.gameButton} onPress={handleMapGamePress}>
          <CustomText style={styles.gameButtonText}>Try This Game!</CustomText>
        </TouchableOpacity>
        </View>

        {/* Second Container */}
        <View style={styles.section}>
          <CustomText style={styles.title}>Game Search</CustomText>
          {/* Add content for game search here */}
        </View>

        {/* Third Container */}
        <View style={styles.section}>
          <CustomText style={styles.title}>Code Search</CustomText>
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
      backgroundColor: 'transparent',
    },
    gameButtonText: {
      color: '#f1f1f1',
      textAlign: 'center',
      fontSize: 16,
      fontWeight: 'bold',
    },
    sectionContainer: {
      position: 'absolute',
      flex: 1,
      left: 10,
      backgroundColor: '#000000',
      top: 200,
    },
    section: {
      marginLeft: 20,
      marginBottom: 20,
      height: 150,
      justifyContent: 'center',
    },
    title: {
      fontSize: 18,
      color: '#CE55F2',
      fontFamily: 'Minecraft Regular',
      marginBottom: 10,
      marginTop: 10,
    },
  
});
