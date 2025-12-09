import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Search, UserPlus, Users, Check } from "lucide-react-native";
import { supabase } from "../../src/lib/supabase";

interface Master {
  id: string;
  name: string | null;
  phone: string | null;
  skills: string[] | null;
}

interface MinorProject {
  id: string;
  title: string;
  required_masters: number;
  approved_count: number;
}

export default function MasterAddScreen() {
  const router = useRouter();
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const [loading, setLoading] = useState(true);
  const [masters, setMasters] = useState<Master[]>([]);
  const [minorProjects, setMinorProjects] = useState<MinorProject[]>([]);
  const [selectedMaster, setSelectedMaster] = useState<string | null>(null);
  const [selectedMinorProject, setSelectedMinorProject] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 마스터 목록 조회
        const { data: masterData, error: masterError } = await supabase
          .from("onul_profiles")
          .select("id, name, phone, skills")
          .eq("role", "master")
          .eq("is_active", true)
          .order("name");

        if (masterError) throw masterError;
        setMasters(masterData || []);

        // 소형 프로젝트 목록 조회 (참가자 수 포함)
        if (projectId) {
          const { data: minorData, error: minorError } = await supabase
            .from("onul_minor_projects")
            .select(`
              id,
              title,
              required_masters,
              onul_project_participants (
                id,
                status
              )
            `)
            .eq("major_project_id", projectId)
            .order("created_at");

          if (minorError) throw minorError;

          const mapped = (minorData || []).map((mp: any) => ({
            id: mp.id,
            title: mp.title,
            required_masters: mp.required_masters || 1,
            approved_count: (mp.onul_project_participants || []).filter(
              (p: any) => p.status === "approved"
            ).length,
          }));

          setMinorProjects(mapped);
        }
      } catch (error) {
        console.error("Fetch error:", error);
        Alert.alert("오류", "데이터를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  const handleAddMaster = async () => {
    if (!selectedMaster || !selectedMinorProject) {
      Alert.alert("알림", "마스터와 작업 범위를 모두 선택해주세요.");
      return;
    }

    setAdding(true);
    try {
      // 이미 참가 중인지 확인
      const { data: existing } = await supabase
        .from("onul_project_participants")
        .select("id")
        .eq("minor_project_id", selectedMinorProject)
        .eq("master_id", selectedMaster)
        .single();

      if (existing) {
        Alert.alert("알림", "이미 해당 작업 범위에 참가 중인 마스터입니다.");
        setAdding(false);
        return;
      }

      // 참가자 추가 (바로 승인 상태로)
      const { error } = await supabase.from("onul_project_participants").insert({
        minor_project_id: selectedMinorProject,
        master_id: selectedMaster,
        status: "approved",
        applied_at: new Date().toISOString(),
        approved_at: new Date().toISOString(),
      });

      if (error) throw error;

      Alert.alert("완료", "마스터가 추가되었습니다.");
      router.back();
    } catch (error: any) {
      console.error("Add master error:", error);
      if (error.code === "23505") {
        Alert.alert("알림", "이미 참가 중인 마스터입니다.");
      } else {
        Alert.alert("오류", "마스터 추가 중 오류가 발생했습니다.");
      }
    } finally {
      setAdding(false);
    }
  };

  const filteredMasters = masters.filter(
    (m) =>
      m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.phone?.includes(searchQuery)
  );

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#67c0a1" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1 px-6 pt-6">
        {/* 작업 범위 선택 */}
        <View className="mb-6">
          <Text className="text-foreground font-bold mb-3">
            1. 작업 범위 선택
          </Text>
          {minorProjects.length > 0 ? (
            <View className="gap-2">
              {minorProjects.map((mp) => (
                <Pressable
                  key={mp.id}
                  onPress={() => setSelectedMinorProject(mp.id)}
                  className={`flex-row items-center justify-between p-4 rounded-xl border ${
                    selectedMinorProject === mp.id
                      ? "bg-primary/10 border-primary"
                      : "bg-white border-border"
                  }`}
                >
                  <View className="flex-1">
                    <Text
                      className={`font-medium ${
                        selectedMinorProject === mp.id
                          ? "text-primary"
                          : "text-foreground"
                      }`}
                    >
                      {mp.title}
                    </Text>
                    <Text className="text-muted text-sm">
                      {mp.approved_count}/{mp.required_masters}명 배정됨
                    </Text>
                  </View>
                  {selectedMinorProject === mp.id && (
                    <Check size={20} color="#67c0a1" />
                  )}
                </Pressable>
              ))}
            </View>
          ) : (
            <View className="bg-surface rounded-xl p-4">
              <Text className="text-muted text-center">
                먼저 작업 범위를 추가해주세요
              </Text>
            </View>
          )}
        </View>

        {/* 마스터 검색 */}
        <View className="mb-4">
          <Text className="text-foreground font-bold mb-3">
            2. 마스터 선택
          </Text>
          <View className="flex-row items-center bg-white border border-border rounded-xl px-4">
            <Search size={20} color="#9CA3AF" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="이름 또는 전화번호로 검색"
              placeholderTextColor="#9CA3AF"
              className="flex-1 py-4 ml-3 text-foreground"
            />
          </View>
        </View>

        {/* 마스터 목록 */}
        <View className="gap-2 mb-8">
          {filteredMasters.length > 0 ? (
            filteredMasters.map((master) => (
              <Pressable
                key={master.id}
                onPress={() => setSelectedMaster(master.id)}
                className={`flex-row items-center p-4 rounded-xl border ${
                  selectedMaster === master.id
                    ? "bg-primary/10 border-primary"
                    : "bg-white border-border"
                }`}
              >
                <View className="w-10 h-10 rounded-full bg-surface items-center justify-center">
                  <Users size={20} color="#6B7280" />
                </View>
                <View className="flex-1 ml-3">
                  <Text
                    className={`font-medium ${
                      selectedMaster === master.id
                        ? "text-primary"
                        : "text-foreground"
                    }`}
                  >
                    {master.name || "이름 없음"}
                  </Text>
                  {master.phone && (
                    <Text className="text-muted text-sm">{master.phone}</Text>
                  )}
                  {master.skills && master.skills.length > 0 && (
                    <Text className="text-muted text-xs mt-1">
                      {master.skills.slice(0, 3).join(", ")}
                    </Text>
                  )}
                </View>
                {selectedMaster === master.id && (
                  <Check size={20} color="#67c0a1" />
                )}
              </Pressable>
            ))
          ) : (
            <View className="bg-surface rounded-xl p-8 items-center">
              <Text className="text-muted">
                {searchQuery ? "검색 결과가 없습니다" : "등록된 마스터가 없습니다"}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 추가 버튼 */}
      <View className="px-6 pb-6 pt-4 border-t border-border bg-white">
        <Pressable
          onPress={handleAddMaster}
          disabled={adding || !selectedMaster || !selectedMinorProject}
          className={`w-full flex-row items-center justify-center py-4 rounded-xl ${
            adding || !selectedMaster || !selectedMinorProject
              ? "bg-primary/50"
              : "bg-primary active:opacity-80"
          }`}
        >
          {adding ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <UserPlus size={20} color="#FFFFFF" />
              <Text className="text-white font-semibold text-lg ml-2">
                마스터 추가
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}
