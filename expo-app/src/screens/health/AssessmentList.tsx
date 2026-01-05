import { getallassessmentsResult, viewProfile, viewUserTest } from '@/src/apis/apiService';
import { showToast } from '@/src/components/GlobalToast';
import { AppDispatch } from '@/src/redux/store';
import { UserDetails } from '@/src/types/userTypes';
import Colors from '@/src/utils/Colors';
import { ImagesAssets } from '@/src/utils/ImageAssets';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { t } from 'i18next';
import { ArrowUpRight, ChevronDown, ChevronUp, TriangleAlert } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch } from 'react-redux';
import PersonalityTestCard from './PersonalityTestCard';

const { height } = Dimensions.get('window');
const isProMax = height >= 926;

type TestItem = {
  isRequires: boolean;
  isSplash: boolean;
  open: boolean;
  testName: string;
};

const AssessmentList = ({ isProfileScreen = false }: { isProfileScreen?: boolean }) => {
  const dispatch = useDispatch<AppDispatch>();

  const [listOpen, setListOpen] = useState(true);
  const [profileDetails, setProfileDetails] = useState<UserDetails | null>(null);
  const [testArray, setTestArray] = useState<TestItem[]>([]);
  const [isPersonalityTestCompleted, setIsPersonalityTestCompleted] = useState<boolean | null>(null);
  const [apiData, setApiData] = useState<any>(null);

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      const result = await viewProfile();
      if (result?.data) {
        setProfileDetails(result.data);
      }
    };
    fetchProfile();
  }, []);

  // Fetch user tests
  useEffect(() => {
    const fetchUserTests = async () => {
      const result = await viewUserTest();
      if (result?.data) {
        setTestArray(result.data);
      }
    };
    fetchUserTests();
  }, []);

  // Fetch personality test completion status from AsyncStorage
  useEffect(() => {
    const getUserDetails = async () => {
      try {
        const userData = await AsyncStorage.getItem('userDetails');
        if (userData) {
          const parsed = JSON.parse(userData);
          setIsPersonalityTestCompleted(parsed.isPersonalityTestCompleted ?? false);
        }
      } catch (error) {
        console.error('Error reading userDetails:', error);
      }
    };
    getUserDetails();
  }, []);

  // Fetch personality assessment questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await getallassessmentsResult({ questionType: 'PERSONALITY' });
        if (res.success && res.status === 200) {
          setApiData(res.data.data);
        } else {
          showToast.error(t('oops'), res.message);
        }
      } catch (err: any) {
        showToast.error(t('oops'), err.message || t('somethingwentwrong'));
      }
    };
    fetchQuestions();
  }, [t]);



  const currentMonth = new Date().toLocaleString('en', { month: 'long' });
  const lastDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const ordinalSuffix =
    lastDayOfMonth > 3 && lastDayOfMonth < 21
      ? 'th'
      : lastDayOfMonth % 10 === 1
        ? 'st'
        : lastDayOfMonth % 10 === 2
          ? 'nd'
          : lastDayOfMonth % 10 === 3
            ? 'rd'
            : 'th';

  const handleHappinessPress = () => {
    const path = profileDetails?.isHappinessIndex
      ? '/monthlyhappinessindex'
      : '/monthlyhappinessindex/AllAssessmentResultListing';
    router.push({
      pathname: path,
      params: {
        assessmentType: "HAPPINESS"
      }
    });
  };

  const handlePOMSPress = () => {
    const path = profileDetails?.isPOMSAssessment
      ? '/monthlywellbeingpulse'
      : '/monthlyhappinessindex/AllAssessmentResultListing';
    router.push({
      pathname: path,
      params: {
        assessmentType: "POMS"
      }
    });
  };

  const hasPendingAssessment = profileDetails?.isPOMSAssessment || profileDetails?.isHappinessIndex;

  return (
    <View>
      {!isProfileScreen &&
        <View style={styles.headerContainer}>
          <View style={styles.headerRow}>
            <View style={styles.titleRow}>
              <Text style={styles.sectionTitle}>{t('myassessments')}</Text>
              {hasPendingAssessment &&
                <View style={{ marginBottom: 5 }}>
                  <TriangleAlert size={18} color="red" />
                </View>
              }
            </View>
            <TouchableOpacity onPress={() => setListOpen(!listOpen)}>
              {listOpen ? <ChevronUp size={20} color="black" /> : <ChevronDown size={20} color="black" />}
            </TouchableOpacity>
          </View>

          <Text style={styles.subText}>{t('myassessments_description')}</Text>

          <View style={styles.tagContainer}>
            <View style={styles.tag}>
              <Text style={[styles.tagText, testArray[0]?.open && styles.opentesttagText]}>{t('monthlyhappinessindex')}</Text>
            </View>
            <View style={styles.tag}>
              <Text style={[styles.tagText, testArray[1]?.open && styles.opentesttagText]}>{t('monthlywellbeingpulse')}</Text>
            </View>
          </View>
        </View>
      }

      {(listOpen || isProfileScreen) && (
        <View style={styles.listContainer}>
          {isPersonalityTestCompleted !== null && (
            <View style={styles.cardMargin}>
              <PersonalityTestCard
                data={isPersonalityTestCompleted}
                ApiData={apiData}
                testArray={testArray}
              />
            </View>
          )}

          <Pressable style={styles.assessmentCard} onPress={handleHappinessPress}>
            <View style={styles.cardContent}>
              <Image style={styles.cardImage} source={ImagesAssets.Happiness} />
              <View style={styles.cardTextContainer}>
                <Text style={[styles.cardTitle, testArray[0]?.open && styles.activeTitle]}>
                  {t('monthlyhappinessindex')}
                </Text>
                <Text style={styles.cardDescription}>{t('monthlyhappinessindex_description')}</Text>

                {testArray[0]?.open && (
                  <View style={styles.warningTag}>
                    <TriangleAlert size={15} color="#f45050" />
                    <Text style={styles.warningText}>
                      {t('submitbefore', { currentMonth })}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.arrowBox}>
                <ArrowUpRight size={18} color="black" />
              </View>
            </View>
          </Pressable>

          <Pressable style={[styles.assessmentCard, styles.cardMargin]} onPress={handlePOMSPress}>
            <View style={styles.cardContent}>
              <Image style={styles.cardImage} source={ImagesAssets.POMS} />
              <View style={styles.cardTextContainer}>
                <Text style={[styles.cardTitle, testArray[1]?.open && styles.activeTitle]}>
                  {t('monthlywellbeingpulse')}
                </Text>
                <Text style={styles.cardDescription}>{t('monthlywellbeingpulse_description')}</Text>

                {testArray[1]?.open && (
                  <View style={styles.warningTag}>
                    <TriangleAlert size={15} color="#f45050" strokeWidth={1.5} />
                    <Text style={styles.warningText}>
                      Submit before {currentMonth} {lastDayOfMonth}{ordinalSuffix}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.arrowBox}>
                <ArrowUpRight size={18} color="black" />
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
    backgroundColor: 'rgba(180, 180, 180, 0.4)',
    margin: 10,
    borderRadius: 10,
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: isProMax ? 22 : 18,
    fontWeight: '500',
    lineHeight: 25,
    color: Colors.darkGreen,
    fontFamily: 'WhyteInktrap-Medium',
  },
  subText: {
    fontSize: isProMax ? 12 : 10,
    lineHeight: 18,
    color: '#333333',
    fontFamily: 'Poppins-Regular',
    marginBottom: 10,
  },
  tagContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 5,
  },
  tagAlert: {
    backgroundColor: '#f5f5f5',
  },
  tagText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#333333',
    fontFamily: 'Poppins-Regular',
  },
  opentesttagText: {
    fontSize: 10,
    fontWeight: '500',
    color: 'red',
    fontFamily: 'Poppins-Regular',
  },
  listContainer: {
    paddingHorizontal: 14,
  },
  cardMargin: {
    marginBottom: 10,
    minHeight: 100
  },
  assessmentCard: {
    backgroundColor: 'rgba(180, 180, 180, 0.4)',
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
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: isProMax ? 14 : 12,
    fontWeight: '500',
    fontFamily: 'Poppins-SemiBold',
    color: 'grey',
  },
  activeTitle: {
    color: '#06361f',
  },
  cardDescription: {
    fontSize: 10,
    lineHeight: 16,
    color: '#444444',
    fontFamily: 'Poppins-Regular',
  },
  warningTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 5,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  warningText: {
    color: '#f45050',
    fontSize: 9,
    marginLeft: 6,
    fontFamily: 'Poppins-Regular',
  },
  arrowBox: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 8,
  },
});