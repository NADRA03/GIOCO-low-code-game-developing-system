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
const [profileData, setProfileData] = useState({ username: '', profile_image: '' })
const [imageUri, setImageUri] = useState(null);
const navigate = useNavigate();
const [selectedButton, setSelectedButton] = useState('button1'); 
const [allProfileData, setAllProfileData] = useState(null);

const handleImageError = () => {
    setImageUri(require('./assets/profile.png')); 
  };

const handleBackPress = () => {
    navigate('/home'); 
  };

const handleButtonPress = (button) => {
    setSelectedButton(button); 
  };

//all profile data
useEffect(() => {
    async function fetchProfileData() {
      try {
        const response = await axios.get(API_ENDPOINTS.profile_all, {
          withCredentials: true
        });
        setAllProfileData(response.data.user);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    }

    fetchProfileData();
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

  return (
    <View style={styles.container}>
     <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
              <CustomText style={styles.backButtonText}>&lt;</CustomText>
     </TouchableOpacity>
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
    <CustomText style={styles.buttonText}>Folder</CustomText>
    </TouchableOpacity>

    <TouchableOpacity
    style={[
    styles.button,
    selectedButton === 'button2' && styles.selectedButton, 
    ]}
    onPress={() => handleButtonPress('button2')}
    >
    <CustomText style={styles.buttonText}>Crafts</CustomText>
    {/* <Image source={require('./assets/icon.png')} style={styles.icon} />  */}
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
        width: 30,
        height: 30,
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
});
