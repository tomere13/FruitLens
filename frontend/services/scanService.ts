import axios from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";

// Get the correct API URL based on environment
const getApiUrl = () => {
  // If running on device
  if (Constants.expoConfig?.extra?.isDevice || Platform.OS === "ios" || Platform.OS === "android") {
    // Use your server's public URL when running on a physical device
    return "http://192.168.1.172:5002"; // Replace with your actual server URL
  }
  
  // For development/simulator
  return "http://127.0.0.1:5002";
};

// Base URL for API calls
const API_URL = getApiUrl();

/**
 * Upload an image to the backend for processing
 * @param {string} imageUri Local URI of the image
 * @returns {Promise} Promise with the detection results
 */
export const uploadImage = async (imageUri: string) => {
  try {
    // Create form data for file upload
    const formData = new FormData();
    const filename = imageUri.split("/").pop();
    
    // Check if file has an extension
    const match = /\.(\w+)$/.exec(filename || "");
    const type = match ? `image/${match[1]}` : "image/jpeg";
    
    // @ts-ignore
    formData.append("image", {
      uri: imageUri,
      name: filename,
      type,
    });
    
    console.log("Uploading to:", `${API_URL}/process-image`);
    
    // Send the image to the backend for processing - fixed endpoint to match Flask route
    const response = await axios.post(`${API_URL}/process-image`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    
    // Return the detection results
    return response.data;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

// Export the API_URL for use in other services
export { API_URL };
