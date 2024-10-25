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
import { getUserProfile, updateUserProfile } from "@/components/authService";
import CustomButton from "@/components/CustomButton";
import FormField from "@/components/FormField";
import { Link, router } from "expo-router";
import { images } from "../../constants";

function Profile() {
  type FormState = {
    username: string;
    email: string;
  };

  const [form, setForm] = useState<FormState>({
    username: "",
    email: "",
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch the user profile when the component mounts and reset password fields
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileData = await getUserProfile();
        setForm({
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
  }, []); // Reset only when the component is mounted

  const handleChangePassword = () => {
    router.push("/changepassword");
  };

  const handleProfileUpdate = async () => {
    try {
      setIsSubmitting(true);

      const updatedData = {
        username: form.username,
        email: form.email,
      };

      await updateUserProfile(updatedData);

      Alert.alert("Success", "Profile updated successfully");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update profile.");
    } finally {
      setIsSubmitting(false);
    }
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
                source={images.logo} // Assuming logo is available in your images
                resizeMode="contain"
                style={{ width: 200, height: 55 }}
              />
              </Link>
            </View>

            <Text className="text-lg text-black text-semibold mt-10 font-psemibold">
              Update Profile
            </Text>

            {/* Username field */}
            <FormField
              title="Username"
              value={form.username}
              handleChangeText={(e: string) =>
                setForm({ ...form, username: e })
              }
              otherStyles="mt-7"
              keyboardType="default"
            />

            {/* Email field */}
            <FormField
              title="Email"
              value={form.email}
              handleChangeText={(e: string) => setForm({ ...form, email: e })}
              otherStyles="mt-7"
              keyboardType="email-address"
            />

            {/* Update Profile Button */}
            <CustomButton
              title={"Update Profile"}
              handlePress={handleProfileUpdate}
              containerStyles="mt-7"
              textStyles={undefined}
              isLoading={isSubmitting}
            />

            {/* Change Password Button */}
            <CustomButton
              title={"Change Password"}
              handlePress={handleChangePassword}
              containerStyles="mt-7"
              textStyles={undefined}
              isLoading={isSubmitting}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default Profile;
