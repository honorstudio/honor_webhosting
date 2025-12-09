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
  ChevronRight,
  Calendar,
  Clock,
  Store,
  Plus,
  MapPin,
  Phone,
} from "lucide-react-native";
import { useAuth } from "../../src/contexts/AuthContext";
import { supabase } from "../../src/lib/supabase";
import { OnulStore, OnulStoreVisit } from "../../src/types/database";
import { useResponsive } from "../../src/hooks/useResponsive";

type FilterType = "all" | "active" | "inactive";

interface StoreWithVisit extends OnulStore {
  latest_visit?: OnulStoreVisit | null;
  upcoming_visits?: OnulStoreVisit[];
}

export default function StoresScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const { isDesktop, isTablet } = useResponsive();
  const [stores, setStores] = useState<StoreWithVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");

  // PC/태블릿에서는 그리드 레이아웃 사용
  const useGridLayout = isDesktop || isTablet;

  const isAdmin =
    profile?.role === "super_admin" || profile?.role === "project_manager";

  const fetchStores = useCallback(async () => {
    try {
      // 매장 목록 조회
      let query = supabase
        .from("onul_stores")
        .select("*")
        .order("name", { ascending: true });

      // 필터 적용
      if (filter === "active") {
        query = query.eq("is_active", true);
      } else if (filter === "inactive") {
        query = query.eq("is_active", false);
      }

      const { data: storesData, error } = await query;

      if (error) {
        console.error("Error fetching stores:", error);
        return;
      }

      // 각 매장의 최근 방문 및 예정 방문 조회
      const storesWithVisits = await Promise.all(
        (storesData || []).map(async (store) => {
          // 최근 완료된 방문
          const { data: latestVisit } = await supabase
            .from("onul_store_visits")
            .select("*")
            .eq("store_id", store.id)
            .eq("status", "completed")
            .order("visit_date", { ascending: false })
            .limit(1)
            .single();

          // 예정된 방문 (오늘 이후)
          const today = new Date().toISOString().split("T")[0];
          const { data: upcomingVisits } = await supabase
            .from("onul_store_visits")
            .select("*")
            .eq("store_id", store.id)
            .in("status", ["scheduled", "pending"])
            .gte("visit_date", today)
            .order("visit_date", { ascending: true })
            .limit(3);

          return {
            ...store,
            latest_visit: latestVisit || null,
            upcoming_visits: upcomingVisits || [],
          };
        })
      );

      setStores(storesWithVisits);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStores();
  }, [fetchStores]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
    const weekday = weekdays[date.getDay()];
    return `${month}/${day} (${weekday})`;
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
        return cycle || "";
    }
  };

  // 이번 주 방문 일정 계산
  const getThisWeekVisits = () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const weekVisits: { date: string; storeName: string; isPast: boolean }[] =
      [];

    stores.forEach((store) => {
      store.upcoming_visits?.forEach((visit) => {
        const visitDate = new Date(visit.visit_date);
        if (visitDate >= startOfWeek && visitDate <= endOfWeek) {
          weekVisits.push({
            date: visit.visit_date,
            storeName: store.name,
            isPast: visitDate < now,
          });
        }
      });
    });

    // 날짜순 정렬
    weekVisits.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return weekVisits;
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#67c0a1" />
      </View>
    );
  }

  const thisWeekVisits = getThisWeekVisits();

  return (
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
        {/* 필터 탭 */}
        <View className="px-6 mt-4">
          <View className="flex-row gap-2">
            {[
              { key: "all", label: "전체" },
              { key: "active", label: "활성" },
              { key: "inactive", label: "비활성" },
            ].map((item) => (
              <Pressable
                key={item.key}
                onPress={() => setFilter(item.key as FilterType)}
                className={`px-4 py-2 rounded-full ${
                  filter === item.key
                    ? "bg-primary"
                    : "bg-surface border border-border"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    filter === item.key ? "text-white" : "text-muted"
                  }`}
                >
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* 매장 목록 */}
        <View className="px-6 mt-6">
          <Text className="text-lg font-bold text-foreground mb-4">
            매장 목록 ({stores.length})
          </Text>

          {stores.length > 0 ? (
            <View
              style={useGridLayout ? { flexDirection: "row", flexWrap: "wrap", gap: 16 } : undefined}
              className={!useGridLayout ? "gap-3" : ""}
            >
              {stores.map((store) => (
                <Pressable
                  key={store.id}
                  onPress={() => router.push(`/store/${store.id}`)}
                  style={useGridLayout ? { width: isDesktop ? "32%" : "48%" } : undefined}
                  className={`border border-border rounded-xl p-4 active:opacity-80 ${
                    store.is_active ? "bg-white" : "bg-surface"
                  }`}
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <View className="flex-row items-center mb-1">
                        <Text
                          className={`font-semibold text-base ${
                            store.is_active ? "text-foreground" : "text-muted"
                          }`}
                        >
                          {store.name}
                        </Text>
                        {store.contract_type && (
                          <View
                            className={`px-2 py-0.5 rounded ml-2 ${
                              store.is_active ? "bg-primary/10" : "bg-border"
                            }`}
                          >
                            <Text
                              className={`text-xs font-medium ${
                                store.is_active ? "text-primary" : "text-muted"
                              }`}
                            >
                              {getContractTypeLabel(store.contract_type)}
                            </Text>
                          </View>
                        )}
                        {!store.is_active && (
                          <View className="bg-red-100 px-2 py-0.5 rounded ml-2">
                            <Text className="text-red-600 text-xs font-medium">
                              비활성
                            </Text>
                          </View>
                        )}
                      </View>

                      {store.address && (
                        <View className="flex-row items-center mt-1">
                          <MapPin size={14} color="#6B7280" />
                          <Text className="text-muted text-sm ml-1">
                            {store.address}
                          </Text>
                        </View>
                      )}

                      {store.visit_cycle && (
                        <Text className="text-muted text-sm mt-1">
                          {getVisitCycleLabel(store.visit_cycle)} 방문
                        </Text>
                      )}

                      {store.upcoming_visits && store.upcoming_visits.length > 0 && (
                        <View className="flex-row items-center mt-2">
                          <Clock size={14} color="#67c0a1" />
                          <Text className="text-primary text-sm ml-1 font-medium">
                            다음 방문: {formatDate(store.upcoming_visits[0].visit_date)}
                          </Text>
                        </View>
                      )}

                      {store.contact_phone && (
                        <View className="flex-row items-center mt-1">
                          <Phone size={14} color="#6B7280" />
                          <Text className="text-muted text-sm ml-1">
                            {store.contact_name
                              ? `${store.contact_name}: `
                              : ""}
                            {store.contact_phone}
                          </Text>
                        </View>
                      )}
                    </View>
                    <ChevronRight
                      size={20}
                      color={store.is_active ? "#9CA3AF" : "#D1D5DB"}
                    />
                  </View>
                </Pressable>
              ))}
            </View>
          ) : (
            <View className="items-center py-20">
              <View className="w-20 h-20 bg-surface rounded-full items-center justify-center mb-4">
                <Store size={32} color="#9CA3AF" />
              </View>
              <Text className="text-muted text-center">
                {filter === "all"
                  ? "등록된 매장이 없습니다"
                  : filter === "active"
                  ? "활성 매장이 없습니다"
                  : "비활성 매장이 없습니다"}
              </Text>
              {isAdmin && filter === "all" && (
                <Pressable
                  onPress={() => router.push("/store/create")}
                  className="mt-4 bg-primary px-6 py-3 rounded-full"
                >
                  <Text className="text-white font-medium">매장 등록하기</Text>
                </Pressable>
              )}
            </View>
          )}
        </View>

        {/* 이번 주 방문 일정 */}
        {thisWeekVisits.length > 0 && (
          <View className="px-6 mt-8 mb-8">
            <Text className="text-lg font-bold text-foreground mb-4">
              이번 주 방문 일정
            </Text>

            <View className="bg-white border border-border rounded-xl p-4">
              <View className="gap-3">
                {thisWeekVisits.map((visit, index) => (
                  <View key={index} className="flex-row items-center">
                    <View
                      className={`w-2 h-2 rounded-full mr-3 ${
                        visit.isPast ? "bg-border" : "bg-primary"
                      }`}
                    />
                    <Calendar size={16} color="#6B7280" />
                    <Text
                      className={`ml-2 ${
                        visit.isPast ? "text-muted" : "text-foreground"
                      }`}
                    >
                      {formatDate(visit.date)} - {visit.storeName}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* 하단 여백 (FAB 버튼 공간) */}
        {isAdmin && <View className="h-20" />}
      </ScrollView>

      {/* FAB 버튼 (관리자만) */}
      {isAdmin && (
        <Pressable
          onPress={() => router.push("/store/create")}
          className="absolute bottom-6 right-6 w-14 h-14 bg-primary rounded-full items-center justify-center shadow-lg active:opacity-80"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
          }}
        >
          <Plus size={24} color="#FFFFFF" />
        </Pressable>
      )}
    </View>
  );
}
