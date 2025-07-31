import React, { useState } from 'react';
import { StatusBar, TouchableWithoutFeedback, Keyboard, View } from 'react-native';
import { StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import CustomText from './CustomText';
import { useNavigate } from 'react-router-native';
import axios from 'axios';
import { Image } from 'expo-image';
import API_ENDPOINTS from './api';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import DateTimePickerModal from "react-native-modal-datetime-picker";

export default function SignUpScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [showInputs, setShowInputs] = useState(false);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isGoogleSignUp, setIsGoogleSignUp] = useState(false); 
  const navigate = useNavigate();
  const [passwordValidationMessage, setPasswordValidationMessage] = useState('');

  const handlePasswordChange = (text) => {
    setPassword(text);
    const message = validatePassword(text);
    setPasswordValidationMessage(message);
  };

  const showDatePicker = () => {
    setDatePickerVisible(true);
  };
  
  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };
  
  const handleConfirm = (date) => {
    setDateOfBirth(date.toISOString().split('T')[0]); 
    hideDatePicker();
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '677761945794-qbcsn0gcj2bvd5c2oggm5kdpgpos6229.apps.googleusercontent.com',
  });


  React.useEffect(() => {
    if (response?.type === 'success') {
      const { email, id: google_id } = response.authentication; // Extract google_id
      setEmail(email);
      setIsGoogleSignUp(true); // Set Google sign up flag
      setShowInputs(true);
    }
  }, [response]);

  const validatePassword = (password) => {
    const minLength = 8;
    const uppercase = /[A-Z]/;
    const lowercase = /[a-z]/;
    const number = /[0-9]/;
    const specialChar = /[!@#$%^&*(),.?":{}|<>]/;
  
    if (password.length < minLength) {
      return 'Password must be at least 8 characters long.';
    }
    if (!uppercase.test(password)) {
      return 'Password must contain at least one uppercase letter.';
    }
    if (!lowercase.test(password)) {
      return 'Password must contain at least one lowercase letter.';
    }
    if (!number.test(password)) {
      return 'Password must contain at least one number.';
    }
    if (!specialChar.test(password)) {
      return 'Password must contain at least one special character.';
    }
  
    return null; // Valid password
  };
  
  const handleSignUp = async () => {
    if (password !== repeatPassword) {
      alert('Passwords do not match');
      return;
    }
  
    const passwordValidationError = validatePassword(password);
    if (passwordValidationError) {
      alert(passwordValidationError);
      return;
    }
  
    try {
      const res = await axios.post(
        API_ENDPOINTS.signup,
        {
          email,
          username,
          password,
          google_id: isGoogleSignUp ? response.authentication.id : null,
          dateOfBirth,
        },
        {
          withCredentials: true,
        }
      );
  
      if (res.data.message === 'Signup successful!') {
        navigate('/home');
      } else {
        alert('Signup failed: ' + res.data.message);
      }
    } catch (error) {
      console.error('Signup error:', error);
    
      if (error.response?.data?.message) {
        alert(error.response.data.message); // Show backend error message if available
      } else {
        alert('An error occurred during signup. Please try again.');
      }
    }
  };

  const handleSignIn  = async () => {
    navigate('/');
  }

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={styles.container}>
                <Image
                source={require('./assets/logo.png')} 
                    style={styles.logoImage}
                />
        <CustomText style={styles.title}>Sign Up</CustomText>
        {/* Show both buttons even after the email inputs are displayed */}
        <View>
          {!showInputs && (
            <>
            {/* <TouchableOpacity style={styles.button} onPress={() => promptAsync()}>
                    <View style={styles.buttonContent}>
                    <Image source={require('./assets/google.png')} style={styles.icon} />
                    <CustomText style={styles.buttonText}>Sign Up with Google</CustomText>
                    </View>
            </TouchableOpacity> */}
              <TouchableOpacity
                style={[styles.button, styles.withEmail]}
                onPress={() => setShowInputs(true)} // Show email inputs when clicking 'Sign Up with Email'
              >
                <CustomText style={[styles.buttonText, styles.withEmailText]}>Sign Up with Email</CustomText>
              </TouchableOpacity>
            </>
          )}
          {showInputs && (
            <View style={styles.inputContainer}>

              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="#a9a9a9"
                textAlign="center"
                value={username}
                onChangeText={setUsername}
              />
            {/* Conditionally render email input if not using Google */}
            {!isGoogleSignUp && (
            <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#a9a9a9"
            textAlign="center"
            value={email}
            onChangeText={setEmail}
            />
            )}
            <TouchableOpacity onPress={showDatePicker} style={styles.input}>
  <CustomText style={{ color: dateOfBirth ? 'white' : '#a9a9a9' }}>
    {dateOfBirth ? dateOfBirth : "Select Date of Birth"}
  </CustomText>
</TouchableOpacity>

                    <DateTimePickerModal
                    isVisible={isDatePickerVisible}
                    mode="date"
                    onConfirm={handleConfirm}
                    onCancel={hideDatePicker}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Password"
                      placeholderTextColor="#a9a9a9"
                      value={password}
                      onChangeText={handlePasswordChange}
                      secureTextEntry
                      textAlign="center"
                    />
                    {passwordValidationMessage && (
                      <CustomText style={styles.validationMessage}>
                        {passwordValidationMessage}
                      </CustomText>
                    )}
              <TextInput
                style={styles.input}
                placeholder="Repeat Password"
                placeholderTextColor="#a9a9a9"
                value={repeatPassword}
                onChangeText={setRepeatPassword}
                secureTextEntry
                textAlign="center"
              />
              <TouchableOpacity style={styles.buttonSignUp} onPress={handleSignUp}>
                <CustomText style={styles.buttonSignUpText}>Sign Up</CustomText>
              </TouchableOpacity>
              {/* {!isGoogleSignUp && (
                <TouchableOpacity style={styles.button} onPress={() => promptAsync()}>
                    <View style={styles.buttonContent}>
                    <Image source={require('./assets/google.png')} style={styles.icon} />
                    <CustomText style={styles.buttonText}>Sign Up with Google</CustomText>
                    </View>
                </TouchableOpacity>
              )} */}
            </View>
          )}
        </View>
        <StatusBar style="auto" />
        <TouchableOpacity onPress={handleSignIn}>
          <CustomText style={styles.signInText}>You already have an account? Sign In</CustomText>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  validationMessage: {
  color: '#ff4444', 
  textAlign: 'center',
  marginBottom: 20,
  fontSize: 10,
},
      logoImage: {
        position: 'absolute',
        resizeMode: 'contain',
        width: 60,
        height: 60,
        opacity: 0.5,
        bottom: 40, 
      },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center', // Vertically align text and image
      },
      icon: {
        width: 30,  // Adjust size based on your needs
        height: 30, // Adjust size based on your needs
        marginRight: 10, // Space between the image and text
        resizeMode: 'contain',
      },
    buttonSignUp: {
        backgroundColor: 'transparent',
        padding: 10,
        marginBottom: 20,
      },
      buttonSignUpText: {
        color: '#f1f1f1',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold',
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
    width: '300',
    paddingLeft: 10,
    color: 'white',
    fontFamily: 'Minecraft Regular',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: 'white',
    marginBottom: 20,
    width: 300,
    padding: 10,
    justifyContent: 'center', // Vertically center the content
    alignItems: 'center', // Horizontally center the content
    height: 50,
  },
  buttonText: {
    color: '#000000',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  withEmail: {
    backgroundColor: '#6441a5',
  },
  withEmailText: {
    color: 'white',
  },
  signInText: {
    marginTop: 10,
    color: 'white',
    textDecorationLine: 'underline',
  },
});