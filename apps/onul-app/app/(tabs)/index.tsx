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
  ChevronRight,
  Settings,
  Camera,
  CheckCircle,
  Clock,
  Building2,
} from "lucide-react-native";
import { useAuth } from "../../src/contexts/AuthContext";
import { useDevView } from "../../src/contexts/DevViewContext";
import { supabase } from "../../src/lib/supabase";
import { useResponsive } from "../../src/hooks/useResponsive";

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

export default function DashboardScreen() {
  const router = useRouter();
  const { profile, loading: authLoading } = useAuth();
  const { getEffectiveRole, viewMode } = useDevView();
  const { isDesktop, isTablet, showSidebar } = useResponsive();

  // 현재 적용된 역할 (개발 모드 뷰 적용)
  const effectiveRole = getEffectiveRole(profile?.role);

  // PC/태블릿에서는 그리드 레이아웃 사용
  const useGridLayout = isDesktop || isTablet;

  // 마스터용 상태
  const [projects, setProjects] = useState<MinorProject[]>([]);
  const [completedProjects, setCompletedProjects] = useState<MinorProject[]>([]);
  const [projectCount, setProjectCount] = useState(0);

  // 클라이언트용 상태
  const [clientProjects, setClientProjects] = useState<ClientProject[]>([]);
  const [clientCompletedProjects, setClientCompletedProjects] = useState<ClientProject[]>([]);

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

  const fetchMasterProjects = useCallback(async () => {
    if (!profile?.id) return;

    try {
      const inProgress: MinorProject[] = [];
      const completed: MinorProject[] = [];
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

          if (project.status === "completed") {
            completed.push(mapped);
          } else {
            inProgress.push(mapped);
          }
        }
      });

      // 2. 담당자(manager)로 등록된 대형 프로젝트의 소형 프로젝트도 조회
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
          // 이미 참가자로 추가된 프로젝트는 제외
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

          if (project.status === "completed") {
            completed.push(mapped);
          } else {
            inProgress.push(mapped);
          }
        });
      });

      setProjects(inProgress);
      setCompletedProjects(completed.slice(0, 3));

      // 프로젝트 수 = 참가 + 담당자 프로젝트
      setProjectCount(addedProjectIds.size);
    } catch (error) {
      console.error("Error fetching master projects:", error);
    }
  }, [profile]);

  const fetchClientProjects = useCallback(async () => {
    if (!profile?.id) return;

    try {
      // 클라이언트의 프로젝트 조회
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

      majorProjects?.forEach((mp: any) => {
        const minorProjects = mp.onul_minor_projects || [];
        const completedCount = minorProjects.filter((p: any) => p.status === "completed").length;
        const reviewCount = minorProjects.filter((p: any) => p.status === "review").length;

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
    } catch (error) {
      console.error("Error fetching client projects:", error);
    }
  }, [profile]);

  const fetchProjects = useCallback(async () => {
    if (!profile?.id) return;

    try {
      // 개발 모드 뷰 적용: effectiveRole 사용
      if (effectiveRole === "master") {
        await fetchMasterProjects();
      } else if (effectiveRole === "client") {
        await fetchClientProjects();
      }
      // 관리자는 별도 처리 (기존 코드 유지)
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [profile, effectiveRole, fetchMasterProjects, fetchClientProjects]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProjects();
  }, [fetchProjects]);

  if (authLoading || loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#67c0a1" />
      </View>
    );
  }

  // 클라이언트 대시보드 (개발 모드 뷰 적용)
  if (effectiveRole === "client") {
    return (
      <ScrollView
        className="flex-1 bg-background"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#67c0a1"
          />
        }
      >
        {/* 프로필 섹션 */}
        <View className="bg-white px-6 py-6 border-b border-border">
          <View className="flex-row items-center justify-between">
            <Pressable
              className="flex-row items-center flex-1"
              onPress={() => router.push("/profile")}
            >
              <View className="w-16 h-16 rounded-full bg-surface items-center justify-center">
                <Building2 size={32} color="#9CA3AF" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-xl font-bold text-foreground">
                  {profile?.name || "이름 없음"}
                </Text>
                <Text className="text-muted">
                  {getRoleLabel(effectiveRole || undefined)}
                  {` | 프로젝트 ${clientProjects.length + clientCompletedProjects.length}건`}
                </Text>
              </View>
            </Pressable>
            <Pressable className="p-2" onPress={() => router.push("/profile")}>
              <Settings size={24} color="#6B7280" />
            </Pressable>
          </View>
        </View>

        {/* 검토 대기 프로젝트 알림 */}
        {clientProjects.some((p) => p.review_count > 0) && (
          <View className="mx-6 mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <View className="flex-row items-center">
              <CheckCircle size={20} color="#D97706" />
              <Text className="text-amber-700 font-medium ml-2">
                검토 대기 중인 작업이 있습니다
              </Text>
            </View>
            <Text className="text-amber-600 text-sm mt-1">
              완료 확인을 눌러 작업을 승인해주세요
            </Text>
          </View>
        )}

        {/* 진행 중인 프로젝트 */}
        <View className="px-6 mt-6">
          <Text className="text-lg font-bold text-foreground mb-4">
            내 프로젝트 ({clientProjects.length})
          </Text>

          {clientProjects.length > 0 ? (
            <View className="gap-3">
              {clientProjects.map((project) => {
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
                          <Text className="text-muted text-sm mt-1">
                            {project.location}
                          </Text>
                        )}
                        <View className="flex-row items-center mt-2">
                          <Clock size={14} color="#6B7280" />
                          <Text className="text-muted text-sm ml-1">
                            {project.scheduled_date || "일정 미정"}
                          </Text>
                          <View className="mx-2 w-1 h-1 bg-muted rounded-full" />
                          <Text className="text-muted text-sm">
                            {project.completed_count}/{project.minor_projects_count} 완료
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
              <Text className="text-muted">진행 중인 프로젝트가 없습니다</Text>
            </View>
          )}
        </View>

        {/* 완료된 프로젝트 */}
        <View className="px-6 mt-8 mb-8">
          <Text className="text-lg font-bold text-foreground mb-4">
            완료된 프로젝트
          </Text>

          {clientCompletedProjects.length > 0 ? (
            <View className="gap-3">
              {clientCompletedProjects.map((project) => (
                <Pressable
                  key={project.id}
                  className="bg-white border border-border rounded-xl p-4 active:opacity-80"
                  onPress={() => router.push(`/client/project/${project.id}`)}
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className="text-foreground font-semibold text-base">
                        {project.title}
                      </Text>
                      {project.location && (
                        <Text className="text-muted text-sm mt-1">
                          {project.location}
                        </Text>
                      )}
                      <View className="flex-row items-center mt-2">
                        <Camera size={14} color="#6B7280" />
                        <Text className="text-muted text-sm ml-1">
                          비포/애프터 사진 보기
                        </Text>
                      </View>
                    </View>
                    <View className="flex-row items-center">
                      <View className="bg-surface px-3 py-1 rounded-full">
                        <Text className="text-muted text-sm font-medium">완료</Text>
                      </View>
                      <ChevronRight size={20} color="#9CA3AF" />
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          ) : (
            <View className="bg-white border border-border rounded-xl p-6 items-center">
              <Text className="text-muted">완료된 프로젝트가 없습니다</Text>
            </View>
          )}
        </View>
      </ScrollView>
    );
  }

  // 마스터 대시보드
  return (
    <ScrollView
      className="flex-1 bg-background"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#67c0a1"
        />
      }
    >
      {/* 프로필 섹션 - PC에서는 사이드바에 있으므로 숨김 */}
      {!showSidebar && (
        <View className="bg-white px-6 py-6 border-b border-border">
          <View className="flex-row items-center justify-between">
            <Pressable
              className="flex-row items-center flex-1"
              onPress={() => router.push("/profile")}
            >
              <View className="w-16 h-16 rounded-full bg-surface items-center justify-center">
                <User size={32} color="#9CA3AF" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-xl font-bold text-foreground">
                  {profile?.name || "이름 없음"}
                </Text>
                <Text className="text-muted">
                  {getRoleLabel(effectiveRole || undefined)}
                  {effectiveRole === "master" && ` | 프로젝트 ${projectCount}건`}
                </Text>
              </View>
            </Pressable>
            <Pressable className="p-2" onPress={() => router.push("/profile")}>
              <Settings size={24} color="#6B7280" />
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
          <Text className="text-muted mt-1">
            {getRoleLabel(effectiveRole || undefined)}
            {effectiveRole === "master" && ` | 프로젝트 ${projectCount}건`}
          </Text>
        </View>
      )}

      {/* 메인 컨텐츠 - PC에서는 그리드 레이아웃 */}
      <View
        className={useGridLayout ? "px-8" : ""}
        style={useGridLayout ? { flexDirection: "row", gap: 24 } : undefined}
      >
        {/* 진행 중인 프로젝트 */}
        <View
          className={!useGridLayout ? "px-6 mt-6" : ""}
          style={useGridLayout ? { flex: 1, minWidth: 0 } : undefined}
        >
          {!useGridLayout && (
            <Text className="text-lg font-bold text-foreground mb-4">
              진행 중인 프로젝트 ({projects.length})
            </Text>
          )}
          {useGridLayout && (
            <View className="bg-white rounded-xl border border-border p-6 mb-6">
              <Text className="text-lg font-bold text-foreground mb-4">
                진행 중인 프로젝트 ({projects.length})
              </Text>

              {projects.length > 0 ? (
                <View className="gap-3">
                  {projects.map((project) => {
                    const status = getStatusLabel(project.status);
                    return (
                      <Pressable
                        key={project.id}
                        className="bg-surface border border-border rounded-xl p-4 active:opacity-80"
                        onPress={() => router.push(`/project/minor/${project.id}`)}
                      >
                        <View className="flex-row justify-between items-start">
                          <View className="flex-1">
                            <Text className="text-foreground font-semibold text-base">
                              {project.title}
                            </Text>
                            <Text className="text-muted text-sm mt-1">
                              {project.major_project?.scheduled_date || "일정 미정"}
                            </Text>
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
                <View className="bg-surface rounded-xl p-6 items-center">
                  <Text className="text-muted">진행 중인 프로젝트가 없습니다</Text>
                  {effectiveRole === "master" && (
                    <Pressable
                      className="mt-3"
                      onPress={() => router.push("/(tabs)/projects")}
                    >
                      <Text className="text-primary font-medium">
                        프로젝트 찾아보기
                      </Text>
                    </Pressable>
                  )}
                </View>
              )}
            </View>
          )}

          {/* 모바일 레이아웃 */}
          {!useGridLayout && (
            <>
              {projects.length > 0 ? (
                <View className="gap-3">
                  {projects.map((project) => {
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
                            <Text className="text-muted text-sm mt-1">
                              {project.major_project?.scheduled_date || "일정 미정"}
                            </Text>
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
                  <Text className="text-muted">진행 중인 프로젝트가 없습니다</Text>
                  {effectiveRole === "master" && (
                    <Pressable
                      className="mt-3"
                      onPress={() => router.push("/(tabs)/projects")}
                    >
                      <Text className="text-primary font-medium">
                        프로젝트 찾아보기
                      </Text>
                    </Pressable>
                  )}
                </View>
              )}
            </>
          )}
        </View>

        {/* 최근 완료 프로젝트 */}
        <View
          className={!useGridLayout ? "px-6 mt-8 mb-8" : ""}
          style={useGridLayout ? { flex: 1, minWidth: 0 } : undefined}
        >
          {!useGridLayout && (
            <Text className="text-lg font-bold text-foreground mb-4">
              최근 완료 프로젝트
            </Text>
          )}
          {useGridLayout && (
            <View className="bg-white rounded-xl border border-border p-6 mb-6">
              <Text className="text-lg font-bold text-foreground mb-4">
                최근 완료 프로젝트
              </Text>

              {completedProjects.length > 0 ? (
                <View className="gap-3">
                  {completedProjects.map((project) => (
                    <Pressable
                      key={project.id}
                      className="bg-surface border border-border rounded-xl p-4 active:opacity-80"
                      onPress={() => router.push(`/project/minor/${project.id}`)}
                    >
                      <View className="flex-row justify-between items-start">
                        <View className="flex-1">
                          <Text className="text-foreground font-semibold text-base">
                            {project.title}
                          </Text>
                          <Text className="text-muted text-sm mt-1">
                            {project.major_project?.scheduled_date || ""}
                          </Text>
                        </View>
                        <View className="flex-row items-center">
                          <View className="bg-surface px-3 py-1 rounded-full">
                            <Text className="text-muted text-sm font-medium">완료</Text>
                          </View>
                          <ChevronRight size={20} color="#9CA3AF" />
                        </View>
                      </View>
                    </Pressable>
                  ))}
                </View>
              ) : (
                <View className="bg-surface rounded-xl p-6 items-center">
                  <Text className="text-muted">완료된 프로젝트가 없습니다</Text>
                </View>
              )}
            </View>
          )}

          {/* 모바일 레이아웃 */}
          {!useGridLayout && (
            <>
              {completedProjects.length > 0 ? (
                <View className="gap-3">
                  {completedProjects.map((project) => (
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
                          <Text className="text-muted text-sm mt-1">
                            {project.major_project?.scheduled_date || ""}
                          </Text>
                        </View>
                        <View className="flex-row items-center">
                          <View className="bg-surface px-3 py-1 rounded-full">
                            <Text className="text-muted text-sm font-medium">완료</Text>
                          </View>
                          <ChevronRight size={20} color="#9CA3AF" />
                        </View>
                      </View>
                    </Pressable>
                  ))}
                </View>
              ) : (
                <View className="bg-white border border-border rounded-xl p-6 items-center">
                  <Text className="text-muted">완료된 프로젝트가 없습니다</Text>
                </View>
              )}
            </>
          )}
        </View>
      </View>

      {/* 하단 여백 */}
      {useGridLayout && <View className="h-8" />}
    </ScrollView>
  );
}
