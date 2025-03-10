// assetService.js
import axios from 'axios';
import API_ENDPOINTS from './api'; 

export const handleCollectAsset = async (asset, user_id, gameId = null) => {
    try {
        // Decode the URL to handle any URL-encoded characters like '%2F'
        const decodedAsset = decodeURIComponent(asset);

        // Split the URL by '/' to separate the folder and file name
        const assetUrlParts = decodedAsset.split('/');
        const fileNameWithParams = assetUrlParts.pop();  // Get file name with query parameters
        const folderName = assetUrlParts.pop();  // Folder name is extracted but not used in 'name'

        // Split the filename from any query parameters, if they exist
        const [fileName] = fileNameWithParams.split('?');

        // Remove the file extension from the filename
        const nameWithoutExtension = fileName.split('.').slice(0, -1).join('.'); // Removes the extension

        // Extract the file extension
        const assetExtension = fileName.split('.').pop().toLowerCase();
        let image = null;
        let sound = null;

        // Process image or sound based on the file extension
        if (['png', 'jpg', 'jpeg'].includes(assetExtension)) {
            // Encode the image URL, replacing '/' with '%2F'
            image = encodeURIComponent(`${folderName}/${fileName}`);
        } else if (['mp3', 'wav'].includes(assetExtension)) {
            // Encode the sound URL, replacing '/' with '%2F'
            sound = encodeURIComponent(`${folderName}/${fileName}`);
        }

        // Construct the request body with or without the game_id
        const requestBody = {
            name: nameWithoutExtension, // Use the filename without folder and extension
            user_id: user_id,
            image: image,
            sound: sound,
        };

        if (gameId) {
            requestBody.game_id = gameId;  // Add the game_id if it's not null
        }

        // Send the POST request to add the asset
        const response = await axios.post(API_ENDPOINTS.add_asset, requestBody);
        
        return response.data; // Return the response data
    } catch (error) {
        console.error('Error collecting asset:', error);
        throw error; // Propagate the error
    }
};

  