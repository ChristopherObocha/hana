import { User } from "@/store/auth-store";
import { supabase } from "@/utils/supabase/client";
import { useCallback, useEffect, useState } from "react";

export interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isProfileComplete: boolean;
  hasSeenOnboarding: boolean;

  signIn: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  signUp: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  updateUser: (
    userData: Partial<User>,
  ) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (
    email: string,
  ) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (
    newPassword: string,
  ) => Promise<{ success: boolean; error?: string }>;

  completeOnboarding: () => void;

  initialize: () => Promise<void>;
}

async function fetchUserProfile(userId: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
    if (!data) {
      console.error("No profile data returned");
      return null;
    }

    const authUser = await supabase.auth.getUser();
    if (!authUser.data.user) {
      console.error("No auth user found");
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      username: data.username,
      email: authUser.data.user.email || "",
      profileImage: data.profile_image_url,
      onboardingCompleted: data.onboarding_completed,
      role: data.role || "user",
    };
  } catch (error) {
    console.error("Error in fetchUserProfile:", error);
    return null;
  }
}

async function checkOnboardingStatus(): Promise<boolean> {
  // You can store this in AsyncStorage or Supabase
  // For now, return false (first time user)
  return false;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  const isAuthenticated = !!user;
  const isProfileComplete = !!(user?.username && user?.name);

  const initialize = useCallback(async () => {
    setIsLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        setUser(profile);
        // Authenticated users should always be considered as having seen onboarding
        setHasSeenOnboarding(true);
      } else {
        setUser(null);
        const hasSeen = await checkOnboardingStatus();
        setHasSeenOnboarding(hasSeen);
      }
    } catch (error) {
      console.error("Error initializing auth:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        const profile = await fetchUserProfile(data.user.id);
        setUser(profile);
        return { success: true };
      }

      return { success: false, error: "No user data returned" };
    } catch (error) {
      console.error("Sign in error:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        const profile = await fetchUserProfile(data.user.id);
        setUser(profile);
        return { success: true };
      }

      return { success: false, error: "No user data returned" };
    } catch (error) {
      console.error("Sign up error:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setHasSeenOnboarding(false); // Reset onboarding state after sign out
      return { success: true };
    } catch (error) {
      console.error("Sign out error:", error);
      return { success: false, error: "Failed to sign out" };
    }
  }, []);

  const updateUser = useCallback(
    async (userData: Partial<User>) => {
      if (!user) {
        return { success: false, error: "No authenticated user" };
      }

      try {
        const updateData: any = {};
        if (userData.name !== undefined) updateData.name = userData.name;
        if (userData.username !== undefined)
          updateData.username = userData.username;
        if (userData.profileImage !== undefined)
          updateData.profile_image_url = userData.profileImage;
        if (userData.onboardingCompleted !== undefined)
          updateData.onboarding_completed = userData.onboardingCompleted;
        if (userData.role !== undefined) updateData.role = userData.role;

        const { error, data } = await supabase
          .from("profiles")
          .update(updateData)
          .eq("id", user.id)
          .select()
          .single();

        if (error) {
          return { success: false, error: error.message };
        }

        if (data) {
          const profile = await fetchUserProfile(data.id);
          setUser(profile);
          return { success: true };
        }

        return { success: false, error: "Failed to update profile" };
      } catch (error) {
        console.error("Update user error:", error);
        return { success: false, error: "An unexpected error occurred" };
      }
    },
    [user],
  );

  const resetPassword = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error("Reset password error:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error("Update password error:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  }, []);

  const completeOnboarding = useCallback(() => {
    setHasSeenOnboarding(true);
  }, []);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        setUser(profile);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    user,
    isLoading,
    isAuthenticated,
    isProfileComplete,
    hasSeenOnboarding,
    signIn,
    signUp,
    signOut,
    updateUser,
    resetPassword,
    updatePassword,
    completeOnboarding,
    initialize,
  };
}
