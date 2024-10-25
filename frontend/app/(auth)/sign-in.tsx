import React, { useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { images } from "../../constants";
import { Image } from "react-native";
import FormField from "@/components/FormField";
import CustomButton from "@/components/CustomButton";
import { Link, router } from "expo-router";
import { loginUser } from "@/components/authService";

function SignIn() {
  type FormState = {
    username: string;
    password: string;
  };

  const [form, setForm] = useState<FormState>({
    username: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const submit = async () => {
    // Perform basic validation
    if (!form.username || !form.password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      // Set isSubmitting to true to show the loader
      setIsSubmitting(true);

      // Call the loginUser function to attempt login
      await loginUser(form.username, form.password);

      // If login is successful, clear the form and navigate to home
      setForm({ username: "", password: "" });

    } catch (error: any) {
      // Handle error (e.g., show an alert)
      Alert.alert("Error", error.message || "Login failed. Please try again.");
    } finally {
      // Reset the isSubmitting state
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
                className="w-[200px] h-[55px]"
              />
            </Link>
          </View>
          <Text className="text-lg text-black text-semibold mt-10 font-psemibold">
            Log in to FruitLens
          </Text>
          <FormField
            title="Username"
            value={form.username}
            handleChangeText={(e: string) => setForm({ ...form, username: e })}
            otherStyles="mt-7"
            keyboardType="username"
          />
          <FormField
            title="Password"
            value={form.password}
            handleChangeText={(e: string) => setForm({ ...form, password: e })}
            otherStyles="mt-7"
            keyboardType="password"
          />
          <CustomButton
            title={"Sign In"}
            handlePress={submit}
            containerStyles="mt-7"
            textStyles={undefined}
            isLoading={isSubmitting}
          />
          <View className="justify-center pt-5 flex-row gap-2">
            <Text className="text-lg text-black-100 font-pregular">
              Don't have an Account?
            </Text>
            <Link
              href={"/sign-up"}
              className="text-lg font-psemibold text-secondary"
            >
              Sign up
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default SignIn;
