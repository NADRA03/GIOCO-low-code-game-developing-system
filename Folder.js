import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Image, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { storage } from './firebaseConfig';
import { ref, listAll, getDownloadURL } from 'firebase/storage';
import CustomText from './CustomText';
import axios from 'axios';
import API_ENDPOINTS from './api';
import { useNavigate} from 'react-router-native';

const Folder = ({ id }) => {
    const [lastAssets, setLastCollectedAssets] = useState([]);
    const [gameId, setGameId] = useState(null);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [loading, setLoading] = useState(true); 
    const navigate = useNavigate();
    const [user_id, setUserId] = useState(null);
    const [allProfileData, setAllProfileData] = useState(null);
    const [isCollected, setIsCollected] = useState(false);
    const [reload, setReload] = useState(false);

    useEffect(() => {
        async function fetchAllProfileData() {
            try {
                const response = await axios.get(API_ENDPOINTS.profile_all, {
                    withCredentials: true
                });
                setAllProfileData(response.data.user);
                setUserId(response.data.user.id); 
            } catch (error) {
                console.error('Error fetching profile data:', error);
            }
        }
        fetchAllProfileData();
    }, []);

    
    useEffect(() => {
        setGameId(id); 
    }, []);

    const fetchAssets = async () => {
          try {
            const lastAssetsResponse = await axios.get(API_ENDPOINTS.get_last_10_assets_for_user(user_id));
            
            const lastAssets = await Promise.all(
              lastAssetsResponse.data.assets.map(async (asset) => {
                let assetPath = asset.image || asset.sound;
                assetPath = decodeURIComponent(assetPath);  
                assetPath = assetPath.replace(/%2F/g, '/'); 
    
                const assetRef = ref(storage, assetPath);  
                const url = await getDownloadURL(assetRef); 
    
                return {
                  id: asset.id,
                  name: asset.name,
                  url, 
                  type: asset.image ? 'image' : 'sound',
                };
              })
            );
            setLastCollectedAssets(lastAssets);
          } catch (error) {
            console.error('Error fetching assets:', error);
          } 
        };
    

        const reloading = async () => {
            setLoading(true);
            try {
                await fetchAssets();
                setLoading(false);
            } catch (error) {
                console.error('Error fetching assets:', error);
                setLoading(false);
            }
        };
    
        useEffect(() => {
            if (user_id) {
                reloading();
            }
        }, [user_id]);
    
      const handleCollectAsset = async (asset) => {
        try {
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
    
          const response = await axios.post(API_ENDPOINTS.add_asset, {
            name: asset.name.split('.').slice(0, -1).join('.'),
            user_id: user_id,
            image: image,
            sound: sound,
            game_id: gameId,
          });
    
          if (response.data.message === 'Asset added successfully.') {
            console.log('Asset added successfully!');
            setIsCollected(true);  
            reloading(); 
          } else {
            console.log('Error adding asset:', response.data.message);
            alert('Error adding asset.');
          }
        } catch (error) {
          console.error('Error collecting asset:', error);
          alert('Error collecting asset.');
        }
      };

    const handleSelectAsset = (asset) => {
        setSelectedAsset(asset);
    };

    const handleDeselectAsset = () => {
      setSelectedAsset(null);
  };

  const checkIfAssetCollected = async (selectedAsset) => {
    try {
        const assetUrlParts = selectedAsset.url.split('/'); 
        const fileNameWithParams = assetUrlParts.pop(); 
        const folderName = assetUrlParts.pop(); 
        
        const [fileName] = fileNameWithParams.split('?');

        const assetExtension = fileName.split('.').pop().toLowerCase(); 

        let assetIdentifier = `${folderName}/${fileName}`;
        assetIdentifier = assetIdentifier.replace(/^o\//, '');
        console.log(assetIdentifier);

        console.log('Folder:', folderName);
        console.log('File Name:', fileName);
        console.log('Extension:', assetExtension);
        console.log('Asset Identifier:', assetIdentifier);

        const response = await axios.post(API_ENDPOINTS.check_user_collected_asset, {
            user_id: user_id,
            asset_url: assetIdentifier, 
            game_id: gameId,
        });

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






    return (
            <View style={styles.container}>
            <CustomText style={styles.Title}>Assets</CustomText>
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
            {lastAssets.map((asset) => (
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
        </>
        )}
    </ScrollView>
{(lastAssets.length > 0) && selectedAsset && (
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
        marginLeft: 30,
        marginVertical: 20,
        textAlign: 'left',
        color: '#FFFFFF',
    },
    additionalStyle: {
    marginTop: 50,
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

export default Folder;


