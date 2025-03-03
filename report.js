import React, { useState } from "react";
import { View, Text, TextInput, Image, TouchableOpacity, Keyboard, TouchableWithoutFeedback, StyleSheet } from "react-native";
import { useNavigate } from 'react-router-native';
import axios from 'axios';  // Make sure axios is imported
import CustomText from './CustomText';
import API_ENDPOINTS from './api';  // Import API endpoints
import useProfile from './get_session';

export default function ReportProblem() {
  const [problemText, setProblemText] = useState("");
  const navigate = useNavigate();
  const { profileData } = useProfile();


  const handleSubmit = async () => {
    if (!problemText.trim()) {
      alert("Please describe the problem.");
      return;
    }

    const user_id = profileData.id; 
    const seen = false;

    const reportData = {
      problem: problemText,
      user_id: user_id,
      seen: seen,
    };

    try {
      const response = await axios.post(API_ENDPOINTS.send_report, reportData);

      if (response.data.message === 'Report successfully created.') {
        alert("Problem reported successfully!");
        setProblemText(""); 
      } else {
        alert("Failed to report the problem.");
      }
    } catch (error) {
      console.error('Error:', error);
      alert("An error occurred while reporting the problem.");
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigate(-1)}>
          <CustomText style={styles.backButtonText}>&lt;</CustomText>
        </TouchableOpacity>
        <Image source={require('./assets/report2.png')} style={styles.Image} />
        <Text style={styles.title}>Report a Problem</Text>
        <TextInput
          style={styles.input}
          placeholder="Describe the problem..."
          placeholderTextColor="#999"
          value={problemText}
          onChangeText={setProblemText}
          multiline
        />
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}


const styles = StyleSheet.create({
    Image: {
        width: 70, 
        height: 70, 
        marginBottom: 50,
        resizeMode: 'contain',
        opacity: 0.5, 
      },
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 20,
    justifyContent: "center",
    alignItems: 'center',
  },
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
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 30,
    fontFamily: 'Minecraft Regular'
  },
  input: {
    backgroundColor: "#222",
    color: "#fff",
    padding: 12,
    fontFamily: 'Minecraft Regular',
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: "top",
    width: '100%',
  },
  submitButton: {
    backgroundColor: "#6441a5",
    padding: 15,
    marginTop: 20,
    alignItems: "center",
    width: '100%',
  },
  submitButtonText: {
    color: "#fff",
    fontFamily: 'Minecraft Regular',
    fontSize: 16,
    fontWeight: "bold",
  },
});