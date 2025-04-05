import React, { useState } from "react";
import { View, Text, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import sendEmail from "react-native-email";
import FormField from "../../components/FormField";
import CustomButton from "../../components/CustomButton";
import { Image } from "react-native";
import { images } from "../../constants";

const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  const handleSendEmail = () => {
    if (!form.name || !form.email || !form.message) {
      Alert.alert("Error", "Please fill out all fields.");
      return;
    }

    setIsSubmitting(true);

    sendEmail("etomer9@gmail.com", {
      subject: `Contact Form Submission from ${form.name}`,
      body: `Name: ${form.name}\nEmail: ${form.email}\nMessage: ${form.message}`,
    })
      .then(() => {
        Alert.alert("Success", "Your message has been sent!");
        setForm({ name: "", email: "", message: "" });
      })
      .catch((error: unknown) => {
        console.error("Error sending email:", error);
        Alert.alert("Error", "Failed to send email. Please try again later.");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView>
        <View className="w-full justify-center min-h-[70vh] px-4 my-6">
          {/* Logo at the top */}
          <View className="items-center">
            <Image
              source={images.logo} // Replace with your logo image
              resizeMode="contain"
              className="w-[200px] h-[55px]"
            />
          </View>

          <Text className="text-lg text-black font-semibold mt-10">
            Contact Us
          </Text>

          {/* Name Field */}
          <FormField
            title="Your Name"
            value={form.name}
            placeholder="Enter your name"
            handleChangeText={(text: string) => handleChange("name", text)}
            otherStyles="mt-7"
            keyboardType="default"
          />

          {/* Email Field */}
          <FormField
            title="Your Email"
            value={form.email}
            placeholder="Enter your email"
            handleChangeText={(text: string) => handleChange("email", text)}
            otherStyles="mt-7"
            keyboardType="email-address"
          />

          {/* Message Field */}
          <FormField
            title="Your Message"
            value={form.message}
            placeholder="Enter your message"
            handleChangeText={(text: string) => handleChange("message", text)}
            otherStyles="mt-7"
            keyboardType="default"
            multiline={true} // Enable multiline for the message field
          />

          {/* Send Message Button */}
          <CustomButton
            title="Send Message"
            handlePress={handleSendEmail}
            containerStyles="mt-7"
            isLoading={isSubmitting}
            textStyles={undefined}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Contact;
