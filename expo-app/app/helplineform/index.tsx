import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  Dimensions,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';
import { gethelplineformquestions, submithelplineanswer } from '@/src/apis/apiService';
import { showToast } from '@/src/components/GlobalToast';
import { useTranslation } from 'react-i18next';
import { router, useLocalSearchParams } from 'expo-router';
import GlobalHeader from '@/src/components/GlobalHeader';
import { ChevronLeft } from 'lucide-react-native';
import Colors from '@/src/utils/Colors';
import CustomLottie from '@/src/components/CustomLottie';
import GlobalButton from '@/src/components/GlobalButton';

interface Question {
  id: string;
  question: string;
  answerType: 'Textfield' | 'Textarea' | 'Radio' | 'Date' | 'Time' | 'DateTime';
  answerOptions?: string[];
  isRequired: boolean;
}

const { height } = Dimensions.get('window');

interface Answer {
  helplineQuestionId: string;
  answer: string;
}

// Only these two question IDs will be auto-filled as "Anonymous" and disabled
const ANONYMOUS_DISABLED_IDS = [
  '2253ebb8-7178-48c6-a11c-9b6749aa5282',
  '4e7e1d70-595e-47f2-89b0-48132c485e8b',
];

const HelplineFormScreen = () => {
  const { t } = useTranslation();
  const { helplineName, helplineId } = useLocalSearchParams<{
    helplineName: string;
    helplineId: string;
  }>();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);

  const [openPickerFor, setOpenPickerFor] = useState<string | null>(null);
  const [pickerMode, setPickerMode] = useState<'date' | 'time' | 'datetime'>('date');
  const [tempDate, setTempDate] = useState<Date>(new Date());

  const [isModalVisible, setIsModalVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsModalVisible(true), 600);
    return () => clearTimeout(timer);
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await gethelplineformquestions();
      if (res.success && res.status === 200) {
        setQuestions(res.data || []);
      } else {
        showToast.error(t('error'), res.message || 'Failed to load form');
      }
    } catch (err) {
      showToast.error(t('error'), t('somethingwentwrong'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleAnonymousToggle = () => {
    setIsAnonymous(prev => {
      const newVal = !prev;
      const updated = { ...responses };

      ANONYMOUS_DISABLED_IDS.forEach(id => {
        const questionExists = questions.some(q => q.id === id);
        if (!questionExists) return;

        if (newVal) {
          updated[id] = 'Anonymous';
        } else {
          delete updated[id];
        }
      });

      setResponses(updated);
      return newVal;
    });
  };

  const isFieldDisabled = (questionId: string) => {
    return isAnonymous && ANONYMOUS_DISABLED_IDS.includes(questionId);
  };

  const openDatePicker = (id: string, mode: 'date' | 'time' | 'datetime') => {
    if (isFieldDisabled(id)) return;

    const existing = responses[id];
    let initialDate = new Date();

    if (existing && existing !== 'Anonymous') {
      if (mode === 'time') {
        const [h, m] = existing.split(':');
        const now = new Date();
        now.setHours(parseInt(h || '0'), parseInt(m || '0'), 0, 0);
        initialDate = now;
      } else {
        const parsed = moment(existing, ['DD/MMM/YYYY', 'DD/MMM/YYYY, hh:mm A'], true);
        initialDate = parsed.isValid() ? parsed.toDate() : new Date();
      }
    }

    setTempDate(initialDate);
    setPickerMode(mode);
    setOpenPickerFor(id);
  };

  const handleInputChange = (id: string, value: string) => {
    if (isFieldDisabled(id)) return;
    setResponses(prev => ({ ...prev, [id]: value }));
  };

  const isFormValid = () => {
    return questions.every(q => {
      if (!q.isRequired) return true;
      if (isFieldDisabled(q.id)) return true;

      const answer = responses[q.id];
      return answer && answer.trim() !== '' && answer !== 'Anonymous';
    });
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      showToast.error(t('validationError'), t('pleaseFillAllRequiredFields'));
      return;
    }

    setSubmitting(true);

    try {
      const answers = questions.map(question => ({
        helplineQuestionId: question.id,
        answer: isFieldDisabled(question.id)
          ? 'Anonymous'
          : (responses[question.id] || '').trim(),
        createdAt: new Date().toISOString(),
      }));

      const payload = {
        helplineId: helplineId as string,
        answers,
      };

      const apiResponse = await submithelplineanswer(payload);

      if (apiResponse.success && apiResponse.status === 200) {
        showToast.success(t('success'), apiResponse.message || t('formSubmittedSuccessfully'));

        setTimeout(() => {
          router.back();
        }, 1500);
      } else {
        showToast.error(t('oops'), apiResponse.message);
      }
    } catch (error: any) {
      console.error('Submit error:', error);
      showToast.error(t('oops'), t('somethingwentwrong'));
    } finally {
      setSubmitting(false);
    }
  };
  const renderQuestion = ({ item, index }: { item: Question; index: number }) => {
    const isDisabled = isFieldDisabled(item.id);
    const value = isDisabled ? 'Anonymous' : (responses[item.id] || '');

    return (
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>
          {index + 1}. {item.question}
          {item.isRequired && <Text style={styles.requiredAsterisk}> *</Text>}
        </Text>

        {item.answerType === 'Textfield' && (
          <TextInput
            style={[styles.input, isDisabled && styles.disabledInput]}
            placeholder={isDisabled ? 'Anonymous' : 'Enter your answer'}
            value={value}
            onChangeText={(text) => handleInputChange(item.id, text)}
            editable={!isDisabled}
          />
        )}

        {item.answerType === 'Textarea' && (
          <TextInput
            style={[styles.textarea, isDisabled && styles.disabledInput]}
            placeholder={isDisabled ? 'Anonymous' : 'Describe your concern'}
            value={value}
            onChangeText={(text) => handleInputChange(item.id, text)}
            multiline
            textAlignVertical="top"
            editable={!isDisabled}
          />
        )}

        {item.answerType === 'Radio' && (
          <View style={styles.radioGroup}>
            {item.answerOptions?.map((option) => {
              const isSelected = value === option;

              return (
                <TouchableOpacity
                  key={option}
                  style={[styles.radioOption, isDisabled && styles.radioOptionDisabled]}
                  onPress={() => !isDisabled && handleInputChange(item.id, option)}
                  disabled={isDisabled}
                  activeOpacity={0.7}
                >
                  <View style={[styles.radioOuterCircle, isSelected && styles.radioOuterCircleSelected]}>
                    {isSelected && <View style={styles.radioInnerCircle} />}
                  </View>
                  <Text style={[styles.radioOptionLabel, isDisabled && styles.radioLabelDisabled]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {item.answerType === 'Date' && (
          <TouchableOpacity
            disabled={isDisabled}
            onPress={() => openDatePicker(item.id, 'date')}
            style={[styles.pickerButton, isDisabled && styles.disabledInput]}
          >
            <Text style={[styles.pickerText, !value && { color: '#aaa' }]}>
              {value || 'Select Date'}
            </Text>
          </TouchableOpacity>
        )}

        {item.answerType === 'Time' && (
          <TouchableOpacity
            disabled={isDisabled}
            onPress={() => openDatePicker(item.id, 'time')}
            style={[styles.pickerButton, isDisabled && styles.disabledInput]}
          >
            <Text style={[styles.pickerText, !value && { color: '#aaa' }]}>
              {value || 'Select Time'}
            </Text>
          </TouchableOpacity>
        )}

        {item.answerType === 'DateTime' && (
          <TouchableOpacity
            disabled={isDisabled}
            onPress={() => openDatePicker(item.id, 'datetime')}
            style={[styles.pickerButton, isDisabled && styles.disabledInput]}
          >
            <Text style={[styles.pickerText, !value && { color: '#aaa' }]}>
              {value || 'Select Date & Time'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <GlobalHeader
        title={helplineName}
        leftIcon={<ChevronLeft size={20} />}
        onLeftPress={() => router.back()}
      />

      <View style={styles.toggleContainer}>
        <Text style={styles.toggleLabel}>{t('submitAsAnonymous')}</Text>
        <Switch
          value={isAnonymous}
          onValueChange={handleAnonymousToggle}
          trackColor={{ false: '#767577', true: Colors.lightGreen }}
          thumbColor={isAnonymous ? '#fff' : '#f4f3f4'}
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.lightGreen} />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <CustomLottie isBlurView={false} componentHeight={height * 0.80} />

          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <FlatList
                ref={flatListRef}
                data={questions}
                renderItem={renderQuestion}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{
                  padding: 16,
                  paddingTop: 50,
                  paddingBottom: 100,
                }}
                showsVerticalScrollIndicator={false}
              />
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>

          <View style={styles.floatingButtonContainer}>
            <GlobalButton
              title={t('submit')}
              onPress={handleSubmit}
              disabled={!isFormValid() || submitting}
              loading={submitting}
              buttonStyle={{ width: '90%' }}
            />
          </View>
        </View>
      )}

      <DatePicker
        modal
        open={openPickerFor !== null}
        date={tempDate}
        mode={pickerMode}
        onConfirm={(selectedDate) => {
          if (!openPickerFor) return;

          let formatted = '';
          if (pickerMode === 'date') {
            formatted = moment(selectedDate).format('DD/MMM/YYYY');
          } else if (pickerMode === 'time') {
            formatted = selectedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          } else {
            formatted = moment(selectedDate).format('DD/MMM/YYYY, hh:mm A');
          }

          setResponses(prev => ({ ...prev, [openPickerFor]: formatted }));
          setOpenPickerFor(null);
        }}
        onCancel={() => setOpenPickerFor(null)}
      />

      <Modal transparent visible={isModalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
                           {t('helplineformdisclaimerdescription')}
            </Text>
            <TouchableOpacity style={styles.modalButton} onPress={() => setIsModalVisible(false)}>
              <Text style={styles.modalButtonText}>{t('ok')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default HelplineFormScreen;

// Styles remain exactly the same
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  toggleLabel: { fontSize: 14, fontWeight: '500', fontFamily: 'Poppins-Regular', paddingHorizontal: 10 },
  questionContainer: {
    marginBottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  questionText: {
    fontSize: 14,
    fontFamily: 'WhyteInktrap-Bold',
    color: '#2D2D2D',
    marginBottom: 10,
    lineHeight: 22,
  },
  requiredAsterisk: {
    color: '#d32f2f',
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    fontSize: 12,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    fontFamily: 'Poppins-Regular',
  },
  textarea: {
    backgroundColor: '#fff',
    height: 130,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    color: '#999',
    borderColor: '#ddd',
  },
  pickerButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
  },
  pickerText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#444',
  },
  radioGroup: {
    marginTop: 8,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  radioOptionDisabled: {
    opacity: 0.5,
  },
  radioOuterCircle: {
    height: 26,
    width: 26,
    borderRadius: 13,
    borderWidth: 2.5,
    borderColor: '#888',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  radioOuterCircleSelected: {
    borderColor: Colors.lightGreen || '#B0DB02',
  },
  radioInnerCircle: {
    height: 16,
    width: 16,
    borderRadius: 20,
    backgroundColor: Colors.lightGreen || '#B0DB02',
  },
  radioOptionLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#333',
    flex: 1,
  },
  radioLabelDisabled: {
    color: '#aaa',
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    zIndex: 10,
    alignItems: 'center',
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', padding: 24, borderRadius: 16, width: '85%', alignItems: 'center' },
  modalText: { fontSize: 14, textAlign: 'center', marginBottom: 20, lineHeight: 22 ,fontFamily:'Poppins-Regular'},
  modalButton: { backgroundColor: '#02130B', paddingHorizontal: 40, paddingVertical: 12, borderRadius: 8 },
  modalButtonText: { color: '#fff', fontWeight: '600' },
});