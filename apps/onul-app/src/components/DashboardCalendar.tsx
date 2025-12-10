import { useState, useMemo } from "react";
import { View, Text, Pressable } from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Trash2, CheckCircle2 } from "lucide-react-native";

// 한국어 설정
LocaleConfig.locales["ko"] = {
  monthNames: [
    "1월", "2월", "3월", "4월", "5월", "6월",
    "7월", "8월", "9월", "10월", "11월", "12월",
  ],
  monthNamesShort: [
    "1월", "2월", "3월", "4월", "5월", "6월",
    "7월", "8월", "9월", "10월", "11월", "12월",
  ],
  dayNames: [
    "일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일",
  ],
  dayNamesShort: ["일", "월", "화", "수", "목", "금", "토"],
  today: "오늘",
};
LocaleConfig.defaultLocale = "ko";

export interface ScheduleItem {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  location?: string;
  status: "scheduled" | "in_progress" | "completed" | "review";
  type: "pickup" | "cleaning" | "visit" | "other"; // 수거, 청소, 방문, 기타
}

interface DashboardCalendarProps {
  schedules: ScheduleItem[];
  onDateSelect?: (date: string, items: ScheduleItem[]) => void;
  onItemPress?: (item: ScheduleItem) => void;
  compact?: boolean; // 컴팩트 모드 (대시보드용)
}

export default function DashboardCalendar({
  schedules,
  onDateSelect,
  onItemPress,
  compact = false,
}: DashboardCalendarProps) {
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [currentMonth, setCurrentMonth] = useState(today.substring(0, 7));

  // 날짜별 스케줄 그룹핑
  const schedulesByDate = useMemo(() => {
    const grouped: Record<string, ScheduleItem[]> = {};
    schedules.forEach((item) => {
      if (!grouped[item.date]) {
        grouped[item.date] = [];
      }
      grouped[item.date].push(item);
    });
    return grouped;
  }, [schedules]);

  // 선택된 날짜의 스케줄
  const selectedSchedules = schedulesByDate[selectedDate] || [];

  // 캘린더 마킹
  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};

    // 스케줄이 있는 날짜 마킹
    Object.keys(schedulesByDate).forEach((date) => {
      const items = schedulesByDate[date];
      const hasPickup = items.some((i) => i.type === "pickup");
      const hasCompleted = items.every((i) => i.status === "completed");

      marks[date] = {
        marked: true,
        dotColor: hasCompleted ? "#9CA3AF" : hasPickup ? "#67c0a1" : "#3B82F6",
      };
    });

    // 선택된 날짜
    marks[selectedDate] = {
      ...marks[selectedDate],
      selected: true,
      selectedColor: "#67c0a1",
      selectedTextColor: "#ffffff",
    };

    // 오늘 날짜 표시
    if (selectedDate !== today) {
      marks[today] = {
        ...marks[today],
        today: true,
      };
    }

    return marks;
  }, [schedulesByDate, selectedDate, today]);

  // 날짜 선택 핸들러
  const handleDayPress = (day: { dateString: string }) => {
    setSelectedDate(day.dateString);
    onDateSelect?.(day.dateString, schedulesByDate[day.dateString] || []);
  };

  // 상태 라벨
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "scheduled":
        return { label: "예정", bgColor: "bg-blue-100", textColor: "text-blue-600" };
      case "in_progress":
        return { label: "진행중", bgColor: "bg-primary/10", textColor: "text-primary" };
      case "completed":
        return { label: "완료", bgColor: "bg-gray-100", textColor: "text-gray-500" };
      case "review":
        return { label: "검토", bgColor: "bg-amber-100", textColor: "text-amber-600" };
      default:
        return { label: status, bgColor: "bg-gray-100", textColor: "text-gray-500" };
    }
  };

  // 타입 아이콘
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "pickup":
        return <Trash2 size={16} color="#67c0a1" />;
      case "cleaning":
        return <CheckCircle2 size={16} color="#3B82F6" />;
      default:
        return <CalendarIcon size={16} color="#6B7280" />;
    }
  };

  // 날짜 포맷
  const formatSelectedDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayName = dayNames[date.getDay()];
    return `${month}월 ${day}일 (${dayName})`;
  };

  // D-Day 계산
  const getDDay = (dateStr: string) => {
    const target = new Date(dateStr);
    const now = new Date();
    target.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diff === 0) return "오늘";
    if (diff === 1) return "내일";
    if (diff === -1) return "어제";
    if (diff > 0) return `D-${diff}`;
    return `D+${Math.abs(diff)}`;
  };

  return (
    <View className="bg-white rounded-2xl border border-border overflow-hidden">
      {/* 캘린더 헤더 */}
      <View className="px-4 py-3 border-b border-border bg-surface/50">
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-bold text-foreground">일정 캘린더</Text>
          <View className="flex-row items-center gap-2">
            <View className="flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-primary mr-1" />
              <Text className="text-xs text-muted">수거</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-blue-500 mr-1" />
              <Text className="text-xs text-muted">기타</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 캘린더 */}
      <Calendar
        current={currentMonth}
        onDayPress={handleDayPress}
        onMonthChange={(month) => setCurrentMonth(month.dateString.substring(0, 7))}
        markedDates={markedDates}
        hideExtraDays={true}
        enableSwipeMonths={true}
        renderArrow={(direction) => (
          direction === "left"
            ? <ChevronLeft size={20} color="#6B7280" />
            : <ChevronRight size={20} color="#6B7280" />
        )}
        theme={{
          backgroundColor: "#ffffff",
          calendarBackground: "#ffffff",
          textSectionTitleColor: "#6B7280",
          selectedDayBackgroundColor: "#67c0a1",
          selectedDayTextColor: "#ffffff",
          todayTextColor: "#67c0a1",
          todayBackgroundColor: "#67c0a1/10",
          dayTextColor: "#1F2937",
          textDisabledColor: "#D1D5DB",
          dotColor: "#67c0a1",
          selectedDotColor: "#ffffff",
          arrowColor: "#67c0a1",
          monthTextColor: "#1F2937",
          textDayFontWeight: "400",
          textMonthFontWeight: "600",
          textDayHeaderFontWeight: "500",
          textDayFontSize: 14,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 12,
        }}
        style={{ paddingBottom: 8 }}
      />

      {/* 선택된 날짜의 일정 */}
      <View className="border-t border-border">
        <View className="px-4 py-3 bg-surface/30">
          <Text className="text-sm font-semibold text-foreground">
            {formatSelectedDate(selectedDate)}
          </Text>
        </View>

        {selectedSchedules.length > 0 ? (
          <View className="px-4 py-2">
            {selectedSchedules.map((item) => {
              const statusInfo = getStatusInfo(item.status);
              return (
                <Pressable
                  key={item.id}
                  className="flex-row items-center py-3 border-b border-border/50 last:border-b-0 active:opacity-70"
                  onPress={() => onItemPress?.(item)}
                >
                  <View className="w-8 h-8 rounded-full bg-surface items-center justify-center mr-3">
                    {getTypeIcon(item.type)}
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-foreground" numberOfLines={1}>
                      {item.title}
                    </Text>
                    {item.location && (
                      <Text className="text-xs text-muted mt-0.5" numberOfLines={1}>
                        {item.location}
                      </Text>
                    )}
                  </View>
                  <View className={`${statusInfo.bgColor} px-2 py-1 rounded-full`}>
                    <Text className={`text-xs font-medium ${statusInfo.textColor}`}>
                      {statusInfo.label}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <View className="px-4 py-6 items-center">
            <CalendarIcon size={24} color="#D1D5DB" />
            <Text className="text-sm text-muted mt-2">일정이 없습니다</Text>
          </View>
        )}
      </View>
    </View>
  );
}
