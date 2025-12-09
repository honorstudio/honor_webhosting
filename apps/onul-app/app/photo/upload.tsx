import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Camera, Plus, X, Upload, Check, ChevronDown } from "lucide-react-native";
import { useAuth } from "../../src/contexts/AuthContext";
import { supabase } from "../../src/lib/supabase";
import {
  MINIO_CONFIG,
  generateFileName,
  getUploadPath,
} from "../../src/lib/minio";

interface SelectedImage {
  uri: string;
  type: string;
  name: string;
}

interface WorkAreaStatus {
  name: string;
  beforeCount: number;
  afterCount: number;
}

export default function PhotoUploadScreen() {
  const router = useRouter();
  const { minorId } = useLocalSearchParams<{ minorId: string }>();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [projectTitle, setProjectTitle] = useState("");
  const [workAreas, setWorkAreas] = useState<WorkAreaStatus[]>([]);
  const [selectedWorkArea, setSelectedWorkArea] = useState<string>("");
  const [showWorkAreaPicker, setShowWorkAreaPicker] = useState(false);
  const [description, setDescription] = useState("");
  const [photoType, setPhotoType] = useState<"before" | "after">("before");
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);

  const fetchProjectInfo = useCallback(async () => {
    if (!minorId) return;

    setLoading(true);
    try {
      // 프로젝트 정보 조회
      const { data: projectData, error: projectError } = await supabase
        .from("onul_minor_projects")
        .select("title, work_scope")
        .eq("id", minorId)
        .single();

      if (projectError) throw projectError;

      setProjectTitle(projectData.title);

      // 작업범위를 파싱하여 작업구역 목록 생성
      const workScopeList = projectData.work_scope
        ? projectData.work_scope.split(",").map((s: string) => s.trim()).filter(Boolean)
        : [];

      // 각 작업구역별 비포/애프터 사진 수 조회
      const { data: photoData, error: photoError } = await supabase
        .from("onul_project_photos")
        .select("work_area, photo_type")
        .eq("minor_project_id", minorId);

      if (photoError) throw photoError;

      // 작업구역별 상태 계산
      const statusMap = new Map<string, WorkAreaStatus>();

      // 먼저 work_scope에서 가져온 작업구역들 추가
      workScopeList.forEach((area: string) => {
        statusMap.set(area, { name: area, beforeCount: 0, afterCount: 0 });
      });

      // 실제 업로드된 사진들의 작업구역도 추가
      (photoData || []).forEach((photo: any) => {
        const area = photo.work_area || "미지정";
        if (!statusMap.has(area)) {
          statusMap.set(area, { name: area, beforeCount: 0, afterCount: 0 });
        }
        const status = statusMap.get(area)!;
        if (photo.photo_type === "before") {
          status.beforeCount++;
        } else {
          status.afterCount++;
        }
      });

      const areas = Array.from(statusMap.values());
      setWorkAreas(areas);

      // 첫 번째 작업구역 자동 선택
      if (areas.length > 0 && !selectedWorkArea) {
        const firstArea = areas[0];
        setSelectedWorkArea(firstArea.name);
        // 비포가 있으면 애프터 선택
        if (firstArea.beforeCount > 0 && firstArea.afterCount === 0) {
          setPhotoType("after");
        }
      }
    } catch (error) {
      console.error("Error fetching project:", error);
    } finally {
      setLoading(false);
    }
  }, [minorId]);

  useEffect(() => {
    fetchProjectInfo();
  }, [fetchProjectInfo]);

  // 작업구역 선택 시 비포/애프터 타입 자동 설정
  const handleSelectWorkArea = (area: WorkAreaStatus) => {
    setSelectedWorkArea(area.name);
    setShowWorkAreaPicker(false);
    // 비포가 있고 애프터가 없으면 자동으로 애프터 선택
    if (area.beforeCount > 0 && area.afterCount === 0) {
      setPhotoType("after");
    } else if (area.beforeCount === 0) {
      setPhotoType("before");
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("권한 필요", "사진 라이브러리 접근 권한이 필요합니다.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5 - selectedImages.length,
    });

    if (!result.canceled && result.assets) {
      const newImages: SelectedImage[] = result.assets.map((asset) => ({
        uri: asset.uri,
        type: asset.mimeType || "image/jpeg",
        name: asset.fileName || generateFileName("photo.jpg"),
      }));
      setSelectedImages([...selectedImages, ...newImages].slice(0, 5));
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("권한 필요", "카메라 접근 권한이 필요합니다.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const newImage: SelectedImage = {
        uri: asset.uri,
        type: asset.mimeType || "image/jpeg",
        name: asset.fileName || generateFileName("photo.jpg"),
      };
      setSelectedImages([...selectedImages, newImage].slice(0, 5));
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!minorId || !profile?.id) {
      Alert.alert("오류", "프로젝트 정보가 없습니다.");
      return;
    }

    if (selectedImages.length === 0) {
      Alert.alert("알림", "업로드할 사진을 선택해주세요.");
      return;
    }

    setUploading(true);
    try {
      // 각 이미지에 대해 메타데이터를 DB에 저장
      // 실제 파일 업로드는 NAS MinIO가 설정된 후 연동
      const uploadPromises = selectedImages.map(async (image) => {
        const filename = generateFileName(image.name);
        const path = getUploadPath(minorId, photoType, filename);
        const photoUrl = `${MINIO_CONFIG.endpoint}/${MINIO_CONFIG.bucket}/${path}`;

        // DB에 메타데이터 저장
        const { error } = await supabase.from("onul_project_photos").insert({
          minor_project_id: minorId,
          uploader_id: profile.id,
          photo_type: photoType,
          photo_url: photoUrl,
          work_area: selectedWorkArea || null,
          description: description || null,
        });

        if (error) throw error;

        // TODO: 실제 MinIO 업로드 구현
        // 현재는 메타데이터만 저장됨
        // NAS MinIO 설정 완료 후 uploadToMinio() 함수 연동 필요

        return { success: true, path };
      });

      await Promise.all(uploadPromises);

      Alert.alert(
        "완료",
        `${selectedImages.length}장의 사진 정보가 저장되었습니다.\n\n(참고: 실제 파일 업로드는 NAS MinIO 설정 후 활성화됩니다)`,
        [{ text: "확인", onPress: () => router.back() }]
      );
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("오류", "사진 업로드 중 오류가 발생했습니다.");
    } finally {
      setUploading(false);
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
    <ScrollView className="flex-1 bg-background">
      <View className="px-6 pt-6">
        {/* 프로젝트 정보 */}
        <View className="bg-white border border-border rounded-xl p-4 mb-6">
          <Text className="text-muted text-sm">프로젝트</Text>
          <Text className="text-foreground font-semibold text-lg">
            {projectTitle}
          </Text>
        </View>

        {/* 사진 타입 선택 */}
        <View className="mb-6">
          <Text className="text-foreground font-medium mb-3">사진 타입</Text>
          <View className="flex-row gap-3">
            <Pressable
              onPress={() => setPhotoType("before")}
              disabled={uploading}
              className={`flex-1 py-3 rounded-xl items-center border ${
                photoType === "before"
                  ? "bg-primary border-primary"
                  : "bg-surface border-border"
              }`}
            >
              <Text
                className={`font-semibold ${
                  photoType === "before" ? "text-white" : "text-foreground"
                }`}
              >
                비포 (Before)
              </Text>
              <Text
                className={`text-xs mt-1 ${
                  photoType === "before" ? "text-white/80" : "text-muted"
                }`}
              >
                작업 전 사진
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setPhotoType("after")}
              disabled={uploading}
              className={`flex-1 py-3 rounded-xl items-center border ${
                photoType === "after"
                  ? "bg-primary border-primary"
                  : "bg-surface border-border"
              }`}
            >
              <Text
                className={`font-semibold ${
                  photoType === "after" ? "text-white" : "text-foreground"
                }`}
              >
                애프터 (After)
              </Text>
              <Text
                className={`text-xs mt-1 ${
                  photoType === "after" ? "text-white/80" : "text-muted"
                }`}
              >
                작업 후 사진
              </Text>
            </Pressable>
          </View>
        </View>

        {/* 작업 구역 선택 */}
        <View className="mb-6">
          <Text className="text-foreground font-medium mb-2">작업 구역</Text>
          {workAreas.length > 0 ? (
            <View>
              <Pressable
                onPress={() => !uploading && setShowWorkAreaPicker(!showWorkAreaPicker)}
                className="bg-white border border-border rounded-xl px-4 py-4 flex-row items-center justify-between"
              >
                <Text className={selectedWorkArea ? "text-foreground" : "text-muted"}>
                  {selectedWorkArea || "작업 구역을 선택하세요"}
                </Text>
                <ChevronDown size={20} color="#6B7280" />
              </Pressable>

              {/* 드롭다운 목록 */}
              {showWorkAreaPicker && (
                <View className="bg-white border border-border rounded-xl mt-2 overflow-hidden">
                  {workAreas.map((area, index) => (
                    <Pressable
                      key={area.name}
                      onPress={() => handleSelectWorkArea(area)}
                      className={`px-4 py-3 flex-row items-center justify-between ${
                        index < workAreas.length - 1 ? "border-b border-border" : ""
                      } ${selectedWorkArea === area.name ? "bg-primary/10" : ""}`}
                    >
                      <View className="flex-1">
                        <Text className={`font-medium ${
                          selectedWorkArea === area.name ? "text-primary" : "text-foreground"
                        }`}>
                          {area.name}
                        </Text>
                        <View className="flex-row items-center mt-1">
                          <Text className={`text-xs ${area.beforeCount > 0 ? "text-blue-500" : "text-muted"}`}>
                            비포 {area.beforeCount}장
                          </Text>
                          <Text className="text-muted text-xs mx-2">/</Text>
                          <Text className={`text-xs ${area.afterCount > 0 ? "text-green-500" : "text-muted"}`}>
                            애프터 {area.afterCount}장
                          </Text>
                        </View>
                      </View>
                      {selectedWorkArea === area.name && (
                        <Check size={20} color="#67c0a1" />
                      )}
                    </Pressable>
                  ))}
                </View>
              )}

              {/* 선택된 작업구역 상태 표시 */}
              {selectedWorkArea && (
                <View className="bg-surface rounded-xl p-3 mt-3">
                  {(() => {
                    const area = workAreas.find(a => a.name === selectedWorkArea);
                    if (!area) return null;
                    return (
                      <View className="flex-row items-center justify-between">
                        <Text className="text-foreground font-medium">{area.name}</Text>
                        <View className="flex-row items-center gap-3">
                          <View className={`px-2 py-1 rounded ${area.beforeCount > 0 ? "bg-blue-100" : "bg-surface border border-dashed border-border"}`}>
                            <Text className={`text-xs ${area.beforeCount > 0 ? "text-blue-600" : "text-muted"}`}>
                              {area.beforeCount > 0 ? `비포 ${area.beforeCount}장` : "비포 없음"}
                            </Text>
                          </View>
                          <Text className="text-muted">→</Text>
                          <View className={`px-2 py-1 rounded ${area.afterCount > 0 ? "bg-green-100" : "bg-surface border border-dashed border-border"}`}>
                            <Text className={`text-xs ${area.afterCount > 0 ? "text-green-600" : "text-muted"}`}>
                              {area.afterCount > 0 ? `애프터 ${area.afterCount}장` : "애프터 없음"}
                            </Text>
                          </View>
                        </View>
                      </View>
                    );
                  })()}
                </View>
              )}
            </View>
          ) : (
            <TextInput
              value={selectedWorkArea}
              onChangeText={setSelectedWorkArea}
              placeholder="예: 2층 식품매장 진열대"
              placeholderTextColor="#9CA3AF"
              editable={!uploading}
              className="bg-white border border-border rounded-xl px-4 py-4 text-foreground"
            />
          )}
        </View>

        {/* 사진 선택 */}
        <View className="mb-6">
          <Text className="text-foreground font-medium mb-3">
            사진 선택 ({selectedImages.length}/5)
          </Text>

          <View className="flex-row flex-wrap gap-3">
            {selectedImages.map((image, index) => (
              <View key={index} className="relative">
                <Image
                  source={{ uri: image.uri }}
                  className="w-24 h-24 rounded-xl"
                />
                <Pressable
                  onPress={() => removeImage(index)}
                  disabled={uploading}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full items-center justify-center"
                >
                  <X size={14} color="#FFFFFF" />
                </Pressable>
              </View>
            ))}

            {selectedImages.length < 5 && (
              <View className="flex-row gap-3">
                <Pressable
                  onPress={pickImage}
                  disabled={uploading}
                  className="w-24 h-24 bg-surface border border-dashed border-border rounded-xl items-center justify-center"
                >
                  <Plus size={24} color="#9CA3AF" />
                  <Text className="text-muted text-xs mt-1">갤러리</Text>
                </Pressable>

                <Pressable
                  onPress={takePhoto}
                  disabled={uploading}
                  className="w-24 h-24 bg-surface border border-dashed border-border rounded-xl items-center justify-center"
                >
                  <Camera size={24} color="#9CA3AF" />
                  <Text className="text-muted text-xs mt-1">촬영</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>

        {/* 설명 */}
        <View className="mb-6">
          <Text className="text-foreground font-medium mb-2">
            특이사항/설명
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="작업 내용이나 특이사항을 입력하세요"
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={3}
            editable={!uploading}
            className="bg-white border border-border rounded-xl px-4 py-4 text-foreground"
            style={{ minHeight: 80, textAlignVertical: "top" }}
          />
        </View>

        {/* 업로드 버튼 */}
        <Pressable
          onPress={handleUpload}
          disabled={uploading || selectedImages.length === 0}
          className={`w-full py-4 rounded-xl items-center mb-8 flex-row justify-center ${
            uploading || selectedImages.length === 0
              ? "bg-primary/50"
              : "bg-primary active:opacity-80"
          }`}
        >
          {uploading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Upload size={20} color="#FFFFFF" />
              <Text className="text-white font-semibold text-lg ml-2">
                업로드
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}
