import { useAuth } from "@/context/AuthContext";
import React from "react";
import { Pressable, Text, View } from "react-native";

export default function HomeScreen() {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-2xl font-bold mb-8">Home</Text>
      <Pressable
        onPress={handleSignOut}
        className="bg-red-500 px-6 py-3 rounded-lg"
      >
        <Text className="text-white font-semibold">Sign Out</Text>
      </Pressable>
    </View>
  );
}
