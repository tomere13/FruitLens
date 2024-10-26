// Profile.tsx

import React, { useState, useEffect } from "react";
import {
  Alert,
  ScrollView,
  Text,
  View,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getUserProfile, logout } from "@/components/authService";
import CustomButton from "@/components/CustomButton";
import { Link, router } from "expo-router";
import { images } from "../../constants";
import ProfileCard from "@/components/ProfileCard"; // Import the ProfileCard component

function Profile() {
  const [profile, setProfile] = useState({
    username: "",
    email: "",
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false); // State to manage loading

  // Function to handle logout
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true); // Show loading state
      await logout(); // Perform the logout
      router.push("/sign-in"); // Redirect the user to the sign-in page after logout
    } catch (error) {
      console.error("Logout failed:", error); // Log any errors encountered
      alert("Error logging out. Please try again."); // Provide error feedback to the user
    } finally {
      setIsLoggingOut(false); // Reset loading state
    }
  };
  // Fetch the user profile when the component mounts
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileData = await getUserProfile();
        setProfile({
          username: profileData.username,
          email: profileData.email,
        });
      } catch (error: any) {
        Alert.alert("Error", error.message || "Failed to load profile data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChangePassword = () => {
    router.push("/changepassword");
  };

  if (isLoading) {
    return (
      <SafeAreaView className="bg-primary h-full">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-primary h-full">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="w-full justify-center px-4 my-6 flex-1">
            {/* Logo at the top */}
            <View className="items-center">
              <Link href="/home">
                <Image
                  source={images.logo}
                  resizeMode="contain"
                  style={{ width: 200, height: 55 }}
                />
              </Link>
            </View>

            {/* Profile Card */}
            <ProfileCard username={profile.username} email={profile.email} />

            {/* Change Password Button */}
            <CustomButton
              title={"Change Password"}
              handlePress={handleChangePassword}
              containerStyles="mt-7"
              isLoading={isSubmitting}
              textStyles={undefined}
            />
            <CustomButton
              title={"Log out"}
              handlePress={handleLogout}
              containerStyles="mt-7 bg-red-500"
              isLoading={isSubmitting}
              textStyles="text-white" // Optional: Change text color for better contrast
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default Profile;
