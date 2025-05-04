import React, { useState, useEffect } from "react";
import {
  ScrollView,
  Text,
  View,
  Image,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from "@/components/CustomButton";
import images from "@/constants/images";
import * as Location from "expo-location";
import DropDownPicker from "react-native-dropdown-picker";
import { fetchPriceComparison } from "@/services/scraperService";

// Add types
interface StoreResult {
  store_chain: string;
  store_name: string;
  address: string;
  distance: string;
  distance_num: number;
  price: number;
  price_display: string;
}

interface SearchResults {
  by_price: StoreResult[];
  by_distance: StoreResult[];
}

interface CartSummaryData {
  summary_available: boolean;
  message?: string;
  total_products?: number;
  best_price_store?: {
    store_chain: string;
    store_name: string;
    address: string;
    distance: string;
    total_price: number;
    products_found: number;
    products_missing: number;
    coverage: number;
  };
  best_distance_store?: {
    store_chain: string;
    store_name: string;
    address: string;
    distance: string;
    total_price: number;
    products_found: number;
    products_missing: number;
    coverage: number;
  };
  potential_savings?: number;
  potential_savings_display?: string;
}

interface ItemSearchResult {
  status: string;
  message: string;
  location: string;
  product: string;
  hebrew_product: string;
  results: SearchResults;
}

interface ResultsTableProps {
  results: StoreResult[];
  sortBy: 'price' | 'distance';
  onSortChange: (sort: 'price' | 'distance', itemName: string) => void;
  itemName: string;
}

// Update ResultsTable component with types
const ResultsTable: React.FC<ResultsTableProps> = ({ results, sortBy, onSortChange, itemName }) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);
  
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  const openMapsWithAddress = (address: string) => {
    try {
      // Create a Google Maps URL with the address
      const encodedAddress = encodeURIComponent(address);
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
      
      // Check if the link can be opened
      Linking.canOpenURL(mapsUrl).then(supported => {
        if (supported) {
          Linking.openURL(mapsUrl);
        } else {
          console.log("Can't open URL: " + mapsUrl);
          Alert.alert("Error", "Cannot open Google Maps with this address.");
        }
      });
    } catch (error) {
      console.error("Error opening maps:", error);
      Alert.alert("Error", "Could not open maps application.");
    }
  };
  
  if (!results || results.length === 0) return null;

  return (
    <View style={styles.tableContainer}>
      {/* Table Header with Filters - Now Clickable */}
      <TouchableOpacity 
        style={styles.tableHeader}
        onPress={toggleCollapse}
        activeOpacity={0.7}
      >
        <Text style={styles.tableTitle}>{itemName}</Text>
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              sortBy === 'price' && styles.filterButtonActive
            ]}
            onPress={(e) => {
              e.stopPropagation();
              onSortChange('price', itemName);
            }}
          >
            <Text style={[
              styles.filterButtonText,
              sortBy === 'price' && styles.filterButtonTextActive
            ]}>Price</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              sortBy === 'distance' && styles.filterButtonActive
            ]}
            onPress={(e) => {
              e.stopPropagation();
              onSortChange('distance', itemName);
            }}
          >
            <Text style={[
              styles.filterButtonText,
              sortBy === 'distance' && styles.filterButtonTextActive
            ]}>Distance</Text>
          </TouchableOpacity>
          <Text style={styles.collapseIndicator}>
            {isCollapsed ? '▼' : '▲'}
          </Text>
        </View>
      </TouchableOpacity>

      {!isCollapsed && (
        <View style={styles.table}>
          {/* Column Headers with Location Icon to indicate clickable rows */}
          <View style={styles.headerRow}>
            <Text style={[styles.headerCell, { flex: 2 }]}>Store</Text>
            <Text style={[styles.headerCell, { flex: 2.5 }]}>Branch</Text>
            <Text style={[styles.headerCell, { flex: 1.5, textAlign: 'center' }]}>Dist</Text>
            <Text style={[styles.headerCell, { flex: 1.7, textAlign: 'center' }]}>Price</Text>
          </View>
          
          {/* Small Help Text */}
          <View style={styles.tableHelpTextContainer}>
            <Text style={styles.tableHelpText}>Tap on a row to open location in Maps</Text>
          </View>
          
          {/* Table Rows */}
          {results.map((item: StoreResult, index: number) => (
            <TouchableOpacity 
              key={index} 
              style={[
                styles.tableRow,
                index === 0 && sortBy === 'price' && styles.bestPrice,
                index === 0 && sortBy === 'distance' && styles.bestDistance,
                index % 2 === 0 && styles.evenRow,
              ]}
              onPress={() => openMapsWithAddress(item.address)}
              activeOpacity={0.7}
            >
              <View style={[styles.cell, { flex: 2 }]}>
                <Text style={[styles.cellText, styles.rtlText]}>{item.store_chain}</Text>
              </View>

              <View style={[styles.cell, { flex: 2.5 }]}>
                <Text style={[styles.cellText, styles.rtlText]}>{item.store_name}</Text>
              </View>

              <View style={[styles.cell, { flex: 1.5, alignItems: 'center' }]}>
                <Text style={[
                  styles.cellText, 
                  styles.distanceText,
                  index === 0 && sortBy === 'distance' && styles.bestDistanceText,
                  { textAlign: 'center' }
                ]}>
                  {item.distance && item.distance !== "מרחק לא זמין" 
                    ? item.distance 
                    : "-"}
                </Text>
              </View>

              <View style={[styles.cell, { flex: 1.7, alignItems: 'center' }]}>
                <Text style={[
                  styles.cellText,
                  styles.priceText,
                  index === 0 && sortBy === 'price' && styles.bestPriceText,
                  { textAlign: 'center' }
                ]}>
                  {item.price_display}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

// Add the CartSummary component
const CartSummary: React.FC<{ cartSummary: CartSummaryData }> = ({ cartSummary }) => {
  if (!cartSummary || !cartSummary.summary_available) {
    return null;
  }

  const openMapsWithAddress = (address: string) => {
    try {
      // Create a Google Maps URL with the address
      const encodedAddress = encodeURIComponent(address);
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
      
      // Check if the link can be opened
      Linking.canOpenURL(mapsUrl).then(supported => {
        if (supported) {
          Linking.openURL(mapsUrl);
        } else {
          console.log("Can't open URL: " + mapsUrl);
          Alert.alert("Error", "Cannot open Google Maps with this address.");
        }
      });
    } catch (error) {
      console.error("Error opening maps:", error);
      Alert.alert("Error", "Could not open maps application.");
    }
  };

  return (
    <View style={styles.summaryContainer}>
      <Text style={styles.summaryTitle}>Cart Summary</Text>
      
      {cartSummary.best_price_store && (
        <TouchableOpacity 
          style={styles.bestStoreContainer}
          onPress={() => openMapsWithAddress(cartSummary.best_price_store!.address)}
          activeOpacity={0.7}
        >
          <Text style={styles.bestStoreTitle}>💰 Best Price Store:</Text>
          <View style={styles.storeBadge}>
            <Text style={styles.storeName}>
              {cartSummary.best_price_store.store_chain} - {cartSummary.best_price_store.store_name}
            </Text>
          </View>
          <Text style={styles.storeAddress}>
            {cartSummary.best_price_store.address}
          </Text>
          <Text style={styles.storeStat}>
            Distance: <Text style={styles.storeStatValue}>{cartSummary.best_price_store.distance}</Text>
          </Text>
          <Text style={styles.storeStat}>
            Total Price: <Text style={styles.storeStatValuePrice}>₪{cartSummary.best_price_store.total_price.toFixed(2)}</Text>
          </Text>
          <Text style={styles.storeStat}>
            Products Available: <Text style={styles.storeStatValue}>
              {cartSummary.best_price_store.products_found}/{cartSummary.total_products}
            </Text>
          </Text>
          <View style={styles.mapLinkContainer}>
            <Text style={styles.mapLinkText}>📍 Tap to open in Maps</Text>
          </View>
        </TouchableOpacity>
      )}
      
      {cartSummary.best_distance_store && (
        <TouchableOpacity 
          style={styles.bestStoreContainer}
          onPress={() => openMapsWithAddress(cartSummary.best_distance_store!.address)}
          activeOpacity={0.7}
        >
          <Text style={styles.bestStoreTitle}>🚶 Closest Store:</Text>
          <View style={styles.storeBadge}>
            <Text style={styles.storeName}>
              {cartSummary.best_distance_store.store_chain} - {cartSummary.best_distance_store.store_name}
            </Text>
          </View>
          <Text style={styles.storeAddress}>
            {cartSummary.best_distance_store.address}
          </Text>
          <Text style={styles.storeStat}>
            Distance: <Text style={styles.storeStatValueDistance}>{cartSummary.best_distance_store.distance}</Text>
          </Text>
          <Text style={styles.storeStat}>
            Total Price: <Text style={styles.storeStatValue}>₪{cartSummary.best_distance_store.total_price.toFixed(2)}</Text>
          </Text>
          <Text style={styles.storeStat}>
            Products Available: <Text style={styles.storeStatValue}>
              {cartSummary.best_distance_store.products_found}/{cartSummary.total_products}
            </Text>
          </Text>
          <View style={styles.mapLinkContainer}>
            <Text style={styles.mapLinkText}>📍 Tap to open in Maps</Text>
          </View>
        </TouchableOpacity>
      )}
      
      {cartSummary.potential_savings !== undefined && cartSummary.potential_savings > 0 && (
        <View style={styles.savingsContainer}>
          <Text style={styles.savingsText}>
            Potential savings: <Text style={styles.savingsValue}>{cartSummary.potential_savings_display}</Text>
          </Text>
        </View>
      )}
    </View>
  );
};

const SmartCart = () => {
  const [useCurrentLocation, setUseCurrentLocation] = useState<boolean>(false);
  const [manualLocation, setManualLocation] = useState<string>("");
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [formattedAddress, setFormattedAddress] = useState<string>("");
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

  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [sortByMap, setSortByMap] = useState<{ [key: string]: 'price' | 'distance' }>({});

  const scrollViewRef = React.useRef<ScrollView>(null);
  const resultsRef = React.useRef<View>(null);
  const [resultsPosition, setResultsPosition] = useState<number>(0);
  const [showScrollIndicator, setShowScrollIndicator] = useState<boolean>(false);
  
  const initialScrollDone = React.useRef(false);

  const [allResults, setAllResults] = useState<ItemSearchResult[]>([]);
  const [cartSummary, setCartSummary] = useState<CartSummaryData | null>(null);

  useEffect(() => {
    if (useCurrentLocation) {
      (async () => {
        try {
          // Show loading feedback immediately
          setManualLocation("Getting your location...");
          
          // Request permission with a longer timeout
          let { status } = await Promise.race([
            Location.requestForegroundPermissionsAsync(),
            new Promise<any>((_, reject) => 
              setTimeout(() => reject(new Error("Location permission request timed out")), 10000)
            )
          ]);
          
          if (status !== "granted") {
            alert("Permission to access location was denied");
            setUseCurrentLocation(false);
            setManualLocation("");
            return;
          }

          // Get current position with longer timeout
          let loc = await Promise.race([
            Location.getCurrentPositionAsync({ 
              accuracy: Location.Accuracy.Low, // Use lower accuracy for faster results
              mayShowUserSettingsDialog: true 
            }),
            new Promise<any>((_, reject) => 
              setTimeout(() => reject(new Error("Location retrieval timed out")), 15000)
            )
          ]);
          
          setLocation(loc.coords);
          
          // Update UI immediately with coordinates while we wait for full address
          const coordsString = `${loc.coords.latitude.toFixed(6)}, ${loc.coords.longitude.toFixed(6)}`;
          setManualLocation(coordsString);
          setFormattedAddress(coordsString);

          // Get address from coordinates
          try {
            const addresses = await Promise.race([
              Location.reverseGeocodeAsync({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
              }),
              new Promise<any>((_, reject) => 
                setTimeout(() => reject(new Error("Geocoding timed out")), 10000)
              )
            ]);

            if (addresses && addresses.length > 0) {
              const address = addresses[0];
              
              // Clean street name to remove any "רח׳" prefix
              let street = address.street || "";
              street = street.replace(/^רח['׳]\s*/i, "").trim();
              
              // Format address with only street and city: "street, city"
              const city = address.city || "";
              
              // Only include non-empty values and join with comma
              const formattedAddr = [street, city]
                .filter(part => part && part.trim().length > 0)
                .join(", ");
              
              console.log("Simplified address:", formattedAddr);
              setFormattedAddress(formattedAddr);
              setManualLocation(formattedAddr); // Set this as the manual location for the API
            }
          } catch (geocodeError) {
            console.warn("Geocoding error:", geocodeError);
            // Continue with coordinates if geocoding fails
            Alert.alert(
              "Address Lookup Limited",
              "Using GPS coordinates instead of full address. Results may be less accurate.",
              [{ text: "OK" }]
            );
          }
        } catch (error) {
          console.error("Error getting location:", error);
          
          // More detailed error message
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          
          // Provide more helpful message based on error
          if (errorMessage.includes("timed out")) {
            Alert.alert(
              "Location Timeout",
              "Getting your location is taking too long. Please try again or enter your location manually.",
              [{ text: "OK" }]
            );
          } else {
            Alert.alert(
              "Location Error",
              "Could not get your current location. Please check if location services are enabled and try again.",
              [{ text: "OK" }]
            );
          }
          
          setUseCurrentLocation(false);
          setManualLocation("");
        }
      })();
    } else {
      setLocation(null);
      setFormattedAddress("");
      setManualLocation("");
    }
  }, [useCurrentLocation]);

  const getCurrentLocation = async () => {
    try {
      setUseCurrentLocation(true);
    } catch (error) {
      console.error("Error in getCurrentLocation:", error);
      Alert.alert("Location Error", "Failed to get current location. Please try again or enter your location manually.");
    }
  };

  const handleSubmit = async () => {
    if ((!useCurrentLocation && !manualLocation) || selectedItems.length === 0) {
      alert("Please enter a location and select items.");
      return;
    }

    // Use the formatted address or manual input
    const locationToUse = manualLocation;

    try {
      setIsSubmitting(true);
      setSearchResults(null); // Clear previous results
      setAllResults([]); // Clear previous results
      setCartSummary(null); // Clear previous cart summary
      setSortByMap({}); // Reset sort preferences
      initialScrollDone.current = false; // Reset scroll done flag
      
      // Start scrolling immediately to loading indicator
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
      // Use the scraperService to fetch data
      const response = await fetchPriceComparison(locationToUse, selectedItems);
      
      console.log("Raw API Response:", response);
      
      if (response.status === 'success' && response.results) {
        // Initialize sort preferences for each result
        const newSortMap: { [key: string]: 'price' | 'distance' } = {};
        response.results.forEach((result: ItemSearchResult) => {
          if (result.status === 'success') {
            newSortMap[result.product] = 'price'; // Default sort by price
          }
        });
        setSortByMap(newSortMap);
        
        // Store all results
        setAllResults(response.results);
        
        // Set cart summary if available
        if (response.cart_summary) {
          setCartSummary(response.cart_summary);
        }
        
        // Get the first valid result for initial display
        const firstValidResult = response.results.find((result: ItemSearchResult) => 
          result.status === 'success' && 
          result.results && 
          (result.results.by_price?.length > 0 || result.results.by_distance?.length > 0)
        );

        if (firstValidResult) {
          console.log("Setting search results:", firstValidResult.results);
          setSearchResults(firstValidResult.results);
          
          // Force scroll after state updates are complete
          setIsSubmitting(false); // Remove loading indicator early
          
          // Using setTimeout cascade for more reliable scrolling
          setTimeout(() => scrollToResults(true), 300);
        } else {
          console.error("No valid results found");
          Alert.alert('No Results', 'No price data found for the selected items.');
          setIsSubmitting(false);
        }
      } else {
        console.error("Invalid response format:", response);
        Alert.alert('Error', response.message || 'Invalid response format');
        setIsSubmitting(false);
      }
      
    } catch (error) {
      console.error("Error during scraping:", error);
      
      // Show more user-friendly error message
      if (Platform.OS === 'ios') {
        Alert.alert(
          'Network Error', 
          'The server is not responding. Please try again later or check your internet connection.'
        );
      } else {
        Alert.alert('Error', 'An error occurred while fetching the data.');
      }
      setIsSubmitting(false);
    }
  };

  // Update the scrollToResults function for more reliable scrolling but prevent unwanted scrolling
  const scrollToResults = (force: boolean = false) => {
    // Only scroll on initial load or when explicitly forced
    if ((allResults.length > 0 && !initialScrollDone.current) || force) {
      console.log("Attempting to scroll to results at position:", resultsPosition);
      if (scrollViewRef.current) {
        // Show scroll indicator
        setShowScrollIndicator(true);
        
        // Use timeout to ensure the view has been rendered and measured
        setTimeout(() => {
          if (resultsPosition > 0) {
            console.log("Scrolling to position:", resultsPosition);
            scrollViewRef.current?.scrollTo({ 
              y: resultsPosition, 
              animated: true 
            });
          } else {
            console.log("Results position not set yet, using direct ref access");
            // Fallback method if position is not set
            if (resultsRef.current) {
              // @ts-ignore - accessing private properties, but needed for scrolling
              resultsRef.current.measureInWindow((x, y) => {
                console.log("Measured results position:", y);
                const scrollPosition = y - 50; // 50px offset from top
                scrollViewRef.current?.scrollTo({
                  y: Math.max(0, scrollPosition),
                  animated: true
                });
              });
            }
          }
          
          // Hide indicator after animation completes
          setTimeout(() => {
            setShowScrollIndicator(false);
            initialScrollDone.current = true; // Mark as scrolled
          }, 1500);
        }, 500); // Longer delay to ensure render is complete
      }
    }
  };

  // Handle sort change for a specific item table
  const handleSortChange = (sort: 'price' | 'distance', itemName: string) => {
    setSortByMap(prev => ({
      ...prev,
      [itemName]: sort
    }));
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView ref={scrollViewRef}>
        <View className="w-full justify-center min-h-[70vh] px-4 my-6">
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
          
          <Text style={styles.explanationText}>
            Find the best prices for fruits and vegetables in your area. Simply enter your location and select the items you want to compare.
          </Text>

          {/* Location Input */}
          <View style={{ marginTop: 28 }}>
            <Text style={{ fontSize: 16, fontWeight: "500", marginBottom: 8 }}>
              Your Location
            </Text>
            
            <View
              style={styles.locationButtonContainer}
            >
              <CustomButton
                title={
                  useCurrentLocation
                    ? "Remove Current Location"
                    : "Use Current Location"
                }
                handlePress={useCurrentLocation ? 
                  () => setUseCurrentLocation(false) : 
                  getCurrentLocation
                }
                containerStyles={useCurrentLocation ? styles.removeLocationButton : styles.useLocationButton}
                textStyles={useCurrentLocation ? styles.removeLocationButtonText : undefined}
                isLoading={useCurrentLocation && !formattedAddress}
              />
            </View>

            {useCurrentLocation ? (
              <View style={styles.currentLocationContainer}>
                {!formattedAddress ? (
                  <View style={styles.locationLoadingContainer}>
                    <ActivityIndicator size="small" color="#0D9276" />
                    <Text style={styles.locationLoadingText}>Finding your location...</Text>
                  </View>
                ) : (
                  <Text style={styles.currentLocationText}>
                    {formattedAddress}
                  </Text>
                )}
              </View>
            ) : (
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
              <View style={{ marginTop: 25 }}>
                <Text style={{ fontSize: 16, fontWeight: "500" }}>
                  Selected Items:
                </Text>
                {selectedItems.map((item, index) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 12,
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
                      style={styles.removeItemButton}
                    >
                      <Text style={{ color: "#fff" }}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Submit Button */}
          <View style={styles.submitButtonContainer}>
            <CustomButton
              title="Submit"
              handlePress={handleSubmit}
              containerStyles={styles.submitButton}
              textStyles={undefined}
              isLoading={isSubmitting}
            />
          </View>

          {/* Display Results */}
          {searchResults && (
            <View 
              ref={resultsRef}
              onLayout={(event) => {
                const layout = event.nativeEvent.layout;
                console.log("Results layout measured at y:", layout.y);
                setResultsPosition(layout.y);
                
                // Attempt scroll on layout for more reliability but only if not yet scrolled
                if (allResults.length > 0 && !initialScrollDone.current) {
                  setTimeout(() => scrollToResults(true), 100);
                }
              }}
              style={styles.resultsWrapper}
            >
              {/* Cart Summary */}
              {cartSummary && cartSummary.summary_available && (
                <CartSummary cartSummary={cartSummary} />
              )}
              
              <Text style={styles.resultsHeaderText}>Price Comparison Results</Text>
              
              {allResults.map((result: ItemSearchResult, index: number) => {
                if (result.status === 'success' && result.results && 
                    (result.results.by_price?.length > 0 || result.results.by_distance?.length > 0)) {
                  // Get sort preference for this specific item
                  const currentSortBy = sortByMap[result.product] || 'price';
                  
                  return (
                    <ResultsTable 
                      key={index}
                      results={currentSortBy === 'price' ? result.results.by_price : result.results.by_distance}
                      sortBy={currentSortBy}
                      onSortChange={handleSortChange}
                      itemName={result.product}
                    />
                  );
                }
                return null;
              })}
            </View>
          )}
          
          {/* Scroll Indicator */}
          {showScrollIndicator && (
            <View style={styles.scrollIndicator}>
              <Text style={styles.scrollIndicatorText}>Scrolling to results...</Text>
            </View>
          )}

          {isSubmitting && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0D9276" />
              <Text style={styles.loadingText}>Searching for prices...</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  resultsContainer: {
    padding: 16,
    backgroundColor: '#fff',
    marginTop: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  resultsTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
    color: '#0D9276',
    textAlign: 'center',
  },
  tableContainer: {
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0D9276',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  tableTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginLeft: 8,
  },
  filterButtonActive: {
    backgroundColor: '#fff',
  },
  filterButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#0D9276',
  },
  table: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  headerRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#0D9276',
    borderBottomWidth: 2,
    borderBottomColor: '#0b7960',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#edf2f7',
    backgroundColor: '#fff',
  },
  evenRow: {
    backgroundColor: '#f8fafb',
  },
  headerCell: {
    fontWeight: '600',
    color: '#fff',
    fontSize: 15,
    paddingHorizontal: 4,
  },
  cell: {
    paddingHorizontal: 6,
    justifyContent: 'center',
  },
  cellText: {
    fontSize: 14,
    color: '#2d3748',
    fontWeight: '400',
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  priceText: {
    fontWeight: '600',
    color: '#0D9276',
  },
  bestPrice: {
    backgroundColor: '#fff5f5',
    borderLeftWidth: 4,
    borderLeftColor: '#ff4444',
  },
  bestDistance: {
    backgroundColor: '#e6f7f2',
    borderLeftWidth: 4,
    borderLeftColor: '#0D9276',
  },
  bestPriceText: {
    fontWeight: '700',
    fontSize: 15,
    color: '#ff4444',
  },
  bestDistanceText: {
    fontWeight: '700',
    fontSize: 15,
    color: '#0D9276',
  },
  loadingContainer: {
    marginTop: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#0D9276',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  currentLocationContainer: {
    backgroundColor: '#fff',
    padding: 10,
    marginTop: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#0D9276',
  },
  currentLocationText: {
    fontSize: 16,
    color: '#0D9276',
    textAlign: 'right',
    fontWeight: '500',
  },
  collapseIndicator: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  distanceText: {
    fontWeight: '600',
    color: '#0D9276',
  },
  locationButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
    marginTop: 20,
    width: '100%',
  },
  useLocationButton: {
    backgroundColor: '#0D9276',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    minWidth: '60%',
    alignItems: 'center',
  },
  removeLocationButton: {
    backgroundColor: '#ff5c5c',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    minWidth: '60%',
    alignItems: 'center',
  },
  removeLocationButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  explanationText: {
    fontSize: 15,
    color: "#555",
    marginTop: 10,
    marginBottom: 20,
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  resultsWrapper: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eaeaea',
  },
  resultsHeaderText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0D9276',
    textAlign: 'center',
    marginBottom: 15,
  },
  scrollIndicator: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: 'rgba(13, 146, 118, 0.9)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  scrollIndicatorText: {
    color: '#fff',
    fontWeight: '500',
  },
  removeItemButton: {
    backgroundColor: "#ff5c5c",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    marginTop: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  submitButtonContainer: {
    marginTop: 50, 
    marginBottom: 40,
    alignItems: 'center',
    width: '100%',
  },
  submitButton: {
    minWidth: '80%',
  },
  locationLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  locationLoadingText: {
    marginLeft: 10,
    color: '#0D9276',
    fontSize: 14,
    fontWeight: '500',
  },
  summaryContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  summaryTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0D9276',
    marginBottom: 16,
    textAlign: 'center',
  },
  bestStoreContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8fafb',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#0D9276',
  },
  bestStoreTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 8,
  },
  storeBadge: {
    backgroundColor: '#0D9276',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  storeName: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  storeAddress: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  storeStat: {
    fontSize: 15,
    color: '#444',
    marginBottom: 4,
  },
  storeStatValue: {
    fontWeight: '600',
    color: '#0D9276',
  },
  storeStatValuePrice: {
    fontWeight: '700',
    color: '#ff4444',
  },
  storeStatValueDistance: {
    fontWeight: '700',
    color: '#0D9276',
  },
  savingsContainer: {
    backgroundColor: '#fff5f5',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#ff4444',
    marginTop: 12,
  },
  savingsText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  savingsValue: {
    fontWeight: '700',
    fontSize: 18,
    color: '#ff4444',
  },
  mapLinkContainer: {
    backgroundColor: '#e6f7f2',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: 8,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#0D9276',
  },
  mapLinkText: {
    color: '#0D9276',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  tableHelpTextContainer: {
    backgroundColor: '#f0f9f6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tableHelpText: {
    fontSize: 12,
    color: '#0D9276',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default SmartCart;
