import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function ChartScreen() {
    const router = useRouter();

    return (<View className="flex-1 bg-primary items-center justify-center px-6">

        {/* Title */}
        <Text className="text-white text-3xl font-bold text-center mb-4">
            Movie Explorer Dashboard
        </Text>

        {/* Description */}
        <Text className="text-light-200 text-center text-base mb-10">
            Explore movie analytics, track engagement charts,
            and visualize data about movies and users.
        </Text>

        {/* Button */}
        <TouchableOpacity
            className="bg-accent px-8 py-4 rounded-xl"
            activeOpacity={0.85}
            onPress={() => router.replace("/(tabs)")}
        >
            <Text className="text-black font-bold text-base">
                Go to Movie App
            </Text>
        </TouchableOpacity>

    </View>

    );
}
