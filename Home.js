import React from 'react';
import { View, StyleSheet, Image} from 'react-native';
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

const handleProfilePress = () => {
  navigate('/profile'); 
};
const handleCraftPress = () => {
        navigate('/select'); 
      };
const handleGamePress = () => {
        navigate('/game'); 
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
      <TouchableOpacity style={styles.craftButton} onPress={handleCraftPress}>
        <CustomText style={styles.craftButtonText}>Craft</CustomText>
      </TouchableOpacity>
      <CustomText style={styles.text}>Welcome to the Home Screen!</CustomText>
      <TouchableOpacity style={styles.gameButton} onPress={handleGamePress}>
      <CustomText style={styles.gameButtonText}>Game</CustomText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  profileContainer: {
    position: 'absolute',
    top: 40,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  username: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
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
      backgroundColor: '#b9a3e3',
      padding: 10,
      borderRadius: 5,
    },
    craftButtonText: {
      color: '#f1f1f1',
      textAlign: 'center',
      fontSize: 16,
      fontWeight: 'bold',
    },
    gameButton: {
      top: 15,
      backgroundColor: '#b9a3e3',
      padding: 10,
      borderRadius: 5,
    },
    gameButtonText: {
      color: '#f1f1f1',
      textAlign: 'center',
      fontSize: 16,
      fontWeight: 'bold',
    },
  
});
