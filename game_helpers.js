import { useState, useEffect } from "react";
import axios from "axios";
import API_ENDPOINTS from "./api";
import { storage } from './firebaseConfig';
import { ref, listAll, getDownloadURL } from 'firebase/storage';

const useGameDetails = (gameId) => {  
  const [gameData, setGameData] = useState(null);
  const [imageSource, setImageSource] = useState(null);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const folderRef = ref(storage, `game_pictures/`);
        const files = await listAll(folderRef);

        // Find file starting with gameId
        const gameImage = files.items.find((file) =>
          file.name.startsWith(gameData?.id)
        );

        if (gameImage) {
          const url = await getDownloadURL(gameImage);
          setImageSource({ uri: url });
        }
      } catch (error) {
        console.error('Error fetching game image:', error);
        setImageSource(require('./assets/gamelogo.png'));  
      }
    };

    if (gameData?.id) {
      fetchImage();
    }
  }, [gameData?.id]);

  const handleImageError = () => {
    setImageSource(require('./assets/gamelogo.png'));
  };

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.game_details(gameId));
        setGameData(response.data);
        // console.log(response.data)
      } catch (error) {
        console.error("Error fetching game data:", error);
        alert("Failed to fetch game details.");
      }
    };

    if (gameId) {
      fetchGameData();
    }
  }, [gameId]);

  return { gameData, imageSource, handleImageError };
};

export default useGameDetails;
