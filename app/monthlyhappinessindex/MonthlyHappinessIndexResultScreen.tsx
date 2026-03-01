import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Slider from '@react-native-community/slider';
import { Check } from 'lucide-react-native';

import GlobalHeader from '@/src/components/GlobalHeader';
import Colors from '@/src/utils/Colors';
import { getassessmentresultdetails } from '@/src/apis/apiService';
import { showToast } from '@/src/components/GlobalToast';
import CommonLoader from '@/src/components/CommonLoader';


type QuestionAnswer = {
  questionId: string;
  question: string;
  answer: string;
  answerType: string;
  answerOptions: string[];
};


const formatMonth = (value?: string) => {
  if (!value) return '';

  const [mm, yyyy] = value.split('-');
  const date = new Date(Number(yyyy), Number(mm) - 1);

  return date.toLocaleString('en-US', {
    month: 'short',
    year: 'numeric',
  });
};


const MonthlyHappinessIndexResultScreen = () => {
  const { t } = useTranslation();

  const { month, assessmentType } = useLocalSearchParams<{
    month: string;
    assessmentType: string;
  }>();

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<QuestionAnswer[]>([]);
  const [happinessScore, setHappinessScore] = useState<number>(0);

  const formattedMonth = useMemo(() => formatMonth(month), [month]);

  const fetchResult = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getassessmentresultdetails({
        month,
        assessmentType,
      });

      if (res?.status === 200 && Array.isArray(res?.data)) {
        const apiData = res.data;

        setHappinessScore(Number(apiData[0]?.result ?? 0));

        const formattedQuestions: QuestionAnswer[] = apiData.map((item: any) => ({
          questionId: item.questionId,
          question: item.questionDetail?.question ?? '',
          answer: item.answer ?? '',
          answerType: item.questionDetail?.answerType ?? '',
          answerOptions: item.questionDetail?.answerOptions ?? [],
        }));

        setQuestions(formattedQuestions);
      } else {
        showToast.error(t('oops'), res?.message ?? t('somethingwentwrong'));
      }
    } catch (error) {
      showToast.error(t('oops'), t('somethingwentwrong'));
    } finally {
      setLoading(false);
    }
  }, [month, assessmentType, t]);

  useEffect(() => {
    fetchResult();
  }, [fetchResult]);

  const meaning = useMemo(() => {
    if (happinessScore >= 80) return t('monthlyhappinessindex_resultdescription.veryhappy');
    if (happinessScore >= 60) return t('monthlyhappinessindex_resultdescription.happy');
    if (happinessScore >= 40) return t('monthlyhappinessindex_resultdescription.moderate');
    if (happinessScore >= 20) return t('monthlyhappinessindex_resultdescription.low');
    return t('monthlyhappinessindex_resultdescription.verylow');
  }, [happinessScore, t]);

  return (
    <View style={styles.main}>
      <GlobalHeader title={`${t('result')} ${formattedMonth}`} />
      {loading ? <View style={styles.loader}>
        <CommonLoader fullScreen />
      </View> : <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        <View style={styles.briefdescriptionView}>
          <Text style={styles.briefdescription}>{t('survey.intro')}</Text>
          <Text style={styles.briefdescription}>{t('survey.anonymous')}</Text>
          <Text style={styles.briefdescription}>{t('survey.impactful')}</Text>

          <Text style={styles.monthlabel}>
            {t('month')} {formattedMonth}
          </Text>
          <Text style={styles.monthlabel}>
            {t('result')} {happinessScore}
          </Text>
          <Text style={styles.meaning}>({meaning})</Text>
        </View>

        {questions.map((q, index) => (
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
                {q.answerOptions.map(opt => {
                  const selected = q.answer === opt;
                  return (
                    <View key={opt} style={styles.radioRow}>
                      <View style={[styles.radioCircle, selected && styles.radioSelected]}>
                        {selected && <View style={styles.radioDot} />}
                      </View>
                      <Text style={styles.optionText}>{opt}</Text>
                    </View>
                  );
                })}
              </View>
            )}

            {q.answerType === 'Checkbox' && (
              <View style={styles.optionsContainer}>
                {q.answerOptions.map(opt => {
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
                  minimumValue={1}
                  maximumValue={10}
                  step={1}
                  value={Number(q.answer) || 5}
                  disabled
                  minimumTrackTintColor={Colors.lightGreen}
                  maximumTrackTintColor="#666"
                  thumbTintColor="#fff"
                />
                <View style={styles.sliderLabels}>
                  <Text style={styles.sliderText}>{t('veryunhappy')}</Text>
                  <Text style={styles.sliderText}>{q.answer}</Text>
                  <Text style={styles.sliderText}>{t('veryhappy')}</Text>
                </View>
              </View>
            )}
          </View>
        ))}
      </ScrollView>}

    </View>
  );
};

export default MonthlyHappinessIndexResultScreen;

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: Colors.captainanimatedlayoutbg,
  },

  loader: {
    flex: 1,
    backgroundColor: Colors.captainanimatedlayoutbg,
    justifyContent: 'center',
    alignItems: 'center',
  },

  briefdescriptionView: {
    paddingHorizontal: 16,
    paddingVertical: 24,
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
    color: '#161616',
    fontFamily: 'WhyteInktrap-Medium',
    marginTop: 10,
  },

  meaning: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5A5A5A',
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

  radioDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.lightGreen,
  },

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

  optionText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
  },

  sliderContainer: { marginTop: 16 },

  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 8,
  },

  sliderText: {
    fontSize: 13,
    color: Colors.white,
    fontFamily: 'Poppins-Regular',
  },
});
