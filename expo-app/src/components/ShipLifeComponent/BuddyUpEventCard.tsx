import { Dimensions, FlatList, StyleSheet, Text, View, TouchableOpacity, Modal, StatusBar } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Image } from 'expo-image'
import { useTranslation } from 'react-i18next'
import { ImagesAssets } from '@/src/utils/ImageAssets'
import { formatDate, getUserDetails } from '@/src/utils/helperFunctions'
import moment from 'moment-timezone'
import { Ionicons } from "@expo/vector-icons";
import { addeditdeletebuddyupevent } from '@/src/apis/apiService'
import { showToast } from '../GlobalToast'
import { router } from 'expo-router'

export interface BuddyUpEvent {
    id: string
    eventName: string
    description: string
    startDateTime: string
    endDateTime: string
    location?: string
    imageUrls: string[]
    joinedPeople: string[]
    categoryId?: string
    hashtags?: string[]
    isPublic?: boolean
    status?: string
    activityUser: {
        id: string
        fullName: string
        email: string
        profileUrl: string
        userType: string
    }
}

const { height } = Dimensions.get('window')

const BuddyUpEventCard = ({
    buddyupevents,
    onEventDeleted
}: {
    buddyupevents: BuddyUpEvent[]
    onEventDeleted?: (eventId: string) => void
}) => {

    const { t } = useTranslation()
    const [loading, setloading] = useState(false)
    const [eventList, setEventList] = useState<BuddyUpEvent[]>(buddyupevents)
    const [loggeduserData, setloggeduserData] = useState<{ id: string } | null>(null)

    const [menuVisibleId, setMenuVisibleId] = useState<string | null>(null)
    const [deleteModalVisible, setDeleteModalVisible] = useState(false)
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null)

    const deleteBuddyUpEvent = async (eventId: string) => {
        try {
            setloading(true)
            const apiResponse = await addeditdeletebuddyupevent({
                groupActivities: [{ eventId, status: "DELETE" }]
            })
            setloading(false)

            if (apiResponse.success && apiResponse.status === 200) {
                setEventList(prev => prev.filter(item => item.id !== eventId))
                onEventDeleted?.(eventId)
                showToast.success(t("success"), apiResponse.message)
            } else {
                showToast.error(t("oops"), apiResponse.message)
            }
        } catch (error) {
            showToast.error(t("oops"), t("somethingwentwrong"))
        }
    }

    const confirmDelete = () => {
        if (selectedEventId) deleteBuddyUpEvent(selectedEventId)
        setDeleteModalVisible(false)
    }

    const handleDeleteClick = (id: string) => {
        setSelectedEventId(id)
        setDeleteModalVisible(true)
        setMenuVisibleId(null)
    }

    const handleEditClick = (event: BuddyUpEvent) => {
        setMenuVisibleId(null)
        router.push({
            pathname: '/createyourbuddyupevent',
            params: {
                editMode: 'true',
                eventId: event.id,
                eventName: event.eventName,
                description: event.description,
                startDateTime: event.startDateTime,
                endDateTime: event.endDateTime,
                location: event.location || '',
                imageUrl: event.imageUrls[0] || '',
                categoryId: event.categoryId || '',
                hashtags: event.hashtags ? JSON.stringify(event.hashtags) : '',
                isPublic: event.isPublic ? 'Public (All Crew)' : 'Invite Buddy',
                joinedPeople: event.joinedPeople ? JSON.stringify(event.joinedPeople) : '[]',
            }
        })
    }

    useEffect(() => {
        setEventList(buddyupevents);
    }, [buddyupevents]);

    useEffect(() => {
        const loadUser = async () => {
            const userData = await getUserDetails()
            try {
                const parsed = typeof userData === "string" ? JSON.parse(userData) : userData
                setloggeduserData(parsed)
            } catch (e) { console.log("Parsing User Error:", e) }
        }
        loadUser()
    }, [])

    return (
        <View style={styles.main}>
            <FlatList
                data={eventList}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={item => item.id}
                renderItem={({ item }) => {
                    const isCreatedByMe = loggeduserData?.id === item.activityUser.id
                    const couldEditDelete = isCreatedByMe && moment().isBefore(item.startDateTime)

                    return (
                        <TouchableOpacity
                            style={styles.card}
                            onPress={() => {
                                router.push({
                                    pathname: '/buddyupeventdescription',
                                    params: { eventId: item.id },
                                })
                            }}
                        >
                            <Image source={item.imageUrls[0] || ImagesAssets.SeabuddyPlaceholder}
                                placeholder={ImagesAssets.PlaceholderImage}
                                placeholderContentFit='cover'
                                style={styles.imageStyle} contentFit="cover" />

                            {couldEditDelete && (
                                <View style={styles.menuWrapper}>
                                    <TouchableOpacity
                                        onPress={() => setMenuVisibleId(prev => prev === item.id ? null : item.id)}
                                        style={styles.menuIcon}
                                    >
                                        <Ionicons name="ellipsis-vertical" size={18} color="#000" />
                                    </TouchableOpacity>

                                    {menuVisibleId === item.id && (
                                        <View style={styles.dropdownMenu}>
                                            <TouchableOpacity
                                                style={styles.menuItem}
                                                onPress={() => handleEditClick(item)}
                                            >
                                                <Ionicons name="create-outline" size={20} color="black" />
                                                <Text style={styles.menuItemText}>{t("edit")}</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={styles.menuItem}
                                                onPress={() => handleDeleteClick(item.id)}
                                            >
                                                <Ionicons name="trash-outline" size={20} color="red" />
                                                <Text style={[styles.menuItemText, { color: "red" }]}>{t("delete")}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                            )}

                            <Text style={styles.buddyupeventName} numberOfLines={1}>{item.eventName}</Text>
                            <Text style={styles.organizedby} numberOfLines={1}>
                                {t("organizedBy")} {isCreatedByMe ? t("you") : item.activityUser.fullName}
                            </Text>
                            <Text style={styles.organizedby}>
                                {t("startdate")} : {formatDate(item.startDateTime)}
                            </Text>
                        </TouchableOpacity>
                    )
                }}
            />

            <Modal visible={deleteModalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <StatusBar backgroundColor="rgba(0,0,0,0.6)" />
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>{t("deleteActivity")}</Text>
                        <Text style={styles.modalText}>{t("deleteConfirmation")}</Text>

                        <View style={styles.modalBtnRow}>
                            <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setDeleteModalVisible(false)}>
                                <Text style={styles.cancelBtnTxt}>{t("cancel")}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalBtn, styles.deleteBtn]} onPress={confirmDelete}>
                                <Text style={styles.deleteBtnTxt}>{t("delete")}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

export default BuddyUpEventCard

const styles = StyleSheet.create({
    main: { flex: 1, backgroundColor: '#fff' },
    card: {
        height: height * 0.38,
        width: 220,
        backgroundColor: '#f5f5f5',
        padding: 10,
        marginTop: 10,
        borderWidth: 0.5,
        borderColor: '#d5d5d5',
        borderRadius: 10,
        marginRight: 10,
        marginBottom: 60,
    },
    imageStyle: { height: 180, borderRadius: 10, width: '100%' },
    buddyupeventName: { marginTop: 8, fontSize: 14, color: "#222", fontFamily: "Poppins-SemiBold" },
    organizedby: { fontSize: 12, color: "grey", fontFamily: "Poppins-Regular" },

    menuWrapper: { position: "absolute", right: 20, top: 20 },
    menuIcon: { padding: 8, backgroundColor: '#fff', borderRadius: 40, borderWidth: 0.4, borderColor: 'grey' },

    dropdownMenu: {
        backgroundColor: "#fff",
        borderRadius: 6,
        width: 110,
        position: "absolute", top: 55, right: 15,
        elevation: 4, paddingVertical: 5
    },

    menuItem: { flexDirection: "row", alignItems: "center", gap: 7, paddingVertical: 7, paddingHorizontal: 10 },
    menuItemText: { fontSize: 13, color: "#000", fontFamily: "Poppins-Medium" },

    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" },
    modalContainer: { width: "80%", backgroundColor: "#fff", borderRadius: 12, padding: 25, alignItems: "center" },
    modalTitle: { fontSize: 16, fontFamily: "Poppins-SemiBold", marginBottom: 8 },
    modalText: { fontSize: 14, textAlign: "center", color: "#555", marginBottom: 20 },
    modalBtnRow: { flexDirection: "row", width: "100%", justifyContent: "space-between" },
    modalBtn: { width: "48%", paddingVertical: 10, borderRadius: 6, alignItems: "center" },
    cancelBtn: { backgroundColor: "#e6e6e6" },
    deleteBtn: { backgroundColor: "red" },
    cancelBtnTxt: { color: "#333", fontFamily: "Poppins-Medium" },
    deleteBtnTxt: { color: "#fff", fontFamily: "Poppins-Medium" }
})