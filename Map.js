import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Image, StyleSheet, ScrollView, TouchableWithoutFeedback, Keyboard, Modal, Button, Text, ActivityIndicator, TextInput, } from 'react-native';
import { storage } from './firebaseConfig';
import { ref, listAll, getDownloadURL } from 'firebase/storage';
import CustomText from './CustomText';
import axios from 'axios';
import API_ENDPOINTS from './api';
import { useNavigate} from 'react-router-native';
import ImageViewer from 'react-native-image-zoom-viewer'
import { uploadBytes, getBlob, deleteObject } from 'firebase/storage';
import { Alert } from 'react-native';


const Map = ({ id }) => {
const [gameId, setGameId] = useState(null);
const [isSidebarVisible, setSidebarVisible] = useState(false);
const [loading, setLoading] = useState(true); 
const [GameAssets, setGameAssets] = useState([]);
const [selectedAsset, setSelectedAsset] = useState(null);
const [mapLength, setMapLength] = useState(null);
const [isLengthModalVisible, setLengthModalVisible] = useState(true);
const [mapObjects, setMapObjects] = useState([]);
const [jsonContent, setJsonContent] = useState('{}');
const [isJsonModalVisible, setJsonModalVisible] = useState(false);

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

const handleAssetClick = (asset) => {
    setSelectedAsset(asset);
};

const placeAssetOnMap = (type, width, height) => {
    if (!selectedAsset) return;
    
    setMapObjects([...mapObjects, { ...selectedAsset, type, width, height, x: 100, y: 100 }]);
    setSelectedAsset(null);
};

const handleJsonFileClick = async () => {
    const jsonPath = `json/${id}.json`;
    const jsonRef = ref(storage, jsonPath);

    try {
        const blob = await getBlob(jsonRef);
        const text = await blob.text();
        setJsonContent(text);
    } catch (error) {
        console.log('No file found. Creating a new one...');
        const defaultJson = '{}';
        const blob = new Blob([defaultJson], { type: 'application/json' });
        await uploadBytes(jsonRef, blob);
        setJsonContent(defaultJson);
    }

    setJsonModalVisible(true);
};

const saveJsonOnClose = async () => {
    try {
        // Validate JSON syntax
        const parsed = JSON.parse(jsonContent); // this will throw if invalid

        const jsonPath = `json/${id}.json`;
        const jsonRef = ref(storage, jsonPath);

        // Create blob from the valid JSON string
        const blob = new Blob([JSON.stringify(parsed, null, 2)], {
            type: 'application/json',
        });

        // Upload to Firebase
        await uploadBytes(jsonRef, blob);

        // Close modal if successful
        setJsonModalVisible(false);
    } catch (error) {
        console.error('Invalid JSON or error saving:', error);
        Alert.alert('Invalid JSON', 'Please fix the JSON syntax before saving.');
    }
};

return (
     <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <View style={styles.container}>

            <CustomText style={styles.Title}>Map</CustomText>
            <View style={styles.code}>
<TouchableOpacity style={[styles.button, styles.codeButton]} onPress={handleJsonFileClick}>
    <CustomText style={styles.buttonText}>{'{'}  {'}'}</CustomText>
</TouchableOpacity>

                <TouchableOpacity style={[styles.button, styles.codeButton]} >
                    <CustomText style={[styles.buttonText, styles.yellowButton]}>javaScript</CustomText>
                </TouchableOpacity>
            </View>

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
        <TouchableOpacity 
            key={asset.id} 
            style={[styles.imageContainer, selectedAsset?.id === asset.id && styles.selectedAsset]} 
            onPress={() => handleAssetClick(asset)}
        >
            <Image source={{ uri: asset.url }} style={styles.image} />
        </TouchableOpacity>
    ))}
                    </ScrollView>
                )}
            </>
        )}
    </View>
)}

{selectedAsset && (
            <View style={styles.setElement}>
            <ScrollView horizontal={false}  showsVerticalScrollIndicator={false} contentContainerStyle={styles.assetsContainer}>
                <TouchableOpacity style={styles.button} onPress={() => placeAssetOnMap('enemy', 100, 100)}>
                    <CustomText style={styles.buttonText}>Enemy</CustomText>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={() => placeAssetOnMap('hazard', 120, 120)}>
                    <CustomText style={styles.buttonText}>Hazard</CustomText>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={() => setSelectedAsset(null)}>
                    <CustomText style={styles.buttonText}>Cancel</CustomText>
                </TouchableOpacity>
                </ScrollView>
            </View>
        )}
        <Modal
  visible={isJsonModalVisible}
  animationType="slide"
  transparent={true} // so the map behind stays visible
  onRequestClose={saveJsonOnClose}
>
  <View style={styles.halfModalContainer}>
    <View style={styles.halfModalInner}>
      <TouchableOpacity onPress={saveJsonOnClose} style={styles.modalCloseIcon}>
        <Text style={styles.modalCloseText}>X</Text>
      </TouchableOpacity>

      <ScrollView style={styles.jsonEditorContainer}>
        <TextInput
          style={styles.jsonEditor}
          multiline
          value={jsonContent}
          onChangeText={setJsonContent}
        />
      </ScrollView>
    </View>
  </View>
</Modal>
    </View>
    </TouchableWithoutFeedback>
);
};    

const styles = StyleSheet.create({
halfModalContainer: {
  flex: 1,
  justifyContent: 'flex-end', // show at bottom
  backgroundColor: 'rgba(0, 0, 0, 0.3)', // slight overlay, optional
},

halfModalInner: {
  height: '60%',
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  padding: 20,
},

modalCloseIcon: {
  position: 'absolute',
  right: 15,
  top: 15,
  zIndex: 10,
},

modalCloseText: {
  fontFamily:"Minecraft Regular",
  color: 'white',
  fontSize: 25,
},

modalTitle: {
  color: 'white',
  fontSize: 20,
  marginBottom: 20,
  textAlign: 'center',
},

jsonEditor: {
  flex: 1,
  height: 380,
  backgroundColor: 'rgba(255, 255, 255, 1)',
  fontFamily:"Minecraft Regular",
  marginTop: 40,
  marginBottom: 30,
  marginLeft: 10,
  marginRight: 10,
  fontSize: 16,
  padding: 10,
  color: '#000',
  textAlignVertical: 'top',
},
    sidebarImage: {
        width: 60,
        height: 60,
      },
    code: {
        flexDirection: 'row',  
        position: 'absolute',
        top: 120,
        right: 30,
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
        zIndex: 1,

    },
    mapMain: {
        position: 'absolute',
        marginTop: 170, 
        width: 370,
        right: -160,
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
    setElement: {
        position: 'absolute',
        backgroundColor: 'rgba(82, 17, 186, 0.64)',
        bottom: 0, 
        height: 160,
        padding: 10,
        zIndex: 0,  
        width: 370,
        right: -160,
        alignItems: 'left',
        borderTopWidth: 1,
        borderTopColor: 'transparent',
    },
    codeButton: {
        marginLeft: 30,

    },
    yellowButton: {
        color: 'yellow'
    }

});   

export default Map;
