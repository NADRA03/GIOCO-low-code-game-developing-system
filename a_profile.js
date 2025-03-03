import React from 'react';
import { View, StyleSheet, Text}  from 'react-native';
import { Image } from 'expo-image';
import { TouchableOpacity, FlatList  } from 'react-native';
import CustomText from './CustomText';
import axios from 'axios';
import FontLoader from './FontLoader';
import API_ENDPOINTS from './api';
import { useEffect, useState } from 'react';
import { storage } from './firebaseConfig';
import { ref, listAll, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-native';
import { useParams } from 'react-router-dom';

export default function A_Profile() {
const [profileData, setProfileData] = useState({ username: '', profile_image: '', id: 0 })
const [plays, setPlays] = useState({ played: 0})
const { id } = useParams();
const [imageUri, setImageUri] = useState(null);
const navigate = useNavigate();
const [selectedButton, setSelectedButton] = useState('button1'); 
const [allProfileData, setAllProfileData] = useState({ username: '', profile_image: '', wins: 0 });
const [games, setGames] = useState([]);
const [imageSource, setImageSource] = useState(null);
useEffect(() => {
    const fetchImage = async () => {
      try {
        const folderRef = ref(storage, `profile_pictures/`);
        const files = await listAll(folderRef);

        // Filter the files to match userId with any extension
        const userImage = files.items.find((file) =>
          file.name.startsWith(id)
        );

        if (userImage) {
          const url = await getDownloadURL(userImage);
          setImageSource({ uri: url });
        }
      } catch (error) {
        console.error('Error fetching image:', error);
        setImageSource(require('./assets/plays.png'));
      }
    };

    fetchImage();
}, [id]);

const handleImageError = () => {
    return require('./assets/plays.png');
};

const handleBackPress = () => {
    navigate('/home'); 
  };

  const handleSettingPress = () => {
    navigate('/settings'); 
  };

const handleButtonPress = (button) => {
    setSelectedButton(button); 
    if (button === 'button2') {
      fetchUserGames(); 
    }
  };

//all profile data
// useEffect(() => {
//     async function fetchAllProfileData() {
//       try {
//         const response = await axios.get(API_ENDPOINTS.profile_all, {
//           withCredentials: true
//         });
//         setAllProfileData(response.data.user);
//       } catch (error) {
//         console.error('Error fetching profile data:', error);
//       }
//     }
//     fetchAllProfileData();
//   }, []);

//from the session 
useEffect(() => {
  const fetchProfileData = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.a_profile(id), { withCredentials: true }); 
      setProfileData(response.data); 
      setImageUri(response.data.profile_image); 
    } catch (error) {
      console.error('Error fetching profile data:', error);
      alert('Failed to fetch profile information.');
    }
  };
  
  fetchProfileData();
}, []);

useEffect(() => {
  const fetchUserPlays = async () => {
    try {
      const userPlaysUrl = API_ENDPOINTS.user_plays(id); 
      const response = await axios.get(userPlaysUrl);
      setPlays({ played: response.data.plays });  
    } catch (error) {
      console.error('Error fetching user plays:', error);
    }
  };

  if (id) {
    fetchUserPlays();  
  }
}, [id]);

const fetchUserGames = async () => {
  try {
    const response = await axios.get(API_ENDPOINTS.user_games(id), { withCredentials: true });
    setGames(response.data.games);
    if (response?.data?.games) {
      setGames(response.data.games);
    } else {
      setGames([]); 
    }
  } catch {
    setGames([]);
  }
};

  return (
    <View style={styles.container}>
<TouchableOpacity style={styles.backButton} onPress={() => navigate(-1)}>
        <CustomText style={styles.backButtonText}>&lt;</CustomText>
</TouchableOpacity>

     <View style={styles.winsContainer}>
      <Image
        source={require('./assets/cup.gif')} 
        style={styles.winsImage}
        />
        <CustomText style={styles.wins}>{allProfileData.wins}</CustomText>
     </View>

     <View style={styles.playsContainer}>
        <CustomText style={styles.plays}>{plays.played}</CustomText>
     </View>


     <View style={styles.profileContainer}>
     <Image
  source={imageSource || handleImageError()}
  style={styles.profileImage}
  onError={handleImageError}
/>;
        <CustomText style={styles.username}>{profileData.username}</CustomText>
     </View>




    <View style={styles.buttonsContainer}>
    <TouchableOpacity
    style={[
    styles.button,
    selectedButton === 'button1' && styles.selectedButton, 
    ]}
    onPress={() => handleButtonPress('button1')}
    >
    <Image source={require('./assets/folder.png')} style={styles.icon} /> 
    </TouchableOpacity>

    <TouchableOpacity
    style={[
    styles.button,
    selectedButton === 'button2' && styles.selectedButton, 
    ]}
    onPress={() => handleButtonPress('button2')}
    >
    <CustomText style={styles.buttonText}>Crafts</CustomText>
    </TouchableOpacity>
    </View>
     
          <View style={styles.viewContainer}>
        {selectedButton === 'button1' ? (
          <Text style={styles.viewText}>no assets created</Text> 
        ) : (
          <FlatList
            data={games}
            keyExtractor={(item) => item.game_id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => navigate(`/developer/${item.game_id}`)}>
              <View style={styles.gameItem}>
                  <Image 
                    source={item.image ? { uri: item.image } : require('./assets/gamelogo.png')}  // Use default image when `item.image` is null
                    style={styles.gameImage}
                  />
                  <View style={styles.textContainer}>
                    <CustomText style={styles.gameName}>{item.game_name}</CustomText>
                    <CustomText style={styles.gameStats}>Plays: {item.plays}</CustomText>
                    <CustomText style={styles.gameStats}>Likes: {item.likes}</CustomText>
                  </View>
              </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  //back
  backButton: {
    left: 20,
    top: 50,
    width: 110,
    height: 110,
    borderRadius: 5,
  },
  backButtonText: {
        color: '#ffffff',
        fontSize: 35,
  },
  profileContainer: {
    top: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 150, 
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
    resizeMode: 'cover',
    backgroundColor: '#CE55F2', 
  },
  username: {
    fontSize: 28, 
    color: '#ffffff',
    fontWeight: 'bold',
  },
  container: {
      flex: 1,
      padding: 0, 
      margin: 0,
      backgroundColor: '#000000',
    },

    //the down 
    buttonsContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 150,
      },
      button: {
        borderWidth: 0,
        padding: 10,
        borderRadius: 0,
        backgroundColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center',
        width: '30%',
        height: 50,
      },
      selectedButton: {
        backgroundColor: '#CE55F2', 
      },
      buttonText: {
        fontSize: 20, 
        color: '#ffffff',
        fontWeight: 'bold',
      },
      icon: {
        width: 40,
        height: 40,
        resizeMode: 'contain', 
      },
      viewContainer: {
        backgroundColor: '#CE55F2', 
        flex: 1,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'left',
        marginTop: 0,
        paddingTop: 0, 
      },
      viewText: {
        textAlign: 'center',
        fontSize: 18,
        fontFamily: 'Minecraft Regular',
        color: '#ffffff',
      },
      winsContainer: {
        position: 'absolute', // Position absolutely relative to the parent container
        top: 120, // Adjust the distance from the top
        right: 25, // Adjust the distance from the right
        flexDirection: 'row', // Layout the image and text horizontally
        alignItems: 'center', 
      },
      wins: {
        marginLeft: 5, // Add some spacing between the image and text
        fontSize: 20,
        color: '#fff', // Adjust color as needed
      },
      winsImage: {
        width: 50, // Set the desired width
        height: 50, // Set the desired height
        resizeMode: 'contain', // Ensures the image maintains its aspect ratio
      },
      editContainer: {
        position: 'absolute', // Position absolutely relative to the parent container
        top: 185, // Adjust the distance from the top
        right: 25, // Adjust the distance from the right
        flexDirection: 'row', // Layout the image and text horizontally
        alignItems: 'center', 
      },
      editImage: {// Add some spacing between the image and text
        width: 25, // Set the desired width
        height: 25, // Set the desired height
        resizeMode: 'contain', 
      },
      playsContainer: {
        position: 'absolute', // Position absolutely relative to the parent container
        top: 329, // Adjust the distance from the top
        right: 232, // Adjust the distance from the right
        flexDirection: 'row', // Layout the image and text horizontally
        alignItems: 'center', 
        zIndex: 1000,
      },
      plays: {
        marginLeft: 0, // Add some spacing between the image and text
        fontSize: 25,
        color: '#fff', // Adjust color as needed
      },
      playsImage: {
        width: 80, // Set the desired width
        height: 80, // Set the desired height
        resizeMode: 'contain', // Ensures the image maintains its aspect ratio
      },
      setButton: {
        position: 'absolute', 
        top: 15,
        right: -15,
        width: 110,
        height: 110,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
      },
      setButtonText: {
        color: '#ffffff',
        fontSize: 35,
      },
      gameImage: {
        width: 40, 
        height: 40,
        borderRadius: 75,
        marginRight: 10, // Space between image and text
        resizeMode: 'contain', 
      },
      gameItem: {
        width: '100%',
        flexDirection: 'row', // Align items horizontally
        alignItems: 'center', // Center vertically
        padding: 10, // Optional: Add spacing around each item
        borderBottomWidth: 1, 
        borderBottomColor: '#000000',
      },
      textContainer: {
        flex: 1, // Allow text to take up remaining space
      },
      gameName: {
        fontSize: 25,
        fontWeight: 'bold',
        marginBottom: 10, // Space between name and stats
      },
      gameStats: {
        fontSize: 16,
        // color: '#555', 
      },

});
