import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Switch,
  Modal,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  Dimensions,
} from "react-native";
import DatePicker from "react-native-date-picker";
import moment from "moment";
import {
  gethelplineformquestions,
  getsinglehelplineanswer,
  submithelplineanswer,
} from "@/src/apis/apiService";
import { showToast } from "@/src/components/GlobalToast";
import { useTranslation } from "react-i18next";
import { router, useLocalSearchParams } from "expo-router";
import GlobalHeader from "@/src/components/GlobalHeader";
import { ChevronLeft } from "lucide-react-native";
import Colors from "@/src/utils/Colors";
import CustomLottie from "@/src/components/CustomLottie";
import GlobalButton from "@/src/components/GlobalButton";
import { formatStatus } from "@/src/utils/helperFunctions";
import CommonLoader from "@/src/components/CommonLoader";
import { useNetwork } from "@/src/hooks/useNetworkStatusHook";
import EmptyComponent from "@/src/components/EmptyComponent";

interface Question {
  id: string;
  question: string;
  answerType: "Textfield" | "Textarea" | "Radio" | "Date" | "Time" | "DateTime";
  answerOptions?: string[];
  isRequired: boolean;
}

const { height } = Dimensions.get("window");

const ANONYMOUS_DISABLED_IDS = [
  "2253ebb8-7178-48c6-a11c-9b6749aa5282", // Name
  "4e7e1d70-595e-47f2-89b0-48132c485e8b", // Rank
];

const HelplineFormScreen = () => {
  const { t } = useTranslation();
  const isOnline = useNetwork();
  const {
    helplineName,
    helplineId,
    complaintId,
    complaintStatus,
    complaintResponse,
  } = useLocalSearchParams<{
    helplineName: string;
    helplineId: string;
    complaintId?: string;
    complaintStatus?: string;
    complaintResponse?: string;
  }>();

  const isViewMode = !!complaintId;
  const ensureOnline = () => {
    if (!isOnline) {
      showToast.error(t("nointernetconnection"), t("pleasecheckinternet"));
      return false;
    }
    return true;
  };
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);

  const [openPickerFor, setOpenPickerFor] = useState<string | null>(null);
  const [pickerMode, setPickerMode] = useState<"date" | "time" | "datetime">(
    "date",
  );
  const [tempDate, setTempDate] = useState<Date>(new Date());

  const [isModalVisible, setIsModalVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isViewMode) {
        setIsModalVisible(true);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [isViewMode]);

  const fetchQuestions = async () => {
    if (!ensureOnline()) return;
    setLoading(true);
    try {
      const res = await gethelplineformquestions();
      if (res.success && res.status === 200) {
        setQuestions(res.data || []);
      } else {
        showToast.error(t("oops"), res.message || "Failed to load form");
      }
    } catch (err) {
      console.log("Error", err);
      showToast.error(t("oops"), t("somethingwentwrong"));
    } finally {
      setLoading(false);
    }
  };

  const fetchhelplineanswers = async () => {
    if (!complaintId) return;
    if (!ensureOnline()) return;
    setLoading(true);
    try {
      const res = await getsinglehelplineanswer({
        helplineFormId: complaintId,
      });
      if (res.success && res.status === 200) {
        const answers = res.data?.helplineAnswers || [];

        const prefilled: Record<string, string> = {};
        answers.forEach((item: any) => {
          const qid = item.helplineQuestion.id;
          prefilled[qid] = item.answer;
        });

        setResponses(prefilled);

        // Auto-detect if user submitted anonymously
        const hasAnonymousName = answers.some(
          (a: any) =>
            a.helplineQuestion.id === ANONYMOUS_DISABLED_IDS[0] &&
            a.answer === "Anonymous",
        );
        setIsAnonymous(hasAnonymousName);
      } else {
        showToast.error(t("oops"), res.message || "Failed to load answers");
      }
    } catch (err: any) {
      console.error("Fetch answers error:", err);
      showToast.error(t("oops"), t("somethingwentwrong"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
    if (complaintId) {
      fetchhelplineanswers();
    }
  }, [complaintId]);

  const handleAnonymousToggle = () => {
    if (isViewMode) return;

    setIsAnonymous((prev) => {
      const newVal = !prev;
      const updated = { ...responses };

      ANONYMOUS_DISABLED_IDS.forEach((id) => {
        const questionExists = questions.some((q) => q.id === id);
        if (!questionExists) return;

        if (newVal) {
          updated[id] = "Anonymous";
        } else {
          delete updated[id];
        }
      });

      setResponses(updated);
      return newVal;
    });
  };

  const isFieldDisabled = (questionId: string) => {
    return (
      isViewMode || (isAnonymous && ANONYMOUS_DISABLED_IDS.includes(questionId))
    );
  };

  const openDatePicker = (id: string, mode: "date" | "time" | "datetime") => {
    if (isFieldDisabled(id)) return;

    const existing = responses[id];
    let initialDate = new Date();

    if (existing && existing !== "Anonymous") {
      if (mode === "time") {
        const [h, m] = existing.split(":");
        const now = new Date();
        now.setHours(parseInt(h || "0"), parseInt(m || "0"), 0, 0);
        initialDate = now;
      } else {
        const parsed = moment(
          existing,
          ["DD/MMM/YYYY", "DD/MMM/YYYY, hh:mm A"],
          true,
        );
        initialDate = parsed.isValid() ? parsed.toDate() : new Date();
      }
    }

    setTempDate(initialDate);
    setPickerMode(mode);
    setOpenPickerFor(id);
  };

  const handleInputChange = (id: string, value: string) => {
    if (isFieldDisabled(id)) return;
    setResponses((prev) => ({ ...prev, [id]: value }));
  };

  const isFormValid = () => {
    return questions.every((q) => {
      if (isFieldDisabled(q.id)) return true;
      const answer = responses[q.id];
      return answer && answer.trim() !== "" && answer.trim() !== "Anonymous";
    });
  };

  const handleSubmit = async () => {
    if (isViewMode) return; // Prevent submit in view mode

    if (!isFormValid()) {
      showToast.error(t("incomplete"), t("pleaseanswerall"));
      return;
    }

    setSubmitting(true);

    try {
      const answers = questions.map((question) => ({
        helplineQuestionId: question.id,
        answer: isFieldDisabled(question.id)
          ? "Anonymous"
          : (responses[question.id] || "").trim(),
        createdAt: new Date().toISOString(),
      }));

      const payload = {
        helplineId: helplineId as string,
        answers,
      };

      const apiResponse = await submithelplineanswer(payload);

      if (apiResponse.success && apiResponse.status === 200) {
        showToast.success(
          t("success"),
          apiResponse.message || t("formSubmittedSuccessfully"),
        );
        setTimeout(() => router.back(), 1500);
      } else {
        showToast.error(t("oops"), apiResponse.message);
      }
    } catch (error: any) {
      console.error("Submit error:", error);
      showToast.error(t("oops"), t("somethingwentwrong"));
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = ({
    item,
    index,
  }: {
    item: Question;
    index: number;
  }) => {
    const isDisabled = isFieldDisabled(item.id);
    const value = responses[item.id] || "";

    return (
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>
          {index + 1}. {item.question}
          {item.isRequired && <Text style={styles.requiredAsterisk}> *</Text>}
        </Text>

        {/* Textfield */}
        {item.answerType === "Textfield" && (
          <TextInput
            style={[styles.input, isDisabled && styles.disabledInput]}
            value={value}
            placeholder={isDisabled ? "—" : "Enter your answer"}
            placeholderTextColor="#aaa"
            onChangeText={(text) =>
              !isDisabled && handleInputChange(item.id, text)
            }
            editable={!isDisabled}
          />
        )}

        {/* Textarea */}
        {item.answerType === "Textarea" && (
          <TextInput
            style={[styles.textarea, isDisabled && styles.disabledInput]}
            value={value}
            placeholder={isDisabled ? "—" : "Describe your concern"}
            placeholderTextColor="#aaa"
            onChangeText={(text) =>
              !isDisabled && handleInputChange(item.id, text)
            }
            multiline
            textAlignVertical="top"
            editable={!isDisabled}
          />
        )}

        {/* Radio */}
        {item.answerType === "Radio" && (
          <View style={styles.radioGroup}>
            {item.answerOptions?.map((option) => {
              const isSelected = value === option;

              return (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.radioOption,
                    isDisabled && styles.radioOptionDisabled,
                  ]}
                  onPress={() =>
                    !isDisabled && handleInputChange(item.id, option)
                  }
                  disabled={isDisabled}
                >
                  <View
                    style={[
                      styles.radioOuterCircle,
                      isSelected && styles.radioOuterCircleSelected,
                    ]}
                  >
                    {isSelected && <View style={styles.radioInnerCircle} />}
                  </View>
                  <Text
                    style={[
                      styles.radioOptionLabel,
                      isDisabled && styles.radioLabelDisabled,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {["Date", "Time", "DateTime"].includes(item.answerType) && (
          <TouchableOpacity
            disabled={isDisabled}
            onPress={() => {
              if (isDisabled) return;

              let mode: "date" | "time" | "datetime" = "date";
              if (item.answerType === "Time") mode = "time";
              if (item.answerType === "DateTime") mode = "datetime";

              openDatePicker(item.id, mode);
            }}
            style={[styles.pickerButton, isDisabled && styles.disabledInput]}
          >
            <Text
              style={[
                styles.pickerText,
                !value || value === "Anonymous"
                  ? { color: "#aaa" }
                  : { color: "#444" },
              ]}
            >
              {value && value !== "Anonymous" ? value : "Select date/time"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <GlobalHeader title={isViewMode ? t("helplineForm") : helplineName} />

      {/* Header Section */}
      {isViewMode ? (
        <View style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
          {/* Status – always visible */}
          <Text style={styles.boldText}>
            {t("status")} :{" "}
            <Text style={styles.toggleLabel}>
              {formatStatus(complaintStatus ?? "")}
            </Text>
          </Text>

          {/* Response – ONLY when status is CLOSED */}
          {complaintStatus === "CLOSED" && (
            <Text style={styles.boldText}>
              {t("reponse")} :{" "}
              <Text style={styles.toggleLabel}>{complaintResponse}</Text>
            </Text>
          )}
        </View>
      ) : (
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleLabel}>{t("submitAsAnonymous")}</Text>
          <Switch
            value={isAnonymous}
            onValueChange={handleAnonymousToggle}
            trackColor={{ false: "#767577", true: Colors.lightGreen }}
            thumbColor={isAnonymous ? "#fff" : "#f4f3f4"}
          />
        </View>
      )}

      {loading ? (
        <View style={styles.center}>
          <CommonLoader fullScreen />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <CustomLottie
            isBlurView={Platform.OS === "ios" ? true : false}
            componentHeight={
              complaintStatus === "CLOSED" ? height * 0.7 : height * 0.8
            }
          />

          {isOnline ? (
            <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <FlatList
                  ref={flatListRef}
                  data={questions}
                  renderItem={renderQuestion}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={{
                    padding: 16,
                    paddingTop: 45,
                    paddingBottom: isViewMode ? 40 : 120,
                  }}
                  showsVerticalScrollIndicator={false}
                />
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          ) : (
            <EmptyComponent text={t("nointernetconnection")} />
          )}

          {/* Hide Submit Button in View Mode OR when Offline */}
          {!isViewMode && isOnline && (
            <View style={styles.floatingButtonContainer}>
              <GlobalButton
                title={t("submit")}
                onPress={handleSubmit}
                disabled={!isFormValid() || submitting}
                loading={submitting}
                buttonStyle={{ width: "90%" }}
              />
            </View>
          )}
        </View>
      )}

      {/* Date/Time Picker */}
      <DatePicker
        modal
        open={openPickerFor !== null}
        date={tempDate}
        mode={pickerMode}
        maximumDate={new Date()}
        onConfirm={(selectedDate) => {
          if (!openPickerFor) return;

          let formatted = "";
          if (pickerMode === "date") {
            formatted = moment(selectedDate).format("DD/MMM/YYYY");
          } else if (pickerMode === "time") {
            formatted = selectedDate.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });
          } else {
            formatted = moment(selectedDate).format("DD/MMM/YYYY, hh:mm A");
          }

          setResponses((prev) => ({ ...prev, [openPickerFor]: formatted }));
          setOpenPickerFor(null);
        }}
        onCancel={() => setOpenPickerFor(null)}
      />

      {/* Disclaimer Modal */}
      <Modal transparent visible={isModalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              {t("helplineformdisclaimerdescription")}
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>{t("ok")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default HelplineFormScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "Poppins-Regular",
    paddingHorizontal: 10,
    lineHeight: 25,
  },
  questionContainer: {
    marginBottom: 10,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  boldText: {
    fontFamily: "Poppins-SemiBold",
    color: "#000",
  },
  questionText: {
    fontSize: 14,
    fontFamily: "WhyteInktrap-Bold",
    color: "#2D2D2D",
    marginBottom: 10,
    lineHeight: 22,
  },
  requiredAsterisk: { color: "#d32f2f", fontSize: 16, fontWeight: "bold" },
  input: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    fontSize: 12,
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    fontFamily: "Poppins-Regular",
  },
  textarea: {
    backgroundColor: "#fff",
    height: 130,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    fontSize: 12,
    fontFamily: "Poppins-Regular",
  },
  disabledInput: {
    backgroundColor: "#f8f8f8",
    color: "#666",
    borderColor: "#ddd",
  },
  pickerButton: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    justifyContent: "center",
  },
  pickerText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#444",
  },
  radioGroup: { marginTop: 8 },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  radioOptionDisabled: { opacity: 0.6 },
  radioOuterCircle: {
    height: 26,
    width: 26,
    borderRadius: 13,
    borderWidth: 2.5,
    borderColor: "#888",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  radioOuterCircleSelected: {
    borderColor: Colors.lightGreen || "#B0DB02",
  },
  radioInnerCircle: {
    height: 16,
    width: 16,
    borderRadius: 8,
    backgroundColor: Colors.lightGreen || "#B0DB02",
  },
  radioOptionLabel: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "#333",
    flex: 1,
  },
  radioLabelDisabled: { color: "#999" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  floatingButtonContainer: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    zIndex: 10,
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,
    width: "85%",
    alignItems: "center",
  },
  modalText: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
    fontFamily: "Poppins-Regular",
  },
  modalButton: {
    backgroundColor: "#02130B",
    width: "100%",
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  modalButtonText: { color: "#fff", fontWeight: "600" },
});
