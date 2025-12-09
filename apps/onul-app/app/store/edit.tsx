import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { ChevronDown, Check } from "lucide-react-native";
import { useAuth } from "../../src/contexts/AuthContext";
import { supabase } from "../../src/lib/supabase";
import { OnulStore } from "../../src/types/database";

const CONTRACT_TYPES = [
  { value: "regular", label: "정기계약" },
  { value: "onetime", label: "단발성" },
  { value: "contract", label: "계약" },
];

const VISIT_CYCLES = [
  { value: "weekly", label: "매주" },
  { value: "biweekly", label: "격주" },
  { value: "monthly", label: "월 1회" },
  { value: "custom", label: "맞춤" },
];

export default function EditStoreScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();

  const [store, setStore] = useState<OnulStore | null>(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contractType, setContractType] = useState<string | null>(null);
  const [visitCycle, setVisitCycle] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showContractTypeDropdown, setShowContractTypeDropdown] = useState(false);
  const [showVisitCycleDropdown, setShowVisitCycleDropdown] = useState(false);

  const isAdmin =
    profile?.role === "super_admin" || profile?.role === "project_manager";

  useEffect(() => {
    const fetchStore = async () => {
      if (!id) {
        Alert.alert("오류", "매장 ID가 없습니다.");
        router.back();
        return;
      }

      try {
        const { data, error } = await supabase
          .from("onul_stores")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        setStore(data);
        setName(data.name);
        setAddress(data.address || "");
        setContactName(data.contact_name || "");
        setContactPhone(data.contact_phone || "");
        setContractType(data.contract_type);
        setVisitCycle(data.visit_cycle);
        setNotes(data.notes || "");
      } catch (error) {
        console.error("Error fetching store:", error);
        Alert.alert("오류", "매장 정보를 불러올 수 없습니다.");
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchStore();
  }, [id, router]);

  if (!isAdmin) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-muted">접근 권한이 없습니다.</Text>
      </View>
    );
  }

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("오류", "매장명을 입력해주세요.");
      return;
    }

    if (!store) return;

    setSaving(true);

    try {
      const { error } = await supabase
        .from("onul_stores")
        .update({
          name: name.trim(),
          address: address.trim() || null,
          contact_name: contactName.trim() || null,
          contact_phone: contactPhone.trim() || null,
          contract_type: contractType,
          visit_cycle: visitCycle,
          notes: notes.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", store.id);

      if (error) throw error;

      Alert.alert("성공", "매장 정보가 수정되었습니다.", [
        {
          text: "확인",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Error updating store:", error);
      Alert.alert("오류", "매장 수정에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!store) return;

    Alert.alert(
      "매장 삭제",
      "정말 이 매장을 삭제하시겠습니까?\n삭제된 매장은 복구할 수 없습니다.",
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("onul_stores")
                .delete()
                .eq("id", store.id);

              if (error) throw error;

              Alert.alert("성공", "매장이 삭제되었습니다.", [
                {
                  text: "확인",
                  onPress: () => router.replace("/(tabs)/stores"),
                },
              ]);
            } catch (error) {
              console.error("Error deleting store:", error);
              Alert.alert("오류", "매장 삭제에 실패했습니다.");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#67c0a1" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "매장 수정",
        }}
      />

      <KeyboardAvoidingView
        className="flex-1 bg-background"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
          <View className="px-6 py-4">
            {/* 매장명 */}
            <View className="mb-4">
              <Text className="text-foreground font-medium mb-2">
                매장명 <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                className="bg-white border border-border rounded-xl px-4 py-3 text-foreground"
                placeholder="매장명을 입력하세요"
                placeholderTextColor="#9CA3AF"
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* 주소 */}
            <View className="mb-4">
              <Text className="text-foreground font-medium mb-2">주소</Text>
              <TextInput
                className="bg-white border border-border rounded-xl px-4 py-3 text-foreground"
                placeholder="주소를 입력하세요"
                placeholderTextColor="#9CA3AF"
                value={address}
                onChangeText={setAddress}
              />
            </View>

            {/* 담당자명 */}
            <View className="mb-4">
              <Text className="text-foreground font-medium mb-2">담당자명</Text>
              <TextInput
                className="bg-white border border-border rounded-xl px-4 py-3 text-foreground"
                placeholder="담당자명을 입력하세요"
                placeholderTextColor="#9CA3AF"
                value={contactName}
                onChangeText={setContactName}
              />
            </View>

            {/* 연락처 */}
            <View className="mb-4">
              <Text className="text-foreground font-medium mb-2">연락처</Text>
              <TextInput
                className="bg-white border border-border rounded-xl px-4 py-3 text-foreground"
                placeholder="연락처를 입력하세요"
                placeholderTextColor="#9CA3AF"
                value={contactPhone}
                onChangeText={setContactPhone}
                keyboardType="phone-pad"
              />
            </View>

            {/* 계약유형 */}
            <View className="mb-4">
              <Text className="text-foreground font-medium mb-2">계약유형</Text>
              <Pressable
                onPress={() => {
                  setShowContractTypeDropdown(!showContractTypeDropdown);
                  setShowVisitCycleDropdown(false);
                }}
                className="bg-white border border-border rounded-xl px-4 py-3 flex-row justify-between items-center"
              >
                <Text
                  className={contractType ? "text-foreground" : "text-muted"}
                >
                  {contractType
                    ? CONTRACT_TYPES.find((t) => t.value === contractType)?.label
                    : "계약유형을 선택하세요"}
                </Text>
                <ChevronDown size={20} color="#6B7280" />
              </Pressable>

              {showContractTypeDropdown && (
                <View className="bg-white border border-border rounded-xl mt-2 overflow-hidden">
                  {CONTRACT_TYPES.map((type) => (
                    <Pressable
                      key={type.value}
                      onPress={() => {
                        setContractType(type.value);
                        setShowContractTypeDropdown(false);
                      }}
                      className={`px-4 py-3 flex-row justify-between items-center border-b border-border last:border-b-0 ${
                        contractType === type.value ? "bg-primary/10" : ""
                      }`}
                    >
                      <Text
                        className={
                          contractType === type.value
                            ? "text-primary font-medium"
                            : "text-foreground"
                        }
                      >
                        {type.label}
                      </Text>
                      {contractType === type.value && (
                        <Check size={18} color="#67c0a1" />
                      )}
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            {/* 방문주기 */}
            <View className="mb-4">
              <Text className="text-foreground font-medium mb-2">방문주기</Text>
              <Pressable
                onPress={() => {
                  setShowVisitCycleDropdown(!showVisitCycleDropdown);
                  setShowContractTypeDropdown(false);
                }}
                className="bg-white border border-border rounded-xl px-4 py-3 flex-row justify-between items-center"
              >
                <Text className={visitCycle ? "text-foreground" : "text-muted"}>
                  {visitCycle
                    ? VISIT_CYCLES.find((c) => c.value === visitCycle)?.label
                    : "방문주기를 선택하세요"}
                </Text>
                <ChevronDown size={20} color="#6B7280" />
              </Pressable>

              {showVisitCycleDropdown && (
                <View className="bg-white border border-border rounded-xl mt-2 overflow-hidden">
                  {VISIT_CYCLES.map((cycle) => (
                    <Pressable
                      key={cycle.value}
                      onPress={() => {
                        setVisitCycle(cycle.value);
                        setShowVisitCycleDropdown(false);
                      }}
                      className={`px-4 py-3 flex-row justify-between items-center border-b border-border last:border-b-0 ${
                        visitCycle === cycle.value ? "bg-primary/10" : ""
                      }`}
                    >
                      <Text
                        className={
                          visitCycle === cycle.value
                            ? "text-primary font-medium"
                            : "text-foreground"
                        }
                      >
                        {cycle.label}
                      </Text>
                      {visitCycle === cycle.value && (
                        <Check size={18} color="#67c0a1" />
                      )}
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            {/* 메모 */}
            <View className="mb-6">
              <Text className="text-foreground font-medium mb-2">메모</Text>
              <TextInput
                className="bg-white border border-border rounded-xl px-4 py-3 text-foreground min-h-[100px]"
                placeholder="메모를 입력하세요"
                placeholderTextColor="#9CA3AF"
                value={notes}
                onChangeText={setNotes}
                multiline
                textAlignVertical="top"
              />
            </View>

            {/* 저장 버튼 */}
            <Pressable
              onPress={handleSubmit}
              disabled={saving}
              className={`py-4 rounded-xl items-center ${
                saving ? "bg-muted" : "bg-primary"
              }`}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white font-semibold text-base">
                  변경사항 저장
                </Text>
              )}
            </Pressable>

            {/* 삭제 버튼 */}
            <Pressable
              onPress={handleDelete}
              className="py-4 rounded-xl items-center mt-3 border border-red-200 bg-red-50"
            >
              <Text className="text-red-600 font-semibold text-base">
                매장 삭제
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
