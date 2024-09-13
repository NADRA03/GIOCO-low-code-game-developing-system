import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native';
import CustomText from './CustomText';
import FontLoader from './FontLoader';
import { useNavigate } from 'react-router-native';
export default function Home() {
const navigate = useNavigate();

const handleCraftPress = () => {
        navigate('/select'); 
      };
const handleGamePress = () => {
        navigate('/game'); 
      };
  return (
    <View style={styles.container}>
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
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f1f1f1',
    },
    text: {
      fontSize: 20,
      color: '#262626',
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
