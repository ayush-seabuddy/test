import { getsurveybyid, submitsurvey } from '@/src/apis/apiService'
import CommonLoader from '@/src/components/CommonLoader'
import GlobalHeader from '@/src/components/GlobalHeader'
import { showToast } from '@/src/components/GlobalToast'
import Colors from '@/src/utils/Colors'
import Slider from '@react-native-community/slider'
import * as ImageManipulator from 'expo-image-manipulator'
import * as ImagePicker from 'expo-image-picker'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import DatePicker from 'react-native-date-picker'

type SurveyQuestion = {
  id: string;
  question: string;
  answerType: string;
  answerOptions: string[];
  isRequired: boolean;
}

type Survey = {
  title: string;
  description: string;
  SurveyQuestionsDetails: SurveyQuestion[];
}

const SurveyScreen = () => {
  const { t } = useTranslation()
  const { surveyId } = useLocalSearchParams()
  const surveyIdStr = Array.isArray(surveyId) ? surveyId[0] : surveyId

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [datePickerMode, setDatePickerMode] = useState<'date' | 'time' | 'datetime'>('date')
  const [datePickerQuestion, setDatePickerQuestion] = useState<string | null>(null)
  const [dateValue, setDateValue] = useState<Date>(new Date())

  useEffect(() => {
    fetchSurveyQuestions()
  }, [])

  const fetchSurveyQuestions = async () => {
    if (!surveyIdStr) {
      showToast.error(t('oops'), t('invalidSurveyId'))
      setLoading(false)
      return
    }

    try {
      const apiResponse = await getsurveybyid({ surveyId: surveyIdStr })

      if (apiResponse.success && apiResponse.status === 200 && apiResponse.data) {
        setSurvey(apiResponse.data)
        initializeAnswers(apiResponse.data.SurveyQuestionsDetails || [])
      } else {
        showToast.error(t('oops'), apiResponse.message || t('failedToLoadSurvey'))
      }
    } catch (err) {
      console.error('Error fetching survey:', err)
      showToast.error(t('oops'), t('somethingwentwrong'))
    } finally {
      setLoading(false)
    }
  }

  const initializeAnswers = useCallback((questions: SurveyQuestion[]) => {
    const initial: Record<string, any> = {}
    questions.forEach((q) => {
      switch (q.answerType) {
        case 'multiselect':
          initial[q.id] = []
          break
        case 'yesno':
          initial[q.id] = null
          break
        case 'range1-5':
          initial[q.id] = 3
          break
        case 'range1-10':
          initial[q.id] = 5
          break
        default:
          initial[q.id] = ''
      }
    })
    setAnswers(initial)
  }, [])

  const updateAnswer = useCallback((questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }, [])

  const toggleMultiselect = useCallback((questionId: string, option: string) => {
    setAnswers(prev => {
      const arr = Array.isArray(prev[questionId]) ? [...prev[questionId]] : []
      const idx = arr.indexOf(option)
      if (idx >= 0) {
        arr.splice(idx, 1)
      } else {
        arr.push(option)
      }
      return { ...prev, [questionId]: arr }
    })
  }, [])

  const requestPermissions = async (type: 'library' | 'camera'): Promise<boolean> => {
    const request = type === 'library'
      ? ImagePicker.requestMediaLibraryPermissionsAsync
      : ImagePicker.requestCameraPermissionsAsync

    const { status } = await request();
    if (status !== 'granted') {
      showToast.error(t('permissionDenied'), t('photoLibraryPermissionRequired'));
      return false;
    }
    return true;
  }

  const selectImageForQuestion = async (questionId: string) => {
    // Request gallery permission before picking image
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showToast.error(t('permissionDenied'), t('photoLibraryPermissionRequired'));
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // deprecated usage preserved
      });

      if (result.canceled || !result.assets?.[0]?.uri) return;

      const uri = result.assets[0].uri;

      const compressed = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 800 } }],
        { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
      );

      updateAnswer(questionId, compressed.uri);
    } catch (err) {
      console.error('Error selecting image:', err);
      showToast.error(t('error'), t('imagePickFailed'));
    }
  }

  const formatDate = useCallback((dateStr: string): string => {
    try {
      const date = new Date(dateStr)
      const d = String(date.getDate()).padStart(2, '0')
      const m = String(date.getMonth() + 1).padStart(2, '0')
      const y = date.getFullYear()
      return `${d}/${m}/${y}`
    } catch (e) {
      return dateStr
    }
  }, [])

  const formatTime = useCallback((timeStr: string): string => {
    try {
      const [hours, minutes] = timeStr.split(':').map(Number)
      const period = hours >= 12 ? 'PM' : 'AM'
      const hour12 = hours % 12 || 12
      return `${hour12}:${String(minutes).padStart(2, '0')} ${period}`
    } catch (e) {
      return timeStr
    }
  }, [])

  const formatDateTime = useCallback((dateTimeStr: string): string => {
    try {
      const [datePart, timePart] = dateTimeStr.split(' ')
      return `${formatDate(datePart)} ${formatTime(timePart)}`
    } catch (e) {
      return dateTimeStr
    }
  }, [formatDate, formatTime])

  const onDateConfirm = useCallback((date: Date) => {
    if (!datePickerQuestion) return

    let formatted = ''
    if (datePickerMode === 'date') {
      const y = date.getFullYear()
      const m = String(date.getMonth() + 1).padStart(2, '0')
      const d = String(date.getDate()).padStart(2, '0')
      formatted = `${y}-${m}-${d}`
    } else if (datePickerMode === 'time') {
      const hh = String(date.getHours()).padStart(2, '0')
      const mm = String(date.getMinutes()).padStart(2, '0')
      formatted = `${hh}:${mm}`
    } else {
      const y = date.getFullYear()
      const m = String(date.getMonth() + 1).padStart(2, '0')
      const d = String(date.getDate()).padStart(2, '0')
      const hh = String(date.getHours()).padStart(2, '0')
      const mm = String(date.getMinutes()).padStart(2, '0')
      formatted = `${y}-${m}-${d} ${hh}:${mm}`
    }

    updateAnswer(datePickerQuestion, formatted)
    setDatePickerOpen(false)
    setDatePickerQuestion(null)
  }, [datePickerQuestion, datePickerMode, updateAnswer])

  const openDatePicker = useCallback((questionId: string, mode: 'date' | 'time' | 'datetime', currentValue: any) => {
    setDatePickerQuestion(questionId)
    setDatePickerMode(mode)
    try {
      const parsed = currentValue ? new Date(String(currentValue)) : new Date()
      setDateValue(parsed)
    } catch (e) {
      setDateValue(new Date())
    }
    setDatePickerOpen(true)
  }, [])

  const validateRequiredFields = useCallback((): string[] => {
    const missing: string[] = []
    if (!survey) return missing

    survey.SurveyQuestionsDetails.forEach((q: SurveyQuestion) => {
      if (q.isRequired) {
        const val = answers[q.id]
        const empty = val === '' || val === null || val === undefined ||
          (Array.isArray(val) && val.length === 0)
        if (empty) missing.push(q.question)
      }
    })
    return missing
  }, [survey, answers])

  const handleSubmit = async () => {
    if (!survey || submitting) return

    const missing = validateRequiredFields()
    if (missing.length > 0) {
      showToast.error(
        t('oops'),
        t('pleaseanswerall')
      )
      return
    }

    setSubmitting(true)

    try {
      const responseJson = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer
      }))

      const apiResponse = await submitsurvey({
        surveyId: surveyIdStr,
        responseJson
      })

      if (apiResponse.success && apiResponse.status === 200) {
        showToast.success(t('success'), t('surveysubmitted'))
        router.back()
      } else {
        showToast.error(t('oops'), apiResponse.message)
      }
    } catch (err) {
      console.error('Error submitting survey:', err)
      showToast.error(t('oops'), t('somethingwentwrong'))
    } finally {
      setSubmitting(false)
    }
  }

  const renderQuestion = useCallback((q: SurveyQuestion, index: number) => {
    const val = answers[q.id]

    return (
      <View key={q.id} style={styles.questionBox}>
        <Text style={styles.questionText}>
          {index + 1}. {q.question}{q.isRequired ? ' *' : ''}
        </Text>

        {q.answerType === 'text' && (
          <TextInput
            style={styles.input}
            value={val}
            onChangeText={t => updateAnswer(q.id, t)}
            placeholder={t('enterhere')}
            editable={!submitting}
          />
        )}

        {q.answerType === 'textarea' && (
          <TextInput
            style={[styles.input, styles.textArea]}
            value={val}
            onChangeText={t => updateAnswer(q.id, t)}
            placeholder={t('enterhere')}
            multiline
            editable={!submitting}
          />
        )}

        {q.answerType === 'number' && (
          <TextInput
            style={styles.input}
            value={val?.toString() ?? ''}
            onChangeText={t => updateAnswer(q.id, t.replace(/[^0-9]/g, ''))}
            placeholder={t('enterhere')}
            keyboardType='numeric'
            editable={!submitting}
          />
        )}

        {(q.answerType === 'radio' || q.answerType === 'dropdown') && (
          <View style={styles.optionsContainer}>
            {q.answerOptions.map(opt => (
              <TouchableOpacity
                key={opt}
                style={[styles.option, val === opt && styles.optionSelected]}
                onPress={() => updateAnswer(q.id, opt)}
                disabled={submitting}
              >
                <Text style={val === opt ? styles.optionTextSelected : styles.optionText}>
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {q.answerType === 'multiselect' && (
          <View style={styles.optionsContainer}>
            {q.answerOptions.map(opt => {
              const selected = Array.isArray(val) && val.includes(opt)
              return (
                <TouchableOpacity
                  key={opt}
                  style={[styles.option, selected && styles.optionSelected]}
                  onPress={() => toggleMultiselect(q.id, opt)}
                  disabled={submitting}
                >
                  <Text style={selected ? styles.optionTextSelected : styles.optionText}>
                    {opt}{selected ? ' ✓' : ''}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        )}

        {q.answerType === 'yesno' && (
          <View style={styles.yesNoContainer}>
            <TouchableOpacity
              style={[styles.yesNoBtn, val === true && styles.optionSelected]}
              onPress={() => updateAnswer(q.id, true)}
              disabled={submitting}
            >
              <Text style={val === true ? styles.optionTextSelected : styles.optionText}>
                Yes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.yesNoBtn, val === false && styles.optionSelected]}
              onPress={() => updateAnswer(q.id, false)}
              disabled={submitting}
            >
              <Text style={val === false ? styles.optionTextSelected : styles.optionText}>
                No
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {q.answerType === 'file' && (
          <View style={styles.fileContainer}>
            <TouchableOpacity
              style={styles.fileBtn}
              onPress={() => selectImageForQuestion(q.id)}
              disabled={submitting}
            >
              <Text style={styles.fileBtnText}>{t('choosefromgallery')}</Text>
            </TouchableOpacity>
            {val ? (
              <Image
                source={{ uri: String(val) }}
                style={styles.filePreview}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.smallText}>{t('noFileChosen')}</Text>
            )}
          </View>
        )}

        {q.answerType === 'range1-5' && (
          <View>
            <Slider
              minimumValue={1}
              maximumValue={5}
              step={1}
              value={Number(val) || 3}
              minimumTrackTintColor={Colors.lightGreen}
              thumbTintColor={Colors.lightGreen}
              maximumTrackTintColor="#ddd"
              onValueChange={v => updateAnswer(q.id, Math.round(v))}
              style={styles.slider}
              disabled={submitting}
            />
            <View style={styles.rangeLabelsContainer}>
              {[1, 2, 3, 4, 5].map(num => (
                <Text key={num} style={styles.rangeLabel}>{num}</Text>
              ))}
            </View>
          </View>
        )}

        {q.answerType === 'range1-10' && (
          <View>
            <Slider
              minimumValue={1}
              maximumValue={10}
              step={1}
              value={Number(val) || 5}
              thumbTintColor={Colors.lightGreen}
              minimumTrackTintColor={Colors.lightGreen}
              maximumTrackTintColor="#ddd"
              onValueChange={v => updateAnswer(q.id, Math.round(v))}
              style={styles.slider}
              disabled={submitting}
            />
            <View style={styles.rangeLabelsContainer}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <Text key={num} style={styles.rangeLabel}>{num}</Text>
              ))}
            </View>
          </View>
        )}

        {(q.answerType === 'date' || q.answerType === 'time' || q.answerType === 'datetime') && (
          <TouchableOpacity
            style={[styles.input, styles.dateInput]}
            onPress={() => openDatePicker(
              q.id,
              q.answerType === 'datetime' ? 'datetime' : (q.answerType === 'time' ? 'time' : 'date'),
              val
            )}
            disabled={submitting}
          >
            <Text style={val ? styles.dateText : styles.datePlaceholder}>
              {val ? (
                q.answerType === 'date' ? formatDate(String(val)) :
                  q.answerType === 'time' ? formatTime(String(val)) :
                    formatDateTime(String(val))
              ) : (
                q.answerType === 'date' ? 'DD/MM/YYYY' :
                  q.answerType === 'time' ? 'HH:MM AM/PM' :
                    'DD/MM/YYYY HH:MM AM/PM'
              )}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    )
  }, [answers, submitting, t, updateAnswer, toggleMultiselect, selectImageForQuestion,
    openDatePicker, formatDate, formatTime, formatDateTime])

  const questions = useMemo(() =>
    survey?.SurveyQuestionsDetails || [],
    [survey]
  )

  if (loading) {
    return (
      <View style={styles.main}>
        <GlobalHeader title={t('surveyHeader')} />
        <View style={styles.loaderContainer}>
          <CommonLoader fullScreen />
        </View>
      </View>
    )
  }

  if (!survey) {
    return (
      <View style={styles.main}>
        <GlobalHeader title={t('surveyHeader')} />
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>{t('noSurveyFound')}</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.main}>
      <GlobalHeader title={t('surveyHeader')} />

      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        removeClippedSubviews={true}
      >
        <Text style={styles.title}>{survey.title}</Text>
        <Text style={styles.desc}>{survey.description}</Text>

        {questions.map((q, i) => renderQuestion(q, i))}

        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <CommonLoader color="#fff" />
          ) : (
            <Text style={styles.submitText}>{t('submit')}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <DatePicker
        modal
        open={datePickerOpen}
        date={dateValue}
        mode={datePickerMode === 'datetime' ? 'datetime' : datePickerMode}
        onConfirm={onDateConfirm}
        onCancel={() => {
          setDatePickerOpen(false)
          setDatePickerQuestion(null)
        }}
      />
    </View>
  )
}

export default SurveyScreen

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#fff'
  },
  container: {
    padding: 20,
    paddingBottom: 48
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 8,
    paddingHorizontal: 10
  },
  desc: {
    color: '#444',
    marginBottom: 12,
    fontFamily: 'Poppins-Regular',
    paddingHorizontal: 10
  },
  questionBox: {
    marginBottom: 16,
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 8
  },
  questionText: {
    fontSize: 14,
    marginBottom: 8,
    fontFamily: 'Poppins-SemiBold'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    fontFamily: 'Poppins-Regular'
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12
  },
  dateInput: {
    justifyContent: 'center',
    paddingVertical: 10
  },
  dateText: {
    color: '#222',
    fontFamily: 'Poppins-Regular'
  },
  datePlaceholder: {
    color: '#999',
    fontFamily: 'Poppins-Regular'
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  option: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
    marginBottom: 8
  },
  optionSelected: {
    backgroundColor: Colors.lightGreen,
    borderColor: Colors.lightGreen
  },
  optionText: {
    color: '#222',
    fontFamily: 'Poppins-Regular',
    fontSize: 12
  },
  optionTextSelected: {
    color: '#fff',
    fontFamily: 'Poppins-Regular',
    fontSize: 12
  },
  yesNoContainer: {
    flexDirection: 'row',
    gap: 12
  },
  yesNoBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  fileBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#eee',
    borderRadius: 6
  },
  fileBtnText: {
    color: '#222',
    fontFamily: 'Poppins-Regular'
  },
  smallText: {
    color: '#666',
    fontFamily: 'Poppins-Regular',
    fontSize: 12
  },
  filePreview: {
    width: 60,
    height: 60,
    borderRadius: 6
  },
  slider: {
    height: 40
  },
  rangeLabelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -8,
    paddingHorizontal: 20
  },
  rangeLabel: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Poppins-Regular'
  },
  submitBtn: {
    marginTop: 12,
    backgroundColor: Colors.darkGreen,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 50,
    justifyContent: 'center'
  },
  submitBtnDisabled: {
    opacity: 0.6
  },
  submitText: {
    color: '#fff',
    fontWeight: '700',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16
  },
  placeholder: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  placeholderText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#666'
  }
})