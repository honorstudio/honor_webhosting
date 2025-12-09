import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, Platform, StyleSheet, useWindowDimensions } from "react-native";
import { AuthProvider } from "../src/contexts/AuthContext";
import { DevViewProvider } from "../src/contexts/DevViewContext";
import { ToastProvider } from "../src/components/Toast";

// PC 브레이크포인트 (768px 이상에서 전체 너비 사용)
const TABLET_BREAKPOINT = 768;

export default function RootLayout() {
  const { width } = useWindowDimensions();

  // PC/태블릿에서는 전체 너비 사용, 모바일에서만 430px 제한
  const isDesktopWeb = Platform.OS === "web" && width >= TABLET_BREAKPOINT;

  return (
    <AuthProvider>
      <DevViewProvider>
        <ToastProvider>
          <StatusBar style="dark" />
          <View style={styles.container}>
            <View
              style={[
                styles.mobileContainer,
                isDesktopWeb && styles.desktopContainer,
              ]}
            >
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: "#FFFFFF" },
                }}
              >
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              </Stack>
            </View>
          </View>
        </ToastProvider>
      </DevViewProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  mobileContainer: {
    flex: 1,
    width: "100%",
    maxWidth: Platform.OS === "web" ? 430 : undefined,
    backgroundColor: "#FFFFFF",
    ...(Platform.OS === "web" && {
      boxShadow: "0 0 20px rgba(0, 0, 0, 0.1)",
      borderRadius: 0,
      overflow: "hidden",
    }),
  } as any,
  desktopContainer: {
    maxWidth: "100%",
    boxShadow: "none",
  } as any,
});
