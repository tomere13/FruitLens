import axios from "axios";

const API_URL = "http://192.168.1.44:5002"; // Replace with your local machine IP and backend port

export const uploadImage = async (imageUri: string) => {
  const formData = new FormData();

  try {
    // Append the file directly with the `uri`, `type`, and `name` by casting it to 'any'
    formData.append("image", {
      uri: imageUri,
      type: "image/jpeg", // Explicitly set the MIME type
      name: "image.jpg", // Set a filename
    } as any); // Cast to `any` to avoid TypeScript errors

    // Debug: Log imageUri to ensure it's correct
    console.log("Image URI:", imageUri);

    // Send the form data to the server
    const uploadResponse = await axios.post(
      `${API_URL}/process-image`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return uploadResponse.data; // Return the response data (detected objects)
  } catch (error) {
    console.error("Error uploading image", error);
    throw error; // Rethrow the error to handle it in the component
  }
};
