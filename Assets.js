import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Image, StyleSheet, ScrollView, ActivityIndicator, TextInput, } from 'react-native';
import { storage } from './firebaseConfig';
import { ref, listAll, getDownloadURL } from 'firebase/storage';
import CustomText from './CustomText';
import axios from 'axios';
import API_ENDPOINTS from './api';
import { useNavigate} from 'react-router-native';
import ImageViewer from 'react-native-image-zoom-viewer'

const Assets = ({ id }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [enemyAssets, setEnemyAssets] = useState([]);
    const [heroAssets, setHeroAssets] = useState([]);
    const [moreAssets, setMoreAssets] = useState([]);
    const [lastAssets, setLastCollectedAssets] = useState([]);
    const [gameId, setGameId] = useState(null);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [loading, setLoading] = useState(true); // Loading state
    const navigate = useNavigate();
    const [user_id, setUserId] = useState(null);
    const [allProfileData, setAllProfileData] = useState(null);
    const [isCollected, setIsCollected] = useState(false);
    const [reload, setReload] = useState(false);
    useEffect(() => {
        async function fetchAllProfileData() {
            try {
                const response = await axios.get(API_ENDPOINTS.all_profile, {
                    withCredentials: true
                });
                setAllProfileData(response.data.user);
                setUserId(response.data.id); // Extract and set user_id
            } catch (error) {
                console.error('Error fetching profile data:', error);
            }
        }
        fetchAllProfileData();
    }, []);

    

    useEffect(() => {
        setGameId(id); 
    }, []);

    useEffect(() => {
        const fetchAssets = async () => {
          try {
            const lastAssetsResponse = await axios.get(API_ENDPOINTS.get_last_10_assets_for_user(user_id));
            
            const lastAssets = await Promise.all(
              lastAssetsResponse.data.assets.map(async (asset) => {
                let assetPath = asset.image || asset.sound;
                assetPath = decodeURIComponent(assetPath);  // Decode URL-encoded characters
                assetPath = assetPath.replace(/%2F/g, '/'); // Replace URL encoding
    
                const assetRef = ref(storage, assetPath);  // Firebase Storage reference
                const url = await getDownloadURL(assetRef); // Get the download URL for the asset
    
                return {
                  id: asset.id,
                  name: asset.name,
                  url,  // Use the resolved Firebase URL
                  type: asset.image ? 'image' : 'sound',
                };
              })
            );
    
            // Update the state with resolved asset URLs
            setLastCollectedAssets(lastAssets);
          } catch (error) {
            console.error('Error fetching assets:', error);
          } 
        };
    
        fetchAssets(); // Call the function to fetch assets
      }); 
    

      const fetchAssets = async () => {
        setLoading(true); // Set loading to true before fetching assets
    
        try {
          // Fetch the last 10 assets from the API
    
          // References to enemy, hero, and more directories in Firebase Storage
          const enemyRef = ref(storage, 'defaults/enemy');
          const heroRef = ref(storage, 'defaults/hero');
          const moreRef = ref(storage, 'defaults/more');
    
          // Fetching enemy assets (limited to 5)
          const enemyList = await listAll(enemyRef);
          const enemyUrls = await Promise.all(
            enemyList.items.slice(0, 6).map(async (item) => {
              const url = await getDownloadURL(item);
              return { name: item.name, url };
            })
          );
          setEnemyAssets(enemyUrls);
    
          // Fetching hero assets (limited to 5)
          const heroList = await listAll(heroRef);
          const heroUrls = await Promise.all(
            heroList.items.slice(0, 5).map(async (item) => {
              const url = await getDownloadURL(item);
              return { name: item.name, url };
            })
          );
          setHeroAssets(heroUrls);
    
          // Fetching more assets (limited to 5)
          const moreList = await listAll(moreRef);
          const moreUrls = await Promise.all(
            moreList.items.slice(0, 10).map(async (item) => {
              const url = await getDownloadURL(item);
              return { name: item.name, url };
            })
          );
          setMoreAssets(moreUrls);
    
          // Check if any assets have been loaded
          if (enemyUrls.length > 0 || heroUrls.length > 0 || moreUrls.length > 0) {
            setLoading(false); // Set loading to false after at least one asset is fetched
          } else {
            setLoading(true); // Keep loading if no assets found
          }
        } catch (error) {
          console.error('Error fetching assets:', error);
          setLoading(false); // Set loading to false if an error occurs
        }
      };
    
      useEffect(() => {
        fetchAssets();
      }, []);
    
      const handleCollectAsset = async (asset) => {
        try {
          // Extract the file name and folder from the asset URL
          const assetUrlParts = asset.url.split('/');
          const fileNameWithParams = assetUrlParts.pop();
          const folderName = assetUrlParts.pop();
    
          const [fileName] = fileNameWithParams.split('?');
    
          const assetExtension = fileName.split('.').pop().toLowerCase();
          let image = null;
          let sound = null;
    
          if (['png', 'jpg', 'jpeg'].includes(assetExtension)) {
            image = `${folderName}/${fileName}`;
            image = image.replace(/^o\//, '');
            image = image.replace(/~2F/g, '/');
          } else if (['mp3', 'wav'].includes(assetExtension)) {
            sound = `${folderName}/${fileName}`;
            sound = sound.replace(/^o\//, '');
            sound = sound.replace(/~2F/g, '/');
          }
    
          // Send a POST request to the server to add the asset
          const response = await axios.post(API_ENDPOINTS.add_asset, {
            name: asset.name.split('.').slice(0, -1).join('.'),
            user_id: user_id,
            image: image,
            sound: sound,
            game_id: gameId,
          });
    
          if (response.data.message === 'Asset added successfully.') {
            console.log('Asset added successfully!');
            setIsCollected(true);  // Update the state indicating the asset was collected
            setEnemyAssets([]); // Clear current assets
            setHeroAssets([]);
            setMoreAssets([]);
            fetchAssets(); // Fetch updated assets after collection
          } else {
            console.log('Error adding asset:', response.data.message);
            alert('Error adding asset.');
          }
        } catch (error) {
          console.error('Error collecting asset:', error);
          alert('Error collecting asset.');
        }
      };


    // Handle asset selection
    const handleSelectAsset = (asset) => {
        setSelectedAsset(asset);
    };

    const handleDeselectAsset = () => {
      setSelectedAsset(null);
  };

  const checkIfAssetCollected = async (selectedAsset) => {
    try {
        // Step 1: Extract parts of the URL
        const assetUrlParts = selectedAsset.url.split('/'); // Split the URL by '/'
        const fileNameWithParams = assetUrlParts.pop(); // Get the last part (file name + query params)
        const folderName = assetUrlParts.pop(); // Get the folder name (second last part)
        
        // Step 2: Separate file name from query parameters
        const [fileName] = fileNameWithParams.split('?');

        // Step 3: Get the file extension
        const assetExtension = fileName.split('.').pop().toLowerCase(); // Extract extension (e.g., png, mp3, etc.)

        // Step 4: Create the asset identifier (if needed)
        let assetIdentifier = `${folderName}/${fileName}`;
        assetIdentifier = assetIdentifier.replace(/^o\//, '');
        console.log(assetIdentifier);

        // Step 5: Use the extracted folder and file details
        console.log('Folder:', folderName);
        console.log('File Name:', fileName);
        console.log('Extension:', assetExtension);
        console.log('Asset Identifier:', assetIdentifier);

        // Step 6: Make the API call
        const response = await axios.post(API_ENDPOINTS.check_user_collected_asset, {
            user_id: user_id,
            asset_url: assetIdentifier, // Pass the extracted identifier
            game_id: gameId,
        });

        // Step 7: Update the state with the result
        setIsCollected(response.data.collected);
    } catch (error) {
        console.error('Error checking asset collection status:', error);
        alert('Unable to check asset status.');
    }
};

useEffect(() => {
    if (selectedAsset) {
        checkIfAssetCollected(selectedAsset);
    }
}, [selectedAsset]);

const filterAssets = (assets) => {
    return assets.filter((asset) => asset.name.toLowerCase().includes(searchQuery.toLowerCase()));
};

const handleSearch = (text) => {
    setSearchQuery(text);
};

    return (
            <View style={styles.container}>
            <CustomText style={styles.Title}>Assets</CustomText>
            {/* Search Bar */}
            <TextInput
                style={styles.searchBar}
                placeholder="Search assets..."
                placeholderTextColor="#AAA"
                value={searchQuery}
                onChangeText={handleSearch}
            />
            <ScrollView contentContainerStyle={styles.scrollView}>
            {/* Only show loaded assets and remove loading message */}
            {loading ? (
            <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" style={styles.loadingImage} />
            <CustomText style={styles.loadingText}>Loading assets...</CustomText>
            </View>
            ) : (
            <>   
            {/* Last Collected Assets Section */}
            <CustomText style={[styles.sectionTitle, styles.additionalStyle]}>Recents</CustomText>
            {lastAssets.length === 0 ? (
            <CustomText style={styles.noAssetsText}>no recents</CustomText>  // Fallback message if no assets
            ) : (
            <ScrollView horizontal contentContainerStyle={styles.assetsContainer}>
            {filterAssets(lastAssets).map((asset) => (
            <TouchableOpacity key={asset.id} onPress={() => handleSelectAsset(asset)} style={styles.imageContainer}>
                <Image source={{ uri: asset.url }} style={styles.image} />
                {asset.url.includes('$') && (
                    <View style={styles.vipIconContainer}>
                        <CustomText style={styles.vipIconText}>VIP</CustomText>
                    </View>
                )}
            </TouchableOpacity>
            ))}
            </ScrollView>
            )}

            {/* Enemies Section */}
            <CustomText style={styles.sectionTitle}>Enemy</CustomText>
            <ScrollView horizontal contentContainerStyle={styles.assetsContainer}>
                {filterAssets(enemyAssets).map((asset) => (
                    <TouchableOpacity key={asset.name} onPress={() => handleSelectAsset(asset)} style={styles.imageContainer}>
                        <Image source={{ uri: asset.url }} style={styles.image} />
                        {asset.url.includes('$') && (
                            <View style={styles.vipIconContainer}>
                                <CustomText style={styles.vipIconText}>VIP</CustomText>
                            </View>
                        )}
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Heroes Section */}
            <CustomText style={styles.sectionTitle}>Hero</CustomText>
            <ScrollView horizontal contentContainerStyle={styles.assetsContainer}>
                {filterAssets(heroAssets).map((asset) => (
                    <TouchableOpacity key={asset.name} onPress={() => handleSelectAsset(asset)} style={styles.imageContainer}>
                        <Image source={{ uri: asset.url }} style={styles.image} />
                        {asset.url.includes('$') && (
                            <View style={styles.vipIconContainer}>
                                <CustomText style={styles.vipIconText}>VIP</CustomText>
                            </View>
                        )}
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* More Assets Section */}
            <CustomText style={styles.sectionTitle}>More</CustomText>
            {moreAssets.length > 0 && (
                <>
                    {/* First Row (Up to 5 assets) */}
                    <ScrollView horizontal contentContainerStyle={styles.assetsContainer}>
                        {filterAssets(moreAssets.slice(0, 5)).map((asset) => (
                            <TouchableOpacity key={asset.name} onPress={() => handleSelectAsset(asset)} style={styles.imageContainer}>
                                <Image source={{ uri: asset.url }} style={styles.image} />
                                {asset.url.includes('$') && (
                                    <View style={styles.vipIconContainer}>
                                        <CustomText style={styles.vipIconText}>VIP</CustomText>
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Second Row (Next 5 assets) */}
                    <ScrollView horizontal contentContainerStyle={styles.assetsContainer}>
                        {filterAssets(moreAssets.slice(5, 10)).map((asset) => (
                            <TouchableOpacity key={asset.name} onPress={() => handleSelectAsset(asset)} style={styles.imageContainer}>
                                <Image source={{ uri: asset.url }} style={styles.image} />
                                {asset.url.includes('$') && (
                                    <View style={styles.vipIconContainer}>
                                        <CustomText style={styles.vipIconText}>VIP</CustomText>
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </>
            )}
        </>
    )}
    </ScrollView>
{(enemyAssets.length > 0 || heroAssets.length > 0 || moreAssets.length > 0) && selectedAsset && (
    <View style={styles.selectedAssetContainer}>
        <TouchableOpacity onPress={handleDeselectAsset} style={styles.closeButton}>
            <CustomText style={styles.closeButtonText}>X</CustomText>
        </TouchableOpacity>
        <Image source={{ uri: selectedAsset.url }} style={styles.selectedImage} />
        {selectedAsset.url.includes('$') && (
            <View style={styles.vipIconContainer2}>
                <CustomText style={styles.vipIconText2}>VIP</CustomText>
            </View>
        )}
        <TouchableOpacity
        onPress={() => { handleCollectAsset(selectedAsset); }}
        style={[
        styles.collectButton,
        (selectedAsset.url.includes('$') || isCollected) && styles.disabledButton,
        ]}
        disabled={selectedAsset.url.includes('$') || isCollected}
        >
        <CustomText style={styles.collectButtonText}>
        {selectedAsset.url.includes('$')
            ? 'Asset Locked'
            : isCollected
            ? 'Asset Already Collected'
            : 'Collect Asset'}
        </CustomText>
        </TouchableOpacity>
    </View>
)}
</View>
);
};

const styles = StyleSheet.create({
    searchBar: {
        fontFamily:"Minecraft Regular",
        marginTop: 50,
        backgroundColor: '#333',
        color: '#FFF',
        padding: 10,
        width: '100%'
    },
    noAssetsText:{
    color: 'rgba(255, 0, 0, 0.7)',
    textAlign: 'center',
    fontSize: 15,
    marginTop: 10,
    },
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    scrollView: {
        paddingBottom: 20,
    },
    Title: {
        fontSize: 30,
        // marginTop: 40,
        marginVertical: 0,
        textAlign: 'center',
        color: '#FFFFFF',
    },
    sectionTitle: {
        fontSize: 20,
        marginLeft: 20,
        marginVertical: 20,
        textAlign: 'left',
        color: '#FFFFFF',
    },
    additionalStyle: {
    marginTop: 30,
    },
    assetsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 10,
        // backgroundColor: 'rgba(80, 80, 80, 0.5)',
    },
    image: {
        backgroundColor: 'rgba(80, 80, 80, 0.5)',
        width: 60,
        height: 60,
        margin: 10,
        resizeMode: 'contain',
    },
    selectedAssetContainer: {
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#505050', 
        paddingTop: 10,
        margin: 0, 
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        marginTop: 50,
    },
    loadingText: {
        marginTop: 10,
        color: '#FFFFFF',
        fontSize: 18,
    },
    selectedImage: {
        width: 200,
        height: 200,
        resizeMode: 'contain',
        backgroundColor: '#505050',
    },
    closeButton: {
      position: 'absolute',
      top: 7,
      right: 7,
      borderRadius: 15,
      padding: 5,
      zIndex: 1,
  },
  closeButtonText: {
      color: '#000000',
      fontSize: 24,
  },
  collectButton: {
    marginTop: 10,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  disabledButton: {
    width: 'auto',
    borderRadius: 0,
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
  },
  collectButtonText: {
    color: '#000000',
    fontSize: 24,
  },
  imageContainer: {
    position: 'relative',
},
vipIconContainer: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(255, 215, 0, 0.5)', 
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 2,
},
vipIconText: {
    color: '#000000',
    fontSize: 8,
    fontWeight: 'bold',
},
vipIconContainer2: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 215, 0, 0.5)', 
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 2,
},
vipIconText2: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
},
});

export default Assets;


