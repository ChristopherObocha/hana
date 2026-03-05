import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Toast } from "toastify-react-native";

import { Spacer } from "@/components";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Lock } from "lucide-react-native";

const CheckEmailScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { resetPassword, isLoading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(59);
  const [canResend, setCanResend] = useState(false);
  const email = (params.email as string) || "";

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleResendEmail = async () => {
    if (!canResend || !email) return;

    try {
      setIsSubmitting(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const result = await resetPassword(email);

      if (!result.success) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Toast.show({
          type: "error",
          text1: "Resend Error",
          text2: result.error,
          position: "bottom",
          visibilityTime: 4000,
          autoHide: true,
        });
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Toast.show({
          type: "success",
          text1: "Email Resent",
          text2: "Password reset link has been sent again",
          position: "bottom",
          visibilityTime: 3000,
          autoHide: true,
        });
        // Reset countdown
        setCountdown(59);
        setCanResend(false);
      }
    } catch (error) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Toast.show({
        type: "error",
        text1: "Resend Error",
        text2: "An unexpected error occurred",
        position: "bottom",
        visibilityTime: 4000,
        autoHide: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOpenEmail = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // In a real app, you might want to open the email app
    // For now, we'll just show a toast
    Toast.show({
      type: "info",
      text1: "Open Email App",
      text2: "Please check your email app for the reset link",
      position: "bottom",
      visibilityTime: 3000,
      autoHide: true,
    });
  };

  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 px-[20px] bg-white"
      >
        <View style={{ paddingTop: insets.top + 24 }}>
          <View style={styles.headerContainer}>
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
            >
              <ArrowLeft size={20} color="#374151" />
            </TouchableOpacity>
          </View>

          <Spacer size={40} vertical />

          <View style={styles.iconContainer}>
            <View style={styles.lockBackground}>
              <Lock size={40} color="#EC4899" />
            </View>
          </View>

          <Spacer size={32} vertical />

          <Text
            style={{ fontFamily: "BricolageGrotesque-ExtraBold" }}
            className="text-3xl font-bold text-center"
          >
            Check your email
          </Text>

          <Spacer size={16} vertical />

          <Text className="text-gray-400 text-center leading-relaxed px-4">
            We sent a password reset link to your email address. Please check
            your inbox and follow the instructions to reset your password.
          </Text>

          <Spacer size={40} vertical />

          <TouchableOpacity
            onPress={handleResendEmail}
            disabled={!canResend || isSubmitting}
            className="flex items-center justify-center"
          >
            <Text className="text-primary text-base">
              Didn't get an email?{" "}
              <Text className="underline">
                {canResend ? "Resend" : `Resend in ${formatTime(countdown)}`}
              </Text>
            </Text>
          </TouchableOpacity>

          <Spacer size={32} vertical />

          <TouchableOpacity
            onPress={handleOpenEmail}
            className="bg-primary h-[45px] rounded-full w-full flex items-center justify-center"
          >
            <Text className="text-white font-medium text-base">Open Email</Text>
          </TouchableOpacity>

          <Spacer size={16} vertical />

          <TouchableOpacity
            onPress={() => router.push("/(auth)/login")}
            className="bg-white border-2 border-gray-200 h-[45px] rounded-full w-full flex items-center justify-center"
          >
            <Text className="text-gray-700 font-medium text-base">Close</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  );
};

export default CheckEmailScreen;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  lockBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FCE7F3",
    alignItems: "center",
    justifyContent: "center",
  },
});
