import { Stack } from "expo-router";
import { View } from "react-native";
import BackButton from "../../src/components/BackButton";
import Sidebar from "../../src/components/Sidebar";
import { useResponsive } from "../../src/hooks/useResponsive";

export default function StoreLayout() {
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
        headerBackTitle: "뒤로",
        headerTintColor: "#67c0a1",
        headerLeft: () => <BackButton />,
      }}
    >
      <Stack.Screen
        name="[id]"
        options={{
          title: "매장 상세",
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          title: "매장 등록",
        }}
      />
      <Stack.Screen
        name="edit"
        options={{
          title: "매장 수정",
        }}
      />
      <Stack.Screen
        name="visit/create"
        options={{
          title: "방문 기록 등록",
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
