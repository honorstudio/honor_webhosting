import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Image,
  Dimensions,
  Share,
  Alert,
  Modal,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import {
  MapPin,
  Calendar,
  Share2,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowLeftRight,
} from "lucide-react-native";
import { supabase } from "../../src/lib/supabase";
import { OnulProjectPhoto } from "../../src/types/database";

const { width, height } = Dimensions.get("window");

interface ProjectDetail {
  id: string;
  title: string;
  description: string | null;
  completed_at: string | null;
  work_scope: string | null;
  major_project: {
    title: string;
    location: string | null;
  } | null;
}

export default function PortfolioDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [photos, setPhotos] = useState<OnulProjectPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(
    null
  );
  const [viewMode, setViewMode] = useState<"grid" | "compare">("grid");

  const beforePhotos = photos.filter((p) => p.photo_type === "before");
  const afterPhotos = photos.filter((p) => p.photo_type === "after");

  const fetchPortfolioDetail = useCallback(async () => {
    if (!id) return;

    try {
      // 프로젝트 정보 조회
      const { data: projectData, error: projectError } = await supabase
        .from("onul_minor_projects")
        .select(`
          id,
          title,
          description,
          completed_at,
          work_scope,
          onul_major_projects (title, location)
        `)
        .eq("id", id)
        .single();

      if (projectError) {
        console.error("Error fetching project:", projectError);
        Alert.alert("오류", "포트폴리오를 불러올 수 없습니다.");
        router.back();
        return;
      }

      const majorProject = projectData.onul_major_projects as any;
      setProject({
        id: projectData.id,
        title: projectData.title,
        description: projectData.description,
        completed_at: projectData.completed_at,
        work_scope: projectData.work_scope,
        major_project: majorProject
          ? {
              title: majorProject.title,
              location: majorProject.location,
            }
          : null,
      });

      // 사진 조회
      const { data: photosData, error: photosError } = await supabase
        .from("onul_project_photos")
        .select("*")
        .eq("minor_project_id", id)
        .order("created_at", { ascending: true });

      if (photosError) {
        console.error("Error fetching photos:", photosError);
      } else {
        setPhotos(photosData || []);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchPortfolioDetail();
  }, [fetchPortfolioDetail]);

  const handleShare = async () => {
    if (!project) return;

    try {
      const message = `[오늘 포트폴리오]\n\n프로젝트: ${project.title}${
        project.major_project?.location
          ? `\n위치: ${project.major_project.location}`
          : ""
      }${project.work_scope ? `\n작업 범위: ${project.work_scope}` : ""}\n\n비포 사진: ${beforePhotos.length}장\n애프터 사진: ${afterPhotos.length}장`;

      await Share.share({
        message,
        title: `${project.title} 포트폴리오`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
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

  const openPhotoViewer = (index: number) => {
    setSelectedPhotoIndex(index);
  };

  const closePhotoViewer = () => {
    setSelectedPhotoIndex(null);
  };

  const nextPhoto = () => {
    if (selectedPhotoIndex !== null && selectedPhotoIndex < photos.length - 1) {
      setSelectedPhotoIndex(selectedPhotoIndex + 1);
    }
  };

  const prevPhoto = () => {
    if (selectedPhotoIndex !== null && selectedPhotoIndex > 0) {
      setSelectedPhotoIndex(selectedPhotoIndex - 1);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#67c0a1" />
      </View>
    );
  }

  if (!project) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-muted">포트폴리오를 찾을 수 없습니다.</Text>
      </View>
    );
  }

  const imageSize = (width - 48 - 8) / 2;

  return (
    <>
      <Stack.Screen
        options={{
          title: project.title,
          headerRight: () => (
            <Pressable onPress={handleShare} className="mr-4">
              <Share2 size={20} color="#67c0a1" />
            </Pressable>
          ),
        }}
      />

      <ScrollView className="flex-1 bg-background">
        {/* 프로젝트 정보 */}
        <View className="px-6 py-4">
          <View className="bg-white border border-border rounded-xl p-4 mb-4">
            <Text className="text-xl font-bold text-foreground mb-2">
              {project.title}
            </Text>

            {project.major_project && (
              <Text className="text-muted text-sm mb-2">
                {project.major_project.title}
              </Text>
            )}

            {project.major_project?.location && (
              <View className="flex-row items-center mb-2">
                <MapPin size={16} color="#6B7280" />
                <Text className="text-muted text-sm ml-1">
                  {project.major_project.location}
                </Text>
              </View>
            )}

            {project.completed_at && (
              <View className="flex-row items-center mb-2">
                <Calendar size={16} color="#6B7280" />
                <Text className="text-muted text-sm ml-1">
                  완료: {formatDate(project.completed_at)}
                </Text>
              </View>
            )}

            {project.work_scope && (
              <View className="mt-2 pt-2 border-t border-border">
                <Text className="text-muted text-sm">
                  작업 범위: {project.work_scope}
                </Text>
              </View>
            )}

            {project.description && (
              <View className="mt-2 pt-2 border-t border-border">
                <Text className="text-foreground text-sm">
                  {project.description}
                </Text>
              </View>
            )}
          </View>

          {/* 뷰 모드 토글 */}
          <View className="flex-row gap-2 mb-4">
            <Pressable
              onPress={() => setViewMode("grid")}
              className={`flex-1 py-2 rounded-lg items-center ${
                viewMode === "grid"
                  ? "bg-primary"
                  : "bg-surface border border-border"
              }`}
            >
              <Text
                className={`font-medium ${
                  viewMode === "grid" ? "text-white" : "text-muted"
                }`}
              >
                갤러리 보기
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setViewMode("compare")}
              className={`flex-1 py-2 rounded-lg items-center flex-row justify-center ${
                viewMode === "compare"
                  ? "bg-primary"
                  : "bg-surface border border-border"
              }`}
            >
              <ArrowLeftRight
                size={16}
                color={viewMode === "compare" ? "#FFFFFF" : "#6B7280"}
              />
              <Text
                className={`font-medium ml-1 ${
                  viewMode === "compare" ? "text-white" : "text-muted"
                }`}
              >
                비교 보기
              </Text>
            </Pressable>
          </View>

          {viewMode === "grid" ? (
            <>
              {/* 비포 사진 */}
              {beforePhotos.length > 0 && (
                <View className="mb-6">
                  <Text className="text-lg font-bold text-foreground mb-3">
                    비포 ({beforePhotos.length})
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {beforePhotos.map((photo, index) => (
                      <Pressable
                        key={photo.id}
                        onPress={() =>
                          openPhotoViewer(
                            photos.findIndex((p) => p.id === photo.id)
                          )
                        }
                      >
                        <Image
                          source={{ uri: photo.photo_url }}
                          style={{ width: imageSize, height: imageSize }}
                          className="rounded-lg"
                          resizeMode="cover"
                        />
                        {photo.work_area && (
                          <View className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded">
                            <Text className="text-white text-xs">
                              {photo.work_area}
                            </Text>
                          </View>
                        )}
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}

              {/* 애프터 사진 */}
              {afterPhotos.length > 0 && (
                <View className="mb-6">
                  <Text className="text-lg font-bold text-foreground mb-3">
                    애프터 ({afterPhotos.length})
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {afterPhotos.map((photo, index) => (
                      <Pressable
                        key={photo.id}
                        onPress={() =>
                          openPhotoViewer(
                            photos.findIndex((p) => p.id === photo.id)
                          )
                        }
                      >
                        <Image
                          source={{ uri: photo.photo_url }}
                          style={{ width: imageSize, height: imageSize }}
                          className="rounded-lg"
                          resizeMode="cover"
                        />
                        {photo.work_area && (
                          <View className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded">
                            <Text className="text-white text-xs">
                              {photo.work_area}
                            </Text>
                          </View>
                        )}
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}
            </>
          ) : (
            /* 비교 모드 */
            <View className="mb-6">
              {beforePhotos.map((beforePhoto, index) => {
                const afterPhoto = afterPhotos[index];
                if (!afterPhoto) return null;

                return (
                  <View key={beforePhoto.id} className="mb-4">
                    {beforePhoto.work_area && (
                      <Text className="text-foreground font-medium mb-2">
                        {beforePhoto.work_area}
                      </Text>
                    )}
                    <View className="flex-row gap-2">
                      <View className="flex-1">
                        <Text className="text-center text-muted text-xs mb-1">
                          비포
                        </Text>
                        <Pressable
                          onPress={() =>
                            openPhotoViewer(
                              photos.findIndex((p) => p.id === beforePhoto.id)
                            )
                          }
                        >
                          <Image
                            source={{ uri: beforePhoto.photo_url }}
                            style={{ height: imageSize }}
                            className="rounded-lg w-full"
                            resizeMode="cover"
                          />
                        </Pressable>
                      </View>
                      <View className="flex-1">
                        <Text className="text-center text-muted text-xs mb-1">
                          애프터
                        </Text>
                        <Pressable
                          onPress={() =>
                            openPhotoViewer(
                              photos.findIndex((p) => p.id === afterPhoto.id)
                            )
                          }
                        >
                          <Image
                            source={{ uri: afterPhoto.photo_url }}
                            style={{ height: imageSize }}
                            className="rounded-lg w-full"
                            resizeMode="cover"
                          />
                        </Pressable>
                      </View>
                    </View>
                  </View>
                );
              })}

              {beforePhotos.length === 0 || afterPhotos.length === 0 ? (
                <View className="bg-surface rounded-xl p-8 items-center">
                  <Text className="text-muted text-center">
                    비교할 사진이 없습니다
                  </Text>
                  <Text className="text-muted/60 text-sm text-center mt-1">
                    비포와 애프터 사진이 모두 필요합니다
                  </Text>
                </View>
              ) : null}
            </View>
          )}
        </View>
      </ScrollView>

      {/* 사진 뷰어 모달 */}
      <Modal
        visible={selectedPhotoIndex !== null}
        transparent
        animationType="fade"
        onRequestClose={closePhotoViewer}
      >
        <View className="flex-1 bg-black">
          {/* 닫기 버튼 */}
          <Pressable
            onPress={closePhotoViewer}
            className="absolute top-12 right-4 z-10 w-10 h-10 bg-black/50 rounded-full items-center justify-center"
          >
            <X size={24} color="#FFFFFF" />
          </Pressable>

          {/* 사진 */}
          {selectedPhotoIndex !== null && photos[selectedPhotoIndex] && (
            <View className="flex-1 items-center justify-center">
              <Image
                source={{ uri: photos[selectedPhotoIndex].photo_url }}
                style={{ width, height: height * 0.7 }}
                resizeMode="contain"
              />

              {/* 사진 정보 */}
              <View className="absolute bottom-20 left-0 right-0 px-6">
                <View className="bg-black/60 rounded-xl p-4">
                  <Text className="text-white font-medium">
                    {photos[selectedPhotoIndex].photo_type === "before"
                      ? "비포"
                      : "애프터"}{" "}
                    사진
                  </Text>
                  {photos[selectedPhotoIndex].work_area && (
                    <Text className="text-white/70 text-sm mt-1">
                      작업 영역: {photos[selectedPhotoIndex].work_area}
                    </Text>
                  )}
                  {photos[selectedPhotoIndex].description && (
                    <Text className="text-white/70 text-sm mt-1">
                      {photos[selectedPhotoIndex].description}
                    </Text>
                  )}
                </View>
              </View>

              {/* 네비게이션 */}
              <View className="absolute bottom-6 flex-row items-center justify-center gap-4">
                <Pressable
                  onPress={prevPhoto}
                  disabled={selectedPhotoIndex === 0}
                  className={`w-12 h-12 rounded-full items-center justify-center ${
                    selectedPhotoIndex === 0 ? "bg-white/20" : "bg-white/50"
                  }`}
                >
                  <ChevronLeft
                    size={24}
                    color={selectedPhotoIndex === 0 ? "#666" : "#000"}
                  />
                </Pressable>
                <Text className="text-white">
                  {selectedPhotoIndex + 1} / {photos.length}
                </Text>
                <Pressable
                  onPress={nextPhoto}
                  disabled={selectedPhotoIndex === photos.length - 1}
                  className={`w-12 h-12 rounded-full items-center justify-center ${
                    selectedPhotoIndex === photos.length - 1
                      ? "bg-white/20"
                      : "bg-white/50"
                  }`}
                >
                  <ChevronRight
                    size={24}
                    color={
                      selectedPhotoIndex === photos.length - 1 ? "#666" : "#000"
                    }
                  />
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </>
  );
}
