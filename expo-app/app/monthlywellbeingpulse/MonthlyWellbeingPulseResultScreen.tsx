import { ScrollView, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import GlobalHeader from '@/src/components/GlobalHeader';
import Colors from '@/src/utils/Colors';
import { ChevronLeft } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

const MonthlyWellbeingPulseResultScreen = () => {
    const { assessmentData } = useLocalSearchParams();
    const { t } = useTranslation();
    const router = useRouter();

    const parsedData = (() => {
        if (!assessmentData || typeof assessmentData !== 'string') return null;
        try {
            return JSON.parse(assessmentData);
        } catch (e) {
            console.error('Parse error:', e);
            return null;
        }
    })();

    const tmd = parsedData?.questionsAndAnswers?.[0]?.result || 0;

    const monthRaw = parsedData?.month || '';
    const formattedMonth = monthRaw
        ? (() => {
            const [month, year] = monthRaw.split('-');
            return new Date(`${year}-${month}-01`).toLocaleString('en-US', {
                month: 'short',
                year: 'numeric',
            });
        })()
        : '';

    const totalQuestions = parsedData?.questionsAndAnswers?.length || 0;
    const answeredQuestions = parsedData?.questionsAndAnswers?.filter(
        (q: any) => q.answer !== null && q.answer !== undefined
    ).length;

    const optionLabels = ['Not at all', 'A little', 'Moderately', 'Quite a bit', 'Extremely'];

    const classifyTMD = (tmdValue: number) => {
        if (!tmdValue || isNaN(tmdValue)) {
            return {
                mood: 'No Data',
                message:
                    "Calculated from your latest Monthly Wellbeing Pulse test results to help you spot patterns and manage stress better",
            };
        }

        tmdValue = Math.round(Number(tmdValue));
        if (tmdValue < 6) {
            return { mood: 'Stable Mood', message: 'Great job! Your mood is stable, keep up the positive vibes!' };
        } else if (tmdValue >= 6 && tmdValue < 21) {
            return { mood: 'Mild Mood Disturbance', message: 'You’re doing well, but there’s room to boost your mood even further.' };
        } else if (tmdValue >= 21 && tmdValue <= 35) {
            return {
                mood: 'Moderate Mood Disturbance',
                message: 'Your mood is showing some disturbance. Try stress-relief techniques to get back on track.',
            };
        } else {
            return {
                mood: 'High Mood Disturbance',
                message: 'It looks like you’re experiencing high stress. Consider connecting with a consultant for support.',
            };
        }
    };

    const getScoreColors = (score: number) => {
        if (score < 6) return { backgroundColor: '#A9DFBF', textColor: '#145A32' };
        if (score >= 6 && score < 21) return { backgroundColor: '#F9E79F', textColor: '#7D6608' };
        if (score >= 21 && score <= 35) return { backgroundColor: '#F5B7B1', textColor: '#78281F' };
        return { backgroundColor: '#E74C3C', textColor: '#fff' };
    };

    const { mood, message } = classifyTMD(tmd);
    const { backgroundColor, textColor } = getScoreColors(Number(tmd));

    return (
        <View style={styles.main}>
            <GlobalHeader
                title={`Result ${formattedMonth}`}
            />

            <ScrollView style={{ flex: 1 }}>
                <View style={styles.briefdescriptionView}>
                    <Text style={styles.briefdescription}>{t('monthlywellbeingdescription')}</Text>


                    <Text style={styles.monthlabel}>Month: {formattedMonth}</Text>
                    <Text style={styles.monthlabel}>Result: {tmd}</Text>

                    {/*                  
                    <Text style={styles.monthlabel}>
                        Completed: {answeredQuestions} / {totalQuestions}
                    </Text> */}


                    <View style={[styles.moodContainer, { backgroundColor }]}>
                        <Text style={[styles.moodText, { color: textColor }]}>{mood}</Text>
                    </View>

                    <Text style={styles.moodMessage}>{message}</Text>

                    <View style={{ marginTop: 20 }}>
                        {(() => {
                            const grouped: Record<string, any[]> = {};

                            parsedData?.questionsAndAnswers?.forEach((q: any) => {
                                const key = String(q?.section ?? '');
                                if (!grouped[key]) grouped[key] = [];
                                grouped[key].push(q);
                            });

                            return Object.keys(grouped).map((sectionName, sectionIndex) => (
                                <View key={sectionIndex} style={{ marginBottom: 20 }}>

                                    <Text style={styles.sectionTitle}>{sectionName}</Text>

                                    {grouped[sectionName].map((q: any, index: number) => {
                                        const selectedAnswer = Number(q.answer);

                                        return (
                                            <View key={q.questionId} style={styles.questionBlock}>
                                                <Text style={styles.questionText}>
                                                    {q.order}. {q.question}
                                                </Text>

                                                {q.answerOptions?.map((opt: number, i: number) => {
                                                    const isSelected = opt === selectedAnswer;

                                                    return (
                                                        <View key={i} style={styles.optionRow}>
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
                                        );
                                    })}
                                </View>
                            ));
                        })()}
                    </View>

                </View>
            </ScrollView>
        </View>
    );
};

export default MonthlyWellbeingPulseResultScreen;

const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: Colors.captainanimatedlayoutbg,
    },
    sectionTitle: {
        fontSize: 14,
        color: "#000",
        fontFamily: "Poppins-SemiBold",
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
        marginBottom: 10,
    },
    monthlabel: {
        lineHeight: 22,
        fontSize: 16,
        color: '#161616',
        fontFamily: 'WhyteInktrap-Medium',
        marginTop: 8,
    },
    moodContainer: {
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 5,
        marginVertical: 5,
        alignSelf: 'flex-start',
    },
    moodText: {
        fontSize: 14,
        fontFamily: "Poppins-SemiBold",
    },
    moodMessage: {
        marginTop: 6,
        fontSize: 14,
        color: '#5A5A5A',
        fontFamily: 'Poppins-Regular',
    },

    sectionLabel: {
        color: '#FFD700',
        fontSize: 13,
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
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 6,
    },
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
    radioInner: {
        height: 14,
        width: 14,
        borderRadius: 50,
    },
    optionText: {
        fontSize: 14,
        color: '#fff',
        fontFamily: 'Poppins-Regular',
    },
});
