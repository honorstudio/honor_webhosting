import { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  Alert,
  AppState,
} from "react-native";
import { useLocalSearchParams, useNavigation, useFocusEffect } from "expo-router";
import { Send, Image as ImageIcon, X, Check, CheckCheck } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../../src/contexts/AuthContext";
import { supabase } from "../../src/lib/supabase";
import { MINIO_CONFIG, generateFileName } from "../../src/lib/minio";

interface Message {
  id: string;
  sender_id: string;
  message: string | null;
  message_type: string | null;
  image_url: string | null;
  created_at: string | null;
  sender: {
    name: string | null;
  } | null;
}

interface ProjectInfo {
  title: string;
  major_project: {
    title: string;
  } | null;
}

export default function ChatRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const { profile } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [projectInfo, setProjectInfo] = useState<ProjectInfo | null>(null);
  const [selectedImage, setSelectedImage] = useState<{
    uri: string;
    type: string;
    name: string;
  } | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [otherUsersReadStatus, setOtherUsersReadStatus] = useState<{
    [key: string]: string; // user_id: last_read_at
  }>({});

  // 읽음 처리 함수 - 채팅방 입장 및 새 메시지 수신 시 호출
  const markAsRead = useCallback(async (lastMessageId?: string) => {
    if (!id || !profile?.id) return;

    try {
      await supabase.rpc("upsert_chat_read_status", {
        p_minor_project_id: id,
        p_user_id: profile.id,
        p_last_read_message_id: lastMessageId || null,
      });
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  }, [id, profile?.id]);

  // 다른 사용자들의 읽음 상태 조회 (내 메시지 읽음 표시용)
  const fetchOtherUsersReadStatus = useCallback(async () => {
    if (!id || !profile?.id) return;

    try {
      const { data, error } = await supabase
        .from("onul_chat_read_status")
        .select("user_id, last_read_at")
        .eq("minor_project_id", id)
        .neq("user_id", profile.id);

      if (error) throw error;

      const statusMap: { [key: string]: string } = {};
      data?.forEach((item) => {
        if (item.last_read_at) {
          statusMap[item.user_id] = item.last_read_at;
        }
      });
      setOtherUsersReadStatus(statusMap);
    } catch (error) {
      console.error("Error fetching read status:", error);
    }
  }, [id, profile?.id]);

  // 프로젝트 정보 및 메시지 불러오기
  const fetchData = useCallback(async () => {
    if (!id) return;

    try {
      // 프로젝트 정보
      const { data: project, error: projectError } = await supabase
        .from("onul_minor_projects")
        .select(`
          title,
          onul_major_projects (title)
        `)
        .eq("id", id)
        .single();

      if (projectError) throw projectError;

      setProjectInfo({
        title: project.title,
        major_project: project.onul_major_projects,
      });

      // 헤더 타이틀 설정
      navigation.setOptions({
        title: project.title || "채팅",
      });

      // 메시지 목록
      const { data: messagesData, error: messagesError } = await supabase
        .from("onul_chat_messages")
        .select(`
          id,
          sender_id,
          message,
          message_type,
          image_url,
          created_at,
          sender:sender_id (name)
        `)
        .eq("minor_project_id", id)
        .order("created_at", { ascending: true });

      if (messagesError) throw messagesError;

      setMessages(messagesData || []);
    } catch (error) {
      console.error("Error fetching chat data:", error);
    } finally {
      setLoading(false);
    }
  }, [id, navigation]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 화면 포커스 시 읽음 처리 및 읽음 상태 조회
  useFocusEffect(
    useCallback(() => {
      if (id && profile?.id && messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        markAsRead(lastMessage.id);
        fetchOtherUsersReadStatus();
      }
    }, [id, profile?.id, messages, markAsRead, fetchOtherUsersReadStatus])
  );

  // 앱 상태 변경 감지 (백그라운드 → 포그라운드)
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active" && messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        markAsRead(lastMessage.id);
        fetchOtherUsersReadStatus();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [messages, markAsRead, fetchOtherUsersReadStatus]);

  // Supabase Realtime 구독
  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`chat:${id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "onul_chat_messages",
          filter: `minor_project_id=eq.${id}`,
        },
        async (payload) => {
          // 새 메시지가 오면 sender 정보 포함해서 추가
          const newMsg = payload.new as any;

          // sender 이름 조회
          const { data: senderData } = await supabase
            .from("onul_profiles")
            .select("name")
            .eq("id", newMsg.sender_id)
            .single();

          const messageWithSender: Message = {
            ...newMsg,
            sender: senderData,
          };

          setMessages((prev) => [...prev, messageWithSender]);

          // 새 메시지가 오면 읽음 처리
          markAsRead(newMsg.id);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "onul_chat_read_status",
          filter: `minor_project_id=eq.${id}`,
        },
        () => {
          // 다른 사용자의 읽음 상태가 변경되면 갱신
          fetchOtherUsersReadStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, markAsRead, fetchOtherUsersReadStatus]);

  // 새 메시지가 오면 스크롤
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  // 이미지 선택
  const handlePickImage = async () => {
    try {
      // 권한 요청
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("권한 필요", "이미지를 선택하려면 갤러리 접근 권한이 필요합니다.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const fileName = generateFileName(asset.uri.split("/").pop() || "image.jpg");

        setSelectedImage({
          uri: asset.uri,
          type: asset.mimeType || "image/jpeg",
          name: fileName,
        });
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("오류", "이미지 선택 중 오류가 발생했습니다.");
    }
  };

  // 선택한 이미지 취소
  const handleCancelImage = () => {
    setSelectedImage(null);
  };

  // 이미지 업로드 (MinIO)
  const uploadImageToMinio = async (image: {
    uri: string;
    type: string;
    name: string;
  }): Promise<string | null> => {
    try {
      const path = `chat/${id}/${image.name}`;
      const url = `${MINIO_CONFIG.endpoint}/${MINIO_CONFIG.bucket}/${path}`;

      // Fetch image as blob
      const response = await fetch(image.uri);
      const blob = await response.blob();

      // Upload to MinIO
      const uploadResponse = await fetch(url, {
        method: "PUT",
        body: blob,
        headers: {
          "Content-Type": image.type,
        },
      });

      if (uploadResponse.ok) {
        return url;
      } else {
        console.error("MinIO upload failed:", uploadResponse.status);
        return null;
      }
    } catch (error) {
      console.error("Image upload error:", error);
      return null;
    }
  };

  // 메시지 전송
  const handleSend = async () => {
    if ((!newMessage.trim() && !selectedImage) || !id || !profile?.id) return;

    setSending(true);
    setUploadingImage(!!selectedImage);

    try {
      let imageUrl: string | null = null;
      let messageType = "text";

      // 이미지가 있으면 먼저 업로드
      if (selectedImage) {
        imageUrl = await uploadImageToMinio(selectedImage);
        if (!imageUrl) {
          // MinIO 업로드 실패 시 메타데이터만 저장 (URL 없이)
          Alert.alert(
            "알림",
            "이미지 업로드에 실패했습니다. 메시지만 전송됩니다."
          );
        } else {
          messageType = newMessage.trim() ? "text" : "image";
        }
      }

      const { error } = await supabase.from("onul_chat_messages").insert({
        minor_project_id: id,
        sender_id: profile.id,
        message: newMessage.trim() || (imageUrl ? "[이미지]" : ""),
        message_type: imageUrl ? "image" : "text",
        image_url: imageUrl,
      });

      if (error) throw error;

      setNewMessage("");
      setSelectedImage(null);
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert("오류", "메시지 전송 중 오류가 발생했습니다.");
    } finally {
      setSending(false);
      setUploadingImage(false);
    }
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // 날짜 구분선 표시 여부
  const shouldShowDateSeparator = (
    currentMsg: Message,
    prevMsg: Message | null
  ) => {
    if (!prevMsg) return true;
    const currentDate = new Date(currentMsg.created_at || "").toDateString();
    const prevDate = new Date(prevMsg.created_at || "").toDateString();
    return currentDate !== prevDate;
  };

  // 메시지 읽음 상태 확인 (내 메시지가 상대방에게 읽혔는지)
  const isMessageRead = (msg: Message): boolean => {
    if (!msg.created_at) return false;
    const msgTime = new Date(msg.created_at).getTime();

    // 상대방 중 한 명이라도 읽었으면 true
    return Object.values(otherUsersReadStatus).some((lastReadAt) => {
      const readTime = new Date(lastReadAt).getTime();
      return readTime >= msgTime;
    });
  };

  // 안 읽은 사용자 수 계산
  const getUnreadCount = (msg: Message): number => {
    if (!msg.created_at) return 0;
    const msgTime = new Date(msg.created_at).getTime();

    // 아직 안 읽은 사용자 수 계산
    const totalOthers = Object.keys(otherUsersReadStatus).length;
    const readCount = Object.values(otherUsersReadStatus).filter((lastReadAt) => {
      const readTime = new Date(lastReadAt).getTime();
      return readTime >= msgTime;
    }).length;

    // 읽음 상태가 없는 사용자는 안 읽은 것으로 처리
    // 참가자 수를 정확히 알 수 없으므로 간단히 처리
    return totalOthers > 0 ? totalOthers - readCount : 0;
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#67c0a1" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background"
      keyboardVerticalOffset={90}
    >
      {/* 메시지 목록 */}
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 px-4"
        contentContainerStyle={{ paddingVertical: 16 }}
        onContentSizeChange={() =>
          scrollViewRef.current?.scrollToEnd({ animated: false })
        }
      >
        {messages.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-muted text-center">
              아직 메시지가 없습니다.{"\n"}첫 메시지를 보내보세요!
            </Text>
          </View>
        ) : (
          messages.map((msg, index) => {
            const isMyMessage = msg.sender_id === profile?.id;
            const prevMsg = index > 0 ? messages[index - 1] : null;
            const showDateSeparator = shouldShowDateSeparator(msg, prevMsg);

            return (
              <View key={msg.id}>
                {/* 날짜 구분선 */}
                {showDateSeparator && (
                  <View className="flex-row items-center my-4">
                    <View className="flex-1 h-px bg-border" />
                    <Text className="text-muted text-xs mx-3">
                      {formatDate(msg.created_at)}
                    </Text>
                    <View className="flex-1 h-px bg-border" />
                  </View>
                )}

                {/* 메시지 */}
                <View
                  className={`mb-3 ${
                    isMyMessage ? "items-end" : "items-start"
                  }`}
                >
                  {/* 보낸 사람 이름 (상대방 메시지만) */}
                  {!isMyMessage && (
                    <Text className="text-muted text-xs mb-1 ml-1">
                      {msg.sender?.name || "알 수 없음"}
                    </Text>
                  )}

                  <View className="flex-row items-end gap-2">
                    {/* 시간 및 읽음 상태 (내 메시지는 왼쪽) */}
                    {isMyMessage && (
                      <View className="items-end">
                        {/* 읽음 상태 표시 */}
                        <View className="flex-row items-center mb-0.5">
                          {isMessageRead(msg) ? (
                            <CheckCheck size={14} color="#67c0a1" />
                          ) : (
                            <Check size={14} color="#9CA3AF" />
                          )}
                        </View>
                        <Text className="text-muted/60 text-xs">
                          {formatTime(msg.created_at)}
                        </Text>
                      </View>
                    )}

                    {/* 메시지 버블 */}
                    <View
                      className={`max-w-[75%] rounded-2xl overflow-hidden ${
                        isMyMessage
                          ? "bg-primary rounded-br-sm"
                          : "bg-white border border-border rounded-bl-sm"
                      }`}
                    >
                      {/* 이미지 메시지 */}
                      {msg.image_url ? (
                        <View>
                          <Image
                            source={{ uri: msg.image_url }}
                            className="w-48 h-48"
                            resizeMode="cover"
                          />
                          {msg.message && msg.message !== "[이미지]" && (
                            <View className="px-4 py-2">
                              <Text
                                className={
                                  isMyMessage ? "text-white" : "text-foreground"
                                }
                              >
                                {msg.message}
                              </Text>
                            </View>
                          )}
                        </View>
                      ) : (
                        // 텍스트 메시지
                        <View className="px-4 py-3">
                          <Text
                            className={
                              isMyMessage ? "text-white" : "text-foreground"
                            }
                          >
                            {msg.message}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* 시간 (상대방 메시지는 오른쪽) */}
                    {!isMyMessage && (
                      <Text className="text-muted/60 text-xs">
                        {formatTime(msg.created_at)}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* 선택한 이미지 미리보기 */}
      {selectedImage && (
        <View className="bg-white border-t border-border px-4 py-2">
          <View className="relative w-20 h-20">
            <Image
              source={{ uri: selectedImage.uri }}
              className="w-20 h-20 rounded-lg"
              resizeMode="cover"
            />
            <Pressable
              onPress={handleCancelImage}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full items-center justify-center"
            >
              <X size={14} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      )}

      {/* 입력창 */}
      <View className="bg-white border-t border-border px-4 py-3">
        <View className="flex-row items-end gap-3">
          {/* 이미지 버튼 */}
          <Pressable
            onPress={handlePickImage}
            disabled={sending}
            className="w-10 h-10 bg-surface border border-border rounded-full items-center justify-center mb-0.5 active:bg-gray-200"
          >
            <ImageIcon size={20} color={sending ? "#D1D5DB" : "#6B7280"} />
          </Pressable>

          {/* 텍스트 입력 */}
          <View className="flex-1 bg-surface border border-border rounded-xl px-4 py-2 min-h-[44px] max-h-[120px]">
            <TextInput
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="메시지를 입력하세요"
              placeholderTextColor="#9CA3AF"
              className="text-foreground"
              style={[
                {
                  minHeight: 28,
                  maxHeight: 100,
                  textAlignVertical: "center",
                },
                // 웹에서 포커스 outline 제거
                Platform.OS === "web" && {
                  outlineStyle: "none",
                } as any,
              ]}
              multiline
              maxLength={500}
              editable={!sending}
            />
          </View>

          {/* 전송 버튼 */}
          <Pressable
            onPress={handleSend}
            disabled={(!newMessage.trim() && !selectedImage) || sending}
            className={`w-10 h-10 rounded-full items-center justify-center mb-0.5 active:opacity-80 ${
              (newMessage.trim() || selectedImage) && !sending
                ? "bg-primary"
                : "bg-surface border border-border"
            }`}
          >
            {sending ? (
              <ActivityIndicator
                size="small"
                color={uploadingImage ? "#67c0a1" : "#FFFFFF"}
              />
            ) : (
              <Send
                size={18}
                color={newMessage.trim() || selectedImage ? "#FFFFFF" : "#9CA3AF"}
              />
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
