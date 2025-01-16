import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image, Animated, Pressable } from 'react-native';
import CustomText from './CustomText';
import Assets from './Assets'; // Import the Assets component (or any other components)
import { useNavigate, useParams } from 'react-router-native';
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

export default function Developer() {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [activePage, setActivePage] = useState('Home'); // State to store the selected page
  const sidebarAnimation = useRef(new Animated.Value(-250)).current;
  const navigate = useNavigate();
  const { id } = useParams();


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
  
  const handleBackPress = () => {
    navigate('/home'); 
  };


  const renderContent = () => {
    switch (activePage) {
      case 'Assets':
        return <Assets id={id} />;
      case 'Board':
        return <CustomText>Board Page Content</CustomText>; // Placeholder for Board page
      case 'Map':
        return <CustomText>Map Page Content</CustomText>; // Placeholder for Map page
      case 'Home':
      default:
        return <Image source={require('./assets/logo.png')} resizeMode="contain" style={styles.logo} />
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.menuButton} onPress={toggleSidebar}>
        <Text style={styles.menuButtonText}>⋯</Text>
      </TouchableOpacity>
      <Animated.View style={[styles.sidebar, { transform: [{ translateX: sidebarAnimation }] }]}>
        <Pressable style={styles.sidebarOverlay} onPress={handlePressOutside}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
              <CustomText style={styles.backButtonText}>&lt;</CustomText>
        </TouchableOpacity>
          <View style={styles.sidebarContent}>
            <TouchableOpacity style={styles.sidebarButton} onPress={() => setActivePage('Assets')}>
              <CustomText style={styles.sidebarButtonText}>Assets</CustomText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sidebarButton} onPress={() => setActivePage('Board')}>
              <CustomText style={styles.sidebarButtonText}>Board</CustomText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sidebarButton} onPress={() => setActivePage('Map')}>
              <CustomText style={styles.sidebarButtonText}>Map</CustomText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sidebarButton} onPress={() => console.log('Image Button Pressed')}>
              <Image source={require('./assets/folder.png')} resizeMode="contain" style={styles.sidebarImage} />
            </TouchableOpacity>
          </View>
        </Pressable>
      </Animated.View>
      
      {/* Main content area where selected pages will be rendered */}
      <View style={styles.mainContent}>
        {renderContent()}
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 110,
    height: 110,
    opacity: 0.6, 
  }
});