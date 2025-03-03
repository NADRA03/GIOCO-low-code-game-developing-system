import React from 'react';
import { StatusBar, TouchableWithoutFeedback, Keyboard, View, Image } from 'react-native';
import { StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import CustomText from './CustomText';
import { useNavigate } from 'react-router-native';
import axios from 'axios';
import API_ENDPOINTS from './api'; 
import { useState } from 'react';

export default function SignInScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const handleSignUp  = async () => {
    navigate('/signUp');
  }

  const handleSignIn = async () => {
    try {
      const response = await axios.post(API_ENDPOINTS.login, {
        username,
        password
      }, {
        withCredentials: true 
      });

      console.log('Response:', response.data); 
      if (response.data.message === 'Login successful!') {
        navigate('/home'); 
      } else {
        alert('Sign up failed: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error during sign up:', error);
      if (error.response?.data?.message) {
        alert(error.response.data.message); // Show backend error message if available
      } else {
        alert('An error occurred during signip. Please try again.');
      }
    }
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={styles.container}>
                      <Image
                      source={require('./assets/logo.png')} 
                          style={styles.logoImage}
                      />
        <CustomText style={styles.title}>Sign In</CustomText>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#a9a9a9"
            textAlign="center"
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#a9a9a9"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textAlign="center"
          />
        </View>
        <TouchableOpacity style={styles.button} onPress={handleSignIn}>
          <CustomText style={styles.buttonText}>Sign In</CustomText>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSignUp}>
          <CustomText style={styles.signInText}>You don't have an acount? Sign Up</CustomText>
        </TouchableOpacity>
        <StatusBar style="auto" />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  logoImage: {
    position: 'absolute',
    resizeMode: 'contain',
    width: 60,
    height: 60,
    opacity: 0.5,
    bottom: 70, 
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#6441a5',
  },
  inputContainer: {
    width: '100%',
  },
  input: {
    height: 40,
    borderColor: '#262626',
    borderWidth: 1,
    marginBottom: 20,
    paddingLeft: 10,
    color: 'white',
    fontFamily: 'Minecraft Regular'
  },
  button: {
    backgroundColor: 'transparent',
    padding: 10,
  },
  buttonText: {
    color: '#f1f1f1',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signInText: {
    marginTop: 10,
    color: 'white',
    textDecorationLine: 'underline',
  },
});