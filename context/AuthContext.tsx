import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type UserType = {
  id: string;
  name: string;
  email: string;
  password: string;
};

type AuthContextType = {
  isAuthenticated: boolean;
  user: UserType | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: any) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);

  // Load auth state when app starts
  useEffect(() => {
    const loadAuth = async () => {
      try {
        const storedAuth = await AsyncStorage.getItem("auth");
        const storedUser = await AsyncStorage.getItem("currentUser");

        if (storedAuth === "true" && storedUser) {
          setIsAuthenticated(true);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.log("Auth load error:", error);
      }
    };

    loadAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const storedUsers = await AsyncStorage.getItem("users");

      if (!storedUsers) {
        throw new Error("No users found. Please sign up first.");
      }

      const users = JSON.parse(storedUsers);

      const foundUser = users.find(
        (u: any) => u.email === email && u.password === password
      );

      if (!foundUser) {
        throw new Error("Invalid email or password");
      }

      await AsyncStorage.setItem("currentUser", JSON.stringify(foundUser));
      await AsyncStorage.setItem("auth", "true");

      setUser(foundUser);
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      setIsAuthenticated(false);
      setUser(null);

      await AsyncStorage.removeItem("auth");
      await AsyncStorage.removeItem("currentUser");
    } catch (error) {
      console.log("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};