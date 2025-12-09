import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Image,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Camera,
  MapPin,
  Calendar,
  ChevronRight,
  Images,
} from "lucide-react-native";
import { supabase } from "../../src/lib/supabase";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48 - 12) / 2; // 패딩 48px, 간격 12px

interface PortfolioProject {
  id: string;
  title: string;
  location: string | null;
  completed_at: string | null;
  major_project_title: string | null;
  thumbnail_url: string | null;
  photo_count: number;
  before_count: number;
  after_count: number;
}

export default function PortfolioListScreen() {
  const router = useRouter();
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPortfolio = useCallback(async () => {
    try {
      // 완료된 소형 프로젝트 조회
      const { data: minorProjects, error } = await supabase
        .from("onul_minor_projects")
        .select(`
          id,
          title,
          completed_at,
          onul_major_projects (title, location)
        `)
        .eq("status", "completed")
        .order("completed_at", { ascending: false });

      if (error) {
        console.error("Error fetching projects:", error);
        return;
      }

      // 각 프로젝트의 사진 정보 조회
      const portfolioProjects = await Promise.all(
        (minorProjects || []).map(async (project) => {
          // 비포/애프터 사진 개수
          const { data: photos } = await supabase
            .from("onul_project_photos")
            .select("id, photo_type, photo_url")
            .eq("minor_project_id", project.id);

          const beforePhotos = (photos || []).filter(
            (p) => p.photo_type === "before"
          );
          const afterPhotos = (photos || []).filter(
            (p) => p.photo_type === "after"
          );

          // 썸네일로 사용할 애프터 사진 (없으면 비포 사진)
          const thumbnailPhoto =
            afterPhotos[0]?.photo_url || beforePhotos[0]?.photo_url || null;

          const majorProject = project.onul_major_projects as any;

          return {
            id: project.id,
            title: project.title,
            location: majorProject?.location || null,
            completed_at: project.completed_at,
            major_project_title: majorProject?.title || null,
            thumbnail_url: thumbnailPhoto,
            photo_count: (photos || []).length,
            before_count: beforePhotos.length,
            after_count: afterPhotos.length,
          };
        })
      );

      // 사진이 있는 프로젝트만 필터링
      const projectsWithPhotos = portfolioProjects.filter(
        (p) => p.photo_count > 0
      );

      setProjects(projectsWithPhotos);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPortfolio();
  }, [fetchPortfolio]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#67c0a1" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#67c0a1"
        />
      }
    >
      <View className="px-6 py-4">
        {/* 헤더 설명 */}
        <View className="bg-primary/10 rounded-xl p-4 mb-6">
          <Text className="text-primary font-medium">
            완료된 프로젝트의 비포/애프터 사진을 확인하세요.
          </Text>
          <Text className="text-primary/70 text-sm mt-1">
            총 {projects.length}개의 포트폴리오
          </Text>
        </View>

        {projects.length > 0 ? (
          <View className="flex-row flex-wrap gap-3">
            {projects.map((project) => (
              <Pressable
                key={project.id}
                onPress={() => router.push(`/portfolio/${project.id}`)}
                className="bg-white border border-border rounded-xl overflow-hidden active:opacity-80"
                style={{ width: CARD_WIDTH }}
              >
                {/* 썸네일 */}
                <View
                  className="bg-surface items-center justify-center"
                  style={{ height: CARD_WIDTH }}
                >
                  {project.thumbnail_url ? (
                    <Image
                      source={{ uri: project.thumbnail_url }}
                      style={{ width: CARD_WIDTH, height: CARD_WIDTH }}
                      resizeMode="cover"
                    />
                  ) : (
                    <Camera size={40} color="#9CA3AF" />
                  )}

                  {/* 사진 개수 배지 */}
                  <View className="absolute bottom-2 right-2 bg-black/60 px-2 py-1 rounded-lg flex-row items-center">
                    <Images size={12} color="#FFFFFF" />
                    <Text className="text-white text-xs ml-1">
                      {project.photo_count}
                    </Text>
                  </View>
                </View>

                {/* 정보 */}
                <View className="p-3">
                  <Text
                    className="text-foreground font-semibold"
                    numberOfLines={1}
                  >
                    {project.title}
                  </Text>

                  {project.major_project_title && (
                    <Text
                      className="text-muted text-xs mt-0.5"
                      numberOfLines={1}
                    >
                      {project.major_project_title}
                    </Text>
                  )}

                  {project.location && (
                    <View className="flex-row items-center mt-1">
                      <MapPin size={12} color="#6B7280" />
                      <Text
                        className="text-muted text-xs ml-1"
                        numberOfLines={1}
                      >
                        {project.location}
                      </Text>
                    </View>
                  )}

                  <View className="flex-row items-center justify-between mt-2">
                    <View className="flex-row gap-2">
                      <View className="bg-blue-100 px-1.5 py-0.5 rounded">
                        <Text className="text-blue-600 text-[10px]">
                          비포 {project.before_count}
                        </Text>
                      </View>
                      <View className="bg-green-100 px-1.5 py-0.5 rounded">
                        <Text className="text-green-600 text-[10px]">
                          애프터 {project.after_count}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {project.completed_at && (
                    <Text className="text-muted/60 text-[10px] mt-1">
                      {formatDate(project.completed_at)}
                    </Text>
                  )}
                </View>
              </Pressable>
            ))}
          </View>
        ) : (
          <View className="items-center py-20">
            <View className="w-20 h-20 bg-surface rounded-full items-center justify-center mb-4">
              <Images size={32} color="#9CA3AF" />
            </View>
            <Text className="text-muted text-center">
              아직 완료된 포트폴리오가 없습니다
            </Text>
            <Text className="text-muted/60 text-sm text-center mt-1">
              프로젝트 완료 후 사진을 업로드하면 포트폴리오가 생성됩니다
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
