import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Platform,
  ActivityIndicator,
} from 'react-native';
import GlobalHeader from '@/src/components/GlobalHeader';
import { useTranslation } from 'react-i18next';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Heart,
  Activity,
  X,
  Mars,
  HandHelpingIcon,
  HeartPulseIcon,
  Volleyball,
  Blend,
} from 'lucide-react-native';
import DatePicker from 'react-native-date-picker';
import { Dropdown } from 'react-native-element-dropdown';
import { showToast } from '@/src/components/GlobalToast';
import { viewProfile, updateprofile } from '@/src/apis/apiService';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserField } from '@/src/redux/userDetailsSlice';
import { RootState } from '@/src/redux/store';
import * as Yup from "yup";
import Colors from '@/src/utils/Colors';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

// NOTE: validation schemas use translations and are created inside the component

const EditProfile = () => {
  const { t } = useTranslation();
  // Validation schemas (use translated messages via t)
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
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | undefined>(undefined);

  const formatDateForDisplay = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatDateForValidation = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('en-GB');
  };

  // Helper function to parse date from API format (DD/MM/YYYY)
  const parseAPIDate = (dateString: string): Date | null => {
    if (!dateString) return null;
    try {
      const parts = dateString.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed in JS
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

  // Translated Dropdown Data
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

  const RELATIONSHIP = [
    { label: t('relationshipOptions.single'), value: t('relationshipOptions.single') },
    { label: t('relationshipOptions.married'), value: t('relationshipOptions.married') },
    { label: t('relationshipOptions.divorced'), value: t('relationshipOptions.divorced') },
    { label: t('relationshipOptions.widowed'), value: t('relationshipOptions.widowed') },
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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
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

          // Parse date from API format (DD/MM/YYYY)
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
        setLoading(false);
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
      // Validate based on department
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

      // Remove empty fields
      for (const key in body) {
        const value = body[key];
        const isEmptyString = typeof value === "string" && value.trim() === "";
        const isEmptyArray = Array.isArray(value) && value.length === 0;

        if (isEmptyString || isEmptyArray || value === undefined || value === null) {
          delete body[key];
        }
      }

      setLoading(true);
      const response = await updateprofile(body);

      if (response.status === 200 || response.success) {
        showToast.success(t('success'), t('profileupdatedsuccessfully'));
        // Optional: Navigate back or refresh
        // router.back();
      } else {
        showToast.error(t('error'), response?.message);
      }
    } catch (error: unknown) {
      // Handle Yup validation errors specially to show translated messages
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
      setLoading(false);
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

    // Get the labels of selected items to display in text field
    const selectedLabels = data
      .filter((d) => selected.includes(d.value))
      .map((d) => d.label)
      .join(', ');

    return (
      <View>
        {/* Dropdown for selection */}
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

        {/* Wrapped chips container - NO horizontal scrolling */}
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
        {/* Name */}
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

        {/* Email */}
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

        {/* Phone (Read-only) */}
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

        {/* Date of Birth - Enhanced with proper placeholder handling */}
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

        {/* Gender */}
        {renderSingleDropdown(
          GENDER,
          gender,
          (item) => setGender(item.value),
          t('gender'),
          <Mars size={20} color="#666" />
        )}

        {/* Years of Experience */}
        {renderSingleDropdown(
          EXPERIENCE,
          yearsOfExperience,
          (item) => setYearsOfExperience(item.value),
          t('years_of_experience'),
          <HandHelpingIcon size={20} color="#666" />
        )}

        {/* Race/Ethnicity */}
        {renderSingleDropdown(
          ETHNICITY,
          race,
          (item) => setRace(item.value),
          t('race'),
          <Heart size={20} color="#666" />
        )}

        {/* Marital Status */}
        {renderSingleDropdown(
          RELATIONSHIP,
          maritalStatus,
          (item) => setMaritalStatus(item.value),
          t('marital_status'),
          <HeartPulseIcon size={20} color="#666" />
        )}

        {/* Religion */}
        {renderSingleDropdown(
          RELIGION,
          religion,
          (item) => setReligion(item.value),
          t('religion'),
          <Blend size={20} color="#666" />
        )}

        {/* Hobbies - Multi Select with Wrapped Layout */}
        {renderMultiDropdown(
          HOBBIES_OPTIONS,
          selectedHobbies,
          setSelectedHobbies,
          t('selectHobbies'),
          <Volleyball size={20} color="#666" />,
          3
        )}

        {/* Favorite Onboard Activity - Multi Select with Wrapped Layout */}
        {renderMultiDropdown(
          FAV_ACTIVITY_OPTIONS,
          selectedFavActivities,
          setSelectedFavActivities,
          t('selectFavActivity'),
          <Activity size={20} color="#666" />,
          3
        )}

        {/* About Yourself */}
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

        {/* Character count */}
        <Text style={styles.charCount}>{about.length}/600</Text>

        {/* Update Button */}
        <TouchableOpacity
          style={styles.updateButton}
          onPress={handleUpdate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <Text style={styles.updateButtonText}>{t('update')}</Text>
          )}
        </TouchableOpacity>
      </KeyboardAwareScrollView>

      {loading && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator size="large" color={Colors.lightGreen} />
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
    padding: 20,
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
  // Enhanced DOB styles
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