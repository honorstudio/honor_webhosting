import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/contexts/AuthContext";

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("알림", "이메일과 비밀번호를 입력해주세요.");
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      Alert.alert("로그인 실패", "이메일 또는 비밀번호가 올바르지 않습니다.");
      return;
    }

    router.replace("/(tabs)");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background"
    >
      <View className="flex-1 px-6 pt-8">
        {/* 입력 폼 */}
        <View className="gap-4">
          <View>
            <Text className="text-foreground font-medium mb-2">이메일</Text>
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
            <Text className="text-foreground font-medium mb-2">비밀번호</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="비밀번호를 입력하세요"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              editable={!loading}
              className="bg-surface border border-border rounded-xl px-4 py-4 text-foreground"
            />
          </View>
        </View>

        {/* 비밀번호 찾기 */}
        <Pressable className="mt-4 self-end" disabled={loading}>
          <Text className="text-primary font-medium">비밀번호 찾기</Text>
        </Pressable>

        {/* 로그인 버튼 */}
        <Pressable
          onPress={handleLogin}
          disabled={loading}
          className={`w-full py-4 rounded-xl items-center mt-8 ${
            loading ? "bg-primary/50" : "bg-primary active:opacity-80"
          }`}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white font-semibold text-lg">로그인</Text>
          )}
        </Pressable>

        {/* 회원가입 링크 */}
        <View className="flex-row justify-center mt-6">
          <Text className="text-muted">계정이 없으신가요? </Text>
          <Pressable onPress={() => router.push("/(auth)/register")} disabled={loading}>
            <Text className="text-primary font-medium">회원가입</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
