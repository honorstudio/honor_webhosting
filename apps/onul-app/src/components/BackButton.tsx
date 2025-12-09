import { Pressable } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";

interface BackButtonProps {
  color?: string;
}

export default function BackButton({ color = "#67c0a1" }: BackButtonProps) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.back()}
      className="ml-2 p-2"
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <ChevronLeft size={24} color={color} />
    </Pressable>
  );
}
