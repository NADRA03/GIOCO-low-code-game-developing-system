import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image, Animated, Pressable } from 'react-native';
import CustomText from './CustomText';

export default function Developer() {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const sidebarAnimation = useRef(new Animated.Value(-250)).current; // Start hidden off-screen to the left

  useEffect(() => {
    Animated.timing(sidebarAnimation, {
      toValue: sidebarVisible ? 0 : -120, // Slide in or out
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [sidebarVisible]);

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const handlePressOutside = () => {
    if (sidebarVisible) {
      setSidebarVisible(false);
    }
  };








  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.menuButton} onPress={toggleSidebar}>
        <Text style={styles.menuButtonText}>⋯</Text>
      </TouchableOpacity>
      <Animated.View style={[styles.sidebar, { transform: [{ translateX: sidebarAnimation }] }]}>
        <Pressable style={styles.sidebarOverlay} onPress={handlePressOutside}>
        <TouchableOpacity style={styles.backButton} onPress={() => console.log('Back button Pressed')}>
              <CustomText style={styles.backButtonText}>&lt;</CustomText>
            </TouchableOpacity>
          <View style={styles.sidebarContent}>
            <TouchableOpacity style={styles.sidebarButton} onPress={() => console.log('Button 1 Pressed')}>
              <CustomText style={styles.sidebarButtonText}>Assets</CustomText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sidebarButton} onPress={() => console.log('Button 2 Pressed')}>
              <CustomText style={styles.sidebarButtonText}>Board</CustomText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sidebarButton} onPress={() => console.log('Button 3 Pressed')}>
              <CustomText style={styles.sidebarButtonText}>Map</CustomText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sidebarButton} onPress={() => console.log('Image Button Pressed')}>
              <Image source={require('./assets/folder.png')} resizeMode="contain" style={styles.sidebarImage} />
            </TouchableOpacity>
          </View>
        </Pressable>
      </Animated.View>
      <View style={styles.mainContent}>
      <Image source={require('./assets/logo.png')} resizeMode="contain" style={styles.logo} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  menuButton: {
    position: 'fixed', 
    top: 30,
    right: 20,
    width: 110,
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  backButton: {
    right: 40,
    bottom: 10,
    width: 110,
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  menuButtonText: {
    color: '#f1f1f1',
    fontSize: 24,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 120,
    height: '100%',
    backgroundColor: '#5211BA',
    padding: 20,
    zIndex: 1000,
  },
  backButtonText: {
    color: '#f1f1f1',
    fontSize: 35,
  },
  sidebarOverlay: {
    flex: 1,
  },
  sidebarContent: {
    width: 100,
    flex: 1,
    justifyContent: 'flex-start',
  },
  sidebarButton: {
    paddingBottom: 50
  },
  sidebarButtonText: {
    fontSize: 25,
    color: '#ffffff',
  },
  sidebarImage: {
    width: 60,
    height: 60,
  },
  mainContent: {
    position: 'fixed', 
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 20,
  },
  title: {
    color: '#f1f1f1',
    fontSize: 24,
  },
  logo: {
    width: 110,
    height: 110,
    opacity: 0.6, 
  }
});