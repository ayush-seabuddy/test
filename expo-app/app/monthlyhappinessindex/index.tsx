import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { ArrowLeft, Check, TriangleAlert } from 'lucide-react-native';
import Colors from '@/src/utils/Colors';
import * as Progress from 'react-native-progress';
import { useTranslation } from 'react-i18next';
import GlobalButton from '@/src/components/GlobalButton';
import GlobalPopup from '@/src/components/Modals/GlobalPopup';
import { getallassessments, saveassessmentresponse } from '@/src/apis/apiService';
import { showToast } from '@/src/components/GlobalToast';
import { router } from 'expo-router';

type AnswerType = 'Textfield' | 'Radio' | 'Checkbox' | 'Linear Scale' | 'Textarea';

interface Question {
  id: string;
  section: string;
  question: string;
  answerType: AnswerType;
  answerOptions: (string | number)[];
  required: boolean;
  order: string;
}

interface SectionData {
  title: string;
  data: Question[];
}

const MonthlyHappinessIndexTestScreen = () => {
  const { t } = useTranslation();
  const [showPopup, setShowPopup] = useState(true);
  const [sections, setSections] = useState<SectionData[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const currentDate = new Date();
  const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
  const previousMonthName = previousMonth.toLocaleString("default", { month: "long" });
  const transformToSections = (questions: Question[]): SectionData[] => {
    const sectionMap: Record<string, Question[]> = {};

    questions.forEach(q => {
      if (!sectionMap[q.section]) sectionMap[q.section] = [];
      sectionMap[q.section].push(q);
    });

    return Object.keys(sectionMap)
      .map(sectionTitle => ({
        title: sectionTitle,
        data: sectionMap[sectionTitle].sort((a, b) => +a.order - +b.order),
      }))
      .sort((a, b) => +a.data[0].order - +b.data[0].order);
  };

  const fetchQuestions = useCallback(async () => {
    try {
      const res = await getallassessments({ questionType: 'HAPPINESS' });
      if (res.success && res.status === 200) {
        setSections(transformToSections(res.data));
      } else {
        showToast.error(t('oops'), res.message);
      }
    } catch (err: any) {
      showToast.error(t('oops'), err.message || t('somethingwentwrong'));
    }
  }, [t]);

  const handleSubmit = async () => {
    const missing = requiredQuestionIds.filter(id => {
      const val = answers[id];
      return val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0);
    });

    if (missing.length > 0) {
      showToast.error('Required', 'Please answer all required questions');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        questionType: 'HAPPINESS',
        month: new Date().toISOString().slice(0, 7),
        answers: Object.entries(answers).map(([questionId, answer]) => ({
          questionId,
          createdAt: new Date().toISOString(),
          answer: Array.isArray(answer)
            ? answer.join('')
            : typeof answer === 'number'
              ? answer
              : String(answer) || '',
        })),
      };

      const res = await saveassessmentresponse(payload as any);

      if (res.success) {
        showToast.success(t('success'), res.message);
        router.push('/home');
      } else {
        showToast.error(t('oops'), res.message);
      }
    } catch (err: any) {
      showToast.error(t('oops'), err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const updateAnswer = (id: string, value: any) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const requiredQuestionIds = React.useMemo(() => {
    return sections
      .flatMap(section => section.data)
      .filter(q => q.required)
      .map(q => q.id);
  }, [sections]);

  const calculateProgress = React.useMemo(() => {
    const total = requiredQuestionIds.length;
    if (total === 0) return 0;

    let filled = 0;

    requiredQuestionIds.forEach(id => {
      const val = answers[id];

      if (
        val !== undefined &&
        val !== null &&
        val !== '' &&
        !(Array.isArray(val) && val.length === 0)
      ) {
        filled += 1;
      }
    });

    return filled / total;
  }, [answers, requiredQuestionIds]);

  const renderQuestion = ({ item }: { item: Question }) => {
    const { id, question, answerType, answerOptions, required } = item;
    const value = answers[id];

    return (
      <View style={styles.questionBlock}>
        <Text style={styles.questionText}>
          {question}
          {required && <Text style={{ color: '#ff6b6b' }}>*</Text>}
        </Text>

        {(answerType === 'Textfield' || answerType === 'Textarea') && (
          <TextInput
            style={[styles.textInput, answerType === 'Textarea' && styles.textarea]}
            placeholder={t('enterhere')}
            value={value || ''}
            onChangeText={(text) => updateAnswer(id, text)}
            multiline={answerType === 'Textarea'}
            numberOfLines={answerType === 'Textarea' ? 5 : 1}
          />
        )}

        {answerType === 'Radio' && (
          <View style={styles.optionsContainer}>
            {answerOptions.map(opt => (
              <TouchableOpacity
                key={opt}
                style={styles.radioRow}
                onPress={() => updateAnswer(id, opt)}
              >
                <View style={[styles.radioCircle, value === opt && styles.radioSelected]}>
                  {value === opt && <View style={styles.radioDot} />}
                </View>
                <Text style={styles.optionText}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {answerType === 'Checkbox' && (
          <View style={styles.optionsContainer}>
            {answerOptions.map(opt => {
              const checked = (value || []).includes(opt);
              return (
                <TouchableOpacity
                  key={opt}
                  style={styles.checkboxRow}
                  onPress={() => {
                    const newVal = checked
                      ? (value || []).filter((x: any) => x !== opt)
                      : [...(value || []), opt];
                    updateAnswer(id, newVal);
                  }}
                >
                  <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                    {checked && <Check size={16} color={Colors.white} />}
                  </View>
                  <Text style={styles.optionText}>{opt}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {answerType === 'Linear Scale' && (
          <View style={styles.sliderContainer}>
            <Slider
              style={{ width: '100%', height: 50 }}
              minimumValue={1}
              maximumValue={10}
              step={1}
              value={value || 5}
              onValueChange={(val) => updateAnswer(id, val)}
              minimumTrackTintColor={Colors.white || '#B0DB02'}
              maximumTrackTintColor="#555"
              thumbTintColor="#fff"
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderText}>Very Unhappy</Text>
              <Text style={styles.sliderText}>{value || 5}</Text>
              <Text style={styles.sliderText}>Very Happy</Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderSectionHeader = ({ section }: { section: SectionData }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
    </View>
  );

  return (
    <View style={styles.main}>
      <View style={styles.HeaderView}>
        <View style={styles.titleView}>
          <ArrowLeft size={20} color={Colors.primary} />
          <Text style={styles.title}>{t('monthlyhappinessindex')}</Text>
        </View>
        <Text style={styles.description}>{t('happinessindexdescription')}</Text>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderQuestion}
        renderSectionHeader={renderSectionHeader}
        stickySectionHeadersEnabled
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <View style={styles.briefdescriptionView}>
              <Text style={styles.briefdescription}>{t('survey.intro')}{'\n'}</Text>
              <Text style={styles.briefdescription}>{t('survey.anonymous')}{'\n'}</Text>
              <Text style={styles.briefdescription}>{t('survey.impactful')}</Text>

              <Text style={styles.undertenminute}>{t('undertenminutes')}</Text>
              <Progress.Bar
                progress={calculateProgress}
                color="rgba(132, 164, 2, 1)"
                height={7}
                unfilledColor={Colors.iconColor}
                borderWidth={0}
                width={null}
                style={styles.progressbar}
              />

              <Text style={styles.progresspercentage}>
                {Math.round(calculateProgress * 100)}%
              </Text>
            </View>
          </>
        }
        ListFooterComponent={
          <View style={styles.footer}>
            <Text style={styles.disclaimerText}>{t('happinessindexdisclaimer')}</Text>
            <GlobalButton
              title={loading ? t('pleasewait') : t('submit')}
              loading={loading}
              disabled={calculateProgress < 1 || loading}
              onPress={handleSubmit}
              buttonStyle={[
                styles.submitButton,
                (calculateProgress < 1 || loading) && { opacity: 0.5 },
              ]}
              textStyle={styles.submitText}
            />
          </View>
        }
      />


      <GlobalPopup
        visible={showPopup}
        onClose={() => setShowPopup(false)}
        month={previousMonthName}
        title={t('happinessindex')}
        subTitle={t('happinessindexunder10min')}
        message={t('happinessindexmessage')}
        buttonText={t('startSurvey')}
        icon={<TriangleAlert size={40} color="#d4a017" />}
        onButtonPress={() => setShowPopup(false)}
      />
    </View>
  );
};

export default MonthlyHappinessIndexTestScreen;

const styles = StyleSheet.create({
  main: { flex: 1, backgroundColor: Colors.captainanimatedlayoutbg },
  HeaderView: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
  },
  titleView: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { fontSize: 16, fontFamily: 'Poppins-Regular', color: '#262626' },
  description: { fontSize: 11, fontFamily: 'Poppins-Regular', color: '#262626', marginTop: 5 },

  scrollContainer: { flex: 1, backgroundColor: '#00000080' },

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
  undertenminute: { color: '#000', fontSize: 14, textAlign: 'right', marginTop: 12 },
  progressbar: { marginTop: 16 },
  progresspercentage: { marginTop: 10, textAlign: 'right', color: '#161616', fontSize: 14 },

  sectionHeader: { paddingHorizontal:16,paddingVertical:10, backgroundColor: '#CCCCCC' },
  sectionTitle: { color: '#fff', fontSize: 18, fontFamily: 'Poppins-SemiBold' },

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

  textInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
  },
  textarea: { height: 120, textAlignVertical: 'top' },

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
  sliderText: { fontSize: 13, color: Colors.white, fontFamily: 'Poppins-Regular' },

  footer: { padding: 20, paddingBottom: 40 },
  disclaimerText: {fontStyle: 'italic', marginBottom: 20, fontSize: 14 },
  submitButton: { backgroundColor: 'white', borderRadius: 12, width: '100%' },
  submitText: { color: Colors.darkGreen, fontFamily: 'Poppins-SemiBold' },
});
