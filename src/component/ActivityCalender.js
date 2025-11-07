import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform } from "react-native";
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

  const extractDateTime = (dateTimeString) => {
    const momentObj = moment(dateTimeString);
    return { date: momentObj.format("YYYY-MM-DD"), time: momentObj.toDate() };
  };

  let initialStartDate = null,
    initialEndDate = null,
    initialStartTime = null,
    initialEndTime = null;

  if (Data?.startDateTime) {
    const startDateTime = extractDateTime(Data.startDateTime);
    initialStartDate = startDateTime.date;
    initialStartTime = startDateTime.time;
  }

  if (Data?.endDateTime) {
    const endDateTime = extractDateTime(Data.endDateTime);
    initialEndDate = endDateTime.date;
    initialEndTime = endDateTime.time;
  }

  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [startTime, setStartTime] = useState(initialStartTime);
  const [endTime, setEndTime] = useState(initialEndTime);
  const [markedDates, setMarkedDates] = useState({});
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const getMinimumStartTime = () => {
    const now = new Date();
    now.setSeconds(0);
    now.setMilliseconds(0);
    now.setMinutes(now.getMinutes() + 15);
    return now;
  };

  const getMinimumEndTime = () => {
    if (startTime) return new Date(startTime.getTime() + 15 * 60 * 1000);
    return getMinimumStartTime();
  };

  useEffect(() => {
    if (initialStartDate && initialEndDate) {
      setMarkedDates(getDateRange(initialStartDate, initialEndDate));
    } else if (initialStartDate) {
      setMarkedDates({
        [initialStartDate]: { selected: true, color: "#6ab04c", textColor: "white" },
      });
    }
  }, [initialStartDate, initialEndDate]);

  const onDateSelect = (day) => {
    const selectedDate = day.dateString;
    const today = moment().format("YYYY-MM-DD");

    if (selectedDate < today) {
      alert(t("cannotSelectPastDate"));
      return;
    }

    if (!startDate || (startDate && endDate)) {
      setStartDate(selectedDate);
      setEndDate(null);
      setMarkedDates({
        [selectedDate]: { selected: true, color: "#6ab04c", textColor: "white" },
      });
    } else {
      if (selectedDate > startDate) {
        setEndDate(selectedDate);
        setMarkedDates(getDateRange(startDate, selectedDate));
      } else {
        setStartDate(selectedDate);
        setMarkedDates({
          [selectedDate]: { selected: true, color: "#6ab04c", textColor: "white" },
        });
      }
    }
  };

  const getDateRange = (start, end) => {
    let range = {};
    let currentDate = new Date(start);
    while (currentDate <= new Date(end)) {
      const dateStr = moment(currentDate).format("YYYY-MM-DD");
      range[dateStr] = {
        color: "#6ab04c",
        textColor: "white",
        startingDay: dateStr === start,
        endingDay: dateStr === end,
      };
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return range;
  };

  const handleTimeChange = (event, selectedDate, type) => {
    if (!selectedDate) return;

    if (type === "start") {
      setShowStartPicker(false);
      const minStartTime = getMinimumStartTime();
      if (selectedDate < minStartTime) {
        alert(t("startTimeWarning"));
        return;
      }
      setStartTime(selectedDate);
      if (endTime && endTime < new Date(selectedDate.getTime() + 15 * 60 * 1000)) {
        setEndTime(new Date(selectedDate.getTime() + 15 * 60 * 1000));
      }
    } else {
      setShowEndPicker(false);
      const minEndTime =
        startDate === moment().format("YYYY-MM-DD")
          ? new Date(Math.max(getMinimumEndTime().getTime(), new Date().getTime()))
          : getMinimumEndTime();

      if (selectedDate < minEndTime) {
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
        hour: moment(time).hour(),
        minute: moment(time).minute(),
        second: moment(time).second(),
      })
      .format("YYYY-MM-DD HH:mm:ss");
  };

  const handleSubmit = () => {
    if (!startDate || !startTime) {
      alert(t("selectStartMessage"));
      return;
    }
    const startDateTime = formatDateTime(startDate, startTime);
    const endDateTime = endDate
      ? formatDateTime(endDate, endTime)
      : formatDateTime(startDate, endTime || startTime);

    if (!startDateTime || !endDateTime) {
      alert(t("invalidDateTime"));
      return;
    }

    navigation.navigate("CreateGroupActivity", {
      data: { startDateTime, endDateTime },
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
              markingType={"period"}
              markedDates={markedDates}
              onDayPress={onDateSelect}
              theme={{
                todayTextColor: "#B0DB02",
                arrowColor: "#B0DB02",
              }}
            />
          </View>

          <TouchableOpacity style={styles.pickerContainer} onPress={() => setShowStartPicker(true)}>
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

          <TouchableOpacity style={styles.pickerContainer} onPress={() => setShowEndPicker(true)}>
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
            style={[styles.submitButton, (!startDate || !startTime) && styles.disabledButton]}
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
  disabledButton: { backgroundColor: "#c1c1c1" },
  content: { paddingHorizontal: 20, paddingVertical: 10 },
  calendarContainer: { marginBottom: 20 },
  pickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFFB2",
    borderRadius: 20,
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  pickerText: { flex: 1, fontSize: 16 },
  icon: { width: 24, height: 24, marginRight: 10 },
  submitButton: {
    backgroundColor: "#02130B",
    padding: 15,
    alignItems: "center",
    borderRadius: 8,
    marginTop: 20,
  },
  submitText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});

export default ActivityCalendar;
