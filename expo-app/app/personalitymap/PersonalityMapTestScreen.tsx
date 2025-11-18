import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import Colors from '@/src/utils/Colors';
import * as Progress from 'react-native-progress';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react-native';
import { getallassessments, saveassessmentresponse } from '@/src/apis/apiService';
import { showToast } from '@/src/components/GlobalToast';
import GlobalButton from '@/src/components/GlobalButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PersonalityMapResultModal from '@/src/components/PersonalityMapResultModal';

type AnswerOption = { option: string; score: number };
type Question = {
  id: string;
  question: string;
  answerOptions: AnswerOption[];
  answerType: 'plus' | 'minus';
  order: string;
};

const PAGE_SIZE = 10;

const PersonalityMapTestScreen = () => {
  const { t } = useTranslation();
  const flatListRef = useRef<FlatList>(null);

  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [displayedQuestions, setDisplayedQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showResultPopup, setshowResultPopup] = useState(false);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getallassessments({ questionType: 'PERSONALITY' });
      if (res.success && res.status === 200) {
        const raw: Question[] = (res.data ?? []).map((q: any) => ({
          id: q.id,
          question: q.question,
          answerOptions: q.answerOptions,
          answerType: q.answerType,
          order: q.order,
        }));

        const sorted = raw.sort((a: Question, b: Question) => +a.order - +b.order);
        const unique = Array.from(new Map(sorted.map(q => [q.id, q])).values()) as Question[];

        setAllQuestions(unique);
        setDisplayedQuestions(unique.slice(0, PAGE_SIZE));
      } else {
        showToast.error(t('oops'), res.message);
      }
    } catch (err: any) {
      showToast.error(t('oops'), err.message || t('somethingwentwrong'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const loadMoreQuestions = () => {
    if (loadingMore || displayedQuestions.length >= allQuestions.length) return;
    setLoadingMore(true);
    setTimeout(() => {
      const nextStart = displayedQuestions.length;
      const nextEnd = Math.min(nextStart + PAGE_SIZE, allQuestions.length);
      const more = allQuestions.slice(nextStart, nextEnd);
      setDisplayedQuestions(prev => [...prev, ...more]);
      setLoadingMore(false);
    }, 500);
  };

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = allQuestions.length;
  const progress = totalQuestions > 0 ? answeredCount / totalQuestions : 0;
  const isComplete = answeredCount === totalQuestions;

  const handleSelect = (questionId: string, score: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: score }));
  };

  const scrollToFirstUnanswered = () => {
    const idx = displayedQuestions.findIndex(q => !answers[q.id]);
    if (idx !== -1) {
      flatListRef.current?.scrollToIndex({ index: idx, animated: true, viewPosition: 0.5 });
      showToast.error('Incomplete', 'Please answer all questions');
    }
  };

  const handleNextPress = async () => {
    if (!isComplete) {
      scrollToFirstUnanswered();
      return;
    }

    if (submitting) return;
    setSubmitting(true);

    try {
      const payload = {
        questionType: 'PERSONALITY',
        month: new Date().toISOString().slice(0, 7), // YYYY-MM
        answers: Object.entries(answers).map(([questionId, answer]) => ({
          questionId,
          answer,                     // number (1-5)
          createdAt: new Date().toISOString(),
        })),
      };

      const res = await saveassessmentresponse(payload);

      if (res.success && res.status === 200) {
        showToast.success(t('success'), res.message);

        // Mark test as completed locally
        try {
          const user = JSON.parse((await AsyncStorage.getItem('userDetails')) || '{}');
          user.isPersonalityTestCompleted = true;
          await AsyncStorage.setItem('userDetails', JSON.stringify(user));
        } catch (_) { }
        setshowResultPopup(true);

      } else {
        showToast.error('Error', res.message || 'Submission failed');
      }
    } catch (err: any) {
      showToast.error('Error', err.message || 'Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = ({ item }: { item: Question }) => {
    const selectedScore = answers[item.id];

    return (
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>
          {displayedQuestions.indexOf(item) + 1}. {item.question}
        </Text>

        <View style={styles.radioRow}>
          {item.answerOptions.map((opt, idx) => {
            const isSelected = selectedScore === opt.score;
            const showLabel = idx === 0 || idx === item.answerOptions.length - 1;

            return (
              <Pressable
                key={opt.score}
                onPress={() => handleSelect(item.id, opt.score)}
                style={styles.optionContainer}
              >
                <View style={[styles.radioOuter, isSelected && styles.radioOuterActive]}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
                {showLabel && <Text style={styles.radioLabelText}>{opt.option}</Text>}
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  };

  const renderFooter = () => {
    const allLoaded = displayedQuestions.length >= allQuestions.length;

    return (
      <View style={styles.footerContainer}>
        {loadingMore && <ActivityIndicator size="small" color="#84A402" style={{ marginVertical: 20 }} />}
        {allLoaded && (
          <>
            <Text style={styles.confidentialityText}>{t('happinessindexdisclaimer')}</Text>
            <GlobalButton
              onPress={handleNextPress}
              title={submitting ? 'Submitting...' : t('common.next')}
              buttonStyle={styles.nextButton}
              disabled={submitting}
            />
          </>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.main}>
        <ActivityIndicator size="large" color="#84A402" />
      </View>
    );
  }

  if (allQuestions.length === 0) {
    return (
      <View style={styles.main}>
        <Text style={styles.noQuestionsText}>{t('noquestionsavailable')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.main}>
      <PersonalityMapResultModal visible={showResultPopup} setModalVisible={setshowResultPopup} />

      <View style={styles.header}>

        <View style={styles.innerView}>

          <Text style={styles.personalitymaptext}>{t('personalitymap')}</Text>
          <View style={styles.skipView}>
            <Text style={styles.skip}>{t('skip')}</Text>
            <ChevronRight size={20} color={Colors.textSecondary} />
          </View>
        </View>

        <Text style={styles.personalitymapdesc}>{t('personalitymapdesc')}</Text>

        <Progress.Bar
          progress={progress}
          color="#84A402"
          height={7}
          unfilledColor={Colors.iconColor}
          borderWidth={0}
          width={null}
          style={styles.progressbar}
        />

        <Text style={styles.progresspercentage}>
          {Math.round(progress * 100)}% {t('completedquestions')} ({answeredCount}/{totalQuestions})
        </Text>
        <Text style={styles.mandatoryText}>{t('mandatorydesc')}</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={displayedQuestions}
        renderItem={renderQuestion}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMoreQuestions}
        onEndReachedThreshold={0.3}
        ListFooterComponent={renderFooter}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
};

export default PersonalityMapTestScreen;

const styles = StyleSheet.create({
  main: { flex: 1, backgroundColor: Colors.captainanimatedlayoutbg },
  header: { margin: 16, gap: 10, paddingBottom: 10 },
  innerView: { flexDirection: 'row', justifyContent: 'space-between' },
  personalitymaptext: { fontSize: 20, lineHeight: 22, color: '#161616', fontFamily: 'WhyteInktrap-Bold' },
  personalitymapdesc: { fontFamily: 'Poppins-Regular', fontSize: 12, color: 'black' },
  skip: { fontSize: 14, color: Colors.textSecondary, fontFamily: 'Poppins-Regular' },
  skipView: { flexDirection: 'row', gap: 2, alignItems: 'center' },
  progressbar: { marginTop: 10 },
  progresspercentage: { marginTop: 5, textAlign: 'right', color: '#161616', fontSize: 14, fontFamily: 'Poppins-Regular' },
  mandatoryText: { fontFamily: 'Poppins-Regular', fontSize: 12, color: '#808080' },
  nextButton: { marginTop: 30, width: '100%' },
  questionContainer: { marginHorizontal: 12, marginVertical: 5, borderRadius: 10, backgroundColor: 'rgba(0, 0, 0, 0.6)', padding: 16 },
  questionText: { fontSize: 16, lineHeight: 22, color: '#fff', fontFamily: 'WhyteInktrap-Bold', marginBottom: 16 },
  radioRow: { flexDirection: 'row', justifyContent: 'space-between' },
  optionContainer: { alignItems: 'center', flex: 1 },
  radioOuter: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: '#888', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  radioOuterActive: { borderColor: '#84A402' },
  radioInner: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#84A402' },
  radioLabelText: { fontSize: 11, color: '#fff', fontFamily: 'Poppins-Regular', textAlign: 'center' },
  footerContainer: { paddingHorizontal: 20, paddingTop: 30, paddingBottom: 40, alignItems: 'center' },
  confidentialityText: { fontSize: 13, color: 'black', lineHeight: 20, fontFamily: 'Poppins-Regular' },
  noQuestionsText: { color: '#fff', textAlign: 'center', marginTop: 50, fontSize: 16 },
});