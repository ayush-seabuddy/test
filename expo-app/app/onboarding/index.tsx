import React, { useEffect, useState } from "react";
import {
    Text,
    View,
    StyleSheet,
    Dimensions,
    Image,
    TouchableOpacity,
    ScrollView,
    Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomLottie from "@/src/components/CustomLottie";
import { ImagesAssets } from "@/src/utils/ImageAssets";
import Colors from "@/src/utils/Colors";
import { ChevronRight } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

const { width, height } = Dimensions.get("window");

const screensData = (t: any) => [
    {
        loadingIcons: [
            ImagesAssets.selectedLine,
            ImagesAssets.unselectedLine,
            ImagesAssets.unselectedLine,
            ImagesAssets.unselectedLine,
            ImagesAssets.unselectedLine,
            ImagesAssets.unselectedLine,
        ],
        backgroundColor: "#ffffff",
    },
    {
        title: t("onboarding.title1"),
        cardTitle: t("onboarding.cardTitle1"),
        cardDescription: t("onboarding.cardDescription1"),
        loadingIcons: [
            ImagesAssets.selectedLine,
            ImagesAssets.selectedLine,
            ImagesAssets.unselectedLine,
            ImagesAssets.unselectedLine,
            ImagesAssets.unselectedLine,
            ImagesAssets.unselectedLine,
        ],
        backgroundColor: "#ffffff",
    },
    {
        title: t("onboarding.title2"),
        cardTitle: t("onboarding.cardTitle2"),
        cardDescription: t("onboarding.cardDescription2"),
        loadingIcons: [
            ImagesAssets.selectedLine,
            ImagesAssets.selectedLine,
            ImagesAssets.selectedLine,
            ImagesAssets.unselectedLine,
            ImagesAssets.unselectedLine,
            ImagesAssets.unselectedLine,
        ],
        backgroundColor: "#F3FAD9",
    },
    {
        title: t("onboarding.title3"),
        cardTitle: t("onboarding.cardTitle3"),
        cardDescription: t("onboarding.cardDescription3"),
        loadingIcons: [
            ImagesAssets.selectedLine,
            ImagesAssets.selectedLine,
            ImagesAssets.selectedLine,
            ImagesAssets.selectedLine,
            ImagesAssets.unselectedLine,
            ImagesAssets.unselectedLine,
        ],
        backgroundColor: "#F3FAD9",
    },
    {
        title: t("onboarding.title4"),
        cardTitle: t("onboarding.cardTitle4"),
        cardDescription: t("onboarding.cardDescription4"),
        loadingIcons: [
            ImagesAssets.selectedLine,
            ImagesAssets.selectedLine,
            ImagesAssets.selectedLine,
            ImagesAssets.selectedLine,
            ImagesAssets.selectedLine,
            ImagesAssets.unselectedLine,
        ],
        backgroundColor: "#E7F4B1",
    },
    {
        title: t("onboarding.title5"),
        cardTitle: t("onboarding.cardTitle5"),
        cardDescription: t("onboarding.cardDescription5"),
        loadingIcons: [
            ImagesAssets.selectedLine,
            ImagesAssets.selectedLine,
            ImagesAssets.selectedLine,
            ImagesAssets.selectedLine,
            ImagesAssets.selectedLine,
            ImagesAssets.selectedLine,
        ],
        backgroundColor: "#E7F4B1",
    },
];

const OnboardingScreens = () => {
    const { t } = useTranslation();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [companyLogo, setCompanyLogo] = useState("");
    const [companyName, setcompanyName] = useState("");
    const [companyDescription, setcompanyDescription] = useState("");
    const router = useRouter();
    const { width, height } = Dimensions.get("window");

    useEffect(() => {
        getLogo();
    }, []);

    const getLogo = async () => {
        try {
            const storedData = await AsyncStorage.getItem("userDetails");
            const userDetails = JSON.parse(storedData ?? "");
            if (userDetails.companyLogo) setCompanyLogo(userDetails.companyLogo);
            if (userDetails.companyName) setcompanyName(userDetails.companyName);
            if (userDetails.companyDescription)
                setcompanyDescription(userDetails.companyDescription);
        } catch (error) {
            console.log(error);
        }
    };

    const handleNext = async () => {
        if (currentIndex < screensData(t).length - 1) {
            setCurrentIndex((prevIndex) => prevIndex + 1);
        } else {
            await AsyncStorage.setItem("completedOnboarding", "true");
            router.push("/auth/UpdateProfilePhoto");
        }
    };

    const handleBack = () => {
        setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : prevIndex));
    };

    const { title, cardTitle, cardDescription, loadingIcons, backgroundColor } =
        screensData(t)[currentIndex];

    return (
        <View style={[styles.container, { backgroundColor }]}>
            <View style={styles.topBar}>
                <TouchableOpacity
                    style={styles.skipButton}
                    onPress={async () => {
                        await AsyncStorage.setItem("completedOnboarding", "true");
                        router.push("/auth/UpdateProfilePhoto");
                    }}
                >
                    <Text style={styles.skipText}>{t("common.skip")}</Text>
                    <ChevronRight size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
            </View>

            <View style={[styles.header, { marginTop: currentIndex == 0 ? 0 : "10%" }]}>
                <Text style={styles.titleText}>{title}</Text>
                {currentIndex == 0 ? (
                    <View style={{ flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                        <Image
                            style={{ width: 200, height: 200, borderRadius: 30 }}
                            resizeMode="contain"
                            source={{ uri: companyLogo }}
                        />
                    </View>
                ) : null}
            </View>

            <View style={styles.bottomSheet}>
                <CustomLottie isBlurView={Platform.OS === 'ios' ? true : false} />

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={[styles.cardTitle, { marginTop: currentIndex == 0 ? 0 : 10 }]}>{cardTitle}</Text>
                    {currentIndex == 0 ? (
                        <>
                            <Text style={[styles.titleText, { color: "white", marginTop: currentIndex == 0 ? 0 : 50 }]}>
                                {t("onboarding.welcome", { companyName })}
                            </Text>
                            <Text style={[styles.cardDescription, { color: "white", fontSize: 18, lineHeight: 25 }]}>
                                {companyDescription}
                            </Text>
                        </>
                    ) : null}
                    <Text style={styles.cardDescription}>{cardDescription}</Text>
                </ScrollView>

                <View style={styles.loadingIcons}>
                    {loadingIcons.map((icon, index) => (
                        <Image key={index} source={icon} style={styles.loadingIcon} resizeMode="contain" />
                    ))}
                </View>

                <View style={styles.fixedButtonsContainer}>
                    <TouchableOpacity onPress={handleNext} style={[styles.nextButton, { marginBottom: currentIndex == 0 ? 25 : 0 }]}>
                        <Text style={styles.nextButtonText}>
                            {currentIndex === screensData(t).length - 1 ? t("common.getStarted") : t("common.next")}
                        </Text>
                    </TouchableOpacity>
                    {currentIndex > 0 && (
                        <TouchableOpacity onPress={handleBack} style={styles.backButtonWrapper}>
                            <Text style={styles.backButtonText}>{t("common.back")}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
};


const styles = StyleSheet.create({
    container: { flex: 1 },
    topBar: { marginTop: 20, justifyContent: "flex-end", marginHorizontal: 20 },
    skipButton: { flexDirection: "row", justifyContent: "flex-end", gap: 3 },
    skipText: {
        fontSize: 16,
        lineHeight: 24,
        fontWeight: "600",
        color: Colors.black,
        fontFamily: "WhyteInktrap-Bold",
    },
    header: { marginHorizontal: 20 },
    titleText: {
        marginTop: 50,
        fontSize: 34,
        color: Colors.black,
        fontFamily: "WhyteInktrap-Bold",
        lineHeight: 45,
    },
    bottomSheet: {
        width,
        height: height * 0.45,
        position: "absolute",
        bottom: 0,
        borderTopRightRadius: 50,
        borderTopLeftRadius: 50,
        backgroundColor: "transparent",
        overflow: "hidden",
        paddingTop: 20,
        alignItems: "center",
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        width: "100%",
        flexGrow: 1,
        alignItems: "flex-start",
    },
    cardTitle: {
        marginTop: 30,
        fontSize: 22,
        color: "#E8E8E8",
        lineHeight: 30,
        fontFamily: "WhyteInktrap-Bold",
    },
    cardDescription: {
        fontSize: 12,
        color: "#E8E8E8",
        fontWeight: "400",
        fontFamily: "Poppins-Regular",
        textAlign: "left",
        fontStyle: "normal",
        marginTop: 15,
    },
    loadingIcons: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 10,
        gap: 5,
    },
    loadingIcon: { width: 30, height: 30 },
    fixedButtonsContainer: { width: "100%", paddingHorizontal: 20, paddingBottom: 10 },
    nextButton: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.iconColor,
        padding: 15,
        borderRadius: 8,
    },
    nextButtonText: { fontSize: 14, color: "#06361F", fontFamily: "Poppins-SemiBold" },
    backButtonWrapper: { alignItems: "center", justifyContent: "center", marginTop: 5 },
    backButtonText: {
        fontSize: 12,
        color: "white",
        fontWeight: "600",
        textAlign: "center",
        paddingVertical: 10,
        fontFamily: "Poppins-SemiBold",
    },
});

export default OnboardingScreens;
