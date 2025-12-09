import { useState } from "react";
import {
  View,
  Text,
  Platform,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { MessageCircle } from "lucide-react-native";
import ChatRoomList from "../../src/components/chat/ChatRoomList";
import ChatDetail from "../../src/components/chat/ChatDetail";

// PC에서 마스터-디테일 레이아웃을 사용할 최소 너비
const MASTER_DETAIL_MIN_WIDTH = 768;

export default function ChatScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  // PC 환경에서만 마스터-디테일 레이아웃 사용
  // Platform.OS와 전체 창 너비로 직접 판단
  const useMasterDetail = Platform.OS === "web" && width >= MASTER_DETAIL_MIN_WIDTH;
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedRoomTitle, setSelectedRoomTitle] = useState<string>("");

  // 채팅방 선택 핸들러
  const handleSelectRoom = (roomId: string) => {
    if (useMasterDetail) {
      // PC: 우측 패널에 채팅 표시
      setSelectedRoomId(roomId);
    } else {
      // 모바일: 페이지 이동
      router.push(`/chat/${roomId}`);
    }
  };

  // PC/태블릿: 마스터-디테일 레이아웃
  if (useMasterDetail) {
    return (
      <View className="flex-1 flex-row bg-background">
        {/* 좌측: 채팅방 목록 */}
        <View
          className="border-r border-border bg-white"
          style={{ width: 320 }}
        >
          <View className="px-4 py-3 border-b border-border">
            <Text className="text-lg font-semibold text-foreground">채팅</Text>
          </View>
          <ChatRoomList
            selectedRoomId={selectedRoomId}
            onSelectRoom={handleSelectRoom}
            showChevron={false}
          />
        </View>

        {/* 우측: 채팅 상세 */}
        <View className="flex-1 bg-background">
          {selectedRoomId ? (
            <View className="flex-1">
              {/* 채팅 헤더 */}
              <View className="px-4 py-3 border-b border-border bg-white">
                <Text className="text-lg font-semibold text-foreground">
                  {selectedRoomTitle || "채팅"}
                </Text>
              </View>
              {/* 채팅 내용 */}
              <ChatDetail
                projectId={selectedRoomId}
                onProjectInfoLoaded={(info) => setSelectedRoomTitle(info.title)}
              />
            </View>
          ) : (
            // 선택된 채팅방 없음
            <View className="flex-1 items-center justify-center">
              <View className="w-20 h-20 bg-surface rounded-full items-center justify-center mb-4">
                <MessageCircle size={32} color="#9CA3AF" />
              </View>
              <Text className="text-muted text-center">
                채팅방을 선택해주세요
              </Text>
              <Text className="text-muted/60 text-sm text-center mt-1">
                좌측 목록에서 프로젝트를 선택하면{"\n"}대화 내용이 여기에 표시됩니다
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  }

  // 모바일: 기존 목록 레이아웃
  return (
    <ChatRoomList
      onSelectRoom={handleSelectRoom}
      showChevron={true}
    />
  );
}
