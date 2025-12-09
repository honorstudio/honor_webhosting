import { View, Text, Pressable } from "react-native";
import { useRouter, usePathname } from "expo-router";
import {
  LayoutDashboard,
  FolderKanban,
  Store,
  MessageCircle,
  User,
  Settings,
  LogOut,
} from "lucide-react-native";
import { useAuth } from "../contexts/AuthContext";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  matchPaths?: string[];
}

const navItems: NavItem[] = [
  {
    name: "대시보드",
    href: "/(tabs)",
    icon: LayoutDashboard,
    matchPaths: ["/(tabs)", "/(tabs)/index"],
  },
  {
    name: "프로젝트",
    href: "/(tabs)/projects",
    icon: FolderKanban,
    matchPaths: ["/(tabs)/projects", "/project"],
  },
  {
    name: "매장관리",
    href: "/(tabs)/stores",
    icon: Store,
    matchPaths: ["/(tabs)/stores", "/store"],
  },
  {
    name: "채팅",
    href: "/(tabs)/chat",
    icon: MessageCircle,
    matchPaths: ["/(tabs)/chat", "/chat"],
  },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { profile, signOut } = useAuth();

  const isActive = (item: NavItem) => {
    if (item.matchPaths) {
      return item.matchPaths.some((path) => pathname.startsWith(path));
    }
    return pathname === item.href;
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace("/(auth)/login");
  };

  return (
    <View
      className="h-full bg-white border-r border-border"
      style={{ width: 240 }}
    >
      {/* 로고 / 앱 이름 */}
      <View className="px-6 py-6 border-b border-border">
        <Text className="text-2xl font-bold text-primary">오늘</Text>
        <Text className="text-sm text-muted">청소 서비스 관리</Text>
      </View>

      {/* 네비게이션 메뉴 */}
      <View className="flex-1 px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);

          return (
            <Pressable
              key={item.name}
              className={`flex-row items-center px-4 py-3 rounded-xl mb-1 ${
                active ? "bg-primary/10" : "hover:bg-surface"
              }`}
              onPress={() => router.push(item.href as any)}
            >
              <Icon size={22} color={active ? "#67c0a1" : "#6B7280"} />
              <Text
                className={`ml-3 text-base font-medium ${
                  active ? "text-primary" : "text-foreground"
                }`}
              >
                {item.name}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* 하단 유저 정보 */}
      <View className="border-t border-border px-3 py-4">
        {/* 프로필 */}
        <Pressable
          className="flex-row items-center px-4 py-3 rounded-xl hover:bg-surface"
          onPress={() => router.push("/profile")}
        >
          <View className="w-10 h-10 rounded-full bg-surface items-center justify-center">
            <User size={20} color="#6B7280" />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-foreground font-medium">
              {profile?.name || "사용자"}
            </Text>
            <Text className="text-muted text-sm">{profile?.email || ""}</Text>
          </View>
        </Pressable>

        {/* 설정 & 로그아웃 */}
        <View className="flex-row mt-2">
          <Pressable
            className="flex-1 flex-row items-center justify-center py-2 rounded-lg hover:bg-surface"
            onPress={() => router.push("/profile")}
          >
            <Settings size={18} color="#6B7280" />
            <Text className="ml-2 text-muted text-sm">설정</Text>
          </Pressable>
          <Pressable
            className="flex-1 flex-row items-center justify-center py-2 rounded-lg hover:bg-surface"
            onPress={handleSignOut}
          >
            <LogOut size={18} color="#6B7280" />
            <Text className="ml-2 text-muted text-sm">로그아웃</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
