import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import ProfleSettingHeader from "../component/headers/ProfileHeader/ProfleSettingHeader";
import { Calendar } from "react-native-calendars";
import FocusAwareStatusBar from "../statusbar/FocusAwareStatusBar";
import Colors from "../colors/Colors";
import moment from "moment";
import CustomDateTimePicker from "./Modals/CustomDateTimePicker";

const ActivityCalendar = ({ navigation, route }) => {
  const { Data } = route?.params || {};

  const extractDateTime = (dateTimeString) => {
    const momentObj = moment(dateTimeString);
    return {
      date: momentObj.format("YYYY-MM-DD"),
      time: momentObj.toDate(),
    };
  };

  let initialStartDate = null;
  let initialEndDate = null;
  let initialStartTime = null;
  let initialEndTime = null;

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

  // Minimum start time = current time + 15 minutes
  const getMinimumStartTime = () => {
    const now = new Date();
    now.setSeconds(0);
    now.setMilliseconds(0);
    now.setMinutes(now.getMinutes() + 15); // add 15 min
    return now;
  };

  const getMinimumEndTime = () => {
    if (startTime) {
      return new Date(startTime.getTime() + 15 * 60 * 1000);
    }
    return getMinimumStartTime();
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
  }, [initialStartDate, initialEndDate]);

  const onDateSelect = (day) => {
    const selectedDate = day.dateString;
    const today = moment().format("YYYY-MM-DD");

    if (selectedDate < today) {
      alert("Cannot select a past date.");
      return;
    }

    if (!startDate || (startDate && endDate)) {
      setStartDate(selectedDate);
      setEndDate(null);
      setMarkedDates({
        [selectedDate]: {
          selected: true,
          color: "#6ab04c",
          textColor: "white",
        },
      });
    } else {
      if (selectedDate > startDate) {
        setEndDate(selectedDate);
        setMarkedDates(getDateRange(startDate, selectedDate));
      } else {
        setStartDate(selectedDate);
        setMarkedDates({
          [selectedDate]: {
            selected: true,
            color: "#6ab04c",
            textColor: "white",
          },
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
        alert(`Start time must be at least 15 minutes from now.`);
        return;
      }

      setStartTime(selectedDate);

      // Update end time if needed
      if (endTime && endTime < new Date(selectedDate.getTime() + 15 * 60 * 1000)) {
        setEndTime(new Date(selectedDate.getTime() + 15 * 60 * 1000));
      }

    } else {
      setShowEndPicker(false);

      const minEndTime = startDate === moment().format("YYYY-MM-DD")
        ? new Date(Math.max(getMinimumEndTime().getTime(), new Date().getTime()))
        : getMinimumEndTime();

      if (selectedDate < minEndTime) {
        alert("End time must be at least 15 minutes after start time and not in the past.");
        return;
      }

      setEndTime(selectedDate);
    }
  };

  const getTimeLabel = (time, placeholder) => {
    return time ? moment(time).format("hh:mm A") : placeholder;
  };

  const formatDateTime = (date, time) => {
    if (!date || !time) {
      console.warn(`Invalid date or time: date=${date}, time=${time}`);
      return null;
    }
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
      alert("Please select a start date and time.");
      return;
    }

    const startDateTime = formatDateTime(startDate, startTime);
    const endDateTime = endDate
      ? formatDateTime(endDate, endTime)
      : formatDateTime(startDate, endTime || startTime);

    if (!startDateTime || !endDateTime) {
      alert("Invalid date or time selected. Please try again.");
      return;
    }

    console.log("📤 Sending to CreateGroupActivity:", {
      data: { startDateTime, endDateTime },
    });

    navigation.navigate("CreateGroupActivity", {
      data: { startDateTime, endDateTime },
    });
  };

  return (
    <>
      <FocusAwareStatusBar
        barStyle={Platform.OS === "ios" ? "light-content" : "light-content"}
        backgroundColor={Colors.white}
      />
      <ProfleSettingHeader
        navigation={navigation}
        title="Create your BuddyUp event"
      />

      <View style={styles.container}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.calendarContainer}>
            <Calendar
              enableSwipeMonths={true}
              minDate={new Date()}
              markingType={"period"}
              markedDates={markedDates}
              onDayPress={onDateSelect}
              theme={{
                selectedDayBackgroundColor: "#B0DB02",
                selectedDayTextColor: "blue",
                todayTextColor: "#B0DB02",
                arrowColor: "#B0DB02",
              }}
            />
          </View>

          <TouchableOpacity
            style={styles.pickerContainer}
            onPress={() => setShowStartPicker(true)}
          >
            <Image
              source={require("../assets/images/NewPostImage/clock.png")}
              style={styles.icon}
            />
            <Text style={[styles.pickerText, !startTime && { color: "gray" }]}>
              {getTimeLabel(startTime, "Start Time")}
            </Text>
          </TouchableOpacity>
          {showStartPicker && (
            <CustomDateTimePicker
              value={startTime || getMinimumStartTime()}
              mode="time"
              minimumDate={getMinimumStartTime()} // allow exactly 15 minutes from now
              onChange={(event, date) => handleTimeChange(event, date, "start")}
              isVisible={showStartPicker}
              onClose={() => setShowStartPicker(false)}
            />

          )}

          <TouchableOpacity
            style={styles.pickerContainer}
            onPress={() => setShowEndPicker(true)}
          >
            <Image
              source={require("../assets/images/NewPostImage/clock.png")}
              style={styles.icon}
            />
            <Text style={[styles.pickerText, !endTime && { color: "gray" }]}>
              {getTimeLabel(endTime, "End Time")}
            </Text>
          </TouchableOpacity>
          {showEndPicker && (
            <CustomDateTimePicker
              value={endTime || getMinimumEndTime()}
              mode="time"
              minimumDate={startDate === endDate ? getMinimumEndTime() : getMinimumStartTime()}
              onChange={(event, date) => handleTimeChange(event, date, "end")}
              isVisible={showEndPicker}
              onClose={() => setShowEndPicker(false)}
              cancelText="Cancel"
              confirmText="Done"
              containerStyle={{ backgroundColor: "#fff" }}
              buttonTextStyle={{ fontSize: 18, color: "#84A402" }}
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
            <Text style={styles.submitText}>Submit</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  disabledButton: {
    backgroundColor: "#c1c1c1",
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  calendarContainer: {
    marginBottom: 20,
  },
  pickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFFB2",
    borderRadius: 20,
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  pickerText: {
    flex: 1,
    fontSize: 16,
    color: "gray",
  },
  icon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
    marginRight: 10,
  },
  submitButton: {
    backgroundColor: "#02130B",
    padding: 15,
    alignItems: "center",
    borderRadius: 8,
    marginTop: 20,
  },
  submitText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default ActivityCalendar;
