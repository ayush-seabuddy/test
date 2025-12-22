import { getAllMoodTracker, getMoodTrackerAnalysis } from "@/src/apis/apiService";
import CustomLottie from "@/src/components/CustomLottie";
import GlobalHeader from "@/src/components/GlobalHeader";
import { RootState } from "@/src/redux/store";
import Colors from "@/src/utils/Colors";
import { height, width } from "@/src/utils/helperFunctions";
import { ImagesAssets } from "@/src/utils/ImageAssets";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { router } from "expo-router";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import moment from "moment-timezone";
import { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { ActivityIndicator, Modal } from "react-native-paper";
import { useSelector } from "react-redux";

const MoodTracker = ({ }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [moodData, setMoodData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [lastFiveDaysMoodTracker, setLastFiveDaysMoodTracker] = useState([]);
    const [monthlyMoodAverage, setMonthlyMoodAverage] = useState([]);
    const userDetails = useSelector((state: RootState) => state.userDetails)
    const [visible, setVisible] = useState(false);
    const showModal = () => setVisible(true);
    const hideModal = () => setVisible(false);
    const containerStyle = {
        backgroundColor: "white",
        width: "100%",
        position: "absolute",
        bottom: 0,
        borderTopRightRadius: 32,
        borderTopLeftRadius: 32,
    };

    const fetchMoodHistory = useCallback(async (currentPage: number) => {

        try {
            const res = await getAllMoodTracker({
                page: 1,
                limit: 5,
            });

            if (res?.status === 200 && res?.data) {
                const newData = res.data.moodTrackerList || [];
                setLastFiveDaysMoodTracker(newData);
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

        const newMonth = newDate.getMonth();
        const newYear = newDate.getFullYear();

        // Only allow setting the new date if it is not in the future
        if (newYear < currentYear || (newYear === currentYear && newMonth <= currentMonth)) {
            setCurrentDate(newDate);
        }
    };

    const [showPicker, setShowPicker] = useState(false);

    const onChange = (selectedDate: Date) => {
        setShowPicker(false);
        if (selectedDate) {
            const newDate = new Date(selectedDate);
            setCurrentDate(newDate);
        }
    };

    const [isTodayData, setIsTodayData] = useState();
    const scrollViewRef = useRef(null);
    const today = new Date();
    const getFormattedDates = (year: number, month: number) => {
        const dates = [];
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const todayMoment = moment(today);
        const currentWeek = todayMoment.isoWeek(); // Get the current week of the year

        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i);
            const dateMoment = moment(date);
            const isCurrentWeek = dateMoment.isoWeek() === currentWeek && dateMoment.year() === todayMoment.year();

            dates.push({
                fullDate: date.toDateString(),
                date: date.getDate(),
                month: date.toLocaleString("default", { month: "short" }),
                day: date.toLocaleString("default", { weekday: "short" }),
                isToday:
                    date.getDate() === today.getDate() &&
                    date.getMonth() === today.getMonth() &&
                    date.getFullYear() === today.getFullYear(),
                isCurrentWeek: isCurrentWeek,
            });
        }
        return dates;
    };

    const dates = getFormattedDates(
        currentDate.getFullYear(),
        currentDate.getMonth()
    );

    const DateWiseList = ({ item, moodData }) => {
        var matchingMood;
        if (moodData && moodData.length > 0) {
            moodData.forEach((element) => {
                const formattedDate = moment(element.createdAt).format("DD");
                if (String(item.date).padStart(2, "0") === formattedDate) {
                    matchingMood = element;
                }
            });
        }
        return (
            <View style={[styles.dateItem]}>
                <Text style={[styles.dateText1, { marginTop: 10 }]}>{item.day}</Text>
                <View
                    style={{
                        backgroundColor: item.isToday ? "#B0DB02" : "#fff",
                        height: 25,
                        width: 25,
                        borderRadius: 30,
                        alignItems: "center",
                        justifyContent: "center",
                        marginVertical: 10,
                    }}
                >
                    <Text style={[styles.dateText1]}>{item.date}</Text>
                </View>
                {matchingMood ? (
                    <Image
                        style={{ height: 30, width: 30, marginBottom: 10 }}
                        source={getMoodEmoji(matchingMood.mood)}
                    />
                ) : null}
            </View>
        );
    };


    const mapMoodData = (monthlyMoodAverage) => {
        const moodMap = {
            HAPPY: {
                mood: "HAPPY",
                color: "#B0DB0266",
                emoji: ImagesAssets.Emoji_1,
            },
            SAD: {
                mood: "SAD",
                color: "#DB8F0266",
                emoji: ImagesAssets.Emoji_3,
            },
            CALM: {
                mood: "CALM",
                color: "#B0DB0266",
                emoji: ImagesAssets.Emoji_2,
            },
            ANGRY: {
                mood: "ANGRY",
                color: "#E5424566",
                emoji: ImagesAssets.Emoji_4,
            },
            ANXIOUS: {
                mood: "ANXIOUS",
                color: "#69BEDC66",
                emoji: ImagesAssets.Emoji_5,
            },
        };
        const mappedMoods = Object.keys(monthlyMoodAverage).map((mood) => {
            const progress = parseFloat(monthlyMoodAverage[mood]);
            return {
                mood: moodMap[mood]?.mood || null,
                progress: progress / 100,
                color: moodMap[mood]?.color || "#FFFFFF",
                emoji: moodMap[mood]?.emoji || null,
            };
        });

        setMonthlyMoodAverage(mappedMoods);
    }


    const fetchMoodData = async (month, year) => {

        //   const token = await AsyncStorage.getItem("authToken");
        //   const docId = `moodData_${year}_${month}`;
        //   const docRef = firestore().collection("moodData").doc(docId);
        try {
            setLoading(true);
            const result = await getMoodTrackerAnalysis({ month, year });
            console.log("result: ", result);
            if (result.status === 200) {
                setLoading(false);
                const moodTrackers = result?.data?.monthlyMoodTrackers || null;
                // setLastFiveDaysMoodTracker(result?.data?.lastFiveDaysMoodTracker);
                fetchMoodHistory(1)
                console.log("result: ", result);
                const moodAverage = mapMoodData(
                    result?.data?.monthlyMoodAverage || {}
                );
                setMoodData(moodTrackers);

            }

        } catch (error) {
            // console.error("Error fetching mood data:", error);
            // const snapshot = await docRef.get();
            // setIsloading(false);
            // if (snapshot.exists) {

            //   const data = snapshot.data();
            //   setMoodData(data.moodTrackers || null);
            //   setmonthlyMoodAverage(data.moodAverage || {});
            // } else {
            //   console.warn("No offline data found for this month and year.");
            //   setMoodData(null);
            //   setmonthlyMoodAverage({});
            // }

        } finally {
            // setIsloading(false);
        }
    };

    useEffect(() => {
        const selectedMonth = currentDate.getMonth() + 1;
        const selectedYear = currentDate.getFullYear();
        fetchMoodData(selectedMonth, selectedYear);
    }, [currentDate]);


    const getMoodEmoji = (mood: 'HAPPY' | 'SAD' | 'CALM' | 'ANGRY' | 'ANXIOUS') => {
        const moodImages = {
            HAPPY: ImagesAssets.Emoji_1,
            SAD: ImagesAssets.Emoji_3,
            CALM: ImagesAssets.Emoji_2,
            ANGRY: ImagesAssets.Emoji_4,
            ANXIOUS: ImagesAssets.Emoji_5,
        };
        return moodImages[mood] || ImagesAssets.Emoji_1;
    };


    const renderItem = ({ item }) => (
        <View
            style={{
                backgroundColor: "rgba(180, 180, 180, 0.4)",
                padding: 15,
                borderRadius: 12,
                marginVertical: 5,
                overflow: "hidden",
                marginHorizontal: 14,
            }}
        >
            <BlurView
                style={StyleSheet.absoluteFill}
            // blurType="light"
            // blurAmount={30}
            // reducedTransparencyFallbackColor="white"
            />
            <View
                style={{
                    width: "100%",
                    alignItems: "center",
                    flexDirection: "row",
                    justifyContent: "space-between",
                }}
            >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Image
                        style={styles.imageEmogiIcon}
                        source={getMoodEmoji(item.mood)}
                    />
                    <View style={{ flexDirection: "column", marginLeft: 10 }}>
                        <Text
                            style={{
                                lineHeight: 28,
                                fontSize: 18,
                                fontWeight: "500",
                                color: "#262626",
                                fontFamily: "WhyteInktrap-Bold",
                            }}
                        >
                            {item?.mood || ""}
                        </Text>
                        <Text
                            style={{
                                fontSize: 12,
                                fontWeight: "500",
                                color: "#636363",
                                fontFamily: "Poppins-Regular",
                            }}
                        >
                            {moment(item.createdAt).format("DD MMM YYYY")}
                        </Text>
                    </View>
                </View>
            </View>
            <View style={{ paddingHorizontal: 10 }}>
                {item?.details && <View style={{ marginTop: 10 }}>
                    <Text style={{ fontSize: 15, color: "black" }}>Note : {item?.details}</Text>
                </View>}
            </View>
        </View>
    );


    const [step, setStep] = useState(1);
    const [selectedMood, setSelectedMood] = useState(null);
    const [feeling, setfeeling] = useState("");
    const [Because, setBecause] = useState("");
    const [ReasonText, setReasonText] = useState("");
    const [details, setDetails] = useState([]);
    const [fullName, setfullName] = useState("");
    const moodPopUp = [
        { emoji: ImagesAssets.Emoji_1, label: "Happy" },
        { emoji: ImagesAssets.Emoji_5, label: "Anxious" },
        { emoji: ImagesAssets.Emoji_3, label: "Sad" },
        { emoji: ImagesAssets.Emoji_4, label: "Angry" },
        { emoji: ImagesAssets.Emoji_2, label: "Calm" }
    ];

    const handleSubmit = async () => {
        //   setIsloading(true);
        //   const token = await AsyncStorage.getItem("authToken");
        //   const body = JSON.stringify({
        //     moodTrackers: [
        //       {
        //         mood: selectedMood.toUpperCase(),
        //         feeling: feeling,
        //         reason: Because,
        //         details: ReasonText,
        //         createdAt: new Date().toISOString(),
        //       },
        //     ],
        //   });
        //   var response = await apiCallWithTokenPost(
        //     apiServerUrl + "/user/moodTracker",
        //     token,
        //     body
        //   );
        //   if (response.responseCode === 200) {
        //     Toast.show({
        //       type: "success",
        //       // text1: "Success",
        //       text1: "Mood Note Added Successfully",
        //       autoHide: true,
        //       visibilityTime: 2000,
        //       text1Style: {
        //         fontFamily: "WhyteInkTrap-Bold",
        //         fontSize: 16,
        //         color: "#000",
        //         paddingTop: 10,
        //       },
        //       text2Style: {
        //         fontFamily: "Poppins-Regular",
        //         fontSize: 14,
        //         color: "#000",
        //         paddingTop: 10,
        //       },
        //     });
        //     const date = new Date();
        //     const todayDate = `${date.getFullYear()}-${(date.getMonth() + 1)
        //       .toString()
        //       .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
        //     const userDetailsString = await AsyncStorage.getItem("userDetails");
        //     if (userDetailsString) {
        //       const userDetails = JSON.parse(userDetailsString);
        //       userDetails.isMoodTracker = true;
        //       userDetails.lastMoodDate = todayDate;
        //       setIsTodayData(true)
        //       await AsyncStorage.setItem("userDetails", JSON.stringify(userDetails));
        //     }
        //     handleClose();
        //     const selectedMonth = currentDate.getMonth() + 1;
        //     const selectedYear = currentDate.getFullYear();
        //     fetchMoodData(selectedMonth, selectedYear);
        //   } else {
        //     Toast.show({
        //       type: "error",
        //       text1: "error",
        //       text2: response.responseMessage,
        //       autoHide: true,
        //       visibilityTime: 2000,
        //       text1Style: {
        //         fontFamily: "WhyteInkTrap-Bold",
        //         fontSize: 16,
        //         color: "#000",
        //         paddingTop: 10,
        //       },
        //       text2Style: {
        //         fontFamily: "Poppins-Regular",
        //         fontSize: 14,
        //         color: "#000",
        //         paddingTop: 10,
        //       },
        //     });
        //   }
        handleClose();
    };


    const resetModal = () => {
        setStep(1);
        setMoodData(null);
        setBecause("");
        setReasonText("");
        setfeeling("");
    };


    const handleClose = () => {
        setLoading(false);
        resetModal();
        hideModal();
    };

    const renderStep = () => {
        const getGreeting = () => {
            const currentHour = new Date().getHours();

            if (currentHour >= 5 && currentHour < 12) {
                return "Good Morning";
            } else if (currentHour >= 12 && currentHour < 18) {
                return "Good Afternoon";
            } else if (currentHour >= 18 && currentHour < 22) {
                return "Good Evening";
            } else {
                return "Hello";
            }
        };


        switch (step) {
            case 1:
                return (
                    <View
                        style={{
                            overflow: "hidden",
                            borderTopRightRadius: 32,
                            borderTopLeftRadius: 32,
                        }}
                    >
                        <BlurView
                            style={StyleSheet.absoluteFill}
                        // blurType="light"
                        // blurAmount={30}
                        // reducedTransparencyFallbackColor="white"
                        />
                        <View style={styles.stepContainer}>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={handleClose}
                            >
                                <Text style={styles.closeButtonText}>×</Text>
                            </TouchableOpacity>
                            <View style={{ marginVertical: 15 }}>
                                <Text style={[styles.greeting]}>
                                    {getGreeting()}{" "}
                                    <Text
                                        style={{
                                            fontSize: 16,
                                            fontWeight: "600",
                                            color: "#262626",
                                            fontFamily: "Poppins-SemiBold",
                                        }}
                                    >
                                        {fullName ? fullName.charAt(0).toUpperCase() + fullName.slice(1) : ""}!
                                    </Text>
                                </Text>
                                <Text style={[styles.greetingMain]}>
                                    How're you feeling today?
                                </Text>
                            </View>
                            <View style={styles.moodContainer}>
                                {moodPopUp.map((mood, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.moodButton,
                                            {
                                                flexDirection: "column",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            },
                                            selectedMood?.label === mood.label && styles.selectedMood,
                                        ]}
                                        onPress={() => {
                                            setSelectedMood(mood.label);
                                            setStep(2);
                                        }}
                                    >
                                        <Image
                                            source={mood.emoji}
                                            style={{ height: 50, width: 50, marginHorizontal: 5 }}
                                        />
                                        <Text
                                            style={{
                                                fontSize: 12,
                                                fontWeight: "600",
                                                color: "rgba(52, 52, 52, 1)",
                                                fontFamily: "Poppins-SemiBold",
                                                lineHeight: 19.2,
                                            }}
                                        >
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
                    <TouchableOpacity
                        style={{
                            overflow: "hidden",
                            borderTopRightRadius: 32,
                            borderTopLeftRadius: 32,
                            flex: 1,
                        }}
                        activeOpacity={1}
                        onPress={() => Keyboard.dismiss()}
                    >
                        <BlurView
                            style={StyleSheet.absoluteFill}
                        //   blurType="light"
                        //   blurAmount={30}
                        //   reducedTransparencyFallbackColor="white"
                        />
                        <View style={[styles.stepContainer]}>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={handleClose}
                            >
                                <Text style={styles.closeButtonText}>×</Text>
                            </TouchableOpacity>
                            {/* <Text style={[styles.greeting]}>
                    {getGreeting()}{" "}
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color: "#262626",
                        fontFamily: "Poppins-SemiBold",
                      }}
                    >
                      Your notes will be saved privately and can be viewed anytime in the Mood Tracker on the Health page
                    </Text>
                  </Text> */}
                            <Text style={styles.greetingMain}>
                                Would you like to share some details?
                            </Text>
                            <Text
                                style={{
                                    fontSize: 12,
                                    color: "gray",
                                    fontFamily: "Poppins-Regular",
                                    marginBottom: 10,
                                }}
                            >
                                Your notes will be saved privately and can be viewed anytime in the Mood Tracker on the Health page
                            </Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Write your thoughts here..."
                                value={ReasonText}
                                onChangeText={(value) => setReasonText(value)}
                                multiline
                                numberOfLines={4}
                            />
                            <TouchableOpacity
                                style={styles.submitButton}
                                onPress={handleSubmit}
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.submitButtonText}>Submit</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                );
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
        >
            <View style={styles.container}>

                <GlobalHeader
                    title="Mood Tracker"
                    onLeftPress={() => router.back()}
                    leftIcon={<ChevronLeft color="#000" size={24} />}
                />
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ flexGrow: 1, paddingBottom: 200, minHeight: height }}
                    showsVerticalScrollIndicator={false}
                    scrollEnabled={true}
                    keyboardShouldPersistTaps="handled"
                >
                    <View
                        style={{
                            backgroundColor: "rgba(180, 180, 180, 0.6)",
                            marginHorizontal: 14,
                            marginTop: 15,
                            borderRadius: 30,
                            padding: 10,
                        }}
                    >
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginTop: 10,
                                marginHorizontal: 10,
                                marginBottom: 10,
                            }}
                        >
                            <Text
                                style={{
                                    color: "#000",
                                    lineHeight: 22,
                                    fontSize: 22,
                                    paddingTop: 4,
                                    fontFamily: "WhyteInktrap-Bold",
                                    textTransform: "capitalize",
                                }}
                            >
                                Hi, {userDetails?.fullName?.split(" ")[0]}!
                            </Text>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <TouchableOpacity onPress={() => changeMonth(-1)}>
                                    <ChevronLeft size={22} color={Colors.darkGreen} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setShowPicker(true)}>
                                    <Text
                                        style={{
                                            color: "#000",
                                            fontSize: 12,
                                            fontWeight: "600",
                                            marginHorizontal: 10,
                                        }}
                                        onPress={() => setShowPicker(true)}
                                    >
                                        {currentDate.toLocaleString("default", { month: "short" })}{" "}
                                        {currentDate.getFullYear()}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => changeMonth(1)}>
                                    <ChevronRight size={22} color={Colors.darkGreen} />
                                </TouchableOpacity>


                            </View>
                        </View>
                        <View style={{ marginHorizontal: 10, marginTop: 10 }}>
                            <ScrollView
                                ref={scrollViewRef}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ paddingBottom: 10 }}
                            >
                                {dates.map((item, index) => (
                                    <DateWiseList key={index} item={item} moodData={moodData} />
                                ))}
                            </ScrollView>
                        </View>
                        <View
                            style={{
                                alignItems: "center",
                                justifyContent: "center",
                                marginHorizontal: 10,
                                marginTop: 10,
                            }}
                        >
                            <TouchableOpacity
                                onPress={showModal}
                                style={{
                                    backgroundColor: isTodayData == true ? "#777" : "#000",
                                    height: 50,
                                    width: "100%",
                                    marginBottom: 15,
                                    borderRadius: 8,
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                                disabled={isTodayData}
                            >
                                <Text
                                    style={{
                                        color: "#fff",
                                        fontSize: 14,
                                        fontFamily: "Poppins-SemiBold",
                                    }}
                                >
                                    {isTodayData == true ? "Already Checked in Today" : "Check In Today"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View
                        style={{
                            backgroundColor: "rgba(180, 180, 180, 0.4)",
                            padding: 20,
                            marginVertical: 15,
                            borderRadius: 35,
                            overflow: "hidden",
                            marginHorizontal: 14,
                        }}
                    >
                        <BlurView
                            style={StyleSheet.absoluteFill}
                        />
                        <View style={styles.header}>
                            <Text style={styles.title}>Monthly Mood Chart</Text>

                            <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 4, paddingVertical: 4, borderRadius: 8, backgroundColor: "#B0DB02" }} onPress={() => setShowPicker(true)}>
                                <Text style={{ color: "#000", fontSize: 12, fontWeight: "600" }}>
                                    {currentDate.toLocaleString("default", { month: "short" })}{" "}
                                    {currentDate.getFullYear()}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.row}>
                            {(monthlyMoodAverage || []).map((mood, index: number) => (
                                <View key={index}>
                                    <View style={styles.progressContainer}>
                                        <View
                                            style={[
                                                styles.filledBar,
                                                { flex: mood.progress, backgroundColor: mood.color },
                                            ]}
                                        />
                                        <View
                                            style={[styles.unfilledBar, { flex: 1 - mood.progress }]}
                                        />
                                    </View>
                                    <View style={{ alignItems: "center" }}>
                                        <Image source={mood.emoji} style={styles.emoji} />
                                        <Text style={styles.percentageText}>
                                            {Math.round(mood.progress * 100)}%
                                        </Text>
                                    </View>
                                    <View style={{ alignItems: "center" }}>
                                        <Text style={{ color: "#000", fontSize: 10, fontFamily: "poppins-regular" }}>{mood.mood}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                    {lastFiveDaysMoodTracker?.length > 0 && (
                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginHorizontal: 20,
                                marginTop: 10,
                            }}
                        >
                            <Text
                                style={{
                                    lineHeight: 28,
                                    fontSize: 20,
                                    color: "#B7B7B7",
                                    fontFamily: "WhyteInktrap-Bold",
                                    marginBottom: 4,
                                }}
                            >
                                Mood Notes
                            </Text>
                            <TouchableOpacity
                                onPress={() => {
                                    router.push("/MoodTrackerHistory");
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: 12,
                                        color: "#B7B7B7",
                                        fontWeight: "400",
                                        // fontFamily: FontFamily.captionC10Regular,
                                    }}
                                >
                                    View All
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    <FlatList
                        data={lastFiveDaysMoodTracker}
                        keyExtractor={(item) => item.id}
                        renderItem={renderItem}
                    />
                </ScrollView>

                <Modal
                    visible={visible}
                    onDismiss={hideModal}
                    contentContainerStyle={containerStyle}
                >
                    <View>{renderStep()}</View>
                </Modal>
                {/* <View
                          style={{
                            backgroundColor: "#c1c1c1",
                            overflow: "hidden",
                            height: "70%",
                            borderTopLeftRadius: 50,
                            borderTopRightRadius: 50,
                            zIndex: -2,
                            position: "absolute",
                            bottom: 0,
                            pointerEvents: "none",
                          }}
                        > */}
                <CustomLottie
                    customSyle={{
                        width: width * 1,
                        height: height * 0.68,
                        borderTopLeftRadius: 50,
                        borderTopRightRadius: 50,
                        zIndex: -2,
                    }}
                    isBlurView={false}
                />
                {/* </View> */}


            </View>
        </KeyboardAvoidingView>
    );
};

export default MoodTracker;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: "#fff",
    },
    dateItem: {
        backgroundColor: "rgba(255, 255, 255, 0.6)",
        marginRight: 10,
        borderRadius: 30,
        width: 45,
        alignItems: "center",
    },
    dateText1: {
        fontSize: 12,
        color: "#000",
        fontWeight: "500",
    },
    title: {
        lineHeight: 22,
        fontSize: 18,
        color: "#262626",
        fontFamily: "WhyteInktrap-Bold",
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },
    progressContainer: {
        width: 20,
        height: 150,
        backgroundColor: "#f0f0f0",
        borderRadius: 12,
        overflow: "hidden",
        marginHorizontal: 10,
        flexDirection: "column-reverse",
        alignItems: "center",
    },
    filledBar: {
        width: "100%",
        borderRadius: 30,
    },
    unfilledBar: {
        backgroundColor: "#F0F0F0CC",
        width: "100%",
    },
    emoji: {
        height: 26,
        width: 26,
        marginTop: -10,
    },
    percentageText: {
        marginTop: 5,
        fontSize: 14,
        color: "#161616",
        fontWeight: "bold",
        textAlign: "center",
    },
    imageEmogiIcon: {
        width: 30,
        height: 30,
        resizeMode: "contain",
        margin: 5,
    },
    stepContainer: {
        backgroundColor: "#FFFFFFCC",
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderTopRightRadius: 32,
        borderTopLeftRadius: 32,
        bottom: 0,
        overflow: "hidden",
    },
    closeButton: {
        position: "absolute",
        right: 0,
        paddingRight: 20,
    },
    closeButtonText: {
        fontSize: 35,
        color: "#929292",
    },
    greeting: {
        fontSize: 16,
        fontWeight: "400",
        color: "#262626",
        marginTop: 10,
        fontFamily: "Poppins-Regular",
    },
    greetingMain: {
        fontSize: 22,
        fontWeight: "600",
        color: "#262626",
        fontFamily: "Poppins-SemiBold",
    },
    moodContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginVertical: 20,
    },
    moodButton: {},
    selectedMood: {
        backgroundColor: "#e0e0e0",
        borderWidth: 2,
        borderColor: "#02130B",
    },
    input: {
        width: width * 0.9,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        padding: 12,
        marginBottom: 20,
    },
    textArea: {
        height: 100,
        textAlignVertical: "top",
        width: "100%",
    },
    submitButton: {
        backgroundColor: "#02130B",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
    },
    submitButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "500",
    },
    dropdownContainer: {
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 10,
        marginBottom: 15,
        overflow: "hidden",
        paddingHorizontal: 10,
        fontFamily: "Poppins-Regular",
        zIndex: 5,
        backgroundColor: "#fff",
        marginVertical: 20,
    },
    dropdownRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    icon: {
        height: 18,
        width: 18,
    },
    picker: {
        height: 50,
        width: "100%",
        color: "#636363",
        fontFamily: "Poppins-Regular",
    },
    errorText: {
        color: "red",
        fontSize: 12,
        marginTop: -10,
        marginBottom: 10,
        marginLeft: 10,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    modalContainers: {  // <-- singular here to match usage
        flex: 1,
        width: width,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: 'center', // Add this for center alignment horizontally
    }
});