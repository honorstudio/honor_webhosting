import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  FlatList,
  ActivityIndicator,
  Platform,
} from "react-native";
import { MapPin, Search, X } from "lucide-react-native";

// 카카오 로컬 API REST KEY (클라이언트용)
const KAKAO_REST_API_KEY = "bf0524920c0a6898bc737c2e397892ec";

interface AddressResult {
  id: string;
  address_name: string;
  region_1depth_name: string; // 시/도
  region_2depth_name: string; // 구/군
  region_3depth_name: string; // 동/읍/면
  road_address_name?: string; // 도로명 주소
}

interface LocationSearchProps {
  value: string;
  onLocationSelect: (address: string, detail?: string) => void;
  detailAddress?: string;
  onDetailAddressChange?: (detail: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function LocationSearch({
  value,
  onLocationSelect,
  detailAddress = "",
  onDetailAddressChange,
  disabled = false,
  placeholder = "주소 검색",
}: LocationSearchProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState<AddressResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 디바운스된 검색
  const searchAddress = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 카카오 로컬 API 호출
      const response = await fetch(
        `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
          },
        }
      );

      if (!response.ok) {
        // API 키가 없거나 오류인 경우 키워드 검색으로 대체
        const keywordResponse = await fetch(
          `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}&category_group_code=`,
          {
            headers: {
              Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
            },
          }
        );

        if (!keywordResponse.ok) {
          throw new Error("검색 실패");
        }

        const keywordData = await keywordResponse.json();
        const keywordResults: AddressResult[] = keywordData.documents?.map(
          (doc: any, index: number) => ({
            id: `${index}`,
            address_name: doc.address_name || doc.road_address_name,
            region_1depth_name: "",
            region_2depth_name: "",
            region_3depth_name: "",
            road_address_name: doc.road_address_name,
          })
        ) || [];
        setResults(keywordResults);
        return;
      }

      const data = await response.json();

      // 결과 매핑
      const addressResults: AddressResult[] = data.documents?.map(
        (doc: any, index: number) => ({
          id: `${index}`,
          address_name: doc.address?.address_name || doc.address_name,
          region_1depth_name: doc.address?.region_1depth_name || "",
          region_2depth_name: doc.address?.region_2depth_name || "",
          region_3depth_name: doc.address?.region_3depth_name || "",
          road_address_name: doc.road_address?.address_name,
        })
      ) || [];

      // 결과가 없으면 키워드 검색 시도
      if (addressResults.length === 0) {
        const keywordResponse = await fetch(
          `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}`,
          {
            headers: {
              Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
            },
          }
        );

        if (keywordResponse.ok) {
          const keywordData = await keywordResponse.json();
          const keywordResults: AddressResult[] = keywordData.documents
            ?.slice(0, 10)
            .map((doc: any, index: number) => ({
              id: `keyword-${index}`,
              address_name: doc.address_name || doc.place_name,
              region_1depth_name: "",
              region_2depth_name: "",
              region_3depth_name: "",
              road_address_name: doc.road_address_name,
            })) || [];
          setResults(keywordResults);
        }
      } else {
        setResults(addressResults);
      }
    } catch (err) {
      console.error("Address search error:", err);
      setError("주소 검색 중 오류가 발생했습니다.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 디바운스 효과
  useEffect(() => {
    const timer = setTimeout(() => {
      searchAddress(searchText);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText, searchAddress]);

  const handleSelect = (result: AddressResult) => {
    const selectedAddress = result.road_address_name || result.address_name;
    onLocationSelect(selectedAddress);
    setModalVisible(false);
    setSearchText("");
    setResults([]);
  };

  const openSearch = () => {
    setSearchText(value);
    setModalVisible(true);
  };

  return (
    <View>
      {/* 주소 표시/선택 버튼 */}
      <Pressable
        onPress={openSearch}
        disabled={disabled}
        className="bg-white border border-border rounded-xl px-4 py-4 flex-row items-center"
      >
        <MapPin size={18} color="#9CA3AF" />
        <Text
          className={`ml-2 flex-1 ${
            value ? "text-foreground" : "text-muted"
          }`}
        >
          {value || placeholder}
        </Text>
        <Search size={18} color="#9CA3AF" />
      </Pressable>

      {/* 상세주소 입력 */}
      {value && onDetailAddressChange && (
        <TextInput
          value={detailAddress}
          onChangeText={onDetailAddressChange}
          placeholder="상세주소 (건물명, 층, 호수 등)"
          placeholderTextColor="#9CA3AF"
          editable={!disabled}
          className="bg-white border border-border rounded-xl px-4 py-4 text-foreground mt-2"
        />
      )}

      {/* 검색 모달 */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-background">
          {/* 헤더 */}
          <View className="flex-row items-center px-4 py-4 border-b border-border bg-white">
            <View className="flex-1 flex-row items-center bg-surface rounded-xl px-4 py-3">
              <Search size={18} color="#9CA3AF" />
              <TextInput
                value={searchText}
                onChangeText={setSearchText}
                placeholder="도로명, 지번, 건물명 검색"
                placeholderTextColor="#9CA3AF"
                autoFocus
                className="flex-1 ml-2 text-foreground"
                style={{ outline: "none" } as any}
              />
              {searchText.length > 0 && (
                <Pressable onPress={() => setSearchText("")}>
                  <X size={18} color="#9CA3AF" />
                </Pressable>
              )}
            </View>
            <Pressable
              onPress={() => setModalVisible(false)}
              className="ml-3"
            >
              <Text className="text-primary font-medium">취소</Text>
            </Pressable>
          </View>

          {/* 검색 결과 */}
          {loading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#67c0a1" />
            </View>
          ) : error ? (
            <View className="flex-1 items-center justify-center px-6">
              <Text className="text-muted text-center">{error}</Text>
            </View>
          ) : results.length === 0 ? (
            <View className="flex-1 items-center justify-center px-6">
              <MapPin size={48} color="#D1D5DB" />
              <Text className="text-muted text-center mt-4">
                {searchText.length < 2
                  ? "검색어를 2자 이상 입력해주세요"
                  : "검색 결과가 없습니다"}
              </Text>
              <Text className="text-muted text-center text-sm mt-2">
                도로명, 지번, 건물명으로 검색해보세요
              </Text>
            </View>
          ) : (
            <FlatList
              data={results}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => handleSelect(item)}
                  className="px-4 py-4 border-b border-border bg-white active:bg-surface"
                >
                  <View className="flex-row items-start">
                    <MapPin size={18} color="#67c0a1" className="mt-0.5" />
                    <View className="ml-3 flex-1">
                      <Text className="text-foreground font-medium">
                        {item.road_address_name || item.address_name}
                      </Text>
                      {item.road_address_name && item.address_name !== item.road_address_name && (
                        <Text className="text-muted text-sm mt-1">
                          지번: {item.address_name}
                        </Text>
                      )}
                    </View>
                  </View>
                </Pressable>
              )}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          )}
        </View>
      </Modal>
    </View>
  );
}
