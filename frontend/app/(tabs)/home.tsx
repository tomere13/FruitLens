import React, { useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Image,
  ActivityIndicator,
  Alert,
  TextInput,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { Link } from "expo-router";
import CustomButton from "@/components/CustomButton";
import * as ImagePicker from "expo-image-picker";
import { uploadImage } from "@/services/scanService"; // Import the service
import { openaiService } from "@/services/openaiService"; // Import the OpenAI service
import { images } from "../../constants";

function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Location-related states
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [address, setAddress] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // States for detected objects
  const [detectedObjects, setDetectedObjects] = useState<
    { label: string; confidence: number; box: number[] }[]
  >([]);

  // States for OpenAI prompt and response
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
      const { width, height, uri } = result.assets[0];
      setImage(uri); // Set the image URI to display it
      setImageDimensions({ width, height }); // Store the original image dimensions

      // Upload image and detect objects
      await handleImageUpload(uri);

      // Fetch location after image detection
      await fetchLocation();
    }
  };

  // Function to handle image upload and object detection
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

  // Function to request location permissions and get current location
  const fetchLocation = async () => {
    setIsFetchingLocation(true);
    try {
      // Request permission to access location
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        Alert.alert("Permission Denied", "Cannot access location.");
        return;
      }

      // Get current location
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);

      // Reverse geocode to get address
      if (currentLocation) {
        const { latitude, longitude } = currentLocation.coords;
        await getAddressFromCoordinates(latitude, longitude);
      }
    } catch (error) {
      console.error("Error fetching location:", error);
      setErrorMsg("Error fetching location.");
    } finally {
      setIsFetchingLocation(false);
    }
  };

  // Function to reverse geocode coordinates to address
  const getAddressFromCoordinates = async (
    latitude: number,
    longitude: number
  ) => {
    try {
      const geocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (geocode && geocode.length > 0) {
        const addressObj = geocode[0];
        const formattedAddress = `${addressObj.street || ""}, ${
          addressObj.city || ""
        }`;
        setAddress(formattedAddress);
        return formattedAddress;
      } else {
        setErrorMsg("No address found for the provided coordinates.");
      }
    } catch (error) {
      console.error("Error during reverse geocoding:", error);
      setErrorMsg("Error retrieving address.");
    }
  };

  // Function to handle generating text using OpenAI
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
            isLoading={isSubmitting || isFetchingLocation}
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
              isLoading={loadingAI}
              textStyles={undefined}
            />
          </View>

          {/* Display OpenAI Response */}
          {loadingAI ? (
            <ActivityIndicator
              size="large"
              color="#0000ff"
              style={{ marginTop: 10 }}
            />
          ) : (
            aiResponse && (
              <View className="mt-5 p-4 bg-gray-100 rounded-md">
                <Text className="text-md text-black font-semibold">
                  AI Response:
                </Text>
                <Text className="text-black mt-2">{aiResponse}</Text>
              </View>
            )
          )}

          {/* Display Captured Image, Detected Objects, and Location */}
          {image && imageDimensions && (
            <View className="items-center mt-5">
              <Text className="text-md text-black text-semibold mb-2">
                Captured Image:
              </Text>
              <View
                style={{
                  position: "relative",
                  width: 300,
                  height: 300,
                }}
              >
                <Image
                  source={{ uri: image }}
                  style={{ width: 300, height: 300 }}
                  resizeMode="contain"
                />

                {/* Overlay bounding boxes */}
                {!isSubmitting &&
                  detectedObjects.map((obj, index) => {
                    // Scaling factors
                    const scaleX = 300 / imageDimensions.width;
                    const scaleY = 300 / imageDimensions.height;

                    // Bounding box coordinates
                    const [x1, y1, x2, y2] = obj.box;

                    // Ensure coordinates are numbers
                    if (
                      isNaN(x1) ||
                      isNaN(y1) ||
                      isNaN(x2) ||
                      isNaN(y2) ||
                      isNaN(scaleX) ||
                      isNaN(scaleY)
                    ) {
                      console.warn("Invalid coordinates for object:", obj);
                      return null;
                    }

                    // Define boxStyle with explicit type
                    const boxStyle: ViewStyle = {
                      position: "absolute",
                      left: x1 * scaleX,
                      top: y1 * scaleY,
                      width: (x2 - x1) * scaleX,
                      height: (y2 - y1) * scaleY,
                      borderWidth: 2,
                      borderColor: "red",
                    };

                    return (
                      <View key={index} style={boxStyle}>
                        {/* Optionally, display the label */}
                        <Text
                          style={{
                            position: "absolute",
                            top: -20,
                            left: 0,
                            color: "red",
                            fontWeight: "bold",
                            backgroundColor: "rgba(255, 255, 255, 0.7)",
                            padding: 2,
                          }}
                        >
                          {obj.label} ({(obj.confidence * 100).toFixed(1)}%)
                        </Text>
                      </View>
                    );
                  })}
              </View>

              {/* Show loading spinner if fetching location or submitting */}
              {(isFetchingLocation || isSubmitting) && (
                <ActivityIndicator
                  size="large"
                  color="#0000ff"
                  style={{ marginTop: 10 }}
                />
              )}

              {/* Display Location Address */}
              <View className="mt-5">
                {errorMsg ? (
                  <Text style={{ color: "red" }}>Error: {errorMsg}</Text>
                ) : address ? (
                  <Text
                    style={{
                      fontSize: 16,
                      color: "black",
                      textAlign: "center",
                    }}
                  >
                    Current Address:
                    {"\n"}
                    {address}
                  </Text>
                ) : (
                  <Text>Fetching address...</Text>
                )}
              </View>

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
                        style={{ flex: 1, fontWeight: "bold", fontSize: 14 }}
                      >
                        Object Name
                      </Text>
                      <Text
                        style={{ flex: 1, fontWeight: "bold", fontSize: 14 }}
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
                        <Text style={{ flex: 1, fontSize: 12 }}>
                          {obj.label}
                        </Text>
                        <Text style={{ flex: 1, fontSize: 12 }}>
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
