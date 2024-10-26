import { View, Text, TextInput, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { Image } from "react-native";
import { icons } from "../constants";

const FormField = ({
  title,
  value,
  placeholder,
  handleChangeText,
  otherStyles,
  keyboardType,
  secureTextEntry,
  multiline = false, // Add multiline prop with default value false
  ...props
}: {
  title: string;
  value: string;
  placeholder?: any;
  handleChangeText: any;
  otherStyles: string;
  keyboardType: string;
  secureTextEntry?: boolean;
  multiline?: boolean; // Add this as an optional prop
}) => {
  const [showPassword, setshowPassword] = useState<Boolean>(false);

  return (
    <View className={`space-y-2 ${otherStyles}`}>
      <Text className="text-base text-black-100 font-pmedium">{title}</Text>
      <View
        className={`border border-topo-100 w-full px-4 bg-white rounded-xl focus:border-topo-200 flex-row ${
          multiline ? "h-32 pt-3" : "h-16 items-center"
        }`} // Adjust height based on multiline
      >
        <TextInput
          className="flex-1 text-black text-base"
          value={value}
          placeholder={placeholder}
          placeholderTextColor="#D3D3D3FF"
          onChangeText={handleChangeText}
          secureTextEntry={(title === "Password" && !showPassword) || secureTextEntry}
          multiline={multiline} // Enable multiline if the prop is true
          numberOfLines={multiline ? 4 : 1} // Set a default number of lines if multiline
          textAlignVertical="top" // Align text at the top for multiline
        />
        {title === "Password" && (
          <TouchableOpacity onPress={() => setshowPassword(!showPassword)}>
            <Image
              source={!showPassword ? icons.eye : icons.eyeHide}
              className="w-6 h-6"
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default FormField;