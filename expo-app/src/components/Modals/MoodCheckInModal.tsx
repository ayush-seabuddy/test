import { moodTracker } from "@/src/apis/apiService";
import CommonLoader from "@/src/components/CommonLoader";
import { showToast } from "@/src/components/GlobalToast";
import { ImagesAssets } from "@/src/utils/ImageAssets";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { X } from "lucide-react-native";
import moment from "moment-timezone";
import { memo, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Keyboard, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Modal, Portal } from "react-native-paper";

interface MoodCheckInModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  userName?: string;
}

const MOOD_CONFIG = {
  HAPPY: { color: "#B0DB0266", emoji: ImagesAssets.Emoji_1 },
  SAD: { color: "#DB8F0266", emoji: ImagesAssets.Emoji_3 },
  CALM: { color: "#B0DB0266", emoji: ImagesAssets.Emoji_2 },
  ANGRY: { color: "#E5424566", emoji: ImagesAssets.Emoji_4 },
  ANXIOUS: { color: "#69BEDC66", emoji: ImagesAssets.Emoji_5 },
} as const;

const MOOD_OPTIONS = [
  { emoji: ImagesAssets.Emoji_1, label: "Happy" },
  { emoji: ImagesAssets.Emoji_5, label: "Anxious" },
  { emoji: ImagesAssets.Emoji_3, label: "Sad" },
  { emoji: ImagesAssets.Emoji_4, label: "Angry" },
  { emoji: ImagesAssets.Emoji_2, label: "Calm" },
] as const;

const MoodModalStep1 = memo(
  ({
    onSelect,
    onClose,
    userName,
  }: {
    onSelect: (mood: string) => void;
    onClose: () => void;
    userName?: string;
  }) => {
    const { t } = useTranslation();

    const greeting = (() => {
      const hour = new Date().getHours();
      if (hour < 12) return "Good Morning";
      if (hour < 18) return "Good Afternoon";
      if (hour < 22) return "Good Evening";
      return "Hello";
    })();

    return (
      <View style={styles.modalStepContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
            <X size={24} color="#929292" />
          </TouchableOpacity>

          <View style={styles.modalGreetingContainer}>
            <Text style={styles.modalUserName}>
              {greeting}, <Text style={styles.modalUserName}>{userName || ""}!</Text>
            </Text>
            <Text style={styles.modalTitle}>{t("howareyoufeelingtoday")}</Text>
          </View>

          <View style={styles.moodSelectionGrid}>
            {MOOD_OPTIONS.map((mood) => (
              <TouchableOpacity
                key={mood.label}
                style={styles.moodOption}
                onPress={() => onSelect(mood.label)}
              >
                <Image source={mood.emoji} style={styles.moodOptionEmoji} />
                <Text style={styles.moodOptionLabel}>{mood.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  }
);

MoodModalStep1.displayName = "MoodModalStep1";


const MoodModalStep2 = memo(
  ({
    reason,
    setReason,
    onSubmit,
    loading,
    onClose,
  }: {
    reason: string;
    setReason: (text: string) => void;
    onSubmit: () => void;
    loading: boolean;
    onClose: () => void;
  }) => {
    const { t } = useTranslation();

    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={Keyboard.dismiss}
        style={styles.modalStep2Container}
      >
        <View style={styles.modalContentCenter}>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={styles.modalTitleCenter}>{t("wouldyouliketoshare")}</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#929292" />
            </TouchableOpacity>
          </View>
          <Text style={styles.modalSubtitleCenter}>{t("addnote_description")}</Text>

          <TextInput
            style={styles.modalTextInputCenter}
            placeholder={t("writeyourthoughts")}
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={styles.modalSubmitButtonCenter}
            onPress={onSubmit}
            disabled={loading}
          >
            {loading ? <CommonLoader color="#fff" /> : <Text style={styles.modalSubmitText}>{t("submit")}</Text>}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }
);

MoodModalStep2.displayName = "MoodModalStep2";

export const MoodCheckInModal = ({
  visible,
  onClose,
  onSuccess,
  userName,
}: MoodCheckInModalProps) => {
  const { t } = useTranslation();

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedMood, setSelectedMood] = useState("");
  const [reasonText, setReasonText] = useState("");
  const [loading, setLoading] = useState(false);

  const resetState = useCallback(() => {
    setStep(1);
    setSelectedMood("");
    setReasonText("");
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [resetState, onClose]);

  const handleMoodSelect = useCallback((mood: string) => {
    setSelectedMood(mood);
    setStep(2);
  }, []);

  const handleSubmit = useCallback(async () => {
    setLoading(true);

    const payload = {
      moodTrackers: [
        {
          mood: selectedMood.toUpperCase() as "HAPPY" | "SAD" | "CALM" | "ANGRY" | "ANXIOUS",
          details: reasonText.trim(),
          createdAt: new Date().toISOString(),
        },
      ],
    };

    try {
      const response = await moodTracker(payload);

      if (response.status === 200) {
        showToast.success(t("success"), t("moodnoteaddedsuccessfully"));

        // Update local storage flag
        const today = moment().format("YYYY-MM-DD");
        const stored = await AsyncStorage.getItem("userDetails");
        if (stored) {
          const parsed = JSON.parse(stored);
          parsed.isMoodTracker = true;
          parsed.lastMoodDate = today;
          await AsyncStorage.setItem("userDetails", JSON.stringify(parsed));
        }

        onSuccess?.();
        handleClose();
      } else {
        showToast.error(t("oops"), response.data?.responseMessage || "Something went wrong");
      }
    } catch (error) {
      console.error("Mood submit failed:", error);
      showToast.error(t("error"), t("failedtosavemood"));
    } finally {
      setLoading(false);
    }
  }, [selectedMood, reasonText, onSuccess, handleClose, t]);

  return (
    <Portal>
      {visible && (
        <Pressable
          style={styles.backdrop}
          onPress={handleClose}
        />
      )}

      <Modal
        visible={visible}
        onDismiss={handleClose}
        contentContainerStyle={[
          styles.modalContainer,
          step === 2
            ? styles.modalContainerCenter
            : styles.modalContainerBottom,
        ]}
        dismissable
      >
        {step === 1 ? (
          <MoodModalStep1
            onSelect={handleMoodSelect}
            onClose={handleClose}
            userName={userName}
          />
        ) : (
          <MoodModalStep2
            reason={reasonText}
            setReason={setReasonText}
            onSubmit={handleSubmit}
            loading={loading}
            onClose={handleClose}
          />
        )}
      </Modal>
    </Portal>
  );


};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: "transparent",
  },

  modalContainerBottom: {
    backgroundColor: "white",
    marginHorizontal: 18,
    overflow: 'hidden',
    borderRadius: 20,
  },

  modalContainerCenter: {
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  modalStepContainer: {
    overflow: "hidden",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },

  modalStep2Container: {
    backgroundColor: "white",
    borderRadius: 16,
  },

  modalContent: {
    backgroundColor: "#FFFFFFCC",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },

  modalContentCenter: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 25,
    borderRadius: 16,
    width: "100%",
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalCloseButton: {
    position: "absolute",
    right: 20,
    top: 30,
    zIndex: 10,
    padding: 4,
  },

  modalGreetingContainer: {
    marginVertical: 10,
  },

  modalUserName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#262626",
    fontFamily: "Poppins-SemiBold",
  },

  modalTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#262626",
    fontFamily: "Poppins-Regular",
  },

  modalTitleCenter: {
    fontSize: 14,
    fontWeight: "600",
    color: "#262626",
    fontFamily: "Poppins-SemiBold",
    width: '90%',
    marginBottom: 8,
  },

  modalSubtitle: {
    fontSize: 12,
    marginTop: 5,
    color: "gray",
    width: "80%",
    fontFamily: "Poppins-Regular",
    marginBottom: 10,
  },

  modalSubtitleCenter: {
    fontSize: 12,
    color: "gray",
    fontFamily: "Poppins-Regular",
    marginBottom: 10,
  },

  moodSelectionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    marginVertical: 20,
  },

  moodOption: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },

  moodOptionEmoji: {
    height: 50,
    width: 50,
  },

  moodOptionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(52, 52, 52, 1)",
    fontFamily: "Poppins-SemiBold",
    marginTop: 6,
  },

  modalTextInput: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    height: 100,
    textAlignVertical: "top",
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    color: "#000000",
  },

  modalTextInputCenter: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    height: 80,
    textAlignVertical: "top",
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    color: "#000000",
    fontSize: 14,
    fontFamily: 'Poppins-Regular'
  },

  modalSubmitButton: {
    backgroundColor: "#02130B",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },

  modalSubmitButtonCenter: {
    backgroundColor: "#02130B",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },

  modalSubmitText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});