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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from "@/components/CustomButton";
import images from "@/constants/images";
import axios from "axios";
import * as Location from "expo-location";
import DropDownPicker from "react-native-dropdown-picker";

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
  onSortChange: (sort: 'price' | 'distance') => void;
  itemName: string;
}

// Update ResultsTable component with types
const ResultsTable: React.FC<ResultsTableProps> = ({ results, sortBy, onSortChange, itemName }) => {
  if (!results || results.length === 0) return null;

  return (
    <View style={styles.tableContainer}>
      {/* Table Header with Filters */}
      <View style={styles.tableHeader}>
        <Text style={styles.tableTitle}>{itemName}</Text>
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              sortBy === 'price' && styles.filterButtonActive
            ]}
            onPress={() => onSortChange('price')}
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
            onPress={() => onSortChange('distance')}
          >
            <Text style={[
              styles.filterButtonText,
              sortBy === 'distance' && styles.filterButtonTextActive
            ]}>Distance</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.table}>
        {/* Column Headers */}
        <View style={styles.headerRow}>
          <Text style={[styles.headerCell, { flex: 2 }]}>Store</Text>
          <Text style={[styles.headerCell, { flex: 2 }]}>Branch</Text>
          <Text style={[styles.headerCell, { flex: 4 }]}>Address</Text>
          <Text style={[styles.headerCell, { flex: 1.5, textAlign: 'center' }]}>Dist</Text>
          <Text style={[styles.headerCell, { flex: 1.7, textAlign: 'center' }]}>Price</Text>
        </View>
        
        {/* Table Rows */}
        {results.map((item: StoreResult, index: number) => (
          <View 
            key={index} 
            style={[
              styles.tableRow,
              index === 0 && sortBy === 'price' && styles.bestPrice,
              index === 0 && sortBy === 'distance' && styles.bestDistance,
              index % 2 === 0 && styles.evenRow,
            ]}
          >
            <View style={[styles.cell, { flex: 2 }]}>
              <Text style={[styles.cellText, styles.rtlText]}>{item.store_chain}</Text>
            </View>

            <View style={[styles.cell, { flex: 2 }]}>
              <Text style={[styles.cellText, styles.rtlText]}>{item.store_name}</Text>
            </View>

            <View style={[styles.cell, { flex: 4 }]}>
              <Text style={[styles.cellText, styles.rtlText]} numberOfLines={2}>
                {item.address}
              </Text>
            </View>

            <View style={[styles.cell, { flex: 1.5, alignItems: 'center' }]}>
              <Text style={[styles.cellText, { textAlign: 'center' }]}>{item.distance}</Text>
            </View>

            <View style={[styles.cell, { flex: 1.8, alignItems: 'center' }]}>
              <Text style={[
                styles.cellText,
                styles.priceText,
                index === 0 && sortBy === 'price' && styles.bestPriceText,
                { textAlign: 'center' }
              ]}>
                {item.price_display}
              </Text>
            </View>
          </View>
        ))}
      </View>
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
  const [sortBy, setSortBy] = useState<'price' | 'distance'>('price');

  const scrollViewRef = React.useRef<ScrollView>(null);
  const [resultsPosition, setResultsPosition] = useState<number>(0);
  
  // Add scroll to results function
  const scrollToResults = () => {
    if (scrollViewRef.current && resultsPosition > 0) {
      scrollViewRef.current.scrollTo({ y: resultsPosition, animated: true });
    }
  };

  const [allResults, setAllResults] = useState<ItemSearchResult[]>([]);

  useEffect(() => {
    if (useCurrentLocation) {
      (async () => {
        try {
          let { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== "granted") {
            alert("Permission to access location was denied");
            setUseCurrentLocation(false);
            return;
          }

          // Get current position
          let loc = await Location.getCurrentPositionAsync({});
          setLocation(loc.coords);

          // Get address from coordinates
          const addresses = await Location.reverseGeocodeAsync({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });

          if (addresses && addresses.length > 0) {
            const address = addresses[0];
            // Format address in Hebrew style
            const formattedAddr = [
              address.street,
              address.city
            ].filter(Boolean).join(", ");
            
            setFormattedAddress(formattedAddr);
            setManualLocation(formattedAddr); // Set this as the manual location for the API
          }
        } catch (error) {
          console.error("Error getting location:", error);
          alert("Could not get your current location");
          setUseCurrentLocation(false);
        }
      })();
    } else {
      setLocation(null);
      setFormattedAddress("");
    }
  }, [useCurrentLocation]);

  const handleSubmit = async () => {
    if ((!useCurrentLocation && !manualLocation) || selectedItems.length === 0) {
      alert("Please enter a location and select items.");
      return;
    }

    const locationToUse = manualLocation; // Always use the formatted or manual address

    try {
      setIsSubmitting(true);
      
      // Send all items in a single request
      const response = await axios.post("http://127.0.0.1:5002/api/scrape", {
        location: locationToUse,
        items: selectedItems.map(item => item.replace(/s$/, ''))
      });
      
      console.log("Raw API Response:", response.data);
      
      if (response.data.status === 'success' && response.data.results) {
        // Store all results
        setAllResults(response.data.results);
        
        // Get the first valid result for initial display
        const firstValidResult = response.data.results.find((result: ItemSearchResult) => 
          result.status === 'success' && 
          result.results && 
          (result.results.by_price?.length > 0 || result.results.by_distance?.length > 0)
        );

        if (firstValidResult) {
          console.log("Setting search results:", firstValidResult.results);
          setSearchResults(firstValidResult.results);
          setTimeout(scrollToResults, 100);
        } else {
          console.error("No valid results found");
          alert('No results found for the selected items.');
        }
      } else {
        console.error("Invalid response format:", response.data);
        alert(`Error: ${response.data.message || 'Invalid response format'}`);
      }
      
    } catch (error) {
      console.error("Error during scraping:", error);
      alert("An error occurred while fetching the data.");
    } finally {
      setIsSubmitting(false);
    }
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

          {/* Location Input */}
          <View style={{ marginTop: 28 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 8,
                justifyContent: 'flex-end',
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

            {useCurrentLocation && formattedAddress ? (
              <View style={styles.currentLocationContainer}>
                <Text style={styles.currentLocationText}>
                  {formattedAddress}
                </Text>
              </View>
            ) : !useCurrentLocation && (
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
          <View style={{ marginTop: 40, marginBottom: 40 }}>
            <CustomButton
              title="Submit"
              handlePress={handleSubmit}
              containerStyles=""
              textStyles={undefined}
              isLoading={isSubmitting}
            />
          </View>

          {/* Display Results */}
          {searchResults && (
            <View 
              onLayout={(event) => {
                const layout = event.nativeEvent.layout;
                setResultsPosition(layout.y);
              }}
            >
              {allResults.map((result: ItemSearchResult, index: number) => {
                if (result.status === 'success' && result.results && 
                    (result.results.by_price?.length > 0 || result.results.by_distance?.length > 0)) {
                  return (
                    <ResultsTable 
                      key={index}
                      results={sortBy === 'price' ? result.results.by_price : result.results.by_distance}
                      sortBy={sortBy}
                      onSortChange={setSortBy}
                      itemName={result.product}
                    />
                  );
                }
                return null;
              })}
            </View>
          )}

          {isSubmitting && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0D9276" />
              <Text style={styles.loadingText}>מחפש מחירים...</Text>
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
});

export default SmartCart;
