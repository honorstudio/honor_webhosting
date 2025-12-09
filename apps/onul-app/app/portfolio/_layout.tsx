import { Stack } from "expo-router";
import BackButton from "../../src/components/BackButton";

export default function PortfolioLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#FFFFFF",
        },
        headerTitleStyle: {
          fontWeight: "600",
          color: "#111827",
        },
        headerShadowVisible: false,
        headerBackTitle: "뒤로",
        headerTintColor: "#67c0a1",
        headerLeft: () => <BackButton />,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "포트폴리오",
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: "포트폴리오 상세",
        }}
      />
    </Stack>
  );
}
