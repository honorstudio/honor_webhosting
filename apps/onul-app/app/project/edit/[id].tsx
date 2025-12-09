import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { X, ImagePlus } from "lucide-react-native";
import { useAuth } from "../../../src/contexts/AuthContext";
import { supabase } from "../../../src/lib/supabase";
import { useToast } from "../../../src/components/Toast";
import { MINIO_CONFIG, generateFileName } from "../../../src/lib/minio";
import WorkScopeTagSelector, {
  SelectedWorkScope,
} from "../../../src/components/WorkScopeTagSelector";
import LocationSearch from "../../../src/components/LocationSearch";
import DateRangePicker from "../../../src/components/DateRangePicker";

type ProjectStatus = "draft" | "recruiting" | "in_progress" | "completed" | "cancelled";

interface ImageFile {
  uri: string;
  name: string;
  type: string;
  isExisting?: boolean;
}

export default function ProjectEditScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [workScopes, setWorkScopes] = useState<SelectedWorkScope[]>([]);
  const [originalWorkScopeIds, setOriginalWorkScopeIds] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("draft");
  const [images, setImages] = useState<ImageFile[]>([]);
  const [existingPhotoIds, setExistingPhotoIds] = useState<string[]>([]);
  const [deletedPhotoIds, setDeletedPhotoIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;

      try {
        // 프로젝트 정보 가져오기
        const { data, error } = await supabase
          .from("onul_major_projects")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        setTitle(data.title || "");
        setDescription(data.description || "");
        setLocation(data.location || "");
        setStartDate(data.scheduled_date || "");
        setEndDate(data.scheduled_end_date || "");
        setNotes(data.notes || "");
        setStatus(data.status || "draft");

        // 기존 작업범위 태그 가져오기
        const { data: workScopeData } = await supabase
          .from("onul_project_work_scopes")
          .select(`
            id,
            tag_id,
            frequency,
            scheduled_dates,
            notes,
            onul_work_scope_tags (
              id,
              name,
              color
            )
          `)
          .eq("major_project_id", id);

        if (workScopeData && workScopeData.length > 0) {
          const scopes: SelectedWorkScope[] = workScopeData.map((ws: any) => ({
            tag_id: ws.tag_id,
            tag_name: ws.onul_work_scope_tags?.name || "",
            tag_color: ws.onul_work_scope_tags?.color || "#67c0a1",
            frequency: ws.frequency || 1,
            scheduled_dates: ws.scheduled_dates || [],
            notes: ws.notes || "",
          }));
          setWorkScopes(scopes);
          setOriginalWorkScopeIds(workScopeData.map((ws: any) => ws.tag_id));
        }

        // 기존 이미지 가져오기
        const { data: photos } = await supabase
          .from("onul_project_photos")
          .select("id, photo_url")
          .eq("major_project_id", id);

        if (photos && photos.length > 0) {
          const existingImages = photos.map((photo) => ({
            uri: photo.photo_url,
            name: photo.photo_url.split("/").pop() || "image.jpg",
            type: "image/jpeg",
            isExisting: true,
          }));
          setImages(existingImages);
          setExistingPhotoIds(photos.map((p) => p.id));
        }
      } catch (error) {
        console.error("Fetch project error:", error);
        showToast("프로젝트 정보를 불러오는데 실패했습니다.", "error");
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  // 웹에서 파일 선택 처리
  const handleWebFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newImages: ImageFile[] = [];
    Array.from(files).forEach((file, index) => {
      if (images.length + newImages.length >= 10) return;
      const uri = URL.createObjectURL(file);
      newImages.push({
        uri,
        name: file.name || `image_${Date.now()}_${index}.jpg`,
        type: file.type || "image/jpeg",
        isExisting: false,
      });
    });

    setImages((prev) => [...prev, ...newImages].slice(0, 10));
    if (event.target) {
      event.target.value = "";
    }
  };

  const pickImage = async () => {
    // 웹에서는 직접 파일 input 클릭
    if (Platform.OS === "web") {
      fileInputRef.current?.click();
      return;
    }

    // 네이티브에서는 expo-image-picker 사용
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 10 - images.length,
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets.map((asset, index) => ({
          uri: asset.uri,
          name: asset.fileName || `image_${Date.now()}_${index}.jpg`,
          type: asset.mimeType || "image/jpeg",
          isExisting: false,
        }));
        setImages((prev) => [...prev, ...newImages].slice(0, 10));
      }
    } catch (error) {
      console.error("Image picker error:", error);
      showToast("이미지를 선택하는 중 오류가 발생했습니다.", "error");
    }
  };

  const removeImage = (index: number) => {
    const imageToRemove = images[index];
    if (imageToRemove.isExisting && existingPhotoIds[index]) {
      setDeletedPhotoIds((prev) => [...prev, existingPhotoIds[index]]);
    }
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (projectId: string) => {
    const uploadedUrls: string[] = [];
    const newImages = images.filter((img) => !img.isExisting);

    for (const image of newImages) {
      try {
        const fileName = generateFileName(image.name);
        const path = `major/${projectId}/${fileName}`;
        const url = `${MINIO_CONFIG.endpoint}/${MINIO_CONFIG.bucket}/${path}`;

        const response = await fetch(image.uri);
        const blob = await response.blob();

        const uploadResponse = await fetch(url, {
          method: "PUT",
          body: blob,
          headers: {
            "Content-Type": image.type,
          },
        });

        if (!uploadResponse.ok) {
          console.error("MinIO upload error:", uploadResponse.status);
          continue;
        }

        uploadedUrls.push(url);
      } catch (error) {
        console.error("Image upload error:", error);
      }
    }

    return uploadedUrls;
  };

  const savePhotos = async (projectId: string, urls: string[]) => {
    for (const url of urls) {
      await supabase.from("onul_project_photos").insert({
        major_project_id: projectId,
        photo_url: url,
        photo_type: "reference",
        uploaded_by: profile?.id,
      });
    }
  };

  const deletePhotos = async () => {
    for (const photoId of deletedPhotoIds) {
      await supabase.from("onul_project_photos").delete().eq("id", photoId);
    }
  };

  const saveWorkScopes = async (projectId: string) => {
    // 현재 선택된 태그 ID들
    const currentTagIds = workScopes.map((s) => s.tag_id);

    // 삭제된 태그 처리 (원래 있었지만 현재 없는 것)
    const deletedTagIds = originalWorkScopeIds.filter(
      (id) => !currentTagIds.includes(id)
    );
    for (const tagId of deletedTagIds) {
      await supabase
        .from("onul_project_work_scopes")
        .delete()
        .eq("major_project_id", projectId)
        .eq("tag_id", tagId);
    }

    // 새로 추가되거나 업데이트된 태그 처리
    for (const scope of workScopes) {
      const isNew = !originalWorkScopeIds.includes(scope.tag_id);

      if (isNew) {
        // 새 태그 추가
        await supabase.from("onul_project_work_scopes").insert({
          major_project_id: projectId,
          tag_id: scope.tag_id,
          frequency: scope.frequency,
          scheduled_dates: scope.scheduled_dates,
          notes: scope.notes || null,
        });
        // 태그 사용 횟수 증가
        await supabase.rpc("increment_tag_usage", { tag_id: scope.tag_id });
      } else {
        // 기존 태그 업데이트
        await supabase
          .from("onul_project_work_scopes")
          .update({
            frequency: scope.frequency,
            scheduled_dates: scope.scheduled_dates,
            notes: scope.notes || null,
          })
          .eq("major_project_id", projectId)
          .eq("tag_id", scope.tag_id);
      }
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      showToast("프로젝트 제목을 입력해주세요.", "error");
      return;
    }

    if (!profile?.id) {
      showToast("로그인이 필요합니다.", "error");
      return;
    }

    setSaving(true);
    try {
      // 작업범위 태그 이름들을 텍스트로도 저장 (호환성)
      const workScopeText = workScopes.map((s) => s.tag_name).join(", ");

      // 위치 (상세주소 포함)
      const fullLocation = detailAddress
        ? `${location} ${detailAddress}`.trim()
        : location.trim();

      const { error } = await supabase
        .from("onul_major_projects")
        .update({
          title: title.trim(),
          description: description.trim() || null,
          location: fullLocation || null,
          scheduled_date: startDate || null,
          scheduled_end_date: endDate || null,
          work_scope: workScopeText || null,
          notes: notes.trim() || null,
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      // 작업범위 태그 저장
      await saveWorkScopes(id!);

      // 삭제된 이미지 처리
      if (deletedPhotoIds.length > 0) {
        await deletePhotos();
      }

      // 새 이미지 업로드
      const newImages = images.filter((img) => !img.isExisting);
      if (newImages.length > 0) {
        const uploadedUrls = await uploadImages(id!);
        if (uploadedUrls.length > 0) {
          await savePhotos(id!, uploadedUrls);
        }
      }

      showToast("프로젝트가 수정되었습니다.", "success");
      router.back();
    } catch (error) {
      console.error("Update project error:", error);
      showToast("프로젝트 수정 중 오류가 발생했습니다.", "error");
    } finally {
      setSaving(false);
    }
  };

  const statusOptions: { value: ProjectStatus; label: string; desc: string }[] = [
    { value: "draft", label: "초안", desc: "임시 저장" },
    { value: "recruiting", label: "모집중", desc: "마스터 모집" },
    { value: "in_progress", label: "진행중", desc: "작업 진행" },
    { value: "completed", label: "완료", desc: "작업 완료" },
    { value: "cancelled", label: "취소", desc: "프로젝트 취소" },
  ];

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
    >
      <ScrollView className="flex-1 px-6 pt-6">
        {/* 상태 선택 */}
        <View className="mb-6">
          <Text className="text-foreground font-medium mb-3">프로젝트 상태</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              {statusOptions.map((opt) => (
                <Pressable
                  key={opt.value}
                  onPress={() => setStatus(opt.value)}
                  disabled={saving}
                  className={`py-2 px-4 rounded-xl border ${
                    status === opt.value
                      ? "bg-primary border-primary"
                      : "bg-surface border-border"
                  }`}
                >
                  <Text
                    className={`font-medium text-sm ${
                      status === opt.value ? "text-white" : "text-foreground"
                    }`}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* 입력 폼 */}
        <View className="gap-4">
          <View>
            <Text className="text-foreground font-medium mb-2">
              프로젝트 제목 *
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="예: D마트 12월 정기청소"
              placeholderTextColor="#9CA3AF"
              editable={!saving}
              className="bg-white border border-border rounded-xl px-4 py-4 text-foreground"
            />
          </View>

          <View>
            <Text className="text-foreground font-medium mb-2">상세 설명</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="프로젝트에 대한 상세 설명을 입력하세요"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              editable={!saving}
              className="bg-white border border-border rounded-xl px-4 py-4 text-foreground"
              style={{ minHeight: 100, textAlignVertical: "top" }}
            />
          </View>

          {/* 위치 검색 및 상세주소 */}
          <View>
            <Text className="text-foreground font-medium mb-2">위치</Text>
            <LocationSearch
              value={location}
              onLocationSelect={(address) => setLocation(address)}
              detailAddress={detailAddress}
              onDetailAddressChange={setDetailAddress}
              disabled={saving}
              placeholder="주소 검색 (클릭하여 검색)"
            />
          </View>

          {/* 예정일 (캘린더 날짜 범위 선택) */}
          <View>
            <Text className="text-foreground font-medium mb-2">예정일</Text>
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onDateChange={(start, end) => {
                setStartDate(start);
                setEndDate(end);
              }}
              disabled={saving}
              placeholder="날짜 선택 (클릭하여 선택)"
            />
          </View>

          {/* 작업범위 태그 */}
          <WorkScopeTagSelector
            selectedScopes={workScopes}
            onScopesChange={setWorkScopes}
            disabled={saving}
          />

          {/* 특이사항 */}
          <View>
            <Text className="text-foreground font-medium mb-2">특이사항</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="예: 주차 가능, 도구 제공, 주의사항 등"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
              editable={!saving}
              className="bg-white border border-border rounded-xl px-4 py-4 text-foreground"
              style={{ minHeight: 80, textAlignVertical: "top" }}
            />
          </View>

          {/* 이미지 업로드 */}
          <View>
            <Text className="text-foreground font-medium mb-2">
              참고 이미지 (최대 10장)
            </Text>
            {/* 웹용 숨겨진 파일 입력 - Safari 호환을 위해 visibility: hidden 사용 */}
            {Platform.OS === "web" && (
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleWebFileSelect}
                style={{
                  position: "absolute",
                  width: 1,
                  height: 1,
                  padding: 0,
                  margin: -1,
                  overflow: "hidden",
                  clip: "rect(0, 0, 0, 0)",
                  whiteSpace: "nowrap",
                  border: 0,
                }}
              />
            )}
            <View className="flex-row flex-wrap gap-2">
              {images.map((image, index) => (
                <View
                  key={index}
                  className="w-24 h-24 rounded-xl overflow-hidden relative"
                >
                  <Image
                    source={{ uri: image.uri }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                  <Pressable
                    onPress={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-black/60 rounded-full p-1"
                  >
                    <X size={16} color="#FFFFFF" />
                  </Pressable>
                </View>
              ))}
              {images.length < 10 && (
                <Pressable
                  onPress={pickImage}
                  disabled={saving}
                  className="w-24 h-24 rounded-xl border-2 border-dashed border-border items-center justify-center bg-surface"
                >
                  <ImagePlus size={24} color="#9CA3AF" />
                  <Text className="text-muted text-xs mt-1">추가</Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>

        {/* 저장 버튼 */}
        <Pressable
          onPress={handleSave}
          disabled={saving}
          className={`w-full py-4 rounded-xl items-center mt-8 mb-8 ${
            saving ? "bg-primary/50" : "bg-primary active:opacity-80"
          }`}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white font-semibold text-lg">저장</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
