import { Stack } from "expo-router";
import { View } from "react-native";
import BackButton from "../../src/components/BackButton";
import Sidebar from "../../src/components/Sidebar";
import { useResponsive } from "../../src/hooks/useResponsive";

// 채팅 상세는 PC에서도 모바일 비율로 표시
const MOBILE_MAX_WIDTH = 430;

export default function ChatLayout() {
  const { showSidebar, isDesktop, isTablet } = useResponsive();

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
          title: "채팅",
        }}
      />
    </Stack>
  );

  // PC/태블릿: 사이드바 + 모바일 비율 콘텐츠
  if (showSidebar) {
    return (
      <View style={{ flex: 1, flexDirection: "row" }} className="bg-background">
        <Sidebar />
        <View style={{ flex: 1, alignItems: "center" }} className="bg-background">
          <View style={{ width: "100%", maxWidth: MOBILE_MAX_WIDTH, flex: 1 }}>
            {stackContent}
          </View>
        </View>
      </View>
    );
  }

  return stackContent;
}
