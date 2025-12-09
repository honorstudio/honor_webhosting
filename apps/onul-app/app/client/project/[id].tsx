import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { useLocalSearchParams, useRouter, useNavigation } from "expo-router";
import {
  MapPin,
  Calendar,
  Users,
  Camera,
  CheckCircle,
  ChevronRight,
  Clock,
} from "lucide-react-native";
import { useAuth } from "../../../src/contexts/AuthContext";
import { supabase } from "../../../src/lib/supabase";

interface MinorProject {
  id: string;
  title: string | null;
  description: string | null;
  status: string | null;
  work_scope: string | null;
  photo_count: number;
}

interface MajorProject {
  id: string;
  title: string | null;
  description: string | null;
  location: string | null;
  status: string | null;
  scheduled_date: string | null;
  started_at: string | null;
  completed_at: string | null;
  manager_name: string | null;
}

export default function ClientProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const { profile } = useAuth();
  const [project, setProject] = useState<MajorProject | null>(null);
  const [minorProjects, setMinorProjects] = useState<MinorProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [approving, setApproving] = useState<string | null>(null);

  const fetchProject = useCallback(async () => {
    if (!id || !profile?.id) return;

    try {
      // 대형 프로젝트 조회 (클라이언트 본인 프로젝트만)
      const { data: majorData, error: majorError } = await supabase
        .from("onul_major_projects")
        .select(`
          *,
          manager:onul_profiles!manager_id (name)
        `)
        .eq("id", id)
        .eq("client_id", profile.id)
        .single();

      if (majorError) throw majorError;

      setProject({
        ...majorData,
        manager_name: (majorData.manager as any)?.name || null,
      });

      // 헤더 타이틀 설정
      navigation.setOptions({
        title: majorData.title || "프로젝트 상세",
      });

      // 소형 프로젝트 및 사진 수 조회
      const { data: minorData, error: minorError } = await supabase
        .from("onul_minor_projects")
        .select(`
          id,
          title,
          description,
          status,
          work_scope,
          onul_project_photos (id)
        `)
        .eq("major_project_id", id)
        .order("created_at", { ascending: true });

      if (minorError) throw minorError;

      const mapped: MinorProject[] = (minorData || []).map((mp: any) => ({
        id: mp.id,
        title: mp.title,
        description: mp.description,
        status: mp.status,
        work_scope: mp.work_scope,
        photo_count: mp.onul_project_photos?.length || 0,
      }));

      setMinorProjects(mapped);
    } catch (error) {
      console.error("Error fetching project:", error);
      Alert.alert("오류", "프로젝트 정보를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id, profile?.id, navigation]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProject();
  }, [fetchProject]);

  // 소형 프로젝트 완료 확인 (review → completed)
  const handleApproveCompletion = async (minorProjectId: string) => {
    Alert.alert(
      "완료 확인",
      "작업이 완료되었음을 확인하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        {
          text: "확인",
          onPress: async () => {
            setApproving(minorProjectId);
            try {
              const { error } = await supabase
                .from("onul_minor_projects")
                .update({
                  status: "completed",
                  completed_at: new Date().toISOString(),
                })
                .eq("id", minorProjectId);

              if (error) throw error;

              Alert.alert("완료", "작업 완료가 확인되었습니다.");
              fetchProject();

              // 모든 소형 프로젝트가 완료되면 대형 프로젝트도 완료로 변경
              const allCompleted = minorProjects.every(
                (mp) => mp.id === minorProjectId || mp.status === "completed"
              );

              if (allCompleted && project) {
                await supabase
                  .from("onul_major_projects")
                  .update({
                    status: "completed",
                    completed_at: new Date().toISOString(),
                  })
                  .eq("id", project.id);
              }
            } catch (error) {
              console.error("Error approving completion:", error);
              Alert.alert("오류", "완료 확인 중 오류가 발생했습니다.");
            } finally {
              setApproving(null);
            }
          },
        },
      ]
    );
  };

  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case "draft":
        return { label: "준비중", color: "bg-gray-100", textColor: "text-gray-600" };
      case "recruiting":
        return { label: "모집중", color: "bg-blue-100", textColor: "text-blue-600" };
      case "in_progress":
        return { label: "진행중", color: "bg-primary/10", textColor: "text-primary" };
      case "review":
        return { label: "검토 대기", color: "bg-amber-100", textColor: "text-amber-600" };
      case "completed":
        return { label: "완료", color: "bg-surface", textColor: "text-muted" };
      default:
        return { label: status || "", color: "bg-surface", textColor: "text-muted" };
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#67c0a1" />
      </View>
    );
  }

  if (!project) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-muted">프로젝트를 찾을 수 없습니다</Text>
      </View>
    );
  }

  const projectStatus = getStatusLabel(project.status);
  const reviewCount = minorProjects.filter((mp) => mp.status === "review").length;
  const completedCount = minorProjects.filter((mp) => mp.status === "completed").length;

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
        {/* 프로젝트 헤더 */}
        <View className="bg-white px-6 py-6 border-b border-border">
          <View className="flex-row items-start justify-between mb-3">
            <Text className="text-2xl font-bold text-foreground flex-1 pr-3">
              {project.title}
            </Text>
            <View className={`${projectStatus.color} px-3 py-1 rounded-full`}>
              <Text className={`${projectStatus.textColor} text-sm font-medium`}>
                {projectStatus.label}
              </Text>
            </View>
          </View>

          {project.description && (
            <Text className="text-muted mb-4">{project.description}</Text>
          )}

          <View className="gap-2">
            {project.location && (
              <View className="flex-row items-center">
                <MapPin size={16} color="#6B7280" />
                <Text className="text-muted ml-2">{project.location}</Text>
              </View>
            )}
            {project.scheduled_date && (
              <View className="flex-row items-center">
                <Calendar size={16} color="#6B7280" />
                <Text className="text-muted ml-2">{project.scheduled_date}</Text>
              </View>
            )}
            {project.manager_name && (
              <View className="flex-row items-center">
                <Users size={16} color="#6B7280" />
                <Text className="text-muted ml-2">
                  담당: {project.manager_name}
                </Text>
              </View>
            )}
          </View>

          {/* 진행 상황 */}
          <View className="mt-4 bg-surface rounded-xl p-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-foreground font-medium">전체 진행률</Text>
              <Text className="text-primary font-bold">
                {completedCount}/{minorProjects.length} 완료
              </Text>
            </View>
            <View className="mt-2 h-2 bg-border rounded-full overflow-hidden">
              <View
                className="h-full bg-primary rounded-full"
                style={{
                  width: `${minorProjects.length > 0 ? (completedCount / minorProjects.length) * 100 : 0}%`,
                }}
              />
            </View>
          </View>
        </View>

        {/* 검토 대기 알림 */}
        {reviewCount > 0 && (
          <View className="mx-6 mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <View className="flex-row items-center">
              <Clock size={20} color="#D97706" />
              <Text className="text-amber-700 font-medium ml-2">
                {reviewCount}개 작업이 검토 대기 중입니다
              </Text>
            </View>
            <Text className="text-amber-600 text-sm mt-1">
              아래에서 완료된 작업을 확인하고 승인해주세요
            </Text>
          </View>
        )}

        {/* 소형 프로젝트 (작업) 목록 */}
        <View className="px-6 mt-6 mb-8">
          <Text className="text-lg font-bold text-foreground mb-4">
            작업 내역 ({minorProjects.length})
          </Text>

          {minorProjects.length > 0 ? (
            <View className="gap-3">
              {minorProjects.map((mp) => {
                const mpStatus = getStatusLabel(mp.status);
                const isReview = mp.status === "review";
                const isApproving = approving === mp.id;

                return (
                  <View
                    key={mp.id}
                    className={`bg-white border rounded-xl p-4 ${
                      isReview ? "border-amber-300" : "border-border"
                    }`}
                  >
                    <View className="flex-row items-start justify-between mb-2">
                      <Text className="text-foreground font-semibold flex-1 pr-2">
                        {mp.title}
                      </Text>
                      <View className={`${mpStatus.color} px-2 py-0.5 rounded-full`}>
                        <Text className={`${mpStatus.textColor} text-xs font-medium`}>
                          {mpStatus.label}
                        </Text>
                      </View>
                    </View>

                    {mp.description && (
                      <Text className="text-muted text-sm mb-2" numberOfLines={2}>
                        {mp.description}
                      </Text>
                    )}

                    {mp.work_scope && (
                      <Text className="text-muted text-sm mb-3">
                        작업 범위: {mp.work_scope}
                      </Text>
                    )}

                    <View className="flex-row items-center justify-between">
                      {/* 사진 보기 버튼 */}
                      <Pressable
                        onPress={() =>
                          router.push({
                            pathname: "/photo/compare",
                            params: { minorProjectId: mp.id },
                          })
                        }
                        className="flex-row items-center"
                      >
                        <Camera size={16} color="#67c0a1" />
                        <Text className="text-primary text-sm font-medium ml-1">
                          비포/애프터 ({mp.photo_count})
                        </Text>
                        <ChevronRight size={14} color="#67c0a1" />
                      </Pressable>

                      {/* 검토 중인 작업에만 완료 확인 버튼 표시 */}
                      {isReview && (
                        <Pressable
                          onPress={() => handleApproveCompletion(mp.id)}
                          disabled={isApproving}
                          className={`flex-row items-center px-4 py-2 rounded-lg ${
                            isApproving ? "bg-surface" : "bg-primary"
                          }`}
                        >
                          {isApproving ? (
                            <ActivityIndicator size="small" color="#67c0a1" />
                          ) : (
                            <>
                              <CheckCircle size={16} color="#FFFFFF" />
                              <Text className="text-white font-medium text-sm ml-1">
                                완료 확인
                              </Text>
                            </>
                          )}
                        </Pressable>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View className="bg-white border border-border rounded-xl p-8 items-center">
              <Text className="text-muted">등록된 작업이 없습니다</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
