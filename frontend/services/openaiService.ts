import axios from "axios";
import Constants from "expo-constants";

// Access the API URL from the `extra` field
const API_URL = Constants.expoConfig?.extra?.API_URL || "";


interface OpenAIResponse {
  generated_text: string;
}

export const openaiService = async (
  prompt: string
): Promise<OpenAIResponse> => {
  try {
    const response = await axios.post(`${API_URL}/generate`, { prompt });
    return response.data;
  } catch (error: any) {
    console.error("Error in OpenAI service:", error);
    throw new Error(
      error.response?.data?.error || "Failed to fetch response from the server"
    );
  }
};
