import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Image, TextInput, StyleSheet, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import CustomText from './CustomText';
import { storage } from './firebaseConfig';
import { ref, listAll, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-native';

export default function Game() {
  const [selectedHeroImage, setSelectedHeroImage] = useState(null);
  const [selectedEnemyImage, setSelectedEnemyImage] = useState(null);
  const [selectedBackgroundImage, setSelectedBackgroundImage] = useState(null);
  const [imageList, setImageList] = useState([]);
  const [gameSpeed, setGameSpeed] = useState(1);
  const [enemyFrequency, setEnemyFrequency] = useState(1);
  const [activePicker, setActivePicker] = useState(null);
  const [heroSize, setHeroSize] = useState(50);  
  const [enemySize, setEnemySize] = useState(50); 
  const navigate = useNavigate();

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const imagesRef = ref(storage, 'images');
        const images = await listAll(imagesRef);

        const imageUrls = await Promise.all(
          images.items.map(item => getDownloadURL(item))
        );

        setImageList(imageUrls);
      } catch (error) {
        console.error('Error fetching images from Firebase Storage', error);
      }
    };

    fetchImages();
  }, []);

  const handlePickerSelect = (pickerType, itemValue) => {
    if (pickerType === 'hero') {
      setSelectedHeroImage(itemValue);
    } else if (pickerType === 'enemy') {
      setSelectedEnemyImage(itemValue);
    } else if (pickerType === 'background') {
      setSelectedBackgroundImage(itemValue);
    }
    setActivePicker(null);
  };

  const handleOpenPicker = (pickerType) => {
    setActivePicker(activePicker === pickerType ? null : pickerType);
  };
  
  const handleStartGame = () => {
      navigate('/play', {
      heroImage: selectedHeroImage,
      enemyImage: selectedEnemyImage,
      backgroundImage: selectedBackgroundImage,
      gameSpeed,
      enemyFrequency,
      heroSize,
      enemySize,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <CustomText style={styles.label}>Select Hero Image</CustomText>
      {activePicker === 'hero' ? (
        <Picker
          selectedValue={selectedHeroImage}
          onValueChange={(itemValue) => handlePickerSelect('hero', itemValue)}
          style={styles.picker}
        >
          {imageList.map((uri, index) => (
            <Picker.Item key={index} label={`Hero ${index + 1}`} value={uri} />
          ))}
        </Picker>
      ) : (
        <TouchableOpacity onPress={() => handleOpenPicker('hero')} style={styles.selectButton}>
          <CustomText>Select Hero</CustomText>
        </TouchableOpacity>
      )}
      {selectedHeroImage && <Image source={{ uri: selectedHeroImage }} style={styles.imagePlaceholder} />}

      <CustomText style={styles.label}>Select Enemy Image</CustomText>
      {activePicker === 'enemy' ? (
        <Picker
          selectedValue={selectedEnemyImage}
          onValueChange={(itemValue) => handlePickerSelect('enemy', itemValue)}
          style={styles.picker}
        >
          {imageList.map((uri, index) => (
            <Picker.Item key={index} label={`Enemy ${index + 1}`} value={uri} />
          ))}
        </Picker>
      ) : (
        <TouchableOpacity onPress={() => handleOpenPicker('enemy')} style={styles.selectButton}>
          <CustomText>Select Enemy</CustomText>
        </TouchableOpacity>
      )}
      {selectedEnemyImage && <Image source={{ uri: selectedEnemyImage }} style={styles.imagePlaceholder} />}

      <CustomText style={styles.label}>Select Background Image</CustomText>
      {activePicker === 'background' ? (
        <Picker
          selectedValue={selectedBackgroundImage}
          onValueChange={(itemValue) => handlePickerSelect('background', itemValue)}
          style={styles.picker}
        >
          {imageList.map((uri, index) => (
            <Picker.Item key={index} label={`Background ${index + 1}`} value={uri} />
          ))}
        </Picker>
      ) : (
        <TouchableOpacity onPress={() => handleOpenPicker('background')} style={styles.selectButton}>
          <CustomText>Select Background</CustomText>
        </TouchableOpacity>
      )}
      {selectedBackgroundImage && <Image source={{ uri: selectedBackgroundImage }} style={styles.imagePlaceholder} />}

      <View style={styles.inputContainer}>
        <CustomText style={styles.label}>Game Speed</CustomText>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={String(gameSpeed)}
          onChangeText={(text) => setGameSpeed(Number(text))}
        />
      </View>

      <View style={styles.inputContainer}>
        <CustomText style={styles.label}>Enemy Frequency</CustomText>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={String(enemyFrequency)}
          onChangeText={(text) => setEnemyFrequency(Number(text))}
        />
      </View>

      <View style={styles.inputContainer}>
        <CustomText style={styles.label}>Hero Size</CustomText>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={String(heroSize)}
          onChangeText={(text) => setHeroSize(Number(text))}
        />
      </View>

      <View style={styles.inputContainer}>
        <CustomText style={styles.label}>Enemy Size</CustomText>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={String(enemySize)}
          onChangeText={(text) => setEnemySize(Number(text))}
        />
      </View>

      <TouchableOpacity style={styles.startButton} onPress={handleStartGame}>
        <CustomText style={styles.startButtonText}>Start Game</CustomText>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f1f1f1',
    alignItems: 'center',
  },
  imagePlaceholder: {
    width: 150,
    height: 150,
    backgroundColor: '#ccc',
    marginBottom: 10,
    borderRadius: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  input: {
    borderColor: '#000',
    borderWidth: 1,
    padding: 10,
    marginLeft: 10,
    width: 80,
    borderRadius: 5,
  },
  startButton: {
    padding: 15,
    backgroundColor: '#00ff00',
    borderRadius: 5,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  startButtonText: {
    color: '#ffffff',
    fontFamily: 'Minecraft Regular',
    fontSize: 16,
  },
  picker: {
    height: 200, 
    width: '100%',
    marginVertical: 10,
    backgroundColor: '#ffffff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  selectButton: {
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
  },
});
