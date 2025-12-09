import { useEffect, useState } from "react";
import { View, Text, Animated, Pressable } from "react-native";
import { CheckCircle, AlertCircle, X } from "lucide-react-native";

type ToastType = "success" | "error" | "info";

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onHide: () => void;
}

export default function Toast({
  visible,
  message,
  type = "success",
  duration = 3000,
  onHide,
}: ToastProps) {
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      // 나타나기
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // 자동 숨기기
      const timer = setTimeout(() => {
        handleHide();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const handleHide = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onHide();
    });
  };

  if (!visible) return null;

  const getStyle = () => {
    switch (type) {
      case "success":
        return {
          bg: "bg-green-600",
          icon: <CheckCircle size={20} color="#FFFFFF" />,
        };
      case "error":
        return {
          bg: "bg-red-600",
          icon: <AlertCircle size={20} color="#FFFFFF" />,
        };
      case "info":
      default:
        return {
          bg: "bg-gray-800",
          icon: <AlertCircle size={20} color="#FFFFFF" />,
        };
    }
  };

  const style = getStyle();

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        position: "absolute",
        bottom: 100,
        left: 20,
        right: 20,
        zIndex: 9999,
      }}
    >
      <View
        className={`${style.bg} rounded-xl px-4 py-3 flex-row items-center shadow-lg`}
      >
        {style.icon}
        <Text className="text-white flex-1 ml-3 font-medium">{message}</Text>
        <Pressable onPress={handleHide} className="p-1">
          <X size={18} color="#FFFFFF" />
        </Pressable>
      </View>
    </Animated.View>
  );
}

// Toast Context & Provider
import { createContext, useContext, ReactNode } from "react";

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success" as ToastType,
  });

  const showToast = (message: string, type: ToastType = "success") => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, visible: false }));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
