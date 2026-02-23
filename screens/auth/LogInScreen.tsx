import { StyleSheet, Text } from "react-native";
import React from "react";
import { Link } from "expo-router";

import ScreenContainer from "@/components/containers/ScreenContainer";

const LogInScreen = () => {
  return (
    <ScreenContainer>
      <Text>Welcome to Runwae🎉</Text>
      {/* <Text>Login to your account or <Link href="(auth)/sign-up">sign up here.</Link></Text> */}
    </ScreenContainer>
  );
};

export default LogInScreen;

const styles = StyleSheet.create({});
