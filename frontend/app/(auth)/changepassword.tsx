import React, { useState, useEffect } from "react";
import { Alert, ScrollView, Text, View, ActivityIndicator, KeyboardAvoidingView, Platform, Image, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getUserProfile, changePassword } from "@/components/authService";
import CustomButton from "@/components/CustomButton";
import FormField from "@/components/FormField";
import { Link, router, useNavigation } from "expo-router";
import { images } from "../../constants"; // Assuming images is imported from your constants
import CustomAlert from "@/components/CustomAlert";

function ChangePassword() {
  type FormState = {
    username: string;
    email: string;
    current_password: string;
    new_password: string;
  };

  const [form, setForm] = useState<FormState>({
    username: "",
    email: "",
    current_password: "",
    new_password: "",
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [alertVisible, setAlertVisible] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>("");

  const navigation = useNavigation();

  // Fetch the user profile when the component mounts and reset password fields
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileData = await getUserProfile();
        setForm({
          ...form,
          username: profileData.username,
          email: profileData.email,
          current_password: "",
          new_password: "",
        });
      } catch (error: any) {
        Alert.alert("Error", error.message || "Failed to load profile data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Ensure password fields are reset after form submission
  const handlePasswordUpdate = async () => {
    try {
      setIsSubmitting(true);

      if (form.current_password && form.new_password) {
        // Change the password if the current and new passwords are provided
        await changePassword(form.current_password, form.new_password);
      }
      // Reset password fields after submission
      setForm((prevForm) => ({
        ...prevForm,
        current_password: "",
        new_password: "",
      }));
      setAlertMessage("Changed password successful!");
      setAlertVisible(true);
      setTimeout(() => {
        setAlertVisible(false);
        router.push('/profile');
      }, 750 );
    } catch (error: any) {
      setAlertMessage("Changed password failed. Please try again.");
      setAlertVisible(true);
      setTimeout(() => {
        setAlertVisible(false);
      }, 1000 );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="bg-primary h-full">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-primary h-full">
      {/* Customize the StatusBar to remove the white space */}
      <StatusBar 
        barStyle="dark-content" // Adjust text color (dark or light depending on your design)
        backgroundColor="transparent" // Make background transparent or match your screen color
        translucent={true} // This allows the content to go under the status bar
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="w-full justify-center px-4 my-6 flex-1">
            
            <View className="items-center">
              <Link href="/home">
                <Image
                  source={images.logo} // Assuming logo is in your assets
                  resizeMode="contain"
                  style={{ width: 200, height: 55 }}
                />
              </Link>
            </View>

            <Text className="text-lg text-black text-semibold mt-10 font-psemibold">
              Update Password
            </Text>

            {/* Current Password field */}
            <FormField
              title="Current Password"
              value={form.current_password}
              handleChangeText={(e: string) =>
                setForm({ ...form, current_password: e })
              }
              otherStyles="mt-7"
              keyboardType="default"
              secureTextEntry={true} // Enable password masking
            />

            {/* New Password field */}
            <FormField
              title="New Password"
              value={form.new_password}
              handleChangeText={(e: string) =>
                setForm({ ...form, new_password: e })
              }
              otherStyles="mt-7"
              keyboardType="default"
              secureTextEntry={true} // Enable password masking
            />

            {/* Submit button */}
            <CustomButton
              title={"Update Password"}
              handlePress={handlePasswordUpdate}
              containerStyles="mt-7"
              textStyles={undefined}
              isLoading={isSubmitting}
            />
               <CustomButton
              title={"Back"}
              handlePress={()=> router.push('/profile')}
              containerStyles="mt-7"
              textStyles={undefined}
              isLoading={isSubmitting}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <CustomAlert
        visible={alertVisible}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
    </SafeAreaView>
  );
}

export default ChangePassword;