import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, Text, TouchableOpacity } from 'react-native';
import CustomText from './CustomText';
import axios from 'axios';
import useProfile from './get_session';
import API_ENDPOINTS from './api';
import { useNavigate } from 'react-router-native';

export default function Settings() {
  const [profileData, setProfileData] = useState({ username: '', profile_image: '' });
  const navigate = useNavigate();
  const { imageSource, handleImageError } = useProfile();

  const handleBackPress = () => {
    navigate('/profile'); 
  };
  
  const handleLogoutPress = () => {
    // Handle logout logic here
    navigate('/');
  };

  const handleProfilePress = () => {
    navigate('/editAccount');
  };

  const handlePrivacyPress = () => {
    navigate('/privacy');
  };

  const handlePromotionPress = () => {
    navigate('/promotion');
  };

  const handleQnAPress = () => {
    navigate('/qna');
  };
  const handleReportPress = () => {
    navigate('/report');
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.profile, { withCredentials: true });
        setProfileData(response.data);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };
    fetchProfileData();
  }, []);

  return (
    <View style={styles.container}>
    <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
              <CustomText style={styles.backButtonText}>&lt;</CustomText>
     </TouchableOpacity>
      <CustomText style={styles.title}>Settings</CustomText>
      <View style={styles.profileContainer}>
        <Image
        source={imageSource || handleImageError()}
        onError={handleImageError}
        //   source={profileData.profile_image ? { uri: profileData.profile_image } : require('./assets/profile.png')}
        style={styles.profileImage}
        />
        <CustomText style={styles.username}>{profileData.username}</CustomText>
      </View>

        <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button} onPress={handleProfilePress}>
        <CustomText style={styles.buttonText}>Profile</CustomText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handlePrivacyPress}>
        <CustomText style={styles.buttonText}>Privacy</CustomText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handlePromotionPress}>
        <CustomText style={styles.buttonText}>Promotion</CustomText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleReportPress}>
        <CustomText style={styles.buttonText}>Report</CustomText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleQnAPress}>
        <CustomText style={styles.buttonText}>Q&A</CustomText>
        </TouchableOpacity>
        </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogoutPress}>
        <CustomText style={styles.logoutButtonText}>Logout</CustomText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
    backgroundColor: '#000000',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 50,
    width: 110,
    height: 110,
    borderRadius: 5,
  },
  backButtonText: {
        color: '#ffffff',
        fontSize: 35,
  },
  title: {
    textAlign: 'center',
    fontSize: 35,
    fontWeight: 'bold',
    top: 70,
    marginBottom: 30,
    color: '#ffffff',
  },
  profileContainer: {
    marginTop: 100,
    alignItems: 'center',
    marginBottom: 40,
  },
profileImage: {
  width: 150,  // Increase the width
  height: 150, // Increase the height
  borderRadius: 75,  // Adjust the borderRadius to half the size of the width/height for a circular shape
  marginBottom: 15,  // Optional: increase the bottom margin for better spacing
  backgroundColor: '#CE55F2',
},
  username: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  buttonsContainer: {
    flexDirection: 'column',  // Ensure buttons stack vertically
    alignItems: 'center',     // Center horizontally
    justifyContent: 'center', // Center vertically
    width: '100%',  
  },
  button: {
    color: '#8a6abf',
    padding: 5,
    borderRadius: 0,
    margin: 5,
  },
  buttonText: {
    fontFamily: 'Domino Brick',  
    fontSize: 30,               
    color: '#f1f1f1',  
  },
  logoutButton: {
    color: '#8a6abf',
    borderRadius: 0,
    marginTop: 30,
  },
  logoutButtonText: {
    fontSize: 22,
    color: '#fff',
  },
});
