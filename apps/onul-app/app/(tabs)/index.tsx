import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter, Redirect } from "expo-router";
import {
  Trash2,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  TrendingUp,
  Package,
} from "lucide-react-native";
import { useAuth } from "../../src/contexts/AuthContext";
import { useDevView } from "../../src/contexts/DevViewContext";
import { supabase } from "../../src/lib/supabase";

interface DashboardStats {
  // 이번 달 통계
  monthlyPickups: number;
  monthlyPickupsUsed: number;
  monthlyCleaning: number;
  monthlyCleaningUsed: number;
  // 전체 통계
  totalPickups: number;
  totalCleaning: number;
  completedPickups: number;
  completedCleaning: number;
  pendingRequests: number;
  // 다음 일정
  nextScheduleDate: string | null;
  nextScheduleType: "pickup" | "cleaning" | null;
}

export default function ClientDashboardScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const { getEffectiveRole } = useDevView();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    monthlyPickups: 2,
    monthlyPickupsUsed: 0,
    monthlyCleaning: 1,
    monthlyCleaningUsed: 0,
    totalPickups: 0,
    totalCleaning: 0,
    completedPickups: 0,
    completedCleaning: 0,
    pendingRequests: 0,
    nextScheduleDate: null,
    nextScheduleType: null,
  });

  const effectiveRole = getEffectiveRole(profile?.role);

  const fetchStats = useCallback(async () => {
    if (!profile?.id) {
      setLoading(false);
      return;
    }

    try {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // 전체 프로젝트 조회
      const { data: allProjects, error } = await supabase
        .from("onul_major_projects")
        .select("id, title, status, scheduled_date")
        .eq("client_id", profile.id);

      if (error) throw error;

      const projects = allProjects || [];

      // 이번 달 완료된 수거
      const monthlyPickupsUsed = projects.filter((p) => {
        const date = p.scheduled_date ? new Date(p.scheduled_date) : null;
        return (
          !p.title.includes("청소") &&
          p.status === "completed" &&
          date &&
          date >= firstDayOfMonth &&
          date <= lastDayOfMonth
        );
      }).length;

      // 이번 달 완료된 청소
      const monthlyCleaningUsed = projects.filter((p) => {
        const date = p.scheduled_date ? new Date(p.scheduled_date) : null;
        return (
          p.title.includes("청소") &&
          p.status === "completed" &&
          date &&
          date >= firstDayOfMonth &&
          date <= lastDayOfMonth
        );
      }).length;

      // 전체 수거/청소
      const totalPickups = projects.filter((p) => !p.title.includes("청소")).length;
      const totalCleaning = projects.filter((p) => p.title.includes("청소")).length;

      // 완료된 수거/청소
      const completedPickups = projects.filter(
        (p) => !p.title.includes("청소") && p.status === "completed"
      ).length;
      const completedCleaning = projects.filter(
        (p) => p.title.includes("청소") && p.status === "completed"
      ).length;

      // 대기중인 요청
      const pendingRequests = projects.filter((p) => p.status === "pending").length;

      // 다음 일정 찾기
      const upcomingProjects = projects
        .filter((p) => {
          const date = p.scheduled_date ? new Date(p.scheduled_date) : null;
          return date && date >= now && p.status !== "completed";
        })
        .sort((a, b) => {
          const dateA = new Date(a.scheduled_date!);
          const dateB = new Date(b.scheduled_date!);
          return dateA.getTime() - dateB.getTime();
        });

      const nextSchedule = upcomingProjects[0];

      setStats({
        monthlyPickups: 2, // 구독 플랜에서 가져와야 함
        monthlyPickupsUsed,
        monthlyCleaning: 1,
        monthlyCleaningUsed,
        totalPickups,
        totalCleaning,
        completedPickups,
        completedCleaning,
        pendingRequests,
        nextScheduleDate: nextSchedule?.scheduled_date || null,
        nextScheduleType: nextSchedule
          ? nextSchedule.title.includes("청소")
            ? "cleaning"
            : "pickup"
          : null,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [profile]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStats();
  }, [fetchStats]);

  // 클라이언트가 아닌 경우 master-dashboard로 리다이렉트
  if (effectiveRole && effectiveRole !== "client") {
    return <Redirect href="/(tabs)/master-dashboard" />;
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "예정 없음";
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      month: "long",
      day: "numeric",
      weekday: "short",
    });
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#67c0a1" />
      </View>
    );
  }

  const currentMonth = new Date().toLocaleDateString("ko-KR", { month: "long" });

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#67c0a1" />
        }
      >
        {/* 다음 일정 카드 */}
        <View className="mx-4 mt-4 bg-primary rounded-2xl p-5">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-white/80 text-sm">다음 일정</Text>
              <Text className="text-white font-bold text-xl mt-1">
                {formatDate(stats.nextScheduleDate)}
              </Text>
              {stats.nextScheduleType && (
                <Text className="text-white/80 text-sm mt-1">
                  {stats.nextScheduleType === "pickup" ? "정기 수거" : "청소 서비스"}
                </Text>
              )}
            </View>
            <View className="w-14 h-14 bg-white/20 rounded-full items-center justify-center">
              <Calendar size={28} color="#ffffff" />
            </View>
          </View>
        </View>

        {/* 이번 달 현황 */}
        <View className="mx-4 mt-6">
          <Text className="text-lg font-bold text-foreground mb-3">{currentMonth} 현황</Text>

          <View className="flex-row gap-3">
            {/* 정기 수거 */}
            <View className="flex-1 bg-white border border-border rounded-xl p-4">
              <View className="flex-row items-center mb-3">
                <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center">
                  <Trash2 size={20} color="#67c0a1" />
                </View>
                <Text className="text-foreground font-medium ml-2">정기 수거</Text>
              </View>
              <View className="flex-row items-end">
                <Text className="text-3xl font-bold text-foreground">
                  {stats.monthlyPickups - stats.monthlyPickupsUsed}
                </Text>
                <Text className="text-muted text-sm ml-1 mb-1">
                  / {stats.monthlyPickups}회 남음
                </Text>
              </View>
            </View>

            {/* 정기 청소 */}
            <View className="flex-1 bg-white border border-border rounded-xl p-4">
              <View className="flex-row items-center mb-3">
                <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
                  <Sparkles size={20} color="#111827" />
                </View>
                <Text className="text-foreground font-medium ml-2">정기 청소</Text>
              </View>
              <View className="flex-row items-end">
                <Text className="text-3xl font-bold text-foreground">
                  {stats.monthlyCleaning - stats.monthlyCleaningUsed}
                </Text>
                <Text className="text-muted text-sm ml-1 mb-1">
                  / {stats.monthlyCleaning}회 남음
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 전체 통계 */}
        <View className="mx-4 mt-6">
          <Text className="text-lg font-bold text-foreground mb-3">전체 통계</Text>

          <View className="bg-white border border-border rounded-xl overflow-hidden">
            {/* 총 수거 */}
            <Pressable
              className="flex-row items-center justify-between p-4 border-b border-border active:bg-gray-50"
              onPress={() => router.push("/(tabs)/schedule")}
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center">
                  <Package size={20} color="#67c0a1" />
                </View>
                <View className="ml-3">
                  <Text className="text-foreground font-medium">총 수거 횟수</Text>
                  <Text className="text-muted text-sm">{stats.completedPickups}회 완료</Text>
                </View>
              </View>
              <Text className="text-2xl font-bold text-primary">{stats.totalPickups}</Text>
            </Pressable>

            {/* 총 청소 */}
            <Pressable
              className="flex-row items-center justify-between p-4 border-b border-border active:bg-gray-50"
              onPress={() => router.push("/(tabs)/cleaning")}
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
                  <Sparkles size={20} color="#111827" />
                </View>
                <View className="ml-3">
                  <Text className="text-foreground font-medium">총 청소 횟수</Text>
                  <Text className="text-muted text-sm">{stats.completedCleaning}회 완료</Text>
                </View>
              </View>
              <Text className="text-2xl font-bold text-foreground">{stats.totalCleaning}</Text>
            </Pressable>

            {/* 대기중 요청 */}
            <View className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
                  <Clock size={20} color="#111827" />
                </View>
                <View className="ml-3">
                  <Text className="text-foreground font-medium">대기중인 요청</Text>
                  <Text className="text-muted text-sm">검토 대기중</Text>
                </View>
              </View>
              <Text className="text-2xl font-bold text-foreground">{stats.pendingRequests}</Text>
            </View>
          </View>
        </View>

        {/* 빠른 액션 */}
        <View className="mx-4 mt-6">
          <Text className="text-lg font-bold text-foreground mb-3">빠른 액션</Text>

          <View className="flex-row gap-3">
            <Pressable
              className="flex-1 bg-primary py-4 rounded-xl items-center active:bg-primary/90"
              onPress={() => router.push("/(tabs)/schedule")}
            >
              <Trash2 size={24} color="#ffffff" />
              <Text className="text-white font-medium mt-2">수거 신청</Text>
            </Pressable>

            <Pressable
              className="flex-1 bg-foreground py-4 rounded-xl items-center active:opacity-90"
              onPress={() => router.push("/(tabs)/cleaning")}
            >
              <Sparkles size={24} color="#ffffff" />
              <Text className="text-white font-medium mt-2">청소 신청</Text>
            </Pressable>
          </View>
        </View>

        <View className="h-8" />
      </ScrollView>
    </View>
  );
}
