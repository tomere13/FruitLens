import { View, Text, TouchableOpacity, Image } from "react-native";
import { Tabs } from "expo-router"; // Using Tabs directly
import React from "react";
import { icons } from "../../constants";

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
    <View style={{ flex: 1 }}>
      {/* Tabs Component */}
      <Tabs
        screenOptions={{
          tabBarShowLabel: true, // Enables labels
          tabBarActiveTintColor: "#0D9276",
          tabBarInactiveTintColor: "#000000FF",
          tabBarStyle: {
            height: 95,
            paddingTop: 15,
          },
          tabBarLabelStyle: {
            fontSize: 12, // Adjust label font size here
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
                name=""
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
                name=""
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
                name=""
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
                name=""
                focused={focused}
              />
            ),
          }}
        />
      </Tabs>
    </View>
  );
};

export default TabsLayout;
