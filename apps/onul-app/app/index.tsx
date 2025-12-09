import { useEffect } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../src/contexts/AuthContext";

export default function WelcomeScreen() {
  const router = useRouter();
  const { session, loading } = useAuth();

  // 로그인 상태면 대시보드로 리다이렉트
  useEffect(() => {
    if (!loading && session) {
      router.replace("/(tabs)");
    }
  }, [loading, session]);

  // 로딩 중일 때 로딩 화면 표시
  if (loading) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#67c0a1" />
      </View>
    );
  }

  // 로그인되어 있으면 아무것도 표시하지 않음 (리다이렉트 중)
  if (session) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#67c0a1" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background justify-center items-center px-6">
      {/* 로고 영역 */}
      <View className="mb-12">
        <Text className="text-5xl font-bold text-foreground">오늘</Text>
        <Text className="text-muted text-center mt-2">
          청소 서비스 관리 플랫폼
        </Text>
      </View>

      {/* 버튼 영역 */}
      <View className="w-full gap-4">
        <Pressable
          onPress={() => router.push("/(auth)/login")}
          className="w-full bg-primary py-4 rounded-xl items-center active:opacity-80"
        >
          <Text className="text-white font-semibold text-lg">로그인</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("/(auth)/register")}
          className="w-full bg-surface border border-border py-4 rounded-xl items-center active:opacity-80"
        >
          <Text className="text-foreground font-semibold text-lg">
            회원가입
          </Text>
        </Pressable>
      </View>

      {/* 하단 텍스트 */}
      <Text className="text-muted text-sm mt-8">
        서비스 이용약관 및 개인정보처리방침에 동의합니다
      </Text>
    </View>
  );
}
