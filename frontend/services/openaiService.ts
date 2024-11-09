import axios from "axios";
const API_URL = "http://192.168.1.198:5002"; // Replace with your local machine IP and backend port

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
