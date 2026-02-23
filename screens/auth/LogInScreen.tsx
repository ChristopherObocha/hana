import { StyleSheet, Text } from "react-native";
import React from "react";

import { Link } from "expo-router";

import { ScreenContainer, Spacer, TextInput } from "@/components";

const LogInScreen = () => {
  return (
    <ScreenContainer>
      <Spacer size={24} vertical />
      <Text>Welcome to Runwae🎉</Text>
      <Spacer size={24} vertical />

      <Text>Login to your account or <Link href="/(auth)/signup" style={styles.link}>sign up</Link> here.</Text>
      <Spacer size={24} vertical />

      <TextInput
        label="Email"
        isRequired
        requiredType="asterisk"
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
        autoFocus={true}
        returnKeyType="next"
        onSubmitEditing={() => {}}
      />
    </ScreenContainer>
  );
};

export default LogInScreen;

const styles = StyleSheet.create({
  link: {
    color: '#FF2E92',
    textDecorationLine: 'underline',
  },
});
