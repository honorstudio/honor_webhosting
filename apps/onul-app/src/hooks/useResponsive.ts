import { useWindowDimensions, Platform } from "react-native";

// 브레이크포인트 정의
export const BREAKPOINTS = {
  mobile: 0, // 0-767px
  tablet: 768, // 768-1023px
  desktop: 1024, // 1024px 이상
};

export type DeviceType = "mobile" | "tablet" | "desktop";

export function useResponsive() {
  const { width, height } = useWindowDimensions();

  const isWeb = Platform.OS === "web";

  const getDeviceType = (): DeviceType => {
    if (width >= BREAKPOINTS.desktop) return "desktop";
    if (width >= BREAKPOINTS.tablet) return "tablet";
    return "mobile";
  };

  const deviceType = getDeviceType();

  return {
    width,
    height,
    isWeb,
    deviceType,
    isMobile: deviceType === "mobile",
    isTablet: deviceType === "tablet",
    isDesktop: deviceType === "desktop",
    // PC 환경 (tablet 이상에서 사이드바 표시)
    showSidebar: isWeb && width >= BREAKPOINTS.tablet,
    // 컨텐츠 최대 너비 (PC에서 너무 넓어지지 않도록)
    contentMaxWidth: deviceType === "desktop" ? 1200 : undefined,
    // 사이드바 너비
    sidebarWidth: 240,
  };
}
