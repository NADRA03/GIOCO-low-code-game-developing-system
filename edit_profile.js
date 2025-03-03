import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Image, ActivityIndicator, Alert, TouchableWithoutFeedback, TouchableOpacity, StyleSheet, Keyboard } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import CustomText from './CustomText';
import axios from 'axios';
import { storage } from './firebaseConfig';
import { ref, deleteObject, uploadBytes, getDownloadURL } from 'firebase/storage';
import useProfile from './get_session';
import { useNavigate, useParams } from 'react-router-native';
import API_ENDPOINTS from './api';

const EditProfile = ({ navigation }) => {
  const navigate = useNavigate();
  const { profileData, imageSource, handleImageError } = useProfile();
  const [profile, setProfile] = useState({
    username: '',
    bio: ''
  });

  const [imagePreview, setImagePreview] = useState({ uri: "./assets/plays.png" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profileData) {
      setProfile({
        username: profileData.username || '',
        bio: profileData.bio || '',
      });
  
      setTimeout(() => {
        setImagePreview(imageSource);
      }, 1000); 
    }
  }, [profileData, imageSource]);

  const handleInputChange = (name, value) => {
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  const handleImageChange = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'You need to allow access to your gallery.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImagePreview({ uri: result.assets[0].uri }); // Maintain the same { uri: url } structure
    }
  };

  const handleSubmit = async () => {
    if (!profileData?.id) {
      Alert.alert("Error", "User ID not found.");
      return;
    }
  
    setLoading(true);
    const userId = profileData.id;
    const updatedProfile = {};
  
    try {
      // Check which fields have changed
      if (profile.username !== profileData.username) {
        updatedProfile.username = profile.username;
      }
      if (profile.bio !== profileData.bio) {
        updatedProfile.bio = profile.bio;
      }
  
      let newImageUrl = null;
  
      // If image was changed
      if (imagePreview?.uri !== imageSource?.uri) {
        try {
          // Attempt to delete the existing image but ignore errors if it doesn't exist
          await deleteObject(ref(storage, `profile_pictures/${userId}.jpg`))
            .catch((error) => {
              if (error.code !== 'storage/object-not-found') {
                throw error;
              }
            });
  
          // Upload the new image
          const response = await fetch(imagePreview.uri);
          const blob = await response.blob();
          const imageRef = ref(storage, `profile_pictures/${userId}.jpg`);
          await uploadBytes(imageRef, blob);
          newImageUrl = await getDownloadURL(imageRef);
  
          updatedProfile.profile_image = newImageUrl;
        } catch (error) {
          console.error("Image upload error:", error);
          Alert.alert("Error", "Could not update profile image.");
        }
      }
  
      // Only update if there are changes
      if (Object.keys(updatedProfile).length > 0) {
        await axios.put(API_ENDPOINTS.edit_user_profile, updatedProfile, { withCredentials: true });
        Alert.alert("Success", "Your profile has been updated.");
      } else {
        Alert.alert("No Changes", "You haven't made any changes.");
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert("Error", "There was an error updating your profile. try using another username.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!profileData?.id) {
      Alert.alert("Error", "User ID not found.");
      return;
    }
  
    setLoading(true);
    try {
      const userId = profileData.id;
      await deleteObject(ref(storage, `profile_pictures/${userId}.jpg`))
        .then(() => {
          setImagePreview(null);
          Alert.alert("Success", "Profile image deleted.");
        })
        .catch((error) => {
          if (error.code === 'storage/object-not-found') {
            Alert.alert("Error", "Image not found.");
          } else {
            throw error;
          }
        });
  
      // Update profile with empty image
      await axios.put(API_ENDPOINTS.edit_user_profile, { profile_image: null }, { withCredentials: true });
    } catch (error) {
      console.error("Image deletion error:", error);
      Alert.alert("Error", "Could not delete profile image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigate(-1)}>
        <CustomText style={styles.backButtonText}>&lt;</CustomText>
      </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>

        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={profile.username}
          onChangeText={(value) => handleInputChange('username', value)}
        />

        <Text style={styles.label}>Profile Image</Text>
        {imagePreview && <Image source={imagePreview || handleImageError()} onError={handleImageError} style={styles.profileImage} />}
        <TouchableOpacity onPress={handleImageChange} style={styles.imageButton}>
          <Text style={styles.imageButtonText}>Select Image</Text>
        </TouchableOpacity>
        {imagePreview && (
  <TouchableOpacity onPress={handleDeleteImage} style={styles.delete}>
    <Text style={styles.deleteText}>x</Text>
  </TouchableOpacity>
)}

        <Text style={styles.label}>Bio</Text>
        <TextInput
          style={styles.textarea}
          multiline
          value={profile.bio}
          onChangeText={(value) => handleInputChange('bio', value)}
        />

        <TouchableOpacity onPress={handleSubmit} style={styles.submitButton} disabled={loading}>
          <Text style={styles.submitButtonText}>{loading ? "Updating..." : "Save Changes"}</Text>
        </TouchableOpacity>

        {loading && <ActivityIndicator size="large" style={styles.loadingIndicator} />}
      </View>
    </TouchableWithoutFeedback>
  );
};

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
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    backgroundColor: 'black',
  },
  title: {
    fontSize: 30,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 100,
    marginBottom: 20,
    fontFamily:"Minecraft Regular"
  },
  label: {
    fontFamily:"Minecraft Regular",
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 20,
    marginBottom: 10
  },
  input: {
    fontFamily:"Minecraft Regular",
    width: '100%',
    padding: 10,
    backgroundColor: '#333333',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  textarea: {
    fontFamily:"Minecraft Regular",
    width: '100%',
    padding: 10,
    backgroundColor: '#333333',
    color: '#FFFFFF',
    height: 100,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    resizeMode: 'cover',
    alignSelf: 'center',
    backgroundColor: '#CE55F2',
  },
  imageButton: {
    backgroundColor: "#6441a5",
    padding: 10,
    marginTop: 30,
    alignItems: "center",
    width: '100%',
  },
  imageButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontFamily:"Minecraft Regular",
  },
  delete: {
    position: 'absolute',
    padding: 10,
    marginTop: 305,
    marginLeft: 80,
    alignItems: "center",
    width: '100%',
  },
  deleteText: {
    color: 'red',
    fontSize: 25,
    fontWeight: 'bold',
    fontFamily:"Minecraft Regular",
  },
  submitButton: {
    backgroundColor: "#6441a5",
    padding: 10,
    marginTop: 30,
    alignItems: "center",
    width: '100%',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontFamily:"Minecraft Regular",
  },
  loadingIndicator: {
    marginTop: 20,                     
  },
});

export default EditProfile;
