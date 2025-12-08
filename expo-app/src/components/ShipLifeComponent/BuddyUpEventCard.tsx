import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Image } from 'expo-image'
import { useTranslation } from 'react-i18next';
import { Trophy } from 'lucide-react-native';
import { ImagesAssets } from '@/src/utils/ImageAssets';

const BuddyUpEventCard = () => {
    const { t } = useTranslation();
    return (
        <View style={styles.main}>
            <View style={styles.card}>
                <Image source={{ uri: "https://i.pinimg.com/236x/a6/7f/d6/a67fd60cc718dbe4a734817a80126a53.jpg" }} style={styles.imageStyle} />
                <Text style={styles.buddyupeventName}>Movie Night</Text>
                <Text style={styles.organizedby}>Organized By Prince Singh</Text>
                <Text style={styles.organizedby}>Start Date - 25 Nov 2025, 4:04 AM</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                    <Image source={ImagesAssets.LeaderboardIcon} style={{ height: 16, width: 16, tintColor: 'orange', marginTop: 5 }}></Image>
                    <Text style={styles.claimyourmiles}>
                        {t('claimyourmilesnow')}
                    </Text>
                </View>
            </View>
        </View>
    )
}

export default BuddyUpEventCard

const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: '#fff'
    },
    card: {
        height: 300,
        width: 220,
        backgroundColor: '#f5f5f5',
        padding: 10,
        borderWidth: 0.5,
        borderColor: '#d5d5d5',
        borderRadius: 10,
    },
    imageStyle: {
        height: 180,
        resizeMode: 'cover',
        borderRadius: 10,
    }, organizedby: {
        fontSize: 12,
        color: "grey",
        fontFamily: "Poppins-Regular",
    },
    buddyupeventName: {
        marginTop: 8,
        fontSize: 14,
        color: "#222",
        fontFamily: "Poppins-SemiBold",
    },
    claimyourmiles: {
        fontSize: 11,
        color: "orange",
        marginTop: 7,
        fontFamily: "Poppins-Regular",
    }
})