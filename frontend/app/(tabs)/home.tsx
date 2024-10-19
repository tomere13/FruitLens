import React from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { images } from "../../constants";
import { Image } from "react-native";
import { Link, router } from "expo-router";
import CustomButton from "@/components/CustomButton";
import { logout } from "@/components/authService"; // Create a logout function

function Home() {
  const handleLogout = async () => {
    try {
      // Call the logout function to clear the token and navigate to the login screen
      await logout();
      router.push("/sign-in");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView>
        <View className="w-full justify-center min-h-[70vh] px-4 my-6">
          <View className="items-center">
            <Link href="/">
              <Image
                source={images.logo}
                resizeMode="contain"
                className="w-[200px] h-[55px]"
              />
            </Link>
          </View>
          <Text className="text-lg text-black text-semibold mt-10 font-psemibold">
            Welcome to FruitLens
          </Text>

          <Text className="text-md text-black text-regular mt-5 text-center">
            This is the home screen after logging in. You can perform actions
            such as logging out.
          </Text>

          <CustomButton
            title={"Logout"}
            handlePress={handleLogout}
            containerStyles="mt-7"
            textStyles={undefined}
            isLoading={false} // No need to show loading for the logout button in this example
          />

          <View className="justify-center pt-5 flex-row gap-2">
            <Text className="text-lg text-black-100 font-pregular">
              Want to explore more features?
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default Home;
