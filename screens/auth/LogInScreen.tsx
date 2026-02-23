import { StyleSheet, Text } from "react-native";
import React from "react";

import { ScreenContainer, Spacer } from "@/components";

const LogInScreen = () => {
  return (
    <ScreenContainer>
      <Spacer size={24} vertical />
      <Text>Welcome to Runwae🎉</Text>
      {/* <Text>Login to your account or <Link href="(auth)/sign-up">sign up here.</Link></Text> */}
    </ScreenContainer>
  );
};

export default LogInScreen;

const styles = StyleSheet.create({});
