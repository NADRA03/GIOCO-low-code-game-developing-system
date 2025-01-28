import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet,   Animated,  TouchableOpacity, ScrollView, TextInput, Button, Image, Text,  Keyboard,
  TouchableWithoutFeedback } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { useNavigate, useParams } from 'react-router-native';
import CustomText from './CustomText';
import { captureScreen } from 'react-native-view-shot';
import { storage } from './firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Canvas from 'react-native-canvas';
import * as ImageManipulator from 'react-native-image-manipulator';
import { Svg, Rect } from 'react-native-svg';

const numRows = 30;
const numCols = 30;
const squareSize = 30; 

const initialColors = [
  '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
  '#000000', '#ffffff', '#888888', '#ff8800', '#00ff88', '#8800ff',
];

export default function Craft() {
  const navigate = useNavigate();
  const [numRows, setNumRows] = useState(30);
  const [numCols, setNumCols] = useState(30);
  const [squareSize, setSquareSize] = useState(30);
  const [showBoard, setShowBoard] = useState(false);
  const [squares, setSquares] = useState([]);
  const [selectedColor, setSelectedColor] = useState('#ff0000');
  const [colors, setColors] = useState(initialColors);
  const [colorInput, setColorInput] = useState('');
  const [savedImage, setSavedImage] = useState(null);
  const viewRef = useRef(null);
  const canvasRef = useRef(null);
  const [animationValue] = useState(new Animated.Value(0));
  const [backgroundColor, setBackgroundColor] = useState('#000000'); 
  const [squarePreviewColor, setSquarePreviewColor] = useState(backgroundColor);
  const [opacity, setOpacity] = useState(1);


  const initializeBoard = () => {
    if (numRows && numCols && squareSize) {
      setSquares(Array(numRows * numCols));
      setShowBoard(true);
    }
  };

  const handleSquarePress = useCallback((index) => {
    setSquares((prevSquares) => {
      const newSquares = [...prevSquares];
      // Apply opacity to selected color
      const newColor = newSquares[index] === selectedColor ? backgroundColor : selectedColor;
      newSquares[index] = `rgba(${parseInt(newColor.slice(1, 3), 16)}, ${parseInt(newColor.slice(3, 5), 16)}, ${parseInt(newColor.slice(5, 7), 16)}, ${opacity})`;
      return newSquares;
    });
  }, [selectedColor, backgroundColor, opacity]);
  

  const handleAddColor = () => {
    if (/^#[0-9A-F]{6}$/i.test(colorInput)) {
      setColors((prevColors) => [...prevColors, colorInput]);
      setSelectedColor(colorInput);
      setColorInput('');
    } else {
      alert('Invalid color code. Please use a valid hex color code.');
    }
  };

  const captureAndSaveImage = async () => {
    try {
      // Convert the squares to SVG elements
      const svgElements = squares.map((color, index) => {
        const x = (index % numCols) * squareSize;
        const y = Math.floor(index / numCols) * squareSize;
        if (color && color !== 'transparent') {
          return `<rect x="${x}" y="${y}" width="${squareSize}" height="${squareSize}" fill="${color}" />`;
        }
        return '';
      }).join('');

      // Now you have the SVG elements that represent the grid

      // Create the full SVG string
      const svgString = `<?xml version="1.0" encoding="UTF-8"?> 
      <svg xmlns="http://www.w3.org/2000/svg" width="${numCols * squareSize}" height="${numRows * squareSize}">
        ${svgElements}
      </svg>`;

      // Convert SVG to Blob for uploading to Firebase
      const blob = new Blob([svgString], { type: 'image/svg+xml' });

      // Upload the Blob to Firebase Storage
      const storageRef = ref(storage, `images/${new Date().toISOString()}.svg`);
      await uploadBytes(storageRef, blob);

      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);
      setSavedImage(downloadURL);
    } catch (error) {
      console.error('Failed to capture and save image', error);
      Alert.alert('Failed to save image: ' + error.message);
    }
  };
  
  // Crop transparent areas using react-native-image-manipulator
  // const cropTransparentArea = async (uri) => {
  //   try {
  //     const manipResult = await ImageManipulator.manipulateAsync(uri, [], {
  //       compress: 1,
  //       format: ImageManipulator.SaveFormat.PNG,
  //     });
  
  //     return manipResult;
  //   } catch (error) {
  //     console.error('Error cropping transparent area', error);
  //     throw new Error('Could not crop transparent area');
  //   }
  // };
  


  const handleSquareSizeChange = (text) => {
    const value = parseInt(text) || 0;
    const adjustedValue = Math.min(value, 100); // Ensure the value does not exceed 100
    setSquareSize(adjustedValue); 
  };
   
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animationValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animationValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animationValue]);


  if (!showBoard) {
    const translateY = animationValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -20], // Image moves up by 20px
    });
    return (
      
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.containerMod}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigate(-1)}>
        <CustomText style={styles.backButtonText}>&lt;</CustomText>
    </TouchableOpacity>
        <Animated.Image
                  source={require('./assets/gost.png')}
                  style={{
                    resizeMode: 'contain',
                    width: 120,
                    height: 120,
                    transform: [{ translateY }],
                    marginBottom: 30, 
                  }}
                />
          <TextInput
            style={styles.inputMod}
            placeholder="Number of Rows"
            placeholderTextColor="#ffffff" 
            keyboardType="number-pad"
            onChangeText={(text) => setNumRows(parseInt(text) || 0)}
          />
          <TextInput
            style={styles.inputMod}
            placeholder="Number of Columns"
            placeholderTextColor="#ffffff" 
            keyboardType="number-pad"
            onChangeText={(text) => setNumCols(parseInt(text) || 0)}
          />
          <TextInput
            style={styles.inputMod}
            placeholder="Square Size (px)"
            placeholderTextColor="#ffffff" 
            keyboardType="number-pad"
            onChangeText={handleSquareSizeChange}
          />
          
          {/* Show the preview square when the square size input has a value */}
          {squareSize > 0 && (
            <View style={styles.previewContainer}>
              <View
                style={[
                  styles.squarePreview,
                  {
                    width: squareSize,
                    height: squareSize,
                    backgroundColor: squarePreviewColor, 
                    borderWidth: 1, 
                    borderColor: '#ffffff',
                  },
                ]}
              />
            </View>
          )}
  
          <TouchableOpacity style={styles.buttonMod} onPress={initializeBoard}>
            <Text style={styles.buttonModText}>Start</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.colorPickerContainer}>
        <ScrollView horizontal contentContainerStyle={styles.colorPalette}>
        <TouchableOpacity style={styles.back} onPress={() => setShowBoard(false)}>
  <CustomText style={styles.backText}>&lt;</CustomText>
</TouchableOpacity>
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
            placeholder="#ffffff"
            value={colorInput}
            onChangeText={setColorInput}
          />
                    <TouchableOpacity style={styles.button} onPress={handleAddColor}>
            <CustomText style={styles.buttonText}>Add Color</CustomText>
          </TouchableOpacity>
          <TextInput
          style={styles.input}
          placeholder="1.0"
          placeholderTextColor="#ffffff"
          keyboardType="decimal-pad"
          onChangeText={(text) => setOpacity(Math.max(0, Math.min(1, parseFloat(text) || 1)))}
          />
          <TouchableOpacity style={styles.button} onPress={captureAndSaveImage}>
            <CustomText style={styles.buttonText}>Save Image</CustomText>
          </TouchableOpacity>
          {/* <TouchableOpacity style={styles.button} onPress={() => {
          const newColor = backgroundColor === '#000000' ? '#ffffff' : '#000000';
          setBackgroundColor(newColor);
          }}>
          <CustomText style={styles.buttonText}>Toggle Background Color</CustomText>
          </TouchableOpacity> */}
        </View>
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        horizontal
        showsHorizontalScrollIndicator={true}
      >
        <ScrollView contentContainerStyle={styles.boardContainer} vertical>
            <View collapsable={false} ref={viewRef} style={styles.drawingContainer}>
            {Array.from({ length: numRows }).map((_, rowIndex) => (
              <View key={rowIndex} style={styles.row}>
                {Array.from({ length: numCols }).map((_, colIndex) => {
                  const index = rowIndex * numCols + colIndex;
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[styles.square, { backgroundColor: squares[index], width: squareSize, height: squareSize }]}
                      onPress={() => handleSquarePress(index)}
                    />
                  );
                })}
              </View>
            ))}
            </View>
        </ScrollView>
      </ScrollView>
      <Canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 1, // Initially set to 1x1, resize dynamically
          height: 1,
          zIndex: -1, // Ensure it's invisible but functional
        }}
      />
      {savedImage && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: savedImage }} style={styles.image} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  back: {
    left: 20,
    width: 110,
    height: 110,
    borderRadius: 5,
  },
  backText: {
        color: '#ffffff',
        fontSize: 35,
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
  previewContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  squarePreview: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
    backgroundColor: '#000000',
  },
  containerMod: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000', 
    padding: 20,
  },
  inputMod: {
    width: '80%',
    borderColor: '#ffffff', 
    borderWidth: 1,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    color: '#ffffff',
    backgroundColor: '#262626', 
    fontFamily: 'Minecraft Regular',
  },
  buttonMod: {
    width: '60%',
    marginTop: 20,
    backgroundColor: '#ff8800', 
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#ff8800',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    backgroundColor: '#CE55F2', 
  },
  buttonModText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff', 
    fontFamily: 'Minecraft Regular', 
  },
  button: {
    padding: 5,
    backgroundColor: '#000000',
    marginHorizontal: 5,
  },
  buttonText: {
    color: '#ffffff',
    fontFamily: 'Minecraft Regular',
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  colorPickerContainer: {
    padding: 10,
    paddingTop: 50, 
    backgroundColor: '#000000',
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
    color: '#ffffff',
    borderWidth: 1,
    padding: 5,
    width: 100,
    marginRight: 5,
    fontFamily: 'Minecraft Regular',
    flex: 1,
  },
  scrollContainer: {
    flexDirection: 'row',
    backgroundColor: '#000000',
  },
  boardContainer: {
    flexDirection: 'column',
    backgroundColor: '#000000', 
  },
  row: {
    flexDirection: 'row',
  },
  square: {
    width: squareSize,
    height: squareSize,
    borderWidth: 0.3,
    borderColor: '#ffffff', 
    backgroundColor: 'transparent',
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





