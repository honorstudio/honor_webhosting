import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import {
  MapPin,
  Calendar,
  Users,
  Plus,
  ChevronRight,
} from "lucide-react-native";
import { useAuth } from "../../src/contexts/AuthContext";
import { supabase } from "../../src/lib/supabase";
import { useResponsive } from "../../src/hooks/useResponsive";

type FilterType = "all" | "recruiting" | "my_applications";

interface MajorProject {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  status: string;
  scheduled_date: string | null;
  minor_projects_count: number;
  applied_count: number;
  required_count: number;
}

export default function ProjectsScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const { isDesktop, isTablet } = useResponsive();
  const [filter, setFilter] = useState<FilterType>("all");
  const [projects, setProjects] = useState<MajorProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // PC/태블릿에서는 그리드 레이아웃 사용
  const useGridLayout = isDesktop || isTablet;

  const isAdmin =
    profile?.role === "super_admin" || profile?.role === "project_manager";

  const fetchProjects = useCallback(async () => {
    try {
      let query = supabase
        .from("onul_major_projects")
        .select(`
          id,
          title,
          description,
          location,
          status,
          scheduled_date,
          onul_minor_projects (
            id,
            required_masters,
            onul_project_participants (
              id,
              status,
              master_id
            )
          )
        `)
        .order("created_at", { ascending: false });

      // 필터에 따라 조건 추가
      if (filter === "recruiting" && !isAdmin) {
        query = query.eq("status", "recruiting");
      }

      const { data, error } = await query;

      if (error) throw error;

      let mappedProjects: MajorProject[] = (data || []).map((project: any) => {
        const minorProjects = project.onul_minor_projects || [];
        let requiredCount = 0;
        let appliedCount = 0;

        minorProjects.forEach((mp: any) => {
          requiredCount += mp.required_masters || 0;
          const participants = mp.onul_project_participants || [];
          appliedCount += participants.filter(
            (p: any) => p.status === "approved" || p.status === "applied"
          ).length;
        });

        return {
          id: project.id,
          title: project.title,
          description: project.description,
          location: project.location,
          status: project.status,
          scheduled_date: project.scheduled_date,
          minor_projects_count: minorProjects.length,
          applied_count: appliedCount,
          required_count: requiredCount,
        };
      });

      // "내 신청" 필터링
      if (filter === "my_applications" && profile?.id) {
        const { data: myParticipations } = await supabase
          .from("onul_project_participants")
          .select("minor_project_id")
          .eq("master_id", profile.id);

        const myMinorIds = new Set(
          myParticipations?.map((p) => p.minor_project_id) || []
        );

        // 내가 신청한 소형 프로젝트가 포함된 대형 프로젝트 필터링
        const { data: minorData } = await supabase
          .from("onul_minor_projects")
          .select("major_project_id")
          .in("id", Array.from(myMinorIds));

        const myMajorIds = new Set(
          minorData?.map((m) => m.major_project_id) || []
        );

        mappedProjects = mappedProjects.filter((p) => myMajorIds.has(p.id));
      }

      setProjects(mappedProjects);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter, profile?.id, isAdmin]);

  // 화면 포커스될 때마다 데이터 새로고침
  useFocusEffect(
    useCallback(() => {
      fetchProjects();
    }, [fetchProjects])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProjects();
  }, [fetchProjects]);

  const getStatusBadge = (status: string, appliedCount: number, requiredCount: number) => {
    if (status === "completed") {
      return { label: "완료", color: "bg-surface", textColor: "text-muted" };
    }
    if (status === "in_progress") {
      return { label: "진행중", color: "bg-primary/10", textColor: "text-primary" };
    }
    if (status === "recruiting") {
      if (appliedCount >= requiredCount && requiredCount > 0) {
        return { label: "마감임박", color: "bg-amber-100", textColor: "text-amber-600" };
      }
      return { label: "모집중", color: "bg-primary/10", textColor: "text-primary" };
    }
    if (status === "draft") {
      return { label: "초안", color: "bg-gray-100", textColor: "text-gray-600" };
    }
    return { label: status, color: "bg-surface", textColor: "text-muted" };
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
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#67c0a1"
          />
        }
      >
        {/* 필터 */}
        <View className="px-6 py-4 flex-row gap-2">
          <Pressable
            onPress={() => setFilter("all")}
            className={`px-4 py-2 rounded-full ${
              filter === "all"
                ? "bg-primary"
                : "bg-surface border border-border"
            }`}
          >
            <Text
              className={`font-medium ${
                filter === "all" ? "text-white" : "text-muted"
              }`}
            >
              전체
            </Text>
          </Pressable>
          {!isAdmin && (
            <>
              <Pressable
                onPress={() => setFilter("recruiting")}
                className={`px-4 py-2 rounded-full ${
                  filter === "recruiting"
                    ? "bg-primary"
                    : "bg-surface border border-border"
                }`}
              >
                <Text
                  className={`font-medium ${
                    filter === "recruiting" ? "text-white" : "text-muted"
                  }`}
                >
                  모집중
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setFilter("my_applications")}
                className={`px-4 py-2 rounded-full ${
                  filter === "my_applications"
                    ? "bg-primary"
                    : "bg-surface border border-border"
                }`}
              >
                <Text
                  className={`font-medium ${
                    filter === "my_applications" ? "text-white" : "text-muted"
                  }`}
                >
                  내 신청
                </Text>
              </Pressable>
            </>
          )}
        </View>

        {/* 프로젝트 목록 - PC에서는 그리드 */}
        <View className={`px-6 pb-8 ${useGridLayout ? "flex-row flex-wrap gap-4" : "gap-4"}`}>
          {projects.length > 0 ? (
            projects.map((project) => {
              const badge = getStatusBadge(
                project.status,
                project.applied_count,
                project.required_count
              );
              return (
                <Pressable
                  key={project.id}
                  className="bg-white border border-border rounded-xl p-5 active:opacity-80"
                  style={useGridLayout ? { width: isDesktop ? "32%" : "48%" } : undefined}
                  onPress={() => router.push(`/project/${project.id}`)}
                >
                  <View className="flex-row justify-between items-start mb-3">
                    <Text className="text-foreground font-bold text-lg flex-1 pr-2">
                      {project.title}
                    </Text>
                    <View className={`${badge.color} px-3 py-1 rounded-full`}>
                      <Text className={`${badge.textColor} text-sm font-medium`}>
                        {badge.label}
                      </Text>
                    </View>
                  </View>

                  <View className="gap-2 mb-3">
                    {project.location && (
                      <View className="flex-row items-center">
                        <MapPin size={16} color="#6B7280" />
                        <Text className="text-muted ml-2">{project.location}</Text>
                      </View>
                    )}
                    {project.scheduled_date && (
                      <View className="flex-row items-center">
                        <Calendar size={16} color="#6B7280" />
                        <Text className="text-muted ml-2">
                          {project.scheduled_date}
                        </Text>
                      </View>
                    )}
                    <View className="flex-row items-center">
                      <Users size={16} color="#6B7280" />
                      <Text className="text-muted ml-2">
                        필요인원: {project.required_count}명 (현재{" "}
                        {project.applied_count}명)
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center justify-end">
                    <Text className="text-muted text-sm mr-1">
                      소형 프로젝트 {project.minor_projects_count}개
                    </Text>
                    <ChevronRight size={16} color="#9CA3AF" />
                  </View>
                </Pressable>
              );
            })
          ) : (
            <View className={`bg-white border border-border rounded-xl p-8 items-center ${useGridLayout ? "w-full" : ""}`}>
              <Text className="text-muted text-center">
                {filter === "my_applications"
                  ? "신청한 프로젝트가 없습니다"
                  : filter === "recruiting"
                  ? "모집 중인 프로젝트가 없습니다"
                  : "프로젝트가 없습니다"}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 관리자 및 마스터용 추가 버튼 */}
      {(isAdmin || profile?.role === "master") && (
        <Pressable
          onPress={() => router.push("/project/create")}
          className="absolute bottom-6 right-6 w-14 h-14 bg-primary rounded-full items-center justify-center shadow-lg active:opacity-80"
        >
          <Plus size={28} color="#FFFFFF" />
        </Pressable>
      )}
    </View>
  );
}
