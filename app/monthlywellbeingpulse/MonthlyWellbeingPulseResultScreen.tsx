import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import GlobalHeader from '@/src/components/GlobalHeader';
import Colors from '@/src/utils/Colors';
import { getassessmentresultdetails } from '@/src/apis/apiService';
import { showToast } from '@/src/components/GlobalToast';
import CommonLoader from '@/src/components/CommonLoader';


type Question = {
    questionId: string;
    question: string;
    answer: number;
    answerOptions: number[];
    section: string;
    order: number;
};


const formatMonth = (value?: string) => {
    if (!value) return '';
    const [mm, yyyy] = value.split('-');
    return new Date(Number(yyyy), Number(mm) - 1).toLocaleString('en-US', {
        month: 'short',
        year: 'numeric',
    });
};

const optionLabels = ['Not at all', 'A little', 'Moderately', 'Quite a bit', 'Extremely'];

const classifyTMD = (value: number) => {
    if (!value || isNaN(value)) {
        return {
            mood: 'No Data',
            message:
                'Calculated from your latest Monthly Wellbeing Pulse test results to help you spot patterns and manage stress better',
        };
    }

    if (value < 6) return { mood: 'Stable Mood', message: 'Great job! Your mood is stable, keep it up.' };
    if (value < 21) return { mood: 'Mild Mood Disturbance', message: 'You’re doing well, but there’s room to improve.' };
    if (value <= 35)
        return { mood: 'Moderate Mood Disturbance', message: 'Try stress-relief techniques to get back on track.' };

    return {
        mood: 'High Mood Disturbance',
        message: 'High stress detected. Consider connecting with a consultant.',
    };
};

const getScoreColors = (score: number) => {
    if (score < 6) return { backgroundColor: '#A9DFBF', textColor: '#145A32' };
    if (score < 21) return { backgroundColor: '#F9E79F', textColor: '#7D6608' };
    if (score <= 35) return { backgroundColor: '#F5B7B1', textColor: '#78281F' };
    return { backgroundColor: '#E74C3C', textColor: '#fff' };
};


const MonthlyWellbeingPulseResultScreen = () => {
    const { t } = useTranslation();
    const { month, assessmentType } = useLocalSearchParams<{
        month: string;
        assessmentType: string;
    }>();

    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [tmd, setTmd] = useState<number>(0);

    const formattedMonth = useMemo(() => formatMonth(month), [month]);


    const fetchResult = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getassessmentresultdetails({ month, assessmentType });

            if (res?.status === 200 && Array.isArray(res?.data)) {
                const apiData = res.data;

                setTmd(Number(apiData[0]?.result ?? 0));

                const formatted = apiData.map((item: any) => ({
                    questionId: item.questionId,
                    question: item.questionDetail?.question,
                    answer: Number(item.answer),
                    answerOptions: item.questionDetail?.answerOptions ?? [],
                    section: item.questionDetail?.section ?? '',
                    order: Number(item.questionDetail?.order),
                }));

                setQuestions(formatted);
            } else {
                showToast.error(t('oops'), res?.message);
            }
        } catch {
            showToast.error(t('oops'), t('somethingwentwrong'));
        } finally {
            setLoading(false);
        }
    }, [month, assessmentType, t]);

    useEffect(() => {
        fetchResult();
    }, [fetchResult]);


    const groupedQuestions = useMemo(() => {
        return questions.reduce<Record<string, Question[]>>((acc, q) => {
            if (!acc[q.section]) acc[q.section] = [];
            acc[q.section].push(q);
            return acc;
        }, {});
    }, [questions]);

    const { mood, message } = classifyTMD(tmd);
    const { backgroundColor, textColor } = getScoreColors(tmd);

    return (
        <View style={styles.main}>
            <GlobalHeader title={`${t('result')} ${formattedMonth}`} />

            {loading ? <View style={styles.loaderView}><CommonLoader fullScreen /></View> : <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.briefdescriptionView}>
                    <Text style={styles.briefdescription}>{t('monthlywellbeingdescription')}</Text>

                    <Text style={styles.monthlabel}>{t('month')} {formattedMonth}</Text>
                    <Text style={styles.monthlabel}>{t('result')} {tmd}</Text>

                    <View style={[styles.moodContainer, { backgroundColor }]}>
                        <Text style={[styles.moodText, { color: textColor }]}>{mood}</Text>
                    </View>

                    <Text style={styles.moodMessage}>{message}</Text>

                    {Object.keys(groupedQuestions).map((section) => (
                        <View key={section} style={{ marginTop: 20 }}>
                            <Text style={styles.sectionTitle}>{section}</Text>

                            {groupedQuestions[section].map((q) => (
                                <View key={q.questionId} style={styles.questionBlock}>
                                    <Text style={styles.questionText}>
                                        {q.order}. {q.question}
                                    </Text>

                                    {q.answerOptions.map((opt) => {
                                        const isSelected = opt === q.answer;
                                        return (
                                            <View key={opt} style={styles.optionRow}>
                                                <View
                                                    style={[
                                                        styles.radioOuter,
                                                        isSelected && { borderColor: Colors.lightGreen },
                                                    ]}
                                                >
                                                    {isSelected && (
                                                        <View
                                                            style={[
                                                                styles.radioInner,
                                                                { backgroundColor: Colors.lightGreen },
                                                            ]}
                                                        />
                                                    )}
                                                </View>

                                                <Text
                                                    style={[
                                                        styles.optionText,
                                                        isSelected && { fontFamily: 'Poppins-SemiBold' },
                                                    ]}
                                                >
                                                    {optionLabels[opt]}
                                                </Text>
                                            </View>
                                        );
                                    })}
                                </View>
                            ))}
                        </View>
                    ))}
                </View>
            </ScrollView>}

        </View>
    );
};

export default MonthlyWellbeingPulseResultScreen;

/* -------------------- Styles -------------------- */

const styles = StyleSheet.create({
    main: { flex: 1, backgroundColor: Colors.captainanimatedlayoutbg },

    briefdescriptionView: { paddingHorizontal: 16, paddingVertical: 24 },

    briefdescription: {
        color: '#000',
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        lineHeight: 22,
        marginBottom: 10,
    },

    monthlabel: {
        fontSize: 16,
        color: '#161616',
        fontFamily: 'WhyteInktrap-Medium',
        marginTop: 8,
    },

    moodContainer: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 5,
        marginTop: 8,
        alignSelf: 'flex-start',
    },
    loaderView: {
        flex: 1, justifyContent: 'center', alignItems: 'center'
    },

    moodText: { fontSize: 14, fontFamily: 'Poppins-SemiBold' },

    moodMessage: {
        marginTop: 6,
        fontSize: 14,
        color: '#5A5A5A',
        fontFamily: 'Poppins-Regular',
    },

    sectionTitle: {
        fontSize: 14,
        color: '#000',
        fontFamily: 'Poppins-SemiBold',
        marginBottom: 6,
    },

    questionBlock: {
        backgroundColor: 'rgba(0,0,0,0.4)',
        padding: 16,
        borderRadius: 12,
        marginVertical: 8,
    },

    questionText: {
        fontSize: 15,
        color: '#fff',
        fontFamily: 'Poppins-Medium',
        marginBottom: 10,
    },

    optionRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },

    radioOuter: {
        height: 20,
        width: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#999',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },

    radioInner: { height: 14, width: 14, borderRadius: 7 },

    optionText: { fontSize: 14, color: '#fff', fontFamily: 'Poppins-Regular' },
});
