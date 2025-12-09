import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Camera, Image as ImageIcon, ArrowLeftRight } from "lucide-react-native";
import { useAuth } from "../../src/contexts/AuthContext";
import { supabase } from "../../src/lib/supabase";

const { width } = Dimensions.get("window");
const imageSize = (width - 48 - 16) / 3; // 3열 그리드

interface Photo {
  id: string;
  photo_type: string;
  photo_url: string;
  work_area: string | null;
  description: string | null;
  created_at: string | null;
  uploader: {
    name: string | null;
  } | null;
}

interface ProjectInfo {
  title: string;
  major_project: {
    title: string;
  } | null;
}

export default function PhotoGalleryScreen() {
  const router = useRouter();
  const { minorId } = useLocalSearchParams<{ minorId: string }>();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [project, setProject] = useState<ProjectInfo | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [filter, setFilter] = useState<"all" | "before" | "after">("all");

  const fetchData = useCallback(async () => {
    if (!minorId) return;

    try {
      // 프로젝트 정보 조회
      const { data: projectData, error: projectError } = await supabase
        .from("onul_minor_projects")
        .select(`
          title,
          onul_major_projects (
            title
          )
        `)
        .eq("id", minorId)
        .single();

      if (projectError) throw projectError;

      setProject({
        title: projectData.title,
        major_project: projectData.onul_major_projects,
      });

      // 사진 목록 조회
      const { data: photoData, error: photoError } = await supabase
        .from("onul_project_photos")
        .select(`
          id,
          photo_type,
          photo_url,
          work_area,
          description,
          created_at,
          uploader:uploader_id (
            name
          )
        `)
        .eq("minor_project_id", minorId)
        .order("created_at", { ascending: false });

      if (photoError) throw photoError;

      setPhotos(photoData || []);
    } catch (error) {
      console.error("Error fetching gallery data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [minorId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const filteredPhotos = photos.filter((photo) => {
    if (filter === "all") return true;
    return photo.photo_type === filter;
  });

  const beforePhotos = photos.filter((p) => p.photo_type === "before");
  const afterPhotos = photos.filter((p) => p.photo_type === "after");

  const isParticipant =
    profile?.role === "super_admin" ||
    profile?.role === "project_manager" ||
    profile?.role === "master";

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#67c0a1" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#67c0a1"
          />
        }
      >
        {/* 프로젝트 정보 */}
        <View className="bg-white px-6 py-4 border-b border-border">
          {project?.major_project && (
            <Text className="text-muted text-sm">
              {project.major_project.title}
            </Text>
          )}
          <Text className="text-foreground font-bold text-lg">
            {project?.title}
          </Text>
        </View>

        {/* 통계 */}
        <View className="flex-row px-6 py-4 gap-3">
          <View className="flex-1 bg-blue-50 rounded-xl p-4 items-center">
            <Text className="text-blue-600 font-bold text-2xl">
              {beforePhotos.length}
            </Text>
            <Text className="text-blue-600 text-sm">비포</Text>
          </View>
          <View className="flex-1 bg-green-50 rounded-xl p-4 items-center">
            <Text className="text-green-600 font-bold text-2xl">
              {afterPhotos.length}
            </Text>
            <Text className="text-green-600 text-sm">애프터</Text>
          </View>
          <Pressable
            onPress={() =>
              router.push(`/photo/compare?minorId=${minorId}`)
            }
            className="flex-1 bg-purple-50 rounded-xl p-4 items-center active:opacity-80"
          >
            <ArrowLeftRight size={24} color="#9333EA" />
            <Text className="text-purple-600 text-sm mt-1">비교</Text>
          </Pressable>
        </View>

        {/* 필터 */}
        <View className="flex-row px-6 mb-4 gap-2">
          {[
            { key: "all", label: "전체" },
            { key: "before", label: "비포" },
            { key: "after", label: "애프터" },
          ].map((item) => (
            <Pressable
              key={item.key}
              onPress={() => setFilter(item.key as typeof filter)}
              className={`px-4 py-2 rounded-full ${
                filter === item.key
                  ? "bg-primary"
                  : "bg-surface border border-border"
              }`}
            >
              <Text
                className={`font-medium ${
                  filter === item.key ? "text-white" : "text-foreground"
                }`}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* 사진 그리드 */}
        {filteredPhotos.length > 0 ? (
          <View className="px-6 pb-24">
            <View className="flex-row flex-wrap gap-2">
              {filteredPhotos.map((photo) => (
                <Pressable
                  key={photo.id}
                  className="relative"
                  style={{ width: imageSize, height: imageSize }}
                >
                  {/* 실제 이미지 표시 */}
                  <Image
                    source={{ uri: photo.photo_url }}
                    style={{ width: imageSize, height: imageSize }}
                    className="rounded-lg"
                    resizeMode="cover"
                  />

                  {/* 타입 뱃지 */}
                  <View
                    className={`absolute top-1 left-1 px-2 py-0.5 rounded ${
                      photo.photo_type === "before"
                        ? "bg-blue-500"
                        : "bg-green-500"
                    }`}
                  >
                    <Text className="text-white text-xs font-medium">
                      {photo.photo_type === "before" ? "B" : "A"}
                    </Text>
                  </View>

                  {/* 작업 영역 표시 */}
                  {photo.work_area && (
                    <View className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1 rounded-b-lg">
                      <Text className="text-white text-xs" numberOfLines={1}>
                        {photo.work_area}
                      </Text>
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        ) : (
          <View className="px-6 py-12 items-center">
            <View className="w-20 h-20 bg-surface rounded-full items-center justify-center mb-4">
              <ImageIcon size={32} color="#9CA3AF" />
            </View>
            <Text className="text-muted text-center">
              아직 등록된 사진이 없습니다
            </Text>
            {isParticipant && (
              <Pressable
                onPress={() => router.push(`/photo/upload?minorId=${minorId}`)}
                className="mt-4 bg-primary px-6 py-3 rounded-xl active:opacity-80"
              >
                <Text className="text-white font-semibold">사진 업로드</Text>
              </Pressable>
            )}
          </View>
        )}
      </ScrollView>

      {/* FAB - 사진 업로드 */}
      {isParticipant && filteredPhotos.length > 0 && (
        <Pressable
          onPress={() => router.push(`/photo/upload?minorId=${minorId}`)}
          className="absolute bottom-6 right-6 w-14 h-14 bg-primary rounded-full items-center justify-center shadow-lg active:opacity-80"
        >
          <Camera size={24} color="#FFFFFF" />
        </Pressable>
      )}
    </View>
  );
}
