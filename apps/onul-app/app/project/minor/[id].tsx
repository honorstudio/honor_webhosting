import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  RefreshControl,
  TextInput,
  Modal,
  Image,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Camera,
  Images,
  CheckCircle2,
  X,
  Edit3,
  Trash2,
  ChevronDown,
  ChevronUp,
  ArrowLeftRight,
} from "lucide-react-native";
import { useAuth } from "../../../src/contexts/AuthContext";
import { supabase } from "../../../src/lib/supabase";

const { width } = Dimensions.get("window");
const imageSize = (width - 48 - 8) / 2; // 2열 그리드

interface Participant {
  id: string;
  master_id: string;
  status: string;
  applied_at: string | null;
  approved_at: string | null;
  completed_at: string | null;
  notes: string | null;
  completion_notes: string | null;
  master: {
    name: string | null;
    phone: string | null;
  } | null;
}

interface MinorProject {
  id: string;
  title: string | null;
  description: string | null;
  status: string | null;
  required_masters: number | null;
  work_scope: string | null;
  notes: string | null;
  major_project: {
    id: string;
    title: string;
  } | null;
}

interface Photo {
  id: string;
  photo_type: string;
  photo_url: string;
  work_area: string | null;
  description: string | null;
  created_at: string | null;
  uploader: {
    name: string | null;
  } | null;
}

export default function MinorProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { profile } = useAuth();
  const [project, setProject] = useState<MinorProject | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);

  // 완료 처리 모달
  const [completionModalVisible, setCompletionModalVisible] = useState(false);
  const [completionNotes, setCompletionNotes] = useState("");
  const [completingParticipantId, setCompletingParticipantId] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);

  const isAdmin =
    profile?.role === "super_admin" || profile?.role === "project_manager";

  const fetchProject = useCallback(async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from("onul_minor_projects")
        .select(`
          *,
          onul_major_projects (
            id,
            title
          ),
          onul_project_participants (
            id,
            master_id,
            status,
            applied_at,
            approved_at,
            completed_at,
            notes,
            completion_notes,
            master:master_id (
              name,
              phone
            )
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;

      setProject({
        id: data.id,
        title: data.title,
        description: data.description,
        status: data.status,
        required_masters: data.required_masters,
        work_scope: data.work_scope,
        notes: data.notes,
        major_project: data.onul_major_projects,
      });

      setParticipants(
        (data.onul_project_participants || []).map((p: any) => ({
          ...p,
          master: p.master,
        }))
      );

      // 사진 목록 조회
      const { data: photoData, error: photoError } = await supabase
        .from("onul_project_photos")
        .select(`
          id,
          photo_type,
          photo_url,
          work_area,
          description,
          created_at,
          uploader:uploader_id (
            name
          )
        `)
        .eq("minor_project_id", id)
        .order("created_at", { ascending: false });

      if (photoError) throw photoError;

      setPhotos(photoData || []);
    } catch (error) {
      console.error("Error fetching minor project:", error);
      Alert.alert("오류", "프로젝트 정보를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProject();
  }, [fetchProject]);

  const handleApprove = async (participantId: string) => {
    try {
      const { error } = await supabase
        .from("onul_project_participants")
        .update({
          status: "approved",
          approved_at: new Date().toISOString(),
        })
        .eq("id", participantId);

      if (error) throw error;

      Alert.alert("완료", "참가가 승인되었습니다.");
      fetchProject();
    } catch (error) {
      console.error("Approve error:", error);
      Alert.alert("오류", "승인 중 오류가 발생했습니다.");
    }
  };

  const handleReject = async (participantId: string) => {
    Alert.alert("참가 거절", "정말로 이 신청을 거절하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "거절",
        style: "destructive",
        onPress: async () => {
          try {
            const { error } = await supabase
              .from("onul_project_participants")
              .update({ status: "rejected" })
              .eq("id", participantId);

            if (error) throw error;

            Alert.alert("완료", "신청이 거절되었습니다.");
            fetchProject();
          } catch (error) {
            console.error("Reject error:", error);
            Alert.alert("오류", "거절 중 오류가 발생했습니다.");
          }
        },
      },
    ]);
  };

  // 완료 처리 모달 열기
  const openCompletionModal = (participantId: string) => {
    setCompletingParticipantId(participantId);
    setCompletionNotes("");
    setCompletionModalVisible(true);
  };

  // 작업 완료 처리
  const handleComplete = async () => {
    if (!completingParticipantId) return;

    setCompleting(true);
    try {
      const { error } = await supabase
        .from("onul_project_participants")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          completion_notes: completionNotes.trim() || null,
        })
        .eq("id", completingParticipantId);

      if (error) throw error;

      Alert.alert("완료", "작업이 완료 처리되었습니다.");
      setCompletionModalVisible(false);
      fetchProject();
    } catch (error) {
      console.error("Complete error:", error);
      Alert.alert("오류", "완료 처리 중 오류가 발생했습니다.");
    } finally {
      setCompleting(false);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "applied":
        return { label: "신청중", color: "text-amber-600", bg: "bg-amber-100" };
      case "approved":
        return { label: "승인됨", color: "text-primary", bg: "bg-primary/10" };
      case "rejected":
        return { label: "거절됨", color: "text-red-500", bg: "bg-red-100" };
      case "withdrawn":
        return { label: "취소됨", color: "text-muted", bg: "bg-surface" };
      case "completed":
        return { label: "완료", color: "text-blue-600", bg: "bg-blue-100" };
      default:
        return { label: status, color: "text-muted", bg: "bg-surface" };
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

  const approvedCount = participants.filter((p) => p.status === "approved").length;
  const appliedCount = participants.filter((p) => p.status === "applied").length;
  const beforePhotos = photos.filter((p) => p.photo_type === "before");
  const afterPhotos = photos.filter((p) => p.photo_type === "after");

  // 마스터 또는 관리자 여부 확인
  const isParticipant =
    profile?.role === "super_admin" ||
    profile?.role === "project_manager" ||
    (profile?.role === "master" &&
      participants.some(
        (p) => p.master_id === profile.id && p.status === "approved"
      ));

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
        {/* 프로젝트 정보 */}
        <View className="bg-white px-6 py-6 border-b border-border">
          <Text className="text-muted text-sm mb-1">
            {project.major_project?.title}
          </Text>
          <Text className="text-2xl font-bold text-foreground mb-3">
            {project.title}
          </Text>

          {project.description && (
            <Text className="text-muted mb-4">{project.description}</Text>
          )}

          {/* 참가자 수 - 클릭시 목록 토글 */}
          <Pressable
            onPress={() => setShowParticipants(!showParticipants)}
            className="flex-row items-center mb-4 bg-surface rounded-xl px-4 py-3 active:opacity-80"
          >
            <Users size={18} color="#6B7280" />
            <Text className="text-foreground ml-2 flex-1">
              참가자 {approvedCount}/{project.required_masters}명
              {appliedCount > 0 && (
                <Text className="text-amber-600">
                  {" "}(신청 대기 {appliedCount}명)
                </Text>
              )}
            </Text>
            {showParticipants ? (
              <ChevronUp size={18} color="#6B7280" />
            ) : (
              <ChevronDown size={18} color="#6B7280" />
            )}
          </Pressable>

          {/* 참가자 목록 (토글) */}
          {showParticipants && (
            <View className="gap-2 mb-4">
              {participants.length > 0 ? (
                participants.map((participant) => {
                  const status = getStatusLabel(participant.status);
                  return (
                    <View
                      key={participant.id}
                      className="bg-white border border-border rounded-xl p-4"
                    >
                      <View className="flex-row items-center justify-between mb-2">
                        <View className="flex-row items-center flex-1">
                          <View className="w-10 h-10 rounded-full bg-surface items-center justify-center">
                            <Users size={20} color="#6B7280" />
                          </View>
                          <View className="ml-3 flex-1">
                            <Text className="text-foreground font-medium">
                              {participant.master?.name || "이름 없음"}
                            </Text>
                            {isAdmin && participant.master?.phone && (
                              <Text className="text-muted text-sm">
                                {participant.master.phone}
                              </Text>
                            )}
                          </View>
                        </View>
                        <View className={`${status.bg} px-2 py-1 rounded-full`}>
                          <Text className={`${status.color} text-xs font-medium`}>
                            {status.label}
                          </Text>
                        </View>
                      </View>

                      {/* 관리자용 승인/거절 버튼 */}
                      {isAdmin && participant.status === "applied" && (
                        <View className="flex-row gap-2 mt-3 pt-3 border-t border-border">
                          <Pressable
                            onPress={() => handleApprove(participant.id)}
                            className="flex-1 flex-row items-center justify-center bg-primary py-2 rounded-lg active:opacity-80"
                          >
                            <CheckCircle size={16} color="#FFFFFF" />
                            <Text className="text-white font-medium ml-1">
                              승인
                            </Text>
                          </Pressable>
                          <Pressable
                            onPress={() => handleReject(participant.id)}
                            className="flex-1 flex-row items-center justify-center bg-red-500 py-2 rounded-lg active:opacity-80"
                          >
                            <XCircle size={16} color="#FFFFFF" />
                            <Text className="text-white font-medium ml-1">
                              거절
                            </Text>
                          </Pressable>
                        </View>
                      )}

                      {/* 마스터용 작업 완료 버튼 */}
                      {participant.status === "approved" &&
                        participant.master_id === profile?.id && (
                          <Pressable
                            onPress={() => openCompletionModal(participant.id)}
                            className="flex-row items-center justify-center bg-blue-500 py-2 rounded-lg mt-3 active:opacity-80"
                          >
                            <CheckCircle2 size={16} color="#FFFFFF" />
                            <Text className="text-white font-medium ml-1">
                              작업 완료
                            </Text>
                          </Pressable>
                        )}

                      {/* 완료 코멘트 표시 */}
                      {participant.status === "completed" && participant.completion_notes && (
                        <View className="bg-blue-50 rounded-lg p-3 mt-3">
                          <Text className="text-blue-600 text-xs mb-1">완료 코멘트</Text>
                          <Text className="text-foreground text-sm">
                            {participant.completion_notes}
                          </Text>
                        </View>
                      )}

                      {/* 시간 정보 */}
                      <View className="flex-row flex-wrap items-center gap-3 mt-2">
                        {participant.applied_at && (
                          <View className="flex-row items-center">
                            <Clock size={12} color="#9CA3AF" />
                            <Text className="text-muted text-xs ml-1">
                              신청:{" "}
                              {new Date(participant.applied_at).toLocaleDateString(
                                "ko-KR"
                              )}
                            </Text>
                          </View>
                        )}
                        {participant.completed_at && (
                          <View className="flex-row items-center">
                            <CheckCircle2 size={12} color="#3B82F6" />
                            <Text className="text-blue-500 text-xs ml-1">
                              완료:{" "}
                              {new Date(participant.completed_at).toLocaleDateString(
                                "ko-KR"
                              )}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  );
                })
              ) : (
                <View className="bg-white border border-border rounded-xl p-6 items-center">
                  <Text className="text-muted">아직 참가자가 없습니다</Text>
                </View>
              )}
            </View>
          )}

          {project.work_scope && (
            <View className="bg-surface rounded-xl p-4 mb-3">
              <Text className="text-muted text-sm mb-1">작업 범위</Text>
              <Text className="text-foreground">{project.work_scope}</Text>
            </View>
          )}

          {project.notes && (
            <View className="bg-amber-50 rounded-xl p-4">
              <Text className="text-amber-600 text-sm mb-1">특이사항</Text>
              <Text className="text-foreground">{project.notes}</Text>
            </View>
          )}
        </View>

        {/* 작업 상세 (사진 목록) */}
        <View className="px-6 mt-6 mb-24">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold text-foreground">
              작업 상세
            </Text>
            {/* 비교 버튼 */}
            {beforePhotos.length > 0 && afterPhotos.length > 0 && (
              <Pressable
                onPress={() => router.push(`/photo/compare?minorId=${id}`)}
                className="flex-row items-center bg-purple-100 px-3 py-1.5 rounded-full active:opacity-80"
              >
                <ArrowLeftRight size={14} color="#9333EA" />
                <Text className="text-purple-600 text-sm font-medium ml-1">비교</Text>
              </Pressable>
            )}
          </View>

          {/* 사진 통계 */}
          <View className="flex-row gap-3 mb-4">
            <View className="flex-1 bg-blue-50 rounded-xl p-3 items-center">
              <Text className="text-blue-600 font-bold text-xl">
                {beforePhotos.length}
              </Text>
              <Text className="text-blue-600 text-sm">비포</Text>
            </View>
            <View className="flex-1 bg-green-50 rounded-xl p-3 items-center">
              <Text className="text-green-600 font-bold text-xl">
                {afterPhotos.length}
              </Text>
              <Text className="text-green-600 text-sm">애프터</Text>
            </View>
          </View>

          {/* 사진 목록 - 작업영역별 비포/애프터 쌍으로 표시 */}
          {photos.length > 0 ? (
            <View className="gap-6">
              {/* 작업영역별로 그룹화 */}
              {(() => {
                // 작업영역별로 사진 그룹화
                const groupedByArea: { [key: string]: { before: Photo[], after: Photo[] } } = {};

                photos.forEach((photo) => {
                  const area = photo.work_area || "기타";
                  if (!groupedByArea[area]) {
                    groupedByArea[area] = { before: [], after: [] };
                  }
                  if (photo.photo_type === "before") {
                    groupedByArea[area].before.push(photo);
                  } else {
                    groupedByArea[area].after.push(photo);
                  }
                });

                return Object.entries(groupedByArea).map(([area, { before, after }]) => (
                  <View key={area} className="bg-white border border-border rounded-xl overflow-hidden">
                    {/* 작업 영역 헤더 */}
                    <View className="bg-surface px-4 py-3 border-b border-border">
                      <Text className="text-foreground font-bold">{area}</Text>
                      <Text className="text-muted text-xs">
                        비포 {before.length}장 / 애프터 {after.length}장
                      </Text>
                    </View>

                    {/* 비포/애프터 쌍 */}
                    <View className="p-4">
                      {/* 비포/애프터 이미지 나란히 */}
                      <View className="flex-row gap-2 mb-4">
                        {/* 비포 */}
                        <View className="flex-1">
                          <Text className="text-blue-600 font-medium text-sm mb-2 text-center">비포</Text>
                          {before.length > 0 ? (
                            <View className="relative">
                              <Image
                                source={{ uri: before[0].photo_url }}
                                style={{ width: "100%", height: 120, borderRadius: 8 }}
                                resizeMode="cover"
                              />
                              {before.length > 1 && (
                                <View className="absolute bottom-1 right-1 bg-black/60 px-2 py-0.5 rounded">
                                  <Text className="text-white text-xs">+{before.length - 1}</Text>
                                </View>
                              )}
                            </View>
                          ) : (
                            <View className="bg-blue-50 rounded-lg items-center justify-center" style={{ height: 120 }}>
                              <Text className="text-blue-400 text-xs">사진 없음</Text>
                            </View>
                          )}
                        </View>

                        {/* 화살표 */}
                        <View className="items-center justify-center px-1">
                          <ArrowLeftRight size={20} color="#9CA3AF" />
                        </View>

                        {/* 애프터 */}
                        <View className="flex-1">
                          <Text className="text-green-600 font-medium text-sm mb-2 text-center">애프터</Text>
                          {after.length > 0 ? (
                            <View className="relative">
                              <Image
                                source={{ uri: after[0].photo_url }}
                                style={{ width: "100%", height: 120, borderRadius: 8 }}
                                resizeMode="cover"
                              />
                              {after.length > 1 && (
                                <View className="absolute bottom-1 right-1 bg-black/60 px-2 py-0.5 rounded">
                                  <Text className="text-white text-xs">+{after.length - 1}</Text>
                                </View>
                              )}
                            </View>
                          ) : (
                            <View className="bg-green-50 rounded-lg items-center justify-center" style={{ height: 120 }}>
                              <Text className="text-green-400 text-xs">사진 없음</Text>
                            </View>
                          )}
                        </View>
                      </View>

                      {/* 업로더 정보 및 설명 */}
                      <View className="gap-2">
                        {[...before, ...after]
                          .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
                          .slice(0, 3)
                          .map((photo) => (
                          <View key={photo.id} className="flex-row items-start bg-surface rounded-lg p-3">
                            <View className={`px-1.5 py-0.5 rounded mr-2 ${
                              photo.photo_type === "before" ? "bg-blue-100" : "bg-green-100"
                            }`}>
                              <Text className={`text-xs font-medium ${
                                photo.photo_type === "before" ? "text-blue-600" : "text-green-600"
                              }`}>
                                {photo.photo_type === "before" ? "B" : "A"}
                              </Text>
                            </View>
                            <View className="flex-1">
                              <View className="flex-row items-center mb-1">
                                <Text className="text-foreground font-medium text-sm">
                                  {photo.uploader?.name || "알 수 없음"}
                                </Text>
                                <Text className="text-muted text-xs ml-2">
                                  {photo.created_at
                                    ? new Date(photo.created_at).toLocaleString("ko-KR", {
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : ""}
                                </Text>
                              </View>
                              {photo.description && (
                                <Text className="text-muted text-sm">{photo.description}</Text>
                              )}
                            </View>
                          </View>
                        ))}
                        {(before.length + after.length) > 3 && (
                          <Text className="text-muted text-xs text-center">
                            외 {before.length + after.length - 3}개 더보기
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                ));
              })()}
            </View>
          ) : (
            <View className="bg-white border border-border rounded-xl p-8 items-center">
              <View className="w-16 h-16 bg-surface rounded-full items-center justify-center mb-3">
                <Images size={28} color="#9CA3AF" />
              </View>
              <Text className="text-muted text-center mb-3">
                아직 등록된 사진이 없습니다
              </Text>
              {isParticipant && (
                <Pressable
                  onPress={() => router.push(`/photo/upload?minorId=${id}`)}
                  className="bg-primary px-6 py-3 rounded-xl active:opacity-80"
                >
                  <Text className="text-white font-semibold">사진 업로드</Text>
                </Pressable>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* 하단 사진 업로드 버튼 */}
      {isParticipant && photos.length > 0 && (
        <Pressable
          onPress={() => router.push(`/photo/upload?minorId=${id}`)}
          className="absolute bottom-6 right-6 w-14 h-14 bg-primary rounded-full items-center justify-center shadow-lg active:opacity-80"
        >
          <Camera size={24} color="#FFFFFF" />
        </Pressable>
      )}

      {/* 작업 완료 모달 */}
      <Modal
        visible={completionModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCompletionModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <View className="bg-white rounded-2xl w-full max-w-md p-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-foreground font-bold text-lg">
                작업 완료
              </Text>
              <Pressable
                onPress={() => setCompletionModalVisible(false)}
                className="p-1"
              >
                <X size={24} color="#6B7280" />
              </Pressable>
            </View>

            <Text className="text-muted mb-4">
              작업 완료 시 코멘트를 남길 수 있습니다. (선택사항)
            </Text>

            <TextInput
              value={completionNotes}
              onChangeText={setCompletionNotes}
              placeholder="작업 내용이나 특이사항을 입력하세요"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground mb-4"
              style={{ minHeight: 100, textAlignVertical: "top" }}
            />

            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setCompletionModalVisible(false)}
                className="flex-1 py-3 rounded-xl border border-border items-center"
              >
                <Text className="text-muted font-medium">취소</Text>
              </Pressable>
              <Pressable
                onPress={handleComplete}
                disabled={completing}
                className={`flex-1 py-3 rounded-xl items-center ${
                  completing ? "bg-blue-300" : "bg-blue-500 active:opacity-80"
                }`}
              >
                {completing ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text className="text-white font-medium">완료 처리</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
