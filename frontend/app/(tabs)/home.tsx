import React, { useState } from "react";
import { ScrollView, Text, View, Image, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import CustomButton from "@/components/CustomButton";
import * as ImagePicker from "expo-image-picker";
import { uploadImage } from "@/components/scanService"; // Import the service
import { images } from "../../constants";

function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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

  const handleImageUpload = async (imageUri: string) => {
    try {
      setIsSubmitting(true); // Set submitting state to show loader if needed
      const response = await uploadImage(imageUri); // Call the uploadImage service
      console.log("Detected objects:", response); // Log the response from the backend
      Alert.alert("Success", "Objects detected: " + JSON.stringify(response)); // Display the response
    } catch (error) {
      Alert.alert("Error", "Image upload failed. Please try again.");
    } finally {
      setIsSubmitting(false); // Reset the submitting state
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView>
        <View className="w-full justify-center min-h-[70vh] px-4 my-6">
          <View className="items-center">
            <Link href="/">
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
                style={{ width: 200, height: 200 }}
                resizeMode="contain"
              />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default Home;
