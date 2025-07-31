import { useState, useEffect } from "react";
import axios from "axios";
import API_ENDPOINTS from "./api";
import { storage } from './firebaseConfig';
import { ref, listAll, getDownloadURL } from 'firebase/storage';

const useGameDetails = (gameId) => {
  const [gameData, setGameData] = useState(null);
  const [imageSource, setImageSource] = useState(null); // Start with null, not a previous image
  const [error, setError] = useState(false);  // Track error state

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const folderRef = ref(storage, `game_pictures/`);
        const files = await listAll(folderRef);

        // Find file starting with gameId
        const gameImage = files.items.find((file) =>
          file.name.startsWith(gameId)
        );

        if (gameImage) {
          const url = await getDownloadURL(gameImage);
          setImageSource({ uri: url });
        } else {
          // If no image is found for the current game, set the error state
          setImageSource(null);
          setError(true);  // Indicate that there was an error finding the image
        }
      } catch (error) {
        console.error('Error fetching game image:', error);
        setImageSource(null);  // Reset image to null if there's an error
        setError(true);  // Indicate error
      }
    };

    if (gameId) {
      fetchImage();
    }
  }, [gameId]);

  const handleImageError = () => {
    setImageSource(require('./assets/gamelogo.png'));  // Fallback to a default image
    setError(false);  // Reset error state when fallback is used
  };

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.game_details(gameId));
        setGameData(response.data);
        setError(false); // Reset error on successful game data fetch
      } catch (error) {
        console.error("Error fetching game data:", error);
        alert("Failed to fetch game details.");
      }
    };

    if (gameId) {
      fetchGameData();
    }
  }, [gameId]);

  return { gameData, imageSource, handleImageError, error };  // Return error state too if needed
};

export default useGameDetails;

