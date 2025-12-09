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
  Image,
} from "react-native";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { Calendar, ChevronDown, Check, Camera, X, Plus } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../../../src/contexts/AuthContext";
import { supabase } from "../../../src/lib/supabase";
import { uploadToMinio, generateFileName } from "../../../src/lib/minio";
import { OnulStore, OnulProfile } from "../../../src/types/database";

const VISIT_STATUSES = [
  { value: "scheduled", label: "예정" },
  { value: "completed", label: "완료" },
  { value: "cancelled", label: "취소" },
];

export default function CreateVisitScreen() {
  const router = useRouter();
  const { store_id } = useLocalSearchParams<{ store_id: string }>();
  const { profile } = useAuth();

  const [store, setStore] = useState<OnulStore | null>(null);
  const [masters, setMasters] = useState<OnulProfile[]>([]);
  const [visitDate, setVisitDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedMasterId, setSelectedMasterId] = useState<string | null>(null);
  const [status, setStatus] = useState("scheduled");
  const [notes, setNotes] = useState("");
  const [beforePhotos, setBeforePhotos] = useState<string[]>([]);
  const [afterPhotos, setAfterPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showMasterDropdown, setShowMasterDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const isAdmin =
    profile?.role === "super_admin" || profile?.role === "project_manager";

  useEffect(() => {
    const fetchData = async () => {
      if (!store_id) {
        Alert.alert("오류", "매장 ID가 없습니다.");
        router.back();
        return;
      }

      try {
        // 매장 정보 조회
        const { data: storeData, error: storeError } = await supabase
          .from("onul_stores")
          .select("*")
          .eq("id", store_id)
          .single();

        if (storeError) throw storeError;
        setStore(storeData);

        // 마스터 목록 조회
        const { data: mastersData, error: mastersError } = await supabase
          .from("onul_profiles")
          .select("*")
          .eq("role", "master")
          .eq("is_active", true)
          .order("name");

        if (mastersError) throw mastersError;
        setMasters(mastersData || []);

        // 기본 마스터로 현재 로그인 사용자 설정 (마스터인 경우)
        if (profile?.role === "master") {
          setSelectedMasterId(profile.id);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        Alert.alert("오류", "데이터를 불러올 수 없습니다.");
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [store_id, router, profile]);

  if (!isAdmin && profile?.role !== "master") {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-muted">접근 권한이 없습니다.</Text>
      </View>
    );
  }

  const pickImage = async (type: "before" | "after") => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      setUploading(true);
      try {
        const uploadedUrls: string[] = [];

        for (const asset of result.assets) {
          const fileName = generateFileName("store-visit", type);
          const url = await uploadToMinio(asset.uri, fileName);
          if (url) {
            uploadedUrls.push(url);
          }
        }

        if (type === "before") {
          setBeforePhotos([...beforePhotos, ...uploadedUrls]);
        } else {
          setAfterPhotos([...afterPhotos, ...uploadedUrls]);
        }
      } catch (error) {
        console.error("Error uploading images:", error);
        Alert.alert("오류", "사진 업로드에 실패했습니다.");
      } finally {
        setUploading(false);
      }
    }
  };

  const removePhoto = (type: "before" | "after", index: number) => {
    if (type === "before") {
      setBeforePhotos(beforePhotos.filter((_, i) => i !== index));
    } else {
      setAfterPhotos(afterPhotos.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    if (!visitDate) {
      Alert.alert("오류", "방문일을 입력해주세요.");
      return;
    }

    if (!selectedMasterId) {
      Alert.alert("오류", "담당 마스터를 선택해주세요.");
      return;
    }

    if (!store_id) return;

    setSaving(true);

    try {
      const { error } = await supabase.from("onul_store_visits").insert({
        store_id: store_id,
        master_id: selectedMasterId,
        visit_date: visitDate,
        status: status,
        notes: notes.trim() || null,
        before_photos: beforePhotos.length > 0 ? beforePhotos : null,
        after_photos: afterPhotos.length > 0 ? afterPhotos : null,
      });

      if (error) throw error;

      Alert.alert("성공", "방문 기록이 등록되었습니다.", [
        {
          text: "확인",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Error creating visit:", error);
      Alert.alert("오류", "방문 기록 등록에 실패했습니다.");
    } finally {
      setSaving(false);
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
    <>
      <Stack.Screen
        options={{
          title: store?.name ? `${store.name} 방문 기록` : "방문 기록 등록",
        }}
      />

      <KeyboardAvoidingView
        className="flex-1 bg-background"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
          <View className="px-6 py-4">
            {/* 방문일 */}
            <View className="mb-4">
              <Text className="text-foreground font-medium mb-2">
                방문일 <Text className="text-red-500">*</Text>
              </Text>
              <View className="bg-white border border-border rounded-xl px-4 py-3 flex-row items-center">
                <Calendar size={20} color="#6B7280" />
                <TextInput
                  className="flex-1 ml-2 text-foreground"
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#9CA3AF"
                  value={visitDate}
                  onChangeText={setVisitDate}
                />
              </View>
            </View>

            {/* 담당 마스터 */}
            <View className="mb-4">
              <Text className="text-foreground font-medium mb-2">
                담당 마스터 <Text className="text-red-500">*</Text>
              </Text>
              <Pressable
                onPress={() => {
                  setShowMasterDropdown(!showMasterDropdown);
                  setShowStatusDropdown(false);
                }}
                className="bg-white border border-border rounded-xl px-4 py-3 flex-row justify-between items-center"
              >
                <Text
                  className={selectedMasterId ? "text-foreground" : "text-muted"}
                >
                  {selectedMasterId
                    ? masters.find((m) => m.id === selectedMasterId)?.name
                    : "담당 마스터를 선택하세요"}
                </Text>
                <ChevronDown size={20} color="#6B7280" />
              </Pressable>

              {showMasterDropdown && (
                <View className="bg-white border border-border rounded-xl mt-2 overflow-hidden max-h-60">
                  <ScrollView>
                    {masters.map((master) => (
                      <Pressable
                        key={master.id}
                        onPress={() => {
                          setSelectedMasterId(master.id);
                          setShowMasterDropdown(false);
                        }}
                        className={`px-4 py-3 flex-row justify-between items-center border-b border-border ${
                          selectedMasterId === master.id ? "bg-primary/10" : ""
                        }`}
                      >
                        <Text
                          className={
                            selectedMasterId === master.id
                              ? "text-primary font-medium"
                              : "text-foreground"
                          }
                        >
                          {master.name}
                        </Text>
                        {selectedMasterId === master.id && (
                          <Check size={18} color="#67c0a1" />
                        )}
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* 상태 */}
            <View className="mb-4">
              <Text className="text-foreground font-medium mb-2">상태</Text>
              <Pressable
                onPress={() => {
                  setShowStatusDropdown(!showStatusDropdown);
                  setShowMasterDropdown(false);
                }}
                className="bg-white border border-border rounded-xl px-4 py-3 flex-row justify-between items-center"
              >
                <Text className="text-foreground">
                  {VISIT_STATUSES.find((s) => s.value === status)?.label}
                </Text>
                <ChevronDown size={20} color="#6B7280" />
              </Pressable>

              {showStatusDropdown && (
                <View className="bg-white border border-border rounded-xl mt-2 overflow-hidden">
                  {VISIT_STATUSES.map((s) => (
                    <Pressable
                      key={s.value}
                      onPress={() => {
                        setStatus(s.value);
                        setShowStatusDropdown(false);
                      }}
                      className={`px-4 py-3 flex-row justify-between items-center border-b border-border ${
                        status === s.value ? "bg-primary/10" : ""
                      }`}
                    >
                      <Text
                        className={
                          status === s.value
                            ? "text-primary font-medium"
                            : "text-foreground"
                        }
                      >
                        {s.label}
                      </Text>
                      {status === s.value && (
                        <Check size={18} color="#67c0a1" />
                      )}
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            {/* 작업 내용 */}
            <View className="mb-4">
              <Text className="text-foreground font-medium mb-2">작업 내용</Text>
              <TextInput
                className="bg-white border border-border rounded-xl px-4 py-3 text-foreground min-h-[100px]"
                placeholder="작업 내용을 입력하세요"
                placeholderTextColor="#9CA3AF"
                value={notes}
                onChangeText={setNotes}
                multiline
                textAlignVertical="top"
              />
            </View>

            {/* 비포 사진 */}
            <View className="mb-4">
              <Text className="text-foreground font-medium mb-2">비포 사진</Text>
              <View className="flex-row flex-wrap gap-2">
                {beforePhotos.map((uri, index) => (
                  <View key={index} className="relative">
                    <Image
                      source={{ uri }}
                      className="w-20 h-20 rounded-lg"
                    />
                    <Pressable
                      onPress={() => removePhoto("before", index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full items-center justify-center"
                    >
                      <X size={14} color="#FFFFFF" />
                    </Pressable>
                  </View>
                ))}
                <Pressable
                  onPress={() => pickImage("before")}
                  disabled={uploading}
                  className="w-20 h-20 bg-surface border border-dashed border-border rounded-lg items-center justify-center"
                >
                  {uploading ? (
                    <ActivityIndicator size="small" color="#67c0a1" />
                  ) : (
                    <>
                      <Camera size={24} color="#9CA3AF" />
                      <Text className="text-xs text-muted mt-1">추가</Text>
                    </>
                  )}
                </Pressable>
              </View>
            </View>

            {/* 애프터 사진 */}
            <View className="mb-6">
              <Text className="text-foreground font-medium mb-2">애프터 사진</Text>
              <View className="flex-row flex-wrap gap-2">
                {afterPhotos.map((uri, index) => (
                  <View key={index} className="relative">
                    <Image
                      source={{ uri }}
                      className="w-20 h-20 rounded-lg"
                    />
                    <Pressable
                      onPress={() => removePhoto("after", index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full items-center justify-center"
                    >
                      <X size={14} color="#FFFFFF" />
                    </Pressable>
                  </View>
                ))}
                <Pressable
                  onPress={() => pickImage("after")}
                  disabled={uploading}
                  className="w-20 h-20 bg-surface border border-dashed border-border rounded-lg items-center justify-center"
                >
                  {uploading ? (
                    <ActivityIndicator size="small" color="#67c0a1" />
                  ) : (
                    <>
                      <Camera size={24} color="#9CA3AF" />
                      <Text className="text-xs text-muted mt-1">추가</Text>
                    </>
                  )}
                </Pressable>
              </View>
            </View>

            {/* 등록 버튼 */}
            <Pressable
              onPress={handleSubmit}
              disabled={saving || uploading}
              className={`py-4 rounded-xl items-center ${
                saving || uploading ? "bg-muted" : "bg-primary"
              }`}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white font-semibold text-base">
                  방문 기록 등록
                </Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
