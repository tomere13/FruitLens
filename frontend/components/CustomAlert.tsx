import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";

type CustomAlertProps = {
  visible: boolean;
  message: string;
  onClose: () => void;
};

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  message,
  onClose,
}) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="w-80 p-5 bg-white rounded-lg shadow-lg items-center">
          <Text className="text-center text-gray-700">{message}</Text>
        </View>
      </View>
    </Modal>
  );
};

export default CustomAlert;
