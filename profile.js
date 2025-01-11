import React from 'react';
import { View, StyleSheet, Image, Text}  from 'react-native';
import { TouchableOpacity } from 'react-native';
import CustomText from './CustomText';
import axios from 'axios';
import FontLoader from './FontLoader';
import API_ENDPOINTS from './api';
import { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-native';
export default function Profile() {
const [profileData, setProfileData] = useState({ username: '', profile_image: '', id: 0 })
const [plays, setPlays] = useState({ played: 0})
const [imageUri, setImageUri] = useState(null);
const navigate = useNavigate();
const [selectedButton, setSelectedButton] = useState('button1'); 
const [allProfileData, setAllProfileData] = useState({ username: '', profile_image: '', wins: 0 });

const handleImageError = () => {
    setImageUri(require('./assets/profile.png')); 
  };

const handleBackPress = () => {
    navigate('/home'); 
  };

  const handleSettingPress = () => {
    navigate('/settings'); 
  };

const handleButtonPress = (button) => {
    setSelectedButton(button); 
  };

//all profile data
useEffect(() => {
    async function fetchAllProfileData() {
      try {
        const response = await axios.get(API_ENDPOINTS.profile_all, {
          withCredentials: true
        });
        setAllProfileData(response.data.user);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    }
    fetchAllProfileData();
  }, []);

//from the session 
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
  const fetchUserPlays = async () => {
    try {
      const userPlaysUrl = API_ENDPOINTS.user_plays(profileData.id); 
      const response = await axios.get(userPlaysUrl);
      setPlays({ played: response.data.plays });  
    } catch (error) {
      console.error('Error fetching user plays:', error);
    }
  };

  if (profileData.id) {
    fetchUserPlays();  
  }
}, [profileData.id]);

  return (
    <View style={styles.container}>
         <TouchableOpacity style={styles.setButton} onPress={handleSettingPress}>
    <CustomText style={styles.setButtonText}>⋯</CustomText>
  </TouchableOpacity>
     <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
              <CustomText style={styles.backButtonText}>&lt;</CustomText>
     </TouchableOpacity>

     <View style={styles.winsContainer}>
      <Image
        source={require('./assets/cup.gif')} 
        style={styles.winsImage}
        />
        <CustomText style={styles.wins}>{allProfileData.wins}</CustomText>
     </View>

     <View style={styles.playsContainer}>
        <CustomText style={styles.plays}>{plays.played}</CustomText>
     </View>


     <View style={styles.profileContainer}>
      <Image
        source={require('./assets/profile.png')} 
        // source={imageUri ? { uri: imageUri } : require('./assets/profile.png')}
          style={styles.profileImage}
          onError={handleImageError} 
        />
        <CustomText style={styles.username}>{profileData.username}</CustomText>
     </View>




    <View style={styles.buttonsContainer}>
    <TouchableOpacity
    style={[
    styles.button,
    selectedButton === 'button1' && styles.selectedButton, 
    ]}
    onPress={() => handleButtonPress('button1')}
    >
    <CustomText style={styles.buttonText}><Image source={require('./assets/folder.png')} style={styles.icon} /> </CustomText>
    </TouchableOpacity>

    <TouchableOpacity
    style={[
    styles.button,
    selectedButton === 'button2' && styles.selectedButton, 
    ]}
    onPress={() => handleButtonPress('button2')}
    >
    <CustomText style={styles.buttonText}>Crafts</CustomText>
    </TouchableOpacity>
    </View>
     
          <View style={styles.viewContainer}>
        {selectedButton === 'button1' ? (
          <Text style={styles.viewText}>Image Button View</Text> 
        ) : (
          <Text style={styles.viewText}>Text Button View</Text> 
        )}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  //back
  backButton: {
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
  profileContainer: {
    top: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 150, 
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  username: {
    fontSize: 28, 
    color: '#ffffff',
    fontWeight: 'bold',
  },
  container: {
      flex: 1,
      padding: 0, 
      margin: 0,
      backgroundColor: '#000000',
    },

    //the down 
    buttonsContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 150,
      },
      button: {
        borderWidth: 0,
        padding: 10,
        borderRadius: 0,
        backgroundColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center',
        width: '30%',
        height: 50,
      },
      selectedButton: {
        backgroundColor: '#CE55F2', 
      },
      buttonText: {
        fontSize: 20, 
        color: '#ffffff',
        fontWeight: 'bold',
      },
      icon: {
        width: 40,
        height: 40,
        resizeMode: 'contain', 
      },
      viewContainer: {
        backgroundColor: '#CE55F2', 
        flex: 1,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 0,
        paddingTop: 0, 
      },
      viewText: {
        fontSize: 18,
        color: '#ffffff',
      },
      winsContainer: {
        position: 'absolute', // Position absolutely relative to the parent container
        top: 120, // Adjust the distance from the top
        right: 25, // Adjust the distance from the right
        flexDirection: 'row', // Layout the image and text horizontally
        alignItems: 'center', 
      },
      wins: {
        marginLeft: 5, // Add some spacing between the image and text
        fontSize: 20,
        color: '#fff', // Adjust color as needed
      },
      winsImage: {
        width: 50, // Set the desired width
        height: 50, // Set the desired height
        resizeMode: 'contain', // Ensures the image maintains its aspect ratio
      },

      playsContainer: {
        position: 'absolute', // Position absolutely relative to the parent container
        top: 329, // Adjust the distance from the top
        right: 232, // Adjust the distance from the right
        flexDirection: 'row', // Layout the image and text horizontally
        alignItems: 'center', 
        zIndex: 1000,
      },
      plays: {
        marginLeft: 0, // Add some spacing between the image and text
        fontSize: 25,
        color: '#fff', // Adjust color as needed
      },
      playsImage: {
        width: 80, // Set the desired width
        height: 80, // Set the desired height
        resizeMode: 'contain', // Ensures the image maintains its aspect ratio
      },
      setButton: {
        position: 'absolute', 
        top: 15,
        right: -15,
        width: 110,
        height: 110,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
      },
      setButtonText: {
        color: '#ffffff',
        fontSize: 35,
      },
});
