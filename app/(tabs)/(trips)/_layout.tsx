import { Stack } from "expo-router";

export default function TripsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }} initialRouteName="index">
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="[tripId]" options={{ headerShown: false }} />
      <Stack.Screen name="[tripId]/add-destination" options={{ headerShown: false, presentation: 'modal' }} />
    </Stack>
  );
}