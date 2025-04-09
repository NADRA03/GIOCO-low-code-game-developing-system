import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Keyboard, TouchableWithoutFeedback, TextInput, ScrollView, Text, ActivityIndicator, Alert } from 'react-native';
import { storage } from './firebaseConfig';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import API_ENDPOINTS from './api';
import CustomText from './CustomText';
import { useNavigate } from 'react-router-native';
import useGameDetails from "./game_helpers";

const SetGame = ({ id }) => {
  const { gameData, imageSource, handleImageError, loading } = useGameDetails(id);
  const [newName, setNewName] = useState('');
  const [imagePreview, setImagePreview] = useState({ uri: "./assets/gamelogo.png" });
  const [newDescription, setNewDescription] = useState('');
  const [newPrivacy, setNewPrivacy] = useState('');
  const [newServe, setNewServe] = useState('');
  const [newImage, setNewImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (gameData) {
      setNewName(gameData.name);
      setNewDescription(gameData.description);
      setNewPrivacy(gameData.privacy);
      setNewServe(gameData.serve);
    }

    setTimeout(() => {
        setImagePreview(imageSource);
      }, 1000); 
  }, [gameData, imageSource]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImagePreview({ uri: result.assets[0].uri });
    }
  };

  const uploadImage = async (imageUri) => {
    try {
      setUploading(true);
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const storageRef = ref(storage, `game_pictures/${id}.jpg`);
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      setUploading(false);
      return downloadURL;
    } catch (error) {
      setUploading(false);
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleDeleteImage = async () => {
    if (imagePreview?.uri !== "./assets/gamelogo.png") {
    try {
      const storageRef = ref(storage, `game_pictures/${id}.jpg`);
      await deleteObject(storageRef);
      setImagePreview({ uri: "./assets/gamelogo.png" });
    } catch (error) {
      console.error('Error deleting image:', error);
      Alert.alert('Error', 'Failed to delete image');
    }
}
  };

  const handleSubmit = async () => {
    let imageUrl = imagePreview.uri;
    
    if (imagePreview?.uri !== imageSource?.uri) {
      await deleteObject(ref(storage, `game_pictures/${id}.jpg`))
                  .catch((error) => {
                    if (error.code !== 'storage/object-not-found') {
                      throw error;
                    }
                  });
      imageUrl = await uploadImage(imagePreview.uri);
      if (!imageUrl) {
        Alert.alert('Error', 'Failed to upload image');
        return;
      }
    }

    axios.post(API_ENDPOINTS.edit_game, {
      gameId: id,
      name: newName,
      description: newDescription,
      privacy: newPrivacy,
      serve: newServe,
      image: imageUrl,
    })
    .then(() => {
      Alert.alert('Success', 'Game updated successfully!');
    })
    .catch(error => {
      console.error('Error updating game:', error);
      Alert.alert('Error', 'Failed to update game.');
    });
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#3498db" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView style={styles.container}>
        <CustomText style={styles.title}>Edit Game</CustomText>
        {imagePreview && <Image source={imagePreview || handleImageError()} onError={handleImageError} style={styles.profileImage} />}
        <TouchableOpacity onPress={pickImage} style={styles.imageButton}>
          <Text style={styles.imageButtonText}>Select Image</Text>
        </TouchableOpacity>
        {imagePreview && (
  <TouchableOpacity onPress={handleDeleteImage} style={styles.delete}>
    <Text style={styles.deleteText}>x</Text>
  </TouchableOpacity>
)}
        <Text style={styles.label}>Game Name</Text>
        <TextInput style={styles.input} placeholderTextColor="white" value={newName} onChangeText={setNewName} />
        <Text style={styles.label}>Description</Text>
        <TextInput style={styles.textarea} placeholderTextColor="white" value={newDescription} onChangeText={setNewDescription} multiline />
        <Text style={styles.labelB}>Privacy</Text>
        <TouchableOpacity style={[styles.buttonB, newPrivacy ? styles.public : styles.private]} onPress={() => setNewPrivacy(!newPrivacy)}>
          <Text style={styles.buttonTextB}>{newPrivacy ? 'Go Public' : 'Go Private'}</Text>
        </TouchableOpacity>
        <Text style={styles.labelB}>Serve</Text>
        <TouchableOpacity style={[styles.buttonB, newServe ? styles.stopServing : styles.startServing]} onPress={() => setNewServe(!newServe)}>
          <Text style={styles.buttonTextB}>{newServe ? 'Stop Serving' : 'Start Serving'}</Text>
        </TouchableOpacity>
        {uploading ? (
          <ActivityIndicator size="small" color="#3498db" style={{ marginTop: 10 }} />
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Update Game</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};


const styles = StyleSheet.create({
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        resizeMode: 'cover',
        alignSelf: 'center',
        backgroundColor: '#CE55F2',
      },
    delete: {
        position: 'absolute',
        padding: 10,
        marginTop: 56,
        marginLeft: 58,
        alignItems: "center",
        width: '100%',
      },
      deleteText: {
        color: 'red',
        fontSize: 25,
        fontWeight: 'bold',
        fontFamily:"Minecraft Regular",
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
    buttonB: {
        paddingVertical: 10,
        alignItems: 'center',
      },
      private: {
        backgroundColor: '#FF5733', // Private color
      },
      public: {
        backgroundColor: '#3498db', // Public color
      },
      startServing: {
        backgroundColor: '#2ecc71', // Start Serving color
      },
      stopServing: {
        backgroundColor: '#e74c3c', // Stop Serving color
      },
      buttonTextB: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'Minecraft Regular',
      },
    picker: {
 backgroundColor: 'transparent',
    color: 'white',
    borderRadius: 0,
    },
    labelB: {
        fontFamily:"Minecraft Regular",
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
        marginTop: 30,
        marginBottom: 12,
      },
      label: {
        fontFamily:"Minecraft Regular",
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
        marginTop: 30,
        marginBottom: 12,
      },
    textarea: {
        fontFamily:"Minecraft Regular",
        width: '100%',
        padding: 10,
        backgroundColor: '#333333',
        color: '#FFFFFF',
        height: 100,
      },
  container: {     flex: 1,
    padding: 20,
    backgroundColor: 'black', 
    width: '100%' },
  
  title: {     fontSize: 30,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    fontFamily:"Minecraft Regular"},

  imageContainer: {
    backgroundColor: "#6441a5",
    padding: 10,
    marginTop: 30,
    alignItems: "center",
    width: '100%',
  },

  image: {  width: 100,
    height: 100,
    borderRadius: 50,
    resizeMode: 'cover',
    alignSelf: 'center',
    backgroundColor: '#CE55F2', },

  imageText: {     color: '#fff',
    fontWeight: 'bold',
    fontFamily:"Minecraft Regular", },

  input: {
    fontFamily:"Minecraft Regular",
    width: '100%',
    padding: 10,
    backgroundColor: '#333333',
    color: '#FFFFFF',
    marginBottom: 10,
  },

  button: {
    backgroundColor: "#6441a5",
    padding: 10,
    marginTop: 30,
    alignItems: "center",
    width: '100%',
    marginBottom: 30
  },

  buttonText: {     color: '#fff',
    fontWeight: 'bold',
    fontFamily:"Minecraft Regular", },
});

export default SetGame;
