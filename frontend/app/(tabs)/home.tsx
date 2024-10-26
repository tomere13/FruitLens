import React, { useState } from "react";
import { ScrollView, Text, View, Image, ActivityIndicator, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import CustomButton from "@/components/CustomButton";
import * as ImagePicker from "expo-image-picker";
import { uploadImage } from "@/services/scanService"; // Import the service
import { openaiService } from "@/services/openaiService"; // Import the OpenAI service

import { images } from "../../constants";

function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [detectedObjects, setDetectedObjects] = useState<
    { label: string; confidence: number }[]
  >([]);
  const [prompt, setPrompt] = useState<string>(""); // State for the OpenAI prompt
  const [aiResponse, setAiResponse] = useState<string>(""); // State for the OpenAI response
  const [loadingAI, setLoadingAI] = useState<boolean>(false); // State for AI request loading

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

      // Store detected objects in the state
      setDetectedObjects(response);
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsSubmitting(false); // Reset the submitting state
    }
  };

  const handleGenerateText = async () => {
    if (!prompt) return alert("Please enter a prompt.");

    try {
      setLoadingAI(true);
      const response = await openaiService(prompt); // Call the OpenAI service with the prompt
      setAiResponse(response.generated_text); // Store the generated text
    } catch (error) {
      console.error("Error generating text:", error);
    } finally {
      setLoadingAI(false);
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

          {/* Prompt Input Field for OpenAI */}
          <View className="mt-10">
            <TextInput
              placeholder="Enter a prompt for OpenAI"
              value={prompt}
              onChangeText={setPrompt}
              className="border border-gray-300 p-3 rounded-md text-black"
            />
            <CustomButton
              title="Generate Text"
              handlePress={handleGenerateText}
              containerStyles="mt-4"
              isLoading={loadingAI} textStyles={undefined}            />
          </View>

          {/* Display OpenAI Response */}
          {loadingAI ? (
            <ActivityIndicator size="large" color="#0000ff" className="mt-4" />
          ) : (
            aiResponse && (
              <View className="mt-5 p-4 bg-gray-100 rounded-md">
                <Text className="text-md text-black font-semibold">AI Response:</Text>
                <Text className="text-black mt-2">{aiResponse}</Text>
              </View>
            )
          )}

          {/* Display Captured Image and Detected Objects */}
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