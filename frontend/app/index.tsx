import { ScrollView, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Link, Redirect, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "react-native";
import { images } from "../constants";
import CustomButton from "@/components/CustomButton";
const App = () => {
  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView contentContainerStyle={{ height: "100%" }}>
        <View className="w-full justify-center items-center min-h-[85vh] px-4">
          <Link href="/">
            <Image
              source={images.logo}
              className="w-[180px] h-[84px]"
              resizeMode="contain"
            />
          </Link>
          <Image
            source={images.model}
            className="max-w-[380px] w-full h-[400px]"
          />
          <View className="relative mt-5">
            <Text className="text-3xl text-black font-bold text-center">
              Discover Endless Possibilaties with{" "}
            </Text>
          </View>
          <Text className="text-sm font-pregular text-gray-800 mt-7 text-center">
            Where creativity meets innovation: embark on a journey of limitless
            exploration with Aura
          </Text>
          <CustomButton
            title="Continue with Email"
            handlePress={() => router.push("/sign-in")}
            containerStyles="w-full mt-7"
            textStyles={undefined}
            isLoading={false}
          />
        </View>
      </ScrollView>
      <StatusBar backgroundColor="#161622" />
    </SafeAreaView>
  );
};

export default App;
