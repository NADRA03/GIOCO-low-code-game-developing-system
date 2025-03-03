import { useState, useEffect } from "react";
import axios from "axios";
import API_ENDPOINTS from "./api";  
import { storage } from './firebaseConfig';
import { ref, listAll, getDownloadURL } from 'firebase/storage';

const useProfile = () => {
  const [profileData, setProfileData] = useState(null);
  const [imageSource, setImageSource] = useState(null);
  const [imageLoadError, setImageLoadError] = useState(false); 

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const folderRef = ref(storage, `profile_pictures/`);
        const files = await listAll(folderRef);

        const userImage = files.items.find((file) =>
          file.name.startsWith(profileData?.id)
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

    if (profileData?.id) {
      fetchImage();
    }
  }, [profileData?.id]);

  const handleImageError = () => {
    setImageSource(require('./assets/plays.png')); 
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.all_profile, { withCredentials: true });
        setProfileData(response.data);
      } catch (error) {
        console.error("Error fetching profile data:", error);
        alert("Failed to fetch profile information.");
      }
    };

    fetchProfileData();
  }, []);

  return { profileData, imageSource, handleImageError}; 
};

export default useProfile;
