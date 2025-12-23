import { useState } from "react";
import { Tabs } from "expo-router";
import { Pressable, View } from "react-native";
import {
  LayoutDashboard,
  FolderKanban,
  Store,
  MessageCircle,
  Menu,
  CalendarCheck,
  User,
  Sparkles,
  Home,
} from "lucide-react-native";
import DrawerMenu from "../../src/components/DrawerMenu";
import Sidebar from "../../src/components/Sidebar";
import { useResponsive } from "../../src/hooks/useResponsive";
import { useAuth } from "../../src/contexts/AuthContext";
import { useDevView } from "../../src/contexts/DevViewContext";

export default function TabLayout() {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const { showSidebar } = useResponsive();
  const { profile } = useAuth();
  const { getEffectiveRole } = useDevView();

  const effectiveRole = getEffectiveRole(profile?.role);
  const isClient = effectiveRole === "client";

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
              {/* 클라이언트: 대시보드 (숫자 중심), 마스터: 숨김 */}
              <Tabs.Screen
                name="index"
                options={{
                  title: "대시보드",
                  href: isClient ? "/(tabs)" : null,
                  tabBarIcon: ({ color, size }) => (
                    <Home size={size} color={color} />
                  ),
                }}
              />
              {/* 마스터/관리자: 대시보드 (캘린더) */}
              <Tabs.Screen
                name="master-dashboard"
                options={{
                  title: "대시보드",
                  href: isClient ? null : "/(tabs)/master-dashboard",
                  tabBarIcon: ({ color, size }) => (
                    <LayoutDashboard size={size} color={color} />
                  ),
                }}
              />
              {/* 마스터/관리자: 프로젝트 */}
              <Tabs.Screen
                name="projects"
                options={{
                  title: "프로젝트",
                  href: isClient ? null : "/(tabs)/projects",
                  tabBarIcon: ({ color, size }) => (
                    <FolderKanban size={size} color={color} />
                  ),
                }}
              />
              {/* 마스터/관리자: 매장관리 */}
              <Tabs.Screen
                name="stores"
                options={{
                  title: "매장관리",
                  href: isClient ? null : "/(tabs)/stores",
                  tabBarIcon: ({ color, size }) => (
                    <Store size={size} color={color} />
                  ),
                }}
              />
              {/* 클라이언트: 정기관리 (두번째 탭) */}
              <Tabs.Screen
                name="schedule"
                options={{
                  title: "정기관리",
                  href: isClient ? "/(tabs)/schedule" : null,
                  tabBarIcon: ({ color, size }) => (
                    <CalendarCheck size={size} color={color} />
                  ),
                }}
              />
              {/* 클라이언트: 매장관리 (단기 1회성 청소) */}
              <Tabs.Screen
                name="cleaning"
                options={{
                  title: "매장관리",
                  href: isClient ? "/(tabs)/cleaning" : null,
                  tabBarIcon: ({ color, size }) => (
                    <Sparkles size={size} color={color} />
                  ),
                }}
              />
              <Tabs.Screen
                name="chat"
                options={{
                  title: "채팅",
                  headerShown: false,
                  tabBarIcon: ({ color, size }) => (
                    <MessageCircle size={size} color={color} />
                  ),
                }}
              />
              {/* 클라이언트: 내 정보 */}
              <Tabs.Screen
                name="myinfo"
                options={{
                  title: "내 정보",
                  href: isClient ? "/(tabs)/myinfo" : null,
                  tabBarIcon: ({ color, size }) => (
                    <User size={size} color={color} />
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
        {/* 클라이언트: 대시보드 (숫자 중심), 마스터: 숨김 */}
        <Tabs.Screen
          name="index"
          options={{
            title: "대시보드",
            href: isClient ? "/(tabs)" : null,
            tabBarIcon: ({ color, size }) => (
              <Home size={size} color={color} />
            ),
          }}
        />
        {/* 마스터/관리자: 대시보드 (캘린더) */}
        <Tabs.Screen
          name="master-dashboard"
          options={{
            title: "대시보드",
            href: isClient ? null : "/(tabs)/master-dashboard",
            tabBarIcon: ({ color, size }) => (
              <LayoutDashboard size={size} color={color} />
            ),
          }}
        />
        {/* 마스터/관리자: 프로젝트 */}
        <Tabs.Screen
          name="projects"
          options={{
            title: "프로젝트",
            href: isClient ? null : "/(tabs)/projects",
            tabBarIcon: ({ color, size }) => (
              <FolderKanban size={size} color={color} />
            ),
          }}
        />
        {/* 마스터/관리자: 매장관리 */}
        <Tabs.Screen
          name="stores"
          options={{
            title: "매장관리",
            href: isClient ? null : "/(tabs)/stores",
            tabBarIcon: ({ color, size }) => <Store size={size} color={color} />,
          }}
        />
        {/* 클라이언트: 정기관리 (두번째 탭) */}
        <Tabs.Screen
          name="schedule"
          options={{
            title: "정기관리",
            href: isClient ? "/(tabs)/schedule" : null,
            tabBarIcon: ({ color, size }) => (
              <CalendarCheck size={size} color={color} />
            ),
          }}
        />
        {/* 클라이언트: 매장관리 (단기 1회성 청소) */}
        <Tabs.Screen
          name="cleaning"
          options={{
            title: "매장관리",
            href: isClient ? "/(tabs)/cleaning" : null,
            tabBarIcon: ({ color, size }) => (
              <Sparkles size={size} color={color} />
            ),
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
        {/* 클라이언트: 내 정보 */}
        <Tabs.Screen
          name="myinfo"
          options={{
            title: "내 정보",
            href: isClient ? "/(tabs)/myinfo" : null,
            tabBarIcon: ({ color, size }) => (
              <User size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
