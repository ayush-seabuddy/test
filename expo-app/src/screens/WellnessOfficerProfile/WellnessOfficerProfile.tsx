
import GlobalHeader from '@/src/components/GlobalHeader'
import MediaPreviewModal from '@/src/components/Modals/MediaPreviewModal'
import Colors from '@/src/utils/Colors'
import Fonts from '@/src/utils/Fonts'
import { BlurView } from 'expo-blur'
import { router, useLocalSearchParams } from 'expo-router'
import { t } from 'i18next'
import { ChevronLeft, Maximize2 } from 'lucide-react-native'
import React, { useMemo, useState } from 'react'
import {
    Dimensions,
    ImageBackground,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'

const { height } = Dimensions.get('window')

const WellnessOfficerProfile = () => {
    const { item }: { item?: string } = useLocalSearchParams()
    const data = useMemo(() => JSON.parse(item || '{}'), [item])

    const maxLength = 300
    const [expanded, setExpanded] = useState(false)
    const [modalVisible, setModalVisible] = useState(false)
    const [selectedMedia, setSelectedMedia] = useState("")

    const isLong = data?.description?.length > maxLength
    const displayText = expanded || !isLong
        ? data.description
        : `${data.description.substring(0, maxLength)}...`

    const handleMediaPress = (url: string) => {
        setSelectedMedia(url)
        setModalVisible(true)
    }

    const renderList = (title: string, values: string[]) => {
        if (!values || values.length === 0) return null
        return (
            <Text style={styles.content}>
                <Text style={styles.title}>{title}: </Text>
                {values.join(', ')}
            </Text>
        )
    }

    if (!data) return null

    return (
        <View style={{ flex: 1 }}>
            <GlobalHeader
                title={t('WellnessOfficerProfile')}
            />

            {/* Expand Image Button */}
            <TouchableOpacity
                onPress={() => handleMediaPress(data?.profileUrl || "")}
                style={styles.viewIconContainer}
            >
                <Maximize2 size={20} color={Colors.black} />
            </TouchableOpacity>

            {/* Profile Image */}
            <ImageBackground
                source={{ uri: data.profileUrl }}
                style={styles.profileImage}
                resizeMode="cover"
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100, paddingTop: 200 }}
                style={{ paddingHorizontal: 16 }}
            >
                <View style={styles.card}>
                    <BlurView intensity={200} tint="dark" style={StyleSheet.absoluteFill} />

                    <Text style={styles.doctorName}>{data.doctorName}</Text>
                    <Text style={styles.content}>{data?.contactDetails}</Text>

                    {/* Details */}
                    <View style={styles.detailsContainer}>
                        <Text style={styles.doctorName}>Details</Text>

                        {renderList("Languages", data?.language)}
                        {renderList("Specialization", data?.expertise)}

                        <Text style={styles.content}>
                            <Text style={styles.title}>Experience: </Text>
                            {data?.experience}
                        </Text>

                        {data?.nationality && (
                            <Text style={styles.content}>
                                <Text style={styles.title}>Nationality: </Text>
                                {data?.nationality}
                            </Text>
                        )}
                    </View>

                    <Text style={styles.aboutName}>About your wellness officer</Text>

                    <Text style={styles.content}>{displayText}</Text>

                    {isLong && (
                        <TouchableOpacity
                            style={styles.readMoreButton}
                            onPress={() => setExpanded((prev) => !prev)}
                        >
                            <Text style={styles.readMoreText}>
                                {expanded ? '- Read less' : '+ Read more'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>

            {/* Book Button */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={() => {
                    router.push({
                        pathname: '/AppointmentForm',
                        params: { data: JSON.stringify(data) }
                    })
                }}>
                    <View style={styles.buttonInner}>
                        <Text style={styles.buttonText}>{t('Book_an_appointment')}</Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Image Modal */}
            <MediaPreviewModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                uri={selectedMedia}
                type="image"
            />
        </View>
    )
}

export default WellnessOfficerProfile

const styles = StyleSheet.create({
    profileImage: {
        width: "100%",
        height: height * 0.4,
        position: 'absolute',
        top: 53,
        borderBottomRightRadius: 32,
        borderBottomLeftRadius: 32,
        overflow: 'hidden'
    },
    doctorName: {
        fontSize: 22,
        lineHeight: 32,
        color: 'rgba(0,0,0,0.9)',
        fontFamily: Fonts.WhyteInktrapBold
    },
    aboutName: {
        fontSize: 18,
        lineHeight: 24,
        fontFamily: Fonts.WhyteInktrapBold,
        marginVertical: 10,
        color: 'rgba(15,15,15,0.9)'
    },
    card: {
        backgroundColor: 'rgba(255,255,255,0.92)',
        overflow: "hidden",
        padding: 20,
        borderRadius: 30
    },
    detailsContainer: {
        gap: 10,
        marginVertical: 20
    },
    title: {
        fontSize: 14,
        lineHeight: 24,
        fontFamily: Fonts.WhyteInktrapBold,
        color: Colors.black
    },
    content: {
        fontSize: 13,
        lineHeight: 20,
        color: '#454545',
        fontFamily: Fonts.PoppinsRegular
    },
    viewIconContainer: {
        borderRadius: 5,
        backgroundColor: "#D9D9D9",
        position: "absolute",
        right: 15,
        top: 80,
        zIndex: 30,
        padding: 10,
        opacity: 0.7
    },
    readMoreButton: {
        marginTop: 10,
        alignItems: 'flex-end'
    },
    readMoreText: {
        fontSize: 16,
        lineHeight: 20,
        color: Colors.darkGreen,
        fontFamily: Fonts.PoppinsRegular
    },
    buttonContainer: {
        paddingHorizontal: 16,
        width: "100%",
        position: "absolute",
        bottom: "4%"
    },
    button: {
        shadowColor: "rgba(103,110,118,0.08)",
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 5,
        elevation: 5,
        borderRadius: 8,
        backgroundColor: "#02130b",
        paddingHorizontal: 20,
        paddingVertical: 12
    },
    buttonInner: {
        flexDirection: "row",
        justifyContent: "center"
    },
    buttonText: {
        fontSize: 14,
        lineHeight: 21,
        fontFamily: "Poppins-SemiBold",
        color: "#fff"
    }
})
