import { TouchableOpacity, Text, StyleSheet, StyleProp, TextStyle, ViewStyle } from "react-native";
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
  containerStyles?: StyleProp<ViewStyle>;
  textStyles?: StyleProp<TextStyle>;
  isLoading: boolean;
  size?: "small" | "medium" | "large"; // Define size options
}) => {
  // Define size-based styles
  const sizeStyles = {
    small: { minHeight: 30, paddingHorizontal: 12 } as ViewStyle,
    medium: { minHeight: 50, paddingHorizontal: 16 } as ViewStyle,
    large: { minHeight: 62, paddingHorizontal: 20 } as ViewStyle,
  };

  const defaultContainerStyle: ViewStyle = {
    backgroundColor: '#40916c',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: isLoading ? 0.5 : 1,
    ...sizeStyles[size]
  };

  const defaultTextStyle: TextStyle = {
    color: 'white',
    fontWeight: '600',
    fontSize: 18
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={[defaultContainerStyle, containerStyles]}
      disabled={isLoading}
    >
      <Text style={[defaultTextStyle, textStyles]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default CustomButton;
