import { logout, signoutPayload } from '@/src/apis/apiService'
import GlobalHeader from '@/src/components/GlobalHeader'
import SignOutModal from '@/src/components/Modals/SignOutModal'
import { clearAllChatLists } from '@/src/redux/chatListSlice'
import { height, width } from '@/src/utils/helperFunctions'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { router } from 'expo-router'
import { CircleArrowRight } from 'lucide-react-native'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useDispatch } from 'react-redux'

const Settings = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [modalVisible, setModalVisible] = useState(false);
    const handleLogout = async () => {
        try {
            const ExpoPushToken = await AsyncStorage.getItem("ExpoPushToken");
            console.log("ExpoPushToken:", ExpoPushToken);

            if (typeof ExpoPushToken === "string") {
                const payload: signoutPayload = {
                    deviceTokens: [ExpoPushToken],
                };

                console.log("payload:", payload);
                await logout(payload);
            }

            await AsyncStorage.clear();
            dispatch(clearAllChatLists());
            router.replace("/auth/Login");
        } catch (error) {
            console.error("Error during logout:", error);
        } finally {
            setModalVisible(false);
        }
    };

    const renderSettingItem = (labelKey: string, onPress: () => void) => (
        <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
            <Text style={styles.itemText}>{t(labelKey)}</Text>
            <View style={styles.iconContainer}>
                <CircleArrowRight size={22} color="#a1a1a1" strokeWidth={1.5} />
            </View>
        </TouchableOpacity>
    );
    return (
        <View style={{ flex: 1 }}>
            <GlobalHeader
                title={t('settings')}
            />
            <View style={{ flex: 1, backgroundColor: "#e8e8e8" }}>
                <ScrollView style={styles.container}>
                    <Text style={styles.sectionTitle}>{t("profile_information")}</Text>
                    <View style={styles.section}>
                        {renderSettingItem("name_nationality_contact", () => { router.push("/editProfile") })}
                        {renderSettingItem("profile_photo", () => { router.push("/profilePhoto") })}
                        {renderSettingItem("shipboard_experience", () => { router.push("/WorkExperience") })}
                        {renderSettingItem("social_media", () => { router.push("/SocialMediaLinks") })}
                        {renderSettingItem("certifications", () => { router.push("/Certifications") })}
                        {renderSettingItem("change_language", () => { router.push("/ChangeLanguage") })}
                    </View>

                    <Text style={styles.sectionTitle}>{t("account")}</Text>
                    <View style={styles.section1}>
                        {renderSettingItem("change_password", () => { router.push("/ChangePassword") })}

                        {renderSettingItem("log_out", () => setModalVisible(true))}
                    </View>



                </ScrollView>
            </View>
            <SignOutModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onLogout={handleLogout}
            />
        </View >
    )
}

export default Settings
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        width: width,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#262626",
        marginBottom: 10,
        lineHeight: 27,
        fontFamily: "WhyteInktrap-Medium",
    },
    section: {
        marginBottom: 20,
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 10,
    },
    itemContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomColor: "#e5e5e5",
    },
    itemText: {
        fontSize: 12,
        fontWeight: "500",
        fontFamily: "Poppins-Regular",
        color: "#949494",
    },
    itemValue: {
        fontSize: 14,
        fontFamily: "Poppins-Regular",
        color: "#666",
    },
    iconContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    verifiedText: {
        fontSize: 12,
        color: "#B0DB02",
        fontWeight: "600",
        marginRight: 5,
    },
    section1: {
        marginBottom: height * 0.2,
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 10,
    },
})