import { TouchableOpacity, Text } from "react-native";
import React from "react";

const CustomButton = ({
  title,
  handlePress,
  containerStyles,
  textStyles,
  isLoading,
  size = "medium", // Add size prop with default value
}: {
  title: string;
  handlePress: any;
  containerStyles: any;
  textStyles: any;
  isLoading: boolean;
  size?: "small" | "medium" | "large"; // Define size options
}) => {
  // Define size-based styles
  const sizeStyles = {
    small: "min-h-[20px] px-3", // Smaller height and padding
    medium: "min-h-[50px] px-4", // Medium height and padding
    large: "min-h-[62px] px-5", // Larger height and padding
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      className={`bg-secondary rounded-xl justify-center items-center ${
        sizeStyles[size]
      } ${containerStyles} ${isLoading ? "opacity-50" : ""}`}
      disabled={isLoading}
    >
      <Text className={`text-white font-psemibold text-lg ${textStyles}`}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default CustomButton;
