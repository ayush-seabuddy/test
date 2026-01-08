import { getUnreadMessageCount } from "@/src/apis/apiService";
import { updateUnreadMessageCount, updateUnreadNotificationCount } from "@/src/redux/chatListSlice";
import { RootState } from "@/src/redux/store";
import Colors from "@/src/utils/Colors";
import { ImagesAssets } from "@/src/utils/ImageAssets";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Dimensions,
    Image,
    ImageSourcePropType,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

const { height, width } = Dimensions.get("screen");
const isProMax = height >= 926;

type FeatureFrameProps = {
    onOpenPDF: (url: string, title: string) => void;
};

type Feature = {
    icon: ImageSourcePropType;
    title: string;
    description: string;
    onPress: () => void;
};

const FeatureFrame: React.FC<FeatureFrameProps> = ({ onOpenPDF }) => {
    const { t } = useTranslation();
    const [name, setName] = useState<string>("");
    const dispatch = useDispatch();
    const { unreadMessageCount } = useSelector((state: RootState) => state.chatList);


    const pdfUrl =
        "https://seabuddy.s3.amazonaws.com/1752225459197_CrewAppGuide_SeaBuddy.pdf";

    const fetchUserDetails = async () => {
        const storedData = await AsyncStorage.getItem("userDetails");
        if (storedData) {
            const userDetails = JSON.parse(storedData);
            setName(userDetails.fullName);
        }
    };

    const getUnReadCounts = async () => {
        const response = await getUnreadMessageCount();
        if (response.status === 200) {
            dispatch(updateUnreadMessageCount(response.data.unReadCount));
            dispatch(updateUnreadNotificationCount(response.data.unSeenCount));
        }
    }

    useEffect(() => {
        fetchUserDetails();
        getUnReadCounts();
    }, []);

    const FeatureCard = ({ icon, title, description, onPress }: Feature) => (
        <TouchableOpacity style={styles.featureCard} onPress={onPress}>
            <Image style={styles.featureIcon} resizeMode="cover" source={icon} />
            <View style={styles.featureTextWrapper}>
                <Text style={styles.featureTitle}>{title}</Text>
                <Text style={styles.featureDescription}>{description}</Text>
            </View>
        </TouchableOpacity>
    );

    const features: Feature[] = [
        {
            icon: ImagesAssets.GlobeLogo,
            title: t("social"),
            description: t("social_description"),
            onPress: () => router.push("/(bottomtab)/(community)/social"),
        },
        {
            icon: ImagesAssets.UsersLogo,
            title: t("ship_life"),
            description: t("ship_life_description"),
            onPress: () => router.push("/(bottomtab)/shiplife"),
        },
        {
            icon: ImagesAssets.ShipAnchorLogo,
            title: t("wellness_hub"),
            description: t("wellness_description"),
            onPress: () => router.push("/(bottomtab)/health"),
        },
        {
            icon: ImagesAssets.MusicLogo,
            title: t("helplines"),
            description: t("helplines_description"),
            onPress: () => router.push("/(bottomtab)/helpline"),
        },
    ];

    return (
        <View style={styles.frameWrapper}>
            <BlurView style={StyleSheet.absoluteFill} tint="regular" intensity={800} />

            <View style={styles.greetingSection}>
                <TouchableOpacity style={styles.greetingCard} onPress={() => { router.push("/(bottomtab)/(community)/chats") }}>
                    <View style={styles.greetingRow}>
                        <View style={styles.greetingTextWrapper}>
                            <Text style={styles.greetingText}>
                                {`${t("hi")} ${name
                                    ? name.split(" ")[0].charAt(0).toUpperCase() +
                                    name.split(" ")[0].slice(1)
                                    : ""
                                    }, ${t("how_are_you_today")}`}
                            </Text>
                            <Text style={styles.subtitle}>
                                {t("chat_with_your_crewmates")}
                            </Text>
                        </View>
                        <Image
                            style={styles.chatIcon}
                            resizeMode="cover"
                            source={ImagesAssets.ChatLogo}
                        />
                        {unreadMessageCount >= 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>

                                    {unreadMessageCount > 9 ? "9+" : unreadMessageCount}
                                </Text>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.featuresContainer}>
                <View style={styles.featuresGrid}>
                    {features
                        .reduce<Feature[][]>((rows, _, i) => {
                            if (i % 2 === 0) rows.push(features.slice(i, i + 2));
                            return rows;
                        }, [])
                        .map((row, index) => (
                            <View key={index} style={styles.featureRow}>
                                {row.map((feature, i) => (
                                    <FeatureCard key={i} {...feature} />
                                ))}
                            </View>
                        ))}

                    {/* App Guide */}
                    <TouchableOpacity
                        style={styles.guideRow}
                        onPress={() => onOpenPDF(pdfUrl, "App Guide")}
                    >
                        <View style={styles.greetingTextWrapper}>
                            <Text style={styles.subtitle}>{t("how_to_use_guide")}</Text>
                        </View>
                        <Image
                            style={styles.guideIcon}
                            resizeMode="cover"
                            source={ImagesAssets.NotebookLogo}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default FeatureFrame;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
        overflow: "hidden",
        marginVertical: isProMax ? 10 : 0,
        backgroundColor: "red"
    },
    frameWrapper: {
        marginHorizontal: 16,
        borderRadius: 32,
        backgroundColor: "rgba(218,218,218,0.4)",
        paddingHorizontal: 20,
        alignItems: "center",
        overflow: "hidden",
    },
    greetingSection: {
        borderTopWidth: 1.5,
        borderBottomWidth: 1,
        borderColor: "rgba(255,255,255,0.6)",
        paddingVertical: 10,
        marginTop: 16,
        alignItems: "center",
        width: "100%",
    },
    greetingCard: {
        backgroundColor: "#FFFFFF33",
        padding: 10,
        borderRadius: 16,
        width: "100%",
    },
    greetingRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        width: "92%",
        position: "relative",
    },
    greetingTextWrapper: {
        flexDirection: "column",
        paddingBottom: 6,
    },
    greetingText: {
        marginTop: isProMax ? 10 : 6,
        fontSize: isProMax ? 18 : 16,
        lineHeight: isProMax ? 25 : 22,
        color: "#262626",
        fontFamily: "WhyteInktrap-Medium",
    },
    subtitle: {
        fontSize: isProMax ? 12 : 10,
        color: "#454545",
        fontFamily: "Poppins-Regular",
    },
    chatIcon: {
        height: 25,
        width: 25,
    },
    featuresContainer: {
        gap: 16,
        width: "100%",
    },
    featuresGrid: {
        flex: 1,
        marginVertical: 10,
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    featureRow: {
        flexDirection: "row",
        gap: 6,
    },
    featureCard: {
        flexDirection: "row",
        width: "50%",
        backgroundColor: "#FFFFFF33",
        padding: 16,
        borderRadius: 20,
        alignItems: "center",
    },
    featureIcon: {
        width: width * 0.05,
        height: width * 0.05,
    },
    featureTextWrapper: {
        flex: 1,
        marginLeft: 8,
        paddingVertical: 10,
    },
    featureTitle: {
        fontSize: isProMax ? 16 : 14,
        lineHeight: isProMax ? 22 : 20,
        color: "#262626",
        fontFamily: "WhyteInktrap-Bold",
    },
    featureDescription: {
        fontSize: isProMax ? 12 : 10,
        color: "#454545",
        fontFamily: "Poppins-Regular",
    },
    guideRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 5,
    },
    guideIcon: {
        height: 20,
        width: 20,
        marginBottom: 10,
    },
    badge: {
        backgroundColor: Colors.lightGreen,
        borderRadius: 50,
        position: "absolute",
        top: 8,
        right: Platform.OS === 'ios' ? -5 : -5,
        minWidth: 18,
        height: 18,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 4,
    },
    badgeText: {
        color: Colors.white,
        fontSize: 10,
        fontFamily: "Poppins-Regular",
    },
});