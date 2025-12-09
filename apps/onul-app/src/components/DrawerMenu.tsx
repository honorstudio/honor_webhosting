import { View, Text, Pressable, Modal, Switch } from "react-native";
import { useRouter } from "expo-router";
import {
  X,
  LayoutDashboard,
  FolderKanban,
  Store,
  MessageCircle,
  User,
  Settings,
  LogOut,
  Eye,
  Images,
} from "lucide-react-native";
import { useAuth } from "../contexts/AuthContext";
import { useDevView } from "../contexts/DevViewContext";

interface DrawerMenuProps {
  visible: boolean;
  onClose: () => void;
}

export default function DrawerMenu({ visible, onClose }: DrawerMenuProps) {
  const router = useRouter();
  const { profile, signOut } = useAuth();
  const { isClientView, isMasterView, setClientView, setMasterView, viewMode } = useDevView();

  const navigateTo = (path: string) => {
    onClose();
    router.push(path as any);
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "대시보드", path: "/(tabs)" },
    { icon: FolderKanban, label: "프로젝트", path: "/(tabs)/projects" },
    { icon: Store, label: "매장관리", path: "/(tabs)/stores" },
    { icon: MessageCircle, label: "채팅", path: "/(tabs)/chat" },
    { icon: Images, label: "포트폴리오", path: "/portfolio" },
  ];

  const bottomItems = [
    { icon: User, label: "프로필 설정", path: "/profile" },
    { icon: Settings, label: "앱 설정", path: "/settings" },
  ];

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 flex-row">
        {/* 메뉴 패널 */}
        <View className="w-72 bg-white h-full shadow-xl">
          {/* 헤더 */}
          <View className="bg-primary pt-14 pb-4 px-6">
            <Pressable
              onPress={onClose}
              className="absolute top-12 right-4 p-2 z-50"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={24} color="#FFFFFF" />
            </Pressable>
            <View className="flex-row items-center">
              <View className="w-16 h-16 rounded-full bg-white/20 items-center justify-center">
                <User size={32} color="#FFFFFF" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-white text-xl font-bold">
                  {profile?.name || "게스트"}
                </Text>
                <Text className="text-white/80 text-sm">
                  {viewMode === "client"
                    ? "고객 뷰"
                    : viewMode === "master"
                    ? "마스터 뷰"
                    : profile?.role === "super_admin"
                    ? "최고 관리자"
                    : profile?.role === "project_manager"
                    ? "프로젝트 책임자"
                    : profile?.role === "master"
                    ? "마스터"
                    : profile?.role === "client"
                    ? "클라이언트"
                    : ""}
                </Text>
              </View>
            </View>

            {/* 개발용 뷰 토글 - 최고 관리자만 표시 */}
            {profile?.role === "super_admin" && (
              <View className="mt-4 bg-white/10 rounded-xl p-3">
                <View className="flex-row items-center mb-1">
                  <Eye size={14} color="#FFFFFF" />
                  <Text className="text-white/90 text-xs font-medium ml-1">
                    개발 모드
                  </Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Text className="text-white text-sm mr-2">고객뷰</Text>
                    <Switch
                      value={isClientView}
                      onValueChange={setClientView}
                      trackColor={{ false: "rgba(255,255,255,0.3)", true: "#FFFFFF" }}
                      thumbColor={isClientView ? "#67c0a1" : "#f4f3f4"}
                      ios_backgroundColor="rgba(255,255,255,0.3)"
                    />
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-white text-sm mr-2">마스터뷰</Text>
                    <Switch
                      value={isMasterView}
                      onValueChange={setMasterView}
                      trackColor={{ false: "rgba(255,255,255,0.3)", true: "#FFFFFF" }}
                      thumbColor={isMasterView ? "#67c0a1" : "#f4f3f4"}
                      ios_backgroundColor="rgba(255,255,255,0.3)"
                    />
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* 메뉴 아이템 */}
          <View className="flex-1 py-4">
            {menuItems.map((item, index) => (
              <Pressable
                key={index}
                onPress={() => navigateTo(item.path)}
                className="flex-row items-center px-6 py-4 active:bg-surface"
              >
                <item.icon size={22} color="#6B7280" />
                <Text className="ml-4 text-foreground text-base">
                  {item.label}
                </Text>
              </Pressable>
            ))}

            <View className="h-px bg-border mx-6 my-4" />

            {bottomItems.map((item, index) => (
              <Pressable
                key={index}
                onPress={() => navigateTo(item.path)}
                className="flex-row items-center px-6 py-4 active:bg-surface"
              >
                <item.icon size={22} color="#6B7280" />
                <Text className="ml-4 text-foreground text-base">
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* 로그아웃 */}
          <View className="border-t border-border pb-8">
            <Pressable
              onPress={async () => {
                onClose();
                await signOut();
                router.replace("/(auth)/login");
              }}
              className="flex-row items-center px-6 py-4 active:bg-surface"
            >
              <LogOut size={22} color="#EF4444" />
              <Text className="ml-4 text-red-500 text-base">로그아웃</Text>
            </Pressable>
          </View>
        </View>

        {/* 오버레이 */}
        <Pressable onPress={onClose} className="flex-1 bg-black/50" />
      </View>
    </Modal>
  );
}
