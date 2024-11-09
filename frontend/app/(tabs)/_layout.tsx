import { View, Text, TouchableOpacity } from "react-native";
import { Tabs, router } from "expo-router"; // Add router to navigate
import { icons } from "../../constants";
import { Image } from "react-native";
import React, { useState } from "react";

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
  return (
    <>
      <View style={{ flex: 1 }}>
        {/* Logout button using TouchableOpacity */}

        {/* Tabs Component */}
        <Tabs
          screenOptions={{
            tabBarShowLabel: false,
            tabBarActiveTintColor: "#0D9276",
            tabBarInactiveTintColor: "#000000FF",
            tabBarStyle: {
              height: 95,
              paddingTop: 15,
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
            name="smartcart"
            options={{
              title: "SmartCart",
              headerShown: false,
              tabBarIcon: ({ color, focused }) => (
                <TabIcon
                  icon={icons.cart}
                  color={color}
                  name="SmartCart"
                  focused={focused}
                />
              ),
            }}
          />

          <Tabs.Screen
            name="contact"
            options={{
              title: "Contact",
              headerShown: false,
              tabBarIcon: ({ color, focused }) => (
                <TabIcon
                  icon={icons.contact}
                  color={color}
                  name="Contact"
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
