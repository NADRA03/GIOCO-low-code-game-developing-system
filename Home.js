import React, { useRef } from 'react';
import { View, StyleSheet, Animated, Easing, ScrollView} from 'react-native';
import { Image } from 'expo-image';
import { TouchableOpacity } from 'react-native';
import CustomText from './CustomText';
import axios from 'axios';
import FontLoader from './FontLoader';
import API_ENDPOINTS from './api';
import { useEffect, useState } from 'react';
import useProfile from './get_session';
import { useNavigate } from 'react-router-native';

export default function Home() {
const { imageSource, handleImageError } = useProfile();
const [selectedGame, setSelectedGame] = useState(null);
const [profileData, setProfileData] = useState({ username: '', profile_image: '' })
const navigate = useNavigate();
const moveAnim = new Animated.Value(0);
const [topGames, setTopGames] = useState([]);
const [loading, setLoading] = useState(false);


useEffect(() => {
  const fetchProfileData = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.profile, { withCredentials: true }); 
      setProfileData(response.data); 
    } catch (error) {
      console.error('Error fetching profile data:', error);
      alert('Failed to fetch profile information.');
    }
  };

  fetchProfileData();
}, []);

const handleSelectGame = (game) => {
  setSelectedGame(game);
};

const handleCloseBox = () => {
  setSelectedGame(null);
  setLoading(false);
};

const handleJoinGame = async () => { 
  if (!selectedGame || !selectedGame.id) {
    alert("No game selected");
    return;
  }

  const gameId = selectedGame.id; // Get the gameId from the selected game
  setLoading(true);

  try {
    const response = await axios.post(API_ENDPOINTS.join_game(gameId), {}, { withCredentials: true });
    navigate(`/dashboard/gameServer/${gameId}/${false}`); 
  } catch (error) {
    setLoading(false);
    console.error('Error joining game:', error);
    alert('Error joining the game');
  }

  setLoading(false);
};

const handlePlay = async () => { 
  if (!selectedGame || !selectedGame.id) {
    alert("No game selected");
    return;
  }

  const gameId = selectedGame.id; // Get the gameId from the selected game
  setLoading(true);

  try {
    const response = await axios.post(API_ENDPOINTS.join_game(gameId), {}, { withCredentials: true });
      navigate(`/runGame?id=${gameId}`); 
  } catch (error) {
    setLoading(false);
    console.error('Error joining game:', error);
    alert('Error joining the game');
  }

  setLoading(false);
};



useEffect(() => {
  const moveWitch = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(moveAnim, {
          toValue: 1, 
          duration: 5000, 
          easing: Easing.linear,
          useNativeDriver: true, 
        }),
        Animated.delay(10000),
      ])
    ).start();
  };

  moveWitch(); 

  return () => moveAnim.stopAnimation();
}, [moveAnim]);


const translateX = moveAnim.interpolate({
  inputRange: [0, 1],
  outputRange: [-100, 650], 
});

const handleProfilePress = () => {
  navigate('/profile'); 
};
const handleCraftPress = () => {
        navigate('/select'); 
      };
const handleGamePress = () => {
        navigate('/game'); 
      };
const handleAProfilePress = () => {
        navigate('/game'); 
      };
const handleSearchPress = () => {
        navigate('/search'); 
      };
const handleMapGamePress = () => {
        navigate('/runGame?id=default'); 
      };
const handleDashboardPress = () => {
        navigate('/dashboard'); 
      };

useEffect(() => {
        const fetchTopGames = async () => {
            try {
                const response = await axios.get(API_ENDPOINTS.top_10_most_liked_games);
                setTopGames(response.data);
            } catch (error) {
                console.error('Error fetching top games:', error);
            }
        };
    
        fetchTopGames();
}, []);

const [imageError, setImageError] = useState(false);
    
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.profileContainer} onPress={handleProfilePress}>
      <Image
          source={imageSource || handleImageError()} 
          style={styles.profileImage}
          onError={handleImageError} 
        />
        <CustomText style={styles.username}>{profileData.username}</CustomText>
      </TouchableOpacity>
      {/* <TouchableOpacity style={styles.profileButton} onPress={handleAProfilePress}>
          <CustomText style={styles.profileButtonText}>Check this Profile!</CustomText>
      </TouchableOpacity> */}
      <TouchableOpacity style={styles.logoContainer}>
      <Image
        source={require('./assets/logo.png')} 
          style={styles.logoImage}
        />
      </TouchableOpacity>
      {/* <View>
        <Animated.Image
          source={require('./assets/witch.gif')}
          style={[{ transform: [{ translateX }] }, styles.witchImage]}
        />
      </View> */}
      <TouchableOpacity style={styles.searchContainer} onPress={handleSearchPress}>
      <Image
        source={require('./assets/search.png')} 
          style={styles.searchImage}
        />
      </TouchableOpacity>
      <TouchableOpacity style={styles.craftButton} onPress={handleCraftPress}>
      <Image
        source={require('./assets/edit.png')} 
          style={styles.editImage}
        />
      </TouchableOpacity>
      <TouchableOpacity style={styles.dashboardButton} onPress={handleDashboardPress}>
      <CustomText style={styles.dashboardButtonText}>Dashboard</CustomText>
      </TouchableOpacity>

      <View style={styles.sectionContainer}>
        {/* First Container */}
        <View style={styles.section}>
          <CustomText style={styles.title}>Recommended For You</CustomText>
          {/* Add content for user search here */}
          {topGames.length === 0 ? (
        <CustomText style={styles.noGamesText}>No recommended games</CustomText>
    ) : (
        <ScrollView horizontal contentContainerStyle={styles.gamesContainer} showsHorizontalScrollIndicator={false}>
            {topGames.map((game) => (
                <TouchableOpacity key={game.id} onPress={() => handleSelectGame(game)} style={styles.gameItem}>
                    <Image  source={imageError ? require('./assets/gamelogo.png') : { uri: game.image_url }} 
                style={styles.gameImage} 
                onError={() => setImageError(true)}  />
                    <CustomText style={styles.gameName}>{game.name}</CustomText>
                </TouchableOpacity>
            ))}
        </ScrollView>
    )}
          <TouchableOpacity style={styles.gameButton} onPress={handleMapGamePress}>
          <CustomText style={styles.gameButtonText}>Try This Game!</CustomText>
        </TouchableOpacity>
        </View>

        {/* Second Container */}
        <View style={styles.section}>
          <CustomText style={styles.title}>Continue</CustomText>
          {/* Add content for game search here */}
        </View>

        {/* Third Container */}
        <View style={styles.section}>
          <CustomText style={styles.title}>Explore</CustomText>
          <ScrollView horizontal contentContainerStyle={styles.gamesContainer}     showsHorizontalScrollIndicator={false}>
            {topGames.map((game) => (
                <TouchableOpacity key={game.id} onPress={() => handleSelectGame(game)} style={styles.gameItem}>
                    <Image  source={imageError ? require('./assets/gamelogo.png') : { uri: game.image_url }} 
                style={styles.gameImage} 
                onError={() => setImageError(true)}  />
                    <CustomText style={styles.gameName}>{game.name}</CustomText>
                </TouchableOpacity>
            ))}
        </ScrollView>
        </View>
      </View>
      {/* <TouchableOpacity style={styles.gameButton} onPress={handleGamePress}>
      <CustomText style={styles.gameButtonText}>Game</CustomText>
      </TouchableOpacity> */}

      <View>
      {/* <Animated.View
        style={[
          styles.gameButtonContainer,
          {
            transform: [{ translateY: animationValue }],
          },
        ]}
      > */}
      {/* </Animated.View> */}
    </View>

    {selectedGame && (
  <View style={styles.boxContainer}>
    <TouchableOpacity style={styles.closeButton} onPress={handleCloseBox}>
      <CustomText style={styles.closeText}>X</CustomText>
    </TouchableOpacity>

    <Image  source={imageError ? require('./assets/gamelogo.png') : { uri: selectedGame.image_url }} 
                style={styles.gameImageBox} 
                onError={() => setImageError(true)}  />

    <CustomText style={styles.gameTitle}>{selectedGame.name}</CustomText>

    <View style={styles.buttonContainer}>
      <TouchableOpacity style={styles.serverButton} onPress={handleJoinGame} disabled={loading}>
        <CustomText style={styles.buttonText}>{loading ? 'joining..' : 'server'}</CustomText>
      </TouchableOpacity>

      <TouchableOpacity style={styles.playButton} onPress={handlePlay}>
      <CustomText style={styles.playButtonText}>&#124;&gt;</CustomText>
      </TouchableOpacity>
    </View>
  </View>
)}
    </View>

    
  );
}

const styles = StyleSheet.create({
  boxContainer: {
    position: 'absolute',
    top: '40%',
    left: '10%',
    right: '10%',
    backgroundColor: 'rgba(100, 65, 165, 0.7)',
    padding: 10,
    alignItems: 'center',
  },
  gameImageBox: {
    width: 70,
    height: 70,
    borderRadius: '50%',
    resizeMode: 'cover',
    backgroundColor: '#CE55F2', // Placeholder background
},
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
  },
  gameTitle: {
    marginTop: 20,
    fontSize: 20,
    marginBottom: 20,
    color: 'white',
  },
  closeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  serverButton: {
    // backgroundColor: '#007BFF',
    padding: 10,
    marginTop: 12,
  },
  playButton: {
    // backgroundColor: '#28A745',
    padding: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  playButtonText: {
    color: '#28A745',
    fontWeight: 'bold',
    fontSize: 30,
  },
  noGamesText: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
},
gamesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 10,
},
gameItem: {
    width: 120, 
    marginRight: 15,
    alignItems: 'center',
},
gameImage: {
    width: 50,
    height: 50,
    borderRadius: '50%',
    resizeMode: 'cover',
    backgroundColor: '#CE55F2', // Placeholder background
},
gameName: {
    marginTop: 5,
    fontSize: 15,
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
},
  profileButton: {
    position: 'absolute',
    backgroundColor: 'transparent',
    top: 110, 
    zIndex: 1000,
  },
  profileButtonText: {
    color: '#CE55F2',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    paddingLeft: 10,
    marginLeft: 120,
  },
  profileContainer: {
    position: 'absolute',
    top: 70,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    backgroundColor: '#CE55F2',
  },
  witchImage: {
    position: 'absolute',
    width: 90,
    height: 90,
    left: -200,
    top: 140,
  },
  searchContainer: {
    position: 'absolute',
    bottom: 20,
    right: 90,
    backgroundColor: 'transparent',
    padding: 10,
    borderRadius: 5,
  },
  searchImage: {
    resizeMode: 'contain',
    width: 25,
    height: 25,
  },
  editImage: {
    resizeMode: 'contain',
    width: 25,
    height: 25,
  },
  logoContainer: {
    position: 'absolute',
    top: 40,
    left: 165,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    resizeMode: 'contain',
    width: 40,
    height: 40,
    opacity: 0.5,
  },
  username: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
    container: {
      flex: 1,
      backgroundColor: '#000000',
    },
    text: {
      fontSize: 20,
      color: '#FFFFFF',
    },
    craftButton: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      backgroundColor: 'transparent',
      padding: 10,
      borderRadius: 5,
    },
    craftButtonText: {
      color: '#f1f1f1',
      textAlign: 'center',
      textDecorationLine: 'underline',
      fontSize: 16,
      fontWeight: 'bold',
    },
    dashboardButton: {
      position: 'absolute',
      bottom: 20,
      left: 20,
      backgroundColor: 'transparent',
      padding: 10,
      borderRadius: 5,
    },
    dashboardButtonText: {
      color: '#f1f1f1',
      textAlign: 'center',
      fontSize: 16,
      fontWeight: 'bold',
    },
    gameButton: {
      position: 'absolute',
      backgroundColor: 'transparent',
      top: 440, 
    },
    gameButtonText: {
      color: 'white',
      textAlign: 'center',
      fontSize: 16,
      fontWeight: 'bold',
      paddingLeft: 10,
      marginLeft: 0,
    },
    sectionContainer: {
      position: 'absolute',
      flex: 1,
      backgroundColor: '#000000',
      top: 250,
      width: '100%',
    },
    section: {
      marginLeft: 0,
      marginBottom: 20,
      height: 130,
      width: '100%',
      backgroundColor: 'rgba(80, 80, 80, 0.5)',
    },
    title: {
      padding: 10,
      fontSize: 15,
      color: 'white',
      fontFamily: 'Minecraft Regular',
    },
  
});
