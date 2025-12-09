import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/contexts/AuthContext";
import { UserRole } from "../../src/types/database";

type SelectableRole = "master" | "client";

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<SelectableRole>("master");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // 유효성 검사
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("알림", "모든 필수 항목을 입력해주세요.");
      return;
    }

    if (password.length < 8) {
      Alert.alert("알림", "비밀번호는 8자 이상이어야 합니다.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("알림", "비밀번호가 일치하지 않습니다.");
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password, name, role as UserRole);
    setLoading(false);

    if (error) {
      Alert.alert("회원가입 실패", "회원가입 중 오류가 발생했습니다. 다시 시도해주세요.");
      return;
    }

    Alert.alert(
      "회원가입 완료",
      "이메일 인증 후 로그인해주세요.",
      [{ text: "확인", onPress: () => router.replace("/(auth)/login") }]
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background"
    >
      <ScrollView className="flex-1 px-6 pt-4">
        {/* 역할 선택 */}
        <View className="mb-6">
          <Text className="text-foreground font-medium mb-3">가입 유형</Text>
          <View className="flex-row gap-3">
            <Pressable
              onPress={() => setRole("master")}
              disabled={loading}
              className={`flex-1 py-4 rounded-xl items-center border ${
                role === "master"
                  ? "bg-primary border-primary"
                  : "bg-surface border-border"
              }`}
            >
              <Text
                className={`font-semibold ${
                  role === "master" ? "text-white" : "text-foreground"
                }`}
              >
                마스터
              </Text>
              <Text
                className={`text-sm mt-1 ${
                  role === "master" ? "text-white/80" : "text-muted"
                }`}
              >
                청소 서비스 제공자
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setRole("client")}
              disabled={loading}
              className={`flex-1 py-4 rounded-xl items-center border ${
                role === "client"
                  ? "bg-primary border-primary"
                  : "bg-surface border-border"
              }`}
            >
              <Text
                className={`font-semibold ${
                  role === "client" ? "text-white" : "text-foreground"
                }`}
              >
                클라이언트
              </Text>
              <Text
                className={`text-sm mt-1 ${
                  role === "client" ? "text-white/80" : "text-muted"
                }`}
              >
                서비스 이용자
              </Text>
            </Pressable>
          </View>
        </View>

        {/* 입력 폼 */}
        <View className="gap-4">
          <View>
            <Text className="text-foreground font-medium mb-2">이름 *</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="이름을 입력하세요"
              placeholderTextColor="#9CA3AF"
              editable={!loading}
              className="bg-surface border border-border rounded-xl px-4 py-4 text-foreground"
            />
          </View>

          <View>
            <Text className="text-foreground font-medium mb-2">이메일 *</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="이메일을 입력하세요"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
              className="bg-surface border border-border rounded-xl px-4 py-4 text-foreground"
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
              className="bg-surface border border-border rounded-xl px-4 py-4 text-foreground"
            />
          </View>

          <View>
            <Text className="text-foreground font-medium mb-2">비밀번호 *</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="8자 이상 입력하세요"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              editable={!loading}
              className="bg-surface border border-border rounded-xl px-4 py-4 text-foreground"
            />
          </View>

          <View>
            <Text className="text-foreground font-medium mb-2">
              비밀번호 확인 *
            </Text>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="비밀번호를 다시 입력하세요"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              editable={!loading}
              className="bg-surface border border-border rounded-xl px-4 py-4 text-foreground"
            />
          </View>
        </View>

        {/* 회원가입 버튼 */}
        <Pressable
          onPress={handleRegister}
          disabled={loading}
          className={`w-full py-4 rounded-xl items-center mt-8 mb-8 ${
            loading ? "bg-primary/50" : "bg-primary active:opacity-80"
          }`}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white font-semibold text-lg">회원가입</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
