import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image, Animated, Pressable } from 'react-native';
import CustomText from './CustomText';
import { Outlet, useOutlet } from 'react-router-native';
import Craft from './Craft'; 
import Assets from './Assets'; 
import Folder from './Folder';
import Map from './Map'; 
import API_ENDPOINTS from './api';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-native';
import GameServer from './gameServer';
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

export default function dashboard() { 
  const outlet = useOutlet();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [activePage, setActivePage] = useState('Home'); // State to store the selected page
  const sidebarAnimation = useRef(new Animated.Value(-250)).current;
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [myGames, setMyGames] = useState([]);
  const [imageError, setImageError] = useState(false);
  const [selectedGame, setSelectedGame] = useState({ id: null, isUserGame: false });


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


  useEffect(() => {
    const fetchGames = async () => {
      try {
        let response = await axios.get(API_ENDPOINTS.get_games_by_session, { withCredentials: true });
        setGames(response.data || [])
        response = await axios.get(API_ENDPOINTS.session_user_made_games, { withCredentials: true });
        setMyGames(response.data.games || []); 
      } catch (error) {
        console.error('Error fetching games:', error);
      }
    };
  
    fetchGames();
  }, []);


  const renderContent = () => {
    switch (activePage) {
      case 'Game':
        return <GameServer id={selectedGame.id} admin={selectedGame.isUserGame} />;
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
          {(games && games.length === 0 && myGames && myGames.length === 0) ? (
  <CustomText style={styles.noGamesText}>No games found</CustomText>
) : (
  <View style={styles.gamesColumn}>
    {Array.isArray(games) && games.map((game) => (
      <TouchableOpacity key={game.id} style={styles.gameItem} onPress={() => {
         navigate(`/dashboard/gameServer/${game.id}/${false}`);
    }}>
      <Image  source={imageError ? require('./assets/gamelogo.png') : { uri: game.image_url }} 
                style={styles.gameImage} 
                onError={() => setImageError(true)}  />
        {/* <CustomText style={styles.gameName}>{game.name}</CustomText> */}
      </TouchableOpacity>
    ))}
    {Array.isArray(myGames) && myGames.map((game) => (
      <TouchableOpacity key={game.id} style={styles.gameItem}     onPress={() => {
         navigate(`/dashboard/gameServer/${game.id}/${true}`);
    }}>
      <Image  source={imageError ? require('./assets/gamelogo.png') : { uri: game.image_url }} 
                style={styles.gameImage} 
                onError={() => setImageError(true)}  />
        {/* <CustomText style={styles.gameName}>{game.name}</CustomText> */}
      </TouchableOpacity>
    ))}
  </View>
)}

          </View>
        </Pressable>
      </Animated.View>
      
      {/* Main content area where selected pages will be rendered */}
      <View style={styles.mainContent}>
      {outlet ? (
          outlet
        ) : (
          <Image source={require('./assets/logo.png')} resizeMode="contain" style={styles.logo} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gamesColumn: {
    width: '100',
    right: 20,
  },
  noGamesText: {
    fontSize: 15,
    color: 'white',
    top: '40%',
},
gameItem: {
    width: 120, 
    alignItems: 'center',
    flexDirection: 'row', // This makes the container a row (horizontal direction)
    justifyContent: 'center',
    marginBottom: 30, 
},
gameImage: {
    width: 50,
    height: 50,
    marginRight: 10,
    borderRadius: '50%',
    resizeMode: 'cover',
    backgroundColor: '#CE55F2', 
},
gameName: {
    marginTop: 5,
    fontSize: 20,
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
},
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  menuButton: {
    position: 'fixed',
    backgroundColor: 'transparent',
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