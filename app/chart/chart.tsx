import { useRouter } from "expo-router";
import React from "react";
import { View, Text, ScrollView, Dimensions, TouchableOpacity } from "react-native";
import {
  LineChart,
  BarChart,
  PieChart,
} from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

const WEEKLY_DATA = [400, 300, 600, 800, 500, 900, 700];

const MONTHLY_GROWTH = [4000, 3000, 5000, 2780, 1890, 2390];

const TASK_DIST = [
  { name: "Completed", population: 400, color: "#3b82f6", legendFontColor: "#333", legendFontSize: 12 },
  { name: "Pending", population: 300, color: "#10b981", legendFontColor: "#333", legendFontSize: 12 },
  { name: "Review", population: 300, color: "#f59e0b", legendFontColor: "#333", legendFontSize: 12 },
];

const DEVICE_USAGE = [
  { name: "Desktop", population: 65, color: "#3b82f6", legendFontColor: "#333", legendFontSize: 12 },
  { name: "Mobile", population: 25, color: "#10b981", legendFontColor: "#333", legendFontSize: 12 },
  { name: "Tablet", population: 10, color: "#f59e0b", legendFontColor: "#333", legendFontSize: 12 },
];

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  color: (opacity = 1) => `rgba(59,130,246,${opacity})`,
  strokeWidth: 2,
};

const ChartSection = () => {
  const router = useRouter();
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 24 }} className="my-10">

      {/* Engagement Trends */}
      <View>
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
          Engagement Trends
        </Text>

        <LineChart
          data={{
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            datasets: [{ data: WEEKLY_DATA }],
          }}
          width={screenWidth - 32}
          height={220}
          chartConfig={chartConfig}
        />
      </View>

      {/* Monthly Growth */}
      <View>
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
          Monthly Growth
        </Text>

        <LineChart
          data={{
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
            datasets: [{ data: MONTHLY_GROWTH }],
          }}
          width={screenWidth - 32}
          height={220}
          chartConfig={chartConfig}
        />
      </View>

      {/* Weekly Activity */}
      <View>
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
          Weekly Activity
        </Text>

        {/* <BarChart
          data={{
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            datasets: [{ data: WEEKLY_DATA }],
          }}
          width={screenWidth - 32}
          height={220}
          chartConfig={chartConfig}
        /> */}
      </View>

      {/* Task Distribution */}
      <View>
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
          Task Load
        </Text>

        <PieChart
          data={TASK_DIST}
          width={screenWidth - 32}
          height={220}
          chartConfig={chartConfig}
          accessor={"population"}
          backgroundColor={"transparent"}
          paddingLeft={"15"}
        />
      </View>

      {/* Device Usage */}
      <View>
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
          Device Mix
        </Text>

        <PieChart
          data={DEVICE_USAGE}
          width={screenWidth - 32}
          height={220}
          chartConfig={chartConfig}
          accessor={"population"}
          backgroundColor={"transparent"}
          paddingLeft={"15"}
        />
      </View>

    </ScrollView>
  );
};

export default ChartSection;