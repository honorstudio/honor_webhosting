import { useState } from "react";
import { View, Text, Pressable, Modal } from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { Calendar as CalendarIcon, X } from "lucide-react-native";

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

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onDateChange: (startDate: string, endDate: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function DateRangePicker({
  startDate,
  endDate,
  onDateChange,
  disabled = false,
  placeholder = "날짜 선택",
}: DateRangePickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(startDate);
  const [tempEndDate, setTempEndDate] = useState(endDate);
  const [selectingStart, setSelectingStart] = useState(true);

  // 표시용 텍스트
  const getDisplayText = () => {
    if (!startDate && !endDate) return placeholder;
    if (startDate && !endDate) return formatDate(startDate);
    if (startDate && endDate) {
      if (startDate === endDate) return formatDate(startDate);
      return `${formatDate(startDate)} ~ ${formatDate(endDate)}`;
    }
    return placeholder;
  };

  // 날짜 포맷
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
  };

  // 마킹된 날짜 계산
  const getMarkedDates = () => {
    const marked: Record<string, any> = {};

    if (tempStartDate) {
      marked[tempStartDate] = {
        startingDay: true,
        color: "#67c0a1",
        textColor: "white",
      };
    }

    if (tempEndDate) {
      marked[tempEndDate] = {
        endingDay: true,
        color: "#67c0a1",
        textColor: "white",
      };
    }

    // 시작일과 종료일 사이의 날짜들
    if (tempStartDate && tempEndDate && tempStartDate !== tempEndDate) {
      const start = new Date(tempStartDate);
      const end = new Date(tempEndDate);
      const current = new Date(start);
      current.setDate(current.getDate() + 1);

      while (current < end) {
        const dateStr = current.toISOString().split("T")[0];
        marked[dateStr] = {
          color: "#67c0a1",
          textColor: "white",
        };
        current.setDate(current.getDate() + 1);
      }

      // 시작일과 종료일 마킹 조정
      marked[tempStartDate] = {
        startingDay: true,
        color: "#67c0a1",
        textColor: "white",
      };
      marked[tempEndDate] = {
        endingDay: true,
        color: "#67c0a1",
        textColor: "white",
      };
    }

    return marked;
  };

  // 날짜 선택 처리
  const handleDayPress = (day: { dateString: string }) => {
    if (selectingStart) {
      setTempStartDate(day.dateString);
      setTempEndDate("");
      setSelectingStart(false);
    } else {
      // 종료일이 시작일보다 이전인 경우 시작일로 설정
      if (day.dateString < tempStartDate) {
        setTempStartDate(day.dateString);
        setTempEndDate("");
      } else {
        setTempEndDate(day.dateString);
        setSelectingStart(true);
      }
    }
  };

  // 확인 버튼
  const handleConfirm = () => {
    onDateChange(tempStartDate, tempEndDate || tempStartDate);
    setModalVisible(false);
  };

  // 모달 열기
  const openModal = () => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
    setSelectingStart(true);
    setModalVisible(true);
  };

  // 초기화
  const handleReset = () => {
    setTempStartDate("");
    setTempEndDate("");
    setSelectingStart(true);
  };

  return (
    <View>
      {/* 날짜 표시 버튼 */}
      <Pressable
        onPress={openModal}
        disabled={disabled}
        className="bg-white border border-border rounded-xl px-4 py-4 flex-row items-center"
      >
        <CalendarIcon size={18} color="#9CA3AF" />
        <Text
          className={`ml-2 flex-1 ${
            startDate ? "text-foreground" : "text-muted"
          }`}
        >
          {getDisplayText()}
        </Text>
      </Pressable>

      {/* 날짜 선택 모달 */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-4">
          <View className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
            {/* 헤더 */}
            <View className="flex-row items-center justify-between px-4 py-4 border-b border-border">
              <Text className="text-lg font-bold text-foreground">날짜 선택</Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <X size={24} color="#6B7280" />
              </Pressable>
            </View>

            {/* 선택 상태 표시 */}
            <View className="flex-row px-4 py-3 bg-surface">
              <View className="flex-1 items-center">
                <Text className="text-xs text-muted mb-1">시작일</Text>
                <Text className={`font-medium ${selectingStart ? "text-primary" : "text-foreground"}`}>
                  {tempStartDate ? formatDate(tempStartDate) : "선택"}
                </Text>
              </View>
              <View className="w-8 items-center justify-center">
                <Text className="text-muted">~</Text>
              </View>
              <View className="flex-1 items-center">
                <Text className="text-xs text-muted mb-1">종료일</Text>
                <Text className={`font-medium ${!selectingStart ? "text-primary" : "text-foreground"}`}>
                  {tempEndDate ? formatDate(tempEndDate) : "선택"}
                </Text>
              </View>
            </View>

            {/* 캘린더 */}
            <Calendar
              onDayPress={handleDayPress}
              markedDates={getMarkedDates()}
              markingType="period"
              minDate={new Date().toISOString().split("T")[0]}
              theme={{
                backgroundColor: "#ffffff",
                calendarBackground: "#ffffff",
                textSectionTitleColor: "#6B7280",
                selectedDayBackgroundColor: "#67c0a1",
                selectedDayTextColor: "#ffffff",
                todayTextColor: "#67c0a1",
                dayTextColor: "#1F2937",
                textDisabledColor: "#D1D5DB",
                dotColor: "#67c0a1",
                selectedDotColor: "#ffffff",
                arrowColor: "#67c0a1",
                monthTextColor: "#1F2937",
                textDayFontWeight: "400",
                textMonthFontWeight: "600",
                textDayHeaderFontWeight: "500",
              }}
            />

            {/* 버튼 */}
            <View className="flex-row gap-3 px-4 py-4 border-t border-border">
              <Pressable
                onPress={handleReset}
                className="flex-1 py-3 rounded-xl bg-surface items-center"
              >
                <Text className="text-foreground font-medium">초기화</Text>
              </Pressable>
              <Pressable
                onPress={handleConfirm}
                disabled={!tempStartDate}
                className={`flex-1 py-3 rounded-xl items-center ${
                  tempStartDate ? "bg-primary" : "bg-primary/50"
                }`}
              >
                <Text className="text-white font-medium">확인</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
