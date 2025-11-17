import { StyleSheet, Text, View, ScrollView } from 'react-native'
import React from 'react'
import { Share2 } from 'lucide-react-native'
import Colors from '@/src/utils/Colors'
import { useTranslation } from 'react-i18next'
import { Image } from 'expo-image'
import { ImagesAssets } from '@/src/utils/ImageAssets'
import GlobalButton from '@/src/components/GlobalButton'

// Dummy card component
const DummyCard = ({ title }: { title: string }) => (
  <View style={styles.card}>
    <Text style={styles.cardText}>{title}</Text>
  </View>
)

const PersonalityMapResultScreen = () => {
  const { t } = useTranslation()

  // Dummy data for cards
  const cards = [
    'Card 1',
    'Card 2',
    'Card 3',
    'Card 4',
    'Card 5',
    'Card 6',
    'Card 7',
  ]

  return (
    <View style={styles.main}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.personaresulttext}>{t('personaresult')}</Text>
        <View style={styles.shareIcon}>
          <Share2 size={16} />
        </View>
      </View>

      {/* Scrollable content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Center Image */}
        <View style={styles.imageContainer}>
          <Image
            source={ImagesAssets.personaresultbackground}
            style={styles.image}
            contentFit="contain"
          />
        </View>

        {/* Cards */}
        {cards.map((item, index) => (
          <DummyCard key={index} title={item} />
        ))}

        {/* Add spacing at bottom so button doesn’t overlap */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={styles.buttonContainer}>
        <GlobalButton title={t('goback')} />
      </View>
    </View>
  )
}

export default PersonalityMapResultScreen

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#fff',
  },
  shareIcon: {
    backgroundColor: '#B0DB0266',
    borderRadius: 5,
    height: 30,
    width: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  personaresulttext: {
    fontSize: 20,
    color: 'black',
    fontFamily: 'WhyteInktrap-Bold',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 200,
  },
  card: {
    height: 90,
    marginBottom: 16,
    backgroundColor: Colors.lightGreen,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  cardText: {
    color: '#000',
    fontFamily: 'Poppins-Medium',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    right: 10,
  },
})
