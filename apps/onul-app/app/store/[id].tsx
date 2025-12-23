import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Linking,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import {
  MapPin,
  Phone,
  User,
  Calendar,
  Clock,
  FileText,
  Edit,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react-native";
import { useAuth } from "../../src/contexts/AuthContext";
import { supabase } from "../../src/lib/supabase";
import { OnulStore, OnulStoreVisit, OnulProfile } from "../../src/types/database";
import BottomTabBar from "../../src/components/BottomTabBar";

interface VisitWithMaster extends OnulStoreVisit {
  master?: OnulProfile | null;
}

export default function StoreDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { profile } = useAuth();
  const [store, setStore] = useState<OnulStore | null>(null);
  const [visits, setVisits] = useState<VisitWithMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isAdmin =
    profile?.role === "super_admin" || profile?.role === "project_manager";

  const fetchStoreDetail = useCallback(async () => {
    if (!id) return;

    try {
      // 매장 정보 조회
      const { data: storeData, error: storeError } = await supabase
        .from("onul_stores")
        .select("*")
        .eq("id", id)
        .single();

      if (storeError) {
        console.error("Error fetching store:", storeError);
        Alert.alert("오류", "매장 정보를 불러올 수 없습니다.");
        router.back();
        return;
      }

      setStore(storeData);

      // 방문 기록 조회 (최근 20개)
      const { data: visitsData, error: visitsError } = await supabase
        .from("onul_store_visits")
        .select(`
          *,
          master:master_id (id, name, phone, avatar_url)
        `)
        .eq("store_id", id)
        .order("visit_date", { ascending: false })
        .limit(20);

      if (visitsError) {
        console.error("Error fetching visits:", visitsError);
      } else {
        setVisits(
          (visitsData || []).map((v) => ({
            ...v,
            master: v.master as OnulProfile | null,
          }))
        );
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchStoreDetail();
  }, [fetchStoreDetail]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStoreDetail();
  }, [fetchStoreDetail]);

  const handleCall = () => {
    if (store?.contact_phone) {
      Linking.openURL(`tel:${store.contact_phone}`);
    }
  };

  const handleToggleActive = async () => {
    if (!store) return;

    const newStatus = !store.is_active;
    const actionText = newStatus ? "활성화" : "비활성화";

    Alert.alert(
      `매장 ${actionText}`,
      `이 매장을 ${actionText}하시겠습니까?`,
      [
        { text: "취소", style: "cancel" },
        {
          text: actionText,
          style: newStatus ? "default" : "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("onul_stores")
                .update({ is_active: newStatus, updated_at: new Date().toISOString() })
                .eq("id", store.id);

              if (error) throw error;

              setStore({ ...store, is_active: newStatus });
              Alert.alert("성공", `매장이 ${actionText}되었습니다.`);
            } catch (error) {
              console.error("Error:", error);
              Alert.alert("오류", `${actionText}에 실패했습니다.`);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
    });
  };

  const getContractTypeLabel = (type: string | null) => {
    switch (type) {
      case "regular":
        return "정기계약";
      case "onetime":
        return "단발성";
      case "contract":
        return "계약";
      default:
        return type || "미지정";
    }
  };

  const getVisitCycleLabel = (cycle: string | null) => {
    switch (cycle) {
      case "weekly":
        return "매주";
      case "biweekly":
        return "격주";
      case "monthly":
        return "월 1회";
      case "custom":
        return "맞춤";
      default:
        return cycle || "미지정";
    }
  };

  const getVisitStatusIcon = (status: string | null) => {
    switch (status) {
      case "completed":
        return <CheckCircle size={16} color="#22c55e" />;
      case "cancelled":
        return <XCircle size={16} color="#ef4444" />;
      case "scheduled":
      case "pending":
        return <Clock size={16} color="#f59e0b" />;
      default:
        return <AlertCircle size={16} color="#6B7280" />;
    }
  };

  const getVisitStatusLabel = (status: string | null) => {
    switch (status) {
      case "completed":
        return "완료";
      case "cancelled":
        return "취소";
      case "scheduled":
        return "예정";
      case "pending":
        return "대기";
      default:
        return status || "미정";
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#67c0a1" />
      </View>
    );
  }

  if (!store) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-muted">매장을 찾을 수 없습니다.</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: store.name,
          headerRight: () =>
            isAdmin ? (
              <Pressable
                onPress={() => router.push(`/store/edit?id=${store.id}`)}
                className="mr-4"
              >
                <Edit size={20} color="#67c0a1" />
              </Pressable>
            ) : null,
        }}
      />

      <View className="flex-1 bg-background">
        <ScrollView
          className="flex-1"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#67c0a1"
            />
          }
        >
          {/* 매장 기본 정보 */}
          <View className="px-6 mt-4">
            <View className="bg-white border border-border rounded-xl p-4">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  <Text className="text-xl font-bold text-foreground">
                    {store.name}
                  </Text>
                  {store.contract_type && (
                    <View className="bg-primary/10 px-2 py-0.5 rounded ml-2">
                      <Text className="text-primary text-xs font-medium">
                        {getContractTypeLabel(store.contract_type)}
                      </Text>
                    </View>
                  )}
                </View>
                <View
                  className={`px-2 py-1 rounded ${
                    store.is_active ? "bg-green-100" : "bg-red-100"
                  }`}
                >
                  <Text
                    className={`text-xs font-medium ${
                      store.is_active ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {store.is_active ? "활성" : "비활성"}
                  </Text>
                </View>
              </View>

              {store.address && (
                <View className="flex-row items-start mt-3">
                  <MapPin size={18} color="#6B7280" />
                  <Text className="text-foreground ml-2 flex-1">
                    {store.address}
                  </Text>
                </View>
              )}

              {store.contact_phone && (
                <Pressable
                  onPress={handleCall}
                  className="flex-row items-center mt-3"
                >
                  <Phone size={18} color="#67c0a1" />
                  <Text className="text-primary ml-2 font-medium">
                    {store.contact_name
                      ? `${store.contact_name}: `
                      : ""}
                    {store.contact_phone}
                  </Text>
                </Pressable>
              )}

              {store.visit_cycle && (
                <View className="flex-row items-center mt-3">
                  <Calendar size={18} color="#6B7280" />
                  <Text className="text-foreground ml-2">
                    방문 주기: {getVisitCycleLabel(store.visit_cycle)}
                  </Text>
                </View>
              )}

              {store.notes && (
                <View className="mt-4 pt-4 border-t border-border">
                  <View className="flex-row items-start">
                    <FileText size={18} color="#6B7280" />
                    <Text className="text-muted ml-2 flex-1">{store.notes}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* 관리자 액션 버튼 */}
          {isAdmin && (
            <View className="px-6 mt-4">
              <View className="flex-row gap-3">
                <Pressable
                  onPress={handleToggleActive}
                  className={`flex-1 py-3 rounded-xl items-center ${
                    store.is_active
                      ? "bg-red-100 border border-red-200"
                      : "bg-green-100 border border-green-200"
                  }`}
                >
                  <Text
                    className={`font-medium ${
                      store.is_active ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {store.is_active ? "비활성화" : "활성화"}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => router.push(`/store/edit?id=${store.id}`)}
                  className="flex-1 bg-surface border border-border py-3 rounded-xl items-center"
                >
                  <Text className="text-foreground font-medium">수정하기</Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* 방문 기록 */}
          <View className="px-6 mt-6 mb-8">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-foreground">
                방문 기록 ({visits.length})
              </Text>
              {isAdmin && (
                <Pressable
                  onPress={() =>
                    router.push(`/store/visit/create?store_id=${store.id}`)
                  }
                  className="flex-row items-center bg-primary px-3 py-2 rounded-lg"
                >
                  <Plus size={16} color="#FFFFFF" />
                  <Text className="text-white text-sm font-medium ml-1">
                    기록 추가
                  </Text>
                </Pressable>
              )}
            </View>

            {visits.length > 0 ? (
              <View className="gap-3">
                {visits.map((visit) => (
                  <View
                    key={visit.id}
                    className="bg-white border border-border rounded-xl p-4"
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="flex-row items-center">
                        {getVisitStatusIcon(visit.status)}
                        <Text className="text-foreground font-semibold ml-2">
                          {formatDate(visit.visit_date)}
                        </Text>
                      </View>
                      <View
                        className={`px-2 py-0.5 rounded ${
                          visit.status === "completed"
                            ? "bg-green-100"
                            : visit.status === "cancelled"
                            ? "bg-red-100"
                            : "bg-yellow-100"
                        }`}
                      >
                        <Text
                          className={`text-xs font-medium ${
                            visit.status === "completed"
                              ? "text-green-600"
                              : visit.status === "cancelled"
                              ? "text-red-600"
                              : "text-yellow-600"
                          }`}
                        >
                          {getVisitStatusLabel(visit.status)}
                        </Text>
                      </View>
                    </View>

                    {visit.master && (
                      <View className="flex-row items-center mt-1">
                        <User size={14} color="#6B7280" />
                        <Text className="text-muted text-sm ml-1">
                          담당: {visit.master.name}
                        </Text>
                      </View>
                    )}

                    {visit.notes && (
                      <Text className="text-muted text-sm mt-2">
                        {visit.notes}
                      </Text>
                    )}

                    {/* 사진 개수 표시 */}
                    {((visit.before_photos && visit.before_photos.length > 0) ||
                      (visit.after_photos && visit.after_photos.length > 0)) && (
                      <View className="flex-row gap-3 mt-2">
                        {visit.before_photos && visit.before_photos.length > 0 && (
                          <Text className="text-xs text-muted">
                            비포 사진 {visit.before_photos.length}장
                          </Text>
                        )}
                        {visit.after_photos && visit.after_photos.length > 0 && (
                          <Text className="text-xs text-muted">
                            애프터 사진 {visit.after_photos.length}장
                          </Text>
                        )}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            ) : (
              <View className="bg-surface border border-border rounded-xl p-8 items-center">
                <Calendar size={32} color="#9CA3AF" />
                <Text className="text-muted mt-3">방문 기록이 없습니다</Text>
                {isAdmin && (
                  <Pressable
                    onPress={() =>
                      router.push(`/store/visit/create?store_id=${store.id}`)
                    }
                    className="mt-4 bg-primary px-4 py-2 rounded-lg"
                  >
                    <Text className="text-white font-medium">첫 방문 기록 추가</Text>
                  </Pressable>
                )}
              </View>
            )}
          </View>
        </ScrollView>

        {/* 하단 탭바 */}
        <BottomTabBar />
      </View>
    </>
  );
}
