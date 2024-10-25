import React, { useState } from "react";
import { ScrollView, Text, View, Image, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, router } from "expo-router";
import CustomButton from "@/components/CustomButton";
import * as ImagePicker from "expo-image-picker";
import { uploadImage } from "@/components/scanService"; // Import the service
import { logout } from "@/components/authService"; // Import the service

import { images } from "../../constants";

function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [detectedObjects, setDetectedObjects] = useState<
    { label: string; confidence: number }[]
  >([]); // Store detected objects as an array of objects

  // Function to open camera and take a picture
  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert("Camera permission is required!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri); // Set the image URI to display it
      handleImageUpload(result.assets[0].uri); // Call the function to upload the image
    }
  };
  const handleLogout = async () => {
    try {
      await logout(); // Ensure logout is awaited to complete before proceeding
      alert("You have been logged out successfully."); // Notify the user of successful logout
      router.push("/sign-in"); // Redirect the user to the sign-in page after logout
    } catch (error) {
      console.error("Logout failed:", error); // Log any errors encountered
      alert("Error logging out. Please try again."); // Provide error feedback to the user
    }
  };

  const handleImageUpload = async (imageUri: string) => {
    try {
      setIsSubmitting(true); // Set submitting state to show loader if needed
      const response = await uploadImage(imageUri); // Call the uploadImage service
      console.log("Detected objects:", response); // Log the response from the backend

      // Store detected objects in the state
      setDetectedObjects(response);
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsSubmitting(false); // Reset the submitting state
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView>
        <View className="w-full justify-center min-h-[70vh] px-4 my-6">
          <View className="items-center">
            <Link href="/home">
              <Image
                source={images.logo} // Assuming logo is in your assets
                resizeMode="contain"
                style={{ width: 200, height: 55 }}
              />
            </Link>
          </View>
          <Text className="text-lg text-black text-semibold mt-10 font-psemibold">
            Welcome to FruitLens
          </Text>
          <CustomButton
            title={"Open Camera"}
            handlePress={openCamera}
            containerStyles="mt-7"
            textStyles={undefined}
            isLoading={isSubmitting}
          />
          
          {image && (
            <View className="items-center mt-5">
              <Text className="text-md text-black text-semibold mb-2">
                Captured Image:
              </Text>
              <Image
                source={{ uri: image }}
                style={{ width: 300, height: 300 }}
                resizeMode="contain"
              />

              {/* Show loading spinner if submitting */}
              {isSubmitting && (
                <ActivityIndicator size="large" color="#0000ff" />
              )}

              {/* Display the detected objects below the image */}
              {!isSubmitting && detectedObjects.length > 0 && (
                <View className="mt-5 w-full px-4">
                  <Text className="text-md text-black font-bold mb-2">
                    Detected Objects:
                  </Text>
                  <View
                    style={{ borderWidth: 1, borderColor: "#ddd", padding: 10 }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        borderBottomWidth: 1,
                        borderColor: "#ddd",
                        paddingBottom: 5,
                      }}
                    >
                      <Text
                        style={{ flex: 1, fontWeight: "bold", fontSize: 16 }}
                      >
                        Object Name
                      </Text>
                      <Text
                        style={{ flex: 1, fontWeight: "bold", fontSize: 16 }}
                      >
                        Confidence
                      </Text>
                    </View>
                    {detectedObjects.map((obj, index) => (
                      <View
                        key={index}
                        style={{
                          flexDirection: "row",
                          borderBottomWidth:
                            index !== detectedObjects.length - 1 ? 1 : 0,
                          borderColor: "#ddd",
                          paddingVertical: 5,
                        }}
                      >
                        <Text style={{ flex: 1, fontSize: 14 }}>
                          {obj.label}
                        </Text>
                        <Text style={{ flex: 1, fontSize: 14 }}>
                          {(obj.confidence * 100).toFixed(2)}%
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default Home;
