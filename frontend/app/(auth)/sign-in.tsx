import React, { useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { images } from "../../constants";
import { Image } from "react-native";
import FormField from "@/components/FormField";
import CustomButton from "@/components/CustomButton";
import CustomAlert from "@/components/CustomAlert";
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
  const [alertVisible, setAlertVisible] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>("");

  const submit = async () => {
    if (!form.username || !form.password) {
      setAlertMessage("Please fill in all fields");
      setAlertVisible(true);
      setTimeout(() => {
        setAlertVisible(false);
      }, 1000 );
      return;
    }
  
    try {
      setIsSubmitting(true);
      await loginUser(form.username, form.password);
      setForm({ username: "", password: "" });
  
      // Show alert for a successful login and delay navigation
      setAlertMessage("Login successful!");
      setAlertVisible(true);
      setTimeout(() => {
        setAlertVisible(false);
        router.push('/home');
      }, 750 );
    } catch (error:any) {
      setAlertMessage("Login failed. Please try again.");
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

      {/* Custom Alert */}
      <CustomAlert
        visible={alertVisible}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
    </SafeAreaView>
  );
}

export default SignIn;