import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Image, StyleSheet, ScrollView, ActivityIndicator, TextInput, } from 'react-native';
import { storage } from './firebaseConfig';
import { ref, listAll, getDownloadURL } from 'firebase/storage';
import CustomText from './CustomText';
import axios from 'axios';
import API_ENDPOINTS from './api';
import { useNavigate} from 'react-router-native';
import ImageViewer from 'react-native-image-zoom-viewer'


const Map = ({ id }) => {
const [gameId, setGameId] = useState(null);
const [isSidebarVisible, setSidebarVisible] = useState(false);
const [loading, setLoading] = useState(true); 
const [GameAssets, setGameAssets] = useState([]);

useEffect(() => {
        setGameId(id); 
}, []);

useEffect(() => {
    if (gameId) {
        reloading();
    }
}, [gameId]);

const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
};

const fetchGameAssets = async () => {
    try {
        const response = await axios.get(API_ENDPOINTS.get_assets_for_game(gameId));
        if (response.data.assets) {
            const assets = await Promise.all(
                response.data.assets.map(async (asset) => {
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
            setGameAssets(assets);
        } else {
            alert('No assets found for this game.');
        }
    } catch (error) {
        console.error('Error fetching game assets:', error);
    }
};

const reloading = async () => {
    setLoading(true);
    try {;
        await fetchGameAssets();
        setLoading(false);
    } catch (error) {
        console.error('Error fetching assets:', error);
        setLoading(false);
    }
};

return (
    <View style={styles.container}>

            <CustomText style={styles.Title}>Map</CustomText>

            <TouchableOpacity style={styles.toggleButton} onPress={toggleSidebar}>
                <CustomText style={styles.buttonText}>
                     <Image source={require('./assets/folder.png')} resizeMode="contain" style={styles.sidebarImage} />
                </CustomText>
            </TouchableOpacity>

            <View style={styles.mapMain}>
            </View>

{isSidebarVisible && (
    <View style={styles.sidebar}>
        {loading ? (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FFFFFF" style={styles.loadingImage} />
            </View>
        ) : (
            <>
                {GameAssets.length === 0 ? (
                    <CustomText style={styles.noAssetsText}>No assets found for this game</CustomText>
                ) : (
                    <ScrollView horizontal={false}  showsVerticalScrollIndicator={false} contentContainerStyle={styles.assetsContainer}>
                        {GameAssets.map((asset) => (
                            <TouchableOpacity key={asset.id} style={styles.imageContainer}>
                                <Image source={{ uri: asset.url }} style={styles.image} />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
            </>
        )}
    </View>
)}
    </View>
);
};    

const styles = StyleSheet.create({
    sidebarImage: {
        width: 60,
        height: 60,
      },
    toggleButton: {
        position: 'absolute',
        top: 80,
        right: -145,
        backgroundColor: 'transparent',
        padding: 10,
        borderRadius: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    Title: {
        fontSize: 30,
        marginVertical: 0,
        textAlign: 'center',
        color: '#FFFFFF',
    },
    sidebar: {
        position: 'absolute',
        marginTop: 170,
        marginLeft: '31%',
        width: 100,
        backgroundColor: 'rgba(82, 17, 186, 0.64)',
        padding: 10,
        justifyContent: 'center', 
        alignItems: 'center', 
        height: 600,
    },
    mapMain: {
        position: 'absolute',
        marginTop: 170, 
        width: 500,
        right: -200,
        backgroundColor: 'white',
        padding: 10,
        height: 400,
    },
    assetsContainer: {
        width: 70,
        flexDirection: 'column',                
        justifyContent: 'flex-start',        
        alignItems: 'center',                
        paddingVertical: 10,                            
    },
    image: {
        width: 50,
        height: 50,
        margin: 10,
        resizeMode: 'contain',
    },

});   

export default Map;
