import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

const CustomLoading: React.FC<{ message?: string }> = ({ message = "Loading..." }) => {
  return (
    <View className="flex-1 justify-center items-center bg-primary">
      {/* Spinner */}
      <ActivityIndicator size="large" color="#0D9276" className="mb-4" />

      {/* Loading message */}
      <Text className="text-lg text-gray-700 font-semibold">{message}</Text>
    </View>
  );
};

export default CustomLoading;