// authService.ts

import axios from "axios";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";

// Define the base URL of your backend API
const API_URL = "http://192.168.1.231:5002"; // Replace with your local machine IP and backend port

// Types for the responses
interface AuthResponse {
  message: string;
  token?: string;
}

interface ProtectedResponse {
  message: string;
}

interface UserProfile {
  username: string;
  email: string;
}

// User registration function
export const registerUser = async (
  username: string,
  email: string,
  password: string
): Promise<void> => {
  try {
    const response = await axios.post<AuthResponse>(`${API_URL}/register`, {
      username,
      email,
      password,
    });
    alert(response.data.message);
    router.push("/sign-in");
  } catch (error: any) {
    const message = error.response?.data?.message || "Registration failed";
    alert(message);
  }
};

// User login function
export const loginUser = async (
  username: string,
  password: string
): Promise<void> => {
  try {
    const response = await axios.post<AuthResponse>(`${API_URL}/login`, {
      username,
      password,
    });
    const { token } = response.data;

    if (token) {
      // Store the token securely using expo-secure-store
      await SecureStore.setItemAsync("authToken", token);
      alert("Login successful");
      router.push("/home");
    } else {
      alert("Login failed, no token provided");
    }
  } catch (error: any) {
    const message = error.response?.data?.message || "Login failed";
    alert(message);
  }
};

// Access protected route and return data
export const getProtectedData = async (): Promise<string> => {
  try {
    const token = await SecureStore.getItemAsync("authToken");

    if (token) {
      const response = await axios.get<ProtectedResponse>(
        `${API_URL}/protected`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.message; // Ensure this returns the string you want
    } else {
      throw new Error("No credentials stored");
    }
  } catch (error: any) {
    const message =
      error.response?.data?.message || "Error fetching protected data";
    throw new Error(message); // Throw an error to be caught in the component
  }
};

// Logout function
export const logout = async (): Promise<void> => {
  try {
    // Delete the stored token
    await SecureStore.deleteItemAsync("authToken");
    alert("Logout successful");

    // Optional: Verify that the token is cleared
    const token = await SecureStore.getItemAsync("authToken");
    if (!token) {
      console.log("Token has been successfully cleared from SecureStore.");
    } else {
      console.log("Token still exists:", token);
    }
  } catch (error) {
    console.error("Error during logout:", error);
    alert("Error logging out. Please try again.");
    throw new Error("Failed to logout");
  }
};

// Get user profile function
export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    const token = await SecureStore.getItemAsync("authToken");

    if (token) {
      const response = await axios.get<UserProfile>(`${API_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } else {
      throw new Error("No credentials stored");
    }
  } catch (error: any) {
    const message =
      error.response?.data?.message || "Error fetching user profile";
    throw new Error(message); // Throw an error to be caught in the component
  }
};

// Update user profile function
export const updateUserProfile = async (
  updatedData: UserProfile
): Promise<void> => {
  try {
    const token = await SecureStore.getItemAsync("authToken");

    if (token) {
      await axios.put(`${API_URL}/profile`, updatedData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Optionally, handle the response or return a message
    } else {
      throw new Error("No credentials stored");
    }
  } catch (error: any) {
    const message =
      error.response?.data?.message || "Error updating user profile";
    throw new Error(message);
  }
};

// Change password function
export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  try {
    const token = await SecureStore.getItemAsync("authToken");

    if (token) {
      // Make a PUT request to change the user's password
      await axios.put(
        `${API_URL}/change-password`,
        { current_password: currentPassword, new_password: newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      router.push("/profile");

    } else {
      throw new Error("No credentials stored");
    }
  } catch (error: any) {
    const message =
      error.response?.data?.message || "Error updating password";
    throw new Error(message); // Optionally throw the error to be caught by the caller
  }
};