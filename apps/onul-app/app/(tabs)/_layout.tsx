import { useState } from "react";
import { Tabs } from "expo-router";
import { Pressable, View } from "react-native";
import {
  LayoutDashboard,
  FolderKanban,
  Store,
  MessageCircle,
  Menu,
} from "lucide-react-native";
import DrawerMenu from "../../src/components/DrawerMenu";
import Sidebar from "../../src/components/Sidebar";
import { useResponsive } from "../../src/hooks/useResponsive";

export default function TabLayout() {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const { showSidebar, contentMaxWidth } = useResponsive();

  // PC/태블릿: 사이드바 레이아웃
  if (showSidebar) {
    return (
      <View style={{ flex: 1, flexDirection: "row" }} className="bg-background">
        {/* 사이드바 (고정) */}
        <Sidebar />

        {/* 메인 컨텐츠 영역 - 전체 너비 사용 */}
        <View style={{ flex: 1 }} className="bg-background">
            <Tabs
              screenOptions={{
                headerShown: true,
                headerStyle: {
                  backgroundColor: "#FFFFFF",
                },
                headerTitleStyle: {
                  fontWeight: "600",
                  color: "#111827",
                },
                headerShadowVisible: false,
                // PC에서는 하단 탭바 숨기기
                tabBarStyle: {
                  display: "none",
                },
              }}
            >
              <Tabs.Screen
                name="index"
                options={{
                  title: "대시보드",
                  tabBarIcon: ({ color, size }) => (
                    <LayoutDashboard size={size} color={color} />
                  ),
                }}
              />
              <Tabs.Screen
                name="projects"
                options={{
                  title: "프로젝트",
                  tabBarIcon: ({ color, size }) => (
                    <FolderKanban size={size} color={color} />
                  ),
                }}
              />
              <Tabs.Screen
                name="stores"
                options={{
                  title: "매장관리",
                  tabBarIcon: ({ color, size }) => (
                    <Store size={size} color={color} />
                  ),
                }}
              />
              <Tabs.Screen
                name="chat"
                options={{
                  title: "채팅",
                  headerShown: false, // PC에서는 자체 헤더 사용
                  tabBarIcon: ({ color, size }) => (
                    <MessageCircle size={size} color={color} />
                  ),
                }}
              />
            </Tabs>
        </View>
      </View>
    );
  }

  // 모바일: 기존 탭바 레이아웃
  return (
    <>
      <DrawerMenu
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      />
      <Tabs
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: "#FFFFFF",
          },
          headerTitleStyle: {
            fontWeight: "600",
            color: "#111827",
          },
          headerShadowVisible: false,
          headerLeft: () => (
            <Pressable
              onPress={() => setDrawerVisible(true)}
              className="ml-4 p-2"
            >
              <Menu size={24} color="#111827" />
            </Pressable>
          ),
          tabBarStyle: {
            backgroundColor: "#FFFFFF",
            borderTopColor: "#E5E7EB",
            borderTopWidth: 1,
            height: 92,
            paddingTop: 8,
            paddingBottom: 28,
          },
          tabBarActiveTintColor: "#67c0a1",
          tabBarInactiveTintColor: "#9CA3AF",
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "500",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "대시보드",
            tabBarIcon: ({ color, size }) => (
              <LayoutDashboard size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="projects"
          options={{
            title: "프로젝트",
            tabBarIcon: ({ color, size }) => (
              <FolderKanban size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="stores"
          options={{
            title: "매장관리",
            tabBarIcon: ({ color, size }) => <Store size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: "채팅",
            tabBarIcon: ({ color, size }) => (
              <MessageCircle size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
