import { getallassessments, saveassessmentresponse } from '@/src/apis/apiService';
import EmptyComponent from '@/src/components/EmptyComponent';
import GlobalButton from '@/src/components/GlobalButton';
import { showToast } from '@/src/components/GlobalToast';
import GlobalPopup from '@/src/components/Modals/GlobalPopup';
import { useNetwork } from '@/src/hooks/useNetworkStatusHook';
import Colors from '@/src/utils/Colors';
import Slider from '@react-native-community/slider';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Check, ChevronLeft, TriangleAlert } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BackHandler,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as Progress from 'react-native-progress';

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

interface TestData {
  isRequires?: boolean;
}

const MonthlyHappinessIndexTestScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ showPopup?: string; testData?: string }>();
  const isOnline = useNetwork();
  const [sections, setSections] = useState<SectionData[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<any>(null);

  const parsedTestData = useMemo<TestData | null>(() => {
    if (!params.testData) return null;
    try {
      return JSON.parse(params.testData);
    } catch {
      return null;
    }
  }, [params.testData]);

  const isRequiredTest = parsedTestData?.isRequires === true;
  const shouldShowPopup = params.showPopup === 'true';
  const formatMonthMMYYYY = (date: Date) => {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}-${year}`;
  };
  const [showPopup, setShowPopup] = useState(shouldShowPopup);

  const previousMonth = new Date();
  previousMonth.setMonth(previousMonth.getMonth() - 1);
  const previousMonthName = previousMonth.toLocaleString('default', { month: 'long' });

  const transformToSections = (questions: Question[]): SectionData[] => {
    const sectionMap: Record<string, Question[]> = {};
    questions.forEach(q => {
      if (!sectionMap[q.section]) sectionMap[q.section] = [];
      sectionMap[q.section].push(q);
    });

    return Object.entries(sectionMap)
      .map(([title, data]) => ({
        title,
        data: data.sort((a, b) => +a.order - +b.order),
      }))
      .sort((a, b) => +a.data[0].order - +b.data[0].order);
  };

  const fetchQuestions = useCallback(async () => {
    if (!isOnline) return;
    try {
      const res = await getallassessments({ questionType: 'HAPPINESS' });
      if (res.success && res.status === 200) {
        setSections(transformToSections(res.data || []));
      } else {
        showToast.error(t('oops'), res.message || t('somethingwentwrong'));
      }
    } catch (err: any) {
      showToast.error(t('oops'), err.message || t('somethingwentwrong'));
    }
  }, [t]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  useFocusEffect(
    useCallback(() => {
      if (!isRequiredTest) return;

      const onBackPress = () => true;

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [isRequiredTest])
  );

  const updateAnswer = (id: string, value: any) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const requiredQuestionIds = useMemo(() => {
    return sections
      .flatMap(s => s.data)
      .filter(q => q.required)
      .map(q => q.id);
  }, [sections]);

  const calculateProgress = useMemo(() => {
    const total = requiredQuestionIds.length;
    if (total === 0) return 0;

    const filled = requiredQuestionIds.filter(id => {
      const val = answers[id];
      return val != null && val !== '' && !(Array.isArray(val) && val.length === 0);
    }).length;

    return filled / total;
  }, [answers, requiredQuestionIds]);


  const handleSubmit = async () => {
    if (calculateProgress < 1) {
      showToast.error(t('required'), t('please_answer_all_required'));
      return;
    }

    setLoading(true);
    try {
      const payload = {
        questionType: 'HAPPINESS',
        month: formatMonthMMYYYY(previousMonth),
        answers: Object.entries(answers).map(([questionId, answer]) => ({
          questionId,
          answer: Array.isArray(answer)
            ? answer.join(',')
            : typeof answer === 'number'
              ? answer
              : String(answer ?? ''),
          createdAt: new Date().toISOString(),
        })),
      };

      const res = await saveassessmentresponse(payload as any);

      if (res.success) {
        showToast.success(t('success'), res.message);
        router.replace('/(bottomtab)/health');
      } else {
        showToast.error(t('oops'), res.message || t('somethingwentwrong'));
      }
    } catch (err: any) {
      showToast.error(t('oops'), err.message || t('somethingwentwrong'));
    } finally {
      setLoading(false);
    }
  };

  const renderQuestion = (item: Question) => {
    const { id, question, answerType, answerOptions, required } = item;
    const value = answers[id];

    return (
      <View key={id} style={styles.questionBlock}>
        <Text style={styles.questionText}>
          {question}
          {required && <Text style={{ color: '#ff6b6b' }}>*</Text>}
        </Text>

        {(answerType === 'Textfield' || answerType === 'Textarea') && (
          <TextInput
            style={[styles.textInput, answerType === 'Textarea' && styles.textarea]}
            placeholder={t('enterhere')}
            value={String(value ?? '')}
            onChangeText={text => updateAnswer(id, text)}
            multiline={answerType === 'Textarea'}
            numberOfLines={answerType === 'Textarea' ? 5 : 1}
          />
        )}

        {answerType === 'Radio' && (
          <View style={styles.optionsContainer}>
            {answerOptions.map(opt => (
              <TouchableOpacity
                key={String(opt)}
                style={styles.radioRow}
                onPress={() => updateAnswer(id, opt)}
              >
                <View style={[styles.radioCircle, value === opt && styles.radioSelected]}>
                  {value === opt && <View style={styles.radioDot} />}
                </View>
                <Text style={styles.optionText}>{String(opt)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {answerType === 'Checkbox' && (
          <View style={styles.optionsContainer}>
            {(answerOptions || []).map(opt => {
              const checked = (value || []).includes(opt);
              return (
                <TouchableOpacity
                  key={String(opt)}
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
                  <Text style={styles.optionText}>{String(opt)}</Text>
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
              value={value ?? 0}  // Changed from 5 to 0
              onValueChange={val => updateAnswer(id, val)}
              minimumTrackTintColor="#B0DB02"
              maximumTrackTintColor="#555"
              thumbTintColor="#fff"
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderText}>{t('veryunhappy')}</Text>
              <Text style={styles.sliderText}>{value ?? 0}</Text>
              <Text style={styles.sliderText}>{t('veryhappy')}</Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderSection = (section: SectionData) => (
    <View key={section.title}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
      </View>
      {section.data.map(renderQuestion)}
    </View>
  );

  return (
    <View style={styles.main}>
      <View style={styles.HeaderView}>
        <View style={styles.titleView}>
          {!isRequiredTest && (
            <TouchableOpacity
              onPress={() =>
                router.canGoBack() ? router.back() : router.replace('/home')
              }
            >
              <ChevronLeft size={24} color={Colors.primary} />
            </TouchableOpacity>
          )}
          <Text style={[styles.title, !isRequiredTest && { marginLeft: 10 }]}>
            {t('monthlyhappinessindex')}
          </Text>
        </View>
        <Text style={styles.description}>{t('happinessindexdescription')}</Text>
      </View>

     {isOnline ? <KeyboardAwareScrollView
        ref={scrollRef}
        enableOnAndroid={true}
        extraHeight={120}
        extraScrollHeight={120}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={styles.briefdescriptionView}>
          <Text style={styles.briefdescription}>{t('survey.intro')}{'\n'}</Text>
          <Text style={styles.briefdescription}>{t('survey.anonymous')}{'\n'}</Text>
          <Text style={styles.briefdescription}>{t('survey.impactful')}</Text>

          <Text style={styles.undertenminute}>{t('undertenminutes')}</Text>
          <Progress.Bar
            progress={calculateProgress}
            color="#84A402"
            height={7}
            unfilledColor="#E0E0E0"
            borderWidth={0}
            width={null}
            style={styles.progressbar}
          />
          <Text style={styles.progresspercentage}>
            {Math.round(calculateProgress * 100)}%
          </Text>
        </View>

        {sections.map(renderSection)}

        <View style={styles.footer}>
          <Text style={styles.disclaimerText}>{t('happinessindexdisclaimer')}</Text>
          <GlobalButton
            title={loading ? t('pleasewait') : t('submit')}
            loading={loading}
            disabled={calculateProgress < 1 || loading}
            onPress={handleSubmit}
            buttonStyle={[
              styles.submitButton,
              (calculateProgress < 1 || loading) && styles.disabledButton,
            ]}
            textStyle={styles.submitText}
          />
        </View>
      </KeyboardAwareScrollView> : <EmptyComponent text={t('nointernetconnection')}/>}

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
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  titleView: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 16, fontFamily: 'Poppins-Regular', color: '#262626' },
  description: { fontSize: 11, fontFamily: 'Poppins-Regular', color: '#262626', marginTop: 5 },

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

  sectionHeader: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#CCCCCC' },
  sectionTitle: { color: '#000', fontSize: 16, fontFamily: 'Poppins-SemiBold' },

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
  radioDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.lightGreen },

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
  sliderText: { fontSize: 13, color: '#fff', fontFamily: 'Poppins-Regular' },

  footer: { padding: 20, paddingBottom: 40 },
  disclaimerText: { fontStyle: 'italic', marginBottom: 20, fontSize: 14, color: '#000' },
  submitButton: { backgroundColor: 'white', borderRadius: 12, width: '100%' },
  disabledButton: { opacity: 0.5 },
  submitText: { color: Colors.darkGreen, fontFamily: 'Poppins-SemiBold' },
});