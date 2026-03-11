import CustomInput from "@/components/CustomInput";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useState } from "react";
import Toast from "react-native-toast-message";
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from "react-native";
import { useAuth } from "@/context/AuthContext";

export default function SignUp() {
    const {login} = useAuth();
    const [user, setUser] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const onSubmit = async () => {
        try {
            if (!user.name || !user.email || !user.password) {
                Toast.show({
                    type: "error",
                    text1: "Missing Fields",
                    text2: "Please fill all fields"
                });
                return;
            }

            if (user.password !== user.confirmPassword) {
                Toast.show({
                    type: "error",
                    text1: "Password Mismatch",
                    text2: "Passwords do not match"
                });
                return;
            }

            // get existing users
            const existingUser = await AsyncStorage.getItem("users");
            let usersArray = existingUser ? JSON.parse(existingUser) : [];

            // check if email already exists
            const emailExists = usersArray.some((u: any) => u.email === user.email);
            if (emailExists) {
                Toast.show({
                    type: "error",
                    text1: "Email Already Exists",
                    text2: "Please use a different email"
                });
                return;
            }

            // create new user object
            const newUser = {
                id: Date.now().toString(),
                name: user.name,
                email: user.email,
                password: user.password
            };

            // add new user to users array
            usersArray.push(newUser);

            // save updated users array to AsyncStorage
            await AsyncStorage.setItem("users", JSON.stringify(usersArray));

            await login(user.email, user.password);

            // navigate to sign-in page
            router.push("/");
            Toast.show({
                type: "success",
                text1: "Account Created",
                text2: "You have successfully created an account"
            });

        } catch (error: any) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: error.message
            });
        }
    }


    return (
        <SafeAreaView className="flex-1 bg-primary">

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >

                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ flexGrow: 1, alignItems: "center" }}
                >

                    {/* BG Image */}
                    <Image source={images.bg} className="absolute w-full h-full z-0" />

                    {/* Logo */}
                    <TouchableOpacity activeOpacity={1} onPress={() => router.push('/')}>
                        <Image source={icons.logo} className="w-12 h-10 mt-32 mb-20" />
                    </TouchableOpacity>

                    <Text className="text-white text-2xl mb-6">Create Account</Text>

                    {/* Form */}
                    <View className="w-full px-10">
                        <CustomInput
                            placeholder="Enter Full Name"
                            label="Name"
                            value={user.name}
                            onChangeText={(text) => setUser({ ...user, name: text })}
                        />

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

                        <CustomInput
                            placeholder="Confirm Password"
                            secureTextEntry
                            label="Confirm Password"
                            value={user.confirmPassword}
                            onChangeText={(text) => setUser({ ...user, confirmPassword: text })}
                        />
                    </View>

                    {/* Signup Button */}
                    <TouchableOpacity
                        className="w-full px-10 mt-6"
                        onPress={onSubmit}
                    >
                        <Text className="text-black font-bold bg-accent py-3 rounded-lg w-full text-center">
                            Sign Up
                        </Text>
                    </TouchableOpacity>

                    {/* Login Link */}
                    <TouchableOpacity
                        className="mt-4"
                        onPress={() => router.push("/sign-in")}
                    >
                        <Text className="text-light-200">
                            Already have an account? <Text className="text-accent">Login</Text>
                        </Text>
                    </TouchableOpacity>

                </ScrollView>

            </KeyboardAvoidingView>

        </SafeAreaView>
    );
}