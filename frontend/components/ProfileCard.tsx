// ProfileCard.tsx

import React from "react";
import { View, Text, Image } from "react-native";
import { images } from "../constants";

interface ProfileCardProps {
  username: string;
  email: string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ username, email }) => {
  return (
    <View className="bg-primary p-6 rounded-lg mt-7 items-center">
      {/* Profile Image */}
      <Image
        source={images.profile} // Replace with your profile image path
        style={{ width: 100, height: 100, borderRadius: 50, marginBottom: 16 }}
      />
      {/* Username */}
      <Text className="text-2xl font-bold text-black mb-2">{username}</Text>
      {/* Email */}
      <Text className="text-base text-gray-600">{email}</Text>
    </View>
  );
};

export default ProfileCard;