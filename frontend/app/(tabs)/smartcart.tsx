import React, { useState, useEffect } from "react";
import {
  ScrollView,
  Text,
  View,
  Image,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from "@/components/CustomButton";
import { images } from "../../constants";
import axios from "axios";
import * as Location from "expo-location";
import DropDownPicker from "react-native-dropdown-picker";

const SmartCart = () => {
  const [useCurrentLocation, setUseCurrentLocation] = useState<boolean>(false);
  const [manualLocation, setManualLocation] = useState<string>("");
  const [location, setLocation] =
    useState<Location.LocationObjectCoords | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [open, setOpen] = useState<boolean>(false);

  const items: string[] = [
    "Apples",
    "Bananas",
    "Carrots",
    "Tomatoes",
    "Potatoes",
    "Lettuce",
    "Oranges",
    "Grapes",
    "Spinach",
    "Onions",
    "Cucumbers",
    "Peppers",
    "Avocado",
    "Parsley",
    "Celery",
    "Cabbage",
    "Cauliflower",
    "Broccoli",
    "Mushrooms",
    "Strawberries",
    "Pineapple",
    "Peaches",
    "Plums",
    "Pears",
    "Mango",
    "Kiwi",
    "Cherries",
    "Pomegranates",
    "Lemons",
    "Watermelon",
    "Melon",
    "Garlic",
    "Olives",
  ];
  const [itemsList, setItemsList] = useState(
    items.map((item) => ({ label: item, value: item }))
  );

  useEffect(() => {
    if (useCurrentLocation) {
      (async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          alert("Permission to access location was denied");
          return;
        }
        let loc = await Location.getCurrentPositionAsync({});
        setLocation(loc.coords);
      })();
    } else {
      setLocation(null);
    }
  }, [useCurrentLocation]);

  const handleSubmit = async () => {
    if (
      (!useCurrentLocation && !manualLocation) ||
      selectedItems.length === 0
    ) {
      alert("Please enter a location and select items.");
      return;
    }

    const data = {
      location: useCurrentLocation ? location : manualLocation,
      items: selectedItems,
    };
    try {
      setIsSubmitting(true);
      const response = await axios.post("YOUR_BACKEND_ENDPOINT", data);
      console.log(response.data);
      alert("Data submitted successfully!");
    } catch (error) {
      console.error(error);
      alert("An error occurred while submitting the data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView>
        <View
          style={{ width: "100%", paddingHorizontal: 16, marginVertical: 24 }}
        >
          {/* Logo at the top */}
          <View style={{ alignItems: "center" }}>
            <Image
              source={images.logo} // Replace with your logo image
              resizeMode="contain"
              style={{ width: 200, height: 55 }}
            />
          </View>
          <Text
            style={{
              fontSize: 18,
              color: "#000",
              fontWeight: "600",
              marginTop: 40,
            }}
          >
            Welcome to SmartCart
          </Text>

          {/* Location Input */}
          <View style={{ marginTop: 28 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 8,
                justifyContent: "flex-end",
              }}
            >
              <CustomButton
                title={
                  useCurrentLocation
                    ? "Remove Current Location"
                    : "Use Current Location"
                }
                handlePress={() => setUseCurrentLocation(!useCurrentLocation)}
                containerStyles={{
                  alignSelf: "flex-end",
                }}
                size="small"
                textStyles={undefined}
                isLoading={false}
              />
            </View>
            {!useCurrentLocation && (
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: "#ddd",
                  padding: 10,
                  marginTop: 10,
                  borderRadius: 5,
                  textAlign: "right",
                  backgroundColor: "#fff",
                }}
                placeholder="Enter your location"
                value={manualLocation}
                onChangeText={setManualLocation}
              />
            )}
          </View>

          {/* Fruits and Vegetables Selection */}
          <View style={{ marginTop: 28 }}>
            <Text style={{ fontSize: 16, fontWeight: "500", marginBottom: 8 }}>
              Select Items
            </Text>

            <DropDownPicker
              open={open}
              setOpen={setOpen}
              multiple={true}
              value={selectedItems}
              setValue={setSelectedItems}
              items={itemsList}
              setItems={setItemsList}
              placeholder="Select items"
              style={{
                borderColor: "#ddd",
                height: 40,
              }}
              dropDownContainerStyle={{
                borderColor: "#ddd",
              }}
              listMode="MODAL"
              modalProps={{
                animationType: "slide",
              }}
              modalContentContainerStyle={{
                backgroundColor: "#FFF6E9",
              }}
              searchable={true}
              searchPlaceholder="Search for an item..."
              zIndex={1000}
              zIndexInverse={1000}
            />

            {/* Display Selected Items */}
            {selectedItems.length > 0 && (
              <View style={{ marginTop: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: "500" }}>
                  Selected Items:
                </Text>
                {selectedItems.map((item, index) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 8,
                      justifyContent: "space-between",
                    }}
                  >
                    <Text>{item}</Text>
                    <TouchableOpacity
                      onPress={() =>
                        setSelectedItems(
                          selectedItems.filter((selected) => selected !== item)
                        )
                      }
                      style={{
                        backgroundColor: "#ff5c5c",
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        borderRadius: 5,
                      }}
                    >
                      <Text style={{ color: "#fff" }}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Submit Button */}
          <View style={{ marginTop: 40 }}>
            <CustomButton
              title="Submit"
              handlePress={handleSubmit}
              containerStyles=""
              textStyles={undefined}
              isLoading={isSubmitting}
            />
          </View>

          {/* Show loading spinner if submitting */}
          {isSubmitting && (
            <ActivityIndicator
              size="large"
              color="#0000ff"
              style={{ marginTop: 16 }}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SmartCart;
