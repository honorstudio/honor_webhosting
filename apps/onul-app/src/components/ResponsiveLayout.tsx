import { View } from "react-native";
import { useResponsive } from "../hooks/useResponsive";
import Sidebar from "./Sidebar";

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
}

export default function ResponsiveLayout({
  children,
  showHeader = true,
}: ResponsiveLayoutProps) {
  const { showSidebar, sidebarWidth, contentMaxWidth } = useResponsive();

  if (!showSidebar) {
    // 모바일: 기존 레이아웃 유지
    return <>{children}</>;
  }

  // PC/태블릿: 사이드바 + 컨텐츠 레이아웃
  return (
    <View className="flex-1 flex-row bg-background">
      {/* 사이드바 (고정) */}
      <Sidebar />

      {/* 메인 컨텐츠 영역 */}
      <View
        className="flex-1 bg-surface"
        style={{
          marginLeft: 0,
        }}
      >
        <View
          className="flex-1 mx-auto w-full"
          style={{
            maxWidth: contentMaxWidth,
          }}
        >
          {children}
        </View>
      </View>
    </View>
  );
}
