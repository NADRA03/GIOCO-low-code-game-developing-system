import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import CustomText from './CustomText';
import { useNavigate } from 'react-router-native';

export default function SelectGameType() {
  const [selectedType, setSelectedType] = useState(null);
  const navigate = useNavigate();

  const handleSelectType = (type) => {
    setSelectedType(type);
  };

  const handleStart = () => {
    if (selectedType) {
      navigate(`/developer/${selectedType}`);
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
