import React, { useCallback, useEffect, useState } from 'react';
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ArrowUpRight, ChevronDown, ChevronUp, TriangleAlert } from 'lucide-react-native';
import { t } from 'i18next';

import {
  getallassessmentsResult,
  viewProfile,
  viewUserTest,
} from '@/src/apis/apiService';
import { showToast } from '@/src/components/GlobalToast';
import { UserDetails } from '@/src/types/userTypes';
import Colors from '@/src/utils/Colors';
import { ImagesAssets } from '@/src/utils/ImageAssets';
import PersonalityTestCard from './PersonalityTestCard';
import i18n from '@/src/localization/i18n';

const { height } = Dimensions.get('window');
const isProMax = height >= 926;

type TestItem = {
  open: boolean;
  testName: string;
};

const AssessmentList = ({ isProfileScreen = false }: { isProfileScreen?: boolean }) => {
  const [listOpen, setListOpen] = useState(false);
  const [profileDetails, setProfileDetails] = useState<UserDetails | null>(null);
  const [testArray, setTestArray] = useState<TestItem[]>([]);
  const [isPersonalityTestCompleted, setIsPersonalityTestCompleted] = useState<boolean | null>(null);
  const [apiData, setApiData] = useState<any>(null);

  useEffect(() => {
    viewProfile().then(res => {
      if (res?.data) setProfileDetails(res.data);
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      viewUserTest().then(res => {
        if (res?.data) setTestArray(res.data);
      });
    }, [])
  );

  useEffect(() => {
    AsyncStorage.getItem('userDetails').then(data => {
      if (data) {
        const parsed = JSON.parse(data);
        setIsPersonalityTestCompleted(parsed?.isPersonalityTestCompleted ?? false);
      }
    });
  }, []);

  useEffect(() => {
    getallassessmentsResult({ questionType: 'PERSONALITY' })
      .then(res => {
        if (res?.success) {
          setApiData(res.data.data);
        } else {
          showToast.error(t('oops'), res.message);
        }
      })
      .catch(() =>
        showToast.error(t('oops'), t('somethingwentwrong'))
      );
  }, []);

  const currentMonth = new Date().toLocaleString('en', { month: 'long' });
  const lastDay = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const isChinese = i18n.language.startsWith('zh');

  const suffix =
    lastDay > 3 && lastDay < 21
      ? 'th'
      : ['st', 'nd', 'rd'][((lastDay % 10) - 1)] || 'th';

  const navigateAssessment = (index: number, openPath: string, closedPath: string, type: string) => {
    const path = testArray[index]?.open ? openPath : closedPath;
    router.push({
      pathname: path as any,
      params: { assessmentType: type },
    });
  };

  const hasPendingAssessment =
    testArray[0]?.open || testArray[1]?.open;

  return (
    <View>
      {!isProfileScreen && (
        <View style={styles.headerContainer}>
          <View style={styles.headerRow}>
            <View style={styles.titleRow}>
              <Text style={styles.sectionTitle}>{t('myassessments')}</Text>
              {hasPendingAssessment && <TriangleAlert size={18} color="red" />}
            </View>

            <Pressable onPress={() => setListOpen(!listOpen)}>
              {listOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </Pressable>
          </View>

          <Text style={styles.subText}>{t('myassessments_description')}</Text>

          <View style={styles.tagContainer}>
            <Text style={[styles.tagText, testArray[0]?.open && styles.openTag]}>
              {t('monthlyhappinessindex')}
            </Text>
            <Text style={[styles.tagText, testArray[1]?.open && styles.openTag]}>
              {t('monthlywellbeingpulse')}
            </Text>
          </View>
        </View>
      )}

      {(listOpen || isProfileScreen) && (
        <View style={styles.listContainer}>
          {isPersonalityTestCompleted !== null && (
            <View style={styles.cardSpacing}>
              <PersonalityTestCard
                data={isPersonalityTestCompleted}
                ApiData={apiData}
                testArray={testArray}
                screenName="HealthScreen"
              />
            </View>
          )}

          {/* Monthly Happiness */}
          <Pressable
            style={styles.assessmentCard}
            onPress={() =>
              navigateAssessment(
                0,
                '/monthlyhappinessindex',
                '/monthlyhappinessindex/AllAssessmentResultListing',
                'HAPPINESS'
              )
            }
          >
            <View style={styles.cardContent}>
              <Image source={ImagesAssets.Happiness} style={styles.cardImage} />

              <View style={styles.cardText}>
                <Text style={[styles.cardTitle, testArray[0]?.open && styles.activeTitle]}>
                  {t('monthlyhappinessindex')}
                </Text>
                <Text style={styles.cardDesc}>
                  {t('monthlyhappinessindex_description')}
                </Text>

                {testArray[0]?.open && (
                  <View style={styles.warningTag}>
                    <TriangleAlert size={14} color="#f45050" />
                    <Text style={styles.warningText}>
                      {t('submitbefore', { currentMonth })}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.arrowBox}>
                <ArrowUpRight size={18} />
              </View>
            </View>
          </Pressable>

          {/* Wellbeing Pulse */}
          <Pressable
            style={styles.assessmentCard}
            onPress={() =>
              navigateAssessment(
                1,
                '/monthlywellbeingpulse',
                '/monthlyhappinessindex/AllAssessmentResultListing',
                'POMS'
              )
            }
          >
            <View style={styles.cardContent}>
              <Image source={ImagesAssets.POMS} style={styles.cardImage} />

              <View style={styles.cardText}>
                <Text style={[styles.cardTitle, testArray[1]?.open && styles.activeTitle]}>
                  {t('monthlywellbeingpulse')}
                </Text>
                <Text style={styles.cardDesc}>
                  {t('monthlywellbeingpulse_description')}
                </Text>

                {testArray[1]?.open && (
                  <View style={styles.warningTag}>
                    <TriangleAlert size={14} color="#f45050" />
                    <Text style={styles.warningText}>
                      {t('submitBeforeDate', {
                        month: currentMonth,
                        day: lastDay,
                        suffix: isChinese ? '' : suffix,
                      })}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.arrowBox}>
                <ArrowUpRight size={18} />
              </View>
            </View>
          </Pressable>
        </View>
      )}
    </View>
  );
};

export default AssessmentList;


const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: 'rgba(180,180,180,0.4)',
    margin: 10,
    padding: 20,
    borderRadius: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: isProMax ? 22 : 18,
    color: Colors.darkGreen,
    fontFamily: 'WhyteInktrap-Medium',
  },
  subText: {
    fontSize: 10,
    lineHeight: 18,
    marginVertical: 6,
    color: '#333',
    fontFamily: 'Poppins-Regular',
  },
  tagContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  tagText: {
    fontSize: 10,
    color: '#333',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 5,
    fontFamily: 'Poppins-Regular',
  },
  openTag: {
    color: 'red',
  },
  listContainer: {
    paddingHorizontal: 10,
  },
  cardSpacing: {
    marginBottom: 10,
  },
  assessmentCard: {
    backgroundColor: 'rgba(180,180,180,0.4)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  cardImage: {
    width: 70,
    height: 70,
    borderRadius: 25,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 12,
    color: 'grey',
    fontFamily: 'Poppins-SemiBold',
  },
  activeTitle: {
    color: '#06361f',
  },
  cardDesc: {
    fontSize: 10,
    color: '#444',
    fontFamily: 'Poppins-Regular',
  },
  warningTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 6,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  warningText: {
    fontSize: 9,
    color: '#f45050',
    marginLeft: 6,
    fontFamily: 'Poppins-Regular',
  },
  arrowBox: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 8,
  },
});
