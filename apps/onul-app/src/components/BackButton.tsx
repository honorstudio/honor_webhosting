import { Pressable } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";

interface BackButtonProps {
  color?: string;
  fallbackPath?: string;
}

export default function BackButton({ color = "#111827", fallbackPath = "/(tabs)" }: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    // expo-router의 canGoBack() 사용
    if (router.canGoBack()) {
      router.back();
    } else {
      // 히스토리가 없으면 fallback 경로로 이동
      router.replace(fallbackPath);
    }
  };

  return (
    <Pressable
      onPress={handleBack}
      className="p-2"
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <ChevronLeft size={28} color={color} />
    </Pressable>
  );
}
