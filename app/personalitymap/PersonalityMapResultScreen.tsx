import { getallassessmentsResult } from "@/src/apis/apiService";
import GlobalButton from "@/src/components/GlobalButton";
import { showToast } from "@/src/components/GlobalToast";
import Colors from "@/src/utils/Colors";
import { ImagesAssets } from "@/src/utils/ImageAssets";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
} from "expo-router";
import { ChevronDown, Share2 } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  BackHandler,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import CommonLoader from "@/src/components/CommonLoader";
import EmptyComponent from "@/src/components/EmptyComponent";
import { generateAndSharePersonalityPDF } from "@/src/components/PersonalityPDFReport";
import { Logger } from "@/src/utils/logger";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface PersonalityInsight {
  maritime_title: string;
  big_five_type_code: string;
  big_five_type_full: string;
  famous_individuals: string[];
  description: string;
  personality_traits: Record<string, string> | Record<string, string>[];
  career_path: Record<string, string>;
  red_flags: string[];
  corrective_actions: {
    challenge: string;
    recommendation: string;
    expected_outcome: string;
  }[];
}

const PersonalityMapResultScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [loading, setloading] = useState(false);
  const [data, setData] = useState<PersonalityInsight | null>(null);
  const [userName, setUserName] = useState("User");
  const [pdfUri, setPdfUri] = useState<string | null>(null);
  const { newuser } = useLocalSearchParams();
  const [descExpanded, setDescExpanded] = useState(false);
  const [traitsExpanded, setTraitsExpanded] = useState(false);
  const [careerExpanded, setCareerExpanded] = useState(false);
  const { screenName } = useLocalSearchParams();
  const [isConnected, setIsConnected] = useState(true);
  const rotateDescAnim = React.useRef(new Animated.Value(0)).current;
  const rotateTraitsAnim = React.useRef(new Animated.Value(0)).current;
  const rotateCareerAnim = React.useRef(new Animated.Value(0)).current;

  const toggleAnim = (
    expanded: boolean,
    anim: Animated.Value,
    setter: React.Dispatch<React.SetStateAction<boolean>>,
  ) => {
    setter(!expanded);
    Animated.timing(anim, {
      toValue: expanded ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  // Check network connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected ?? false);
    });

    return () => unsubscribe();
  }, []);

  // Handle hardware back button
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          screenName === "HealthScreen"
            ? router.back()
            : router.replace("/home");
          return true;
        },
      );

      return () => subscription.remove();
    }, [screenName]),
  );

  // Handle system back gesture (swipe/gesture navigation)
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      // Prevent default behavior
      e.preventDefault();

      // Remove listener to avoid infinite loop
      unsubscribe();

      // Navigate based on screenName
      if (screenName === "HealthScreen") {
        navigation.dispatch(e.data.action);
      } else {
        router.replace("/home");
      }
    });

    return unsubscribe;
  }, [navigation, screenName]);

  useEffect(() => {
    (async () => {
      try {
        const userDetails = JSON.parse(
          (await AsyncStorage.getItem("userDetails")) || "{}",
        );
        const fullName = userDetails.fullName || "User";
        setUserName(fullName);
      } catch (e) {
        Logger.error("Error", { Error: String(e) });
        setUserName("User");
      }
    })();
  }, []);

  const sharePDF = async () => {
    if (!data) {
      showToast.error(t("oops"), t("nodataavailable"));
      return;
    }

    await generateAndSharePersonalityPDF({
      data,
      userName,
      onPdfReady: (uri) => {
        setPdfUri(uri);
      },
    });
  };

  const getAssessmentResult = async () => {
    // Check internet connection before making API call
    const netState = await NetInfo.fetch();
    if (!netState.isConnected) {
      setIsConnected(false);
      return;
    }

    try {
      setloading(true);
      const apiResponse = await getallassessmentsResult({
        questionType: "PERSONALITY",
      });
      setloading(false);
      if (apiResponse.success && apiResponse.status === 200) {
        const insights = apiResponse.data.data.insights;
        setData(insights);
      } else {
        showToast.error(t("oops"), apiResponse.message);
      }
    } catch (error) {
      Logger.error("Error", { Error: String(error) });
      setloading(false);
      showToast.error(t("oops"), t("somethingwentwrong"));
    }
  };

  useEffect(() => {
    getAssessmentResult();
  }, []);

  const traitsList = Array.isArray(data?.personality_traits)
    ? data.personality_traits
    : [];
  const careerObj =
    typeof data?.career_path === "object" && !Array.isArray(data?.career_path)
      ? data.career_path
      : {};
  const normalizedTraits = React.useMemo(() => {
    if (!data?.personality_traits) return [];

    // Case 1: Already an array
    if (Array.isArray(data.personality_traits)) {
      return data.personality_traits.flatMap((obj) =>
        Object.entries(obj).map(([title, value]) => ({
          title,
          value,
        })),
      );
    }

    // Case 2: Object
    if (typeof data.personality_traits === "object") {
      return Object.entries(data.personality_traits).map(([title, value]) => ({
        title,
        value,
      }));
    }

    return [];
  }, [data?.personality_traits]);

  return (
    <View style={styles.main}>
      <View style={styles.backgroundContainer}>
        <Image
          source={ImagesAssets.personaresultbackground}
          style={styles.backgroundImage}
          contentFit="cover"
        />
      </View>

      <View style={styles.header}>
        <View>
          <Text style={styles.personaresulttext}>{t("personaresult")}</Text>
        </View>
        <TouchableOpacity
          onPress={sharePDF}
          style={styles.shareIcon}
          activeOpacity={0.7}
        >
          <Share2 size={18} color="#02130b" />
        </TouchableOpacity>
      </View>

      {!isConnected ? (
        <View style={styles.emptyContainer}>
          <EmptyComponent text={t("nointernetconnection")} />
        </View>
      ) : loading ? (
        <View style={styles.loader}>
          <CommonLoader fullScreen />
        </View>
      ) : data ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          {/* Famous People Card */}
          <View style={styles.famousPeopleCard}>
            <View style={styles.headermaritime_title}>
              <Text style={styles.maritime_title}>
                {data?.maritime_title ?? "--"}
              </Text>
            </View>

            <Text style={styles.personality_type}>
              {data?.big_five_type_code ?? "--"}
            </Text>

            <Text style={styles.famouspeopledesc}>
              {data?.big_five_type_full ?? ""}
            </Text>

            <View style={styles.famousChipContainer}>
              {data?.famous_individuals?.map((name: string, idx: number) => (
                <View key={idx} style={styles.famousPeopleChip}>
                  <Text style={styles.famouspeoplename}>{name}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Personality Description */}
          <View style={styles.personalityDescCard}>
            <BlurView
              style={StyleSheet.absoluteFill}
              tint="light"
              intensity={50}
            />
            <View style={styles.personalityDescHeader}>
              <Text style={styles.personalityDescText}>
                {t("personalityDescText") || "Personality Description"}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  toggleAnim(descExpanded, rotateDescAnim, setDescExpanded)
                }
                style={styles.iconButton}
              >
                <Animated.View
                  style={{
                    transform: [
                      {
                        rotate: rotateDescAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ["0deg", "180deg"],
                        }),
                      },
                    ],
                  }}
                >
                  <ChevronDown size={22} color={Colors.lightGreen} />
                </Animated.View>
              </TouchableOpacity>
            </View>

            <Text
              style={styles.desc}
              numberOfLines={descExpanded ? undefined : 4}
            >
              {data?.description ?? ""}
            </Text>
          </View>

          {/* Personality Traits */}
          <View style={styles.personalityDescCard}>
            <BlurView
              style={StyleSheet.absoluteFill}
              tint="light"
              intensity={50}
            />
            <View style={styles.personalityDescHeader}>
              <Text style={styles.personalityDescText}>
                {t("personalitytraits") || "Personality Traits"}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  toggleAnim(
                    traitsExpanded,
                    rotateTraitsAnim,
                    setTraitsExpanded,
                  )
                }
                style={styles.iconButton}
              >
                <Animated.View
                  style={{
                    transform: [
                      {
                        rotate: rotateTraitsAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ["0deg", "180deg"],
                        }),
                      },
                    ],
                  }}
                >
                  <ChevronDown size={22} color={Colors.lightGreen} />
                </Animated.View>
              </TouchableOpacity>
            </View>

            {!traitsExpanded && normalizedTraits.length > 0 && (
              <Text style={styles.desc} numberOfLines={2}>
                {normalizedTraits[0].title}: {normalizedTraits[0].value}
              </Text>
            )}

            {traitsExpanded && (
              <View style={{ marginTop: 10, gap: 12 }}>
                {normalizedTraits.map((item, index) => (
                  <View key={index}>
                    <Text style={styles.traitTitle}>{item.title}</Text>
                    <Text style={styles.desc}>{item.value}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Career Path */}
          <View style={styles.personalityDescCard}>
            <BlurView
              style={StyleSheet.absoluteFill}
              tint="light"
              intensity={50}
            />
            <View style={styles.personalityDescHeader}>
              <Text style={styles.personalityDescText}>
                {t("careerpath") || "Career Path"}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  toggleAnim(
                    careerExpanded,
                    rotateCareerAnim,
                    setCareerExpanded,
                  )
                }
                style={styles.iconButton}
              >
                <Animated.View
                  style={{
                    transform: [
                      {
                        rotate: rotateCareerAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ["0deg", "180deg"],
                        }),
                      },
                    ],
                  }}
                >
                  <ChevronDown size={22} color={Colors.lightGreen} />
                </Animated.View>
              </TouchableOpacity>
            </View>

            {!careerExpanded && Object.keys(careerObj).length > 0 && (
              <Text style={styles.desc} numberOfLines={2}>
                {Object.entries(careerObj)
                  .slice(0, 1)
                  .map(([key, val]) => `${key}: ${val}`)
                  .join("")}
              </Text>
            )}

            {careerExpanded && (
              <View style={{ marginTop: 10, gap: 12 }}>
                {Object.entries(careerObj).map(([title, text]) => (
                  <View key={title}>
                    <Text style={styles.traitTitle}>{title}</Text>
                    <Text style={styles.desc}>{text}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <EmptyComponent text={t("nodataavailable")} />
        </View>
      )}

      {/* Bottom Buttons */}
      {isConnected && (
        <View style={styles.buttonContainer}>
          {!loading && data !== null && (
            <GlobalButton
              title={t("goback")}
              onPress={() => {
                if (newuser === "true") {
                  router.replace("/home");
                } else if (navigation.canGoBack && navigation.canGoBack()) {
                  navigation.goBack();
                } else {
                  router.replace("/(bottomtab)/health");
                }
              }}
            />
          )}

          {data === null && (
            <GlobalButton
              title={t("refresh")}
              onPress={getAssessmentResult}
              disabled={loading}
            />
          )}
        </View>
      )}
    </View>
  );
};

export default PersonalityMapResultScreen;

const styles = StyleSheet.create({
  main: { flex: 1 },

  backgroundContainer: { ...StyleSheet.absoluteFillObject, zIndex: -1 },
  backgroundImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#ededed",
  },

  header: {
    marginVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    alignItems: "center",
  },

  personaresulttext: {
    fontSize: 20,
    lineHeight: 30,
    color: "black",
    fontFamily: "WhyteInktrap-Bold",
  },

  shareIcon: {
    backgroundColor: "#B0DB0266",
    borderRadius: 5,
    height: 30,
    width: 30,
    justifyContent: "center",
    alignItems: "center",
  },

  scrollContainer: {
    paddingTop: SCREEN_HEIGHT * 0.5,
    paddingHorizontal: 10,
    paddingBottom: 120,
  },

  famousPeopleCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: "#fff",
    backgroundColor: "#f1f1f1",
  },

  headermaritime_title: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  maritime_title: {
    fontSize: 18,
    lineHeight: 30,
    color: "#262626",
    fontFamily: "WhyteInktrap-Medium",
  },

  personality_type: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "WhyteInktrap-Bold",
  },

  famousChipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 10,
  },

  famousPeopleChip: {
    borderRadius: 50,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: Colors.lightGreen,
  },

  famouspeoplename: {
    fontSize: 10,
    fontFamily: "Poppins-Regular",
    color: "white",
  },

  famouspeopledesc: {
    marginTop: 10,
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    color: "#444",
  },

  personalityDescCard: {
    marginTop: 12,
    padding: 16,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: "#fff",
    backgroundColor: "#f1f1f1",
    overflow: "hidden",
  },

  personalityDescHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  personalityDescText: {
    fontSize: 18,
    lineHeight: 20,
    fontFamily: "WhyteInktrap-Medium",
    color: "black",
  },

  iconButton: {
    backgroundColor: "white",
    padding: 5,
    borderRadius: 10,
  },

  desc: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
    color: "#333",
    fontFamily: "Poppins-Regular",
  },

  traitTitle: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#505050",
    fontFamily: "Poppins-Medium",
  },

  buttonContainer: {
    position: "absolute",
    bottom: 20,
    left: 10,
    right: 10,
  },

  loader: {
    paddingTop: "80%",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
