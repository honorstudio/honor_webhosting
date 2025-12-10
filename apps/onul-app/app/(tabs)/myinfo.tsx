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
  User,
  Building2,
  MapPin,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  History,
  ChevronRight,
  FileText,
  Settings,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react-native";
import { useAuth } from "../../src/contexts/AuthContext";
import { supabase } from "../../src/lib/supabase";

interface StoreInfo {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  contract_type: string | null;
  visit_cycle: string | null;
}

interface ContractInfo {
  start_date: string | null;
  end_date: string | null;
  plan_type: string | null;
  status: string;
}

interface PickupHistory {
  id: string;
  title: string;
  scheduled_date: string | null;
  status: string;
}

interface SubscriptionInfo {
  id: string | null;
  plan_name: string;
  price: number;
  billing_cycle: string;
  next_billing_date: string | null;
  status: string;
}

export default function MyInfoScreen() {
  const router = useRouter();
  const { profile, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [contractInfo, setContractInfo] = useState<ContractInfo | null>(null);
  const [pickupHistory, setPickupHistory] = useState<PickupHistory[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);

  const fetchData = useCallback(async () => {
    if (!profile?.id) return;

    try {
      // 매장 정보 조회 (클라이언트와 연결된 매장)
      const { data: storeData } = await supabase
        .from("onul_stores")
        .select("id, name, address, phone, contract_type, visit_cycle")
        .eq("client_id", profile.id)
        .single();

      if (storeData) {
        setStoreInfo(storeData);
      }

      // 수거 내역 조회
      const { data: historyData } = await supabase
        .from("onul_major_projects")
        .select("id, title, scheduled_date, status")
        .eq("client_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (historyData) {
        setPickupHistory(historyData);
      }

      // 계약 정보 (임시 - 실제 테이블 구조에 맞게 수정 필요)
      setContractInfo({
        start_date: "2024-01-01",
        end_date: "2024-12-31",
        plan_type: "월간 정기 구독",
        status: "active",
      });

      // 구독 정보 (임시 - 부트페이 연동 후 실제 데이터로 교체)
      setSubscription({
        id: null,
        plan_name: "정기 수거 플랜",
        price: 39000,
        billing_cycle: "monthly",
        next_billing_date: "2024-12-15",
        status: "active",
      });
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

  const handleLogout = async () => {
    await signOut();
    router.replace("/");
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return { label: "이용중", color: "bg-primary/10", textColor: "text-primary" };
      case "pending":
        return { label: "대기중", color: "bg-amber-100", textColor: "text-amber-600" };
      case "completed":
        return { label: "완료", color: "bg-gray-100", textColor: "text-gray-500" };
      case "cancelled":
        return { label: "해지", color: "bg-red-100", textColor: "text-red-500" };
      default:
        return { label: status, color: "bg-gray-100", textColor: "text-gray-500" };
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
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
    <ScrollView
      className="flex-1 bg-background"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#67c0a1" />
      }
    >
      {/* 프로필 카드 */}
      <View className="mx-4 mt-4 bg-white border border-border rounded-xl p-4">
        <View className="flex-row items-center">
          <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center">
            <User size={32} color="#67c0a1" />
          </View>
          <View className="ml-4 flex-1">
            <Text className="text-xl font-bold text-foreground">
              {profile?.name || "이름 없음"}
            </Text>
            <Text className="text-muted text-sm mt-0.5">클라이언트</Text>
          </View>
          <Pressable
            className="p-2"
            onPress={() => router.push("/profile/edit")}
          >
            <Settings size={22} color="#6B7280" />
          </Pressable>
        </View>

        <View className="mt-4 pt-4 border-t border-border">
          <View className="flex-row items-center mb-2">
            <Mail size={16} color="#6B7280" />
            <Text className="text-muted text-sm ml-2">{profile?.email || "-"}</Text>
          </View>
          <View className="flex-row items-center">
            <Phone size={16} color="#6B7280" />
            <Text className="text-muted text-sm ml-2">{profile?.phone || "-"}</Text>
          </View>
        </View>
      </View>

      {/* 매장 정보 */}
      <View className="mx-4 mt-4 bg-white border border-border rounded-xl p-4">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <Building2 size={20} color="#1F2937" />
            <Text className="text-base font-bold text-foreground ml-2">매장 정보</Text>
          </View>
          {storeInfo && (
            <View className="bg-primary/10 px-2 py-1 rounded-full">
              <Text className="text-primary text-xs font-medium">등록됨</Text>
            </View>
          )}
        </View>

        {storeInfo ? (
          <View>
            <Text className="text-lg font-semibold text-foreground">{storeInfo.name}</Text>
            {storeInfo.address && (
              <View className="flex-row items-center mt-2">
                <MapPin size={14} color="#6B7280" />
                <Text className="text-muted text-sm ml-1">{storeInfo.address}</Text>
              </View>
            )}
            {storeInfo.phone && (
              <View className="flex-row items-center mt-1">
                <Phone size={14} color="#6B7280" />
                <Text className="text-muted text-sm ml-1">{storeInfo.phone}</Text>
              </View>
            )}
            <View className="flex-row mt-3 gap-2">
              {storeInfo.contract_type && (
                <View className="bg-surface px-3 py-1 rounded-full">
                  <Text className="text-foreground text-xs">{storeInfo.contract_type}</Text>
                </View>
              )}
              {storeInfo.visit_cycle && (
                <View className="bg-surface px-3 py-1 rounded-full">
                  <Text className="text-foreground text-xs">{storeInfo.visit_cycle}</Text>
                </View>
              )}
            </View>
          </View>
        ) : (
          <View className="items-center py-4">
            <Building2 size={32} color="#D1D5DB" />
            <Text className="text-muted text-sm mt-2">등록된 매장이 없습니다</Text>
          </View>
        )}
      </View>

      {/* 계약 정보 */}
      <View className="mx-4 mt-4 bg-white border border-border rounded-xl p-4">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <FileText size={20} color="#1F2937" />
            <Text className="text-base font-bold text-foreground ml-2">계약 정보</Text>
          </View>
          {contractInfo && (
            <View className={`px-2 py-1 rounded-full ${getStatusLabel(contractInfo.status).color}`}>
              <Text className={`text-xs font-medium ${getStatusLabel(contractInfo.status).textColor}`}>
                {getStatusLabel(contractInfo.status).label}
              </Text>
            </View>
          )}
        </View>

        {contractInfo ? (
          <View>
            <View className="flex-row justify-between items-center py-2 border-b border-border/50">
              <Text className="text-muted text-sm">플랜</Text>
              <Text className="text-foreground font-medium">{contractInfo.plan_type}</Text>
            </View>
            <View className="flex-row justify-between items-center py-2 border-b border-border/50">
              <Text className="text-muted text-sm">계약 시작일</Text>
              <Text className="text-foreground">{formatDate(contractInfo.start_date)}</Text>
            </View>
            <View className="flex-row justify-between items-center py-2">
              <Text className="text-muted text-sm">계약 종료일</Text>
              <Text className="text-foreground">{formatDate(contractInfo.end_date)}</Text>
            </View>
          </View>
        ) : (
          <View className="items-center py-4">
            <FileText size={32} color="#D1D5DB" />
            <Text className="text-muted text-sm mt-2">계약 정보가 없습니다</Text>
          </View>
        )}
      </View>

      {/* 구독 결제 */}
      <View className="mx-4 mt-4 bg-white border border-border rounded-xl p-4">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <CreditCard size={20} color="#1F2937" />
            <Text className="text-base font-bold text-foreground ml-2">구독 결제</Text>
          </View>
        </View>

        {subscription ? (
          <View>
            <View className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-4">
              <View className="flex-row justify-between items-start">
                <View>
                  <Text className="text-foreground font-semibold">{subscription.plan_name}</Text>
                  <Text className="text-2xl font-bold text-primary mt-1">
                    {formatPrice(subscription.price)}
                    <Text className="text-sm text-muted font-normal">/월</Text>
                  </Text>
                </View>
                <View className={`px-2 py-1 rounded-full ${getStatusLabel(subscription.status).color}`}>
                  <Text className={`text-xs font-medium ${getStatusLabel(subscription.status).textColor}`}>
                    {getStatusLabel(subscription.status).label}
                  </Text>
                </View>
              </View>
              {subscription.next_billing_date && (
                <View className="flex-row items-center mt-3 pt-3 border-t border-primary/20">
                  <Clock size={14} color="#67c0a1" />
                  <Text className="text-primary text-sm ml-1">
                    다음 결제일: {formatDate(subscription.next_billing_date)}
                  </Text>
                </View>
              )}
            </View>

            <Pressable
              className="flex-row items-center justify-between py-3 border-b border-border/50"
              onPress={() => {/* TODO: 결제 수단 관리 */}}
            >
              <Text className="text-foreground">결제 수단 관리</Text>
              <ChevronRight size={20} color="#9CA3AF" />
            </Pressable>
            <Pressable
              className="flex-row items-center justify-between py-3 border-b border-border/50"
              onPress={() => {/* TODO: 결제 내역 */}}
            >
              <Text className="text-foreground">결제 내역</Text>
              <ChevronRight size={20} color="#9CA3AF" />
            </Pressable>
            <Pressable
              className="flex-row items-center justify-between py-3"
              onPress={() => {/* TODO: 플랜 변경 */}}
            >
              <Text className="text-foreground">플랜 변경</Text>
              <ChevronRight size={20} color="#9CA3AF" />
            </Pressable>
          </View>
        ) : (
          <View className="items-center py-4">
            <CreditCard size={32} color="#D1D5DB" />
            <Text className="text-muted text-sm mt-2">구독 중인 플랜이 없습니다</Text>
            <Pressable
              className="mt-4 bg-primary px-6 py-3 rounded-xl"
              onPress={() => {/* TODO: 구독 신청 */}}
            >
              <Text className="text-white font-semibold">구독 시작하기</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* 수거 내역 */}
      <View className="mx-4 mt-4 bg-white border border-border rounded-xl p-4">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <History size={20} color="#1F2937" />
            <Text className="text-base font-bold text-foreground ml-2">최근 수거 내역</Text>
          </View>
          <Pressable onPress={() => router.push("/(tabs)/pickup")}>
            <Text className="text-primary text-sm">전체보기</Text>
          </Pressable>
        </View>

        {pickupHistory.length > 0 ? (
          <View>
            {pickupHistory.map((item, index) => {
              const status = getStatusLabel(item.status);
              return (
                <Pressable
                  key={item.id}
                  className={`flex-row items-center justify-between py-3 ${
                    index < pickupHistory.length - 1 ? "border-b border-border/50" : ""
                  }`}
                  onPress={() => router.push(`/client/project/${item.id}`)}
                >
                  <View className="flex-1">
                    <Text className="text-foreground font-medium" numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text className="text-muted text-xs mt-0.5">
                      {item.scheduled_date || "일정 미정"}
                    </Text>
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
        ) : (
          <View className="items-center py-4">
            <History size={32} color="#D1D5DB" />
            <Text className="text-muted text-sm mt-2">수거 내역이 없습니다</Text>
          </View>
        )}
      </View>

      {/* 로그아웃 버튼 */}
      <Pressable
        className="mx-4 mt-6 mb-8 py-4 bg-surface border border-border rounded-xl items-center"
        onPress={handleLogout}
      >
        <Text className="text-red-500 font-medium">로그아웃</Text>
      </Pressable>
    </ScrollView>
  );
}
