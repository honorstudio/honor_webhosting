import { useState, useEffect, useCallback, useMemo } from "react";
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
  ChevronRight,
  Settings,
  Trash2,
  CheckCircle,
  Clock,
  Building2,
  MapPin,
  Briefcase,
  Users,
  TrendingUp,
  Calendar as CalendarIcon,
} from "lucide-react-native";
import { useAuth } from "../../src/contexts/AuthContext";
import { useDevView } from "../../src/contexts/DevViewContext";
import { supabase } from "../../src/lib/supabase";
import { useResponsive } from "../../src/hooks/useResponsive";
import DashboardCalendar, { ScheduleItem } from "../../src/components/DashboardCalendar";

interface MinorProject {
  id: string;
  title: string;
  status: string;
  started_at: string | null;
  major_project: {
    id: string;
    title: string;
    scheduled_date: string | null;
    location: string | null;
  } | null;
}

interface ClientProject {
  id: string;
  title: string;
  status: string;
  location: string | null;
  scheduled_date: string | null;
  minor_projects_count: number;
  completed_count: number;
  review_count: number;
}

// 마스터 통계 인터페이스
interface MasterStats {
  totalProjects: number;
  completedThisMonth: number;
  assignedStores: number;
  availableProjects: number;
}

// 클라이언트 통계 인터페이스
interface ClientStats {
  totalPickups: number;
  completedPickups: number;
  nextPickupDate: string | null;
  pendingReviews: number;
}

// 최고 관리자용 인터페이스
interface AdminMaster {
  id: string;
  name: string;
  phone: string | null;
  projectCount: number;
  storeCount: number;
}

interface AdminStore {
  id: string;
  name: string;
  address: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  is_active: boolean;
  assigned_master_name: string | null;
}

interface AdminStats {
  totalMasters: number;
  totalStores: number;
  activeStores: number;
  totalProjects: number;
}

export default function DashboardScreen() {
  const router = useRouter();
  const { profile, loading: authLoading } = useAuth();
  const { getEffectiveRole } = useDevView();
  const { isDesktop, isTablet, showSidebar } = useResponsive();

  const effectiveRole = getEffectiveRole(profile?.role);
  const useGridLayout = isDesktop || isTablet;

  // 마스터용 상태
  const [projects, setProjects] = useState<MinorProject[]>([]);
  const [completedProjects, setCompletedProjects] = useState<MinorProject[]>([]);
  const [masterStats, setMasterStats] = useState<MasterStats>({
    totalProjects: 0,
    completedThisMonth: 0,
    assignedStores: 0,
    availableProjects: 0,
  });

  // 클라이언트용 상태
  const [clientProjects, setClientProjects] = useState<ClientProject[]>([]);
  const [clientCompletedProjects, setClientCompletedProjects] = useState<ClientProject[]>([]);
  const [clientStats, setClientStats] = useState<ClientStats>({
    totalPickups: 0,
    completedPickups: 0,
    nextPickupDate: null,
    pendingReviews: 0,
  });

  // 캘린더 스케줄
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);

  // 최고 관리자용 상태
  const [adminMasters, setAdminMasters] = useState<AdminMaster[]>([]);
  const [adminStores, setAdminStores] = useState<AdminStore[]>([]);
  const [adminStats, setAdminStats] = useState<AdminStats>({
    totalMasters: 0,
    totalStores: 0,
    activeStores: 0,
    totalProjects: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const getRoleLabel = (role: string | undefined) => {
    switch (role) {
      case "super_admin":
        return "최고 관리자";
      case "project_manager":
        return "프로젝트 책임자";
      case "master":
        return "마스터";
      case "client":
        return "클라이언트";
      default:
        return "";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "in_progress":
        return { label: "진행중", color: "bg-primary/10", textColor: "text-primary" };
      case "review":
        return { label: "검토 대기", color: "bg-amber-100", textColor: "text-amber-600" };
      case "completed":
        return { label: "완료", color: "bg-surface", textColor: "text-muted" };
      case "recruiting":
        return { label: "모집중", color: "bg-blue-100", textColor: "text-blue-600" };
      case "draft":
        return { label: "준비중", color: "bg-gray-100", textColor: "text-gray-600" };
      default:
        return { label: status, color: "bg-surface", textColor: "text-muted" };
    }
  };

  // D-Day 계산
  const getDDay = (dateStr: string | null) => {
    if (!dateStr) return null;
    const target = new Date(dateStr);
    const now = new Date();
    target.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return "오늘";
    if (diff === 1) return "내일";
    if (diff > 0) return `D-${diff}`;
    return null;
  };

  // 마스터 프로젝트 조회
  const fetchMasterProjects = useCallback(async () => {
    if (!profile?.id) return;

    try {
      const inProgress: MinorProject[] = [];
      const completed: MinorProject[] = [];
      const calendarSchedules: ScheduleItem[] = [];
      const addedProjectIds = new Set<string>();

      // 1. 참가자로 등록된 소형 프로젝트 조회
      const { data: participations, error: partError } = await supabase
        .from("onul_project_participants")
        .select(`
          minor_project_id,
          onul_minor_projects (
            id,
            title,
            status,
            started_at,
            major_project_id,
            onul_major_projects (
              id,
              title,
              scheduled_date,
              location
            )
          )
        `)
        .eq("master_id", profile.id)
        .eq("status", "approved");

      if (partError) throw partError;

      participations?.forEach((p: any) => {
        const project = p.onul_minor_projects;
        if (project) {
          addedProjectIds.add(project.id);
          const mapped: MinorProject = {
            id: project.id,
            title: project.title,
            status: project.status,
            started_at: project.started_at,
            major_project: project.onul_major_projects
              ? {
                  id: project.onul_major_projects.id,
                  title: project.onul_major_projects.title,
                  scheduled_date: project.onul_major_projects.scheduled_date,
                  location: project.onul_major_projects.location,
                }
              : null,
          };

          // 캘린더 스케줄 추가
          if (project.onul_major_projects?.scheduled_date) {
            calendarSchedules.push({
              id: project.id,
              date: project.onul_major_projects.scheduled_date,
              title: project.title,
              location: project.onul_major_projects.location,
              status: project.status === "completed" ? "completed" : project.status === "review" ? "review" : "scheduled",
              type: "cleaning",
            });
          }

          if (project.status === "completed") {
            completed.push(mapped);
          } else {
            inProgress.push(mapped);
          }
        }
      });

      // 2. 담당자(manager)로 등록된 대형 프로젝트의 소형 프로젝트 조회
      const { data: managedProjects, error: managedError } = await supabase
        .from("onul_major_projects")
        .select(`
          id,
          title,
          scheduled_date,
          location,
          onul_minor_projects (
            id,
            title,
            status,
            started_at
          )
        `)
        .eq("manager_id", profile.id)
        .neq("status", "completed");

      if (managedError) throw managedError;

      managedProjects?.forEach((mp: any) => {
        const minorProjects = mp.onul_minor_projects || [];
        minorProjects.forEach((project: any) => {
          if (addedProjectIds.has(project.id)) return;

          addedProjectIds.add(project.id);
          const mapped: MinorProject = {
            id: project.id,
            title: project.title,
            status: project.status,
            started_at: project.started_at,
            major_project: {
              id: mp.id,
              title: mp.title,
              scheduled_date: mp.scheduled_date,
              location: mp.location,
            },
          };

          if (mp.scheduled_date) {
            calendarSchedules.push({
              id: project.id,
              date: mp.scheduled_date,
              title: project.title,
              location: mp.location,
              status: project.status === "completed" ? "completed" : "scheduled",
              type: "cleaning",
            });
          }

          if (project.status === "completed") {
            completed.push(mapped);
          } else {
            inProgress.push(mapped);
          }
        });
      });

      // 3. 지원 가능한 프로젝트 수 조회
      const { count: availableCount } = await supabase
        .from("onul_major_projects")
        .select("*", { count: "exact", head: true })
        .eq("status", "recruiting");

      // 4. 담당 매장 수 조회
      const { count: storeCount } = await supabase
        .from("onul_stores")
        .select("*", { count: "exact", head: true })
        .eq("assigned_master_id", profile.id);

      // 이번 달 완료 프로젝트 수 계산
      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const completedThisMonth = completed.filter(
        (p) => p.started_at && p.started_at >= thisMonthStart
      ).length;

      setProjects(inProgress);
      setCompletedProjects(completed.slice(0, 3));
      setSchedules(calendarSchedules);
      setMasterStats({
        totalProjects: addedProjectIds.size,
        completedThisMonth,
        assignedStores: storeCount || 0,
        availableProjects: availableCount || 0,
      });
    } catch (error) {
      console.error("Error fetching master projects:", error);
    }
  }, [profile]);

  // 클라이언트 프로젝트 조회
  const fetchClientProjects = useCallback(async () => {
    if (!profile?.id) return;

    try {
      const calendarSchedules: ScheduleItem[] = [];

      const { data: majorProjects, error } = await supabase
        .from("onul_major_projects")
        .select(`
          id,
          title,
          status,
          location,
          scheduled_date,
          onul_minor_projects (
            id,
            status
          )
        `)
        .eq("client_id", profile.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const inProgress: ClientProject[] = [];
      const completed: ClientProject[] = [];
      let totalPickups = 0;
      let completedPickups = 0;
      let pendingReviews = 0;
      let nextPickupDate: string | null = null;

      majorProjects?.forEach((mp: any) => {
        const minorProjects = mp.onul_minor_projects || [];
        const completedCount = minorProjects.filter((p: any) => p.status === "completed").length;
        const reviewCount = minorProjects.filter((p: any) => p.status === "review").length;

        totalPickups += minorProjects.length;
        completedPickups += completedCount;
        pendingReviews += reviewCount;

        // 캘린더 스케줄 추가
        if (mp.scheduled_date) {
          calendarSchedules.push({
            id: mp.id,
            date: mp.scheduled_date,
            title: mp.title,
            location: mp.location,
            status: mp.status === "completed" ? "completed" : reviewCount > 0 ? "review" : "scheduled",
            type: "pickup",
          });

          // 다음 수거일 계산
          const today = new Date().toISOString().split("T")[0];
          if (mp.status !== "completed" && mp.scheduled_date >= today) {
            if (!nextPickupDate || mp.scheduled_date < nextPickupDate) {
              nextPickupDate = mp.scheduled_date;
            }
          }
        }

        const mapped: ClientProject = {
          id: mp.id,
          title: mp.title,
          status: mp.status,
          location: mp.location,
          scheduled_date: mp.scheduled_date,
          minor_projects_count: minorProjects.length,
          completed_count: completedCount,
          review_count: reviewCount,
        };

        if (mp.status === "completed") {
          completed.push(mapped);
        } else {
          inProgress.push(mapped);
        }
      });

      setClientProjects(inProgress);
      setClientCompletedProjects(completed.slice(0, 3));
      setSchedules(calendarSchedules);
      setClientStats({
        totalPickups,
        completedPickups,
        nextPickupDate,
        pendingReviews,
      });
    } catch (error) {
      console.error("Error fetching client projects:", error);
    }
  }, [profile]);

  // 최고 관리자 데이터 조회
  const fetchAdminData = useCallback(async () => {
    if (!profile?.id) return;

    try {
      // 마스터 목록 조회
      const { data: mastersData, error: mastersError } = await supabase
        .from("onul_profiles")
        .select("id, name, phone")
        .eq("role", "master")
        .limit(10);

      if (mastersError) throw mastersError;

      // 각 마스터의 프로젝트/매장 수 조회
      const mastersWithCounts: AdminMaster[] = await Promise.all(
        (mastersData || []).map(async (master) => {
          const { count: projectCount } = await supabase
            .from("onul_project_participants")
            .select("*", { count: "exact", head: true })
            .eq("master_id", master.id);

          const { count: storeCount } = await supabase
            .from("onul_stores")
            .select("*", { count: "exact", head: true })
            .eq("assigned_master_id", master.id);

          return {
            id: master.id,
            name: master.name || "이름 없음",
            phone: master.phone,
            projectCount: projectCount || 0,
            storeCount: storeCount || 0,
          };
        })
      );

      setAdminMasters(mastersWithCounts);

      // 매장 목록 조회
      const { data: storesData, error: storesError } = await supabase
        .from("onul_stores")
        .select(`
          id,
          name,
          address,
          contact_name,
          contact_phone,
          is_active,
          assigned_master_id,
          onul_profiles!onul_stores_assigned_master_id_fkey (name)
        `)
        .order("created_at", { ascending: false })
        .limit(10);

      if (storesError) throw storesError;

      const mappedStores: AdminStore[] = (storesData || []).map((store: any) => ({
        id: store.id,
        name: store.name,
        address: store.address,
        contact_name: store.contact_name,
        contact_phone: store.contact_phone,
        is_active: store.is_active,
        assigned_master_name: store.onul_profiles?.name || null,
      }));

      setAdminStores(mappedStores);

      // 통계 조회
      const { count: totalMasters } = await supabase
        .from("onul_profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "master");

      const { count: totalStores } = await supabase
        .from("onul_stores")
        .select("*", { count: "exact", head: true });

      const { count: activeStores } = await supabase
        .from("onul_stores")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      const { count: totalProjects } = await supabase
        .from("onul_major_projects")
        .select("*", { count: "exact", head: true });

      setAdminStats({
        totalMasters: totalMasters || 0,
        totalStores: totalStores || 0,
        activeStores: activeStores || 0,
        totalProjects: totalProjects || 0,
      });
    } catch (error) {
      console.error("Error fetching admin data:", error);
    }
  }, [profile]);

  const fetchProjects = useCallback(async () => {
    if (!profile?.id) return;

    try {
      if (effectiveRole === "super_admin" || effectiveRole === "project_manager") {
        await fetchAdminData();
      } else if (effectiveRole === "master") {
        await fetchMasterProjects();
      } else if (effectiveRole === "client") {
        await fetchClientProjects();
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [profile, effectiveRole, fetchMasterProjects, fetchClientProjects, fetchAdminData]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProjects();
  }, [fetchProjects]);

  // 캘린더 아이템 클릭 핸들러
  const handleScheduleItemPress = (item: ScheduleItem) => {
    if (effectiveRole === "client") {
      router.push(`/client/project/${item.id}`);
    } else {
      router.push(`/project/minor/${item.id}`);
    }
  };

  if (authLoading || loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#67c0a1" />
      </View>
    );
  }

  // ==================== 최고 관리자 대시보드 ====================
  if (effectiveRole === "super_admin" || effectiveRole === "project_manager") {
    return (
      <ScrollView
        className="flex-1 bg-background"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#67c0a1" />
        }
      >
        {/* 프로필 헤더 */}
        <View className="bg-white px-6 py-5 border-b border-border">
          <View className="flex-row items-center justify-between">
            <Pressable
              className="flex-row items-center flex-1"
              onPress={() => router.push("/profile")}
            >
              <View className="w-14 h-14 rounded-full bg-primary/10 items-center justify-center">
                <Users size={28} color="#67c0a1" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-lg font-bold text-foreground">
                  {profile?.name || "이름 없음"}
                </Text>
                <Text className="text-sm text-muted">{getRoleLabel(effectiveRole)}</Text>
              </View>
            </Pressable>
            <Pressable className="p-2" onPress={() => router.push("/profile")}>
              <Settings size={22} color="#6B7280" />
            </Pressable>
          </View>
        </View>

        {/* 통계 카드들 */}
        <View className="px-4 pt-4">
          <View className="flex-row gap-3">
            <View className="flex-1 bg-white border border-border rounded-xl p-4">
              <View className="flex-row items-center justify-between">
                <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
                  <Users size={20} color="#67c0a1" />
                </View>
                <Text className="text-2xl font-bold text-foreground">{adminStats.totalMasters}</Text>
              </View>
              <Text className="text-sm text-muted mt-2">전체 마스터</Text>
            </View>

            <View className="flex-1 bg-white border border-border rounded-xl p-4">
              <View className="flex-row items-center justify-between">
                <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
                  <Building2 size={20} color="#111827" />
                </View>
                <Text className="text-2xl font-bold text-foreground">{adminStats.totalStores}</Text>
              </View>
              <Text className="text-sm text-muted mt-2">전체 매장</Text>
            </View>
          </View>

          <View className="flex-row gap-3 mt-3">
            <View className="flex-1 bg-white border border-border rounded-xl p-4">
              <View className="flex-row items-center justify-between">
                <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
                  <CheckCircle size={20} color="#111827" />
                </View>
                <Text className="text-2xl font-bold text-foreground">{adminStats.activeStores}</Text>
              </View>
              <Text className="text-sm text-muted mt-2">활성 매장</Text>
            </View>

            <View className="flex-1 bg-white border border-border rounded-xl p-4">
              <View className="flex-row items-center justify-between">
                <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
                  <Briefcase size={20} color="#111827" />
                </View>
                <Text className="text-2xl font-bold text-foreground">{adminStats.totalProjects}</Text>
              </View>
              <Text className="text-sm text-muted mt-2">전체 프로젝트</Text>
            </View>
          </View>
        </View>

        {/* 마스터 목록 */}
        <View className="px-4 mt-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-base font-bold text-foreground">
              마스터 목록 ({adminMasters.length})
            </Text>
          </View>

          {adminMasters.length > 0 ? (
            <View className="gap-2">
              {adminMasters.map((master) => (
                <View
                  key={master.id}
                  className="bg-white border border-border rounded-xl p-4"
                >
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
                      <User size={18} color="#67c0a1" />
                    </View>
                    <View className="flex-1 ml-3">
                      <Text className="text-foreground font-semibold">{master.name}</Text>
                      {master.phone && <Text className="text-muted text-sm">{master.phone}</Text>}
                    </View>
                    <View className="items-end">
                      <Text className="text-foreground font-medium">{master.projectCount} 프로젝트</Text>
                      <Text className="text-muted text-sm">{master.storeCount} 매장</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View className="bg-white border border-border rounded-xl p-6 items-center">
              <Users size={32} color="#D1D5DB" />
              <Text className="text-muted mt-2">등록된 마스터가 없습니다</Text>
            </View>
          )}
        </View>

        {/* 매장 목록 */}
        <View className="px-4 mt-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-base font-bold text-foreground">
              매장 목록 ({adminStores.length})
            </Text>
            <Pressable
              className="py-1 px-3 bg-primary/10 rounded-full"
              onPress={() => router.push("/(tabs)/stores")}
            >
              <Text className="text-primary text-sm font-medium">전체 보기</Text>
            </Pressable>
          </View>

          {adminStores.length > 0 ? (
            <View className="gap-2">
              {adminStores.map((store) => (
                <Pressable
                  key={store.id}
                  className="bg-white border border-border rounded-xl p-4 active:opacity-80"
                  onPress={() => router.push(`/store/${store.id}`)}
                >
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1">
                      <View className="flex-row items-center">
                        <Text className="text-foreground font-semibold">{store.name}</Text>
                        <View className={`ml-2 px-2 py-0.5 rounded-full ${store.is_active ? "bg-primary/10" : "bg-gray-100"}`}>
                          <Text className={`text-xs font-medium ${store.is_active ? "text-primary" : "text-gray-500"}`}>
                            {store.is_active ? "활성" : "비활성"}
                          </Text>
                        </View>
                      </View>
                      {store.address && (
                        <View className="flex-row items-center mt-1">
                          <MapPin size={12} color="#6B7280" />
                          <Text className="text-muted text-sm ml-1">{store.address}</Text>
                        </View>
                      )}
                      {store.assigned_master_name && (
                        <View className="flex-row items-center mt-1">
                          <User size={12} color="#6B7280" />
                          <Text className="text-muted text-sm ml-1">담당: {store.assigned_master_name}</Text>
                        </View>
                      )}
                    </View>
                    <ChevronRight size={18} color="#9CA3AF" />
                  </View>
                </Pressable>
              ))}
            </View>
          ) : (
            <View className="bg-white border border-border rounded-xl p-6 items-center">
              <Building2 size={32} color="#D1D5DB" />
              <Text className="text-muted mt-2">등록된 매장이 없습니다</Text>
            </View>
          )}
        </View>

        <View className="h-8" />
      </ScrollView>
    );
  }

  // ==================== 클라이언트 대시보드 ====================
  if (effectiveRole === "client") {
    return (
      <ScrollView
        className="flex-1 bg-background"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#67c0a1" />
        }
      >
        {/* 프로필 헤더 */}
        <View className="bg-white px-6 py-5 border-b border-border">
          <View className="flex-row items-center justify-between">
            <Pressable
              className="flex-row items-center flex-1"
              onPress={() => router.push("/profile")}
            >
              <View className="w-14 h-14 rounded-full bg-primary/10 items-center justify-center">
                <Building2 size={28} color="#67c0a1" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-lg font-bold text-foreground">
                  {profile?.name || "이름 없음"}
                </Text>
                <Text className="text-sm text-muted">{getRoleLabel(effectiveRole)}</Text>
              </View>
            </Pressable>
            <Pressable className="p-2" onPress={() => router.push("/profile")}>
              <Settings size={22} color="#6B7280" />
            </Pressable>
          </View>
        </View>

        {/* 수거 현황 요약 카드 */}
        <View className="px-4 pt-4">
          <View className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-5 shadow-sm">
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-white/80 text-sm">다음 수거 예정일</Text>
                <Text className="text-white text-2xl font-bold mt-1">
                  {clientStats.nextPickupDate
                    ? getDDay(clientStats.nextPickupDate) || "예정 없음"
                    : "예정 없음"}
                </Text>
                {clientStats.nextPickupDate && (
                  <Text className="text-white/70 text-sm mt-0.5">
                    {clientStats.nextPickupDate}
                  </Text>
                )}
              </View>
              <View className="w-16 h-16 rounded-full bg-white/20 items-center justify-center">
                <Trash2 size={32} color="#ffffff" />
              </View>
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1 bg-white/15 rounded-xl p-3">
                <Text className="text-white/70 text-xs">전체 수거</Text>
                <Text className="text-white text-lg font-bold">{clientStats.totalPickups}건</Text>
              </View>
              <View className="flex-1 bg-white/15 rounded-xl p-3">
                <Text className="text-white/70 text-xs">완료</Text>
                <Text className="text-white text-lg font-bold">{clientStats.completedPickups}건</Text>
              </View>
              <View className="flex-1 bg-white/15 rounded-xl p-3">
                <Text className="text-white/70 text-xs">검토 대기</Text>
                <Text className="text-white text-lg font-bold">{clientStats.pendingReviews}건</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 검토 대기 알림 */}
        {clientStats.pendingReviews > 0 && (
          <Pressable
            className="mx-4 mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 flex-row items-center active:opacity-80"
            onPress={() => {
              const projectWithReview = clientProjects.find((p) => p.review_count > 0);
              if (projectWithReview) {
                router.push(`/client/project/${projectWithReview.id}`);
              }
            }}
          >
            <View className="w-10 h-10 rounded-full bg-amber-100 items-center justify-center mr-3">
              <CheckCircle size={20} color="#D97706" />
            </View>
            <View className="flex-1">
              <Text className="text-amber-800 font-semibold">검토 대기 중인 작업이 있습니다</Text>
              <Text className="text-amber-600 text-sm mt-0.5">
                {clientStats.pendingReviews}건의 작업 확인이 필요합니다
              </Text>
            </View>
            <ChevronRight size={20} color="#D97706" />
          </Pressable>
        )}

        {/* 캘린더 */}
        <View className="px-4 mt-4">
          <DashboardCalendar
            schedules={schedules}
            onItemPress={handleScheduleItemPress}
          />
        </View>

        {/* 진행 중인 프로젝트 */}
        <View className="px-4 mt-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-base font-bold text-foreground">
              진행 중인 수거 ({clientProjects.length})
            </Text>
          </View>

          {clientProjects.length > 0 ? (
            <View className="gap-3">
              {clientProjects.slice(0, 3).map((project) => {
                const status = getStatusLabel(project.status);
                const hasReview = project.review_count > 0;

                return (
                  <Pressable
                    key={project.id}
                    className={`bg-white border rounded-xl p-4 active:opacity-80 ${
                      hasReview ? "border-amber-300" : "border-border"
                    }`}
                    onPress={() => router.push(`/client/project/${project.id}`)}
                  >
                    <View className="flex-row justify-between items-start">
                      <View className="flex-1">
                        <View className="flex-row items-center">
                          <Text className="text-foreground font-semibold text-base flex-1">
                            {project.title}
                          </Text>
                          {hasReview && (
                            <View className="bg-amber-100 px-2 py-0.5 rounded-full mr-2">
                              <Text className="text-amber-600 text-xs font-medium">
                                검토 {project.review_count}건
                              </Text>
                            </View>
                          )}
                        </View>
                        {project.location && (
                          <View className="flex-row items-center mt-1.5">
                            <MapPin size={12} color="#6B7280" />
                            <Text className="text-muted text-sm ml-1">{project.location}</Text>
                          </View>
                        )}
                        <View className="flex-row items-center mt-1.5">
                          <Clock size={12} color="#6B7280" />
                          <Text className="text-muted text-sm ml-1">
                            {project.scheduled_date || "일정 미정"}
                          </Text>
                          <View className="mx-2 w-1 h-1 bg-muted rounded-full" />
                          <Text className="text-muted text-sm">
                            {project.completed_count}/{project.minor_projects_count} 완료
                          </Text>
                        </View>
                      </View>
                      <ChevronRight size={20} color="#9CA3AF" />
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <View className="bg-white border border-border rounded-xl p-6 items-center">
              <Trash2 size={32} color="#D1D5DB" />
              <Text className="text-muted mt-2">진행 중인 수거가 없습니다</Text>
            </View>
          )}
        </View>

        <View className="h-8" />
      </ScrollView>
    );
  }

  // ==================== 마스터 대시보드 ====================
  return (
    <ScrollView
      className="flex-1 bg-background"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#67c0a1" />
      }
    >
      {/* 프로필 헤더 */}
      {!showSidebar && (
        <View className="bg-white px-6 py-5 border-b border-border">
          <View className="flex-row items-center justify-between">
            <Pressable
              className="flex-row items-center flex-1"
              onPress={() => router.push("/profile")}
            >
              <View className="w-14 h-14 rounded-full bg-primary/10 items-center justify-center">
                <User size={28} color="#67c0a1" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-lg font-bold text-foreground">
                  {profile?.name || "이름 없음"}
                </Text>
                <Text className="text-sm text-muted">{getRoleLabel(effectiveRole)}</Text>
              </View>
            </Pressable>
            <Pressable className="p-2" onPress={() => router.push("/profile")}>
              <Settings size={22} color="#6B7280" />
            </Pressable>
          </View>
        </View>
      )}

      {/* PC 환영 메시지 */}
      {showSidebar && (
        <View className="px-8 pt-8 pb-4">
          <Text className="text-2xl font-bold text-foreground">
            안녕하세요, {profile?.name || "사용자"}님
          </Text>
          <Text className="text-muted mt-1">{getRoleLabel(effectiveRole)}</Text>
        </View>
      )}

      {/* 통계 카드들 */}
      <View className="px-4 pt-4">
        <View className="flex-row gap-3">
          <View className="flex-1 bg-white border border-border rounded-xl p-4">
            <View className="flex-row items-center justify-between">
              <View className="w-10 h-10 rounded-full bg-surface items-center justify-center">
                <Briefcase size={20} color="#1F2937" />
              </View>
              <Text className="text-2xl font-bold text-foreground">{masterStats.totalProjects}</Text>
            </View>
            <Text className="text-sm text-muted mt-2">전체 프로젝트</Text>
          </View>

          <View className="flex-1 bg-white border border-border rounded-xl p-4">
            <View className="flex-row items-center justify-between">
              <View className="w-10 h-10 rounded-full bg-surface items-center justify-center">
                <TrendingUp size={20} color="#1F2937" />
              </View>
              <Text className="text-2xl font-bold text-foreground">{masterStats.completedThisMonth}</Text>
            </View>
            <Text className="text-sm text-muted mt-2">이번 달 완료</Text>
          </View>
        </View>

        <View className="flex-row gap-3 mt-3">
          <View className="flex-1 bg-white border border-border rounded-xl p-4">
            <View className="flex-row items-center justify-between">
              <View className="w-10 h-10 rounded-full bg-surface items-center justify-center">
                <Building2 size={20} color="#1F2937" />
              </View>
              <Text className="text-2xl font-bold text-foreground">{masterStats.assignedStores}</Text>
            </View>
            <Text className="text-sm text-muted mt-2">담당 매장</Text>
          </View>

          <Pressable
            className="flex-1 bg-white border border-border rounded-xl p-4 active:opacity-80"
            onPress={() => router.push("/(tabs)/projects")}
          >
            <View className="flex-row items-center justify-between">
              <View className="w-10 h-10 rounded-full bg-surface items-center justify-center">
                <Users size={20} color="#1F2937" />
              </View>
              <Text className="text-2xl font-bold text-foreground">{masterStats.availableProjects}</Text>
            </View>
            <Text className="text-sm text-muted mt-2">지원 가능</Text>
          </Pressable>
        </View>
      </View>

      {/* 캘린더 */}
      <View className="px-4 mt-4">
        <DashboardCalendar
          schedules={schedules}
          onItemPress={handleScheduleItemPress}
        />
      </View>

      {/* 진행 중인 프로젝트 */}
      <View className="px-4 mt-6">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-base font-bold text-foreground">
            진행 중인 프로젝트 ({projects.length})
          </Text>
          {projects.length > 3 && (
            <Pressable onPress={() => router.push("/(tabs)/projects")}>
              <Text className="text-primary text-sm">전체보기</Text>
            </Pressable>
          )}
        </View>

        {projects.length > 0 ? (
          <View className="gap-3">
            {projects.slice(0, 3).map((project) => {
              const status = getStatusLabel(project.status);
              return (
                <Pressable
                  key={project.id}
                  className="bg-white border border-border rounded-xl p-4 active:opacity-80"
                  onPress={() => router.push(`/project/minor/${project.id}`)}
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className="text-foreground font-semibold text-base">
                        {project.title}
                      </Text>
                      {project.major_project?.location && (
                        <View className="flex-row items-center mt-1.5">
                          <MapPin size={12} color="#6B7280" />
                          <Text className="text-muted text-sm ml-1">
                            {project.major_project.location}
                          </Text>
                        </View>
                      )}
                      <View className="flex-row items-center mt-1.5">
                        <CalendarIcon size={12} color="#6B7280" />
                        <Text className="text-muted text-sm ml-1">
                          {project.major_project?.scheduled_date || "일정 미정"}
                        </Text>
                      </View>
                    </View>
                    <View className="flex-row items-center">
                      <View className={`${status.color} px-3 py-1 rounded-full`}>
                        <Text className={`${status.textColor} text-sm font-medium`}>
                          {status.label}
                        </Text>
                      </View>
                      <ChevronRight size={20} color="#9CA3AF" />
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <View className="bg-white border border-border rounded-xl p-6 items-center">
            <Briefcase size={32} color="#D1D5DB" />
            <Text className="text-muted mt-2">진행 중인 프로젝트가 없습니다</Text>
            <Pressable className="mt-3" onPress={() => router.push("/(tabs)/projects")}>
              <Text className="text-primary font-medium">프로젝트 찾아보기</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* 최근 완료 프로젝트 */}
      {completedProjects.length > 0 && (
        <View className="px-4 mt-6">
          <Text className="text-base font-bold text-foreground mb-3">최근 완료</Text>
          <View className="gap-3">
            {completedProjects.map((project) => (
              <Pressable
                key={project.id}
                className="bg-white border border-border rounded-xl p-4 active:opacity-80"
                onPress={() => router.push(`/project/minor/${project.id}`)}
              >
                <View className="flex-row justify-between items-center">
                  <View className="flex-1">
                    <Text className="text-foreground font-medium">{project.title}</Text>
                    <Text className="text-muted text-sm mt-1">
                      {project.major_project?.scheduled_date || ""}
                    </Text>
                  </View>
                  <View className="bg-surface px-3 py-1 rounded-full">
                    <Text className="text-muted text-sm font-medium">완료</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      <View className="h-8" />
    </ScrollView>
  );
}
