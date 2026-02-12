import {
  checkTodayMoodTracker,
  getAllMoodTracker,
  getMoodTrackerAnalysis,
  moodTracker,
} from "@/src/apis/apiService";
import CommonLoader from "@/src/components/CommonLoader";
import EmptyComponent from "@/src/components/EmptyComponent";
import GlobalHeader from "@/src/components/GlobalHeader";
import { showToast } from "@/src/components/GlobalToast";
import { MoodCheckInModal } from "@/src/components/Modals/MoodCheckInModal";
import { useNetwork } from "@/src/hooks/useNetworkStatusHook";
import {
  updateMoodTrackerLoading,
  updateMoodTrackerTodayFillData,
} from "@/src/redux/moodtracker";
import { RootState } from "@/src/redux/store";
import Colors from "@/src/utils/Colors";
import { height } from "@/src/utils/helperFunctions";
import { ImagesAssets } from "@/src/utils/ImageAssets";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { router } from "expo-router";
import { ChevronLeft, ChevronRight, X } from "lucide-react-native";
import moment from "moment-timezone";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

interface MoodTrackerItem {
  id: string;
  mood: "HAPPY" | "SAD" | "CALM" | "ANGRY" | "ANXIOUS";
  details?: string;
  createdAt: string;
}

interface DateItem {
  fullDate: string;
  date: number;
  month: string;
  day: string;
  isToday: boolean;
  isCurrentWeek: boolean;
}

interface MoodAverageItem {
  mood: string | null;
  progress: number;
  color: string;
  emoji: any;
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

const DateItemComponent = memo(
  ({
    item,
    moodData,
  }: {
    item: DateItem;
    moodData: MoodTrackerItem[] | null;
  }) => {
    const matchingMood = useMemo(() => {
      return moodData?.find(
        (m) =>
          moment(m.createdAt).format("DD") ===
          String(item.date).padStart(2, "0"),
      );
    }, [moodData, item.date]);

    return (
      <View style={styles.dateItem}>
        <Text style={[styles.dateText, { marginTop: 10 }]}>{item.day}</Text>
        <View
          style={[
            styles.todayCircle,
            { backgroundColor: item.isToday ? "#B0DB02" : "#fff" },
          ]}
        >
          <Text style={styles.dateText}>{item.date}</Text>
        </View>
        {matchingMood && (
          <Image
            style={styles.moodEmojiInCalendar}
            source={
              MOOD_CONFIG[matchingMood.mood]?.emoji ?? ImagesAssets.Emoji_1
            }
          />
        )}
      </View>
    );
  },
);

DateItemComponent.displayName = "DateItemComponent";

const MoodNoteCard = memo(({ item }: { item: MoodTrackerItem }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.moodNoteCard}>
      <BlurView style={StyleSheet.absoluteFill} intensity={80} tint="light" />
      <View style={styles.moodNoteHeader}>
        <View style={styles.moodNoteLeft}>
          <Image
            style={styles.moodNoteEmoji}
            source={MOOD_CONFIG[item.mood]?.emoji ?? ImagesAssets.Emoji_1}
          />
          <View>
            <Text style={styles.moodNoteTitle}>{item.mood}</Text>
            <Text style={styles.moodNoteDate}>
              {moment(item.createdAt).format("DD MMM YYYY")}
            </Text>
          </View>
        </View>
      </View>
      {item.details && (
        <View style={styles.moodNoteDetails}>
          <Text style={styles.moodNoteDetailsText}>
            {t("notemoodtracker")}
            {item.details}
          </Text>
        </View>
      )}
    </View>
  );
});

MoodNoteCard.displayName = "MoodNoteCard";

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

    const greeting = useMemo(() => {
      const hour = new Date().getHours();
      if (hour < 12) return t("goodmorning");
      if (hour < 18) return t("goodafternoon");
      if (hour < 22) return t("goodevening");
      return t("hello");
    }, [t]);
    return (
      <View style={styles.modalStepContainer}>
        <BlurView style={StyleSheet.absoluteFill} intensity={80} tint="light" />
        <View style={styles.modalContent}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={onClose}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <X size={28} color="#929292" />
          </TouchableOpacity>

          <View style={styles.modalGreetingContainer}>
            <Text style={styles.modalUserName}>
              {greeting},{" "}
              <Text style={styles.modalUserName}>{userName || ""}!</Text>
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
  },
);

MoodModalStep1.displayName = "TrackerMoodModalStep1";

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
        style={styles.modalStepContainer}
      >
        <BlurView style={StyleSheet.absoluteFill} intensity={80} tint="light" />
        <View style={styles.modalContent}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={onClose}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <X size={28} color="#929292" />
          </TouchableOpacity>

          <Text style={styles.modalTitle}>{t("wouldyouliketoshare")}</Text>
          <Text style={styles.modalSubtitle}>{t("addnote_description")}</Text>

          <TextInput
            style={styles.modalTextInput}
            placeholder={t("writeyourthoughts")}
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={styles.modalSubmitButton}
            onPress={onSubmit}
            disabled={loading}
          >
            {loading ? (
              <CommonLoader color="#fff" />
            ) : (
              <Text style={styles.modalSubmitText}>{t("submit")}</Text>
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  },
);

MoodModalStep2.displayName = "TrackerMoodModalStep2";

const MoodTracker: React.FC = () => {
  const { t } = useTranslation();
  const userDetails = useSelector((state: RootState) => state.userDetails);
  const isOnline = useNetwork();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [moodData, setMoodData] = useState<MoodTrackerItem[] | null>(null);
  const [lastFiveDays, setLastFiveDays] = useState<MoodTrackerItem[]>([]);
  const [monthlyAverage, setMonthlyAverage] = useState<MoodAverageItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedMood, setSelectedMood] = useState("");
  const [reasonText, setReasonText] = useState("");
  const [loading, setLoading] = useState(true); // ← initial loading = true
  const [isTodayChecked, setIsTodayChecked] = useState(false);

  const scrollRef = useRef<ScrollView>(null);

  const getFormattedDates = useCallback(
    (year: number, month: number): DateItem[] => {
      const dates: DateItem[] = [];
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const today = new Date();
      const todayMoment = moment(today);
      const currentWeek = todayMoment.isoWeek();

      for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(year, month, i);
        const dateMoment = moment(date);
        dates.push({
          fullDate: date.toDateString(),
          date: i,
          month: date.toLocaleString("default", { month: "short" }),
          day: date.toLocaleString("default", { weekday: "short" }),
          isToday:
            i === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear(),
          isCurrentWeek:
            dateMoment.isoWeek() === currentWeek &&
            dateMoment.year() === todayMoment.year(),
        });
      }
      return dates;
    },
    [],
  );

  const dates = useMemo(
    () => getFormattedDates(currentDate.getFullYear(), currentDate.getMonth()),
    [currentDate, getFormattedDates],
  );

  const fetchMoodHistory = useCallback(async () => {
    if (!isOnline) return;
    try {
      const res = await getAllMoodTracker({ page: 1, limit: 5 });
      if (res?.status === 200) {
        setLastFiveDays(res.data?.moodTrackerList ?? []);
      }
    } catch (error) {
      console.error("Mood history fetch failed:", error);
    }
  }, []);

  const fetchMonthlyData = useCallback(
    async (month: number, year: number) => {
      if (!isOnline) {
        setLoading(false);
        return;
      }
      try {
        const result = await getMoodTrackerAnalysis({ month, year });
        if (result.status === 200) {
          setMoodData(result.data?.monthlyMoodTrackers ?? null);

          const averages = result.data?.monthlyMoodAverage ?? {};
          const mapped = Object.entries(averages).map(([key, value]) => {
            const config = MOOD_CONFIG[key as keyof typeof MOOD_CONFIG];
            const progress = Number(value) / 100;
            return {
              mood: key,
              progress,
              color: config?.color ?? "#FFFFFF",
              emoji: config?.emoji ?? null,
            };
          });
          setMonthlyAverage(mapped);
          await fetchMoodHistory();
        }
      } catch (error) {
        console.error("Monthly mood data fetch failed:", error);
      } finally {
        setLoading(false);
      }
    },
    [fetchMoodHistory],
  );

  useEffect(() => {
    if (!isOnline) return;
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    fetchMonthlyData(month, year);
  }, [currentDate, fetchMonthlyData]);

  useEffect(() => {
    const checkToday = async () => {
      try {
        const stored = await AsyncStorage.getItem("userDetails");
        if (!stored) return;
        const data = JSON.parse(stored);
        const todayStr = moment().format("YYYY-MM-DD");
        setIsTodayChecked(data.lastMoodDate === todayStr && data.isMoodTracker);
      } catch (error) {
        console.log("Error", error);
      }
    };
    checkToday();
  }, []);

  const changeMonth = useCallback(
    (direction: -1 | 1) => {
      const newDate = new Date(currentDate);
      newDate.setMonth(currentDate.getMonth() + direction);

      const now = new Date();
      if (
        newDate.getFullYear() < now.getFullYear() ||
        (newDate.getFullYear() === now.getFullYear() &&
          newDate.getMonth() <= now.getMonth())
      ) {
        setCurrentDate(newDate);
      }
    },
    [currentDate],
  );

  const handleMoodSelect = useCallback((mood: string) => {
    setSelectedMood(mood);
    setStep(2);
  }, []);

  const handleSubmit = useCallback(async () => {
    setLoading(true);
    const payload = {
      moodTrackers: [
        {
          mood: selectedMood.toUpperCase() as
            | "HAPPY"
            | "SAD"
            | "CALM"
            | "ANGRY"
            | "ANXIOUS",
          details: reasonText.trim(),
          createdAt: new Date().toISOString(),
        },
      ],
    };

    try {
      const response = await moodTracker(payload);
      if (response.status === 200) {
        showToast.success(t("success"), t("moodnoteaddedsuccessfully"));

        const today = moment().format("YYYY-MM-DD");
        const stored = await AsyncStorage.getItem("userDetails");
        if (stored) {
          const parsed = JSON.parse(stored);
          parsed.isMoodTracker = true;
          parsed.lastMoodDate = today;
          await AsyncStorage.setItem("userDetails", JSON.stringify(parsed));
        }

        setIsTodayChecked(true);
        fetchMonthlyData(currentDate.getMonth() + 1, currentDate.getFullYear());
      } else {
        showToast.error(t("oops"), response.data?.responseMessage);
      }
    } catch (error) {
      console.error("Mood submit failed:", error);
    } finally {
      setLoading(false);
      setModalVisible(false);
      setStep(1);
      setSelectedMood("");
      setReasonText("");
    }
  }, [selectedMood, reasonText, currentDate, fetchMonthlyData, t]);

  const resetAndCloseModal = useCallback(() => {
    setModalVisible(false);
    setStep(1);
    setSelectedMood("");
    setReasonText("");
  }, []);

  const dispatch = useDispatch();
  const moodTrackerData = useSelector(
    (state: RootState) => state.moodTrackerData,
  );
  useEffect(() => {
    const checkTodayFill = async () => {
      try {
        dispatch(updateMoodTrackerLoading(true));
        const today = new Date();
        const day = String(today.getDate()).padStart(2, "0");
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const year = today.getFullYear();
        const date = `${day}-${month}-${year}`;

        const moodData = await checkTodayMoodTracker({ date });
        if (moodData.status == 200) {
          dispatch(updateMoodTrackerLoading(false));
          dispatch(updateMoodTrackerTodayFillData(moodData.data.isTodayFill));
        }
      } catch (error) {
        dispatch(updateMoodTrackerLoading(false));
      } finally {
        dispatch(updateMoodTrackerLoading(false));
      }
    };
    checkTodayFill();
  }, []);

  return (
    <View style={styles.mainContainer}>
      <GlobalHeader title={t("moodTracker")} />
      {!isOnline ? (
        <EmptyComponent text={t("nointernetconnection")} />
      ) : loading && monthlyAverage.length === 0 && !moodData ? (
        <View style={styles.container}>
          <CommonLoader fullScreen />
        </View>
      ) : (
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.calendarCard}>
            <View style={styles.calendarHeader}>
              <Text style={styles.calendarGreeting}>
                {t("hi")}, {userDetails?.fullName?.split(" ")?.[0] ?? ""}!
              </Text>
              <View style={styles.monthNavigation}>
                <TouchableOpacity onPress={() => changeMonth(-1)}>
                  <ChevronLeft size={22} color={Colors.darkGreen} />
                </TouchableOpacity>
                <Text style={styles.monthText}>
                  {currentDate.toLocaleString("default", { month: "short" })}{" "}
                  {currentDate.getFullYear()}
                </Text>
                <TouchableOpacity onPress={() => changeMonth(1)}>
                  <ChevronRight size={22} color={Colors.darkGreen} />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.datesScroll}
            >
              {dates.map((item) => (
                <DateItemComponent
                  key={item.fullDate}
                  item={item}
                  moodData={moodData}
                />
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[
                styles.checkInButton,
                (isTodayChecked || moodTrackerData.isTodayFill) &&
                  styles.checkInDisabled,
              ]}
              onPress={() =>
                isTodayChecked || moodTrackerData.isTodayFill
                  ? null
                  : setModalVisible(true)
              }
              disabled={isTodayChecked && !moodTrackerData.isTodayFill}
            >
              <Text style={styles.checkInText}>
                {isTodayChecked || moodTrackerData.isTodayFill
                  ? t("alreadycheckedintoday")
                  : t("checkintoday")}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.chartCard}>
            <BlurView
              style={StyleSheet.absoluteFill}
              intensity={60}
              tint="light"
            />
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>{t("monthlymoodchart")}</Text>
              <View style={styles.chartMonthButton}>
                <Text style={styles.chartMonthText}>
                  {currentDate.toLocaleString("default", { month: "short" })}{" "}
                  {currentDate.getFullYear()}
                </Text>
              </View>
            </View>

            <View style={styles.chartBars}>
              {monthlyAverage.map((item) => (
                <View key={item.mood ?? Math.random()} style={styles.barItem}>
                  <View style={styles.barContainer}>
                    <View
                      style={[
                        styles.barFilled,
                        {
                          flex: item.progress,
                          backgroundColor: item.color,
                        },
                      ]}
                    />
                    <View
                      style={[styles.barEmpty, { flex: 1 - item.progress }]}
                    />
                  </View>
                  <View style={styles.barLabel}>
                    {item.emoji && (
                      <Image source={item.emoji} style={styles.barEmoji} />
                    )}
                    <Text style={styles.barPercent}>
                      {Math.round(item.progress * 100)}%
                    </Text>
                  </View>
                  <Text style={styles.barMoodName}>{item.mood}</Text>
                </View>
              ))}
            </View>
          </View>

          {!!lastFiveDays.length && (
            <View style={styles.notesHeader}>
              <Text style={styles.notesTitle}>{t("moodnotes")}</Text>
              <TouchableOpacity
                onPress={() => router.push("/moodtrackerhistory")}
              >
                <Text style={styles.viewAllText}>{t("viewall")}</Text>
              </TouchableOpacity>
            </View>
          )}

          <FlatList
            data={lastFiveDays}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <MoodNoteCard item={item} />}
            contentContainerStyle={styles.notesList}
            scrollEnabled={false}
          />
        </ScrollView>
      )}

      <MoodCheckInModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={() => {
          setIsTodayChecked(true);
          fetchMonthlyData(
            currentDate.getMonth() + 1,
            currentDate.getFullYear(),
          );
        }}
        userName={userDetails?.fullName?.split(" ")?.[0]}
      />
    </View>
  );
};

export default MoodTracker;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  mainContainer: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { flexGrow: 1, minHeight: height, paddingBottom: 20 },

  calendarCard: {
    backgroundColor: "rgba(180, 180, 180, 0.6)",
    marginHorizontal: 10,
    marginTop: 15,
    borderRadius: 20,
    padding: 10,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 10,
    marginVertical: 10,
  },
  calendarGreeting: {
    color: "#262626",
    fontSize: 18,
    lineHeight: 20,
    fontFamily: "WhyteInktrap-Bold",
    textTransform: "capitalize",
  },
  monthNavigation: { flexDirection: "row", alignItems: "center" },
  monthText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "600",
    marginHorizontal: 10,
  },
  datesScroll: { marginHorizontal: 10, marginTop: 10 },
  dateItem: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    marginRight: 10,
    borderRadius: 30,
    width: 45,
    alignItems: "center",
  },
  dateText: { fontSize: 12, color: "#000", fontWeight: "500" },
  todayCircle: {
    height: 25,
    width: 25,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  moodEmojiInCalendar: { height: 30, width: 30, marginBottom: 10 },

  checkInButton: {
    backgroundColor: "#000",
    height: 50,
    marginHorizontal: 10,
    marginTop: 10,
    marginBottom: 15,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  checkInDisabled: { backgroundColor: "#777" },
  checkInText: { color: "#fff", fontSize: 14, fontFamily: "Poppins-SemiBold" },

  chartCard: {
    backgroundColor: "rgba(180, 180, 180, 0.9)",
    marginHorizontal: 10,
    marginVertical: 15,
    borderRadius: 20,
    padding: 20,
    overflow: "hidden",
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    lineHeight: 20,
    color: "#262626",
    fontFamily: "WhyteInktrap-Bold",
  },
  chartMonthButton: {
    backgroundColor: "#B0DB02",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  chartMonthText: { color: "#000", fontSize: 10, fontWeight: "600" },
  chartBars: { flexDirection: "row", justifyContent: "space-around" },
  barItem: { alignItems: "center" },
  barContainer: {
    width: 20,
    height: 150,
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    overflow: "hidden",
    flexDirection: "column-reverse",
  },
  barFilled: { width: "100%" },
  barEmpty: { backgroundColor: "#F0F0F0CC", width: "100%" },
  barLabel: { alignItems: "center", marginTop: 5 },
  barEmoji: { height: 26, width: 26, marginTop: -25 },
  barPercent: { fontSize: 14, fontWeight: "bold", color: "#161616" },
  barMoodName: { fontSize: 10, color: "#000" },

  notesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 12,
    marginVertical: 10,
  },
  notesTitle: {
    fontSize: 16,
    lineHeight: 20,
    color: "#000",
    fontFamily: "WhyteInktrap-Bold",
  },
  viewAllText: { fontSize: 12, color: "#000" },
  notesList: { paddingHorizontal: 14 },

  moodNoteCard: {
    backgroundColor: "rgba(180, 180, 180, 0.9)",
    padding: 15,
    borderRadius: 12,
    marginVertical: 5,
    overflow: "hidden",
  },
  moodNoteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  moodNoteLeft: { flexDirection: "row", alignItems: "center" },
  moodNoteEmoji: {
    width: 50,
    height: 50,
    resizeMode: "contain",
    marginRight: 10,
  },
  moodNoteTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#262626",
    fontFamily: "WhyteInktrap-Bold",
    lineHeight: 28,
  },
  moodNoteDate: {
    fontSize: 10,
    color: "#636363",
    fontFamily: "Poppins-Regular",
  },
  moodNoteDetails: { paddingHorizontal: 6, marginTop: 10 },
  moodNoteDetailsText: {
    fontSize: 14,
    color: "black",
    fontFamily: "Poppins-Regular",
  },

  modalContainer: {
    backgroundColor: "white",
    width: "100%",
    position: "absolute",
    bottom: Platform.OS === "ios" ? -40 : -20,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  modalStepContainer: {
    overflow: "hidden",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  modalContent: {
    backgroundColor: "#FFFFFFCC",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  modalCloseButton: {
    position: "absolute",
    right: 20,
    top: 35,
    zIndex: 10,
    padding: 4,
  },
  modalGreetingContainer: { marginVertical: 15 },
  modalUserName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#262626",
    fontFamily: "Poppins-SemiBold",
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#262626",
    fontFamily: "Poppins-Regular",
  },
  modalSubtitle: {
    fontSize: 12,
    marginTop: 5,
    color: "gray",
    width: "80%",
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
  moodOptionEmoji: { height: 50, width: 50 },
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
  modalSubmitButton: {
    backgroundColor: "#02130B",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  modalSubmitText: { color: "white", fontSize: 16, fontWeight: "500" },
});
