import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
// import { useFonts } from 'expo-font';
import { KeyboardProvider } from "react-native-keyboard-controller";

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEffect } from 'react';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RouteGuard() {
  const router = useRouter();
  const isLoggedIn = false;

  // const inAuthGroup = segments[0] === "(auth)";
  // const inTabsGroup = segments[0] === "(tabs)";

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace('/(auth)/login');
    }
  }, [isLoggedIn, router]);

  const initialRoute = isLoggedIn ? '(tabs)' : '(auth)';

  return (
    <Stack initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <KeyboardProvider>
        <StatusBar style="auto" />
        <RouteGuard />
      </KeyboardProvider>
    </ThemeProvider>
  );
}
