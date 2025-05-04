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
import { images } from "@/constants";

// List of fruits and vegetables (from smartcart.tsx)
const validFruits: string[] = [
  "apple",
  "banana",
  "carrot",
  "tomato",
  "potato",
  "lettuce",
  "orange",
  "grape",
  "spinach",
  "onion",
  "cucumber",
  "pepper",
  "avocado",
  "parsley",
  "celery",
  "cabbage",
  "cauliflower",
  "broccoli",
  "mushroom",
  "strawberry",
  "pineapple",
  "peach",
  "plum",
  "pear",
  "mango",
  "kiwi",
  "cherry",
  "pomegranate",
  "lemon",
  "watermelon",
  "melon",
  "garlic",
  "olive",
];

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
  const [nutritionInfo, setNutritionInfo] = useState<string>(""); // State for nutrition information
  const [loadingAI, setLoadingAI] = useState<boolean>(false); // State for AI request loading
  const [showingNutrition, setShowingNutrition] = useState<boolean>(false); // Flag to track what's being displayed

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
  const handleGenerateText = async (customPrompt?: string) => {
    const promptToUse = customPrompt || prompt;

    if (!promptToUse) return alert("Please enter a prompt.");

    try {
      setLoadingAI(true);
      const response = await openaiService(promptToUse); // Call the OpenAI service with the prompt

      // Format the response text with better styling
      const formattedText = formatResponseText(response.generated_text);
      setAiResponse(formattedText); // Store the formatted text
    } catch (error) {
      console.error("Error generating text:", error);
    } finally {
      setLoadingAI(false);
    }
  };

  // Function to handle generating recipe prompt for the detected fruit
  const handleRecipeRequest = () => {
    if (
      detectedObjects.length > 0 &&
      validFruits.includes(detectedObjects[0].label.toLowerCase())
    ) {
      const fruitName = detectedObjects[0].label;
      const recipePrompt = `Please provide a recipe using ${fruitName}. Start with the ingredients list followed by instructions.`;

      // Update the prompt state (for display purposes) and immediately generate text
      setPrompt(recipePrompt);
      handleGenerateText(recipePrompt);
    }
  };

  // Function to generate nutrition information for the detected fruit
  const handleNutritionRequest = () => {
    if (
      detectedObjects.length > 0 &&
      validFruits.includes(detectedObjects[0].label.toLowerCase())
    ) {
      const fruitName = detectedObjects[0].label;
      const nutritionPrompt = `Please provide detailed nutritional information for ${fruitName}, including calories, vitamins, minerals, and health benefits. Format it in an easy-to-read way.`;

      setPrompt(nutritionPrompt);
      setShowingNutrition(true); // We're showing nutrition, not a recipe

      // Generate nutrition information
      setLoadingAI(true);
      openaiService(nutritionPrompt)
        .then((response) => {
          setNutritionInfo(response.generated_text);
          setAiResponse(response.generated_text); // Also set in aiResponse to use the same display mechanism
        })
        .catch((error) => {
          console.error("Error generating nutrition information:", error);
        })
        .finally(() => {
          setLoadingAI(false);
        });
    }
  };

  /**
   * A helper function that tries to determine if a line is likely an ingredient.
   * It looks for:
   *  1) An optional bullet ( - or • or * ), followed by a common measurement pattern, or
   *  2) A leading measurement (e.g. "1/2 cup", "2 tbsp", "1 can", etc.), or
   *  3) A quantity plus a descriptor (e.g. "2 cloves garlic", "3 slices of bacon", etc.)
   *
   * You can expand these patterns as needed to match your recipe format.
   */
  function isLikelyIngredient(line: string): boolean {
    const trimmed = line.trim();

    // Common patterns for recipe ingredients:
    const measurementPattern =
      /^\d+(?:\/\d+)?(?:\.\d+)?\s*(cup|cups|tbsp|tsp|oz|ounces|lb|pound|g|grams|kg|kilograms|ml|clove|cloves|bunch|can|packet|pinch)s?\b/i;
    const bulletMeasurementPattern =
      /^[-•*]\s*\d+(?:\/\d+)?(?:\.\d+)?\s*(cup|cups|tbsp|tsp|oz|ounces|lb|pound|g|grams|kg|kilograms|ml|clove|cloves|bunch|can|packet|pinch)s?\b/i;
    const amountDescriptorPattern =
      /^\d+(?:\/\d+)?(?:\.\d+)?\s*\w+\s+(of|fresh|dried|chopped|minced|diced|sliced)\b/i;
    const bulletOnlyPattern = /^[-•*]\s*\w+/;

    return (
      measurementPattern.test(trimmed) ||
      bulletMeasurementPattern.test(trimmed) ||
      amountDescriptorPattern.test(trimmed) ||
      bulletOnlyPattern.test(trimmed)
    );
  }

  function formatResponseText(text: string) {
    const lines = text.split("\n");

    // We'll store everything in these arrays:
    const ingredientsSection: string[] = [];
    const instructionsSection: string[] = [];
    const otherContent: string[] = [];

    // We'll keep track of all ingredient lines (wrapped in <i>…</i>).
    const globalIngredients: string[] = [];

    // These flags help us know which section we're currently populating.
    let inInstructions = false;

    // Pass 1: Classify each line and gather ingredients
    for (let i = 0; i < lines.length; i++) {
      const rawLine = lines[i];
      const trimmed = rawLine.trim();

      // If empty, just push to "other" by default
      if (!trimmed) {
        // Keep empty lines for spacing if needed, or push to otherContent
        // Let's keep them for now, can be filtered later if causing issues
        // otherContent.push(rawLine);
        continue;
      }

      // Normalize the line for heading checks (lowercase, remove trailing colon)
      const normalized = trimmed.toLowerCase().replace(/:$/, "");

      // RULE: Ignore the main recipe title (often ends with ':')
      // We check if it ends with ':' and is NOT a known section header we handle
      const knownHeaders = [
        "instructions",
        "directions",
        "steps",
        "method",
        "preparation",
      ];
      if (trimmed.endsWith(":") && !knownHeaders.includes(normalized)) {
        console.log(`Ignoring potential title: ${trimmed}`);
        continue; // Skip this line
      }

      // RULE: Ignore standalone "Ingredients" heading from OpenAI
      if (normalized === "ingredients") {
        console.log(`Ignoring OpenAI Ingredients heading: ${trimmed}`);
        continue; // Skip this line
      }

      // Check if it's an ingredient line
      if (isLikelyIngredient(trimmed)) {
        // Store in our global ingredient list (so we can show them under one heading).
        const ingredientMarkup = `<i>${trimmed}</i>`;
        if (!globalIngredients.includes(ingredientMarkup)) {
          globalIngredients.push(ingredientMarkup);
        }
        // We skip adding it to any other section, because it belongs to "ingredients".
        continue;
      }

      // Check for an instructions heading
      if (
        normalized === "instructions" ||
        normalized.includes("directions") ||
        normalized.includes("steps") ||
        normalized.includes("method") ||
        normalized === "preparation"
      ) {
        // Mark that we're now in instructions
        inInstructions = true;
        // We'll add a standardized heading later. Skip adding the raw line to avoid duplication.
        continue;
      }

      // If we're in instructions, check if it looks like a numbered step
      if (inInstructions) {
        if (
          trimmed.match(/^\d+\./) || // e.g., "1."
          trimmed.match(/^(step\s*\d+)/i) ||
          trimmed.match(/^\d+\)/)
        ) {
          instructionsSection.push(`<step>${trimmed}</step>`);
          continue;
        }
        // Otherwise, it's just a normal instruction line
        instructionsSection.push(rawLine);
        continue;
      }

      // If we get here, it's neither an ingredient nor instructions, so treat it as other content
      otherContent.push(rawLine);
    }

    // Build the final ingredients section if we have any global ingredients
    // We always show them at the top with a single heading.
    if (globalIngredients.length > 0) {
      ingredientsSection.push("<h>Ingredients:</h>");
      ingredientsSection.push(...globalIngredients);
    }

    // If we found instructions, add a single standardized heading before we show them
    if (instructionsSection.length > 0) {
      instructionsSection.unshift("<h>Instructions:</h>");
    }

    // Combine in the order: ingredients → instructions → other
    const combined = [
      ...ingredientsSection,
      ...instructionsSection,
      ...otherContent,
    ];

    // Final deduplication: if any line sneaks in twice, remove duplicates
    const seen = new Set<string>();
    const deduped: string[] = [];
    for (const line of combined) {
      if (!seen.has(line)) {
        seen.add(line);
        deduped.push(line);
      }
    }

    // Log the final text to see if there's duplication in the string
    console.log("Formatted text:\n", deduped.join("\n"));

    return deduped.join("\n");
  }

  // Function to render formatted text with React Native components
  const renderFormattedText = (text: string) => {
    if (!text) return null;

    // Define styles based on original inline styles
    const styles = {
      heading: {
        fontSize: 18,
        fontWeight: "bold" as const,
        color: "#0D9276",
        marginTop: 15,
        marginBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(13, 146, 118, 0.3)",
        paddingBottom: 3,
      },
      stepContainer: {
        flexDirection: "row" as const,
        marginVertical: 4,
        paddingLeft: 8,
      },
      stepNumber: {
        fontSize: 15,
        fontWeight: "bold" as const,
        color: "#0D9276",
        marginRight: 8,
      },
      stepText: { fontSize: 15, flex: 1 },
      ingredientContainer: {
        flexDirection: "row" as const,
        marginVertical: 2,
        paddingLeft: 16,
      },
      ingredientBullet: { fontSize: 15, color: "#0D9276", marginRight: 8 },
      ingredientText: { fontSize: 15, flex: 1 },
      subHeading: {
        fontSize: 16,
        fontWeight: "bold" as const,
        color: "#444",
        marginTop: 12,
        marginBottom: 4,
        backgroundColor: "rgba(13, 146, 118, 0.1)",
        paddingVertical: 3,
        paddingHorizontal: 8,
        borderRadius: 4,
      },
      nutritionFactContainer: {
        flexDirection: "row" as const,
        justifyContent: "space-between" as const,
        marginVertical: 2,
        paddingVertical: 2,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
      },
      nutritionFactLabel: {
        flex: 1,
        fontSize: 15,
        color: "#333",
        fontWeight: "500" as const,
      },
      nutritionFactValue: {
        fontSize: 15,
        fontWeight: "bold" as const,
        color: "#0D9276",
      },
      regularText: { fontSize: 15, marginBottom: 10, color: "#333" }, // Added default color
    };

    // Split by any known tag, keeping the tags as delimiters using regex lookarounds
    const parts = text.split(
      /(<h>|<\/h>|<step>|<\/step>|<i>|<\/i>|<sh>|<\/sh>|<n>|<\/n>)/
    );

    const result = [];
    let key = 0;
    let currentTag: string | null = null;
    let tagStack: string[] = []; // Use a stack for potentially nested tags if needed later

    for (const part of parts) {
      // Skip empty parts resulting from split
      if (!part) continue;

      // Check if the part is an opening tag
      if (part === "<h>") {
        tagStack.push("h");
        currentTag = "h";
        continue;
      }
      if (part === "<step>") {
        tagStack.push("step");
        currentTag = "step";
        continue;
      }
      if (part === "<i>") {
        tagStack.push("i");
        currentTag = "i";
        continue;
      }
      if (part === "<sh>") {
        tagStack.push("sh");
        currentTag = "sh";
        continue;
      }
      if (part === "<n>") {
        tagStack.push("n");
        currentTag = "n";
        continue;
      }

      // Check if the part is a closing tag
      if (
        part === "</h>" ||
        part === "</step>" ||
        part === "</i>" ||
        part === "</sh>" ||
        part === "</n>"
      ) {
        tagStack.pop();
        currentTag = tagStack.length > 0 ? tagStack[tagStack.length - 1] : null;
        continue;
      }

      // If it's not a tag, it's content. Render based on currentTag.
      // Trim whitespace-only parts unless they are intentional (e.g., multiple newlines)
      // For simplicity here, we trim and check if empty. Adjust if specific whitespace needed.
      const trimmedPart = part.trim();
      if (!trimmedPart) continue; // Skip content that is only whitespace

      switch (currentTag) {
        case "h":
          result.push(
            <Text key={key++} style={styles.heading}>
              {trimmedPart}
            </Text>
          );
          break;
        case "step":
          const stepMatch = trimmedPart.match(/^(\d+\.|Step\s*\d+[:.]?)/i);
          const stepNumber = stepMatch
            ? stepMatch[1].replace(/[.:]$/, "")
            : "•";
          const stepText = trimmedPart.replace(
            /^(\d+\.|Step\s*\d+[:.]?)\s*/i,
            ""
          );
          result.push(
            <View key={key++} style={styles.stepContainer}>
              <Text style={styles.stepNumber}>{stepNumber}</Text>
              <Text style={styles.stepText}>{stepText}</Text>
            </View>
          );
          break;
        case "i":
          let cleanIngredient = trimmedPart;
          // Remove leading list markers only if present
          if (
            cleanIngredient.startsWith("- ") ||
            cleanIngredient.startsWith("• ") ||
            cleanIngredient.startsWith("* ")
          ) {
            cleanIngredient = cleanIngredient.substring(2);
          } else if (
            cleanIngredient.startsWith("-") ||
            cleanIngredient.startsWith("•") ||
            cleanIngredient.startsWith("*")
          ) {
            cleanIngredient = cleanIngredient.substring(1).trim();
          }

          result.push(
            <View key={key++} style={styles.ingredientContainer}>
              <Text style={styles.ingredientBullet}>•</Text>
              <Text style={styles.ingredientText}>{cleanIngredient}</Text>
            </View>
          );
          break;
        case "sh":
          result.push(
            <Text key={key++} style={styles.subHeading}>
              {trimmedPart}
            </Text>
          );
          break;
        case "n":
          // Handle nutrition facts
          let factParts = trimmedPart.split(/[:|-]/);
          if (factParts.length >= 2) {
            let label = factParts[0].trim().replace(/^[-•*]\s*/, "");
            let value = factParts.slice(1).join(":").trim();
            result.push(
              <View key={key++} style={styles.nutritionFactContainer}>
                <Text style={styles.nutritionFactLabel}>{label}</Text>
                <Text style={styles.nutritionFactValue}>{value}</Text>
              </View>
            );
          } else {
            // Fallback for nutrition fact - render as regular text?
            result.push(
              <Text key={key++} style={styles.regularText}>
                {trimmedPart}
              </Text>
            );
          }
          break;
        default: // No current tag or unknown tag, treat as regular text
          // Split by newlines to render paragraphs correctly
          const paragraphs = trimmedPart
            .split("\n")
            .filter((p) => p.trim() !== "");
          paragraphs.forEach((paragraph, index) => {
            result.push(
              <Text key={`${key++}-${index}`} style={styles.regularText}>
                {paragraph}
              </Text>
            );
          });
          break;
      }
    }

    return result;
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView>
        <View className="w-full justify-center min-h-[70vh] px-4 my-6">
          <View className="items-center">
            <Link href="/home">
              <Image
                source={images.logo}
                resizeMode="contain"
                style={{ width: 200, height: 55 }}
              />
            </Link>
          </View>
          {!aiResponse ? (
            <>
              <Text className="text-2xl text-black font-bold mt-10 text-center">
                Welcome to FruitLens
              </Text>
              <Text className="text-gray-600 text-center mt-2 mb-4">
                Capture a fruit to get a delicious recipe
              </Text>

              {/* Attractive Initial Screen - Only show when no image */}
              {!image && (
                <View className="items-center justify-center my-8">
                  {/* Decorative Circle */}
                  <View
                    style={{
                      width: 280,
                      height: 280,
                      borderRadius: 140,
                      backgroundColor: "rgba(13, 146, 118, 0.1)",
                      justifyContent: "center",
                      alignItems: "center",
                      borderWidth: 2,
                      borderColor: "rgba(13, 146, 118, 0.3)",
                      marginBottom: 20,
                    }}
                  >
                    {/* Camera and Fruit Icons */}
                    <View style={{ alignItems: "center" }}>
                      {/* Camera Icon */}
                      <View
                        style={{
                          width: 80,
                          height: 80,
                          borderRadius: 40,
                          backgroundColor: "#0D9276",
                          justifyContent: "center",
                          alignItems: "center",
                          marginBottom: 15,
                        }}
                      >
                        <Text style={{ fontSize: 40, color: "white" }}>📸</Text>
                      </View>

                      {/* Arrow Down */}
                      <Text
                        style={{
                          fontSize: 30,
                          color: "#0D9276",
                          marginVertical: 5,
                        }}
                      >
                        ↓
                      </Text>

                      {/* Fruits Icons */}
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "center",
                          marginTop: 10,
                        }}
                      >
                        <Text style={{ fontSize: 30, marginHorizontal: 5 }}>
                          🍎
                        </Text>
                        <Text style={{ fontSize: 30, marginHorizontal: 5 }}>
                          🍌
                        </Text>
                        <Text style={{ fontSize: 30, marginHorizontal: 5 }}>
                          🍊
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* App Description */}
                  <View
                    style={{
                      backgroundColor: "white",
                      borderRadius: 12,
                      padding: 16,
                      width: "100%",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        color: "#444",
                        lineHeight: 22,
                        textAlign: "center",
                      }}
                    >
                      FruitLens helps you identify fruits and provides recipes
                      and nutrition information. Just take a picture to get
                      started!
                    </Text>
                  </View>
                </View>
              )}

              <CustomButton
                title={"Open Camera"}
                handlePress={openCamera}
                containerStyles="mt-5"
                textStyles={undefined}
                isLoading={isSubmitting || isFetchingLocation}
              />

              {/* Display the detected object and recipe prompt */}
              {!isSubmitting && detectedObjects.length > 0 && (
                <View className="mt-8 w-full px-4 bg-white rounded-xl py-5 shadow-sm">
                  <Text className="text-xl text-black font-bold mb-3 text-center">
                    Detected Fruit
                  </Text>
                  {validFruits.includes(
                    detectedObjects[0].label.toLowerCase()
                  ) ? (
                    <>
                      <Text className="text-2xl text-green-600 font-semibold text-center mb-3">
                        {detectedObjects[0].label}
                      </Text>

                      {/* Recipe Request Prompt - Only shown for valid fruits */}
                      <View className="mt-6 bg-gray-50 p-4 rounded-lg">
                        <Text className="text-md text-gray-800 mb-3 text-center font-medium">
                          What would you like to know?
                        </Text>
                        <View className="flex-row space-x-10 justify-center">
                          <CustomButton
                            title="Get Recipe"
                            handlePress={handleRecipeRequest}
                            containerStyles="flex-1 px-4 py-2 mx-4"
                            textStyles={undefined}
                            isLoading={loadingAI}
                          />
                          <CustomButton
                            title="Nutrition"
                            handlePress={handleNutritionRequest}
                            containerStyles="flex-1 px-4 py-2 mx-4"
                            textStyles={undefined}
                            isLoading={loadingAI}
                          />
                        </View>
                      </View>
                    </>
                  ) : (
                    <Text className="text-red-500 text-lg text-center font-medium">
                      Sorry, your object is not a fruit. Try again.
                    </Text>
                  )}
                </View>
              )}
            </>
          ) : (
            <>
              {/* Only Display OpenAI Response */}
              <View className="mt-5 w-full bg-white rounded-xl p-6 shadow-sm">
                <Text className="text-2xl text-black font-bold mb-4 text-center">
                  {showingNutrition ? "Nutrition Information" : "Recipe"}
                </Text>

                {/* Display formatted response */}
                <View style={{ marginBottom: 20 }}>
                  {renderFormattedText(aiResponse)}
                </View>

                <CustomButton
                  title="Back to Results"
                  handlePress={() => {
                    // Only reset the AI response, keep the detected object and image
                    setAiResponse("");
                    setNutritionInfo("");
                    setShowingNutrition(false);
                  }}
                  containerStyles="mt-8"
                  textStyles={undefined}
                  isLoading={false}
                />
              </View>
            </>
          )}

          {/* Loading indicator */}
          {loadingAI && (
            <ActivityIndicator
              size="large"
              color="#0D9276"
              style={{ marginTop: 20 }}
            />
          )}

          {/* Captured Image - Only show when not displaying AI response */}
          {image && imageDimensions && !aiResponse && (
            <View className="items-center mt-8">
              <Text className="text-xl text-black font-semibold mb-4 text-center">
                Captured Image
              </Text>
              <View
                style={{
                  width: 280,
                  height: 280,
                  borderRadius: 140,
                  overflow: "hidden",
                  borderWidth: 3,
                  borderColor: "#0D9276",
                  backgroundColor: "#f8f8f8",
                  justifyContent: "center",
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOffset: {
                    width: 0,
                    height: 3,
                  },
                  shadowOpacity: 0.27,
                  shadowRadius: 4.65,
                  elevation: 6,
                }}
              >
                <Image
                  source={{ uri: image }}
                  style={{
                    width: "100%",
                    height: "100%",
                  }}
                  resizeMode="cover"
                />
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default Home;
