import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import CustomText from './CustomText';
import { useNavigate } from 'react-router-native';
import axios from 'axios';
import API_ENDPOINTS from './api';
import { useEffect } from 'react';

export default function SelectGameType() {
  const [selectedType, setSelectedType] = useState(null);
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({ username: '', profile_image: '', id: 0 });

  const handleSelectType = (type) => {
    setSelectedType(type);
  };

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

  const handleStart = async () => {
    if (selectedType && profileData?.id) { 
      try {
        const response = await axios.post(API_ENDPOINTS.game_create, {
          type: selectedType,
          user_id: profileData.id,
          name: 'Tale', 
        });
  
        if (response.status === 201) {
          const { id } = response.data; 
          navigate(`/developer/${id}`);
        } else {
          console.error('Failed to create the game:', response);
        }
      } catch (error) {
        console.error('Error creating the game:', error);
        alert('Error creating the game. Please try again.');
      }
    } else {
      alert('Please select a game type and make sure user is logged in.');
    }
  };
  
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, selectedType === 'pts' && styles.selectedButton]}
        onPress={() => handleSelectType('pts')}
      >
        <Text style={[styles.buttonText, selectedType === 'pts' && styles.selectedButtonText]}>PTS</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, selectedType === 'map' && styles.selectedButton]}
        onPress={() => handleSelectType('map')}
      >
        <Text style={[styles.buttonText, selectedType === 'map' && styles.selectedButtonText]}>Map</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.startButton}
        onPress={handleStart}
        disabled={!selectedType}
      >
        <CustomText style={styles.startButtonText}>Start</CustomText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  button: {
    color: '#8a6abf',
    padding: 10,
    borderRadius: 0,
    margin: 10,
  },
  selectedButton: {
  },
  buttonText: {
    fontFamily: 'Domino Brick',
    fontSize: 80,
    color: '#f1f1f1',
  },
  selectedButtonText: {
    color: '#b9a3e3',
  },
  startButton: {
    padding: 10,
    borderRadius: 0,
    marginTop: 90,
  },
  startButtonText: {
    color: '#f1f1f1',
    fontSize: 30,
    fontWeight: 'bold',
  },
});
