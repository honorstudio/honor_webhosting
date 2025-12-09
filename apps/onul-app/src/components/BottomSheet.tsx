import {
  useRef,
  useEffect,
  useCallback,
  ReactNode,
  useState,
} from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  Animated,
  PanResponder,
  Dimensions,
  StyleSheet,
  Platform,
  GestureResponderEvent,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// 웹에서는 useNativeDriver 사용 불가
const useNativeDriver = Platform.OS !== "web";
const isWeb = Platform.OS === "web";

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  maxHeight?: number | string;
}

export default function BottomSheet({
  visible,
  onClose,
  children,
  title,
  maxHeight = "70%",
}: BottomSheetProps) {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  // 드래그 상태 (웹용)
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const currentDragY = useRef(0);

  const openSheet = useCallback(() => {
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        tension: 65,
        friction: 11,
        useNativeDriver,
      }),
    ]).start();
  }, [translateY, overlayOpacity]);

  const closeSheet = useCallback(() => {
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver,
      }),
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver,
      }),
    ]).start(() => {
      onClose();
    });
  }, [translateY, overlayOpacity, onClose]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // 아래로 드래그할 때만 활성화
        return gestureState.dy > 0;
      },
      onPanResponderGrant: () => {
        dragStartY.current = 0;
      },
      onPanResponderMove: (_, gestureState) => {
        // 아래로만 이동 가능
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // 100px 이상 내리거나 빠르게 내리면 닫기
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          closeSheet();
        } else {
          // 원위치로 복귀
          Animated.spring(translateY, {
            toValue: 0,
            tension: 65,
            friction: 11,
            useNativeDriver,
          }).start();
        }
      },
    })
  ).current;

  // 웹용 마우스 드래그 핸들러
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isWeb) return;
    setIsDragging(true);
    dragStartY.current = e.clientY;
    currentDragY.current = 0;
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isWeb || !isDragging) return;
    const dy = e.clientY - dragStartY.current;
    if (dy > 0) {
      currentDragY.current = dy;
      translateY.setValue(dy);
    }
  }, [isDragging, translateY]);

  const handleMouseUp = useCallback(() => {
    if (!isWeb || !isDragging) return;
    setIsDragging(false);
    if (currentDragY.current > 100) {
      closeSheet();
    } else {
      Animated.spring(translateY, {
        toValue: 0,
        tension: 65,
        friction: 11,
        useNativeDriver,
      }).start();
    }
    currentDragY.current = 0;
  }, [isDragging, closeSheet, translateY]);

  // 웹에서 드래그 중 마우스가 핸들 밖으로 나가도 계속 추적
  useEffect(() => {
    if (!isWeb || !isDragging) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      const dy = e.clientY - dragStartY.current;
      if (dy > 0) {
        currentDragY.current = dy;
        translateY.setValue(dy);
      }
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      if (currentDragY.current > 100) {
        closeSheet();
      } else {
        Animated.spring(translateY, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver,
        }).start();
      }
      currentDragY.current = 0;
    };

    window.addEventListener("mousemove", handleGlobalMouseMove);
    window.addEventListener("mouseup", handleGlobalMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isDragging, closeSheet, translateY]);

  useEffect(() => {
    if (visible) {
      openSheet();
    }
  }, [visible, openSheet]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={closeSheet}
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* 배경 오버레이 - 페이드 애니메이션 */}
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: overlayOpacity,
            },
          ]}
        >
          <Pressable style={styles.overlayPressable} onPress={closeSheet} />
        </Animated.View>

        {/* 드로어 콘텐츠 - 슬라이드 애니메이션 */}
        <Animated.View
          style={[
            styles.sheet,
            {
              maxHeight: typeof maxHeight === "number" ? maxHeight : maxHeight,
              transform: [{ translateY }],
            },
          ]}
        >
          {/* 드래그 핸들 */}
          <View
            {...(isWeb ? {} : panResponder.panHandlers)}
            style={[styles.handleContainer, isWeb && { cursor: "grab" } as any]}
            // @ts-ignore - 웹 전용 이벤트
            onMouseDown={isWeb ? handleMouseDown : undefined}
          >
            <View style={styles.handle} />
          </View>

          {/* 타이틀 */}
          {title && (
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{title}</Text>
            </View>
          )}

          {/* 콘텐츠 */}
          <View style={styles.content}>{children}</View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  overlayPressable: {
    flex: 1,
  },
  sheet: {
    backgroundColor: "white",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 32,
  },
  handleContainer: {
    paddingVertical: 12,
    alignItems: "center",
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
  },
  titleContainer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  content: {
    paddingHorizontal: 24,
  },
});
