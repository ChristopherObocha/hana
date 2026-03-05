import { Link } from "expo-router";
import React from "react";
import { KeyboardAvoidingView, Platform, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Spacer, TextInput } from "@/components";

const LogInScreen = () => {
  const insets = useSafeAreaInsets();

  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 px-4"
      >
        <View style={{ paddingTop: insets.top + 24 }}>
          <Spacer size={24} vertical />
          <Text
            style={{ fontFamily: "BricolageGrotesque-ExtraBold" }}
            className="text-3xl font-bold"
          >
            Welcome {"\n"}Back!
          </Text>
          <Spacer size={5} vertical />

          <Text className="text-gray-400">
            Login to your account or{" "}
            <Link href="/(auth)/signup" className="text-primary underline">
              sign up
            </Link>{" "}
            here.
          </Text>
          <Spacer size={50} vertical />

          <TextInput
            label="E-mail Address"
            isRequired
            requiredType="asterisk"
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            returnKeyType="next"
            onSubmitEditing={() => {}}
            className="border border-gray-300! rounded-lg p-4 mt-1"
          />

          <Spacer size={16} vertical />
          <TextInput
            label="Password"
            isRequired
            requiredType="asterisk"
            placeholder="Enter your password"
            keyboardType="default"
            autoCapitalize="none"
            autoComplete="password"
            autoCorrect={false}
            secureTextEntry={true}
            returnKeyType="done"
            onSubmitEditing={() => {}}
            className="border border-gray-300 rounded-lg p-4 mt-1"
          />
        </View>
      </KeyboardAvoidingView>
    </>
  );
};

export default LogInScreen;
