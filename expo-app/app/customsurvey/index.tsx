import { StyleSheet, Text, TextInput, View, ScrollView, TouchableOpacity, FlatList } from 'react-native'
import React, { useState, useRef } from 'react'
import GlobalHeader from '@/src/components/GlobalHeader'
import { useTranslation } from 'react-i18next'
import { Image } from 'expo-image'
import { ImagesAssets } from '@/src/utils/ImageAssets'
import Colors from '@/src/utils/Colors'

// Dummy survey data
const DUMMY_SURVEY = {
  title: "Maritime Workforce Well-Being Assessment",
  description: "This survey aims to understand the well-being and working conditions of maritime workers. Your responses will help improve workplace policies and support systems.",
  questions: [
    {
      id: "1",
      question: "What is your name?",
      answerType: "text",
      isRequired: true,
      order: 1
    },
    {
      id: "2",
      question: "What is your current position on the vessel?",
      answerType: "dropdown",
      isRequired: true,
      order: 2,
      answerOptions: ["Captain", "First Officer", "Engineer", "Deck Hand", "Cook", "Other"]
    },
    {
      id: "3",
      question: "How many years of experience do you have in maritime work?",
      answerType: "number",
      isRequired: true,
      order: 3
    },
    {
      id: "4",
      question: "How would you rate your overall job satisfaction?",
      answerType: "range1-5",
      isRequired: true,
      order: 4
    },
    {
      id: "5",
      question: "Which of the following benefits are most important to you? (Select all that apply)",
      answerType: "multiselect",
      isRequired: true,
      order: 5,
      answerOptions: ["Health Insurance", "Paid Leave", "Training Programs", "Mental Health Support", "Retirement Benefits"]
    },
    {
      id: "6",
      question: "Do you feel adequately supported by your employer?",
      answerType: "yesno",
      isRequired: true,
      order: 6
    },
    {
      id: "7",
      question: "Please share any additional comments or suggestions for improving workplace conditions:",
      answerType: "textarea",
      isRequired: false,
      order: 7
    }
  ]
};

const SurveyScreen = () => {
  const { t } = useTranslation();
  const [answers, setAnswers] = useState<{ [key: string]: any }>({});
  const scrollViewRef = useRef<ScrollView>(null);
  const questionRefs = useRef<{ [key: string]: View | null }>({});

  // Calculate progress based on answered required questions
  const calculateProgress = () => {
    const requiredQuestions = DUMMY_SURVEY.questions.filter(q => q.isRequired);
    if (requiredQuestions.length === 0) return 100;

    const answeredQuestions = requiredQuestions.filter(question => {
      const answer = answers[question.id];
      if (answer === null || answer === undefined) return false;
      if (Array.isArray(answer) && answer.length === 0) return false;
      if (typeof answer === "string" && answer.trim() === "") return false;
      return true;
    });

    return Math.round((answeredQuestions.length / requiredQuestions.length) * 100);
  };

  // Handle answer changes
  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  // Handle checkbox toggle for multiselect
  const toggleCheckbox = (questionId: string, option: string) => {
    setAnswers((prev) => {
      const current = prev[questionId] || [];
      return {
        ...prev,
        [questionId]: current.includes(option)
          ? current.filter((o: string) => o !== option)
          : [...current, option],
      };
    });
  };

  // Handle submission
  const handleSubmit = () => {
    const requiredQuestions = DUMMY_SURVEY.questions.filter(q => q.isRequired);
    const unansweredQuestion = requiredQuestions.find(question => {
      const answer = answers[question.id];
      return (
        answer === null ||
        answer === undefined ||
        (Array.isArray(answer) && answer.length === 0) ||
        (typeof answer === "string" && answer.trim() === "")
      );
    });

    if (unansweredQuestion) {
      alert("Please answer all required questions.");
      return;
    }

    console.log("Survey submitted:", answers);
    alert("Survey submitted successfully!");
  };

  // Render question based on answerType
  const renderQuestion = (question: any) => {
    const { id, question: questionText, answerType, answerOptions, isRequired } = question;

    return (
      <View
        key={id}
        ref={(ref) => (questionRefs.current[id] = ref)}
        style={styles.questionCard}
      >
        <Text style={styles.questionText}>
          {questionText} {isRequired && <Text style={styles.requiredText}>*</Text>}
        </Text>

        {/* Text Input */}
        {answerType === "text" && (
          <TextInput
            style={styles.textInput}
            placeholder="Type your answer..."
            placeholderTextColor="#999"
            value={answers[id] || ""}
            onChangeText={(text) => handleAnswerChange(id, text)}
          />
        )}

        {/* Textarea */}
        {answerType === "textarea" && (
          <TextInput
            style={[styles.textInput, styles.textareaInput]}
            placeholder="Type your answer..."
            placeholderTextColor="#999"
            value={answers[id] || ""}
            onChangeText={(text) => handleAnswerChange(id, text)}
            multiline
            numberOfLines={4}
          />
        )}

        {/* Dropdown */}
        {answerType === "dropdown" && (
          <View style={styles.dropdownContainer}>
            {answerOptions?.map((option: string) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.dropdownOption,
                  answers[id] === option && styles.dropdownOptionSelected
                ]}
                onPress={() => handleAnswerChange(id, option)}
              >
                <Text style={[
                  styles.dropdownOptionText,
                  answers[id] === option && styles.dropdownOptionTextSelected
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Number Input */}
        {answerType === "number" && (
          <TextInput
            style={styles.textInput}
            placeholder="Enter a number..."
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={answers[id] || ""}
            onChangeText={(text) => handleAnswerChange(id, text)}
          />
        )}

        {/* Range Slider */}
        {answerType === "range1-5" && (
          <View style={styles.rangeContainer}>
            <View style={styles.rangeOptions}>
              {[1, 2, 3, 4, 5].map((value) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.rangeOption,
                    answers[id] === value && styles.rangeOptionSelected
                  ]}
                  onPress={() => handleAnswerChange(id, value)}
                >
                  <Text style={[
                    styles.rangeOptionText,
                    answers[id] === value && styles.rangeOptionTextSelected
                  ]}>
                    {value}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.rangeLabelContainer}>
              <Text style={styles.rangeLabelText}>Very Dissatisfied</Text>
              <Text style={styles.rangeLabelText}>Very Satisfied</Text>
            </View>
          </View>
        )}

        {/* Multiselect */}
        {answerType === "multiselect" && (
          <View style={styles.multiselectContainer}>
            {answerOptions?.map((option: string) => {
              const selected = (answers[id] || []).includes(option);
              return (
                <TouchableOpacity
                  key={option}
                  style={styles.optionRow}
                  onPress={() => toggleCheckbox(id, option)}
                >
                  <View style={[
                    styles.checkbox,
                    selected && styles.checkboxSelected
                  ]}>
                    {selected && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.optionText}>{option}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Yes/No */}
        {answerType === "yesno" && (
          <View style={styles.yesNoContainer}>
            {["Yes", "No"].map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.optionRow}
                onPress={() => handleAnswerChange(id, option)}
              >
                <View style={styles.radioOuter}>
                  {answers[id] === option && (
                    <View style={styles.radioInner} />
                  )}
                </View>
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.main}>
      <GlobalHeader title={t('surveyHeader')} />
      
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.headerView}>
          <Image source={ImagesAssets.SurveyImage} style={styles.surveyImage} />
          <View style={styles.headerTextContainer}>
            <Text style={styles.surveyTitle}>{DUMMY_SURVEY.title}</Text>
            <Text style={styles.surveyDescription}>{DUMMY_SURVEY.description}</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${calculateProgress()}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{calculateProgress()}% Complete</Text>
        </View>

        {/* Questions */}
        {DUMMY_SURVEY.questions.map((question) => renderQuestion(question))}

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>Submit Survey</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default SurveyScreen;

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  headerView: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  surveyImage: {
    height: 80,
    width: 80,
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  surveyTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: "#0F172A",
    marginBottom: 8,
  },
  surveyDescription: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: "#64748B",
    lineHeight: 20,
  },
  progressBarContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: "#E2E8F0",
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: Colors.lightGreen,
    borderRadius: 5,
  },
  progressText: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "#1E293B",
    textAlign: "center",
  },
  questionCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionText: {
    fontSize: 15,
    color: "#0F172A",
    fontFamily: "Poppins-Medium",
    marginBottom: 16,
    lineHeight: 22,
  },
  requiredText: {
    color: "#EF4444",
    fontSize: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#1E293B",
    backgroundColor: '#F8FAFC',
  },
  textareaInput: {
    height: 120,
    textAlignVertical: "top",
  },
  dropdownContainer: {
    gap: 10,
  },
  dropdownOption: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    padding: 14,
    backgroundColor: '#F8FAFC',
  },
  dropdownOptionSelected: {
    backgroundColor: Colors.lightGreen,
    borderColor: Colors.lightGreen,
  },
  dropdownOptionText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#334155",
  },
  dropdownOptionTextSelected: {
    color: '#fff',
    fontFamily: "Poppins-Medium",
  },
  rangeContainer: {
    gap: 12,
  },
  rangeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  rangeOption: {
    flex: 1,
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  rangeOptionSelected: {
    backgroundColor: Colors.lightGreen,
    borderColor: Colors.lightGreen,
  },
  rangeOptionText: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: "#334155",
  },
  rangeOptionTextSelected: {
    color: '#fff',
  },
  rangeLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rangeLabelText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#64748B",
  },
  multiselectContainer: {
    gap: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: Colors.lightGreen,
    borderRadius: 6,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  checkboxSelected: {
    backgroundColor: Colors.lightGreen,
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  optionText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#334155",
    flex: 1,
  },
  yesNoContainer: {
    flexDirection: 'row',
    gap: 24,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.lightGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: '#F8FAFC',
  },
  radioInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.lightGreen,
  },
  submitButton: {
    backgroundColor: Colors.lightGreen,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
  },
});