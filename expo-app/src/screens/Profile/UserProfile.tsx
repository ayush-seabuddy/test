import { viewProfile } from '@/src/apis/apiService'
import BuddyUpEventList from '@/src/components/BuddyUpEventList'
import { RootState } from '@/src/redux/store'
import { updateUserField } from '@/src/redux/userDetailsSlice'
import Colors from '@/src/utils/Colors'
import { height, width } from '@/src/utils/helperFunctions'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import { Settings, SquarePen } from 'lucide-react-native'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import AssessmentList from '../health/AssessmentList'
import About from './About'
import ProfileTabs from './ProfileTabs'
import UserPost from './UserPosts'

const UserProfile = () => {
     const { t } = useTranslation();
    const userDetails = useSelector((state: RootState) => state.userDetails)
    const dispatch = useDispatch()
    const [activeTab, setActiveTab] = useState<'about' | 'posts' | 'buddyuponprofile' | 'assessments'>('about');

    useEffect(() => {
        const fetchProfileDetails = async () => {
            let result = await viewProfile();
            if (result?.data) {
                const object = result.data
                for (const property in object) {
                    console.log(`${property}: ${object[property]}`);
                    dispatch(updateUserField({ key: property, value: object[property] }))
                }

            }
        }
        fetchProfileDetails();
    }, []);

    const renderTabs = () => {
        switch (activeTab) {
            case 'about':
                return <About />;
            case 'posts':
                return <UserPost />;
            case 'buddyuponprofile':
                return <BuddyUpEventList userId={userDetails.id} />;
            case 'assessments':
                return <AssessmentList isProfileScreen={true} />;
            default:
                return null;
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: Colors.white }}>
            <TouchableOpacity style={styles.settingButtonStyle} onPress={() => router.push("/settings")}>
                <Settings size={24} />
            </TouchableOpacity>
            <View style={{ display: "flex", justifyContent: "center", alignItems: "center", height: height * .35 }}>
                <View style={{ position: "relative" }}>
                    <Image source={userDetails.profileUrl} style={{ width: 100, height: 100, borderRadius: 50, borderColor: Colors.lightGreen, borderWidth: 2 }} />
                    <TouchableOpacity style={{
                        position: "absolute", bottom: 3, right: 0,
                        borderColor: 'grey',
                        borderWidth: 0.5,
                        backgroundColor: 'white',
                        padding: 7,
                        borderRadius: 50
                    }}
                        onPress={() => {
                            router.push('/profilePhoto')
                        }}
                    >
                        <SquarePen size={16} />
                    </TouchableOpacity>
                </View>
                <Text style={styles.fullName}>
                    {userDetails?.fullName
                        ? userDetails?.fullName?.charAt(0).toUpperCase() +
                        userDetails?.fullName?.slice(1)
                        : null}
                </Text>
                <Text style={styles.designation}>{userDetails?.designation || ""}</Text>
                <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.editProfileBtn}
                    onPress={() =>
                        router.push('/editProfile')
                    }
                >
                    <Text style={styles.editProfileBtnText}>{t('editprofile')}</Text>
                </TouchableOpacity>

            </View>

            <ProfileTabs activeTab={activeTab} setActiveTab={(tabName: 'about' | 'posts' | 'buddyuponprofile' | 'assessments') => setActiveTab(tabName)} />

            {renderTabs()}

        </View>
    )
}

export default UserProfile

const styles = StyleSheet.create({
    settingButtonStyle: {
        position: 'absolute',
        top: 20,
        left: 20

    },
    fullName: {
        marginTop: 10,
        fontSize: 25,
        fontWeight: "700",
        color: "black",
        fontFamily: "Poppins-Bold",
    },
    designation: {
        fontSize: 14,
        lineHeight: 24,
        fontWeight: "400",
        color: "black",
    },
    editProfileBtn: {
        backgroundColor: "#000",
        width: width * 0.9,
        height: height * 0.05,
        borderRadius: 100,
        justifyContent: "center",
        alignItems: "center",
        marginVertical: 5,
    },
    editProfileBtnText: {
        color: "#fff",
        fontFamily: "Poppins-Regular",
        fontSize: 16,
    },
})