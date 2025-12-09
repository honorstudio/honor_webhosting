import { useState, useRef } from "react";
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
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { X, ImagePlus } from "lucide-react-native";
import { useAuth } from "../../src/contexts/AuthContext";
import { supabase } from "../../src/lib/supabase";
import { useToast } from "../../src/components/Toast";
import { MINIO_CONFIG, generateFileName } from "../../src/lib/minio";
import WorkScopeTagSelector, {
  SelectedWorkScope,
} from "../../src/components/WorkScopeTagSelector";
import LocationSearch from "../../src/components/LocationSearch";
import DateRangePicker from "../../src/components/DateRangePicker";

type ProjectStatus = "draft" | "recruiting";

interface ImageFile {
  uri: string;
  name: string;
  type: string;
}

export default function ProjectCreateScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [workScopes, setWorkScopes] = useState<SelectedWorkScope[]>([]);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("draft");
  const [images, setImages] = useState<ImageFile[]>([]);

  // 위치 선택 핸들러
  const handleLocationSelect = (address: string) => {
    setLocation(address);
  };

  // 날짜 선택 핸들러
  const handleDateChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  };

  // 날짜 표시용 문자열
  const getScheduledDateString = () => {
    if (!startDate) return "";
    if (!endDate || startDate === endDate) return startDate;
    return `${startDate} ~ ${endDate}`;
  };

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
      });
    });

    setImages((prev) => [...prev, ...newImages].slice(0, 10));
    // 같은 파일을 다시 선택할 수 있도록 초기화
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
        }));
        setImages((prev) => [...prev, ...newImages].slice(0, 10));
      }
    } catch (error) {
      console.error("Image picker error:", error);
      showToast("이미지를 선택하는 중 오류가 발생했습니다.", "error");
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (projectId: string) => {
    const uploadedUrls: string[] = [];

    for (const image of images) {
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

  const saveWorkScopes = async (projectId: string) => {
    for (const scope of workScopes) {
      await supabase.from("onul_project_work_scopes").insert({
        major_project_id: projectId,
        tag_id: scope.tag_id,
        frequency: scope.frequency,
        scheduled_dates: scope.scheduled_dates,
        notes: scope.notes || null,
      });

      // 태그 사용 횟수 증가
      await supabase.rpc("increment_tag_usage", { tag_id: scope.tag_id });
    }
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      showToast("프로젝트 제목을 입력해주세요.", "error");
      return;
    }

    if (!profile?.id) {
      showToast("로그인이 필요합니다.", "error");
      return;
    }

    setLoading(true);
    try {
      // 작업범위 태그 이름들을 텍스트로도 저장 (호환성)
      const workScopeText = workScopes.map((s) => s.tag_name).join(", ");

      // 위치 (상세주소 포함)
      const fullLocation = detailAddress
        ? `${location} ${detailAddress}`.trim()
        : location.trim();

      const { data, error } = await supabase
        .from("onul_major_projects")
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          location: fullLocation || null,
          scheduled_date: startDate || null,
          scheduled_end_date: endDate || null,
          work_scope: workScopeText || null,
          notes: notes.trim() || null,
          status,
          manager_id: profile.id,
        })
        .select()
        .single();

      if (error) throw error;

      // 작업범위 태그 저장
      if (workScopes.length > 0) {
        await saveWorkScopes(data.id);
      }

      // 이미지 업로드
      if (images.length > 0) {
        const uploadedUrls = await uploadImages(data.id);
        if (uploadedUrls.length > 0) {
          await savePhotos(data.id, uploadedUrls);
        }
      }

      showToast("프로젝트가 생성되었습니다.", "success");
      router.replace(`/project/${data.id}`);
    } catch (error) {
      console.error("Create project error:", error);
      showToast("프로젝트 생성 중 오류가 발생했습니다.", "error");
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
        {/* 상태 선택 */}
        <View className="mb-6">
          <Text className="text-foreground font-medium mb-3">프로젝트 상태</Text>
          <View className="flex-row gap-3">
            <Pressable
              onPress={() => setStatus("draft")}
              disabled={loading}
              className={`flex-1 py-3 rounded-xl items-center border ${
                status === "draft"
                  ? "bg-primary border-primary"
                  : "bg-surface border-border"
              }`}
            >
              <Text
                className={`font-medium ${
                  status === "draft" ? "text-white" : "text-foreground"
                }`}
              >
                초안
              </Text>
              <Text
                className={`text-xs mt-1 ${
                  status === "draft" ? "text-white/80" : "text-muted"
                }`}
              >
                임시 저장
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setStatus("recruiting")}
              disabled={loading}
              className={`flex-1 py-3 rounded-xl items-center border ${
                status === "recruiting"
                  ? "bg-primary border-primary"
                  : "bg-surface border-border"
              }`}
            >
              <Text
                className={`font-medium ${
                  status === "recruiting" ? "text-white" : "text-foreground"
                }`}
              >
                모집중
              </Text>
              <Text
                className={`text-xs mt-1 ${
                  status === "recruiting" ? "text-white/80" : "text-muted"
                }`}
              >
                마스터 모집 시작
              </Text>
            </Pressable>
          </View>
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
              editable={!loading}
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
              editable={!loading}
              className="bg-white border border-border rounded-xl px-4 py-4 text-foreground"
              style={{ minHeight: 100, textAlignVertical: "top" }}
            />
          </View>

          {/* 위치 검색 및 상세주소 */}
          <View>
            <Text className="text-foreground font-medium mb-2">위치</Text>
            <LocationSearch
              value={location}
              onLocationSelect={handleLocationSelect}
              detailAddress={detailAddress}
              onDetailAddressChange={setDetailAddress}
              disabled={loading}
              placeholder="주소 검색 (클릭하여 검색)"
            />
          </View>

          {/* 예정일 (캘린더 날짜 범위 선택) */}
          <View>
            <Text className="text-foreground font-medium mb-2">예정일</Text>
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onDateChange={handleDateChange}
              disabled={loading}
              placeholder="날짜 선택 (클릭하여 선택)"
            />
          </View>

          {/* 작업범위 태그 */}
          <WorkScopeTagSelector
            selectedScopes={workScopes}
            onScopesChange={setWorkScopes}
            disabled={loading}
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
              editable={!loading}
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
                  disabled={loading}
                  className="w-24 h-24 rounded-xl border-2 border-dashed border-border items-center justify-center bg-surface"
                >
                  <ImagePlus size={24} color="#9CA3AF" />
                  <Text className="text-muted text-xs mt-1">추가</Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>

        {/* 안내 */}
        <View className="bg-surface border border-border rounded-xl p-4 mt-6">
          <Text className="text-muted text-sm">
            프로젝트 생성 후 소형 프로젝트(작업 구역)를 추가할 수 있습니다.
            {"\n"}마스터들은 소형 프로젝트 단위로 참가 신청을 하게 됩니다.
          </Text>
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
            <Text className="text-white font-semibold text-lg">
              프로젝트 생성
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
