"use client"


import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: "user" | "admin";
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (data: any) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check if user is logged in on mount using Supabase session
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Fetch user profile from user_profiles table
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("id, email, first_name, last_name, role")
          .eq("id", session.user.id)
          .single();
        setUser({
          id: session.user.id,
          email: session.user.email ?? "",
          firstName: profile?.first_name,
          lastName: profile?.last_name,
          role: profile?.role ?? "user",
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };
    checkAuth();
    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      checkAuth();
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.user) {
        throw new Error("Login failed");
      }
      // Fetch user profile
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("id, email, first_name, last_name, role")
        .eq("id", data.user.id)
        .single();
      setUser({
        id: data.user.id,
        email: data.user.email ?? "",
        firstName: profile?.first_name,
        lastName: profile?.last_name,
        role: profile?.role ?? "user",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: any) => {
    setIsLoading(true);
    try {
      const { data: signUpData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: { data: { first_name: data.firstName, last_name: data.lastName } },
      });
      if (error || !signUpData.user) {
        throw new Error("Signup failed");
      }
      // Insert user profile
      await supabase.from("user_profiles").insert({
        id: signUpData.user.id,
        email: data.email,
        first_name: data.firstName,
        last_name: data.lastName,
        role: "user",
      });
      setUser({
        id: signUpData.user.id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: "user",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
