import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Image } from "expo-image";
import { ImagesAssets } from "@/src/utils/ImageAssets";
import { router } from "expo-router";

const { width } = Dimensions.get("window");

export default function AIJollieCard() {
    const { t, i18n } = useTranslation();

    const buildBots = () => [
        { type: "HEALTH", label: t("health"), image: ImagesAssets.MarineBuddyJollie },
        { type: "SPIRITUAL", label: t("spiritual"), image: ImagesAssets.SpiritualBuddyJollie },
        { type: "TECHNICAL", label: t("marine"), image: ImagesAssets.HealthBuddyJollie },
    ];

    const [bots, setBots] = useState(buildBots());
    const animation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        setBots(buildBots());
    }, [i18n.language]);

    useEffect(() => {
        const interval = setInterval(() => {
            Animated.sequence([
                Animated.timing(animation, {
                    toValue: 1,
                    duration: 350,
                    useNativeDriver: true,
                }),
                Animated.timing(animation, {
                    toValue: 0,
                    duration: 350,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                setBots(prev => [prev[1], prev[2], prev[0]]);
            });
        }, 2800);

        return () => clearInterval(interval);
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{t("oneassistantmanyfaces")}</Text>
            <Text style={styles.subtitle}>{t("oneassistantmanyfaces_description")}</Text>

            <View style={styles.row}>
                {bots.map((bot, index) => {
                    const isCenter = index === 1;

                    return (
                        <Animated.View
                            key={index}
                            style={[
                                styles.column,
                                {
                                    transform: [
                                        {
                                            scale: animation.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [1, isCenter ? 1.14 : 1],
                                            }),
                                        },
                                    ],
                                    opacity: animation.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [1, isCenter ? 0.55 : 1],
                                    }),
                                },
                            ]}
                        >
                            <TouchableOpacity
                                activeOpacity={0.85}
                                style={[styles.card, isCenter && styles.centerCard]}
                                onPress={() => {
                                    router.push({
                                        pathname: '/aichatbots',
                                        params: {
                                            chatbotType: bot.type,
                                            chatbotName: bot.label
                                        }
                                    })
                                }
                                }
                            >
                                <Text style={[styles.label, isCenter && styles.labelCenter]}>
                                    {bot.label}
                                </Text>

                                <View style={[styles.iconBox, isCenter && styles.iconBoxCenter]}>
                                    <Image
                                        source={bot.image}
                                        style={[styles.icon, isCenter && styles.iconCenter]}
                                    />
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "rgba(185,185,185,0.3)",
        borderRadius: 20,
        paddingVertical: 16,
        marginTop: 10,
    },
    title: {
        fontSize: 16,
        lineHeight: 30,
        textAlign: "center",
        color: "#262626",
        fontWeight: "500",
        fontFamily: "WhyteInktrap-Medium",
    },
    subtitle: {
        fontSize: 11,
        textAlign: "center",
        marginBottom: 16,
        fontFamily: "Poppins-Regular",
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },
    column: { flex: 1, alignItems: "center" },
    card: { alignItems: "center", gap: 10 },
    centerCard: {
        elevation: 4,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 6,
    },
    label: {
        fontSize: 14,
        lineHeight: 20,
        color: "#262626",
        fontFamily: "WhyteInktrap-Medium",
    },
    labelCenter: { fontSize: 16 },
    iconBox: {
        backgroundColor: "rgba(255,255,255,0.25)",
        padding: 5,
        borderRadius: 50,
    },
    iconBoxCenter: {
        backgroundColor: "rgba(255,255,255,0.4)",
        padding: 10,
        borderRadius: 60,
    },
    icon: { width: width * 0.18, height: width * 0.18, resizeMode: "contain" },
    iconCenter: { width: width * 0.22, height: width * 0.22, resizeMode: "contain" },
});
