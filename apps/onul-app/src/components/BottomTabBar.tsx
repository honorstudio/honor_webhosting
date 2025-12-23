import { View, Text, Pressable } from "react-native";
import { useRouter, usePathname } from "expo-router";
import {
  LayoutDashboard,
  FolderKanban,
  Store,
  MessageCircle,
  CalendarCheck,
  User,
  Sparkles,
  Home,
} from "lucide-react-native";
import { useAuth } from "../contexts/AuthContext";
import { useDevView } from "../contexts/DevViewContext";

interface TabItem {
  name: string;
  href: string;
  icon: any;
  label: string;
}

export default function BottomTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { profile, loading } = useAuth();
  const { getEffectiveRole } = useDevView();

  const effectiveRole = getEffectiveRole(profile?.role);
  // 로딩 중이거나 profile이 없으면 클라이언트로 기본 처리 (또는 탭바 숨김)
  const isClient = loading || !profile ? true : effectiveRole === "client";

  // 클라이언트용 탭
  const clientTabs: TabItem[] = [
    { name: "index", href: "/(tabs)", icon: Home, label: "대시보드" },
    { name: "schedule", href: "/(tabs)/schedule", icon: CalendarCheck, label: "정기관리" },
    { name: "cleaning", href: "/(tabs)/cleaning", icon: Sparkles, label: "매장관리" },
    { name: "chat", href: "/(tabs)/chat", icon: MessageCircle, label: "채팅" },
    { name: "myinfo", href: "/(tabs)/myinfo", icon: User, label: "내 정보" },
  ];

  // 마스터/관리자용 탭
  const masterTabs: TabItem[] = [
    { name: "master-dashboard", href: "/(tabs)/master-dashboard", icon: LayoutDashboard, label: "대시보드" },
    { name: "projects", href: "/(tabs)/projects", icon: FolderKanban, label: "프로젝트" },
    { name: "stores", href: "/(tabs)/stores", icon: Store, label: "매장관리" },
    { name: "chat", href: "/(tabs)/chat", icon: MessageCircle, label: "채팅" },
  ];

  const tabs = isClient ? clientTabs : masterTabs;

  const isActive = (href: string) => {
    // 정확한 경로 매칭
    if (href === "/(tabs)" && (pathname === "/app" || pathname === "/app/" || pathname === "/(tabs)")) {
      return true;
    }
    return pathname.includes(href.replace("/(tabs)", ""));
  };

  return (
    <View
      className="flex-row bg-white border-t border-border"
      style={{
        height: 92,
        paddingTop: 8,
        paddingBottom: 28,
      }}
    >
      {tabs.map((tab) => {
        const active = isActive(tab.href);
        const IconComponent = tab.icon;

        return (
          <Pressable
            key={tab.name}
            onPress={() => router.push(tab.href as any)}
            className="flex-1 items-center justify-center"
          >
            <IconComponent
              size={24}
              color={active ? "#67c0a1" : "#9CA3AF"}
            />
            <Text
              className={`text-xs mt-1 font-medium ${
                active ? "text-primary" : "text-muted"
              }`}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
