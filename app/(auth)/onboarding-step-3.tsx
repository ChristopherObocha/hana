import { useRouter } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const OnboardingStep3 = () => {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/(auth)/signup");
  };

  const handleSkip = () => {
    router.push("/(auth)/signup");
  };

  return (
    <SafeAreaView className="flex-1 px-[20px] items-center justify-between bg-white h-screen">
      <View className="flex-1 items-center gap-y-5 w-full">
        <View className="my-10">
          <Image
            source={require("@/assets/images/onboarding-1.png")}
            style={{ width: 321, height: 276.45, resizeMode: "contain" }}
          />
        </View>
        <Text
          className="text-black text-center text-3xl"
          style={{ fontFamily: "BricolageGrotesque-Bold" }}
        >
          Start your adventure {"\n"}today
        </Text>
        <Text className="text-gray-400 text-center text-base px-4">
          Join thousands of travelers who have already discovered their perfect
          destinations
        </Text>
      </View>

      <View className="flex-col gap-3 w-full">
        <View className="flex-row justify-center gap-2 mb-4">
          <View className="w-2 h-2 bg-gray-300 rounded-full" />
          <View className="w-2 h-2 bg-gray-300 rounded-full" />
          <View className="w-8 h-2 bg-primary rounded-full" />
        </View>

        <TouchableOpacity
          className="bg-primary h-[45px] rounded-full w-full flex items-center justify-center"
          onPress={handleGetStarted}
        >
          <Text className="text-white font-medium text-base">Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-transparent h-[45px] rounded-full w-full flex items-center justify-center"
          onPress={handleSkip}
        >
          <Text className="text-gray-400 font-medium text-base">Skip</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default OnboardingStep3;
