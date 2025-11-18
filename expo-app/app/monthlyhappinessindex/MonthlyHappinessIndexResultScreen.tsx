import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import GlobalHeader from '@/src/components/GlobalHeader'
import { ChevronLeft } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { useLocalSearchParams, useRouter } from 'expo-router'
import Colors from '@/src/utils/Colors'

const MonthlyHappinessIndexResultScreen = () => {
  const { t } = useTranslation();
  const { assessmentData } = useLocalSearchParams();
  console.log(assessmentData,"PRINCE");
  
  const router = useRouter();
  return (
    <View style={styles.main}>
      <GlobalHeader
        title='Result Oct 2025'
        leftIcon={<ChevronLeft size={20} />}
        onLeftPress={() => router.back()
        }
      />
      <View style={styles.briefdescriptionView}>
        <Text style={styles.briefdescription}>{t('survey.intro')}{'\n'}</Text>
        <Text style={styles.briefdescription}>{t('survey.anonymous')}{'\n'}</Text>
        <Text style={styles.briefdescription}>{t('survey.impactful')}{'\n'}</Text>
        <Text style={styles.monthlabel}>Month : Oct 2025{'\n'}</Text>
        <Text style={styles.monthlabel}>Result : 66.00</Text>
        <Text style={styles.meaning}>(Happy — Generally satisfied, things are going well.)</Text>
      </View>
     
    </View>
  )
}

export default MonthlyHappinessIndexResultScreen

const styles = StyleSheet.create({
  main: {
    flex: 1,
  },
  briefdescriptionView: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: Colors.captainanimatedlayoutbg,
  },
  briefdescription: {
    color: '#000',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    lineHeight: 22,
  },
  monthlabel: {
    lineHeight: 22,
    fontSize: 16,
    color: "#161616",
    fontFamily: "WhyteInktrap-Medium",
  },
  meaning: {
    fontSize: 13,
    fontWeight: '600',
    color: "#5A5A5A",
    fontFamily: "Poppins-Regular",
  }
})