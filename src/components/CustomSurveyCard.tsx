import React from "react";
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
} from "react-native";
import Colors from "../utils/Colors";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";

export interface SurveyData {
    id: string;
    title?: string;
    description?: string;
    image?: string;
}

interface CustomSurveyCardProps {
    surveyData: SurveyData;
}

const CustomSurveyCard: React.FC<CustomSurveyCardProps> = ({ surveyData }) => {
    const { t } = useTranslation();
    const handleSurveyPress = () => {
        router.push({ pathname: "/customsurvey", params: { surveyId: surveyData.id } });
    };

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
                    {surveyData.title}
                </Text>
            </View>

            <Text style={styles.description} numberOfLines={3} ellipsizeMode="tail">
                {surveyData.description}
            </Text>
            <TouchableOpacity
                style={styles.button}
                activeOpacity={0.8}
                onPress={handleSurveyPress}
            >
                <Text style={styles.buttonText}>{t('startSurvey')}</Text>
            </TouchableOpacity>
        </View>
    );
};

export default CustomSurveyCard;

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 18,
        marginHorizontal: 16,
        marginVertical: 10,
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 2,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    title: {
        fontWeight: "700",
        fontSize: 14,
        color: "#000",
        flex: 1,
        fontFamily: "Poppins-SemiBold",
    },
    description: {
        fontSize: 12,
        color: "#444",
        marginBottom: 14,
        lineHeight: 20,
        fontFamily: "Poppins-Regular",
    },
    alertMessage: {
        fontSize: 11,
        color: Colors.lightGreen,
        marginBottom: 10,
        fontFamily: "Poppins-Medium",
    },
    button: {
        backgroundColor: Colors.lightGreen,
        borderRadius: 8,
        paddingVertical: 8,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 14,
        fontFamily: "Poppins-SemiBold",
    },
});