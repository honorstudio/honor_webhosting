import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Sparkles,
  Clock,
  ChevronRight,
  Star,
  AlertCircle,
  CheckCircle2,
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
    // 서비스 상세 페이지로 이동
    router.push(`/cleaning-service/${service.id}`);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return { label: "검토중", color: "bg-gray-100", textColor: "text-gray-600" };
      case "confirmed":
        return { label: "확정", color: "bg-gray-200", textColor: "text-foreground" };
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
        {/* 신청 진행상황 (상단) */}
        {myRequests.length > 0 && (
          <View className="mx-4 mt-4">
            <Text className="text-base font-bold text-foreground mb-3">
              진행중인 서비스
            </Text>

            <View className="gap-2">
              {myRequests.map((request) => {
                const status = getStatusLabel(request.status);
                const isPending = request.status === "pending";
                const isInProgress = request.status === "in_progress" || request.status === "confirmed";
                const isCompleted = request.status === "completed";

                return (
                  <Pressable
                    key={request.id}
                    className="bg-white border border-border rounded-xl p-4 active:opacity-80"
                    onPress={() => router.push(`/client/project/${request.id}`)}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center flex-1">
                        <View className={`w-10 h-10 rounded-full items-center justify-center ${
                          isCompleted ? "bg-primary/10" : "bg-gray-100"
                        }`}>
                          {isCompleted ? (
                            <CheckCircle2 size={20} color="#67c0a1" />
                          ) : isPending ? (
                            <AlertCircle size={20} color="#111827" />
                          ) : (
                            <Sparkles size={20} color="#111827" />
                          )}
                        </View>
                        <View className="flex-1 ml-3">
                          <Text className="text-foreground font-medium">{request.serviceName}</Text>
                          <Text className="text-muted text-sm">{request.requestedDate || "일정 미정"}</Text>
                        </View>
                      </View>
                      <View className="flex-row items-center">
                        <View className={`${status.color} px-2 py-1 rounded-full mr-2`}>
                          <Text className={`${status.textColor} text-xs font-medium`}>
                            {status.label}
                          </Text>
                        </View>
                        <ChevronRight size={18} color="#9CA3AF" />
                      </View>
                    </View>

                    {/* 진행 바 */}
                    <View className="mt-3">
                      <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <View
                          className={`h-full rounded-full ${
                            isCompleted ? "bg-primary" : "bg-foreground"
                          }`}
                          style={{
                            width: isCompleted ? "100%" : isPending ? "25%" : "60%",
                          }}
                        />
                      </View>
                      <Text className="text-muted text-xs mt-1">
                        {isCompleted
                          ? "서비스 완료"
                          : isPending
                          ? "담당자 검토중"
                          : "서비스 진행중"}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* 신청 내역 없을 때 */}
        {myRequests.length === 0 && (
          <View className="mx-4 mt-4 bg-gray-50 border border-gray-200 rounded-xl p-6 items-center">
            <Sparkles size={40} color="#9CA3AF" />
            <Text className="text-muted text-center mt-3">
              진행중인 서비스가 없습니다.{"\n"}아래에서 서비스를 선택해 신청해보세요.
            </Text>
          </View>
        )}

        {/* 서비스 목록 */}
        <View className="px-4 mt-6">
          <Text className="text-base font-bold text-foreground mb-3">
            1회성 청소 서비스
          </Text>

          <View className="gap-3">
            {services.map((service) => (
              <Pressable
                key={service.id}
                className="bg-white border border-border rounded-xl overflow-hidden active:opacity-80"
                onPress={() => handleServicePress(service)}
              >
                <View className="p-4">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      <View className="w-12 h-12 bg-gray-100 rounded-xl items-center justify-center">
                        <Sparkles size={24} color="#111827" />
                      </View>
                      <View className="flex-1 ml-3">
                        <Text className="text-foreground font-bold text-base">
                          {service.name}
                        </Text>
                        <View className="flex-row items-center mt-1">
                          <Clock size={12} color="#111827" />
                          <Text className="text-muted text-sm ml-1">{service.duration}</Text>
                          <Star size={12} color="#111827" fill="#111827" className="ml-3" />
                          <Text className="text-muted text-sm ml-1">{service.rating}</Text>
                        </View>
                      </View>
                    </View>
                    <View className="items-end">
                      <Text className="text-primary font-bold">
                        {formatPrice(service.price)}~
                      </Text>
                      <ChevronRight size={18} color="#9CA3AF" className="mt-1" />
                    </View>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        <View className="h-8" />
      </ScrollView>
    </View>
  );
}
