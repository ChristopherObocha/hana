import {
  Inter_100Thin,
  Inter_200ExtraLight,
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  Inter_900Black,
} from "@expo-google-fonts/inter";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef } from "react";
import { KeyboardProvider } from "react-native-keyboard-controller";
import "react-native-reanimated";

import SplashScreen from "@/components/ui/splash-screen";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import "../global.css";

export const unstable_settings = {
  anchor: "(tabs)",
};

function RouteGuard() {
  const router = useRouter();
  const segments = useSegments();
  const isNavigating = useRef(false);
  const {
    user,
    isLoading,
    hasSeenOnboarding,
    isAuthenticated,
    isProfileComplete,
    initialize,
  } = useAuth();

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (isLoading || isNavigating.current) return;

    const AUTH_SEGMENTS = new Set(["(auth)", "login", "register"]);
    const ONBOARDING_SEGMENT = "onboarding";
    const TAB_SEGMENTS = new Set(["(tabs)"]);

    const currentSegment = segments[0];
    const inAuthGroup = AUTH_SEGMENTS.has(currentSegment);
    const inOnboarding = currentSegment === ONBOARDING_SEGMENT;
    const inTabsGroup = TAB_SEGMENTS.has(currentSegment);

    let targetRoute: string | null = null;

    if (!hasSeenOnboarding && !inOnboarding) {
      targetRoute = "/onboarding";
    } else if (hasSeenOnboarding && !isAuthenticated && !inAuthGroup) {
      targetRoute = "/(auth)/login";
    } else if (isAuthenticated && !isProfileComplete && !inAuthGroup) {
      targetRoute = "/(auth)/onboarding";
    } else if (isAuthenticated && isProfileComplete && !inTabsGroup) {
      targetRoute = "/(tabs)";
    }

    if (targetRoute) {
      isNavigating.current = true;
      router.replace(targetRoute as any);
      setTimeout(() => {
        isNavigating.current = false;
      }, 100);
    }
  }, [
    isAuthenticated,
    hasSeenOnboarding,
    isProfileComplete,
    isLoading,
    segments,
  ]);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="modal"
        options={{ presentation: "modal", headerShown: true, title: "Modal" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    "BricolageGrotesque-Regular": require("../assets/fonts/Bricolage_Grotesque/static/BricolageGrotesque-Regular.ttf"),
    "BricolageGrotesque-Medium": require("../assets/fonts/Bricolage_Grotesque/static/BricolageGrotesque-Medium.ttf"),
    "BricolageGrotesque-SemiBold": require("../assets/fonts/Bricolage_Grotesque/static/BricolageGrotesque-SemiBold.ttf"),
    "BricolageGrotesque-Bold": require("../assets/fonts/Bricolage_Grotesque/static/BricolageGrotesque-Bold.ttf"),
    "BricolageGrotesque-ExtraBold": require("../assets/fonts/Bricolage_Grotesque/static/BricolageGrotesque-ExtraBold.ttf"),
    "BricolageGrotesque-Light": require("../assets/fonts/Bricolage_Grotesque/static/BricolageGrotesque-Light.ttf"),
    "BricolageGrotesque-ExtraLight": require("../assets/fonts/Bricolage_Grotesque/static/BricolageGrotesque-ExtraLight.ttf"),

    // inter
    InterThin: Inter_100Thin,
    InterExtraLight: Inter_200ExtraLight,
    InterLight: Inter_300Light,
    Inter: Inter_400Regular,
    InterMedium: Inter_500Medium,
    InterSemiBold: Inter_600SemiBold,
    InterBold: Inter_700Bold,
    InterExtraBold: Inter_800ExtraBold,
    InterBlack: Inter_900Black,
  });

  if (!fontsLoaded) {
    return <SplashScreen />;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <KeyboardProvider>
        <AuthProvider>
          <StatusBar style="auto" />
          <RouteGuard />
        </AuthProvider>
      </KeyboardProvider>
    </ThemeProvider>
  );
}
