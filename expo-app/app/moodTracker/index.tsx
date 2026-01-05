
import { getAllMoodTracker, getMoodTrackerAnalysis, moodTracker } from "@/src/apis/apiService";
import CustomLottie from "@/src/components/CustomLottie";
import GlobalHeader from "@/src/components/GlobalHeader";
import { RootState } from "@/src/redux/store";
import Colors from "@/src/utils/Colors";
import { height, width } from "@/src/utils/helperFunctions";
import { ImagesAssets } from "@/src/utils/ImageAssets";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { router } from "expo-router";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import moment from "moment-timezone";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ActivityIndicator, Modal } from "react-native-paper";
import Toast from "react-native-toast-message";
import { useSelector } from "react-redux";

interface MoodTrackerItem {
  id: string;
  mood: "HAPPY" | "SAD" | "CALM" | "ANGRY" | "ANXIOUS";
  details?: string;
  createdAt: string;
  feeling?: string;
  reason?: string;
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

const MoodTracker: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [moodData, setMoodData] = useState<MoodTrackerItem[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastFiveDaysMoodTracker, setLastFiveDaysMoodTracker] = useState<MoodTrackerItem[]>([]);
  const [monthlyMoodAverage, setMonthlyMoodAverage] = useState<MoodAverageItem[]>([]);
  const [visible, setVisible] = useState<boolean>(false);
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const [isTodayData, setIsTodayData] = useState<boolean>(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [ReasonText, setReasonText] = useState<string>("");

  const userDetails = useSelector((state: RootState) => state.userDetails);
  const scrollViewRef = useRef<ScrollView>(null);

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  const fetchMoodHistory = useCallback(async () => {
    try {
      const res = await getAllMoodTracker({ page: 1, limit: 5 });
      if (res?.status === 200 && res?.data) {
        setLastFiveDaysMoodTracker(res.data.moodTrackerList || []);
      }
    } catch (error) {
      console.error("Error fetching mood history:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const changeMonth = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    if (
      newDate.getFullYear() < currentYear ||
      (newDate.getFullYear() === currentYear && newDate.getMonth() <= currentMonth)
    ) {
      setCurrentDate(newDate);
    }
  };

  const today = new Date();

  const getFormattedDates = (year: number, month: number): DateItem[] => {
    const dates: DateItem[] = [];
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayMoment = moment(today);
    const currentWeek = todayMoment.isoWeek();

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dateMoment = moment(date);
      const isCurrentWeek =
        dateMoment.isoWeek() === currentWeek && dateMoment.year() === todayMoment.year();

      dates.push({
        fullDate: date.toDateString(),
        date: date.getDate(),
        month: date.toLocaleString("default", { month: "short" }),
        day: date.toLocaleString("default", { weekday: "short" }),
        isToday:
          date.getDate() === today.getDate() &&
          date.getMonth() === today.getMonth() &&
          date.getFullYear() === today.getFullYear(),
        isCurrentWeek,
      });
    }
    return dates;
  };

  const dates = getFormattedDates(currentDate.getFullYear(), currentDate.getMonth());

  const DateWiseList: React.FC<{ item: DateItem; moodData: MoodTrackerItem[] | null }> = ({
    item,
    moodData,
  }) => {
    let matchingMood: MoodTrackerItem | undefined;
    if (moodData?.length) {
      moodData.forEach((element) => {
        const formattedDate = moment(element.createdAt).format("DD");
        if (String(item.date).padStart(2, "0") === formattedDate) {
          matchingMood = element;
        }
      });
    }

    return (
      <View style={styles.dateItem}>
        <Text style={[styles.dateText, { marginTop: 10 }]}>{item.day}</Text>
        <View style={[styles.todayCircle, { backgroundColor: item.isToday ? "#B0DB02" : "#fff" }]}>
          <Text style={styles.dateText}>{item.date}</Text>
        </View>
        {matchingMood && (
          <Image style={styles.moodEmojiInCalendar} source={getMoodEmoji(matchingMood.mood)} />
        )}
      </View>
    );
  };

  const mapMoodData = (monthlyMoodAverage: Record<string, string>) => {
    const moodMap = {
      HAPPY: { mood: "HAPPY", color: "#B0DB0266", emoji: ImagesAssets.Emoji_1 },
      SAD: { mood: "SAD", color: "#DB8F0266", emoji: ImagesAssets.Emoji_3 },
      CALM: { mood: "CALM", color: "#B0DB0266", emoji: ImagesAssets.Emoji_2 },
      ANGRY: { mood: "ANGRY", color: "#E5424566", emoji: ImagesAssets.Emoji_4 },
      ANXIOUS: { mood: "ANXIOUS", color: "#69BEDC66", emoji: ImagesAssets.Emoji_5 },
    };

    const mapped = Object.keys(monthlyMoodAverage).map((key) => {
      const progress = parseFloat(monthlyMoodAverage[key]);
      const config = moodMap[key as keyof typeof moodMap];
      return {
        mood: config?.mood || null,
        progress: progress / 100,
        color: config?.color || "#FFFFFF",
        emoji: config?.emoji || null,
      };
    });

    setMonthlyMoodAverage(mapped);
  };

  const fetchMoodData = async (month: number, year: number) => {
    try {
      setLoading(true);
      const result = await getMoodTrackerAnalysis({ month, year });
      if (result.status === 200) {
        setMoodData(result.data?.monthlyMoodTrackers || null);
        mapMoodData(result.data?.monthlyMoodAverage || {});
        fetchMoodHistory();
      }
    } catch (error) {
      console.error("Error fetching mood data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    fetchMoodData(month, year);
  }, [currentDate]);

  const getMoodEmoji = (mood: "HAPPY" | "SAD" | "CALM" | "ANGRY" | "ANXIOUS") => {
    const map = {
      HAPPY: ImagesAssets.Emoji_1,
      SAD: ImagesAssets.Emoji_3,
      CALM: ImagesAssets.Emoji_2,
      ANGRY: ImagesAssets.Emoji_4,
      ANXIOUS: ImagesAssets.Emoji_5,
    };
    return map[mood] || ImagesAssets.Emoji_1;
  };

  const renderItem = ({ item }: { item: MoodTrackerItem }) => (
    <View style={styles.moodNoteCard}>
      <BlurView style={StyleSheet.absoluteFill} intensity={80} tint="light" />
      <View style={styles.moodNoteHeader}>
        <View style={styles.moodNoteLeft}>
          <Image style={styles.moodNoteEmoji} source={getMoodEmoji(item.mood)} />
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
          <Text style={styles.moodNoteDetailsText}>Note: {item.details}</Text>
        </View>
      )}
    </View>
  );

  const moodPopUp = [
    { emoji: ImagesAssets.Emoji_1, label: "Happy" },
    { emoji: ImagesAssets.Emoji_5, label: "Anxious" },
    { emoji: ImagesAssets.Emoji_3, label: "Sad" },
    { emoji: ImagesAssets.Emoji_4, label: "Angry" },
    { emoji: ImagesAssets.Emoji_2, label: "Calm" },
  ];

  const handleSubmit = async () => {
    setLoading(true);
    const body = {moodTrackers: [
              {
                mood: selectedMood?.toUpperCase(),
                details: ReasonText,
                createdAt: new Date().toISOString(),
              },
            ]}

    try {
      const response = await moodTracker(body);
      if (response.status === 200) {
        Toast.show({
          type: "success",
          text1: "Mood Note Added Successfully",
          visibilityTime: 2000,
        });

        const todayDate = moment().format("YYYY-MM-DD");
        const stored = await AsyncStorage.getItem("userDetails");
        if (stored) {
          const parsed = JSON.parse(stored);
          parsed.isMoodTracker = true;
          parsed.lastMoodDate = todayDate;
          await AsyncStorage.setItem("userDetails", JSON.stringify(parsed));
        }
        setIsTodayData(true);
        fetchMoodData(currentDate.getMonth() + 1, currentDate.getFullYear());
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: response.data?.responseMessage,
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      handleClose();
    }
  };

  const resetModal = () => {
    setStep(1);
    setSelectedMood("");
    setReasonText("");
  };

  const handleClose = () => {
    resetModal();
    hideModal();
  };

  useEffect(() => {
    const checkTodayMood = async () => {
      const stored = await AsyncStorage.getItem("userDetails");
      if (!stored) return;
      const data = JSON.parse(stored);
      const today = moment().format("YYYY-MM-DD");
      setIsTodayData(data.lastMoodDate === today && data.isMoodTracker);
    };
    checkTodayMood();
  }, [userDetails]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    if (hour < 22) return "Good Evening";
    return "Hello";
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.modalStepContainer}>
            
            <BlurView style={StyleSheet.absoluteFill} intensity={80} tint="light" />
            <View style={styles.modalContent}>
              <TouchableOpacity style={styles.modalCloseButton} onPress={handleClose}>
                <Text style={styles.modalCloseText}>×</Text>
              </TouchableOpacity>
              <View style={styles.modalGreetingContainer}>
                <Text style={styles.modalGreeting}>
                  {getGreeting()}{" "}
                  <Text style={styles.modalUserName}>
                    {userDetails?.fullName?.split(" ")[0] || ""}!
                  </Text>
                </Text>
                <Text style={styles.modalTitle}>How're you feeling today?</Text>
              </View>
              <View style={styles.moodSelectionGrid}>
                {moodPopUp.map((mood, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.moodOption,
                      selectedMood === mood.label && styles.moodOptionSelected,
                    ]}
                    onPress={() => {
                      setSelectedMood(mood.label);
                      setStep(2);
                    }}
                  >
                    <Image source={mood.emoji} style={styles.moodOptionEmoji} />
                    <Text style={styles.moodOptionLabel}>
                      {mood.label.charAt(0).toUpperCase() + mood.label.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        );

      case 2:
        return (
          <TouchableOpacity activeOpacity={1} onPress={Keyboard.dismiss} style={styles.modalStepContainer}>
            <BlurView style={StyleSheet.absoluteFill} intensity={80} tint="light" />
            <View style={styles.modalContent}>
              <TouchableOpacity style={styles.modalCloseButton} onPress={handleClose}>
                <Text style={styles.modalCloseText}>×</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Would you like to share some details?</Text>
              <Text style={styles.modalSubtitle}>
                Your notes will be saved privately and can be viewed anytime in the Mood Tracker on the Health page
              </Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="Write your thoughts here..."
                value={ReasonText}
                onChangeText={setReasonText}
                multiline
                numberOfLines={4}
              />
              <TouchableOpacity style={styles.modalSubmitButton} onPress={handleSubmit}>
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalSubmitText}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
    >
      <View style={styles.mainContainer}>
        <GlobalHeader
          title="Mood Tracker"
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Calendar Card */}
          <View style={styles.calendarCard}>
            <View style={styles.calendarHeader}>
              <Text style={styles.calendarGreeting}>
                Hi, {userDetails?.fullName?.split(" ")[0]}!
              </Text>
              <View style={styles.monthNavigation}>
                <TouchableOpacity onPress={() => changeMonth(-1)}>
                  <ChevronLeft size={22} color={Colors.darkGreen} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowPicker(true)}>
                  <Text style={styles.monthText}>
                    {currentDate.toLocaleString("default", { month: "short" })} {currentDate.getFullYear()}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => changeMonth(1)}>
                  <ChevronRight size={22} color={Colors.darkGreen} />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.datesScroll}>
              {dates.map((item, i) => (
                <DateWiseList key={i} item={item} moodData={moodData} />
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[styles.checkInButton, isTodayData && styles.checkInDisabled]}
              onPress={showModal}
              disabled={isTodayData}
            >
              <Text style={styles.checkInText}>
                {isTodayData ? "Already Checked in Today" : "Check In Today"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Monthly Mood Chart */}
          <View style={styles.chartCard}>
            <BlurView style={StyleSheet.absoluteFill} intensity={60} tint="light" />
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Monthly Mood Chart</Text>
              <TouchableOpacity style={styles.chartMonthButton} onPress={() => setShowPicker(true)}>
                <Text style={styles.chartMonthText}>
                  {currentDate.toLocaleString("default", { month: "short" })} {currentDate.getFullYear()}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.chartBars}>
              {monthlyMoodAverage.map((mood, i) => (
                <View key={i} style={styles.barItem}>
                  <View style={styles.barContainer}>
                    <View style={[styles.barFilled, { flex: mood.progress, backgroundColor: mood.color }]} />
                    <View style={[styles.barEmpty, { flex: 1 - mood.progress }]} />
                  </View>
                  <View style={styles.barLabel}>
                    <Image source={mood.emoji} style={styles.barEmoji} />
                    <Text style={styles.barPercent}>{Math.round(mood.progress * 100)}%</Text>
                  </View>
                  <Text style={styles.barMoodName}>{mood.mood}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Mood Notes Section */}
          {lastFiveDaysMoodTracker.length > 0 && (
            <View style={styles.notesHeader}>
              <Text style={styles.notesTitle}>Mood Notes</Text>
              <TouchableOpacity onPress={() => router.push("/MoodTrackerHistory")}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
          )}

          <FlatList
            data={lastFiveDaysMoodTracker}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.notesList}
          />
        </ScrollView>

        <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={styles.modalContainer}>
          {renderStep()}
        </Modal>

        <CustomLottie
          customSyle={styles.backgroundLottie}
          isBlurView={false}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

export default MoodTracker;

const styles = StyleSheet.create({
  container: { flex: 1 },
  mainContainer: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 200, minHeight: height },

  // Calendar Card
  calendarCard: {
    backgroundColor: "rgba(180, 180, 180, 0.6)",
    marginHorizontal: 14,
    marginTop: 15,
    borderRadius: 30,
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
    color: "#000",
    fontSize: 22,
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

  // Monthly Chart
  chartCard: {
    backgroundColor: "rgba(180, 180, 180, 0.4)",
    marginHorizontal: 14,
    marginVertical: 15,
    borderRadius: 35,
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
    color: "#262626",
    fontFamily: "WhyteInktrap-Bold",
  },
  chartMonthButton: {
    backgroundColor: "#B0DB02",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  chartMonthText: { color: "#000", fontSize: 12, fontWeight: "600" },
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
  barEmoji: { height: 26, width: 26, marginTop: -10 },
  barPercent: { fontSize: 14, fontWeight: "bold", color: "#161616" },
  barMoodName: { fontSize: 10, color: "#000" },

  // Mood Notes
  notesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 10,
  },
  notesTitle: {
    fontSize: 20,
    color: "#B7B7B7",
    fontFamily: "WhyteInktrap-Bold",
  },
  viewAllText: { fontSize: 12, color: "#B7B7B7" },
  notesList: { paddingHorizontal: 14 },

  moodNoteCard: {
    backgroundColor: "rgba(180, 180, 180, 0.4)",
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
  moodNoteEmoji: { width: 30, height: 30, resizeMode: "contain", margin: 5 },
  moodNoteTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#262626",
    fontFamily: "WhyteInktrap-Bold",
    lineHeight: 28,
  },
  moodNoteDate: {
    fontSize: 12,
    color: "#636363",
    fontFamily: "Poppins-Regular",
  },
  moodNoteDetails: { paddingHorizontal: 10, marginTop: 10 },
  moodNoteDetailsText: { fontSize: 15, color: "black" },

  // Modal
  modalContainer: {
    backgroundColor: "white",
    width: "100%",
    position: "absolute",
    bottom: 0,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  modalStepContainer: { overflow: "hidden", borderTopLeftRadius: 32, borderTopRightRadius: 32 },
  modalContent: {
    backgroundColor: "#FFFFFFCC",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  modalCloseButton: { position: "absolute", right: 20, top: 20 },
  modalCloseText: { fontSize: 35, color: "#929292" },
  modalGreetingContainer: { marginVertical: 15 },
  modalGreeting: {
    fontSize: 16,
    color: "#262626",
    fontFamily: "Poppins-Regular",
  },
  modalUserName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#262626",
    fontFamily: "Poppins-SemiBold",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#262626",
    fontFamily: "Poppins-SemiBold",
  },
  modalSubtitle: {
    fontSize: 12,
    color: "gray",
    fontFamily: "Poppins-Regular",
    marginBottom: 10,
  },
  moodSelectionGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 20,
  },
  moodOption: {
    alignItems: "center",
    justifyContent: "center",
  },
  moodOptionSelected: {
    backgroundColor: "#e0e0e0",
    borderWidth: 2,
    borderColor: "#02130B",
    borderRadius: 12,
    padding: 8,
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
    backgroundColor: "#FFFFFF",        // Solid white background
  color: "#000000",
  },
  modalSubmitButton: {
    backgroundColor: "#02130B",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  modalSubmitText: { color: "white", fontSize: 16, fontWeight: "500" },

  // Background Lottie
  backgroundLottie: {
    width: width,
    height: height * 0.68,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    position: "absolute",
    bottom: 0,
    zIndex: -2,
  },
});