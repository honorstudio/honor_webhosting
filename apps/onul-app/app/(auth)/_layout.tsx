import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: "#FFFFFF" },
        headerTintColor: "#111827",
        headerTitleStyle: { fontWeight: "600" },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: "#FFFFFF" },
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          title: "로그인",
          headerBackTitle: "뒤로",
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          title: "회원가입",
          headerBackTitle: "뒤로",
        }}
      />
    </Stack>
  );
}
