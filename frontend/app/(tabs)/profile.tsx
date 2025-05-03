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
import { getUserProfile, logout } from "@/services/authService";
import CustomButton from "@/components/CustomButton";
import { Link, router } from "expo-router";
import { images } from "@/constants";
import ProfileCard from "@/components/ProfileCard"; // Import the ProfileCard component
import CustomAlert from "@/components/CustomAlert";
import CustomLoading from "@/components/CustomLoading";

function Profile() {
  const [profile, setProfile] = useState({
    username: "",
    email: "",
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false); // State to manage loading
  const [alertVisible, setAlertVisible] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>("");

  // Function to handle logout
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true); // Show loading state
      await logout(); // Perform the logout
      setAlertMessage("Signed out sucessfully");
      setAlertVisible(true);
      setTimeout(() => {
        setAlertVisible(false);
        router.push('/sign-in');
      }, 750 );
    } catch (error:any) {
      setAlertMessage("Signed out failed. Please try again.");
      setAlertVisible(true);
      setTimeout(() => {
        setAlertVisible(false);
      }, 1000 );
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
        setAlertMessage(error.message || "Failed to load profile data.");
        setAlertVisible(true);
        setTimeout(() => {
          setAlertVisible(false);
        }, 1000 );
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
      <CustomLoading/>
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
      <CustomAlert
        visible={alertVisible}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
    </SafeAreaView>
  );
}

export default Profile;
