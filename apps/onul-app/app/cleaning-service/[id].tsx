import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import {
  Sparkles,
  Clock,
  Star,
  Check,
  Calendar,
} from "lucide-react-native";
import { useAuth } from "../../src/contexts/AuthContext";
import { supabase } from "../../src/lib/supabase";
import BottomSheet from "../../src/components/BottomSheet";
import BackButton from "../../src/components/BackButton";
import BottomTabBar from "../../src/components/BottomTabBar";

interface CleaningService {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: number;
  rating: number;
  reviewCount: number;
  features: string[];
}

// 임시 서비스 데이터 (실제로는 DB에서 가져와야 함)
const servicesData: Record<string, CleaningService> = {
  "1": {
    id: "1",
    name: "매장 기본 청소",
    description: "바닥 청소, 먼지 제거, 쓰레기 수거 등 기본적인 매장 청소 서비스",
    duration: "2~3시간",
    price: 80000,
    rating: 4.8,
    reviewCount: 124,
    features: ["바닥 청소", "먼지 제거", "쓰레기 수거", "화장실 청소"],
  },
  "2": {
    id: "2",
    name: "정밀 위생 청소",
    description: "소독 및 살균 포함, 위생이 중요한 매장을 위한 전문 청소 서비스",
    duration: "3~4시간",
    price: 150000,
    rating: 4.9,
    reviewCount: 87,
    features: ["전체 소독", "살균 처리", "에어컨 필터 청소", "환기구 청소"],
  },
  "3": {
    id: "3",
    name: "입주/이사 청소",
    description: "새로운 매장 입주 또는 이사 시 필요한 대청소 서비스",
    duration: "4~6시간",
    price: 250000,
    rating: 4.7,
    reviewCount: 56,
    features: ["전체 대청소", "유리창 청소", "바닥 왁싱", "주방 청소"],
  },
  "4": {
    id: "4",
    name: "주방 전문 청소",
    description: "식당, 카페 등 주방 시설 전문 청소 서비스",
    duration: "3~5시간",
    price: 180000,
    rating: 4.8,
    reviewCount: 92,
    features: ["후드 청소", "그리스 제거", "배수구 청소", "장비 세척"],
  },
};

export default function CleaningServiceDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestDate, setRequestDate] = useState("");
  const [requestNote, setRequestNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const service = id ? servicesData[id] : null;

  const formatPrice = (price: number) => {
    return price.toLocaleString("ko-KR") + "원";
  };

  const handleSubmitRequest = async () => {
    if (!profile?.id || !service || !requestDate) return;

    setSubmitting(true);
    try {
      const priceText = service.price.toLocaleString();
      const { error } = await supabase.from("onul_major_projects").insert({
        title: "[1회] " + service.name,
        scheduled_date: requestDate,
        client_id: profile.id,
        status: "pending",
        description: "서비스: " + service.name + "\n예상 소요시간: " + service.duration + "\n예상 비용: " + priceText + "원\n\n요청사항: " + (requestNote || "없음"),
        location: profile.address || null,
      });

      if (error) throw error;

      setShowRequestModal(false);
      router.back();
    } catch (error) {
      console.error("Error submitting request:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!service) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-muted">서비스를 찾을 수 없습니다.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* 커스텀 헤더 */}
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-border">
        <BackButton fallbackPath="/(tabs)/cleaning" />
        <Text className="text-lg font-semibold text-foreground flex-1 ml-3" numberOfLines={1}>
          {service.name}
        </Text>
      </View>

      <ScrollView className="flex-1">
        {/* 서비스 이미지/아이콘 영역 */}
        <View className="bg-gray-50 h-48 items-center justify-center">
          <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center">
            <Sparkles size={48} color="#111827" />
          </View>
        </View>

        {/* 서비스 정보 */}
        <View className="px-4 py-5">
          <Text className="text-2xl font-bold text-foreground">{service.name}</Text>

          <View className="flex-row items-center mt-2">
            <View className="flex-row items-center mr-4">
              <Star size={16} color="#111827" fill="#111827" />
              <Text className="text-foreground font-medium ml-1">{service.rating}</Text>
              <Text className="text-muted ml-1">({service.reviewCount}개 리뷰)</Text>
            </View>
            <View className="flex-row items-center">
              <Clock size={16} color="#111827" />
              <Text className="text-muted ml-1">{service.duration}</Text>
            </View>
          </View>

          <Text className="text-muted mt-4 leading-6">{service.description}</Text>

          {/* 가격 */}
          <View className="bg-primary/5 border border-primary/20 rounded-xl p-4 mt-5">
            <Text className="text-muted text-sm">예상 가격</Text>
            <Text className="text-primary text-2xl font-bold mt-1">
              {formatPrice(service.price)}~
            </Text>
            <Text className="text-muted text-xs mt-1">
              * 실제 가격은 현장 확인 후 변경될 수 있습니다.
            </Text>
          </View>

          {/* 서비스 포함 내용 */}
          <View className="mt-6">
            <Text className="text-lg font-bold text-foreground mb-3">서비스 포함 내용</Text>
            <View className="gap-2">
              {service.features.map((feature, index) => (
                <View key={index} className="flex-row items-center">
                  <View className="w-6 h-6 bg-primary/10 rounded-full items-center justify-center">
                    <Check size={14} color="#67c0a1" />
                  </View>
                  <Text className="text-foreground ml-3">{feature}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* 안내 사항 */}
          <View className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-4">
            <Text className="text-foreground font-semibold mb-2">안내 사항</Text>
            <Text className="text-muted text-sm leading-5">
              • 신청 후 담당자가 확인하여 연락드립니다.{"\n"}
              • 현장 확인 후 최종 가격이 결정됩니다.{"\n"}
              • 서비스 일정은 협의 후 조정될 수 있습니다.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* 하단 버튼 */}
      <View className="px-4 py-4 bg-white border-t border-border">
        <Pressable
          className="bg-primary py-4 rounded-xl items-center active:bg-primary/90"
          onPress={() => setShowRequestModal(true)}
        >
          <Text className="text-white font-bold text-lg">서비스 신청하기</Text>
        </Pressable>
      </View>

      {/* 신청 바텀 시트 */}
      <BottomSheet
        visible={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        title="서비스 신청"
      >
        {/* 선택된 서비스 요약 */}
        <View className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
          <Text className="text-foreground font-bold">{service.name}</Text>
          <Text className="text-primary font-bold mt-1">
            {formatPrice(service.price)}~
          </Text>
        </View>

        {/* 희망 날짜 */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-foreground mb-2">
            희망 날짜 *
          </Text>
          <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
            <Calendar size={18} color="#6B7280" />
            <TextInput
              className="flex-1 ml-2 text-foreground"
              placeholder="예: 2025-01-15"
              placeholderTextColor="#9CA3AF"
              value={requestDate}
              onChangeText={setRequestDate}
            />
          </View>
        </View>

        {/* 요청 사항 */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-foreground mb-2">
            요청 사항 (선택)
          </Text>
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
        <View className="flex-row gap-3 pt-4 border-t border-gray-100">
          <Pressable
            className="flex-1 py-4 bg-gray-100 rounded-xl items-center active:bg-gray-200"
            onPress={() => setShowRequestModal(false)}
          >
            <Text className="text-foreground font-medium">취소</Text>
          </Pressable>
          <Pressable
            className={"flex-1 py-4 rounded-xl items-center " + (!requestDate || submitting ? "bg-primary/50" : "bg-primary active:bg-primary/90")}
            onPress={handleSubmitRequest}
            disabled={!requestDate || submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text className="text-white font-semibold">신청하기</Text>
            )}
          </Pressable>
        </View>
      </BottomSheet>

      {/* 하단 탭바 */}
      <BottomTabBar />
    </View>
  );
}
