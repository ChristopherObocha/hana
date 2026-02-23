import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

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
      router.replace('/(auth)/log-in');
    }
  }, [isLoggedIn, router]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <RouteGuard />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
