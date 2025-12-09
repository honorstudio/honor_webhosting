import { Stack } from "expo-router";
import BackButton from "../../src/components/BackButton";

export default function PhotoLayout() {
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
        name="upload"
        options={{
          title: "사진 업로드",
        }}
      />
      <Stack.Screen
        name="gallery"
        options={{
          title: "작업 상세",
        }}
      />
      <Stack.Screen
        name="compare"
        options={{
          title: "비포/애프터 비교",
        }}
      />
    </Stack>
  );
}
