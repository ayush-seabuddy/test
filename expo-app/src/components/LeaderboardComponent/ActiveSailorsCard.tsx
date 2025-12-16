import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import { Image } from 'expo-image'
import { ImagesAssets } from '@/src/utils/ImageAssets'
import { useTranslation } from 'react-i18next'

interface ActiveSailorsCardProps {
  activeSailorsOfMonth: {
    fullName: string
    profileUrl: string
    designation: string
    rewardPoints: string
  }
  rank?: number
  onPress?: () => void
}

const ActiveSailorsCard: React.FC<ActiveSailorsCardProps> = ({
  activeSailorsOfMonth,
  rank = 1,
  onPress,
}) => {
  const { t } = useTranslation()

  return (
    <TouchableOpacity 
      style={styles.activeSailorCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Rank Badge */}
      <View style={styles.rankView}>
        <Text style={styles.rankText}>{rank}</Text>
      </View>

      {/* Profile Image */}
      <Image
        source={
          activeSailorsOfMonth.profileUrl
            ? { uri: activeSailorsOfMonth.profileUrl }
            : ImagesAssets.userIcon
        }
        style={styles.sailorsImage}
        contentFit="cover"
      />

      {/* Name */}
      <Text
        style={styles.sailorsName}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {activeSailorsOfMonth.fullName}
      </Text>

      {/* Designation */}
      <Text
        style={styles.sailorsDesignation}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {activeSailorsOfMonth.designation}
      </Text>

      {/* Miles Display */}
      <View style={styles.milesView}>
        <Text style={styles.rewardText}>
          {activeSailorsOfMonth.rewardPoints}
        </Text>
        <Text style={styles.milesText}>{t('miles')}</Text>
      </View>
    </TouchableOpacity>
  )
}

export default ActiveSailorsCard

const styles = StyleSheet.create({
  activeSailorCard: {
    height: 200,
    width: 150,
    borderRadius: 10,
    marginRight: 12,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  rankView: {
    backgroundColor: '#B0DB02',
    alignItems: 'center',
    justifyContent: 'center',
    height: 30,
    width: 30,
    borderRadius: 15,
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },

  rankText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    lineHeight: 18,
    color: '#fff',
  },

  sailorsImage: {
    height: 60,
    width: 60,
    borderRadius: 30,
    marginTop: 15,
    marginBottom: 8,
  },

  sailorsName: {
    fontSize: 13,
    color: '#636363',
    fontFamily: 'Poppins-SemiBold',
    lineHeight: 18,
    textAlign: 'center',
    paddingHorizontal: 5,
  },

  sailorsDesignation: {
    fontSize: 10,
    color: '#949494',
    fontFamily: 'Poppins-Regular',
    lineHeight: 14,
    textAlign: 'center',
    paddingHorizontal: 5,
    marginBottom: 8,
  },

  milesView: {
    height: 50,
    width: '90%',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#B0DB021A',
  },

  rewardText: {
    fontSize: 14,
    color: '#06361F',
    fontFamily: 'Poppins-SemiBold',
    lineHeight: 18,
    textAlign: 'center',
  },

  milesText: {
    fontSize: 10,
    color: '#B7B7B7',
    fontFamily: 'Poppins-Regular',
    lineHeight: 14,
    textAlign: 'center',
  },
})