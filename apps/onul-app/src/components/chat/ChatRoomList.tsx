import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { ChevronRight, MessageCircle } from "lucide-react-native";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";

export interface ChatRoom {
  minor_project_id: string;
  project_title: string;
  major_project_title: string | null;
  project_status: string | null;
  last_message: string | null;
  last_message_sender: string | null;
  last_message_time: string | null;
  unread_count: number;
}

interface ChatRoomListProps {
  selectedRoomId?: string | null;
  onSelectRoom: (roomId: string) => void;
  showChevron?: boolean;
}

export default function ChatRoomList({
  selectedRoomId,
  onSelectRoom,
  showChevron = true,
}: ChatRoomListProps) {
  const { profile } = useAuth();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchChatRooms = useCallback(async () => {
    if (!profile?.id) return;

    try {
      // 내가 참가 중인 프로젝트 조회
      let projectIds: string[] = [];

      if (profile.role === "super_admin" || profile.role === "project_manager") {
        // 관리자는 모든 프로젝트 볼 수 있음
        const { data: allProjects } = await supabase
          .from("onul_minor_projects")
          .select("id");

        projectIds = (allProjects || []).map((p) => p.id);
      } else {
        // 마스터는 참가 승인된 프로젝트만
        const { data: participations } = await supabase
          .from("onul_project_participants")
          .select("minor_project_id")
          .eq("master_id", profile.id)
          .eq("status", "approved");

        projectIds = (participations || []).map((p) => p.minor_project_id);
      }

      if (projectIds.length === 0) {
        setChatRooms([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // 각 프로젝트의 채팅방 정보 조회
      const roomsPromises = projectIds.map(async (projectId) => {
        // 프로젝트 정보
        const { data: project } = await supabase
          .from("onul_minor_projects")
          .select(`
            id,
            title,
            status,
            onul_major_projects (title)
          `)
          .eq("id", projectId)
          .single();

        // 마지막 메시지
        const { data: lastMsg } = await supabase
          .from("onul_chat_messages")
          .select(`
            message,
            created_at,
            sender:sender_id (name)
          `)
          .eq("minor_project_id", projectId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        // 안 읽은 메시지 수 계산 (Supabase 함수 사용)
        let unreadCount = 0;
        try {
          const { data: countData } = await supabase.rpc("get_unread_message_count", {
            p_minor_project_id: projectId,
            p_user_id: profile.id,
          });
          unreadCount = countData || 0;
        } catch (e) {
          // 함수 호출 실패 시 0으로 처리
          console.error("Error getting unread count:", e);
        }

        return {
          minor_project_id: projectId,
          project_title: project?.title || "프로젝트",
          major_project_title: (project?.onul_major_projects as any)?.title || null,
          project_status: project?.status || null,
          last_message: lastMsg?.message || null,
          last_message_sender: (lastMsg?.sender as any)?.name || null,
          last_message_time: lastMsg?.created_at || null,
          unread_count: unreadCount,
        };
      });

      const rooms = await Promise.all(roomsPromises);

      // 마지막 메시지 시간으로 정렬
      rooms.sort((a, b) => {
        if (!a.last_message_time && !b.last_message_time) return 0;
        if (!a.last_message_time) return 1;
        if (!b.last_message_time) return -1;
        return (
          new Date(b.last_message_time).getTime() -
          new Date(a.last_message_time).getTime()
        );
      });

      setChatRooms(rooms);
    } catch (error) {
      console.error("Error fetching chat rooms:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [profile]);

  useEffect(() => {
    fetchChatRooms();
  }, [fetchChatRooms]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchChatRooms();
  }, [fetchChatRooms]);

  const formatTime = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (days === 1) {
      return "어제";
    } else if (days < 7) {
      const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
      return weekdays[date.getDay()] + "요일";
    } else {
      return date.toLocaleDateString("ko-KR", {
        month: "numeric",
        day: "numeric",
      });
    }
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
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#67c0a1"
        />
      }
    >
      <View className="px-4 py-4">
        {chatRooms.length > 0 ? (
          <View className="gap-2">
            {chatRooms.map((room) => {
              const isCompleted = room.project_status === "completed";
              const isSelected = selectedRoomId === room.minor_project_id;

              return (
                <Pressable
                  key={room.minor_project_id}
                  onPress={() => onSelectRoom(room.minor_project_id)}
                  className={`border rounded-xl p-3 active:opacity-80 ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : isCompleted
                      ? "border-border bg-surface"
                      : "border-border bg-white"
                  }`}
                >
                  <View className="flex-row justify-between items-center">
                    <View className="flex-1">
                      <View className="flex-row items-center">
                        <Text
                          className={`font-semibold text-sm ${
                            isSelected
                              ? "text-primary"
                              : isCompleted
                              ? "text-muted"
                              : "text-foreground"
                          }`}
                          numberOfLines={1}
                        >
                          {room.project_title}
                        </Text>
                        {room.unread_count > 0 && (
                          <View className="bg-primary w-5 h-5 rounded-full items-center justify-center ml-2">
                            <Text className="text-white text-xs font-bold">
                              {room.unread_count}
                            </Text>
                          </View>
                        )}
                        {isCompleted && (
                          <View className="bg-border px-2 py-0.5 rounded ml-2">
                            <Text className="text-muted text-xs">완료</Text>
                          </View>
                        )}
                      </View>

                      {room.major_project_title && (
                        <Text
                          className={`text-xs mt-0.5 ${
                            isCompleted ? "text-muted/60" : "text-muted"
                          }`}
                          numberOfLines={1}
                        >
                          {room.major_project_title}
                        </Text>
                      )}

                      {room.last_message ? (
                        <Text
                          className={`text-xs mt-1 ${
                            isCompleted ? "text-muted/60" : "text-muted"
                          }`}
                          numberOfLines={1}
                        >
                          {room.last_message_sender
                            ? `${room.last_message_sender}: `
                            : ""}
                          {room.last_message}
                        </Text>
                      ) : (
                        <Text className="text-muted/60 text-xs mt-1">
                          아직 메시지가 없습니다
                        </Text>
                      )}

                      {room.last_message_time && (
                        <Text
                          className={`text-xs mt-1 ${
                            isCompleted ? "text-muted/40" : "text-muted/60"
                          }`}
                        >
                          {formatTime(room.last_message_time)}
                        </Text>
                      )}
                    </View>
                    {showChevron && (
                      <ChevronRight
                        size={18}
                        color={isSelected ? "#67c0a1" : isCompleted ? "#D1D5DB" : "#9CA3AF"}
                      />
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <View className="items-center py-12">
            <View className="w-16 h-16 bg-surface rounded-full items-center justify-center mb-3">
              <MessageCircle size={28} color="#9CA3AF" />
            </View>
            <Text className="text-muted text-center text-sm">
              참가 중인 프로젝트가 없습니다
            </Text>
            <Text className="text-muted/60 text-xs text-center mt-1">
              프로젝트에 참가하면 채팅방이 생성됩니다
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
