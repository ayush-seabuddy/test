import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import ProfleSettingHeader from "../component/headers/ProfileHeader/ProfleSettingHeader";
import { Calendar } from "react-native-calendars";
import FocusAwareStatusBar from "../statusbar/FocusAwareStatusBar";
import Colors from "../colors/Colors";
import moment from "moment";
import CustomDateTimePicker from "./Modals/CustomDateTimePicker";
import { useTranslation } from "react-i18next";

const ActivityCalendar = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { Data } = route?.params || {};

  // ---------- Extract initial values ----------
  const extractDateTime = (dateTimeString) => {
    const m = moment(dateTimeString);
    return { date: m.format("YYYY-MM-DD"), time: m.toDate() };
  };

  let initialStartDate = null,
    initialEndDate = null,
    initialStartTime = null,
    initialEndTime = null;

  if (Data?.startDateTime) {
    const s = extractDateTime(Data.startDateTime);
    initialStartDate = s.date;
    initialStartTime = s.time;
  }
  if (Data?.endDateTime) {
    const e = extractDateTime(Data.endDateTime);
    initialEndDate = e.date;
    initialEndTime = e.time;
  }

  // ---------- State ----------
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [startTime, setStartTime] = useState(initialStartTime);
  const [endTime, setEndTime] = useState(initialEndTime);
  const [markedDates, setMarkedDates] = useState({});
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const todayStr = moment().format("YYYY-MM-DD");

  const getMinimumStartTime = () => {
    if (!startDate || startDate === todayStr) {
      const now = new Date();
      now.setSeconds(0);
      now.setMilliseconds(0);
      now.setMinutes(now.getMinutes() + 15);
      return now;
    }
    return moment(startDate).startOf("day").toDate();
  };

  const getMinimumEndTime = () => {
    if (!startTime || !startDate) return getMinimumStartTime();

    const startDT = new Date(startDate);
    startDT.setHours(
      startTime.getHours(),
      startTime.getMinutes(),
      startTime.getSeconds(),
      0
    );

    const minFromStart = new Date(startDT.getTime() + 15 * 60 * 1000); // +15 min

    const effectiveEndDate = endDate || startDate;

    if (endDate && endDate > startDate) {
      return moment(effectiveEndDate).startOf("day").toDate();
    }

    if (effectiveEndDate === todayStr) {
      const nowPlus15 = new Date();
      nowPlus15.setSeconds(0);
      nowPlus15.setMilliseconds(0);
      nowPlus15.setMinutes(nowPlus15.getMinutes() + 15);
      return new Date(Math.max(minFromStart.getTime(), nowPlus15.getTime()));
    }

    return minFromStart;
  };

  useEffect(() => {
    if (initialStartDate && initialEndDate) {
      setMarkedDates(getDateRange(initialStartDate, initialEndDate));
    } else if (initialStartDate) {
      setMarkedDates({
        [initialStartDate]: {
          selected: true,
          color: "#6ab04c",
          textColor: "white",
        },
      });
    }
  }, []);

  const getDateRange = (start, end) => {
    const range = {};
    let current = new Date(start);
    const endDate = new Date(end);
    while (current <= endDate) {
      const str = moment(current).format("YYYY-MM-DD");
      range[str] = {
        color: "#6ab04c",
        textColor: "white",
        startingDay: str === start,
        endingDay: str === end,
      };
      current.setDate(current.getDate() + 1);
    }
    return range;
  };

  const onDateSelect = (day) => {
    const selected = day.dateString;
    if (selected < todayStr) {
      alert(t("cannotSelectPastDate"));
      return;
    }

    if (!startDate || (startDate && endDate)) {
      setStartDate(selected);
      setEndDate(null);
      setStartTime(null);
      setEndTime(null);
      setMarkedDates({
        [selected]: { selected: true, color: "#6ab04c", textColor: "white" },
      });
    } else {
      if (selected >= startDate) {
        setEndDate(selected);
        setMarkedDates(getDateRange(startDate, selected));
      } else {
        setStartDate(selected);
        setEndDate(null);
        setStartTime(null);
        setEndTime(null);
        setMarkedDates({
          [selected]: { selected: true, color: "#6ab04c", textColor: "white" },
        });
      }
    }
  };

  const handleTimeChange = (event, selectedDate, type) => {
    if (!selectedDate) return;

    if (type === "start") {
      setShowStartPicker(false);
      if (selectedDate < getMinimumStartTime()) {
        alert(t("startTimeWarning"));
        return;
      }
      setStartTime(selectedDate);

      // Auto-adjust end time if it becomes invalid
      if (endTime && endTime < new Date(selectedDate.getTime() + 15 * 60 * 1000)) {
        setEndTime(new Date(selectedDate.getTime() + 15 * 60 * 1000));
      }
    } else {
      setShowEndPicker(false);
      if (selectedDate < getMinimumEndTime()) {
        alert(t("endTimeWarning"));
        return;
      }
      setEndTime(selectedDate);
    }
  };

  const getTimeLabel = (time, placeholder) =>
    time ? moment(time).format("hh:mm A") : t(placeholder);

  const formatDateTime = (date, time) => {
    if (!date || !time) return null;
    return moment(date)
      .set({
        hour: time.getHours(),
        minute: time.getMinutes(),
        second: time.getSeconds(),
      })
      .format("YYYY-MM-DD HH:mm:ss");
  };

  const handleSubmit = () => {
    if (!startDate || !startTime) {
      alert(t("selectStartMessage"));
      return;
    }

    const startDT = formatDateTime(startDate, startTime);
    const finalEndDate = endDate || startDate;
    const finalEndTime = endTime || new Date(startTime.getTime() + 60 * 60 * 1000);
    const endDT = formatDateTime(finalEndDate, finalEndTime);

    navigation.navigate("CreateGroupActivity", {
      data: { startDateTime: startDT, endDateTime: endDT },
    });
  };

  return (
    <>
      <FocusAwareStatusBar barStyle="light-content" backgroundColor={Colors.white} />
      <ProfleSettingHeader navigation={navigation} title={t("createBuddyEvent")} />

      <View style={styles.container}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.calendarContainer}>
            <Calendar
              enableSwipeMonths
              minDate={new Date()}
              markingType="period"
              markedDates={markedDates}
              onDayPress={onDateSelect}
              theme={{ todayTextColor: "#B0DB02", arrowColor: "#B0DB02" }}
            />
          </View>

          <TouchableOpacity
            style={styles.pickerContainer}
            onPress={() => setShowStartPicker(true)}
          >
            <Image source={require("../assets/images/NewPostImage/clock.png")} style={styles.icon} />
            <Text style={[styles.pickerText, !startTime && { color: "gray" }]}>
              {getTimeLabel(startTime, "startTime")}
            </Text>
          </TouchableOpacity>

          {showStartPicker && (
            <CustomDateTimePicker
              value={startTime || getMinimumStartTime()}
              mode="time"
              minimumDate={getMinimumStartTime()}
              onChange={(e, d) => handleTimeChange(e, d, "start")}
              isVisible={showStartPicker}
              onClose={() => setShowStartPicker(false)}
            />
          )}

          <TouchableOpacity
            style={styles.pickerContainer}
            onPress={() => setShowEndPicker(true)}
          >
            <Image source={require("../assets/images/NewPostImage/clock.png")} style={styles.icon} />
            <Text style={[styles.pickerText, !endTime && { color: "gray" }]}>
              {getTimeLabel(endTime, "endTime")}
            </Text>
          </TouchableOpacity>

          {showEndPicker && (
            <CustomDateTimePicker
              value={endTime || getMinimumEndTime()}
              mode="time"
              minimumDate={getMinimumEndTime()}
              onChange={(e, d) => handleTimeChange(e, d, "end")}
              isVisible={showEndPicker}
              onClose={() => setShowEndPicker(false)}
              cancelText={t("cancel")}
              confirmText={t("done")}
            />
          )}

          <TouchableOpacity
            style={[
              styles.submitButton,
              (!startDate || !startTime) && styles.disabledButton,
            ]}
            onPress={handleSubmit}
            disabled={!startDate || !startTime}
          >
            <Text style={styles.submitText}>{t("submit")}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingVertical: 10 },
  calendarContainer: { marginBottom: 20 },
  pickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFFB2",
    borderRadius: 20,
    marginBottom: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  pickerText: { flex: 1, fontSize: 16 },
  icon: { width: 24, height: 24, marginRight: 10 },
  submitButton: {
    backgroundColor: "#02130B",
    padding: 15,
    alignItems: "center",
    borderRadius: 8,
    marginTop: 30,
  },
  submitText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  disabledButton: { backgroundColor: "#c1c1c1" },
});

export default ActivityCalendar;