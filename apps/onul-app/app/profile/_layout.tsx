import { Stack } from "expo-router";
import BackButton from "../../src/components/BackButton";

export default function ProfileLayout() {
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
        name="index"
        options={{
          title: "내 프로필",
        }}
      />
      <Stack.Screen
        name="edit"
        options={{
          title: "프로필 수정",
        }}
      />
    </Stack>
  );
}
