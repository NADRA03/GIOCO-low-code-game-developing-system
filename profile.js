import React from 'react';
import { View, StyleSheet, Text, ScrollView}  from 'react-native';
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
export default function Profile() {
  
const [profileData, setProfileData] = useState({ username: '', profile_image: '', id: 0 })
const [plays, setPlays] = useState({ played: 0})
const [drawAssets, setDrawAssets] = useState([]); 
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
          file.name.startsWith(profileData.id)
        );

        if (userImage) {
          const url = await getDownloadURL(userImage);
          setImageSource({ uri: url });
        }
      } catch (error) {
        console.error('Error fetching image:', error);
        setImageSource(require('./assets/user.svg'));
      }
    };

    fetchImage();
}, [profileData.id]);

const handleImageError = () => {
  return require('./assets/plays.png');
};

const handleBackPress = () => {
    navigate('/home'); 
  };

  const handleSettingPress = () => {
    navigate('/settings'); 
  };

  const handleEditPress = () => {
    navigate('/editProfile'); 
  };

const handleButtonPress = (button) => {
    setSelectedButton(button); 
    if (button === 'button2') {
      fetchUserGames(); 
    }
  };

  useEffect(() => {
    fetchDrawAssets();
  }, [profileData.id]);


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
      const response = await axios.get(API_ENDPOINTS.profile, { withCredentials: true }); 
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
      const userPlaysUrl = API_ENDPOINTS.user_plays(profileData.id); 
      const response = await axios.get(userPlaysUrl);
      setPlays({ played: response.data.plays });  
    } catch (error) {
      console.error('Error fetching user plays:', error);
    }
  };

  if (profileData.id) {
    fetchUserPlays();  
  }
}, [profileData.id]);

const fetchUserGames = async () => {
  try {
    const response = await axios.get(API_ENDPOINTS.user_games(profileData.id), { withCredentials: true });
    if (response?.data?.games) {
      setGames(response.data.games);
    } else {
      setGames([]); 
    }
  } catch {
    setGames([]);
  }
};

const fetchDrawAssets = async () => {
  try {
    const response = await axios.get(API_ENDPOINTS.get_draws(profileData.id));

    if (response.data && response.data.length > 0) {
      const assetsWithUrls = await Promise.all(
        response.data.map(async (asset) => {
          let assetPath = asset.image || asset.sound;
          assetPath = decodeURIComponent(assetPath);
          assetPath = assetPath.replace(/%2F/g, '/');
          const assetDetails = {
            id: asset.id,
            name: asset.name,
            type: asset.image ? 'image' : 'sound',
          };

          try {
            const assetRef = ref(storage, assetPath);
            const url = await getDownloadURL(assetRef);
            assetDetails.url = url; 
          } catch (firebaseError) {
            assetDetails.url = null; 
          }

          return assetDetails;
        })
      );

      // Filter out assets with null URLs
      setDrawAssets(assetsWithUrls.filter(asset => asset.url !== null));
    } else {
      setDrawAssets(null); // Set null to indicate no assets
    }
  } catch (error) {
    console.error('Error fetching draw assets:', error);
  }
};

const deleteAsset = async (assetId) => {
  try {
      const response = await axios.delete(API_ENDPOINTS.delete_asset(assetId));
      if (response.data.message === 'Asset deleted successfully.') {
          console.log('Asset deleted successfully.');
      } else {
          console.error('Error deleting asset:', response.data.message);
          alert('Error deleting asset.');
      }
  } catch (error) {
      console.error('Error deleting asset:', error);
      alert('Error deleting asset.');
  }
};



  return (
    <View style={styles.container}>
         <TouchableOpacity style={styles.setButton} onPress={handleSettingPress}>
    <CustomText style={styles.setButtonText}>⋯</CustomText>
  </TouchableOpacity>
     <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
              <CustomText style={styles.backButtonText}>&lt;</CustomText>
     </TouchableOpacity>

     <View style={styles.winsContainer}>
      <Image
        source={require('./assets/cup.gif')} 
        style={styles.winsImage}
        />
        <CustomText style={styles.wins}>{allProfileData.wins}</CustomText>
     </View>


     <TouchableOpacity style={styles.editContainer} onPress={handleEditPress}>
      <Image
        source={require('./assets/edit.png')} 
        style={styles.editImage}
        />
     </TouchableOpacity>


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
          <>
          <View style={styles.assetsContainer}>
  { drawAssets && drawAssets.length === 0 ? (
    <CustomText style={styles.noAssetsText}>No draws available</CustomText>
  ) : (
    <ScrollView contentContainerStyle={styles.assetsContainer}>
      {drawAssets && drawAssets.map((asset) => (
        <View key={asset.id} style={styles.assetItem}>
          {asset.type === 'image' ? (
            <Image source={{ uri: asset.url }} style={styles.image} />
          ) : (
            <CustomText>{asset.name}</CustomText>
          )}
          {/* Delete Button */}
          <TouchableOpacity
            onPress={() => deleteAsset(asset.id)}
            style={styles.deleteButton}
          >
            <CustomText style={styles.deleteButtonText}>Delete</CustomText>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  )}
</View>
    </>
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
                    <View style={styles.infoContainer}>
                    {/* <CustomText style={styles.gameStats}>Plays {item.plays}</CustomText>
                    <CustomText style={styles.gameStats}>Likes {item.likes}</CustomText> */}
                    </View>
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
  infoContainer: {
  },
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
        width: 50, 
        height: 50,
        backgroundColor: 'rgba(80, 80, 80, 0.5)',
        borderRadius: 75,
        marginRight: 16, // Space between image and text
        resizeMode: 'cover', 
      },
      gameItem: {
        width: '100%',
        flexDirection: 'row', // Align items horizontally
        alignItems: 'center', // Center vertically
        padding: 10, // Optional: Add spacing around each item
      },
      textContainer: {
        flex: 1, // Allow text to take up remaining space
      },
      gameName: {
        fontSize: 20,
        fontWeight: 'bold', // Space between name and stats
      },
      gameStats: {
        fontSize: 15,
        marginBottom: 5,
        color: '#262626', 
      },
      assetsContainer: {
        padding: 16,
      },
      sectionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
      },
      additionalStyle: {
        marginBottom: 16,
      },
      noAssetsText: {
        fontSize: 18,
        color: 'gray',
      },
      assetsContainer: {
        paddingVertical: 10,
      },
      assetItem: {
        marginBottom: 15,
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#262626',
      },
      image: {
        width: 100,
        height: 100,
        borderRadius: 8,
        marginBottom: 10,
      },
      vipIconContainer: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: 'red',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 5,
      },
      vipIconText: {
        color: 'white',
        fontSize: 10,
      },
      deleteButton: {
        marginTop: 10,
        backgroundColor: 'transparent',
        paddingVertical: 8,
        alignItems: 'center',
      },
      deleteButtonText: {
        color: 'rgba(255, 0, 0, 1)',
        fontSize: 20,
        textDecorationLine: 'underline',
        textAlign: 'center',
      },

});
