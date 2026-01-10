import { getallassessmentsResult } from "@/src/apis/apiService";
import GlobalButton from "@/src/components/GlobalButton";
import { showToast } from "@/src/components/GlobalToast";
import Colors from "@/src/utils/Colors";
import { ImagesAssets } from "@/src/utils/ImageAssets";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronDown, InfoIcon, Share2 } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { generateAndSharePersonalityPDF } from "@/src/components/PersonalityPDFReport";
import CommonLoader from "@/src/components/CommonLoader";

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
  corrective_actions: Array<{
    challenge: string;
    recommendation: string;
    expected_outcome: string;
  }>;
}

const PersonalityMapResultScreen = () => {
  const { t } = useTranslation();
  const [loading, setloading] = useState(false);
  const [data, setData] = useState<PersonalityInsight | null>(null);
  const [userName, setUserName] = useState("User");
  const [pdfUri, setPdfUri] = useState<string | null>(null);
  const { newuser } = useLocalSearchParams();
  const [descExpanded, setDescExpanded] = useState(false);
  const [traitsExpanded, setTraitsExpanded] = useState(false);
  const [careerExpanded, setCareerExpanded] = useState(false);

  const rotateDescAnim = React.useRef(new Animated.Value(0)).current;
  const rotateTraitsAnim = React.useRef(new Animated.Value(0)).current;
  const rotateCareerAnim = React.useRef(new Animated.Value(0)).current;

  const toggleAnim = (
    expanded: boolean,
    anim: Animated.Value,
    setter: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    setter(!expanded);
    Animated.timing(anim, {
      toValue: expanded ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    (async () => {
      try {
        const userDetails = JSON.parse(await AsyncStorage.getItem("userDetails") || "{}");
        const fullName = userDetails.fullName || "User";
        setUserName(fullName);
      } catch (e) {
        setUserName("User");
      }
    })();
  }, []);

  const sharePDF = async () => {
    if (!data) {
      showToast.error(t('oops'), t('nodataavailable'));
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
    try {
      setloading(true);
      const apiResponse = await getallassessmentsResult({ questionType: "PERSONALITY" });

      if (apiResponse.success && apiResponse.status === 200) {
        setloading(false);
        const insights = apiResponse.data.data.insights;
        setData(insights);
      } else {
        showToast.error(t("oops"), apiResponse.message);
      }
    } catch (error) {
      setloading(false);
      showToast.error(t("oops"), t("somethingwentwrong"));
    }
  };

  useEffect(() => {
    getAssessmentResult();
  }, []);

  const traitsList = Array.isArray(data?.personality_traits) ? data.personality_traits : [];
  const careerObj = typeof data?.career_path === "object" && !Array.isArray(data?.career_path) ? data.career_path : {};
  const normalizedTraits = React.useMemo(() => {
    if (!data?.personality_traits) return [];

    // Case 1: Already an array
    if (Array.isArray(data.personality_traits)) {
      return data.personality_traits.flatMap((obj) =>
        Object.entries(obj).map(([title, value]) => ({
          title,
          value,
        }))
      );
    }

    // Case 2: Object
    if (typeof data.personality_traits === "object") {
      return Object.entries(data.personality_traits).map(
        ([title, value]) => ({
          title,
          value,
        })
      );
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
        <TouchableOpacity onPress={sharePDF} style={styles.shareIcon} activeOpacity={0.7}>
          <Share2 size={18} color="#02130b" />
        </TouchableOpacity>
      </View>

      {loading ? <View style={styles.loader}><CommonLoader fullScreen /></View> : <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Famous People Card */}
        <View style={styles.famousPeopleCard}>
          <View style={styles.headermaritime_title}>
            <Text style={styles.maritime_title}>
              {data?.maritime_title ?? "--"}
            </Text>
            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  data?.big_five_type_code ?? "",
                  data?.big_five_type_full ?? ""
                )
              }
            >
              <InfoIcon size={20} color="#666" />
            </TouchableOpacity>
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
          <BlurView style={StyleSheet.absoluteFill} tint="light" intensity={50} />
          <View style={styles.personalityDescHeader}>
            <Text style={styles.personalityDescText}>
              {t("personalityDescText") || "Personality Description"}
            </Text>
            <TouchableOpacity
              onPress={() => toggleAnim(descExpanded, rotateDescAnim, setDescExpanded)}
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
          <Text style={styles.desc} numberOfLines={descExpanded ? undefined : 4}>
            {data?.description ?? ""}
          </Text>
        </View>

        {/* Personality Traits */}
        <View style={styles.personalityDescCard}>
          <BlurView style={StyleSheet.absoluteFill} tint="light" intensity={50} />
          <View style={styles.personalityDescHeader}>
            <Text style={styles.personalityDescText}>
              {t("personalitytraits") || "Personality Traits"}
            </Text>
            <TouchableOpacity
              onPress={() => toggleAnim(traitsExpanded, rotateTraitsAnim, setTraitsExpanded)}
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
          <BlurView style={StyleSheet.absoluteFill} tint="light" intensity={50} />
          <View style={styles.personalityDescHeader}>
            <Text style={styles.personalityDescText}>
              {t("careerpath") || "Career Path"}
            </Text>
            <TouchableOpacity
              onPress={() => toggleAnim(careerExpanded, rotateCareerAnim, setCareerExpanded)}
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
      </ScrollView>}
      {!loading &&
        <View style={styles.buttonContainer}>
          <GlobalButton
            title={t("goback")} onPress={() => newuser === "true" ? router.replace("/home") : router.replace("/(bottomtab)/health")}
          />
        </View>}
    </View>
  );
};

export default PersonalityMapResultScreen;

const styles = StyleSheet.create({
  main: { flex: 1 },

  backgroundContainer: { ...StyleSheet.absoluteFillObject, zIndex: -1 },
  backgroundImage: { width: "100%", height: "100%" },

  header: {
    marginVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
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
    paddingHorizontal: 20,
    paddingBottom: 120,
  },

  famousPeopleCard: {
    padding: 16,
    borderRadius: 20,
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
    paddingTop: '80%',
  }
});