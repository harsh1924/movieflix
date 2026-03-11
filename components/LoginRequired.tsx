import { View, Text, Image, Pressable, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { images } from "@/constants/images";
import { icons } from "@/constants/icons";

export default function LoginRequired() {
    return (
        <View className="flex-1 bg-primary items-center justify-center">

            {/* BG Image */}
            < Image source={images.bg} className="absolute w-full h-full z-0" resizeMode="cover" />

            {/* Logo */}
            <TouchableOpacity activeOpacity={1} onPress={() => router.push('/')}>
                <Image source={icons.logo} className="w-12 h-10 mb-10" />
            </TouchableOpacity>

            {/* Title */}
            <Text className="text-white text-2xl font-bold text-center mb-3 px-6">
                Login Required
            </Text>

            {/* Subtitle */}
            <Text className="text-gray-400 text-center text-base mb-8 px-6">
                Please log in to continue.
            </Text>

            {/* Login Button */}
            <Pressable
                onPress={() => router.push("/sign-in")}
                className="w-full items-center mb-4 px-6"
            >
                <Text className="text-white bg-accent font-semibold text-lg w-full py-4 rounded-lg text-center">
                    Login to Continue
                </Text>
            </Pressable>

            {/* Optional Signup */}
            <Pressable onPress={() => router.push("/sign-up")}>
                <Text className="text-gray-400">
                    Don&apos;t have an account?{" "}
                    <Text className="text-accent font-semibold">Sign Up</Text>
                </Text>
            </Pressable>
        </View>
    );
}