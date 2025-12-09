import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { User, X, Plus } from "lucide-react-native";
import { useAuth } from "../../src/contexts/AuthContext";
import { supabase } from "../../src/lib/supabase";

export default function ProfileEditScreen() {
  const router = useRouter();
  const { profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setPhone(profile.phone || "");
      setBio(profile.bio || "");
      setSkills(profile.skills || []);
    }
  }, [profile]);

  const addSkill = () => {
    const trimmedSkill = newSkill.trim();
    if (trimmedSkill && !skills.includes(trimmedSkill)) {
      setSkills([...skills, trimmedSkill]);
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("알림", "이름을 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("onul_profiles")
        .update({
          name: name.trim(),
          phone: phone.trim() || null,
          bio: bio.trim() || null,
          skills: skills.length > 0 ? skills : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile?.id ?? "");

      if (error) throw error;

      await refreshProfile();
      Alert.alert("완료", "프로필이 수정되었습니다.", [
        { text: "확인", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Profile update error:", error);
      Alert.alert("오류", "프로필 수정 중 오류가 발생했습니다.");
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
        {/* 프로필 사진 */}
        <View className="items-center mb-8">
          <View className="w-24 h-24 rounded-full bg-surface items-center justify-center mb-3">
            <User size={48} color="#9CA3AF" />
          </View>
          <Pressable disabled={loading}>
            <Text className="text-primary font-medium">사진 변경</Text>
          </Pressable>
        </View>

        {/* 기본 정보 */}
        <View className="gap-4">
          <View>
            <Text className="text-foreground font-medium mb-2">이름 *</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="이름을 입력하세요"
              placeholderTextColor="#9CA3AF"
              editable={!loading}
              className="bg-white border border-border rounded-xl px-4 py-4 text-foreground"
            />
          </View>

          <View>
            <Text className="text-foreground font-medium mb-2">전화번호</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="010-0000-0000"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              editable={!loading}
              className="bg-white border border-border rounded-xl px-4 py-4 text-foreground"
            />
          </View>
        </View>

        {/* 마스터 전용 정보 */}
        {profile?.role === "master" && (
          <View className="mt-6">
            <Text className="text-lg font-bold text-foreground mb-4">
              마스터 정보
            </Text>

            {/* 보유 기술 */}
            <View className="mb-4">
              <Text className="text-foreground font-medium mb-2">보유 기술</Text>
              <View className="flex-row flex-wrap gap-2 mb-3">
                {skills.map((skill, index) => (
                  <View
                    key={index}
                    className="bg-primary/10 px-3 py-2 rounded-full flex-row items-center"
                  >
                    <Text className="text-primary mr-1">{skill}</Text>
                    <Pressable
                      onPress={() => removeSkill(skill)}
                      disabled={loading}
                    >
                      <X size={16} color="#67c0a1" />
                    </Pressable>
                  </View>
                ))}
              </View>
              <View className="flex-row gap-2">
                <TextInput
                  value={newSkill}
                  onChangeText={setNewSkill}
                  placeholder="기술 추가 (예: 왁스작업)"
                  placeholderTextColor="#9CA3AF"
                  editable={!loading}
                  className="flex-1 bg-white border border-border rounded-xl px-4 py-3 text-foreground"
                  onSubmitEditing={addSkill}
                />
                <Pressable
                  onPress={addSkill}
                  disabled={loading || !newSkill.trim()}
                  className="bg-primary px-4 rounded-xl items-center justify-center active:opacity-80"
                >
                  <Plus size={24} color="#FFFFFF" />
                </Pressable>
              </View>
            </View>

            {/* 자기소개 */}
            <View>
              <Text className="text-foreground font-medium mb-2">자기소개</Text>
              <TextInput
                value={bio}
                onChangeText={setBio}
                placeholder="자기소개를 입력하세요"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                editable={!loading}
                className="bg-white border border-border rounded-xl px-4 py-4 text-foreground"
                style={{ minHeight: 120, textAlignVertical: "top" }}
              />
            </View>
          </View>
        )}

        {/* 저장 버튼 */}
        <Pressable
          onPress={handleSave}
          disabled={loading}
          className={`w-full py-4 rounded-xl items-center mt-8 mb-8 ${
            loading ? "bg-primary/50" : "bg-primary active:opacity-80"
          }`}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white font-semibold text-lg">저장</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
