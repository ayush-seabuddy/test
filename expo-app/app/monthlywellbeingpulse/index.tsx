import { getallassessments, saveassessmentresponse } from '@/src/apis/apiService';
import CommonLoader from '@/src/components/CommonLoader';
import GlobalButton from '@/src/components/GlobalButton';
import { showToast } from '@/src/components/GlobalToast';
import Colors from '@/src/utils/Colors';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, TriangleAlert } from 'lucide-react-native';
import moment from 'moment';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    BackHandler,
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { ProgressBar } from 'react-native-paper';

const { height } = Dimensions.get('window');

type Question = {
    id: string;
    question: string;
    section: string;
    order: string;
};

const optionLabels = ['Not at all', 'A little', 'Moderately', 'Quite a bit', 'Extremely'];

const MonthlyWellbeingPulseTestScreen = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const params = useLocalSearchParams<{ showPopup?: string; testData?: string }>();

    const [questions, setQuestions] = useState<Question[]>([]);
    const [responses, setResponses] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const parsedTestData = useMemo(() => {
        if (!params.testData) return null;
        try {
            return JSON.parse(params.testData);
        } catch {
            return null;
        }
    }, [params.testData]);

    const isRequiredTest = parsedTestData?.isRequires === true;
    const shouldShowPopup = params.showPopup === 'true';

    const [resultModal, setResultModal] = useState({
        visible: false,
        mood: '',
        message: '',
        score: 0,
    });

    const [showReminderPopup, setShowReminderPopup] = useState(shouldShowPopup);

    const previousMonth = moment().subtract(1, 'month');
    const previousMonthName = previousMonth.format('MMMM');
    const previousMonthKey = previousMonth.format('MMM YYYY');

    const fetchQuestions = useCallback(async () => {
        try {
            setLoading(true);
            const res = await getallassessments({ questionType: 'POMS' });
            if (res.success && res.status === 200) {
                setQuestions(res.data || []);
            } else {
                showToast.error(t('oops'), res.message || t('somethingwentwrong'));
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

    useFocusEffect(
        useCallback(() => {
            if (isRequiredTest) {
                return;
            }

            const onBackPress = () => {
                router.back();
                return true;
            };

            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => subscription.remove();
        }, [isRequiredTest, router])
    );

    const updateAnswer = useCallback((questionId: string, value: number) => {
        setResponses(prev => ({ ...prev, [questionId]: value }));
    }, []);

    const total = questions.length;
    const answered = Object.keys(responses).length;
    const progress = total > 0 ? answered / total : 0;
    const progressPercentage = Math.round(progress * 100);
    const isComplete = answered === total;

    const sections = useMemo(() => {
        const map = new Map<string, Question[]>();
        questions.forEach(q => {
            const key = q.section;
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(q);
        });
        return Array.from(map, ([title, data]) => ({ title, data }));
    }, [questions]);

    const classifyTMD = (tmd: number): { mood: string; message: string } => {
        if (tmd < 6) return { mood: t('mood_stable'), message: t('mood_stable_message') };
        if (tmd < 21) return { mood: t('mood_mild'), message: t('mood_mild_message') };
        if (tmd <= 35) return { mood: t('mood_moderate'), message: t('mood_moderate_message') };
        return { mood: t('mood_high'), message: t('mood_high_message') };
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const payload = {
                questionType: 'POMS',
                month: previousMonth.format('MM-YYYY'),
                answers: Object.entries(responses).map(([questionId, answer]) => ({
                    questionId,
                    answer,
                    createdAt: new Date().toISOString(),
                })),
            };

            const res = await saveassessmentresponse(payload);

            if (res.success && res.status === 200) {
                const score = Math.round(res.data);
                const { mood, message } = classifyTMD(score);

                setResultModal({
                    visible: true,
                    mood,
                    message,
                    score,
                });
            } else {
                showToast.error(t('oops'), res.message);
            }
        } catch (err: any) {
            showToast.error(t('oops'), err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleResultOk = () => {
        setResultModal(prev => ({ ...prev, visible: false }));
        router.replace('/home');
    }

    return (
        <View style={styles.main}>
            <View style={styles.headerStyle}>
                {!isRequiredTest && (
                    <TouchableOpacity
                        onPress={() =>
                            router.canGoBack() ? router.back() : router.replace('/home')
                        }
                        style={styles.backButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <ChevronLeft size={20} color="#000" />
                    </TouchableOpacity>
                )}
                <Text style={styles.titleStyle} numberOfLines={1}>
                    {t('monthlywellbeingpulse')}
                </Text>
                <View style={{ width: 40 }} />
            </View>
            {loading ? (
                <View style={styles.loaderWrapper}>
                    <CommonLoader fullScreen />
                </View>
            ) : (
                <>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={styles.topContainer}>
                            <Text style={styles.descriptionText}>{t('monthlywellbeingdescription')}</Text>
                            <Text style={styles.under2minText}>{t('undertwominutes')}</Text>

                            <ProgressBar progress={progress} color="#84A402" style={styles.progressBar} />
                            <View style={styles.progressLabelContainer}>
                                <Text style={styles.progressLabelText}>{progressPercentage}%</Text>
                            </View>

                            <Text style={styles.monthText}>{previousMonthKey}</Text>
                        </View>

                        <View style={styles.darkSection}>
                            <View style={styles.dragHandle} />
                            <View style={styles.counterContainer}>
                                <Text style={styles.counterText}>{answered}/{total}</Text>
                            </View>

                            {sections.map((section, idx) => (
                                <View key={idx} style={styles.sectionWrapper}>
                                    <Text style={styles.sectionTitle}>{section.title}</Text>
                                    {section.data.map(q => {
                                        const selected = responses[q.id];
                                        return (
                                            <View key={q.id} style={styles.questionCard}>
                                                <Text style={styles.questionText}>{q.order}. {q.question}</Text>
                                                <View style={styles.optionsContainer}>
                                                    {optionLabels.map((label, i) => (
                                                        <TouchableOpacity
                                                            key={i}
                                                            style={styles.radioRow}
                                                            onPress={() => updateAnswer(q.id, i)}
                                                            activeOpacity={0.7}
                                                        >
                                                            <View style={[styles.radioCircle, selected === i && styles.radioCircleSelected]}>
                                                                {selected === i && <View style={styles.radioDot} />}
                                                            </View>
                                                            <Text style={styles.optionLabel}>{label}</Text>
                                                        </TouchableOpacity>
                                                    ))}
                                                </View>
                                            </View>
                                        );
                                    })}
                                </View>
                            ))}

                            <View style={styles.footer}>
                                <Text style={styles.disclaimerText}>{t('happinessindexdisclaimer')}</Text>
                                <GlobalButton
                                    title={submitting ? t('submitting') : t('submit')}
                                    onPress={handleSubmit}
                                    style={[styles.submitButton, (!isComplete || submitting) && styles.submitButtonDisabled]}
                                    textStyle={isComplete && !submitting ? styles.submitButtonTextActive : undefined}
                                    disabled={!isComplete || submitting}
                                />
                            </View>
                        </View>
                    </ScrollView>
                </>
            )}


            <Modal visible={resultModal.visible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.scoreBadge}>
                            <Text style={styles.scoreText}>{t('score')}: {resultModal.score}</Text>
                            <Text style={styles.moodText}>{resultModal.mood}</Text>
                        </View>
                        <Text style={styles.modalMessage}>{resultModal.message}</Text>
                        <GlobalButton
                            title={t('ok')}
                            onPress={handleResultOk}
                            style={styles.modalOkButton}
                            textStyle={styles.modalOkText}
                        />
                    </View>
                </View>
            </Modal>

            <Modal visible={showReminderPopup} transparent animationType="fade">
                <View style={styles.reminderOverlay}>
                    <View style={styles.reminderModal}>
                        <View style={styles.warningIcon}>
                            <TriangleAlert size={40} color="#d4a017" />
                        </View>
                        <Text style={styles.reminderTitle}>
                            {t('reminder_title', { month: previousMonthName })}
                        </Text>
                        <Text style={styles.reminderSubtitle}>{t('undertwominutes')}</Text>
                        <Text style={styles.reminderMessage}>{t('reminder_message')}</Text>
                        <GlobalButton
                            title={t('start_checkin')}
                            onPress={() => setShowReminderPopup(false)}
                            style={styles.reminderButton}
                            textStyle={styles.reminderButtonText}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default MonthlyWellbeingPulseTestScreen;

const styles = StyleSheet.create({
    main: { flex: 1, backgroundColor: Colors.captainanimatedlayoutbg },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.captainanimatedlayoutbg },
    loadingText: { fontSize: 16, color: '#000', fontFamily: 'Poppins-Regular' },
    loaderWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.captainanimatedlayoutbg },
    headerStyle: {
        height: 50,
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 13,
        borderBottomWidth: 1,
        borderBottomColor: '#ededed',
    },
    backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
    titleStyle: { fontSize: 15, fontFamily: 'Poppins-SemiBold', color: Colors.textPrimary || '#000' },
    topContainer: { padding: 16 },
    descriptionText: { color: '#000', fontSize: 14, fontFamily: 'Poppins-Regular' },
    under2minText: { color: '#000', fontSize: 14, textAlign: 'right', marginTop: 10, fontFamily: 'Poppins-Regular' },
    progressBar: { marginVertical: 10, borderRadius: 6, height: 9, backgroundColor: '#E0E0E0' },
    progressLabelContainer: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 5 },
    progressLabelText: { color: '#161616', fontSize: 14, fontFamily: 'Poppins-Regular' },
    monthText: { marginTop: 10, fontSize: 14, color: '#161616', fontFamily: 'Poppins-SemiBold', lineHeight: 22 },
    darkSection: { backgroundColor: '#00000066', borderTopLeftRadius: 25, borderTopRightRadius: 25, minHeight: height * 0.8 },
    dragHandle: { height: 3, width: 100, backgroundColor: '#FFFFFF66', alignSelf: 'center', borderRadius: 2, marginVertical: 4 },
    counterContainer: { paddingHorizontal: 20, marginBottom: 10 },
    counterText: { color: '#fff', textAlign: 'right', fontSize: 15, fontFamily: 'WhyteInktrap-Medium',lineHeight:20 },
    sectionWrapper: { marginTop: 10 },
    sectionTitle: { color: '#fff', fontSize: 16, fontFamily: 'Poppins-SemiBold', paddingHorizontal: 20, marginBottom: 12 },
    questionCard: { backgroundColor: 'rgba(0,0,0,0.4)', marginHorizontal: 16, marginBottom: 16, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 20 },
    questionText: { color: '#fff', fontSize: 16, fontFamily: 'WhyteInktrap-Bold', lineHeight: 24 },
    optionsContainer: { marginTop: 16 },
    radioRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
    radioCircle: { height: 22, width: 22, borderRadius: 11, borderWidth: 2, borderColor: '#fff', backgroundColor: 'transparent', marginRight: 12 },
    radioCircleSelected: { borderColor: Colors.lightGreen, alignItems: 'center', justifyContent: 'center' },
    radioDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.lightGreen },
    optionLabel: { color: '#fff', fontSize: 14, fontFamily: 'Poppins-Regular' },
    footer: { paddingHorizontal: 20, marginBottom: 40 },
    disclaimerText: { fontFamily: 'Poppins-Regular', fontSize: 14, fontStyle: 'italic', color: '#000', marginBottom: 20 },
    submitButton: { backgroundColor: '#fff', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
    submitButtonDisabled: { backgroundColor: '#666' },
    submitButtonTextActive: { color: 'black' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContent: {
        backgroundColor: '#fff',
        padding: 30,
        borderRadius: 20,
        width: '100%',
        maxWidth: 380,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    scoreBadge: { backgroundColor: '#fff7d1', paddingVertical: 16, paddingHorizontal: 24, borderRadius: 50, marginBottom: 20 },
    scoreText: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: '#000', textAlign: 'center' },
    moodText: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: 'black', textAlign: 'center', lineHeight: 22 },
    modalMessage: { fontSize: 15, fontFamily: 'Poppins-Regular', color: '#555', marginBottom: 25, textAlign: 'center', lineHeight: 22 },
    modalOkButton: { backgroundColor: '#000', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 12, width: '100%', justifyContent: 'center', alignItems: 'center' },
    modalOkText: { color: '#fff', fontFamily: 'Poppins-SemiBold', fontSize: 16 },
    reminderOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    reminderModal: {
        backgroundColor: '#fff',
        padding: 30,
        borderRadius: 25,
        width: '100%',
        maxWidth: 380,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    warningIcon: { backgroundColor: '#fff7d1', borderRadius: 50, padding: 15, marginBottom: 20 },
    reminderTitle: { fontSize: 18, fontFamily: 'Poppins-SemiBold', color: '#333', textAlign: 'center', marginBottom: 10 },
    reminderSubtitle: { fontSize: 14, fontFamily: 'Poppins-Medium', color: '#777', marginBottom: 15 },
    reminderMessage: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#555', textAlign: 'center', lineHeight: 22, marginBottom: 30 },
    reminderButton: { backgroundColor: '#000', paddingVertical: 14, paddingHorizontal: 40, borderRadius: 15, width: '100%' },
    reminderButtonText: { color: '#fff', fontSize: 16, fontFamily: 'Poppins-SemiBold', textAlign: 'center' },
});