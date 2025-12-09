import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  ArrowRight,
} from "lucide-react-native";
import { supabase } from "../../src/lib/supabase";

const { width } = Dimensions.get("window");
const compareImageWidth = (width - 48 - 12) / 2;

interface Photo {
  id: string;
  photo_type: string;
  photo_url: string;
  work_area: string | null;
  description: string | null;
  created_at: string | null;
}

interface WorkAreaGroup {
  workArea: string;
  beforePhotos: Photo[];
  afterPhotos: Photo[];
}

export default function PhotoCompareScreen() {
  const router = useRouter();
  const { minorId } = useLocalSearchParams<{ minorId: string }>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [workAreaGroups, setWorkAreaGroups] = useState<WorkAreaGroup[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<{
    [key: string]: { before: number; after: number };
  }>({});

  const fetchPhotos = useCallback(async () => {
    if (!minorId) return;

    try {
      const { data, error } = await supabase
        .from("onul_project_photos")
        .select("id, photo_type, photo_url, work_area, description, created_at")
        .eq("minor_project_id", minorId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // 작업 구역별로 그룹화
      const groupMap = new Map<string, WorkAreaGroup>();

      (data || []).forEach((photo: Photo) => {
        const workArea = photo.work_area || "미지정";

        if (!groupMap.has(workArea)) {
          groupMap.set(workArea, {
            workArea,
            beforePhotos: [],
            afterPhotos: [],
          });
        }

        const group = groupMap.get(workArea)!;
        if (photo.photo_type === "before") {
          group.beforePhotos.push(photo);
        } else {
          group.afterPhotos.push(photo);
        }
      });

      const groups = Array.from(groupMap.values()).filter(
        (g) => g.beforePhotos.length > 0 || g.afterPhotos.length > 0
      );

      setWorkAreaGroups(groups);

      // 초기 선택 인덱스 설정
      const indices: { [key: string]: { before: number; after: number } } = {};
      groups.forEach((g) => {
        indices[g.workArea] = { before: 0, after: 0 };
      });
      setSelectedIndices(indices);
    } catch (error) {
      console.error("Error fetching photos:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [minorId]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPhotos();
  }, [fetchPhotos]);

  const navigatePhoto = (
    workArea: string,
    type: "before" | "after",
    direction: "prev" | "next"
  ) => {
    const group = workAreaGroups.find((g) => g.workArea === workArea);
    if (!group) return;

    const photos = type === "before" ? group.beforePhotos : group.afterPhotos;
    const currentIndex = selectedIndices[workArea]?.[type] || 0;

    let newIndex = currentIndex;
    if (direction === "prev") {
      newIndex = currentIndex > 0 ? currentIndex - 1 : photos.length - 1;
    } else {
      newIndex = currentIndex < photos.length - 1 ? currentIndex + 1 : 0;
    }

    setSelectedIndices((prev) => ({
      ...prev,
      [workArea]: {
        ...prev[workArea],
        [type]: newIndex,
      },
    }));
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#67c0a1" />
      </View>
    );
  }

  if (workAreaGroups.length === 0) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-6">
        <View className="w-20 h-20 bg-surface rounded-full items-center justify-center mb-4">
          <ImageIcon size={32} color="#9CA3AF" />
        </View>
        <Text className="text-muted text-center mb-2">
          비교할 사진이 없습니다
        </Text>
        <Text className="text-muted text-sm text-center">
          비포/애프터 사진을 먼저 업로드해주세요
        </Text>
        <Pressable
          onPress={() => router.push(`/photo/upload?minorId=${minorId}`)}
          className="mt-6 bg-primary px-6 py-3 rounded-xl active:opacity-80"
        >
          <Text className="text-white font-semibold">사진 업로드</Text>
        </Pressable>
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
        {/* 안내 */}
        <View className="bg-primary/10 px-6 py-3">
          <Text className="text-primary text-sm text-center">
            작업 구역별로 비포/애프터 사진을 비교할 수 있습니다
          </Text>
        </View>

        {/* 작업 구역별 비교 */}
        <View className="px-6 py-4 gap-6">
          {workAreaGroups.map((group) => {
            const beforeIndex = selectedIndices[group.workArea]?.before || 0;
            const afterIndex = selectedIndices[group.workArea]?.after || 0;
            const currentBefore = group.beforePhotos[beforeIndex];
            const currentAfter = group.afterPhotos[afterIndex];

            return (
              <View
                key={group.workArea}
                className="bg-white border border-border rounded-xl overflow-hidden"
              >
                {/* 구역 헤더 */}
                <View className="bg-surface px-4 py-3 border-b border-border">
                  <Text className="text-foreground font-semibold">
                    {group.workArea}
                  </Text>
                  <Text className="text-muted text-xs mt-1">
                    비포 {group.beforePhotos.length}장 / 애프터{" "}
                    {group.afterPhotos.length}장
                  </Text>
                </View>

                {/* 비교 뷰 */}
                <View className="p-4">
                  <View className="flex-row items-center gap-3">
                    {/* 비포 사진 */}
                    <View style={{ width: compareImageWidth }}>
                      <Text className="text-blue-600 font-medium text-sm mb-2 text-center">
                        BEFORE
                      </Text>
                      {currentBefore ? (
                        <View>
                          {/* 실제 이미지 표시 */}
                          <Image
                            source={{ uri: currentBefore.photo_url }}
                            style={{
                              width: compareImageWidth,
                              height: compareImageWidth,
                            }}
                            className="rounded-lg"
                            resizeMode="cover"
                          />

                          {/* 네비게이션 */}
                          {group.beforePhotos.length > 1 && (
                            <View className="flex-row justify-between mt-2">
                              <Pressable
                                onPress={() =>
                                  navigatePhoto(group.workArea, "before", "prev")
                                }
                                className="w-8 h-8 bg-surface rounded-full items-center justify-center"
                              >
                                <ChevronLeft size={16} color="#6B7280" />
                              </Pressable>
                              <Text className="text-muted text-xs self-center">
                                {beforeIndex + 1}/{group.beforePhotos.length}
                              </Text>
                              <Pressable
                                onPress={() =>
                                  navigatePhoto(group.workArea, "before", "next")
                                }
                                className="w-8 h-8 bg-surface rounded-full items-center justify-center"
                              >
                                <ChevronRight size={16} color="#6B7280" />
                              </Pressable>
                            </View>
                          )}
                        </View>
                      ) : (
                        <View
                          className="bg-surface rounded-lg items-center justify-center border border-dashed border-border"
                          style={{
                            width: compareImageWidth,
                            height: compareImageWidth,
                          }}
                        >
                          <Text className="text-muted text-xs">
                            비포 사진 없음
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* 화살표 */}
                    <View className="items-center justify-center">
                      <ArrowRight size={20} color="#9CA3AF" />
                    </View>

                    {/* 애프터 사진 */}
                    <View style={{ width: compareImageWidth }}>
                      <Text className="text-green-600 font-medium text-sm mb-2 text-center">
                        AFTER
                      </Text>
                      {currentAfter ? (
                        <View>
                          {/* 실제 이미지 표시 */}
                          <Image
                            source={{ uri: currentAfter.photo_url }}
                            style={{
                              width: compareImageWidth,
                              height: compareImageWidth,
                            }}
                            className="rounded-lg"
                            resizeMode="cover"
                          />

                          {/* 네비게이션 */}
                          {group.afterPhotos.length > 1 && (
                            <View className="flex-row justify-between mt-2">
                              <Pressable
                                onPress={() =>
                                  navigatePhoto(group.workArea, "after", "prev")
                                }
                                className="w-8 h-8 bg-surface rounded-full items-center justify-center"
                              >
                                <ChevronLeft size={16} color="#6B7280" />
                              </Pressable>
                              <Text className="text-muted text-xs self-center">
                                {afterIndex + 1}/{group.afterPhotos.length}
                              </Text>
                              <Pressable
                                onPress={() =>
                                  navigatePhoto(group.workArea, "after", "next")
                                }
                                className="w-8 h-8 bg-surface rounded-full items-center justify-center"
                              >
                                <ChevronRight size={16} color="#6B7280" />
                              </Pressable>
                            </View>
                          )}
                        </View>
                      ) : (
                        <View
                          className="bg-surface rounded-lg items-center justify-center border border-dashed border-border"
                          style={{
                            width: compareImageWidth,
                            height: compareImageWidth,
                          }}
                        >
                          <Text className="text-muted text-xs">
                            애프터 사진 없음
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* 설명 */}
                  {(currentBefore?.description || currentAfter?.description) && (
                    <View className="mt-4 pt-4 border-t border-border">
                      {currentBefore?.description && (
                        <View className="mb-2">
                          <Text className="text-blue-600 text-xs font-medium">
                            비포 설명
                          </Text>
                          <Text className="text-foreground text-sm">
                            {currentBefore.description}
                          </Text>
                        </View>
                      )}
                      {currentAfter?.description && (
                        <View>
                          <Text className="text-green-600 text-xs font-medium">
                            애프터 설명
                          </Text>
                          <Text className="text-foreground text-sm">
                            {currentAfter.description}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>

      </ScrollView>
    </View>
  );
}
