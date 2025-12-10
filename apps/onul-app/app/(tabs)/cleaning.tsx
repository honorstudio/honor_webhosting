import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Sparkles,
  Clock,
  MapPin,
  ChevronRight,
  X,
  Calendar,
  CheckCircle2,
  Star,
  Users,
} from "lucide-react-native";
import { useAuth } from "../../src/contexts/AuthContext";
import { supabase } from "../../src/lib/supabase";

interface CleaningService {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: number;
  rating: number;
  reviewCount: number;
  image?: string;
  features: string[];
}

interface MyRequest {
  id: string;
  serviceName: string;
  status: string;
  requestedDate: string;
  location: string | null;
}

export default function CleaningScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [services, setServices] = useState<CleaningService[]>([]);
  const [myRequests, setMyRequests] = useState<MyRequest[]>([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedService, setSelectedService] = useState<CleaningService | null>(null);
  const [requestDate, setRequestDate] = useState("");
  const [requestNote, setRequestNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 임시 서비스 목록 (실제로는 DB에서 가져와야 함)
  const defaultServices: CleaningService[] = [
    {
      id: "1",
      name: "매장 기본 청소",
      description: "바닥 청소, 먼지 제거, 쓰레기 수거 등 기본적인 매장 청소 서비스",
      duration: "2~3시간",
      price: 80000,
      rating: 4.8,
      reviewCount: 124,
      features: ["바닥 청소", "먼지 제거", "쓰레기 수거", "화장실 청소"],
    },
    {
      id: "2",
      name: "정밀 위생 청소",
      description: "소독 및 살균 포함, 위생이 중요한 매장을 위한 전문 청소 서비스",
      duration: "3~4시간",
      price: 150000,
      rating: 4.9,
      reviewCount: 87,
      features: ["전체 소독", "살균 처리", "에어컨 필터 청소", "환기구 청소"],
    },
    {
      id: "3",
      name: "입주/이사 청소",
      description: "새로운 매장 입주 또는 이사 시 필요한 대청소 서비스",
      duration: "4~6시간",
      price: 250000,
      rating: 4.7,
      reviewCount: 56,
      features: ["전체 대청소", "유리창 청소", "바닥 왁싱", "주방 청소"],
    },
    {
      id: "4",
      name: "주방 전문 청소",
      description: "식당, 카페 등 주방 시설 전문 청소 서비스",
      duration: "3~5시간",
      price: 180000,
      rating: 4.8,
      reviewCount: 92,
      features: ["후드 청소", "그리스 제거", "배수구 청소", "장비 세척"],
    },
  ];

  const fetchData = useCallback(async () => {
    if (!profile?.id) return;

    try {
      // 서비스 목록 설정 (임시)
      setServices(defaultServices);

      // 내 신청 내역 조회
      const { data, error } = await supabase
        .from("onul_major_projects")
        .select("id, title, status, scheduled_date, location")
        .eq("client_id", profile.id)
        .like("title", "%청소%")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;

      const mapped: MyRequest[] = (data || []).map((item) => ({
        id: item.id,
        serviceName: item.title,
        status: item.status,
        requestedDate: item.scheduled_date || "",
        location: item.location,
      }));

      setMyRequests(mapped);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [profile]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const handleServicePress = (service: CleaningService) => {
    setSelectedService(service);
    setShowRequestModal(true);
  };

  const handleSubmitRequest = async () => {
    if (!profile?.id || !selectedService || !requestDate) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from("onul_major_projects").insert({
        title: `[1회] ${selectedService.name}`,
        scheduled_date: requestDate,
        client_id: profile.id,
        status: "pending",
        description: `서비스: ${selectedService.name}\n예상 소요시간: ${selectedService.duration}\n예상 비용: ${selectedService.price.toLocaleString()}원\n\n요청사항: ${requestNote || "없음"}`,
        location: profile.address || null,
      });

      if (error) throw error;

      setShowRequestModal(false);
      setSelectedService(null);
      setRequestDate("");
      setRequestNote("");
      fetchData();
    } catch (error) {
      console.error("Error submitting request:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return { label: "검토중", color: "bg-amber-100", textColor: "text-amber-600" };
      case "confirmed":
        return { label: "확정", color: "bg-blue-100", textColor: "text-blue-600" };
      case "in_progress":
        return { label: "진행중", color: "bg-primary/10", textColor: "text-primary" };
      case "completed":
        return { label: "완료", color: "bg-gray-100", textColor: "text-gray-500" };
      default:
        return { label: status, color: "bg-gray-100", textColor: "text-gray-500" };
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString("ko-KR") + "원";
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#67c0a1" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#67c0a1" />
        }
      >
        {/* 안내 배너 */}
        <View className="mx-4 mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <View className="flex-row items-start">
            <Sparkles size={20} color="#3B82F6" />
            <View className="ml-3 flex-1">
              <Text className="text-foreground font-semibold">1회성 청소 서비스</Text>
              <Text className="text-muted text-sm mt-1">
                정기 구독 외 추가로 필요한 청소 서비스를 신청하세요.
                {"\n"}전문 청소팀이 방문하여 서비스를 제공합니다.
              </Text>
            </View>
          </View>
        </View>

        {/* 서비스 목록 */}
        <View className="px-4 mt-6">
          <Text className="text-base font-bold text-foreground mb-3">
            서비스 목록
          </Text>

          <View className="gap-3">
            {services.map((service) => (
              <Pressable
                key={service.id}
                className="bg-white border border-border rounded-xl overflow-hidden active:opacity-80"
                onPress={() => handleServicePress(service)}
              >
                <View className="p-4">
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1">
                      <Text className="text-foreground font-bold text-base">
                        {service.name}
                      </Text>
                      <Text className="text-muted text-sm mt-1" numberOfLines={2}>
                        {service.description}
                      </Text>
                    </View>
                    <ChevronRight size={20} color="#9CA3AF" />
                  </View>

                  <View className="flex-row items-center mt-3">
                    <View className="flex-row items-center mr-4">
                      <Clock size={14} color="#6B7280" />
                      <Text className="text-muted text-sm ml-1">{service.duration}</Text>
                    </View>
                    <View className="flex-row items-center mr-4">
                      <Star size={14} color="#F59E0B" fill="#F59E0B" />
                      <Text className="text-muted text-sm ml-1">
                        {service.rating} ({service.reviewCount})
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row flex-wrap mt-3 gap-1">
                    {service.features.slice(0, 3).map((feature, index) => (
                      <View
                        key={index}
                        className="bg-surface px-2 py-1 rounded-full"
                      >
                        <Text className="text-muted text-xs">{feature}</Text>
                      </View>
                    ))}
                    {service.features.length > 3 && (
                      <View className="bg-surface px-2 py-1 rounded-full">
                        <Text className="text-muted text-xs">+{service.features.length - 3}</Text>
                      </View>
                    )}
                  </View>

                  <View className="flex-row items-center justify-between mt-4 pt-3 border-t border-border">
                    <Text className="text-primary font-bold text-lg">
                      {formatPrice(service.price)}~
                    </Text>
                    <View className="bg-primary px-4 py-2 rounded-lg">
                      <Text className="text-white font-medium text-sm">신청하기</Text>
                    </View>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* 내 신청 내역 */}
        {myRequests.length > 0 && (
          <View className="px-4 mt-6">
            <Text className="text-base font-bold text-foreground mb-3">
              내 신청 내역
            </Text>

            <View className="gap-2">
              {myRequests.map((request) => {
                const status = getStatusLabel(request.status);
                return (
                  <Pressable
                    key={request.id}
                    className="bg-white border border-border rounded-xl p-4 flex-row items-center active:opacity-80"
                    onPress={() => router.push(`/client/project/${request.id}`)}
                  >
                    <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center">
                      <Sparkles size={18} color="#3B82F6" />
                    </View>
                    <View className="flex-1 ml-3">
                      <Text className="text-foreground font-medium">{request.serviceName}</Text>
                      <Text className="text-muted text-sm">{request.requestedDate || "일정 미정"}</Text>
                    </View>
                    <View className={`${status.color} px-2 py-1 rounded-full`}>
                      <Text className={`${status.textColor} text-xs font-medium`}>
                        {status.label}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        <View className="h-8" />
      </ScrollView>

      {/* 서비스 신청 바텀 드로어 */}
      <Modal
        visible={showRequestModal}
        transparent
        animationType="none"
        onRequestClose={() => setShowRequestModal(false)}
      >
        {/* 배경 오버레이 - 별도 분리 (터치 시 닫힘) */}
        <Pressable
          className="absolute inset-0 bg-black/40"
          onPress={() => setShowRequestModal(false)}
        />

        {/* 바텀 드로어 - 하단에서 위로 */}
        <View className="flex-1 justify-end">
          <View className="bg-white rounded-t-3xl max-h-[85%]">
            {/* 드로어 핸들 */}
            <View className="items-center pt-3 pb-2">
              <View className="w-10 h-1 bg-gray-300 rounded-full" />
            </View>

            <View className="px-5">
              {/* 헤더 */}
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-bold text-foreground">서비스 신청</Text>
                <Pressable
                  onPress={() => setShowRequestModal(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
                >
                  <X size={18} color="#6B7280" />
                </Pressable>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} className="max-h-[350px]">
                {selectedService && (
                  <>
                    {/* 선택된 서비스 정보 */}
                    <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                      <Text className="text-foreground font-bold text-base">
                        {selectedService.name}
                      </Text>
                      <Text className="text-muted text-sm mt-1">
                        {selectedService.description}
                      </Text>
                      <View className="flex-row items-center mt-2">
                        <Clock size={14} color="#6B7280" />
                        <Text className="text-muted text-sm ml-1">
                          예상 소요시간: {selectedService.duration}
                        </Text>
                      </View>
                      <Text className="text-primary font-bold text-lg mt-2">
                        {formatPrice(selectedService.price)}~
                      </Text>
                    </View>

                    {/* 희망 날짜 */}
                    <View className="mb-4">
                      <Text className="text-sm font-medium text-foreground mb-2">
                        희망 날짜 *
                      </Text>
                      <TextInput
                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-foreground"
                        placeholder="예: 2025-01-15"
                        placeholderTextColor="#9CA3AF"
                        value={requestDate}
                        onChangeText={setRequestDate}
                      />
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

                    {/* 안내 문구 */}
                    <View className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
                      <Text className="text-amber-700 text-sm">
                        신청 후 담당자가 확인하여 연락드립니다.{"\n"}
                        최종 가격은 현장 확인 후 결정될 수 있습니다.
                      </Text>
                    </View>
                  </>
                )}
              </ScrollView>
            </View>

            {/* 버튼 */}
            <View className="flex-row gap-3 px-5 pb-8 pt-4 border-t border-gray-100">
              <Pressable
                className="flex-1 py-4 bg-gray-100 rounded-xl items-center active:bg-gray-200"
                onPress={() => setShowRequestModal(false)}
              >
                <Text className="text-foreground font-medium">취소</Text>
              </Pressable>
              <Pressable
                className={`flex-1 py-4 rounded-xl items-center ${
                  !requestDate || submitting ? "bg-primary/50" : "bg-primary active:bg-primary/90"
                }`}
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
          </View>
        </View>
      </Modal>
    </View>
  );
}
