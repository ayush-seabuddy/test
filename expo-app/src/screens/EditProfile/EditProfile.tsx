import { updateprofile, viewProfile } from '@/src/apis/apiService';
import CommonLoader from '@/src/components/CommonLoader';
import GlobalHeader from '@/src/components/GlobalHeader';
import { showToast } from '@/src/components/GlobalToast';
import { RootState } from '@/src/redux/store';
import { updateUserField } from '@/src/redux/userDetailsSlice';
import Colors from '@/src/utils/Colors';
import { router } from 'expo-router';
import {
  Activity,
  Blend,
  Calendar,
  HandHelpingIcon,
  Heart,
  HeartPulseIcon,
  Mail,
  Mars,
  Phone,
  User,
  Volleyball,
  X,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import { Dropdown } from 'react-native-element-dropdown';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useDispatch, useSelector } from 'react-redux';
import * as Yup from "yup";

const EditProfile = () => {
  const { t } = useTranslation();

  const validationSchema = Yup.object().shape({
    name: Yup.string().required(t('validation.name_required', 'Name is required')),
    email: Yup.string().email(t('validation.invalid_email', 'Invalid email')).required(t('validation.email_required', 'Email is required')),
    dob: Yup.string().required(t('validation.dob_required', 'Date of birth is required')),
    maritalStatus: Yup.string().required(t('validation.relationship_required', 'Relationship status is required')),
    gender: Yup.string().required(t('validation.gender_required', 'Gender is required')),
    experience: Yup.string().required(t('validation.experience_required', 'Experience is required')),
    ethnicity: Yup.string().required(t('validation.ethnicity_required', 'Ethnicity is required')),
    religion: Yup.string().required(t('validation.religion_required', 'Religion is required')),
    hobbies: Yup.array()
      .min(1, t('validation.hobbies_min', 'Select at least one hobby'))
      .required(t('validation.hobbies_required', 'Hobbies are required')),
    favoriteActivity: Yup.array()
      .min(1, t('validation.favorite_activity_min', 'Select at least one favorite activity'))
      .required(t('validation.favorite_activity_required', 'Favorite activities are required')),
    about: Yup.string()
      .required(t('validation.about_required', 'About is required'))
      .min(20, t('validation.about_min', 'About should be at least 20 characters'))
      .max(600, t('validation.about_max', 'About should not exceed 600 characters')),
  });

  const validationSchemaForShoreStaff = Yup.object().shape({
    name: Yup.string().required(t('validation.name_required', 'Name is required')),
    email: Yup.string().email(t('validation.invalid_email', 'Invalid email')).required(t('validation.email_required', 'Email is required')),
    dob: Yup.string().required(t('validation.dob_required', 'Date of birth is required')),
    maritalStatus: Yup.string().optional(),
    gender: Yup.string().required(t('validation.gender_required', 'Gender is required')),
    experience: Yup.string().optional(),
    ethnicity: Yup.string().optional(),
    religion: Yup.string().optional(),
    hobbies: Yup.array().optional(),
    favoriteActivity: Yup.array().optional(),
    about: Yup.string()
      .required(t('validation.about_required', 'About is required'))
      .min(20, t('validation.about_min', 'About should be at least 20 characters'))
      .max(600, t('validation.about_max', 'About should not exceed 600 characters')),
  });

  const dispatch = useDispatch();
  const profile = useSelector((state: RootState) => state.userDetails);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [openDatePicker, setOpenDatePicker] = useState(false);

  const [gender, setGender] = useState<string | null>(null);
  const [yearsOfExperience, setYearsOfExperience] = useState<string | null>(null);
  const [race, setRace] = useState<string | null>(null);
  const [maritalStatus, setMaritalStatus] = useState<string | null>(null);
  const [nationality, setNationality] = useState<string | null>(null);
  const [religion, setReligion] = useState<string | null>(null);

  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);
  const [selectedFavActivities, setSelectedFavActivities] = useState<string[]>([]);

  const [about, setAbout] = useState('');
  const [loadingdetails, setloadingdetails] = useState(false);
  const [updatingdetails, setupdatingdetails] = useState(false);
  const [userId, setUserId] = useState<string | undefined>(undefined);

  const formatDateForDisplay = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatDateForValidation = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('en-GB');
  };

  const parseAPIDate = (dateString: string): Date | null => {
    if (!dateString) return null;
    try {
      const parts = dateString.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        const parsed = new Date(year, month, day);
        if (!isNaN(parsed.getTime())) {
          return parsed;
        }
      }
    } catch (error) {
      console.error('Error parsing date:', error);
    }
    return null;
  };
  const GENDER = [
    { label: t('genderOptions.male'), value: 'Male' },
    { label: t('genderOptions.female'), value: 'Female' },
    { label: t('genderOptions.other'), value: 'Other' },
  ];

  const EXPERIENCE = [
    { label: t('experienceOptions.0_1'), value: '0-1 years' },
    { label: t('experienceOptions.2_5'), value: '2-5 years' },
    { label: t('experienceOptions.5_plus'), value: '5+ years' },
  ];

  const ETHNICITY = [
    { label: t('ethnicityOptions.asian'), value: 'Asian' },
    { label: t('ethnicityOptions.black'), value: 'Black / African Descent' },
    { label: t('ethnicityOptions.white'), value: 'Caucasian / White' },
    { label: t('ethnicityOptions.latino'), value: 'Hispanic / Latino' },
    { label: t('ethnicityOptions.mena'), value: 'Middle Eastern / North African' },
    { label: t('ethnicityOptions.native'), value: 'Native American / Indigenous' },
    { label: t('ethnicityOptions.pacific'), value: 'Pacific Islander' },
    { label: t('ethnicityOptions.mixed'), value: 'Mixed / Multiracial' },
  ];

  const RELATIONSHIP = [
    { label: t('relationshipOptions.single'), value: 'Single' },
    { label: t('relationshipOptions.married'), value: 'Married' },
    { label: t('relationshipOptions.divorced'), value: 'Divorced' },
    { label: t('relationshipOptions.widowed'), value: 'Widowed' },
  ];
  const RELIGION = [
    { label: t('religionOptions.buddhism'), value: 'Buddhism' },
    { label: t('religionOptions.christianity'), value: 'Christianity' },
    { label: t('religionOptions.hinduism'), value: 'Hinduism' },
    { label: t('religionOptions.islam'), value: 'Islam' },
    { label: t('religionOptions.judaism'), value: 'Judaism' },
    { label: t('religionOptions.sikhism'), value: 'Sikhism' },
    { label: t('religionOptions.jainism'), value: 'Jainism' },
    { label: t('religionOptions.zoroastrianism'), value: 'Zoroastrianism' },
    { label: t('religionOptions.taoism'), value: 'Taoism' },
    { label: t('religionOptions.shinto'), value: 'Shinto' },
    { label: t('religionOptions.other'), value: 'Other' },
    { label: t('religionOptions.none'), value: 'No Religion' },
  ];
  const HOBBIES_OPTIONS = [
    { label: t('hobbiesOptions.art'), value: '🎨 Art & Craft' },
    { label: t('hobbiesOptions.music'), value: '🎵 Music' },
    { label: t('hobbiesOptions.photo'), value: '📸 Photography' },
    { label: t('hobbiesOptions.dance'), value: '💃 Dancing' },
    { label: t('hobbiesOptions.yoga'), value: '🧘‍♀️ Yoga' },
    { label: t('hobbiesOptions.gym'), value: '🏋️‍♀️ Gym/Fitness' },
    { label: t('hobbiesOptions.gaming'), value: '🎮 Gaming' },
    { label: t('hobbiesOptions.reading'), value: '📖 Reading' },
    { label: t('hobbiesOptions.movies'), value: '🎬 Movies' },
    { label: t('hobbiesOptions.cooking'), value: '🍳 Cooking' },
    { label: t('hobbiesOptions.sports'), value: '⚽ Sports' },
    { label: t('hobbiesOptions.meditation'), value: '🧘‍♂️ Meditation' },
  ];

  const FAV_ACTIVITY_OPTIONS = [
    { label: t('fav_activityOptions.movie'), value: 'Movie Night' },
    { label: t('fav_activityOptions.gym'), value: 'Gym Session' },
    { label: t('fav_activityOptions.karaoke'), value: 'Karaoke' },
    { label: t('fav_activityOptions.games'), value: 'Crew Games (Cards, Ludo etc.)' },
    { label: t('fav_activityOptions.jam'), value: 'Jam Session' },
    { label: t('fav_activityOptions.meditation'), value: 'Meditation' },
    { label: t('fav_activityOptions.cook'), value: 'Cooking Challenge' },
    { label: t('fav_activityOptions.sports'), value: 'Sports Match' },
    { label: t('fav_activityOptions.drinks'), value: 'Drinks and Chats' },
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setloadingdetails(true);
        const result = await viewProfile();
        if (result?.data) {
          const object = result.data;
          for (const property in object) {
            dispatch(updateUserField({ key: property, value: object[property] }));
          }

          setUserId(object.id || object.userId || object._id);
          setName(object.fullName || object.name || '');
          setEmail(object.email || '');
          setPhone(object.mobileNumber || '');

          if (object.dob) {
            const parsed = parseAPIDate(object.dob);
            if (parsed && !isNaN(parsed.getTime())) {
              setDate(parsed);
            }
          }

          setGender(object.gender || null);
          setYearsOfExperience(object.experience || null);
          setRace(object.ethnicity || null);
          setMaritalStatus(object.relationshipStatus || null);
          setNationality(object.nationality || null);
          setReligion(object.religion || null);
          setSelectedHobbies(Array.isArray(object.hobbies) ? object.hobbies : []);
          setSelectedFavActivities(Array.isArray(object.favoriteActivity) ? object.favoriteActivity : []);
          setAbout(object.bio || object.about || '');
        }
      } catch (err) {
        console.error('viewProfile error', err);
        showToast.error(t('error'), 'Failed to load profile');
      } finally {
        setloadingdetails(false);
      }
    };

    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    const values = {
      name,
      email,
      phone,
      dob: formatDateForValidation(date),
      maritalStatus,
      gender,
      experience: yearsOfExperience,
      ethnicity: race,
      religion,
      country: nationality,
      about,
      hobbies: selectedHobbies,
      favoriteActivity: selectedFavActivities,
    };

    try {
      if (profile?.department === "Shore_Staff") {
        await validationSchemaForShoreStaff.validate(values, { abortEarly: false });
      } else {
        await validationSchema.validate(values, { abortEarly: false });
      }

      if (!profile) throw new Error("User details not found");

      const body: Record<string, any> = {
        userId: profile.id || userId,
        countryCode: profile.countryCode,
        dob: date ? formatDateForValidation(date) : undefined,
        mobileNumber: profile.mobileNumber,
        email,
        fullName: name,
        relationshipStatus: maritalStatus,
        nationality,
        hobbies: selectedHobbies,
        ethnicity: race,
        gender,
        religion,
        experience: yearsOfExperience,
        bio: about,
        favoriteActivity: selectedFavActivities,
        isProfileCompleted: true,
      };

      for (const key in body) {
        const value = body[key];
        const isEmptyString = typeof value === "string" && value.trim() === "";
        const isEmptyArray = Array.isArray(value) && value.length === 0;

        if (isEmptyString || isEmptyArray || value === undefined || value === null) {
          delete body[key];
        }
      }

      setupdatingdetails(true);
      const response = await updateprofile(body);

      if (response.status === 200 || response.success) {
        showToast.success(t('success'), t('profileupdatedsuccessfully'));
        const fetchProfileDetails = async () => {
          let result = await viewProfile();
          if (result?.data) {
            const object = result.data
            for (const property in object) {
              dispatch(updateUserField({ key: property, value: object[property] }))
            }
          }
        }
        await fetchProfileDetails();
        router.back();
      } else {
        showToast.error(t('error'), response?.message);
      }
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'inner' in (error as any)) {
        const yupError = error as any;
        const errorMessages = yupError.inner
          ?.map((err: any) => err.message)
          .join('\n');

        showToast.error(t('oops') || 'Oops', errorMessages || t('error'));
      } else if (error instanceof Error) {
        showToast.error(t('oops') || 'Oops', t('failedtoupdateprofile') || 'Failed to update profile. Please try again');
        console.error('Error updating profile:', error);
      } else {
        showToast.error(t('oops') || 'Oops', t('failedtoupdateprofile') || 'Failed to update profile. Please try again');
      }
    } finally {
      setupdatingdetails(false);
    }
  };

  const renderSingleDropdown = (
    data: any[],
    value: string | null,
    onChange: (item: any) => void,
    placeholder: string,
    icon: React.ReactNode
  ) => (
    <View style={styles.dropdownContainer}>
      <Dropdown
        style={styles.dropdown}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        data={data}
        labelField="label"
        valueField="value"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        renderLeftIcon={() => <View style={styles.dropdownLeftIcon}>{icon}</View>}
        iconStyle={styles.dropdownIconStyle}
      />
    </View>
  );

  const renderMultiDropdown = (
    data: any[],
    selected: string[],
    setSelected: (items: string[]) => void,
    placeholder: string,
    icon: React.ReactNode,
    maxSelections = 3
  ) => {
    const toggleSelection = (item: any) => {
      if (selected.includes(item.value)) {
        setSelected(selected.filter((v) => v !== item.value));
      } else {
        if (selected.length >= maxSelections) {
          showToast.error(t('error'), `${t('maxThreeItems')}`);
          return;
        }
        setSelected([...selected, item.value]);
      }
    };

    const selectedLabels = data
      .filter((d) => selected.includes(d.value))
      .map((d) => d.label)
      .join(', ');

    return (
      <View>
        <View style={styles.dropdownContainer}>
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            data={data}
            labelField="label"
            valueField="value"
            placeholder={placeholder}
            value={null}
            onChange={toggleSelection}
            mode="default"
            renderLeftIcon={() => <View style={styles.dropdownLeftIcon}>{icon}</View>}
            iconStyle={styles.dropdownIconStyle}
            renderItem={(item) => (
              <View style={styles.multiItem}>
                <Text style={styles.multiItemText}>{item.label}</Text>
                {selected.includes(item.value) && <Text style={styles.checkmark}>✓</Text>}
              </View>
            )}
          />
        </View>

        {selected.length > 0 && (
          <View style={styles.wrappedChipsContainer}>
            {data
              .filter((d) => selected.includes(d.value))
              .map((item) => (
                <View key={item.value} style={styles.chip}>
                  <Text style={styles.chipText}>{item.label}</Text>
                  <TouchableOpacity
                    onPress={() => setSelected(selected.filter((v) => v !== item.value))}
                  >
                    <X size={16} color="#000" />
                  </TouchableOpacity>
                </View>
              ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.main}>
      <GlobalHeader title={t('editprofile')} />
      <KeyboardAwareScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        extraScrollHeight={Platform.OS === 'ios' ? 20 : 80}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inputContainer}>
          <User size={20} color="#666" style={styles.icon} />
          <TextInput
            style={styles.textInput}
            placeholder={t('enteryourname')}
            value={name}
            onChangeText={setName}
            autoFocus={false}
          />
        </View>
        <View style={styles.inputContainer} pointerEvents="none">
          <Mail size={20} color="#666" style={styles.icon} />
          <TextInput
            style={styles.textInput}
            placeholder={t('enteryouremail')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoFocus={false}
          />
        </View>
        <View style={styles.inputContainer} pointerEvents="none">
          <Phone size={20} color="#666" style={styles.icon} />
          <TextInput
            style={styles.textInput}
            placeholder={t('enteryourphonenumber')}
            value={phone}
            editable={false}
            autoFocus={false}
          />
        </View>
        <TouchableOpacity style={styles.inputContainer} onPress={() => setOpenDatePicker(true)}>
          <Calendar size={20} color="#666" style={styles.icon} />
          {date ? (
            <Text style={styles.dateText}>{formatDateForDisplay(date)}</Text>
          ) : (
            <Text style={styles.datePlaceholder}>{t('dateofbirth')}</Text>
          )}
        </TouchableOpacity>

        <DatePicker
          modal
          open={openDatePicker}
          date={date || new Date(new Date().setFullYear(new Date().getFullYear() - 18))}
          mode="date"
          maximumDate={new Date(new Date().setFullYear(new Date().getFullYear() - 18))}
          onConfirm={(selectedDate) => {
            setOpenDatePicker(false);
            setDate(selectedDate);
          }}
          onCancel={() => setOpenDatePicker(false)}
          title={t('dateofbirth')}
          confirmText="Done"
          cancelText="Cancel"
        />
        {renderSingleDropdown(
          GENDER,
          gender,
          (item) => setGender(item.value),
          t('gender'),
          <Mars size={20} color="#666" />
        )}
        {renderSingleDropdown(
          EXPERIENCE,
          yearsOfExperience,
          (item) => setYearsOfExperience(item.value),
          t('years_of_experience'),
          <HandHelpingIcon size={20} color="#666" />
        )}
        {renderSingleDropdown(
          ETHNICITY,
          race,
          (item) => setRace(item.value),
          t('selectethnicity'),
          <Heart size={20} color="#666" />
        )}
        {renderSingleDropdown(
          RELATIONSHIP,
          maritalStatus,
          (item) => setMaritalStatus(item.value),
          t('selectrelationshipstatus'),
          <HeartPulseIcon size={20} color="#666" />
        )}
        {renderSingleDropdown(
          RELIGION,
          religion,
          (item) => setReligion(item.value),
          t('religion'),
          <Blend size={20} color="#666" />
        )}
        {renderMultiDropdown(
          HOBBIES_OPTIONS,
          selectedHobbies,
          setSelectedHobbies,
          t('selectHobbies'),
          <Volleyball size={20} color="#666" />,
          3
        )}
        {renderMultiDropdown(
          FAV_ACTIVITY_OPTIONS,
          selectedFavActivities,
          setSelectedFavActivities,
          t('selectFavActivity'),
          <Activity size={20} color="#666" />,
          3
        )}
        <TextInput
          style={styles.multilineInput}
          placeholder={t('about_yourself')}
          value={about}
          onChangeText={setAbout}
          multiline
          maxLength={600}
          textAlignVertical="top"
          autoCorrect={false}
          autoComplete="off"
          spellCheck={false}
          autoFocus={false}
        />

        <Text style={styles.charCount}>{about.length}/600</Text>
        <TouchableOpacity
          style={styles.updateButton}
          onPress={handleUpdate}
          disabled={updatingdetails}
        >
          {updatingdetails ? (
            <CommonLoader color='#fff' />
          ) : (
            <Text style={styles.updateButtonText}>{t('update')}</Text>
          )}
        </TouchableOpacity>
      </KeyboardAwareScrollView>

      {loadingdetails && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <CommonLoader fullScreen />
        </View>
      )}
    </View>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#ededed',
  },
  container: {
    padding: 10,
    paddingBottom: Platform.OS === 'ios' ? 200 : 150,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    height: 50,
    backgroundColor: '#fff',
  },
  icon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#454545',
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: '#454545',
    paddingVertical: Platform.OS === 'ios' ? 0 : 2,
  },
  datePlaceholder: {
    flex: 1,
    fontSize: 16,
    color: '#B7B7B7',
    paddingVertical: Platform.OS === 'ios' ? 0 : 2,
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
    height: 50,
    justifyContent: 'center',
  },
  dropdown: {
    height: 50,
    paddingHorizontal: 15,
  },
  dropdownLeftIcon: {
    marginRight: 10,
  },
  dropdownIconStyle: {
    width: 20,
    height: 20,
  },
  placeholderStyle: {
    fontSize: 16,
    color: '#B7B7B7',
  },
  selectedTextStyle: {
    fontSize: 16,
    color: '#454545',
  },
  multiItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
  },
  multiItemText: {
    fontSize: 16,
    color: '#454545',
    flex: 1,
  },
  checkmark: {
    fontSize: 18,
    color: Colors.lightGreen || '#4CAF50',
    fontWeight: 'bold',
  },
  wrappedChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 5,
    marginTop: 5,
    paddingHorizontal: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightGreen || '#E8F5E9',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 0.5,
    borderColor: '#c1c1c1',
  },
  chipText: {
    color: '#000',
    marginRight: 6,
    fontSize: 13,
    fontWeight: '500',
  },
  multilineInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 15,
    marginBottom: 5,
    fontSize: 16,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
    height: 100,
    color: '#454545',
  },
  charCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginBottom: 15,
    marginTop: -5,
  },
  updateButton: {
    backgroundColor: '#000',
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    lineHeight: 22,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
});