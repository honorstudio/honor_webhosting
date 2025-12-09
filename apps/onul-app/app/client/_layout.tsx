import { Stack } from "expo-router";
import BackButton from "../../src/components/BackButton";

export default function ClientLayout() {
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
        name="project/[id]"
        options={{
          title: "프로젝트 상세",
        }}
      />
    </Stack>
  );
}
