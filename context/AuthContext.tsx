import { useAuthStore, type User } from "@/store/auth-store";
import { createContext, ReactNode, useContext } from "react";

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  hasSeenOnboarding: boolean;
  isAuthenticated: boolean;
  isProfileComplete: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  updateUser: (profile: Partial<User>) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  completeOnboarding: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const {
    user,
    isLoading,
    hasSeenOnboarding,
    isAuthenticated,
    isProfileComplete,
    signIn,
    signUp,
    signOut,
    updateUser,
    initialize,
    completeOnboarding,
  } = useAuthStore();

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        hasSeenOnboarding,
        isAuthenticated,
        isProfileComplete,
        signUp,
        signIn,
        signOut,
        updateUser,
        initialize,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
