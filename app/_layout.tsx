import { Stack } from "expo-router";
import "./globals.css";
import { StatusBar, View, Text } from "react-native";
import * as NavigationBar from "expo-navigation-bar";
import { useEffect } from "react";
import { AuthProvider } from "@/context/AuthContext";
import Toast from "react-native-toast-message";

const toastConfig = {
  success: ({ text1, text2 }: any) => (
    <View className="bg-dark-100 border border-accent px-4 py-3 rounded-xl w-[90%]">
      <Text className="text-accent font-bold text-base">{text1}</Text>
      {text2 && (
        <Text className="text-light-200 text-sm mt-1">{text2}</Text>
      )}
    </View>
  ),

  error: ({ text1, text2 }: any) => (
    <View className="bg-dark-200 border border-red-500 px-4 py-3 rounded-xl w-[90%]">
      <Text className="text-red-400 font-bold text-base">{text1}</Text>
      {text2 && (
        <Text className="text-light-200 text-sm mt-1">{text2}</Text>
      )}
    </View>
  ),
};

export default function RootLayout() {

  useEffect(() => {
    NavigationBar.setVisibilityAsync("hidden");
    NavigationBar.setBehaviorAsync("overlay-swipe");
  }, []);

  return (
    <AuthProvider>
      <StatusBar hidden={true} />

      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="movies/[id]" options={{ headerShown: false }} />
      </Stack>

      {/* Toast must be at root */}
      <Toast config={toastConfig} />
    </AuthProvider>
  );
}