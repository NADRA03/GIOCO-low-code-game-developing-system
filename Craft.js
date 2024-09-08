import React, { useState, useCallback, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, TextInput, Button, Image } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import CustomText from './CustomText';
import { storage } from './firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Constants for the board
const numRows = 30;
const numCols = 30;
const squareSize = 30; // Adjusted size for better fit

// Predefined color palette
const initialColors = [
  '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
  '#000000', '#ffffff', '#888888', '#ff8800', '#00ff88', '#8800ff',
  // Add more colors as needed
];

export default function Craft() {
  const [squares, setSquares] = useState(Array(numRows * numCols).fill('#ffffff')); // Initial color is white
  const [selectedColor, setSelectedColor] = useState('#ff0000'); // Default selected color
  const [colors, setColors] = useState(initialColors); // Color palette
  const [colorInput, setColorInput] = useState(''); // Color input field
  const [savedImage, setSavedImage] = useState(null); // Saved image URI state
  const viewRef = useRef(); // Ref to capture the view

  const handleSquarePress = useCallback((index) => {
    setSquares(prevSquares => {
      const newSquares = [...prevSquares];
      newSquares[index] = newSquares[index] === selectedColor ? '#ffffff' : selectedColor; // Toggle between selected color and white
      return newSquares;
    });
  }, [selectedColor]);

  const handleAddColor = () => {
    if (/^#[0-9A-F]{6}$/i.test(colorInput)) {
      setColors(prevColors => {
        const newColors = [...prevColors];
        newColors[newColors.length - 1] = colorInput; // Replace last color
        return newColors;
      });

      setSquares(prevSquares =>
        prevSquares.map(squareColor => (squareColor === selectedColor ? colorInput : squareColor))
      );
      setSelectedColor(colorInput);
    } else {
      alert('Invalid color code. Please use a valid hex color code.');
    }
  };

  const captureAndSaveImage = async () => {
    try {
      // Capture the view as an image
      const uri = await captureRef(viewRef, {
        format: 'png',
        quality: 1,
      });
  
      if (!uri) {
        throw new Error('Failed to capture image: URI is undefined');
      }
  
      // Convert the image URI to a blob
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error('Failed to fetch image data');
      }
      const blob = await response.blob();
  
      // Create a reference to the storage location with folder prefix
      const storageRef = ref(storage, `images/${new Date().toISOString()}.png`);
  
      // Upload the blob to Firebase Storage
      await uploadBytes(storageRef, blob);
  
      // Get the download URL of the uploaded image
      const downloadURL = await getDownloadURL(storageRef);
      setSavedImage(downloadURL);
      alert('Image saved successfully!');
    } catch (error) {
      console.error('Failed to capture and save image', error);
    }
  };
  
  
  
  

  return (
    <View style={styles.container}>
      <View style={styles.colorPickerContainer}>
        <ScrollView horizontal contentContainerStyle={styles.colorPalette}>
          {colors.map((color) => (
            <TouchableOpacity
              key={color}
              style={[styles.colorSwatch, { backgroundColor: color }]}
              onPress={() => setSelectedColor(color)}
            />
          ))}
        </ScrollView>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="#FFFFFF"
            value={colorInput}
            onChangeText={setColorInput}
          />
          <TouchableOpacity style={styles.button} onPress={handleAddColor}>
            <CustomText style={styles.buttonText}>Add Color</CustomText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={captureAndSaveImage}>
            <CustomText style={styles.buttonText}>Save Image</CustomText>
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        horizontal
        showsHorizontalScrollIndicator={true}
        maximumZoomScale={3}
        minimumZoomScale={0.9}
      >
        <ScrollView
          contentContainerStyle={styles.boardContainer}
          vertical
          showsVerticalScrollIndicator={true}
          maximumZoomScale={3}
          minimumZoomScale={0.9}
        >
          <View ref={viewRef} style={styles.drawingContainer}>
            {Array.from({ length: numRows }).map((_, rowIndex) => (
              <View key={rowIndex} style={styles.row}>
                {Array.from({ length: numCols }).map((_, colIndex) => {
                  const index = rowIndex * numCols + colIndex;
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[styles.square, { backgroundColor: squares[index] }]}
                      onPress={() => handleSquarePress(index)}
                    />
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>
      </ScrollView>
      {savedImage && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: savedImage }} style={styles.image} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  buttonText: {
    color: '#000000',
    fontFamily: 'Minecraft Regular',
  },
  container: {
    flex: 1,
    backgroundColor: '#f1f1f1',
  },
  colorPickerContainer: {
    padding: 10,
    backgroundColor: '#ffffff',
  },
  colorPalette: {
    flexDirection: 'row',
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: '#262626',
    marginRight: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'center',
  },
  input: {
    borderColor: '#262626',
    borderWidth: 1,
    padding: 5,
    marginRight: 10,
    flex: 1,
  },
  scrollContainer: {
    flexDirection: 'row',
  },
  boardContainer: {
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'row',
  },
  square: {
    width: squareSize,
    height: squareSize,
    borderWidth: 0.3,
    borderColor: '#262626',
  },
  drawingContainer: {
    alignSelf: 'center',
  },
  imageContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  image: {
    width: 300,
    height: 300,
  },
});





