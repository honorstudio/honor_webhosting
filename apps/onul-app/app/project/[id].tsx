import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import {
  MapPin,
  Calendar,
  Users,
  ChevronRight,
  Plus,
  Edit3,
  Trash2,
  MessageCircle,
  MoreHorizontal,
  UserPlus,
  Megaphone,
  AlertTriangle,
} from "lucide-react-native";
import { useAuth } from "../../src/contexts/AuthContext";
import { supabase } from "../../src/lib/supabase";
import { useToast } from "../../src/components/Toast";
import BottomSheet from "../../src/components/BottomSheet";

interface MinorProject {
  id: string;
  title: string | null;
  description: string | null;
  status: string | null;
  required_masters: number | null;
  work_scope: string | null;
  notes: string | null;
  participants: {
    id: string;
    master_id: string;
    status: string;
    master_name: string | null;
  }[];
  my_participation_status: string | null;
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
  manager_id: string | null;
  manager_name: string | null;
  client_name: string | null;
  work_scope: string | null;
  notes: string | null;
}

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [project, setProject] = useState<MajorProject | null>(null);
  const [minorProjects, setMinorProjects] = useState<MinorProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const isAdmin =
    profile?.role === "super_admin" || profile?.role === "project_manager";

  // 마스터가 자신이 생성한 프로젝트인지 확인 (manager_id로 비교)
  const isProjectOwner = profile?.role === "master" &&
    project?.manager_id === profile?.id;

  // 관리 권한 (관리자 또는 프로젝트 생성자)
  const canManage = isAdmin || isProjectOwner;

  const fetchProject = useCallback(async () => {
    if (!id) return;

    try {
      // 대형 프로젝트 조회
      const { data: majorData, error: majorError } = await supabase
        .from("onul_major_projects")
        .select(`
          *,
          manager:onul_profiles!manager_id (name),
          client:onul_profiles!client_id (name)
        `)
        .eq("id", id)
        .single();

      if (majorError) throw majorError;

      setProject({
        ...majorData,
        manager_name: (majorData.manager as any)?.name || null,
        client_name: (majorData.client as any)?.name || null,
        work_scope: majorData.work_scope || null,
        notes: majorData.notes || null,
      });

      // 소형 프로젝트 조회
      const { data: minorData, error: minorError } = await supabase
        .from("onul_minor_projects")
        .select(`
          *,
          onul_project_participants (
            id,
            master_id,
            status,
            master:master_id (name)
          )
        `)
        .eq("major_project_id", id)
        .order("created_at", { ascending: true });

      if (minorError) throw minorError;

      const mapped: MinorProject[] = (minorData || []).map((mp: any) => {
        const participants = mp.onul_project_participants || [];
        const myParticipation = participants.find(
          (p: any) => p.master_id === profile?.id
        );

        return {
          id: mp.id,
          title: mp.title,
          description: mp.description,
          status: mp.status,
          required_masters: mp.required_masters,
          work_scope: mp.work_scope,
          notes: mp.notes,
          participants: participants.map((p: any) => ({
            id: p.id,
            master_id: p.master_id,
            status: p.status,
            master_name: p.master?.name || null,
          })),
          my_participation_status: myParticipation?.status || null,
        };
      });

      setMinorProjects(mapped);
    } catch (error) {
      console.error("Error fetching project:", error);
      Alert.alert("오류", "프로젝트 정보를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id, profile?.id]);

  // 화면 포커스될 때마다 데이터 새로고침
  useFocusEffect(
    useCallback(() => {
      fetchProject();
    }, [fetchProject])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProject();
  }, [fetchProject]);

  const handleApply = async (minorProjectId: string) => {
    if (!profile?.id) return;

    try {
      const { error } = await supabase.from("onul_project_participants").insert({
        minor_project_id: minorProjectId,
        master_id: profile.id,
        status: "applied",
        applied_at: new Date().toISOString(),
      });

      if (error) throw error;

      Alert.alert("완료", "신청이 완료되었습니다.");
      fetchProject();
    } catch (error: any) {
      if (error.code === "23505") {
        Alert.alert("알림", "이미 신청한 프로젝트입니다.");
      } else {
        console.error("Apply error:", error);
        Alert.alert("오류", "신청 중 오류가 발생했습니다.");
      }
    }
  };

  const handleCancelApplication = async (minorProjectId: string) => {
    if (!profile?.id) return;

    Alert.alert("신청 취소", "정말로 신청을 취소하시겠습니까?", [
      { text: "아니오", style: "cancel" },
      {
        text: "예",
        style: "destructive",
        onPress: async () => {
          try {
            const { error } = await supabase
              .from("onul_project_participants")
              .update({ status: "withdrawn" })
              .eq("minor_project_id", minorProjectId)
              .eq("master_id", profile.id);

            if (error) throw error;

            Alert.alert("완료", "신청이 취소되었습니다.");
            fetchProject();
          } catch (error) {
            console.error("Cancel error:", error);
            Alert.alert("오류", "취소 중 오류가 발생했습니다.");
          }
        },
      },
    ]);
  };

  const handleDeleteProject = () => {
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      const { data, error } = await supabase
        .from("onul_major_projects")
        .delete()
        .eq("id", id)
        .select();

      if (error) throw error;

      // RLS에 의해 삭제가 거부된 경우 data가 비어있음
      if (!data || data.length === 0) {
        throw new Error("삭제 권한이 없거나 프로젝트를 찾을 수 없습니다.");
      }

      setDeleteModalVisible(false);
      showToast("프로젝트가 삭제되었습니다.", "success");
      router.back();
    } catch (error: any) {
      console.error("Delete error:", error);
      showToast(error.message || "삭제 중 오류가 발생했습니다.", "error");
      setDeleteModalVisible(false);
    } finally {
      setDeleting(false);
    }
  };

  const statusOptions = [
    { value: "draft", label: "초안", color: "bg-gray-100", textColor: "text-gray-600", borderColor: "#9CA3AF" },
    { value: "recruiting", label: "모집중", color: "bg-primary/10", textColor: "text-primary", borderColor: "#67c0a1" },
    { value: "in_progress", label: "진행중", color: "bg-blue-100", textColor: "text-blue-600", borderColor: "#3B82F6" },
    { value: "review", label: "검토중", color: "bg-amber-100", textColor: "text-amber-600", borderColor: "#F59E0B" },
    { value: "completed", label: "완료", color: "bg-surface", textColor: "text-muted", borderColor: "#6B7280" },
  ];

  const getStatusLabel = (status: string) => {
    const found = statusOptions.find(s => s.value === status);
    if (found) {
      return { label: found.label, color: found.color, textColor: found.textColor };
    }
    return { label: status, color: "bg-surface", textColor: "text-muted" };
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!id || !canManage) return;

    setUpdatingStatus(true);
    try {
      const { error } = await supabase
        .from("onul_major_projects")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      // 로컬 상태 업데이트
      setProject(prev => prev ? { ...prev, status: newStatus } : null);
      setStatusModalVisible(false);
      showToast("상태가 변경되었습니다.", "success");
    } catch (error) {
      console.error("Status update error:", error);
      showToast("상태 변경 중 오류가 발생했습니다.", "error");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getParticipationButton = (mp: MinorProject) => {
    const approvedCount = mp.participants.filter((p) => p.status === "approved").length;
    const isFull = approvedCount >= (mp.required_masters ?? 0);

    if (mp.my_participation_status === "applied") {
      return (
        <Pressable
          onPress={() => handleCancelApplication(mp.id)}
          className="bg-amber-100 py-2 px-4 rounded-lg"
        >
          <Text className="text-amber-600 font-medium text-sm">신청 취소</Text>
        </Pressable>
      );
    }

    if (mp.my_participation_status === "approved") {
      return (
        <View className="bg-primary/10 py-2 px-4 rounded-lg">
          <Text className="text-primary font-medium text-sm">참가 확정</Text>
        </View>
      );
    }

    if (isFull) {
      return (
        <View className="bg-surface py-2 px-4 rounded-lg">
          <Text className="text-muted font-medium text-sm">마감</Text>
        </View>
      );
    }

    if (mp.status !== "recruiting") {
      return null;
    }

    return (
      <Pressable
        onPress={() => handleApply(mp.id)}
        className="bg-primary py-2 px-4 rounded-lg active:opacity-80"
      >
        <Text className="text-white font-medium text-sm">신청</Text>
      </Pressable>
    );
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

  const projectStatus = getStatusLabel(project.status ?? "");

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
            <View className="flex-row items-center gap-2">
              {canManage ? (
                <Pressable
                  onPress={() => setStatusModalVisible(true)}
                  className={`${projectStatus.color} px-3 py-1 rounded-full active:opacity-70`}
                >
                  <Text className={`${projectStatus.textColor} text-sm font-medium`}>
                    {projectStatus.label} ▼
                  </Text>
                </Pressable>
              ) : (
                <View className={`${projectStatus.color} px-3 py-1 rounded-full`}>
                  <Text className={`${projectStatus.textColor} text-sm font-medium`}>
                    {projectStatus.label}
                  </Text>
                </View>
              )}
              {canManage && (
                <Pressable
                  onPress={() => setSettingsModalVisible(true)}
                  className="w-8 h-8 items-center justify-center rounded-full active:bg-surface"
                >
                  <MoreHorizontal size={20} color="#6B7280" />
                </Pressable>
              )}
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

          {/* 작업범위 & 특이사항 */}
          {(project.work_scope || project.notes) && (
            <View className="mt-4 pt-4 border-t border-border gap-3">
              {project.work_scope && (
                <View>
                  <Text className="text-sm font-medium text-foreground mb-1">작업범위</Text>
                  <Text className="text-muted text-sm">{project.work_scope}</Text>
                </View>
              )}
              {project.notes && (
                <View>
                  <Text className="text-sm font-medium text-foreground mb-1">특이사항</Text>
                  <Text className="text-muted text-sm">{project.notes}</Text>
                </View>
              )}
            </View>
          )}

        </View>

        {/* 마스터 모집 섹션 */}
        {canManage && project.status === "recruiting" && (
          <View className="px-6 mt-6">
            <View className="bg-primary/5 border border-primary/20 rounded-xl p-4">
              <View className="flex-row items-center mb-3">
                <Megaphone size={20} color="#67c0a1" />
                <Text className="text-foreground font-bold ml-2">마스터 모집</Text>
              </View>
              <Text className="text-muted text-sm mb-4">
                이 프로젝트는 현재 마스터를 모집 중입니다. 마스터들이 소형 프로젝트에 신청할 수 있습니다.
              </Text>
              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => router.push(`/master/add?projectId=${id}`)}
                  className="flex-1 flex-row items-center justify-center bg-primary py-3 rounded-xl active:opacity-80"
                >
                  <UserPlus size={18} color="#FFFFFF" />
                  <Text className="text-white font-medium ml-2">마스터 직접 추가</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}

        {/* 작업 범위 (소형 프로젝트) 목록 */}
        <View className="px-6 mt-6 mb-8">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold text-foreground">
              작업 범위 ({minorProjects.length})
            </Text>
            {canManage && (
              <Pressable
                onPress={() => router.push(`/project/minor/create?majorId=${id}`)}
                className="flex-row items-center"
              >
                <Plus size={18} color="#67c0a1" />
                <Text className="text-primary font-medium ml-1">추가</Text>
              </Pressable>
            )}
          </View>

          {minorProjects.length > 0 ? (
            <View className="gap-3">
              {minorProjects.map((mp) => {
                const mpStatus = getStatusLabel(mp.status ?? "");
                const approvedCount = mp.participants.filter(
                  (p) => p.status === "approved"
                ).length;

                return (
                  <Pressable
                    key={mp.id}
                    onPress={() => router.push(`/project/minor/${mp.id}`)}
                    className="bg-white border border-border rounded-xl p-4 active:bg-surface"
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

                    <View className="flex-row items-center mb-3">
                      <Users size={14} color="#6B7280" />
                      <Text className="text-muted text-sm ml-1">
                        {approvedCount}/{mp.required_masters}명
                      </Text>
                      {mp.participants
                        .filter((p) => p.status === "approved")
                        .slice(0, 3)
                        .map((p, i) => (
                          <Text key={i} className="text-muted text-sm ml-2">
                            {p.master_name}
                          </Text>
                        ))}
                    </View>

                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <Text className="text-primary text-sm font-medium">
                          상세보기
                        </Text>
                        <ChevronRight size={14} color="#67c0a1" />
                      </View>

                      {profile?.role === "master" && !isProjectOwner && getParticipationButton(mp)}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <View className="bg-white border border-border rounded-xl p-8 items-center">
              <Text className="text-muted">등록된 소형 프로젝트가 없습니다</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 채팅방 버튼 */}
      {project.status === "in_progress" && (
        <Pressable
          onPress={() => router.push(`/chat/${id}`)}
          className="absolute bottom-6 right-6 w-14 h-14 bg-primary rounded-full items-center justify-center shadow-lg active:opacity-80"
        >
          <MessageCircle size={24} color="#FFFFFF" />
        </Pressable>
      )}

      {/* 삭제 확인 Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <View className="items-center mb-4">
              <View className="w-12 h-12 bg-red-100 rounded-full items-center justify-center mb-3">
                <AlertTriangle size={24} color="#DC2626" />
              </View>
              <Text className="text-lg font-bold text-foreground">프로젝트 삭제</Text>
            </View>
            <Text className="text-muted text-center mb-6">
              정말로 이 프로젝트를 삭제하시겠습니까?{"\n"}
              삭제된 프로젝트는 복구할 수 없습니다.
            </Text>
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setDeleteModalVisible(false)}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl bg-surface items-center"
              >
                <Text className="text-foreground font-medium">취소</Text>
              </Pressable>
              <Pressable
                onPress={confirmDelete}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl bg-red-600 items-center"
              >
                {deleting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text className="text-white font-medium">삭제</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* 설정 BottomSheet (관리자용) */}
      <BottomSheet
        visible={settingsModalVisible}
        onClose={() => setSettingsModalVisible(false)}
        title="프로젝트 관리"
      >
        <Pressable
          onPress={() => {
            setSettingsModalVisible(false);
            router.push(`/project/edit/${id}`);
          }}
          className="flex-row items-center py-4 border-b border-border"
        >
          <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center">
            <Edit3 size={20} color="#3B82F6" />
          </View>
          <View className="ml-4 flex-1">
            <Text className="text-foreground font-medium">프로젝트 수정</Text>
            <Text className="text-muted text-sm">제목, 설명, 작업범위 등 수정</Text>
          </View>
          <ChevronRight size={20} color="#9CA3AF" />
        </Pressable>

        <Pressable
          onPress={() => {
            setSettingsModalVisible(false);
            handleDeleteProject();
          }}
          className="flex-row items-center py-4"
        >
          <View className="w-10 h-10 bg-red-100 rounded-full items-center justify-center">
            <Trash2 size={20} color="#DC2626" />
          </View>
          <View className="ml-4 flex-1">
            <Text className="text-red-600 font-medium">프로젝트 삭제</Text>
            <Text className="text-muted text-sm">프로젝트와 모든 데이터 삭제</Text>
          </View>
          <ChevronRight size={20} color="#9CA3AF" />
        </Pressable>
      </BottomSheet>

      {/* 상태 변경 BottomSheet */}
      <BottomSheet
        visible={statusModalVisible}
        onClose={() => setStatusModalVisible(false)}
        title="상태 변경"
      >
        <View className="gap-2">
          {statusOptions.map((option) => {
            const isCurrentStatus = project?.status === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => handleStatusChange(option.value)}
                disabled={updatingStatus || isCurrentStatus}
                className={`flex-row items-center py-4 px-4 rounded-xl border ${
                  isCurrentStatus ? "border-2" : "border"
                }`}
                style={{
                  borderColor: isCurrentStatus ? option.borderColor : "#E5E7EB",
                  backgroundColor: isCurrentStatus ? option.color.includes("primary") ? "rgba(103, 192, 161, 0.1)" : "#F9FAFB" : "white",
                }}
              >
                <View
                  className="w-3 h-3 rounded-full mr-3"
                  style={{ backgroundColor: option.borderColor }}
                />
                <Text
                  className={`font-medium flex-1 ${
                    isCurrentStatus ? option.textColor : "text-foreground"
                  }`}
                >
                  {option.label}
                </Text>
                {isCurrentStatus && (
                  <Text className="text-muted text-sm">현재</Text>
                )}
                {updatingStatus && !isCurrentStatus && (
                  <ActivityIndicator size="small" color="#67c0a1" />
                )}
              </Pressable>
            );
          })}
        </View>
      </BottomSheet>
    </View>
  );
}
