import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Trash2,
  Sparkles,
  Calendar as CalendarIcon,
} from "lucide-react-native";
import { useAuth } from "../../src/contexts/AuthContext";
import BottomSheet from "../../src/components/BottomSheet";
import { supabase } from "../../src/lib/supabase";
import { Calendar, DateData } from "react-native-calendars";

interface SubscriptionPlan {
  monthlyPickups: number;
  monthlyCleaning: number;
  planName: string;
}

interface MonthlyStats {
  completedPickups: number;
  completedCleaning: number;
  remainingPickups: number;
  remainingCleaning: number;
}

interface ScheduleItem {
  id: string;
  date: string;
  title: string;
  type: "pickup" | "cleaning";
  status: string;
}

export default function ScheduleScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestNote, setRequestNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 구독 플랜 (임시 데이터 - 실제로는 DB에서 가져와야 함)
  const [plan] = useState<SubscriptionPlan>({
    monthlyPickups: 2,
    monthlyCleaning: 1,
    planName: "스탠다드",
  });

  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats>({
    completedPickups: 0,
    completedCleaning: 0,
    remainingPickups: 2,
    remainingCleaning: 1,
  });

  const fetchSchedules = useCallback(async () => {
    if (!profile?.id) return;

    try {
      const currentMonth = new Date();
      const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      const { data, error } = await supabase
        .from("onul_major_projects")
        .select("id, title, status, scheduled_date")
        .eq("client_id", profile.id)
        .gte("scheduled_date", firstDay.toISOString().split("T")[0])
        .lte("scheduled_date", lastDay.toISOString().split("T")[0])
        .order("scheduled_date", { ascending: true });

      if (error) throw error;

      const mapped: ScheduleItem[] = (data || []).map((item) => ({
        id: item.id,
        date: item.scheduled_date || "",
        title: item.title,
        type: item.title.includes("청소") ? "cleaning" : "pickup",
        status: item.status,
      }));

      setSchedules(mapped);

      // 이번달 완료 통계 계산
      const completedPickups = mapped.filter(
        (s) => s.type === "pickup" && s.status === "completed"
      ).length;
      const completedCleaning = mapped.filter(
        (s) => s.type === "cleaning" && s.status === "completed"
      ).length;

      setMonthlyStats({
        completedPickups,
        completedCleaning,
        remainingPickups: Math.max(0, plan.monthlyPickups - completedPickups),
        remainingCleaning: Math.max(0, plan.monthlyCleaning - completedCleaning),
      });
    } catch (error) {
      console.error("Error fetching schedules:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [profile, plan]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSchedules();
  }, [fetchSchedules]);

  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
    // 남은 수거가 있고 해당 날짜에 이미 예약이 없으면 신청 모달 표시
    const hasExisting = schedules.some((s) => s.date === day.dateString);
    if (monthlyStats.remainingPickups > 0 && !hasExisting) {
      setShowRequestModal(true);
    }
  };

  const handleSubmitRequest = async () => {
    if (!profile?.id || !selectedDate) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from("onul_major_projects").insert({
        title: `${new Date(selectedDate).getMonth() + 1}월 정기 수거`,
        scheduled_date: selectedDate,
        client_id: profile.id,
        status: "pending",
        description: requestNote || null,
        location: profile.address || null,
      });

      if (error) throw error;

      setShowRequestModal(false);
      setRequestNote("");
      fetchSchedules();
    } catch (error) {
      console.error("Error submitting request:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // 캘린더 마킹 데이터 생성
  const markedDates: { [key: string]: any } = {};
  schedules.forEach((s) => {
    if (s.date) {
      markedDates[s.date] = {
        marked: true,
        dotColor: s.type === "pickup" ? "#67c0a1" : "#111827",
        selected: s.date === selectedDate,
        selectedColor: s.date === selectedDate ? "#67c0a1" : undefined,
      };
    }
  });

  if (selectedDate && !markedDates[selectedDate]) {
    markedDates[selectedDate] = {
      selected: true,
      selectedColor: "#67c0a1",
    };
  }

  // 남은 수거/청소 심플 아이콘 렌더링 (○○○ 스타일)
  const renderSimpleIcons = (remaining: number, total: number, type: "pickup" | "cleaning") => {
    const icons = [];
    const activeColor = type === "pickup" ? "#67c0a1" : "#111827";

    for (let i = 0; i < total; i++) {
      const isRemaining = i < remaining;
      icons.push(
        <View
          key={i}
          className={`w-6 h-6 rounded-full mr-1 ${
            isRemaining
              ? ""
              : "bg-gray-200"
          }`}
          style={isRemaining ? { backgroundColor: activeColor } : {}}
        />
      );
    }
    return icons;
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
        {/* 구독 플랜 정보 */}
        <View className="mx-4 mt-4 bg-primary/5 border border-primary/20 rounded-xl p-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-muted text-sm">현재 구독 플랜</Text>
              <Text className="text-foreground font-bold text-lg">{plan.planName}</Text>
            </View>
            <View className="bg-primary px-3 py-1 rounded-full">
              <Text className="text-white text-sm font-medium">이용중</Text>
            </View>
          </View>
        </View>

        {/* 이번달 서비스 현황 */}
        <View className="mx-4 mt-4">
          <Text className="text-base font-bold text-foreground mb-3">
            {currentMonth} 서비스 현황
          </Text>

          {/* 정기 수거 현황 */}
          <View className="bg-white border border-border rounded-xl p-4 mb-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Trash2 size={18} color="#67c0a1" />
                <Text className="text-foreground font-medium ml-2">정기 수거</Text>
              </View>
              <View className="flex-row items-center">
                <View className="flex-row items-center mr-2">
                  {renderSimpleIcons(monthlyStats.remainingPickups, plan.monthlyPickups, "pickup")}
                </View>
                <Text className="text-muted text-sm">
                  {monthlyStats.remainingPickups}/{plan.monthlyPickups}
                </Text>
              </View>
            </View>
          </View>

          {/* 정기 청소 현황 */}
          <View className="bg-white border border-border rounded-xl p-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Sparkles size={18} color="#111827" />
                <Text className="text-foreground font-medium ml-2">정기 청소</Text>
              </View>
              <View className="flex-row items-center">
                <View className="flex-row items-center mr-2">
                  {renderSimpleIcons(monthlyStats.remainingCleaning, plan.monthlyCleaning, "cleaning")}
                </View>
                <Text className="text-muted text-sm">
                  {monthlyStats.remainingCleaning}/{plan.monthlyCleaning}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 캘린더로 수거 신청 */}
        <View className="mx-4 mt-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-base font-bold text-foreground">수거 일정 신청</Text>
            {monthlyStats.remainingPickups > 0 && (
              <Text className="text-primary text-sm">날짜를 선택하세요</Text>
            )}
          </View>

          <View className="bg-white border border-border rounded-xl overflow-hidden">
            <Calendar
              onDayPress={handleDayPress}
              markedDates={markedDates}
              theme={{
                backgroundColor: "#ffffff",
                calendarBackground: "#ffffff",
                textSectionTitleColor: "#6B7280",
                selectedDayBackgroundColor: "#67c0a1",
                selectedDayTextColor: "#ffffff",
                todayTextColor: "#67c0a1",
                dayTextColor: "#111827",
                textDisabledColor: "#D1D5DB",
                dotColor: "#67c0a1",
                arrowColor: "#67c0a1",
                monthTextColor: "#111827",
                textDayFontWeight: "500",
                textMonthFontWeight: "bold",
                textDayHeaderFontWeight: "500",
              }}
              minDate={new Date().toISOString().split("T")[0]}
            />

            {/* 범례 */}
            <View className="flex-row items-center justify-center py-3 border-t border-border">
              <View className="flex-row items-center mr-4">
                <View className="w-3 h-3 rounded-full bg-primary mr-1" />
                <Text className="text-muted text-xs">수거</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-foreground mr-1" />
                <Text className="text-muted text-xs">청소</Text>
              </View>
            </View>
          </View>

          {monthlyStats.remainingPickups === 0 && (
            <View className="mt-3 bg-gray-50 border border-gray-200 rounded-xl p-3">
              <Text className="text-muted text-sm text-center">
                이번 달 수거 횟수를 모두 사용했습니다.
              </Text>
            </View>
          )}
        </View>

        {/* 이번달 예약 내역 */}
        {schedules.length > 0 && (
          <View className="mx-4 mt-6">
            <Text className="text-base font-bold text-foreground mb-3">
              예약된 일정 ({schedules.length})
            </Text>
            <View className="gap-2">
              {schedules.map((item) => (
                <Pressable
                  key={item.id}
                  className="bg-white border border-border rounded-xl p-3 flex-row items-center active:opacity-80"
                  onPress={() => router.push(`/client/project/${item.id}`)}
                >
                  <View
                    className={`w-10 h-10 rounded-full items-center justify-center ${
                      item.type === "pickup" ? "bg-primary/10" : "bg-gray-100"
                    }`}
                  >
                    {item.type === "pickup" ? (
                      <Trash2 size={18} color="#67c0a1" />
                    ) : (
                      <Sparkles size={18} color="#111827" />
                    )}
                  </View>
                  <View className="flex-1 ml-3">
                    <Text className="text-foreground font-medium">{item.title}</Text>
                    <Text className="text-muted text-sm">{item.date}</Text>
                  </View>
                  <View
                    className={`px-2 py-1 rounded-full ${
                      item.status === "completed"
                        ? "bg-gray-100"
                        : item.status === "pending"
                        ? "bg-gray-100"
                        : "bg-primary/10"
                    }`}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        item.status === "completed"
                          ? "text-gray-500"
                          : item.status === "pending"
                          ? "text-gray-600"
                          : "text-primary"
                      }`}
                    >
                      {item.status === "completed"
                        ? "완료"
                        : item.status === "pending"
                        ? "대기중"
                        : "예정"}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        <View className="h-8" />
      </ScrollView>

      {/* 수거 신청 바텀 시트 */}
      <BottomSheet
        visible={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        title="수거 신청"
      >
        {/* 선택된 날짜 */}
        <View className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-5">
          <View className="flex-row items-center">
            <CalendarIcon size={20} color="#67c0a1" />
            <Text className="text-foreground font-medium ml-2">
              {selectedDate &&
                new Date(selectedDate).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  weekday: "long",
                })}
            </Text>
          </View>
        </View>

        {/* 요청 사항 */}
        <View className="mb-5">
          <Text className="text-sm font-medium text-foreground mb-2">요청 사항 (선택)</Text>
          <TextInput
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-foreground min-h-[80px]"
            placeholder="추가 요청 사항이 있으면 입력해주세요"
            placeholderTextColor="#9CA3AF"
            value={requestNote}
            onChangeText={setRequestNote}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* 버튼 */}
        <View className="flex-row gap-3">
          <Pressable
            className="flex-1 py-4 bg-gray-100 rounded-xl items-center active:bg-gray-200"
            onPress={() => setShowRequestModal(false)}
          >
            <Text className="text-foreground font-medium">취소</Text>
          </Pressable>
          <Pressable
            className={`flex-1 py-4 rounded-xl items-center ${
              submitting ? "bg-primary/50" : "bg-primary active:bg-primary/90"
            }`}
            onPress={handleSubmitRequest}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text className="text-white font-semibold">신청하기</Text>
            )}
          </Pressable>
        </View>
      </BottomSheet>
    </View>
  );
}
