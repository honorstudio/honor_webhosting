import { Stack } from "expo-router";
import BackButton from "../../src/components/BackButton";

export default function MasterLayout() {
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
        headerTintColor: "#111827",
        headerLeft: () => <BackButton />,
      }}
    >
      <Stack.Screen
        name="add"
        options={{
          title: "마스터 추가",
        }}
      />
    </Stack>
  );
}
