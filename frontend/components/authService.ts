import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Define the base URL of your backend API
const BASE_URL = 'http://localhost:5002';  // Ensure this is correct for your environment

// Types for the responses
interface AuthResponse {
  message: string;
  token?: string;
}

interface ProtectedResponse {
  message: string;
}

// User registration function
export const registerUser = async (username: string, email: string, password: string): Promise<void> => {
  try {
    const response = await axios.post<AuthResponse>(`${BASE_URL}/register`, {
      username,
      email,
      password,
    });
    alert(response.data.message);
  } catch (error: any) {
    const message = error.response?.data?.message || 'Registration failed';
    alert(message);
  }
};

// User login function
export const loginUser = async (username: string, password: string): Promise<void> => {
  try {
    const response = await axios.post<AuthResponse>(`${BASE_URL}/login`, {
      username,
      password,
    });
    const { token } = response.data;

    if (token) {
      // Store the token securely using expo-secure-store
      await SecureStore.setItemAsync('authToken', token);
      alert('Login successful');
    } else {
      alert('Login failed, no token provided');
    }
  } catch (error: any) {
    const message = error.response?.data?.message || 'Login failed';
    alert(message);
  }
};

// Access protected route and return data
export const getProtectedData = async (): Promise<string> => {
  try {
    const token = await SecureStore.getItemAsync('authToken');

    if (token) {
      const response = await axios.get<ProtectedResponse>(`${BASE_URL}/protected`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.message;  // Ensure this returns the string you want
    } else {
      throw new Error('No credentials stored');
    }
  } catch (error: any) {
    const message = error.response?.data?.message || 'Error fetching protected data';
    throw new Error(message);  // Throw an error to be caught in the component
  }
};

// Logout function
export const logout = async (): Promise<void> => {
  try {
    // Delete the stored token
    await SecureStore.deleteItemAsync('authToken');
    alert('Logout successful');

    // Optional: Verify that the token is cleared
    const token = await SecureStore.getItemAsync('authToken');
    if (!token) {
      console.log('Token has been successfully cleared from SecureStore.');
    } else {
      console.log('Token still exists:', token);
    }

  } catch (error) {
    console.error("Error during logout:", error);
    alert('Error logging out. Please try again.');
    throw new Error('Failed to logout');
  }
};