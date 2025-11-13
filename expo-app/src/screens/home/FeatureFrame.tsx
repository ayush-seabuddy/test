import React, { useEffect, useState } from "react";
import {
    Text,
    StyleSheet,
    Image,
    View,
    Dimensions,
    TouchableOpacity,
    Platform,
    ImageSourcePropType,
} from "react-native";
import { BlurView } from 'expo-blur';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import { ImagesAssets } from "@/src/utils/ImageAssets";
import { router } from "expo-router";

const { height, width } = Dimensions.get("screen");
const isProMax = height >= 926;

type HelperFrameProps = {
    onOpenPDF: (url: string, title: string) => void;
};


const FeatureFrame: React.FC<HelperFrameProps> = ({ onOpenPDF }) => {
    const { t } = useTranslation();
    const [name, setName] = useState<string>("");;
    const pdfUrl = "https://seabuddy.s3.amazonaws.com/1752225459197_CrewAppGuide_SeaBuddy.pdf";

    const GetuserDetails = async () => {
        const dbResult = await AsyncStorage.getItem("userDetails");
        const userDetails = JSON.parse(dbResult ?? "");
        setName(userDetails.fullName);
    };

    //   const [unreadMessageCount, setUnreadMessageCount] = useState(0);

    //   const fetchUnreadMessageCount = async () => {
    //     try {
    //       const authToken = await AsyncStorage.getItem("authToken");
    //       if (!authToken) return;

    //       const response = await apiCallWithToken(
    //         `${apiServerUrl}/user/getUnreadMessageCount`,
    //         "GET",
    //         null,
    //         authToken
    //       );

    //       if (response.responseCode) {
    //         setUnreadMessageCount(response.result.unReadCount);
    //       }
    //     } catch (error) {
    //       console.error("Error fetching data:", error.message);
    //     }
    //   };

    useEffect(() => {
        GetuserDetails();
    }, []);

    //   useFocusEffect(
    //     React.useCallback(() => {
    //       fetchUnreadMessageCount();
    //     }, [])
    //   );


    type Feature = {
        icon: ImageSourcePropType;
        title: string;
        description: string;
        onPress: () => void;
    };

    const FeatureCard = ({ icon, title, description, onPress }: Feature) => (
        <TouchableOpacity style={styles.baseLayout} onPress={onPress}>
            <Image style={styles.baseIcons} resizeMode="cover" source={icon} />
            <View style={styles.hangoutParent}>
                <Text style={styles.healthHappiness}>{title}</Text>
                <Text style={styles.selfAwareness}>{description}</Text>
            </View>
        </TouchableOpacity>
    );


    const features: Feature[] = [
        {
            icon: ImagesAssets.GlobeLogo,
            title: t("social"),
            description: t("social_description"),
            onPress: () => router.push("/(bottomtab)/community/social"),
        },
        {
            icon: ImagesAssets.UsersLogo,
            title: t("ship_life"),
            description: t("ship_life_description"),
            onPress: () => console.log("Social Pressed"),
        },
        {
            icon: ImagesAssets.ShipAnchorLogo,
            title: t("wellness_hub"),
            description: t("wellness_description"),
            onPress: () => console.log("Social Pressed"),
        },
        {
            icon: ImagesAssets.MusicLogo,
            title: t("helplines"),
            description: t("helplines_description"),
            onPress: () => console.log("Social Pressed"),
        },
    ];


    return (
        <View style={styles.container}>
            <View style={styles.frameParent}>
                <BlurView
                    style={[StyleSheet.absoluteFill]}
                    tint="regular"     // Maps to UIBlurEffect.style.light
                    intensity={800}       // 100 is max in expo-blur; 30 in native is roughly 70–100
                />

                <View style={styles.frameGroup}>
                    <TouchableOpacity
                        style={styles.heyGladYouAreBackContainer}
                    >
                        <View style={[styles.rowCenter, { width: "92%" }]}>
                            <View style={styles.textBlock}>
                                <Text style={[styles.heyGladYou]}>
                                    {t("hi") +
                                        " " +
                                        (name
                                            ? name?.split(" ")[0].charAt(0).toUpperCase() + name.split(" ")[0].slice(1)
                                            : "") +
                                        ", " +
                                        t("how_are_you_today")}
                                </Text>
                                <Text style={styles.selfAwareness}>{t("chat_with_your_crewmates")}</Text>
                            </View>

                            <View style={{ position: "relative" }}>
                                <Image
                                    style={styles.chatbotImage}
                                    resizeMode="cover"
                                    source={ImagesAssets.ChatLogo}
                                />

                                {/* {unreadMessageCount > 0 && (
                  <View
                    style={{
                      backgroundColor: Colors.lightGreen,
                      borderRadius: 50,
                      position: "absolute",
                      top: -8,
                      right: 2,
                      minWidth: 18,
                      height: 18,
                      justifyContent: "center",
                      alignItems: "center",
                      paddingHorizontal: 4,
                    }}
                  >
                    <Text
                      style={{
                        color: Colors.white,
                        fontSize: 10,
                        fontFamily: 'Poppins-Regular',
                        textAlign: "center",
                      }}
                    >
                      {unreadMessageCount > 9 ? "9+" : unreadMessageCount}
                    </Text>
                  </View>
                )} */}
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.frameContainer}>
                    <View style={styles.frameView}>
                        {features
                            .reduce<Feature[][]>((rows, _, i) => {
                                if (i % 2 === 0) rows.push(features.slice(i, i + 2));
                                return rows;
                            }, [])
                            .map((row, rowIndex) => (
                                <View key={rowIndex} style={{ flexDirection: "row", gap: 6 }}>
                                    {row.map((feature: Feature, i: number) => (
                                        <FeatureCard key={i} {...feature} />
                                    ))}
                                </View>
                            ))}

                        <TouchableOpacity
                            style={[styles.rowCenter, { marginTop: 10 }]}
                            onPress={() => onOpenPDF(pdfUrl, "App Guide")}
                        >
                            <View style={styles.textBlock}>
                                <Text style={styles.selfAwareness}>{t("how_to_use_guide")}</Text>
                            </View>
                            <Image
                                style={[styles.chatbotImage, { height: 20, width: 20, marginBottom: 10 }]}
                                resizeMode="cover"
                                source={ImagesAssets.NotebookLogo}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: 10, overflow: "hidden", marginVertical: isProMax ? 10 : 0 },
    frameGroup: { borderTopWidth: 1.5, borderBottomWidth: 1, borderColor: "rgba(255,255,255,0.6)", paddingVertical: 10, alignItems: "center", width: "100%", marginBottom: isProMax ? -15 : -10 },
    heyGladYouAreBackContainer: { backgroundColor: "#FFFFFF33", padding: 10, borderRadius: 16, width: "100%" },
    rowCenter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 },
    chatbotImage: { height: 25, width: 25, marginRight: 10 },
    textBlock: { flexDirection: "column", paddingBottom: 6 },
    heyGladYou: { marginTop: isProMax ? 10 : 6, fontSize: isProMax ? 20 : 18, lineHeight: isProMax ? 25 : 22, color: "#262626", fontFamily: "WhyteInktrap-Medium" },
    selfAwareness: { fontSize: isProMax ? 12 : 10, color: "#454545", fontFamily: "Poppins-Regular" },
    baseIcons: { width: width * 0.05, height: width * 0.05 },
    frameContainer: { gap: 16, width: "100%", marginTop: 20 },
    frameView: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
    baseLayout: { flexDirection: "row", width: "50%", backgroundColor: "#FFFFFF33", padding: 16, borderRadius: 20, alignItems: "center" },
    hangoutParent: { flex: 1, marginLeft: 8, paddingVertical: 10 },
    frameParent: { borderRadius: 32, backgroundColor: "rgba(218,218,218,0.4)", paddingHorizontal: 20, paddingVertical: 30, alignItems: "center", width: "100%", overflow: "hidden" },
    healthHappiness: { fontSize: isProMax ? 18 : 16, lineHeight: isProMax ? 22 : 20, color: "#262626", fontFamily: "WhyteInktrap-Bold" },
});

export default FeatureFrame;
