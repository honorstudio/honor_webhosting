import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import {
  User,
  Mail,
  Phone,
  Shield,
  Briefcase,
  Edit3,
  ChevronRight,
} from "lucide-react-native";
import { useAuth } from "../../src/contexts/AuthContext";

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, user, loading } = useAuth();

  const getRoleLabel = (role: string | undefined) => {
    switch (role) {
      case "super_admin":
        return "최고 관리자";
      case "project_manager":
        return "프로젝트 책임자";
      case "master":
        return "마스터";
      case "client":
        return "클라이언트";
      default:
        return "미정";
    }
  };

  const getRoleColor = (role: string | undefined) => {
    switch (role) {
      case "super_admin":
        return "bg-red-100 text-red-600";
      case "project_manager":
        return "bg-blue-100 text-blue-600";
      case "master":
        return "bg-primary/10 text-primary";
      case "client":
        return "bg-purple-100 text-purple-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#67c0a1" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background">
      {/* 프로필 헤더 */}
      <View className="bg-white px-6 py-8 items-center border-b border-border">
        <View className="w-24 h-24 rounded-full bg-surface items-center justify-center mb-4">
          {profile?.avatar_url ? (
            <View className="w-24 h-24 rounded-full bg-primary/20 items-center justify-center">
              <User size={48} color="#67c0a1" />
            </View>
          ) : (
            <User size={48} color="#9CA3AF" />
          )}
        </View>
        <Text className="text-2xl font-bold text-foreground">
          {profile?.name || "이름 없음"}
        </Text>
        <View className={`mt-2 px-4 py-1 rounded-full ${getRoleColor(profile?.role)}`}>
          <Text className="text-sm font-medium">
            {getRoleLabel(profile?.role)}
          </Text>
        </View>
      </View>

      {/* 기본 정보 */}
      <View className="px-6 mt-6">
        <Text className="text-lg font-bold text-foreground mb-4">기본 정보</Text>

        <View className="bg-white rounded-xl border border-border">
          <View className="flex-row items-center px-4 py-4 border-b border-border">
            <Mail size={20} color="#6B7280" />
            <View className="ml-4 flex-1">
              <Text className="text-muted text-sm">이메일</Text>
              <Text className="text-foreground font-medium">
                {user?.email || "이메일 없음"}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center px-4 py-4 border-b border-border">
            <Phone size={20} color="#6B7280" />
            <View className="ml-4 flex-1">
              <Text className="text-muted text-sm">전화번호</Text>
              <Text className="text-foreground font-medium">
                {profile?.phone || "미등록"}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center px-4 py-4">
            <Shield size={20} color="#6B7280" />
            <View className="ml-4 flex-1">
              <Text className="text-muted text-sm">역할</Text>
              <Text className="text-foreground font-medium">
                {getRoleLabel(profile?.role)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* 마스터 전용 정보 */}
      {profile?.role === "master" && (
        <View className="px-6 mt-6">
          <Text className="text-lg font-bold text-foreground mb-4">
            마스터 정보
          </Text>

          <View className="bg-white rounded-xl border border-border">
            <View className="px-4 py-4 border-b border-border">
              <Text className="text-muted text-sm mb-2">보유 기술</Text>
              {profile?.skills && profile.skills.length > 0 ? (
                <View className="flex-row flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <View
                      key={index}
                      className="bg-primary/10 px-3 py-1 rounded-full"
                    >
                      <Text className="text-primary text-sm">{skill}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text className="text-foreground">등록된 기술 없음</Text>
              )}
            </View>

            <View className="px-4 py-4">
              <Text className="text-muted text-sm mb-2">자기소개</Text>
              <Text className="text-foreground">
                {profile?.bio || "자기소개가 없습니다."}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* 계정 상태 */}
      <View className="px-6 mt-6">
        <Text className="text-lg font-bold text-foreground mb-4">계정 상태</Text>

        <View className="bg-white rounded-xl border border-border">
          <View className="flex-row items-center px-4 py-4">
            <Briefcase size={20} color="#6B7280" />
            <View className="ml-4 flex-1">
              <Text className="text-muted text-sm">활성 상태</Text>
              <Text className="text-foreground font-medium">
                {profile?.is_active ? "활성" : "비활성"}
              </Text>
            </View>
            <View
              className={`w-3 h-3 rounded-full ${
                profile?.is_active ? "bg-green-500" : "bg-gray-400"
              }`}
            />
          </View>
        </View>
      </View>

      {/* 프로필 수정 버튼 */}
      <View className="px-6 mt-8 mb-8">
        <Pressable
          onPress={() => router.push("/profile/edit")}
          className="bg-primary py-4 rounded-xl items-center flex-row justify-center active:opacity-80"
        >
          <Edit3 size={20} color="#FFFFFF" />
          <Text className="text-white font-semibold text-lg ml-2">
            프로필 수정
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
