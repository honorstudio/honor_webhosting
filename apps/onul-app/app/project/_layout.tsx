import { Stack } from "expo-router";
import { View } from "react-native";
import BackButton from "../../src/components/BackButton";
import Sidebar from "../../src/components/Sidebar";
import { useResponsive } from "../../src/hooks/useResponsive";

export default function ProjectLayout() {
  const { showSidebar } = useResponsive();

  const stackContent = (
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
        name="[id]"
        options={{
          title: "프로젝트 상세",
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          title: "프로젝트 생성",
        }}
      />
      <Stack.Screen
        name="minor"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="edit"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );

  // PC/태블릿: 사이드바 + 콘텐츠
  if (showSidebar) {
    return (
      <View style={{ flex: 1, flexDirection: "row" }} className="bg-background">
        <Sidebar />
        <View style={{ flex: 1 }} className="bg-background">
          {stackContent}
        </View>
      </View>
    );
  }

  return stackContent;
}
