import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { ArrowLeft, TriangleAlert } from 'lucide-react-native'
import Colors from '@/src/utils/Colors'
import * as Progress from 'react-native-progress';
import { useTranslation } from 'react-i18next'
import GlobalTextInput from '@/src/components/GlobalTextInput';
import GlobalButton from '@/src/components/GlobalButton';
import GlobalPopup from '@/src/components/Modals/GlobalPopup';

const MonthlyHappinessIndexTestScreen = () => {
  const { t } = useTranslation();
  const [showPopup, setShowPopup] = useState(true);

  useEffect(() => {
    setShowPopup(true);
  }, []);
  return (
    <View style={styles.main}>
      <View style={styles.HeaderView}>
        <View style={styles.titleView}>

          <ArrowLeft size={20} color={Colors.primary} />
          <Text style={styles.title}>
            {t('monthlyhappinessindex')}
          </Text>

        </View>
        <Text style={styles.description}>
          {t('happinessindexdescription')}
        </Text>

      </View>
      <View style={styles.briefdescriptionView}>
        <Text style={styles.briefdescription}>{t('survey.intro')} {"\n"}</Text>
        <Text style={styles.briefdescription}>{t('survey.anonymous')} {"\n"}</Text>
        <Text style={styles.briefdescription}>{t('survey.impactful')}</Text>

        <Text
          style={styles.undertenminute}
        >
          {t('undertenminutes')}
        </Text>

        <Progress.Bar progress={0.6} color={"rgba(132, 164, 2, 1)"} height={7} unfilledColor={Colors.iconColor} borderWidth={0} width={null} style={styles.progressbar} />
        <Text style={styles.progresspercentage}>
          80%
        </Text>
      </View>
      <View style={styles.testView}>
        <View
          style={styles.centerline}
        />
        <Text style={styles.totalquestions}>
          3/5
        </Text>
        <View style={styles.questionContainer}>
          <GlobalTextInput
            label='1. Name (Optional)'
            placeholder={'Name'}
          />
          <GlobalTextInput
            label='1. Age (Optional)'
            placeholder={'Age'}
          />
          <GlobalTextInput
            label='1. Gender (Optional)'
            placeholder={'Gender'}
          />
          <GlobalTextInput
            label='1. Nationality (Optional)'
            placeholder={'Nationality'}
          />

        </View>
        <Text style={styles.disclaimerText}>
          {t('happinessindexdisclaimer')}
        </Text>
        <GlobalButton
          title={t('submit')}
          buttonStyle={styles.submitButton}
          textStyle={styles.submitText}
        />
      </View>
      <GlobalPopup
        visible={showPopup}
        onClose={() => setShowPopup(false)}
        month='June'
        title={`${t('happinessindex')}`}
        subTitle={t('happinessindexunder10min')}
        message={t('happinessindexmessage')}
        buttonText={t('startSurvey')}
        icon={<TriangleAlert size={40} color="#d4a017" />}
        onButtonPress={() => setShowPopup(false)}
      />
    </View>
  )
}

export default MonthlyHappinessIndexTestScreen

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: Colors.captainanimatedlayoutbg

  },
  HeaderView: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'white',
    marginBottom: 10,
    elevation: 2,
  },
  titleView: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',

  },
  title: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: "#262626",
  },
  description: {
    fontSize: 11,
    fontFamily: "Poppins-Regular",
    color: "#262626",
    marginBottom: 10,
  },
  briefdescriptionView: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: Colors.captainanimatedlayoutbg
  },
  briefdescription: {
    color: '#000',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  undertenminute: {
    color: "#000",
    fontSize: 14,
    textAlign: 'right',
    marginTop: 10,
    fontFamily: "Poppins-Regular",
  },
  progressbar: {
    marginTop: 16,
  },
  progresspercentage: {
    marginTop: 10,
    textAlign: 'right',
    color: "#161616",
    fontSize: 14,
    fontFamily: "Poppins-Regular"
  },
  centerline: {
    height: 3,
    width: '28%',
    backgroundColor: '#FFFFFF66',
    alignSelf: 'center',
    marginTop: 5,
    borderRadius: 10,
  },
  testView: { backgroundColor: '#00000066', borderTopLeftRadius: 30, borderTopRightRadius: 30, flexDirection: 'column' },
  totalquestions: {
    textAlign: 'right',
    color: '#fff',
    fontSize: 14,
    marginRight: 20,
    marginTop: 16,
    fontFamily: 'WhyteInktrap-Medium',
  }, disclaimerText: {
    marginBottom: 10,
    marginHorizontal: 16,
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    fontStyle: "italic",
    color: "#fff",
  },
  submitButton: {
    marginBottom: 30,
    backgroundColor: 'white',
  },
  submitText: {
    color: Colors.darkGreen,
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold'
  }, questionContainer: { backgroundColor: 'rgba(0, 0, 0, 0.4)', padding: 20, margin: 16, borderRadius: 30 }
})
