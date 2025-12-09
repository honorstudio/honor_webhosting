import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from "../../../src/lib/supabase";

export default function MinorProjectCreateScreen() {
  const router = useRouter();
  const { majorId } = useLocalSearchParams<{ majorId: string }>();
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requiredMasters, setRequiredMasters] = useState("1");
  const [workScope, setWorkScope] = useState("");
  const [notes, setNotes] = useState("");

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert("알림", "작업 구역명을 입력해주세요.");
      return;
    }

    if (!majorId) {
      Alert.alert("오류", "대형 프로젝트 정보가 없습니다.");
      return;
    }

    const parsedRequiredMasters = parseInt(requiredMasters, 10);
    if (isNaN(parsedRequiredMasters) || parsedRequiredMasters < 1) {
      Alert.alert("알림", "필요 인원을 1명 이상으로 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("onul_minor_projects").insert({
        major_project_id: majorId,
        title: title.trim(),
        description: description.trim() || null,
        required_masters: parsedRequiredMasters,
        work_scope: workScope.trim() || null,
        notes: notes.trim() || null,
        status: "recruiting",
      });

      if (error) throw error;

      Alert.alert("완료", "소형 프로젝트가 추가되었습니다.", [
        {
          text: "확인",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Create minor project error:", error);
      Alert.alert("오류", "소형 프로젝트 생성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background"
    >
      <ScrollView className="flex-1 px-6 pt-6">
        {/* 입력 폼 */}
        <View className="gap-4">
          <View>
            <Text className="text-foreground font-medium mb-2">
              작업 구역명 *
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="예: 2층 식품매장"
              placeholderTextColor="#9CA3AF"
              editable={!loading}
              className="bg-white border border-border rounded-xl px-4 py-4 text-foreground"
            />
          </View>

          <View>
            <Text className="text-foreground font-medium mb-2">작업 설명</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="이 구역에서 수행할 작업에 대한 설명"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
              editable={!loading}
              className="bg-white border border-border rounded-xl px-4 py-4 text-foreground"
              style={{ minHeight: 80, textAlignVertical: "top" }}
            />
          </View>

          <View>
            <Text className="text-foreground font-medium mb-2">
              필요 인원 *
            </Text>
            <TextInput
              value={requiredMasters}
              onChangeText={setRequiredMasters}
              placeholder="1"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
              editable={!loading}
              className="bg-white border border-border rounded-xl px-4 py-4 text-foreground"
            />
          </View>

          <View>
            <Text className="text-foreground font-medium mb-2">작업 범위</Text>
            <TextInput
              value={workScope}
              onChangeText={setWorkScope}
              placeholder="예: 바닥 왁스, 진열대 청소, 유리창 청소"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
              editable={!loading}
              className="bg-white border border-border rounded-xl px-4 py-4 text-foreground"
              style={{ minHeight: 80, textAlignVertical: "top" }}
            />
          </View>

          <View>
            <Text className="text-foreground font-medium mb-2">특이사항</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="작업 시 주의사항이나 특이사항"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
              editable={!loading}
              className="bg-white border border-border rounded-xl px-4 py-4 text-foreground"
              style={{ minHeight: 80, textAlignVertical: "top" }}
            />
          </View>
        </View>

        {/* 생성 버튼 */}
        <Pressable
          onPress={handleCreate}
          disabled={loading}
          className={`w-full py-4 rounded-xl items-center mt-8 mb-8 ${
            loading ? "bg-primary/50" : "bg-primary active:opacity-80"
          }`}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white font-semibold text-lg">추가</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
