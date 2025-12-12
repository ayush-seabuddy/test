import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { InfoIcon } from 'lucide-react-native'
import { Image } from 'expo-image'
import { ImagesAssets } from '@/src/utils/ImageAssets'
import { useTranslation } from 'react-i18next'

const ActiveSailorsCard = () => {
    const { t } = useTranslation();
    return (
        <View style={styles.main}>
            <View style={styles.rowView}>
                <Text style={styles.activesailorsText}>{t('activeSailors')}</Text>
                <InfoIcon size={20} />
                <Image source={ImagesAssets.SailorsIcon} style={styles.sailorsLogo} />
            </View>
            <Text style={styles.activesailors_description}>{t('activeSailors_description')}</Text>
        </View>
    )
}

export default ActiveSailorsCard

const styles = StyleSheet.create({
    main: {
        flex: 1,
    },
    rowView: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    activesailorsText: {
        fontSize: 18, lineHeight: 28, color: "rgba(42, 43, 42,.8)", fontFamily: "WhyteInktrap-Bold"
    }, activesailors_description: {
        color: "gray", fontSize: 10, fontFamily: "Poppins-Regular"
    },
    sailorsLogo: {
        height: 40,
        width: 40
    }
})