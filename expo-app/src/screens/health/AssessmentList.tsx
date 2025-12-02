
import { getallassessmentsResult, getallcontents, viewProfile, viewUserTest } from '@/src/apis/apiService';
import { showToast } from '@/src/components/GlobalToast';
import { listAllCategory, updateContentList } from '@/src/redux/ContentSlice';
import { AppDispatch } from '@/src/redux/store';
import { UserDetails } from '@/src/types/userTypes';
import Colors from '@/src/utils/Colors';
import { ImagesAssets } from '@/src/utils/ImageAssets';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { t } from 'i18next';
import { ArrowUpRight, ChevronDown, ChevronUp, TriangleAlert } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch } from 'react-redux';
import PersonalityTestCard from './PersonalityTestCard';

const { width, height } = Dimensions.get("window");
const isProMax = height >= 926;

type TestItem = {
  isRequires: boolean;
  isSplash: boolean;
  open: boolean;
  testName: string;
};


const AssessmentList = () => {

  const dispatch = useDispatch<AppDispatch>();

  const [listOpen, setListOpen] = useState(true);
  const [profileDetails, setProfileDetails] = useState<UserDetails>({} as UserDetails);
  const [testArray, setTestArray] = useState<TestItem[]>([]);
  const [testData, setTestData] = useState(null);
  const [apiData, setApiData] = useState(null);



  useEffect(() => {
    const fetchProfileDetails = async () => {
      let result = await viewProfile();
      if (result?.data) {
        setProfileDetails(result.data);
      }
    }
    fetchProfileDetails();
  }, []);

  useEffect(() => {
    const fetchUserTests = async () => {
      let result = await viewUserTest();
      console.log("result: ", result);
      if (result?.data) {
        setTestArray(result.data);
      }
    };
    fetchUserTests();
  }, []);

  const [locale, setlocale] = useState('');
  let initialLng = "en";
  const loadPersistedLanguage = async () => {
    try {
      const saved = await AsyncStorage.getItem("userLanguage");
      if (saved === "en" || saved === "zh") {
        initialLng = saved;
        setlocale(initialLng);
        return;
      }
    } catch (e) {
      console.warn("Failed to load saved language", e);
    }

    const device = Localization.getLocales()[0]?.languageTag || "en";
    initialLng = device.startsWith("zh") ? "zh" : "en";
  };
  const currentDate = useMemo(() => new Date(), []);
  const currentMonth = useMemo(
    () => currentDate.toLocaleString(locale || "en", { month: "long" }),
    [currentDate, locale]
  );

  const getOrdinalSuffix = (day) => {
    if (day > 3 && day < 21) return 'th'; // covers 11th–13th
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  const lastDayOfMonth = useMemo(() => {
    const day = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    return day;
  }, [currentDate]);

  const ordinalSuffix = getOrdinalSuffix(lastDayOfMonth);

  const getUserDetails = useCallback(async () => {
    try {
      const userData = await AsyncStorage.getItem("userDetails");
      if (!userData) return;
      const parsedData = JSON.parse(userData);
      setTestData(parsedData.isPersonalityTestCompleted);
    } catch (error) { }
  }, []);

  useEffect(() => {
    getUserDetails();
  }, [getUserDetails]);

  const fetchQuestions = useCallback(async () => {

      try {
        const res = await getallassessmentsResult({ questionType: 'PERSONALITY' });
        if (res.success && res.status === 200) {
            setApiData(res.data.data);
        } else {
          showToast.error(t('oops'), res.message);
        }
      } catch (err: any) {
        showToast.error(t('oops'), err.message || t('somethingwentwrong'));
      } finally {
        
      }
    }, [t]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);


  const getAllContents = useCallback(
    async (department) => {
      try {
        const dbResult = await AsyncStorage.getItem("userDetails");
        if(!dbResult) return
        const userDetails = JSON.parse(dbResult);

        const response = await getallcontents({
          subCategory: department});
          dispatch(updateContentList({data:response.data, id: department}));

        

        
      } catch (error) {
        console.log(`API Error for`);
      } finally {
      }
    },
    []
  );
 

  useEffect(() => { 
    const getCategoryList = async () => {
      
     const categoryList = await dispatch(listAllCategory()).unwrap()

     categoryList.forEach((item) => getAllContents(item.id));
     
    } 
    getCategoryList()  
  },[])



  return (
    <View>
      <View style={{ flex: 1, justifyContent: "start", alignItems: "start", backgroundColor: "rgba(180, 180, 180, 0.4)", margin: 10, borderRadius: 10, padding: 10, paddingTop: 20 }}>

        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.sectionTitle}>{t('myassessments')}</Text>
            {(profileDetails?.isPOMSAssessment || profileDetails?.isHappinessIndex) && (
              <TriangleAlert size={20} color={'red'} />
            )}
          </View>
          <TouchableOpacity onPress={() => setListOpen(!listOpen)} style={{ flexDirection: "row", alignItems: "center" }}>
            {listOpen == true ? <ChevronDown size={30} color="black" /> : <ChevronUp size={30} color="black" />}
          </TouchableOpacity>

        </View>
        <Text style={styles.subText}>
          {t('myassessments_description')}
        </Text>

        <View style={styles.tagContainer}>
          <View style={styles.tag}>
            <Text style={[styles.tagText, testArray && testArray[0]?.open ? { color: "red" } : {}]}>
              {t('monthlyhappinessindex')}
            </Text>
          </View>
          <View style={styles.tag}>
            <Text style={[styles.tagText, testArray && testArray[1]?.open ? { color: "red" } : {}]}>
              {t('monthlywellbeingpulse')}
            </Text>
          </View>
        </View>



      </View>

      {listOpen && <View style={{ paddingHorizontal: 14 }}>


        <View style={{ marginBottom: 15 }}>
          <PersonalityTestCard data={testData} ApiData={apiData} testArray={testArray} />
        </View>



        <View style={{ marginBottom: 15 }}>
          <Pressable style={styles.frameParent}
          //   onPress={handleHappinessPress}
          >
            <View style={[styles.frameGroup, styles.frameGroupFlexBox]}>
              <Image style={styles.frameChild} resizeMode="cover" source={ImagesAssets.Happiness} />
              <View style={[styles.frameContainer, styles.frameFlexBox]}>
                <View style={styles.personalityMapParent}>
                  <View style={styles.row}>
                    <Text
                      style={[styles.personalityMap, { color: testArray && testArray[0]?.open ? '#06361f' : 'grey' }]}
                    >
                      {t('monthlyhappinessindex')}
                    </Text>
                  </View>

                  <View style={[styles.musicWrapper, styles.frameGroupFlexBox]}>
                    <Text style={[styles.music, { color: "#444444", fontSize: 10, lineHeight: 16 }]}>
                      {t('monthlyhappinessindex_description')}
                    </Text>
                  </View>

                  {testArray && testArray[0]?.open && (
                    <Pressable style={styles.happinessFormbutton}
                    // onPress={handleHappinessPress}
                    >
                      <View style={[styles.tag, { flexDirection: "row", alignItems: "center" }]}>
                        {/* <Image style={[styles.frameItem, { tintColor: "#f45050" }]} resizeMode="cover" source={ImagesAssets.warningImage} /> */}
                        <TriangleAlert size={15} color={'red'} />
                        <Text style={[styles.music, { color: "#f45050", fontSize: 10, lineHeight: 15, paddingHorizontal: 8 }]}>
                          {t("submitbefore", { currentMonth: currentMonth })}
                        </Text>
                      </View>
                    </Pressable>
                  )}
                </View>
                <View style={styles.iconBox}>
                  {/* <Image style={styles.frameItem} resizeMode="cover" source={ImagesAssets.baseicon2} /> */}
                  <ArrowUpRight size={18} color="black" />
                </View>
              </View>
            </View>
          </Pressable>
        </View>



        <View style={{ marginBottom: 15 }}>
          <Pressable style={styles.frameParent}
          //   onPress={handlePOMSPress}
          >
            <View style={[styles.frameGroup, styles.frameGroupFlexBox]}>
              <Image style={styles.frameChild} resizeMode="cover" source={ImagesAssets.POMS} />
              <View style={[styles.frameContainer, styles.frameFlexBox]}>
                <View style={styles.personalityMapParent}>
                  <View style={styles.row}>
                    <Text
                      style={[styles.personalityMap, { color: testArray && testArray[1]?.open ? '#06361f' : 'grey' }]}
                    >
                      {t('monthlywellbeingpulse')}
                    </Text>
                  </View>

                  <View style={styles.musicWrapper}>
                    <Text style={[styles.music, { color: "#444444", fontSize: 10, lineHeight: 16, width: "100%" }]}>
                      {t('monthlywellbeingpulse_description')}
                    </Text>
                  </View>

                  {testArray && testArray[1]?.open && (
                    <Pressable style={styles.happinessFormbutton}
                    // onPress={handlePOMSPress}
                    >
                      <View style={[styles.tag, { flexDirection: 'row', alignItems: 'center' }]}>
                        {/* <Image style={[styles.frameItem, { tintColor: "#f45050" }]} resizeMode="cover" source={ImagesAssets.warningImage} /> */}
                        <TriangleAlert size={15} color={'red'} />
                        <Text style={[styles.music, { color: "#f45050", fontSize: 10, lineHeight: 15, paddingHorizontal: 8 }]}>
                          Submit before {currentMonth} {lastDayOfMonth}{ordinalSuffix}
                        </Text>
                      </View>
                    </Pressable>
                  )}
                </View>
                <View style={styles.iconBox}>
                  <ArrowUpRight size={18} color="black" />
                </View>
              </View>
            </View>
          </Pressable>
        </View>

      </View>}
    </View>

  )
}

export default AssessmentList

const styles = StyleSheet.create({
  sectionTitle: {
    lineHeight: 24,
    fontSize: isProMax ? 22 : 20,
    fontWeight: "500",
    color: Colors.darkGreen,
    fontFamily: "WhyteInktrap-Medium",
    marginRight: 8,
  },
  subText: {
    fontSize: isProMax ? 12 : 10,
    lineHeight: 18,
    fontWeight: "500",
    color: "#333333",
    fontFamily: "Poppins-Regular",
    paddingRight: 30,
    marginTop: 5,
  },
  tagContainer: { flexDirection: "row", gap: 5, marginTop: 10, alignItems: "center" },
  tag: { backgroundColor: "#f5f5f5", paddingVertical: 4, paddingHorizontal: 10, borderRadius: 5 },
  tagText: { fontFamily: "Poppins-Regular", fontSize: 10, fontWeight: "500", color: "#333333" },
  frameItem: { width: 12, height: 12 },
  frameContainer: { gap: 8, flex: 1 },
  frameGroup: { gap: 16, alignSelf: "stretch" },
  frameParent: {
    backgroundColor: "rgba(180, 180, 180, 0.4)",
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  iconBox: { backgroundColor: "white", padding: 8, borderRadius: 8 },
  frameGroupFlexBox: { alignItems: "center", flexDirection: "row" },
  frameFlexBox: { alignItems: "center", flexDirection: "row" },
  personalityMapParent: { gap: 4, flex: 1 },
  row: { flexDirection: "row", alignItems: "center" },
  personalityMap: {
    fontSize: isProMax ? 14 : 12,
    lineHeight: 18,
    fontWeight: "500",
    fontFamily: "Poppins-SemiBold",
    color: "#1e1f1e",
    textAlign: "left",
  },
  music: { fontSize: 8, lineHeight: 10, fontFamily: "Poppins-Regular", color: "#fff", textAlign: "left" },
  musicWrapper: { borderRadius: 32 },
  happinessFormbutton: { flexDirection: "row", borderRadius: 5 },
  frameChild: { borderRadius: 25, width: 70, height: 70 },
})