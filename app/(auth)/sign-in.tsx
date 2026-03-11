import CustomInput from "@/components/CustomInput";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { router } from "expo-router";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Toast from "react-native-toast-message";
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function SignIn() {
    const { login } = useAuth();

    const [user, setUser] = useState({
        email: "",
        password: "",
    });

    const onSubmit = async () => {
        try {
            if (!user.email || !user.password) {
                Toast.show({
                    type: "error",
                    text1: "Missing Fields",
                    text2: "Please enter email and password",
                });
                return;
            }

            await login(user.email, user.password);

            Toast.show({
                type: "success",
                text1: "Login Successful",
                text2: "Welcome back 🎬",
            });

            router.replace("/");
        } catch (error: any) {
            Toast.show({
                type: "error",
                text1: "Login Failed",
                text2: error.message,
            });
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-primary">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="on-drag"
                    contentContainerStyle={{ flexGrow: 1, alignItems: "center" }}
                >
                    {/* BG Image */}
                    <Image source={images.bg} className="absolute w-full h-full z-0" />

                    {/* Logo */}
                    <TouchableOpacity activeOpacity={1} onPress={() => router.push("/")}>
                        <Image source={icons.logo} className="w-12 h-10 mt-32 mb-20" />
                    </TouchableOpacity>

                    <Text className="text-white text-2xl mb-6">Login</Text>

                    {/* Form */}
                    <View className="w-full px-10">
                        <CustomInput
                            placeholder="Enter Email"
                            keyboardType="email-address"
                            label="Email"
                            value={user.email}
                            onChangeText={(text) => setUser({ ...user, email: text })}
                        />

                        <CustomInput
                            placeholder="Enter Password"
                            secureTextEntry
                            label="Password"
                            value={user.password}
                            onChangeText={(text) => setUser({ ...user, password: text })}
                        />
                    </View>

                    {/* Login Button */}
                    <TouchableOpacity className="w-full px-10 mt-6" onPress={onSubmit}>
                        <Text className="text-black font-bold bg-accent py-3 rounded-lg w-full text-center">
                            Login
                        </Text>
                    </TouchableOpacity>

                    {/* Signup Link */}
                    <TouchableOpacity
                        className="mt-4"
                        onPress={() => router.push("/sign-up")}
                    >
                        <Text className="text-light-200">
                            Don&apos;t have an account?{" "}
                            <Text className="text-accent">Sign up</Text>
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}