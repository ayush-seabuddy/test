import { StyleSheet, Text, TextInput, View } from 'react-native'
import React from 'react'
import GlobalHeader from '@/src/components/GlobalHeader'
import { useTranslation } from 'react-i18next'
import { Image } from 'expo-image'
import { ImagesAssets } from '@/src/utils/ImageAssets'
import Colors from '@/src/utils/Colors'

const SurveyScreen = () => {
  const { t } = useTranslation();
  return (
    <View style={styles.main}>
      <GlobalHeader
        title={t('surveyHeader')}
      />
      <View style={styles.headerView}>
        <Image source={ImagesAssets.SurveyImage} style={styles.surveyImage} />
        <Text style={styles.surveyTitle}>Maritime Workforce Well-Being Assessment</Text>
        <Text style={styles.surveyDescription}>Maritime Workforce Well-Being Assessment Maritime Workforce Well-Being Assessment Maritime Workforce Well-Being Assessment Maritime Workforce Well-Being Assessment Maritime Workforce Well-Being Assessment Maritime Workforce Well-Being Assessment</Text>
      </View>
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              { width: `50%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>50% Complete</Text>
      </View>
      <View style={styles.questionCard}>
        <Text>What is your Name*</Text>
        <TextInput placeholder='Type your answer'/>
      </View>
    </View>
  )
}

export default SurveyScreen

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#fff'
  },
  surveyImage: {
    height: 80,
    width: 80
  },
  headerView: {
    flexDirection: 'row',
    backgroundColor: 'red'
  },
  surveyTitle: {
    fontSize: 20,
    fontFamily: "Poppins-SemiBold",
    color: "black",
  },
  surveyDescription: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "black",
  },
  progressBarContainer: {
    position: "sticky",
    top: 0,
    marginTop: 10,
    zIndex: 10,
    paddingVertical: 10,
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: "#E2E8F0",
    borderRadius: 5,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: Colors.lightGreen,
    borderRadius: 5,
  },
  progressText: {
    marginTop: 10,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#1E293B",
    textAlign: "center",
  },
  questionCard:{
    height:200,backgroundColor:'red'
  }
})