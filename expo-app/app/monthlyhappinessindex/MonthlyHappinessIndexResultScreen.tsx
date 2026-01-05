import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import GlobalHeader from '@/src/components/GlobalHeader';
import { ChevronLeft } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Colors from '@/src/utils/Colors';
import Slider from '@react-native-community/slider';
import { Check } from 'lucide-react-native';

const MonthlyHappinessIndexResultScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { assessmentData } = useLocalSearchParams();
  
  const parsedData = useMemo(() => {
    if (!assessmentData || typeof assessmentData !== 'string') return null;
    try {
      return JSON.parse(assessmentData);
    } catch (e) {
      console.error('Parse error:', e);
      return null;
    }
  }, [assessmentData]);

const monthFormatted = useMemo(() => {
  if (!parsedData?.month) return 'Unknown';

  const [month, year] = parsedData.month.split('-');

  if (!month || !year) return 'Unknown';

  const date = new Date(Number(year), Number(month) - 1);

  return date.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
}, [parsedData]);

  const happinessScore = useMemo(() => {
    if (!parsedData?.questionsAndAnswers) return 'N/A';
    const q = parsedData.questionsAndAnswers.find((q: any) => q.result && !isNaN(parseFloat(q.result)));
    return q ? parseFloat(q.result).toFixed(2) : 'N/A';
  }, [parsedData]);

  const getMeaning = (score: number) => {
    if (score >= 80) return t('monthlyhappinessindex_resultdescription.veryhappy');
    if (score >= 60) return t('monthlyhappinessindex_resultdescription.happy');
    if (score >= 40) return t('monthlyhappinessindex_resultdescription.moderate');
    if (score >= 20) return t('monthlyhappinessindex_resultdescription.low');
    return t('monthlyhappinessindex_resultdescription.verylow');
  };

  const scoreNumber = parseFloat(happinessScore);

  return (
    <View style={styles.main}>
      <GlobalHeader
        title={`Result ${monthFormatted}`}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.briefdescriptionView}>
          <Text style={styles.briefdescription}>{t('survey.intro')}{'\n'}</Text>
          <Text style={styles.briefdescription}>{t('survey.anonymous')}{'\n'}</Text>
          <Text style={styles.briefdescription}>{t('survey.impactful')}{'\n'}</Text>
          <Text style={styles.monthlabel}>{t('month')} {monthFormatted}</Text>
          <Text style={styles.monthlabel}>{t('result')} {happinessScore}</Text>
          <Text style={styles.meaning}>({getMeaning(scoreNumber)})</Text>
        </View>

        {parsedData?.questionsAndAnswers?.map((q: any, index: number) => (
          <View key={q.questionId} style={styles.questionBlock}>
            <Text style={styles.questionText}>
              {index + 1}. {q.question}
            </Text>

            {(q.answerType === 'Textfield' || q.answerType === 'Textarea') && (
              <View style={styles.disabledTextInput}>
                <Text style={styles.disabledText}>{q.answer || '—'}</Text>
              </View>
            )}

            {q.answerType === 'Radio' && (
              <View style={styles.optionsContainer}>
                {q.answerOptions.map((opt: string) => {
                  const isSelected = q.answer === opt;
                  return (
                    <View key={opt} style={styles.radioRow}>
                      <View style={[styles.radioCircle, isSelected && styles.radioSelected]}>
                        {isSelected && <View style={styles.radioDot} />}
                      </View>
                      <Text style={styles.optionText}>{opt}</Text>
                    </View>
                  );
                })}
              </View>
            )}

            {q.answerType === 'Checkbox' && (
              <View style={styles.optionsContainer}>
                {q.answerOptions.map((opt: string) => {
                  const checked = q.answer?.includes(opt);
                  return (
                    <View key={opt} style={styles.checkboxRow}>
                      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                        {checked && <Check size={16} color={Colors.white} />}
                      </View>
                      <Text style={styles.optionText}>{opt}</Text>
                    </View>
                  );
                })}
              </View>
            )}

            {q.answerType === 'Linear Scale' && (
              <View style={styles.sliderContainer}>
                <Slider
                  style={{ width: '100%', height: 50 }}
                  minimumValue={1}
                  maximumValue={10}
                  step={1}
                  value={parseInt(q.answer) || 5}
                  disabled
                  minimumTrackTintColor={Colors.lightGreen}
                  maximumTrackTintColor="#666"
                  thumbTintColor="#fff"
                />
                <View style={styles.sliderLabels}>
                  <Text style={styles.sliderText}>{t('veryhappy')}</Text>
                  <Text style={styles.sliderText}>{q.answer || 5}</Text>
                  <Text style={styles.sliderText}>{t('happy')}</Text>
                </View>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default MonthlyHappinessIndexResultScreen;

const styles = StyleSheet.create({
  main: { flex: 1, backgroundColor: Colors.captainanimatedlayoutbg },

  briefdescriptionView: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: Colors.captainanimatedlayoutbg,
  },
  briefbriefdescription: {
    color: '#000',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    lineHeight: 22,
  },
  monthlabel: {
    lineHeight: 22,
    fontSize: 16,
    color: '#161616',
    fontFamily: 'WhyteInktrap-Medium',
    marginTop: 8,
  },
  meaning: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5A5A5A',
    fontFamily: 'Poppins-Regular',
    marginTop: 4,
  },

  questionBlock: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 20,
    borderRadius: 16,
  },
  questionText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'Poppins-Medium',
    marginBottom: 12,
    textTransform: 'capitalize',
  },
  disabledTextInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    minHeight: 50,
    justifyContent: 'center',
  },
  disabledText: {
    color: '#000',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },

  optionsContainer: { marginTop: 8 },

  radioRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
  radioCircle: {
    height: 22,
    width: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#fff',
    marginRight: 12,
  },
  radioSelected: {
    borderColor: Colors.lightGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: { width: 14, height: 14, borderRadius: 50, backgroundColor: Colors.lightGreen },

  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: Colors.lightGreen,
    borderColor: Colors.lightGreen,
  },

  optionText: { color: '#fff', fontSize: 15, fontFamily: 'Poppins-Regular' },

  sliderContainer: { marginTop: 16 },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 8,
  },
  briefdescription: {
    color: '#000',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    lineHeight: 22,
  },
  sliderText: { fontSize: 13, color: Colors.white, fontFamily: 'Poppins-Regular' },
});