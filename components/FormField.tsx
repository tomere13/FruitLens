import { View, Text, TextInput, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { Image } from "react-native";
import { icons, images } from "../constants";
const FormField = ({
  title,
  value,
  placeholder,
  handleChangeText,
  otherStyles,
  keyboardType,
  ...props
}: {
  title: string;
  value: string;
  placeholder?: any;
  handleChangeText: any;
  otherStyles: string;
  keyboardType: string;
}) => {
  const [showPassword, setshowPassword] = useState<Boolean>(false);
  return (
    <View className={`space-y-2 ${otherStyles}`}>
      <Text className=" text-base text-black-100 font-pmedium">{title}</Text>
      <View className="border-2 border-grey-100 w-full h-16 px-4 bg-lime-100 rounded-xl focus:border-secondary items-center flex-row">
        <TextInput
          className="flex-1 text-black font-psemibold text-base"
          value={value}
          placeholder={placeholder}
          placeholderTextColor="#7b7b8b"
          onChangeText={handleChangeText}
          secureTextEntry={title === "Password" && !showPassword}
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
