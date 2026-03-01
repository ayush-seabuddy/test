import GlobalButton from "@/src/components/GlobalButton";
import GlobalPopOver from "@/src/components/GlobalPopover";
import Colors from "@/src/utils/Colors";
import { ImagesAssets } from "@/src/utils/ImageAssets";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Info } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import {
    Dimensions,
    Image,
    StyleSheet,
    Text,
    View,
} from "react-native";

const { width, height } = Dimensions.get("window");

const PersonalityMapIntroScreen = () => {
    const router = useRouter();
    const { t } = useTranslation();
    const params = useLocalSearchParams<{
        testData?: string;
    }>();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{t("personalitymap")}</Text>

                <GlobalPopOver
                    popOverText={t("info_popup_text")}
                >
                    <Info size={22} color={Colors.textPrimary} />
                </GlobalPopOver>
            </View>

            <Image
                style={styles.heroImage}
                resizeMode="contain"
                source={ImagesAssets.personalityMapJollie}
            />

            <View style={styles.overlay} />

            <View style={styles.topOverlaySection}>
                <View style={styles.indicatorBar} />
                <Text style={styles.heading}>{t("heading")}</Text>
            </View>

            <View style={styles.bottomContent}>
                <View style={styles.benefitCard}>
                    <Text style={styles.benefitText}>{t("benefit_1")}</Text>
                </View>
                <View style={styles.benefitCard}>
                    <Text style={styles.benefitText}>{t("benefit_2")}</Text>
                </View>
                <View style={styles.benefitCard}>
                    <Text style={styles.benefitText}>{t("benefit_3")}</Text>
                </View>

                <GlobalButton
                    title={t("start_button")}
                    onPress={() => {
                        router.push({
                            pathname: '/personalitymap/PersonalityMapTestScreen',
                            params: {
                                testData: params.testData || '',
                            },
                        });
                    }}
                    buttonStyle={styles.customButton}
                    textStyle={styles.customButtonText}
                />
            </View>
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    header: {
        position: "absolute",
        left: 20,
        right: 20,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: 10,
    },
    title: {
        fontSize: 18,
        lineHeight:20,
        fontFamily: "WhyteInktrap-Bold",
        color: Colors.textPrimary,
    },
    heroImage: {
        position: "absolute",
        top: height * 0.05,
        left: width * 0.15,
        width: width * 0.7,
        height: height * 0.4,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        top: height * 0.42,
        backgroundColor: "rgba(0, 0, 0, 0.77)",
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
    },
    topOverlaySection: {
        position: "absolute",
        top: height * 0.42,
        left: 0,
        right: 0,
        alignItems: "center",
        paddingHorizontal: width * 0.05,
        zIndex: 11,
    },
    indicatorBar: {
        height: 5,
        backgroundColor: Colors.iconColor,
        width: 100,
        borderRadius: 50,
        marginVertical: 10,
    },
    heading: {
        fontSize: 15,
        fontFamily: "Poppins-SemiBold",
        color: Colors.white,
        textAlign: "center",
    },
    bottomContent: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: width * 0.05,
        paddingBottom: height * 0.03,
        alignItems: "center",
        zIndex: 11,
    },
    benefitCard: {
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        padding: height * 0.02,
        borderRadius: 16,
        marginBottom: height * 0.01,
        width: "100%",
    },
    benefitText: {
        fontSize: 13,
        fontFamily: "Poppins-Regular",
        color: Colors.white,
        textAlign: "center",
    },
    customButton: {
        backgroundColor: Colors.buttonWhiteBg,
        height: 50,
        width: "100%",
        marginTop: height * 0.02,
    },
    customButtonText: {
        color: Colors.buttonWhiteText,
        fontFamily: "Poppins-SemiBold",
        fontSize: 14,
    },
});

export default PersonalityMapIntroScreen;
