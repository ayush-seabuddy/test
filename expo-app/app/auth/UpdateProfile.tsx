import { Dimensions, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Check } from 'lucide-react-native';
import CustomLottie from '@/src/components/CustomLottie';
import GlobalHeader from '@/src/components/GlobalHeader';
import GlobalDropdown from '@/src/components/GlobalDropdown';
import { useTranslation } from 'react-i18next';
import GlobalButton from '@/src/components/GlobalButton';
import { getallcountries } from '@/src/apis/apiService';
import { showToast } from '@/src/components/GlobalToast';
import Colors from '@/src/utils/Colors';

const UpdateProfile = () => {
    const { profilePhoto } = useLocalSearchParams();
    const profilePhotoStr = Array.isArray(profilePhoto) ? profilePhoto[0] : profilePhoto || "";
    const router = useRouter();
    const { t } = useTranslation();
    const { height } = Dimensions.get('window');

    // Form States
    const [gender, setGender] = useState<string | null>(null);
    const [yearsofexperience, setYearsOfExperience] = useState<string | null>(null);
    const [nationality, setNationality] = useState<string | null>(null);
    const [relationship, setRelationship] = useState<string | null>(null);
    const [ethnicity, setEthnicity] = useState<string | null>(null);
    const [religion, setReligion] = useState<string | null>(null);
    const [healthconcers, setHealthConcers] = useState<string | null>(null);
    const [smokingstatus, setSmokingStatus] = useState<string | null>(null);
    const [alcoholstatus, setAlcoholStatus] = useState<string | null>(null);
    const [activitystatus, setActivityStatus] = useState<string | null>(null);
    const [socialstatus, setSocialStatus] = useState<string | null>(null);
    const [hobbies, setHobbies] = useState<string[]>([]);
    const [favactivity, setFavActivity] = useState<string[]>([]);
    const [agree, setAgree] = useState(false);

    const [allcountries, setAllCountries] = useState<{ label: string; value: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);

    // Options
    const GENDER = [
        { label: t('genderOptions.male'), value: "Male" },
        { label: t('genderOptions.female'), value: "Female" },
        { label: t('genderOptions.other'), value: "Other" },
    ];

    const YEARSOFEXPRIENCE = [
        { label: t("experienceOptions.0_1"), value: "0-1" },
        { label: t("experienceOptions.2_5"), value: "2-5" },
        { label: t("experienceOptions.5_plus"), value: "5+" },
    ];

    const RELATIONSHIP = [
        { label: t("relationshipOptions.single"), value: "Single" },
        { label: t("relationshipOptions.married"), value: "Married" },
        { label: t("relationshipOptions.divorced"), value: "Divorced" },
        { label: t("relationshipOptions.widowed"), value: "Widowed" }
    ];

    const ETHNICITY = [
        { label: t("ethnicityOptions.asian"), value: "Asian" },
        { label: t("ethnicityOptions.black"), value: "Black / African Descent" },
        { label: t("ethnicityOptions.white"), value: "Caucasian / White" },
        { label: t("ethnicityOptions.latino"), value: "Hispanic / Latino" },
        { label: t("ethnicityOptions.mena"), value: "Middle Eastern / North African" },
        { label: t("ethnicityOptions.native"), value: "Native American / Indigenous" },
        { label: t("ethnicityOptions.pacific"), value: "Pacific Islander" },
        { label: t("ethnicityOptions.mixed"), value: "Mixed / Multiracial" }
    ];

    const RELIGION = [
        { label: t("religionOptions.buddhism"), value: "Buddhism" },
        { label: t("religionOptions.christianity"), value: "Christianity" },
        { label: t("religionOptions.hinduism"), value: "Hinduism" },
        { label: t("religionOptions.islam"), value: "Islam" },
        { label: t("religionOptions.judaism"), value: "Judaism" },
        { label: t("religionOptions.sikhism"), value: "Sikhism" },
        { label: t("religionOptions.jainism"), value: "Jainism" },
        { label: t("religionOptions.zoroastrianism"), value: "Zoroastrianism" },
        { label: t("religionOptions.taoism"), value: "Taoism" },
        { label: t("religionOptions.shinto"), value: "Shinto" },
        { label: t("religionOptions.other"), value: "Other" },
        { label: t("religionOptions.none"), value: "No Religion" },
    ];

    const HEALTH_OPTIONS = [
        { label: t("healthOptions.none"), value: "None" },
        { label: t("healthOptions.hypertension"), value: "Hypertension" },
        { label: t("healthOptions.diabetes"), value: "Diabetes" },
        { label: t("healthOptions.anxiety"), value: "Anxiety" },
        { label: t("healthOptions.depression"), value: "Depression" },
        { label: t("healthOptions.other"), value: "Other (specify)" },
        { label: t("healthOptions.prefer_no"), value: "Prefer not to say" },
    ];

    const SMOKING_OPTIONS = [
        { label: t("smokingOptions.no"), value: "No" },
        { label: t("smokingOptions.occasional"), value: "Occasionally (e.g. social or stress-related)" },
        { label: t("smokingOptions.regular"), value: "Regularly (daily or near-daily)" },
        { label: t("smokingOptions.quit"), value: "Trying to quit" },
        { label: t("smokingOptions.prefer_no"), value: "Prefer not to say" },
    ];

    const ALCOHOL_OPTIONS = [
        { label: t("alcoholOptions.no"), value: "I don’t drink" },
        { label: t("alcoholOptions.occasional"), value: "Occasionally (e.g. social settings)" },
        { label: t("alcoholOptions.regular"), value: "Regularly (e.g. weekly)" },
        { label: t("alcoholOptions.avoid"), value: "Avoiding alcohol right now" },
        { label: t("alcoholOptions.prefer_no"), value: "Prefer not to say" },
    ];

    const ACTIVITY_OPTIONS = [
        { label: t("activityOptions.inactive"), value: "inactive" },
        { label: t("activityOptions.light_active"), value: "light_active" },
        { label: t("activityOptions.moderate_active"), value: "moderate_active" },
        { label: t("activityOptions.very_active"), value: "very_active" },
        { label: t("activityOptions.prefer_no"), value: "prefer_no" },
    ];

    const SOCIAL_OPTIONS = [
        { label: t("socialOptions.connected"), value: "connected" },
        { label: t("socialOptions.isolated"), value: "isolated" },
        { label: t("socialOptions.alone"), value: "alone" }
    ];

    const HOBBIES_OPTIONS = [
        { label: t("hobbiesOptions.art"), value: "art" },
        { label: t("hobbiesOptions.music"), value: "music" },
        { label: t("hobbiesOptions.photo"), value: "photo" },
        { label: t("hobbiesOptions.dance"), value: "dance" },
        { label: t("hobbiesOptions.yoga"), value: "yoga" },
        { label: t("hobbiesOptions.gym"), value: "gym" },
        { label: t("hobbiesOptions.gaming"), value: "gaming" },
        { label: t("hobbiesOptions.reading"), value: "reading" },
        { label: t("hobbiesOptions.movies"), value: "movies" },
        { label: t("hobbiesOptions.cooking"), value: "cooking" },
        { label: t("hobbiesOptions.sports"), value: "sports" },
        { label: t("hobbiesOptions.meditation"), value: "meditation" }
    ];

    const FAV_ACTIVITY_OPTIONS = [
        { label: t("fav_activityOptions.movie"), value: "movie" },
        { label: t("fav_activityOptions.gym"), value: "gym" },
        { label: t("fav_activityOptions.karaoke"), value: "karaoke" },
        { label: t("fav_activityOptions.games"), value: "games" },
        { label: t("fav_activityOptions.jam"), value: "jam" },
        { label: t("fav_activityOptions.meditation"), value: "meditation" },
        { label: t("fav_activityOptions.cook"), value: "cook" },
        { label: t("fav_activityOptions.sports"), value: "sports" },
        { label: t("fav_activityOptions.drinks"), value: "drinks" }
    ];

    // Fetch Countries
    const getAllCountries = async () => {
        setLoading(true);
        try {
            const apiResponse = await getallcountries();
            setLoading(false);
            if (apiResponse.success && apiResponse.status === 200) {
                const countryData = apiResponse.data.map((country: any) => ({
                    label: country.name,
                    value: country.name,
                }));
                setAllCountries(countryData);
            } else {
                showToast.error(t('oops'), apiResponse.message);
            }
        } catch (error) {
            setLoading(false);
            showToast.error(t('oops'), t('somethingwentwrong'));
        }
    };

    useEffect(() => {
        getAllCountries();
    }, []);

    // Handle Multi-Select with Max 3
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
        setCurrentStep((prev) => prev + 1);
    };

    return (
        <View style={styles.main}>
            <GlobalHeader
                title='Profile Details'
                leftIcon={<ChevronLeft size={20} color={Colors.white} />}
                onLeftPress={() => router.back()}
            />

            <View style={styles.bottomCard1}>
                <CustomLottie isBlurView={false} componetHeight={height * 0.85} />
            </View>

            <View style={styles.mainContent}>
                <Text style={styles.title}>{t("updateyourprofiledetails")}</Text>
                <Text style={styles.description}>{t("updateyourprofiledetails_description")}</Text>

                {/* Step 1 */}
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
                            value={relationship}
                            onChange={setRelationship}
                            placeholder={t('selectrelationshipstatus')}
                            labelField="label"
                            valueField="value"
                            containerStyle={{ marginBottom: 20 }}
                        />
                        <GlobalDropdown
                            data={YEARSOFEXPRIENCE}
                            value={yearsofexperience}
                            onChange={setYearsOfExperience}
                            placeholder={t('selectyearsofexperience')}
                            labelField="label"
                            valueField="value"
                        />
                    </>
                )}

                {/* Step 2 */}
                {currentStep === 2 && (
                    <>
                        <GlobalDropdown
                            data={allcountries}
                            value={nationality}
                            searchable
                            onChange={setNationality}
                            containerStyle={{ marginTop: 40, marginBottom: 20 }}
                            placeholder={t('selectnationality')}
                            labelField="label"
                            valueField="value"
                        />
                        <GlobalDropdown
                            data={ETHNICITY}
                            value={ethnicity}
                            onChange={setEthnicity}
                            placeholder={t('selectethnicity')}
                            labelField="label"
                            valueField="value"
                            containerStyle={{ marginBottom: 20 }}
                        />
                        <GlobalDropdown
                            data={RELIGION}
                            value={religion}
                            onChange={setReligion}
                            placeholder={t('selectreligion')}
                            labelField="label"
                            valueField="value"
                            containerStyle={{ marginBottom: 20 }}
                        />
                    </>
                )}

                {/* Step 3 */}
                {currentStep === 3 && (
                    <>
                        <GlobalDropdown
                            data={HEALTH_OPTIONS}
                            value={healthconcers}
                            onChange={setHealthConcers}
                            containerStyle={{ marginTop: 40, marginBottom: 20 }}
                            placeholder={t("selectHealthCondition")}
                            labelField="label"
                            valueField="value"
                        />
                        <GlobalDropdown
                            data={SMOKING_OPTIONS}
                            value={smokingstatus}
                            onChange={setSmokingStatus}
                            containerStyle={{ marginBottom: 20 }}
                            placeholder={t("selectSmokingStatus")}
                            labelField="label"
                            valueField="value"
                        />
                        <GlobalDropdown
                            data={ALCOHOL_OPTIONS}
                            value={alcoholstatus}
                            onChange={setAlcoholStatus}
                            placeholder={t("selectAlcoholStatus")}
                            labelField="label"
                            valueField="value"
                        />
                    </>
                )}

                {/* Step 4 */}
                {currentStep === 4 && (
                    <>
                        <GlobalDropdown
                            data={ACTIVITY_OPTIONS}
                            value={activitystatus}
                            onChange={setActivityStatus}
                            containerStyle={{ marginTop: 40, marginBottom: 20 }}
                            placeholder={t("selectActivityStatus")}
                            labelField="label"
                            valueField="value"
                            
                        />
                        <GlobalDropdown
                            data={SOCIAL_OPTIONS}
                            value={socialstatus}
                            onChange={setSocialStatus}
                            containerStyle={{ marginBottom: 20 }}
                            placeholder={t("selectSocialStatus")}
                            labelField="label"
                            valueField="value"
                        />
                    </>
                )}

                {/* Step 5 - Hobbies, Fav Activities + Agreement */}
                {currentStep === 5 && (
                    <>
                        <GlobalDropdown
                            data={HOBBIES_OPTIONS}
                            multiple
                            value={hobbies}
                            onChange={(v) => handleMultiSelect(setHobbies, v)}
                            containerStyle={{ marginVertical: 20 }}
                            placeholder={t("selectHobbies")}
                            labelField="label"
                            valueField="value"
                            
                            
                        />
                        <GlobalDropdown
                            data={FAV_ACTIVITY_OPTIONS}
                            multiple
                            value={favactivity}
                            onChange={(v) => handleMultiSelect(setFavActivity, v)}
                            placeholder={t("selectFavActivity")}
                            labelField="label"
                            valueField="value"
                            containerStyle={{ marginBottom: 10 }}
                        />

                        {/* Agreement Checkbox with Lucide Check */}
                        <TouchableOpacity
                            style={styles.agreementRow}
                            onPress={() => setAgree(!agree)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.checkbox, agree && styles.checkboxChecked]}>
                                {agree && <Check size={16} color={Colors.white} />}
                            </View>
                            <Text style={styles.agreementText}>
                                {t('agreementText')}
                            </Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>

            {/* Next Button */}
            <View style={styles.bottomButtonWrapper}>
                <GlobalButton
                    title={t('common.next')}
                    onPress={handleNext}
                    disabled={
                        (currentStep === 1 && (!gender || !relationship || !yearsofexperience)) ||
                        (currentStep === 2 && (!nationality || !ethnicity || !religion)) ||
                        (currentStep === 3 && (!healthconcers || !smokingstatus || !alcoholstatus)) ||
                        (currentStep === 4 && (!activitystatus || !socialstatus)) ||
                        (currentStep === 5 && (!hobbies.length || !favactivity.length || !agree))
                    }
                    buttonStyle={{ width: '100%' }}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    main: {
        flex: 1,
    },
    bottomButtonWrapper: {
        position: 'absolute',
        bottom: 50,
        left: 20,
        right: 20,
    },
    bottomCard1: {
        width: "100%",
        height: "100%",
        position: "absolute",
        bottom: "-20%",
        alignItems: "center",
        borderTopLeftRadius: 35,
        borderTopRightRadius: 35,
        overflow: "hidden",
    },
    mainContent: {
        margin: 20,
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
        color: "#262626",
        marginBottom: 10,
        fontFamily: "WhyteInktrap-Bold",
    },
    description: {
        fontSize: 14,
        color: "#636363",
        lineHeight: 21,
        marginBottom: 20,
        fontFamily: "Poppins-Regular",
    },
    agreementRow: {
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