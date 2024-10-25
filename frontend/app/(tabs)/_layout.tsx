import { View, Text, TouchableOpacity } from "react-native";
import { Tabs, router } from "expo-router"; // Add router to navigate
import { icons } from "../../constants";
import { Image } from "react-native";
import { logout } from "@/components/authService"; // Assuming you have a logout function
import React, { useState } from "react";
import { images } from "../../constants";

const TabIcon = ({
  icon,
  color,
  name,
  focused,
}: {
  icon: any;
  color: string;
  name: string;
  focused: boolean;
}) => {
  return (
    <View className="items-center justify-center gap-2">
      <Image
        source={typeof icon === "string" ? { uri: icon } : icon}
        resizeMode="contain"
        tintColor={color}
        className="w-6 h-6"
      />
      <Text
        className={`${focused ? "font-psemibold" : "font-pregular"} text-xs`}
        style={{ color: color }}
      >
        {name}
      </Text>
    </View>
  );
};

const TabsLayout = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false); // State to manage loading

  // Function to handle logout
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true); // Show loading state
      await logout(); // Perform the logout
      alert("You have been logged out successfully."); // Notify the user
      router.push("/sign-in"); // Redirect the user to the sign-in page after logout
    } catch (error) {
      console.error("Logout failed:", error); // Log any errors encountered
      alert("Error logging out. Please try again."); // Provide error feedback to the user
    } finally {
      setIsLoggingOut(false); // Reset loading state
    }
  };

  return (
    <>
      <View style={{ flex: 1 }}>
        {/* Logout button using TouchableOpacity */}
        <TouchableOpacity
          onPress={handleLogout}
          className="bg-black-200"
          style={{
            position: "absolute",
            top: 50, // Adjust the top margin so it doesn’t overlap with status bar
            left: 20, // Keep it in the upper-right corner
            paddingHorizontal: 15,
            paddingVertical: 10,
            borderRadius: 5,
            zIndex: 100, // Ensure the button stays on top
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>
            {isLoggingOut ? "Logging out..." : "Log out"}
          </Text>
        </TouchableOpacity>

        {/* Tabs Component */}
        <Tabs
          screenOptions={{
            tabBarShowLabel: false,
            tabBarActiveTintColor: "#8CD055FF",
            tabBarInactiveTintColor: "#CDCDE0",
            tabBarStyle: {
              backgroundColor: "#000000FF",
              borderTopWidth: 1,
              borderTopColor: "#232533",
              height: 84,
            },
          }}
        >
          <Tabs.Screen
            name="home"
            options={{
              title: "Home",
              headerShown: false,
              tabBarIcon: ({ color, focused }) => (
                <TabIcon
                  icon={icons.home}
                  color={color}
                  name="Home"
                  focused={focused}
                />
              ),
            }}
          />

          <Tabs.Screen
            name="bookmark"
            options={{
              title: "Bookmark",
              headerShown: false,
              tabBarIcon: ({ color, focused }) => (
                <TabIcon
                  icon={icons.bookmark}
                  color={color}
                  name="Bookmark"
                  focused={focused}
                />
              ),
            }}
          />

          <Tabs.Screen
            name="create"
            options={{
              title: "Create",
              headerShown: false,
              tabBarIcon: ({ color, focused }) => (
                <TabIcon
                  icon={icons.plus}
                  color={color}
                  name="Create"
                  focused={focused}
                />
              ),
            }}
          />

          <Tabs.Screen
            name="profile"
            options={{
              title: "Profile",
              headerShown: false,
              tabBarIcon: ({ color, focused }) => (
                <TabIcon
                  icon={icons.profile}
                  color={color}
                  name="Profile"
                  focused={focused}
                />
              ),
            }}
          />
        </Tabs>
      </View>
    </>
  );
};

export default TabsLayout;