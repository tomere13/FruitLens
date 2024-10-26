import { View, Text, SafeAreaView, ScrollView } from "react-native";
import React from "react";
import { Image } from "react-native";
import { images } from "../../constants";

const Favorite = () => {
  return (
     <SafeAreaView className="bg-primary h-full">
      <ScrollView>
        <View className="w-full justify-center min-h-[70vh] px-4 my-6">
          {/* Logo at the top */}
          <View className="items-center">
            <Image
              source={images.logo} // Replace with your logo image
              resizeMode="contain"
              className="w-[200px] h-[55px]"
            />
          </View>

          <Text className="text-lg text-black font-semibold mt-10">
            Favorites
          </Text>

          {/* Name Field */}
        
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Favorite;
