import GlobalHeader from '@/src/components/GlobalHeader'
import DeleteModal from '@/src/components/Modals/DeleteModal'
import SignOutModal from '@/src/components/Modals/SignOutModal'
import { height, width } from '@/src/utils/helperFunctions'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { router } from 'expo-router'
import { t } from 'i18next'
import { ChevronLeft, CircleArrowRight } from 'lucide-react-native'
import React, { useState } from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const Settings = () => {


    const [modalVisible, setModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    const handleAccountDelete = async () => {
        setDeleteModalVisible(false);

    };

    const handleLogout = async () => {
        try {
        // Clear all AsyncStorage data
        await AsyncStorage.clear();

        // Reset navigation stack to Login screen
        router.replace('/auth/Login');
    } catch (error) {
        console.error('Error during logout:', error);
    }
        
        setModalVisible(false);
    };

    const renderSettingItem = (labelKey: string, onPress: ()=>void, value = null, isVerified = false) => (
        <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
            <Text style={styles.itemText}>{t(labelKey)}</Text>
            {value ? (
                <>
                    <Text style={styles.itemValue}>{value}</Text>
                    {/* <Image source={ImagesAssets.CircleRightArrow} style={styles.headerIcon} /> */}
                    <CircleArrowRight size={24} color="#c1c1c1" />
                </>
            ) : (
                <View style={styles.iconContainer}>
                    {isVerified && <Text style={styles.verifiedText}>{t("verified")}</Text>}
                    {/* <Image source={ImagesAssets.CircleRightArrow} style={styles.headerIcon} /> */}
                    <CircleArrowRight size={24} color="#a1a1a1" />
                </View>
            )}
        </TouchableOpacity>
    );
    return (
        <View style={{ flex: 1 }}>

            <GlobalHeader
                leftIcon={<ChevronLeft />}
                onLeftPress={() => router.back()}
                title="Settings"
            />
            <View style={{ flex: 1, backgroundColor: "#e8e8e8" }}>
                <ScrollView style={styles.container}>
                    <Text style={styles.sectionTitle}>{t("profile_information")}</Text>
                    <View style={styles.section}>
                        {renderSettingItem("name_nationality_contact", () => {router.push("/editProfile") })}
                        {renderSettingItem("profile_photo", () => {router.push("/profilePhoto")})} 
                        {renderSettingItem("shipboard_experience", () => {router.push("/WorkExperience")})} 
                        {renderSettingItem("social_media", () => {router.push("/SocialMediaLinks")})} 
                        {renderSettingItem("certifications", () => { router.push("/Certifications")})}
                        {renderSettingItem("change_language", () => { router.push("/ChangeLanguage")})}
                    </View>

                    <Text style={styles.sectionTitle}>{t("account")}</Text>
                    <View style={styles.section1}>
                        {renderSettingItem("change_password", () => { router.push("/ChangePassword") })}
                       
                        {renderSettingItem("log_out", () => setModalVisible(true))}
                    </View>



                </ScrollView>
            </View>

            <DeleteModal
                visible={deleteModalVisible}
                onClose={() => setDeleteModalVisible(false)}
                onDelete={handleAccountDelete}
                title={t("delete_account_confirm")}
            />
            <SignOutModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onDelete={handleLogout}
            />
        </View >
    )
}

export default Settings
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 14,
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