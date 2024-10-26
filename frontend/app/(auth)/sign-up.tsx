import React, { useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { images } from "../../constants";
import { Image } from "react-native";
import FormField from "@/components/FormField";
import CustomButton from "@/components/CustomButton";
import { Link, router } from "expo-router";
import { registerUser } from "@/components/authService";
import CustomAlert from "@/components/CustomAlert";

function SignUp() {
  type FormState = {
    username: string;
    email: string;
    password: string;
  };

  const [form, setForm] = useState<FormState>({
    username: "",
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [alertVisible, setAlertVisible] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>("");

  const submit = async () => {
    // Perform basic validation
    if (!form.username || !form.email || !form.password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      // Set isSubmitting to true to show the loader
      setIsSubmitting(true);

      // Call the registerUser function to attempt signup
      await registerUser(form.username, form.email, form.password);

      // Handle successful signup (e.g., navigate to login page, clear form, etc.)
      setForm({ username: "", email: "", password: "" });
      setAlertMessage("Signed up successful!");
      setAlertVisible(true);
      
      setTimeout(() => {
        setAlertVisible(false);
        router.push('/sign-in');
      }, 750 );


    } catch (error: any) {
      setAlertMessage("Register failed. Please try again.");
      setAlertVisible(true);
      setTimeout(() => {
        setAlertVisible(false);
      }, 1000 );
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView>
        <View className="w-full justify-center min-h-[70vh] px-4 my-6">
          <View className="items-center">
            <Link href="/">
              <Image
                source={images.logo}
                resizeMode="contain"
                className="w-[150px] h-[55px]"
              />
            </Link>
          </View>
          <Text className="text-lg text-black text-semibold mt-10 font-psemibold">
            Sign up to FruitLens
          </Text>
          <FormField
            title="Username"
            value={form.username}
            handleChangeText={(e: string) => setForm({ ...form, username: e })}
            otherStyles="mt-10"
            keyboardType="username"
          />
          <FormField
            title="Email"
            value={form.email}
            handleChangeText={(e: string) => setForm({ ...form, email: e })}
            otherStyles="mt-7"
            keyboardType="email-address"
          />
          <FormField
            title="Password"
            value={form.password}
            handleChangeText={(e: string) => setForm({ ...form, password: e })}
            otherStyles="mt-7"
            keyboardType="password"
          />
          <CustomButton
            title={"Sign Up"}
            handlePress={submit}
            containerStyles="mt-7"
            textStyles={undefined}
            isLoading={isSubmitting}
          />
          <View className="justify-center pt-5 flex-row gap-2">
            <Text className="text-lg text-black-100 font-pregular">
              Have an account already?
            </Text>
            <Link
              href={"/sign-in"}
              className="text-lg font-psemibold text-secondary"
            >
              Sign in
            </Link>
          </View>
        </View>
      </ScrollView>
            {/* Custom Alert */}
            <CustomAlert
        visible={alertVisible}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
    </SafeAreaView>
  );
}

export default SignUp;
