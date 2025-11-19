import { Dimensions, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Check } from 'lucide-react-native';
import CustomLottie from '@/src/components/CustomLottie';
import GlobalHeader from '@/src/components/GlobalHeader';
import GlobalDropdown from '@/src/components/GlobalDropdown';
import { useTranslation } from 'react-i18next';
import GlobalButton from '@/src/components/GlobalButton';
import { getallcountries, updateprofile, UpdateProfileRequest } from '@/src/apis/apiService';
import { showToast } from '@/src/components/GlobalToast';
import Colors from '@/src/utils/Colors';
import { getUserDetails } from '@/src/utils/helperFunctions';

type User = {
  department?: string;
  id?: string;
  fullName?: string;
  countryCode?: string;
  mobileNumber?: string;
  email?: string;
};

const UpdateProfile = () => {
  const { profilePhoto } = useLocalSearchParams();
  const profilePhotoStr = Array.isArray(profilePhoto) ? profilePhoto[0] : profilePhoto || '';

  const router = useRouter();
  const { t } = useTranslation();
  const { height } = Dimensions.get('window');
  const [loading, setLoading] = useState(false);

  const [gender, setGender] = useState<string | null>(null);
  const [experience, setExperience] = useState<string | null>(null);
  const [relationshipStatus, setRelationshipStatus] = useState<string | null>(null);
  const [nationality, setNationality] = useState<string | null>(null);
  const [ethnicity, setEthnicity] = useState<string | null>(null);
  const [religion, setReligion] = useState<string | null>(null);
  const [healthCondition, setHealthCondition] = useState<string | null>(null);
  const [smoker, setSmoker] = useState<string | null>(null);
  const [alcohol, setAlcohol] = useState<string | null>(null);
  const [activityLevel, setActivityLevel] = useState<string | null>(null); // NEW
  const [socialInteraction, setSocialInteraction] = useState<string | null>(null);
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [favoriteActivity, setFavoriteActivity] = useState<string[]>([]);
  const [agree, setAgree] = useState(false);

  const [allcountries, setAllCountries] = useState<{ label: string; value: string }[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [user, setUser] = useState<User | null>(null);

  const isShoreStaff = user?.department === 'Shore_Staff';

  // Dropdown Options
  const GENDER = [
    { label: t('genderOptions.male'), value: t('genderOptions.male') },
    { label: t('genderOptions.female'), value: t('genderOptions.female') },
    { label: t('genderOptions.other'), value: t('genderOptions.other') },
  ];

  const EXPERIENCE = [
    { label: t('experienceOptions.0_1'), value: t('experienceOptions.0_1') },
    { label: t('experienceOptions.2_5'), value: t('experienceOptions.2_5') },
    { label: t('experienceOptions.5_plus'), value: t('experienceOptions.5_plus') },
  ];

  const RELATIONSHIP = [
    { label: t('relationshipOptions.single'), value: t('relationshipOptions.single') },
    { label: t('relationshipOptions.married'), value: t('relationshipOptions.married') },
    { label: t('relationshipOptions.divorced'), value: t('relationshipOptions.divorced') },
    { label: t('relationshipOptions.widowed'), value: t('relationshipOptions.widowed') },
  ];

  const ETHNICITY = [
    { label: t('ethnicityOptions.asian'), value: t('ethnicityOptions.asian') },
    { label: t('ethnicityOptions.black'), value: t('ethnicityOptions.black') },
    { label: t('ethnicityOptions.white'), value: t('ethnicityOptions.white') },
    { label: t('ethnicityOptions.latino'), value: t('ethnicityOptions.latino') },
    { label: t('ethnicityOptions.mena'), value: t('ethnicityOptions.mena') },
    { label: t('ethnicityOptions.native'), value: t('ethnicityOptions.native') },
    { label: t('ethnicityOptions.pacific'), value: t('ethnicityOptions.pacific') },
    { label: t('ethnicityOptions.mixed'), value: t('ethnicityOptions.mixed') },
  ];

  const RELIGION = [
    { label: t('religionOptions.buddhism'), value: t('religionOptions.buddhism') },
    { label: t('religionOptions.christianity'), value: t('religionOptions.christianity') },
    { label: t('religionOptions.hinduism'), value: t('religionOptions.hinduism') },
    { label: t('religionOptions.islam'), value: t('religionOptions.islam') },
    { label: t('religionOptions.judaism'), value: t('religionOptions.judaism') },
    { label: t('religionOptions.sikhism'), value: t('religionOptions.sikhism') },
    { label: t('religionOptions.jainism'), value: t('religionOptions.jainism') },
    { label: t('religionOptions.zoroastrianism'), value: t('religionOptions.zoroastrianism') },
    { label: t('religionOptions.taoism'), value: t('religionOptions.taoism') },
    { label: t('religionOptions.shinto'), value: t('religionOptions.shinto') },
    { label: t('religionOptions.other'), value: t('religionOptions.other') },
    { label: t('religionOptions.none'), value: t('religionOptions.none') },
  ];

  const HEALTH_OPTIONS = [
    { label: t('healthOptions.none'), value: t('healthOptions.none') },
    { label: t('healthOptions.hypertension'), value: t('healthOptions.hypertension') },
    { label: t('healthOptions.diabetes'), value: t('healthOptions.diabetes') },
    { label: t('healthOptions.anxiety'), value: t('healthOptions.anxiety') },
    { label: t('healthOptions.depression'), value: t('healthOptions.depression') },
    { label: t('healthOptions.other'), value: t('healthOptions.other') },
    { label: t('healthOptions.prefer_no'), value: t('healthOptions.prefer_no') },
  ];

  const SMOKING_OPTIONS = [
    { label: t('smokingOptions.no'), value: t('smokingOptions.no') },
    { label: t('smokingOptions.occasional'), value: t('smokingOptions.occasional') },
    { label: t('smokingOptions.regular'), value: t('smokingOptions.regular') },
    { label: t('smokingOptions.quit'), value: t('smokingOptions.quit') },
    { label: t('smokingOptions.prefer_no'), value: t('smokingOptions.prefer_no') },
  ];

  const ALCOHOL_OPTIONS = [
    { label: t('alcoholOptions.no'), value: t('alcoholOptions.no') },
    { label: t('alcoholOptions.occasional'), value: t('alcoholOptions.occasional') },
    { label: t('alcoholOptions.regular'), value: t('alcoholOptions.regular') },
    { label: t('alcoholOptions.avoid'), value: t('alcoholOptions.avoid') },
    { label: t('alcoholOptions.prefer_no'), value: t('alcoholOptions.prefer_no') },
  ];

  // NEW: Activity Level Dropdown
  const ACTIVITY_OPTIONS = [
    { label: t('activityOptions.inactive'), value: t('activityOptions.inactive') },
    { label: t('activityOptions.light_active'), value: t('activityOptions.light_active') },
    { label: t('activityOptions.moderate_active'), value: t('activityOptions.moderate_active') },
    { label: t('activityOptions.very_active'), value: t('activityOptions.very_active') },
    { label: t('activityOptions.prefer_no'), value: t('activityOptions.prefer_no') },
  ];

  const SOCIAL_OPTIONS = [
    { label: t('socialOptions.connected'), value: t('socialOptions.connected') },
    { label: t('socialOptions.isolated'), value: t('socialOptions.isolated') },
    { label: t('socialOptions.alone'), value: t('socialOptions.alone') },
  ];

  const HOBBIES_OPTIONS = [
    { label: t('hobbiesOptions.art'), value: t('hobbiesOptions.art') },
    { label: t('hobbiesOptions.music'), value: t('hobbiesOptions.music') },
    { label: t('hobbiesOptions.photo'), value: t('hobbiesOptions.photo') },
    { label: t('hobbiesOptions.dance'), value: t('hobbiesOptions.dance') },
    { label: t('hobbiesOptions.yoga'), value: t('hobbiesOptions.yoga') },
    { label: t('hobbiesOptions.gym'), value: t('hobbiesOptions.gym') },
    { label: t('hobbiesOptions.gaming'), value: t('hobbiesOptions.gaming') },
    { label: t('hobbiesOptions.reading'), value: t('hobbiesOptions.reading') },
    { label: t('hobbiesOptions.movies'), value: t('hobbiesOptions.movies') },
    { label: t('hobbiesOptions.cooking'), value: t('hobbiesOptions.cooking') },
    { label: t('hobbiesOptions.sports'), value: t('hobbiesOptions.sports') },
    { label: t('hobbiesOptions.meditation'), value: t('hobbiesOptions.meditation') },
  ];

  const FAV_ACTIVITY_OPTIONS = [
    { label: t('fav_activityOptions.movie'), value: t('fav_activityOptions.movie') },
    { label: t('fav_activityOptions.gym'), value: t('fav_activityOptions.gym') },
    { label: t('fav_activityOptions.karaoke'), value: t('fav_activityOptions.karaoke') },
    { label: t('fav_activityOptions.games'), value: t('fav_activityOptions.games') },
    { label: t('fav_activityOptions.jam'), value: t('fav_activityOptions.jam') },
    { label: t('fav_activityOptions.meditation'), value: t('fav_activityOptions.meditation') },
    { label: t('fav_activityOptions.cook'), value: t('fav_activityOptions.cook') },
    { label: t('fav_activityOptions.sports'), value: t('fav_activityOptions.sports') },
    { label: t('fav_activityOptions.drinks'), value: t('fav_activityOptions.drinks') },
  ];

  const getAllCountries = async () => {
    try {
      const res = await getallcountries();
      if (res.success && res.status === 200) {
        const data = res.data.map((c: any) => ({ label: c.name, value: c.name }));
        setAllCountries(data);
      } else {
        showToast.error(t('oops'), res.message);
      }
    } catch {
      showToast.error(t('oops'), t('somethingwentwrong'));
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      const userData = await getUserDetails();
      setUser(userData);
    };
    getAllCountries();
    loadUser();
  }, []);

  const updateProfile = async () => {
    setLoading(true);

    const payload: Partial<UpdateProfileRequest> = {
      userId: user?.id,
      fullName: user?.fullName,
      countryCode: user?.countryCode,
      mobileNumber: user?.mobileNumber,
      email: user?.email,
      profileUrl: profilePhotoStr || undefined,
      gender: gender || undefined,
      experience: experience || undefined,
      relationshipStatus: relationshipStatus || undefined,
      nationality: nationality || undefined,
      ethnicity: ethnicity || undefined,
      religion: religion || undefined,
      healthCondition: healthCondition || undefined,
      smoker: smoker || undefined,
      alcohol: alcohol || undefined,
      socialInteraction: socialInteraction || undefined,
      hobbies: hobbies.length ? hobbies : undefined,
      favoriteActivity: favoriteActivity.length ? favoriteActivity : undefined,
      isProfileCompleted: true,
    };

    Object.keys(payload).forEach((key) => {
      if (payload[key as keyof typeof payload] === undefined) {
        delete payload[key as keyof typeof payload];
      }
    });

    try {
      const res = await updateprofile(payload);
      setLoading(false);

      if (res.success && res.status === 200) {
        showToast.success(t('success'),res.message);
        router.push('/personalitymap');
      } else {
        showToast.error(t('oops'), res.message ?? t('somethingwentwrong'));
      }
    } catch {
      setLoading(false);
      showToast.error(t('error'), t('somethingwentwrong'));
    }
  };

  const handleMultiSelect = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    selected: string[]
  ) => {
    if (selected.length > 3) {
      showToast.error(t('error'), t('maxThreeItems'));
      return;
    }
    setter(selected);
  };

  const handleNext = () => {
    if (currentStep === 5) {
      updateProfile();
      return;
    }
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const optional = (text: string) => (isShoreStaff ? `${text} (${t('optional')})` : text);

  return (
    <View style={styles.main}>
      <GlobalHeader
        title={t('profileDetails')}
        leftIcon={<ChevronLeft size={20} />}
        onLeftPress={currentStep > 1 ? handlePrev : () => router.back()}
      />

      <View style={styles.bottomCard1}>
        <CustomLottie isBlurView={false} componetHeight={height * 0.85} />
      </View>

      <View style={styles.mainContent}>
        <Text style={styles.title}>{t('updateyourprofiledetails')}</Text>
        <Text style={styles.description}>{t('updateyourprofiledetails_description')}</Text>

        {currentStep === 1 && (
          <>
            <GlobalDropdown
              data={GENDER}
              value={gender}
              onChange={setGender}
              placeholder={t('selectgender')}
              labelField="label"
              valueField="value"
              containerStyle={{ marginTop: 40, marginBottom: 20 }}
            />
            <GlobalDropdown
              data={RELATIONSHIP}
              value={relationshipStatus}
              onChange={setRelationshipStatus}
              placeholder={optional(t('selectrelationshipstatus'))}
              labelField="label"
              valueField="value"
              containerStyle={{ marginBottom: 20 }}
            />
            <GlobalDropdown
              data={EXPERIENCE}
              value={experience}
              onChange={setExperience}
              placeholder={optional(t('selectyearsofexperience'))}
              labelField="label"
              valueField="value"
            />
          </>
        )}

        {currentStep === 2 && (
          <>
            <GlobalDropdown
              data={allcountries}
              value={nationality}
              searchable
              onChange={setNationality}
              placeholder={optional(t('selectnationality'))}
              labelField="label"
              valueField="value"
              containerStyle={{ marginTop: 40, marginBottom: 20 }}
            />
            <GlobalDropdown
              data={ETHNICITY}
              value={ethnicity}
              onChange={setEthnicity}
              placeholder={optional(t('selectethnicity'))}
              labelField="label"
              valueField="value"
              containerStyle={{ marginBottom: 20 }}
            />
            <GlobalDropdown
              data={RELIGION}
              value={religion}
              onChange={setReligion}
              placeholder={optional(t('selectreligion'))}
              labelField="label"
              valueField="value"
              containerStyle={{ marginBottom: 20 }}
            />
          </>
        )}

        {currentStep === 3 && (
          <>
            <GlobalDropdown
              data={HEALTH_OPTIONS}
              value={healthCondition}
              onChange={setHealthCondition}
              placeholder={optional(t('selectHealthCondition'))}
              labelField="label"
              valueField="value"
              containerStyle={{ marginTop: 40, marginBottom: 20 }}
            />
            <GlobalDropdown
              data={SMOKING_OPTIONS}
              value={smoker}
              onChange={setSmoker}
              placeholder={optional(t('selectSmokingStatus'))}
              labelField="label"
              valueField="value"
              containerStyle={{ marginBottom: 20 }}
            />
            <GlobalDropdown
              data={ALCOHOL_OPTIONS}
              value={alcohol}
              onChange={setAlcohol}
              placeholder={optional(t('selectAlcoholStatus'))}
              labelField="label"
              valueField="value"
            />
          </>
        )}

        {/* STEP 4: Activity Level + Social Interaction */}
        {currentStep === 4 && (
          <>
            <GlobalDropdown
              data={ACTIVITY_OPTIONS}
              value={activityLevel}
              onChange={setActivityLevel}
              placeholder={optional(t('selectActivityStatus'))}
              labelField="label"
              valueField="value"
              containerStyle={{ marginTop: 40, marginBottom: 20 }}
            />
            <GlobalDropdown
              data={SOCIAL_OPTIONS}
              value={socialInteraction}
              onChange={setSocialInteraction}
              placeholder={optional(t('selectSocialStatus'))}
              labelField="label"
              valueField="value"
              containerStyle={{ marginBottom: 20 }}
            />
          </>
        )}

        {currentStep === 5 && (
          <>
            <GlobalDropdown
              data={HOBBIES_OPTIONS}
              multiple
              value={hobbies}
              onChange={(v) => handleMultiSelect(setHobbies, v)}
              placeholder={optional(t('selectHobbies'))}
              labelField="label"
              valueField="value"
              containerStyle={{ marginVertical: 20 }}
            />
            <GlobalDropdown
              data={FAV_ACTIVITY_OPTIONS}
              multiple
              value={favoriteActivity}
              onChange={(v) => handleMultiSelect(setFavoriteActivity, v)}
              placeholder={optional(t('selectFavActivity'))}
              labelField="label"
              valueField="value"
              containerStyle={{ marginBottom: 10 }}
            />

            <TouchableOpacity
              style={styles.agreementRow}
              onPress={() => setAgree(!agree)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, agree && styles.checkboxChecked]}>
                {agree && <Check size={16} color={Colors.white} />}
              </View>
              <Text style={styles.agreementText}>{t('agreementText')}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.bottomButtonWrapper}>
        <GlobalButton
          title={currentStep === 5 ? t('register') : t('common.next')}
          onPress={handleNext}
          disabled={
            (currentStep === 1 && !gender) ||
            (currentStep >= 2 && currentStep <= 4 && !isShoreStaff && (
              (currentStep === 2 && (!nationality || !ethnicity || !religion)) ||
              (currentStep === 3 && (!healthCondition || !smoker || !alcohol)) ||
              (currentStep === 4 && (!activityLevel || !socialInteraction))
            )) ||
            (currentStep === 5 && ((!isShoreStaff && (!hobbies.length || !favoriteActivity.length)) || !agree))
          }
          loading={loading}
          buttonStyle={{ width: '100%' }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  main: { flex: 1 },
  bottomButtonWrapper: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
  },
  bottomCard1: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    bottom: '-20%',
    alignItems: 'center',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    overflow: 'hidden',
  },
  mainContent: {
    margin: 20,
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#262626',
    marginBottom: 10,
    fontFamily: 'WhyteInktrap-Bold',
  },
  description: {
    fontSize: 14,
    color: '#636363',
    lineHeight: 21,
    marginBottom: 20,
    fontFamily: 'Poppins-Regular',
  },
  agreementRow: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ccc',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  checkboxChecked: {
    backgroundColor: Colors.lightGreen,
    borderColor: Colors.lightGreen,
  },
  agreementText: {
    flex: 1,
    fontSize: 14,
    color: Colors.white,
    fontFamily: 'Poppins-Regular',
    lineHeight: 20,
  },
});

export default UpdateProfile;