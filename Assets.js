import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Image, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { storage } from './firebaseConfig';
import { ref, listAll, getDownloadURL } from 'firebase/storage';
import CustomText from './CustomText';
import { useNavigate } from 'react-router-native';
import ImageViewer from 'react-native-image-zoom-viewer'

const Assets = () => {
    const [enemyAssets, setEnemyAssets] = useState([]);
    const [heroAssets, setHeroAssets] = useState([]);
    const [moreAssets, setMoreAssets] = useState([]);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [loading, setLoading] = useState(true); // Loading state
    const navigate = useNavigate();
    

    useEffect(() => {
        const fetchAssets = async () => {
            setLoading(true); // Set loading to true before fetching assets

            // References to enemy and hero directories in Firebase Storage
            const enemyRef = ref(storage, 'defaults/enemy');
            const heroRef = ref(storage, 'defaults/hero');
            const moreRef = ref(storage, 'defaults/more');

            // // Fetching enemy assets
            // const enemyList = await listAll(enemyRef);
            // const enemyUrls = await Promise.all(
            //     enemyList.items.map(async (item) => {
            //         const url = await getDownloadURL(item);
            //         return { name: item.name, url };
            //     })
            // );
            // setEnemyAssets(enemyUrls);

            // // Fetching hero assets
            // const heroList = await listAll(heroRef);
            // const heroUrls = await Promise.all(
            //     heroList.items.map(async (item) => {
            //         const url = await getDownloadURL(item);
            //         return { name: item.name, url };
            //     })
            // );
            // setHeroAssets(heroUrls);

            // // Fetching more assets
            // const moreList = await listAll(moreRef);
            // const moreUrls = await Promise.all(
            //     moreList.items.map(async (item) => {
            //         const url = await getDownloadURL(item);
            //         return { name: item.name, url };
            //     })
            // );
            // setMoreAssets(moreUrls);

            // Fetching enemy assets (limited to 5)
            const enemyList = await listAll(enemyRef);
            const enemyUrls = await Promise.all(
              enemyList.items.slice(0, 5).map(async (item) => {
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
              moreList.items.slice(0, 8).map(async (item) => {
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
        };

        fetchAssets();
    }, []);

    // Handle asset selection
    const handleSelectAsset = (asset) => {
        setSelectedAsset(asset);
    };

    const handleDeselectAsset = () => {
      setSelectedAsset(null);
  };

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
                        {/* Enemies Section */}
                        <CustomText style={styles.sectionTitle}>Enemy</CustomText>
                        <ScrollView horizontal contentContainerStyle={styles.assetsContainer}>
                            {enemyAssets.map((asset) => (
                                <TouchableOpacity key={asset.name} onPress={() => handleSelectAsset(asset)}>
                                    <Image source={{ uri: asset.url }} style={styles.image} />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Heroes Section */}
                        <CustomText style={styles.sectionTitle}>Hero</CustomText>
                        <ScrollView horizontal contentContainerStyle={styles.assetsContainer}>
                            {heroAssets.map((asset) => (
                                <TouchableOpacity key={asset.name} onPress={() => handleSelectAsset(asset)}>
                                    <Image source={{ uri: asset.url }} style={styles.image} />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* More Assets Section */}
                        <CustomText style={styles.sectionTitle}>More</CustomText>
                        {moreAssets.length > 0 && (
                            <>
                                {/* First ScrollView */}
                                <ScrollView horizontal contentContainerStyle={styles.assetsContainer}>
                                    {moreAssets.slice(0, Math.ceil(moreAssets.length / 3)).map((asset) => (
                                        <TouchableOpacity key={asset.name} onPress={() => handleSelectAsset(asset)}>
                                            <Image source={{ uri: asset.url }} style={styles.image} />
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>

                                {/* Second ScrollView */}
                                <ScrollView horizontal contentContainerStyle={styles.assetsContainer}>
                                    {moreAssets.slice(Math.ceil(moreAssets.length / 3), Math.ceil((moreAssets.length * 2) / 3)).map((asset) => (
                                        <TouchableOpacity key={asset.name} onPress={() => handleSelectAsset(asset)}>
                                            <Image source={{ uri: asset.url }} style={styles.image} />
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>

                                {/* Third ScrollView */}
                                <ScrollView horizontal contentContainerStyle={styles.assetsContainer}>
                                    {moreAssets.slice(Math.ceil((moreAssets.length * 2) / 3)).map((asset) => (
                                        <TouchableOpacity key={asset.name} onPress={() => handleSelectAsset(asset)}>
                                            <Image source={{ uri: asset.url }} style={styles.image} />
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
              {/* X Button to Deselect the Asset */}
              <TouchableOpacity onPress={handleDeselectAsset} style={styles.closeButton}>
                  <CustomText style={styles.closeButtonText}>X</CustomText>
              </TouchableOpacity>

              {/* Selected Image */}
              <Image source={{ uri: selectedAsset.url }} style={styles.selectedImage} />

              {/* "Collect Asset" Button */}
              <TouchableOpacity 
                  onPress={() => handleCollectAsset(selectedAsset)} 
                  style={[styles.collectButton, selectedAsset.url.includes('$') && styles.disabledButton]}
                  disabled={selectedAsset.url.includes('$')}
              >
                  <CustomText style={styles.collectButtonText}>
                      {selectedAsset.url.includes('$') ? 'Asset Locked' : 'Collect Asset'}
                  </CustomText>
              </TouchableOpacity>
            </View> 
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    scrollView: {
        paddingBottom: 20,
    },
    Title: {
        fontSize: 30,
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
    assetsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 10,
    },
    image: {
        width: 100,
        height: 100,
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
    backgroundColor: '#6c757d',
  },
  collectButtonText: {
    color: '#000000',
    fontSize: 24,
  },
});

export default Assets;


