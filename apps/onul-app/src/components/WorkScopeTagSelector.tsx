import { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Plus, X, Check, AlertTriangle } from "lucide-react-native";
import { supabase } from "../lib/supabase";
import { useToast } from "./Toast";
import BottomSheet from "./BottomSheet";

export interface WorkScopeTag {
  id: string;
  name: string;
  description: string | null;
  color: string;
}

export interface SelectedWorkScope {
  tag_id: string;
  tag_name: string;
  tag_color: string;
  frequency: number;
  scheduled_dates: string[];
  notes: string;
}

interface Props {
  selectedScopes: SelectedWorkScope[];
  onScopesChange: (scopes: SelectedWorkScope[]) => void;
  disabled?: boolean;
}

export default function WorkScopeTagSelector({
  selectedScopes,
  onScopesChange,
  disabled = false,
}: Props) {
  const { showToast } = useToast();
  const [tags, setTags] = useState<WorkScopeTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [addTagModalVisible, setAddTagModalVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [selectedTagForDelete, setSelectedTagForDelete] = useState<string | null>(null);
  const [newTagName, setNewTagName] = useState("");
  const [newTagDesc, setNewTagDesc] = useState("");
  const [addingTag, setAddingTag] = useState(false);

  // 편집 모달 상태
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingScope, setEditingScope] = useState<SelectedWorkScope | null>(null);
  const [editFrequency, setEditFrequency] = useState("1");
  const [editNotes, setEditNotes] = useState("");

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const { data, error } = await supabase
        .from("onul_work_scope_tags")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setTags(data || []);
    } catch (error) {
      console.error("Fetch tags error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTag = (tag: WorkScopeTag) => {
    const exists = selectedScopes.find((s) => s.tag_id === tag.id);
    if (exists) {
      // 이미 선택된 태그 클릭 시 편집 모달 열기
      setEditingScope(exists);
      setEditFrequency(String(exists.frequency));
      setEditNotes(exists.notes);
      setEditModalVisible(true);
    } else {
      // 새 태그 추가
      const newScope: SelectedWorkScope = {
        tag_id: tag.id,
        tag_name: tag.name,
        tag_color: tag.color,
        frequency: 1,
        scheduled_dates: [],
        notes: "",
      };
      onScopesChange([...selectedScopes, newScope]);
    }
    setModalVisible(false);
  };

  const handleRemoveScope = (tagId: string) => {
    setSelectedTagForDelete(tagId);
    setDeleteConfirmVisible(true);
  };

  const confirmRemoveScope = () => {
    if (selectedTagForDelete) {
      onScopesChange(selectedScopes.filter((s) => s.tag_id !== selectedTagForDelete));
    }
    setDeleteConfirmVisible(false);
    setSelectedTagForDelete(null);
  };

  const handleSaveEdit = () => {
    if (!editingScope) return;

    const updated = selectedScopes.map((s) =>
      s.tag_id === editingScope.tag_id
        ? {
            ...s,
            frequency: parseInt(editFrequency) || 1,
            notes: editNotes,
          }
        : s
    );
    onScopesChange(updated);
    setEditModalVisible(false);
    setEditingScope(null);
  };

  const handleAddNewTag = async () => {
    if (!newTagName.trim()) {
      showToast("태그 이름을 입력해주세요.", "error");
      return;
    }

    setAddingTag(true);
    try {
      const { data, error } = await supabase
        .from("onul_work_scope_tags")
        .insert({
          name: newTagName.trim(),
          description: newTagDesc.trim() || null,
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          showToast("이미 존재하는 태그입니다.", "error");
        } else {
          throw error;
        }
        return;
      }

      setTags([...tags, data]);
      showToast("새 태그가 추가되었습니다.", "success");
      setNewTagName("");
      setNewTagDesc("");
      setAddTagModalVisible(false);
    } catch (error) {
      console.error("Add tag error:", error);
      showToast("태그 추가 중 오류가 발생했습니다.", "error");
    } finally {
      setAddingTag(false);
    }
  };

  if (loading) {
    return (
      <View className="py-4">
        <ActivityIndicator size="small" color="#67c0a1" />
      </View>
    );
  }

  return (
    <View>
      <Text className="text-foreground font-medium mb-2">작업범위</Text>

      {/* 선택된 태그 목록 */}
      <View className="flex-row flex-wrap gap-2 mb-3">
        {selectedScopes.map((scope) => (
          <Pressable
            key={scope.tag_id}
            onPress={() => {
              setEditingScope(scope);
              setEditFrequency(String(scope.frequency));
              setEditNotes(scope.notes);
              setEditModalVisible(true);
            }}
            disabled={disabled}
            className="flex-row items-center rounded-full px-3 py-2"
            style={{ backgroundColor: scope.tag_color + "20" }}
          >
            <View
              className="w-2 h-2 rounded-full mr-2"
              style={{ backgroundColor: scope.tag_color }}
            />
            <Text style={{ color: scope.tag_color }} className="font-medium text-sm">
              {scope.tag_name}
            </Text>
            {scope.frequency > 1 && (
              <Text style={{ color: scope.tag_color }} className="text-xs ml-1">
                x{scope.frequency}
              </Text>
            )}
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                handleRemoveScope(scope.tag_id);
              }}
              className="ml-2"
            >
              <X size={14} color={scope.tag_color} />
            </Pressable>
          </Pressable>
        ))}

        {/* 태그 추가 버튼 */}
        <Pressable
          onPress={() => setModalVisible(true)}
          disabled={disabled}
          className="flex-row items-center bg-surface border border-dashed border-border rounded-full px-3 py-2"
        >
          <Plus size={16} color="#9CA3AF" />
          <Text className="text-muted text-sm ml-1">추가</Text>
        </Pressable>
      </View>

      {selectedScopes.length === 0 && (
        <Text className="text-muted text-sm">
          작업범위 태그를 선택해주세요
        </Text>
      )}

      {/* 태그 선택 BottomSheet */}
      <BottomSheet
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="작업범위 선택"
        maxHeight="70%"
      >
        <ScrollView style={{ maxHeight: 400 }}>
          <View className="flex-row flex-wrap gap-2">
            {tags.map((tag) => {
              const isSelected = selectedScopes.some((s) => s.tag_id === tag.id);
              return (
                <Pressable
                  key={tag.id}
                  onPress={() => handleSelectTag(tag)}
                  className="flex-row items-center rounded-full px-4 py-2 border"
                  style={{
                    backgroundColor: isSelected ? tag.color + "20" : "white",
                    borderColor: isSelected ? tag.color : "#E5E7EB",
                  }}
                >
                  {isSelected && (
                    <Check size={14} color={tag.color} style={{ marginRight: 4 }} />
                  )}
                  <Text
                    style={{ color: isSelected ? tag.color : "#374151" }}
                    className="font-medium"
                  >
                    {tag.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* 새 태그 추가 버튼 */}
          <Pressable
            onPress={() => {
              setModalVisible(false);
              setAddTagModalVisible(true);
            }}
            className="flex-row items-center justify-center bg-surface border border-border rounded-xl py-3 mt-4"
          >
            <Plus size={18} color="#67c0a1" />
            <Text className="text-primary font-medium ml-2">새 태그 만들기</Text>
          </Pressable>
        </ScrollView>
      </BottomSheet>

      {/* 새 태그 추가 모달 */}
      <Modal
        visible={addTagModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAddTagModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <Text className="text-lg font-bold text-foreground mb-4">새 태그 만들기</Text>

            <View className="mb-4">
              <Text className="text-foreground font-medium mb-2">태그 이름 *</Text>
              <TextInput
                value={newTagName}
                onChangeText={setNewTagName}
                placeholder="예: 외벽청소"
                placeholderTextColor="#9CA3AF"
                className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
              />
            </View>

            <View className="mb-6">
              <Text className="text-foreground font-medium mb-2">설명 (선택)</Text>
              <TextInput
                value={newTagDesc}
                onChangeText={setNewTagDesc}
                placeholder="태그에 대한 설명"
                placeholderTextColor="#9CA3AF"
                className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
              />
            </View>

            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setAddTagModalVisible(false)}
                disabled={addingTag}
                className="flex-1 py-3 rounded-xl bg-surface items-center"
              >
                <Text className="text-foreground font-medium">취소</Text>
              </Pressable>
              <Pressable
                onPress={handleAddNewTag}
                disabled={addingTag}
                className="flex-1 py-3 rounded-xl bg-primary items-center"
              >
                {addingTag ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text className="text-white font-medium">추가</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* 태그 편집 모달 */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <Text className="text-lg font-bold text-foreground mb-4">
              {editingScope?.tag_name} 설정
            </Text>

            <View className="mb-4">
              <Text className="text-foreground font-medium mb-2">횟수</Text>
              <TextInput
                value={editFrequency}
                onChangeText={setEditFrequency}
                keyboardType="number-pad"
                placeholder="1"
                placeholderTextColor="#9CA3AF"
                className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
              />
            </View>

            <View className="mb-6">
              <Text className="text-foreground font-medium mb-2">메모 (선택)</Text>
              <TextInput
                value={editNotes}
                onChangeText={setEditNotes}
                placeholder="이 작업에 대한 메모"
                placeholderTextColor="#9CA3AF"
                multiline
                className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                style={{ minHeight: 80, textAlignVertical: "top" }}
              />
            </View>

            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setEditModalVisible(false)}
                className="flex-1 py-3 rounded-xl bg-surface items-center"
              >
                <Text className="text-foreground font-medium">취소</Text>
              </Pressable>
              <Pressable
                onPress={handleSaveEdit}
                className="flex-1 py-3 rounded-xl bg-primary items-center"
              >
                <Text className="text-white font-medium">저장</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* 삭제 확인 모달 */}
      <Modal
        visible={deleteConfirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteConfirmVisible(false)}
      >
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <View className="items-center mb-4">
              <View className="w-12 h-12 bg-amber-100 rounded-full items-center justify-center mb-3">
                <AlertTriangle size={24} color="#F59E0B" />
              </View>
              <Text className="text-lg font-bold text-foreground">태그 제거</Text>
            </View>
            <Text className="text-muted text-center mb-6">
              이 태그를 제거하면 설정한 횟수, 날짜 등{"\n"}
              모든 데이터가 함께 삭제됩니다.
            </Text>
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setDeleteConfirmVisible(false)}
                className="flex-1 py-3 rounded-xl bg-surface items-center"
              >
                <Text className="text-foreground font-medium">취소</Text>
              </Pressable>
              <Pressable
                onPress={confirmRemoveScope}
                className="flex-1 py-3 rounded-xl bg-amber-500 items-center"
              >
                <Text className="text-white font-medium">제거</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
