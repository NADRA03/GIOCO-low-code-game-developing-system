import React from 'react';
import { StatusBar, TouchableWithoutFeedback, Keyboard, View } from 'react-native';
import { StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import CustomText from './CustomText';
import { useNavigate } from 'react-router-native';

export default function SignUpScreen() {
  const navigate = useNavigate();
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const handleSignUp = () => {
    navigate('/home'); // Navigate to Home screen
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={styles.container}>
        <CustomText style={styles.title}>Sign Up</CustomText>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#a9a9a9"
            textAlign="center"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#a9a9a9"
            secureTextEntry
            textAlign="center"
          />
        </View>
        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <CustomText style={styles.buttonText}>Sign Up</CustomText>
        </TouchableOpacity>
        <TouchableOpacity>
          <CustomText style={styles.signInText}>Already have an account? Sign In</CustomText>
        </TouchableOpacity>
        <StatusBar style="auto" />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f1f1',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#6441a5',
  },
  inputContainer: {
    width: '100%',
  },
  input: {
    height: 40,
    borderColor: '#262626',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingLeft: 10,
    color: '#262626',
  },
  button: {
    backgroundColor: '#b9a3e3',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#f1f1f1',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signInText: {
    marginTop: 10,
    color: '#6441a5',
    textDecorationLine: 'underline',
  },
});