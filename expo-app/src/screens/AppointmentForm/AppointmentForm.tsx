// import GlobalHeader from '@/src/components/GlobalHeader'
// import { height, width } from '@/src/utils/helperFunctions'
// import { router } from 'expo-router'
// import { useLocalSearchParams } from 'expo-router/build/hooks'
// import { CalendarRange, ChevronLeft } from 'lucide-react-native'
// import React, { useRef, useState } from 'react'
// import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
// import { ScrollView } from 'react-native-gesture-handler'
// import DoctorProfileDetailsCard from './DoctorProfileDetailsCard'

// const AppointmentForm = () => {
//   const params = useLocalSearchParams<{ data: string }>()
//   const data = typeof params.data === "string" ? JSON.parse(params.data) : params.data;
//   const [appointmentReason, setAppointmentReason] = useState<string>("");
//   const [loading, setLoading] = useState(false);
//   const [date, setDate] = useState(new Date());
//   const [time, setTime] = useState(new Date());
//   const modalRef = useRef(null)
//   const [showDatePickerModal, setShowDatePickerModal] = useState(false);
//   const [showTimePickerModal, setShowTimePickerModal] = useState(false);
//   const [formattedDate, setFormattedDate] = useState("Set date");
//   const [formattedTime, setFormattedTime] = useState("Set time");
//   const handleBookForm = async () => {

//   };

//   const [errors, setErrors] = useState({
//     appointmentReason: "",
//     date: "",
//     time: "",
//     images: "",
//   });

//   return (
//     <View style={{ flex: 1 }}>
//       <GlobalHeader
//         title="Appointment Form"
//         leftIcon={<ChevronLeft size={20} />}
//         onLeftPress={() => { router.back() }}
//       />
//       <ScrollView contentContainerStyle={styles.scrollViewContent}>
//         <View style={styles.contentContainer}>
//           <DoctorProfileDetailsCard data={data} />

//         <View style={{ marginTop: 10 }}>
//           <View
//             style={{
//               backgroundColor: "rgba(255, 255, 255, 0.6)",
//               borderRadius: 20,
//               padding: 16
//             }}
//           >
//             <View style={styles.inputConatiner}>
//               <Text style={styles.label}>Reason for Appointment</Text>
//               <TextInput
//                 style={styles.textArea}
//                 placeholder="Add some description"
//                 value={appointmentReason}
//                 onChangeText={(text) => {
//                   setAppointmentReason(text);
//                   setErrors((prevErrors) => ({
//                     ...prevErrors,
//                     appointmentReason: "",
//                   }));
//                 }}
//                 multiline
//                 placeholderTextColor="#B0B0B0"
//               />
//               {errors.appointmentReason ? (
//                 <Text style={styles.errorText}>
//                   {errors.appointmentReason}
//                 </Text>
//               ) : null}
//             </View>

//           </View>
//         </View>
//         <View style={{ marginTop: 10 }}>
//           <View
//             style={{
//               backgroundColor: "rgba(255, 255, 255, 0.6)",
//               borderRadius: 20,
//               padding: 16,
//             }}
//           >
//             <View style={styles.inputConatiner}>
//               <Text style={styles.label}>Requested Date & Time</Text>
//               <TouchableOpacity
//                 onPress={() => {
//                   // modalRef?.current = true
//                   setShowDatePickerModal(true)
//                 }}
//               >
//                 <View style={styles.rowContainer}>
//                   <Text style={styles.dateText}>{formattedDate}</Text>

//                   <CalendarRange size={20} color="#84A402" />

//                 </View>
//               </TouchableOpacity>
//               {errors.date ? (
//                 <Text style={styles.errorText}>{errors.date}</Text>
//               ) : null}

//               <TouchableOpacity
//                 onPress={() => {
//                   setShowTimePickerModal(true);
//                 }}
//               >
//                 <View style={[styles.rowContainer, { marginTop: 10 }]}>
//                   <Text style={styles.dateText}>{formattedTime}</Text>

//                   <CalendarRange size={20} color="#84A402" />

//                 </View>
//               </TouchableOpacity>
//               {errors.time ? (
//                 <Text style={styles.errorText}>{errors.time}</Text>
//               ) : null}

//             </View>
//           </View>
//         </View>
//         </View>

//       </ScrollView>

//       <View
//         style={{
//           marginTop: 8,
//           position: "absolute",
//           width: "100%",
//           bottom: "2%",
//           paddingHorizontal: 14,
//         }}
//       >
//         <View style={styles.inputConatiner}>
//           <TouchableOpacity
//             style={styles.rowContainerbutton}
//             onPress={handleBookForm}
//           >
//             {loading ? (
//               <ActivityIndicator size={20} color={"white"} />
//             ) : (
//               <Text
//                 style={{
//                   fontSize: 14,
//                   fontFamily: "Poppins-SemiBold",
//                   color: "white",
//                 }}
//               >
//                 Submit
//               </Text>
//             )}
//           </TouchableOpacity>
//         </View>
//       </View>
//     </View>

//   )
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//   },

//   scrollViewContent: {
//     flexGrow: 1,
//     paddingHorizontal: 16,
//     paddingTop: 10,
//     paddingBottom: "20%",
//   },
//   contentContainer: {
//     flex: 1,
//   },
//   headerContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   headerText: {
//     fontSize: 14,
//     fontFamily: "Poppins-Regular",
//   },

//   cardsContainer: {
//     marginTop: "1%",
//   },
//   cardWrapper: {
//     marginTop: 7,
//   },
//   bottomCard: {
//     position: "absolute",
//     width: "100%",
//     height: "92%",
//     bottom: 0,
//     alignItems: "center",
//     justifyContent: "center",
//     overflow: "hidden",
//     zIndex: -1,
//     borderTopLeftRadius: 35,
//     borderTopRightRadius: 35,
//     backgroundColor: "rgba(0, 0, 0, 0.05)",
//   },
//   lottieBackground: {
//     width: width,
//     height: height,
//     position: "absolute",
//   },
//   inputConatiner: {
//     borderRadius: 20,
//   },
//   label: {
//     fontSize: 13,
//     fontFamily: "Poppins-SemiBold",
//     color: "rgb(15, 15, 15)",
//     marginBottom: 8,
//   },
//   textArea: {
//     height: 120,
//     textAlignVertical: "top",
//     padding: 16,
//     fontSize: 14,
//     fontFamily: "Poppins-Regular",
//     color: "black",
//     backgroundColor: "white",
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: "#E0E0E0",
//   },
//   rowContainer: {
//     flexDirection: "row",
//     backgroundColor: "white",
//     padding: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     justifyContent: "space-between",
//     borderWidth: 1,
//     borderColor: "#E0E0E0",
//   },
//   dateText: {
//     fontSize: 14,
//     fontFamily: "Poppins-Regular",
//     color: "black",
//   },
//   calendarIcon: {
//     height: 15,
//     width: 15,
//   },
//   rowContainerpicPHoto: {
//     flexDirection: "row",
//     backgroundColor: "#E6EBE9",
//     padding: 12,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 3,
//     borderWidth: 1,
//     borderColor: "#E0E0E0",
//   },
//   rowContainerbutton: {
//     flexDirection: "row",
//     backgroundColor: "black",
//     padding: 12,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 3,
//   },
//   modalContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "rgba(0, 0, 0, 0.8)",
//   },
//   modalImage: {
//     width: "90%",
//     height: "80%",
//     borderRadius: 12,
//   },
//   closeButton: {
//     position: "absolute",
//     top: 40,
//     right: 20,
//     borderRadius: 18,
//     padding: 5,
//   },
//   closeText: {
//     fontSize: 40,
//     color: "white",
//   },
//   imageContainer: {
//     position: "relative",
//     marginRight: 8,
//   },
//   removeButton: {
//     position: "absolute",
//     top: -16,
//     right: -8,
//     borderRadius: 12,
//     padding: 2,
//   },
//   removeText: {
//     fontSize: 25,
//     color: "red",
//   },
//   optionModalContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "rgba(0, 0, 0, 0.5)",
//   },
//   optionModalContent: {
//     backgroundColor: "white",
//     borderRadius: 12,
//     padding: 20,
//     width: "80%",
//   },
//   optionButton: {
//     padding: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: "#E0E0E0",
//     width: "100%",
//     alignItems: "center",
//   },
//   optionText: {
//     fontSize: 16,
//     fontFamily: "Poppins-SemiBold",
//     color: "red",
//   },
//   dateTimeModalContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "rgba(0, 0, 0, 0.5)",
//   },
//   dateTimeModalContent: {
//     backgroundColor: "white",
//     borderRadius: 12,
//     padding: 20,
//     width: "80%",
//     alignItems: "center",
//   },
//   errorText: {
//     color: "red",
//     fontSize: 12,
//     marginTop: 4,
//   },
// });

// export default AppointmentForm 



import { bookAppointmentWithDoctor } from '@/src/apis/apiService';
import GlobalHeader from '@/src/components/GlobalHeader';
import { showToast } from '@/src/components/GlobalToast';
import { router } from 'expo-router';
import { useLocalSearchParams } from 'expo-router/build/hooks';
import { CalendarRange, ChevronLeft, Clock, X } from 'lucide-react-native';
import moment from 'moment';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import DatePicker from 'react-native-date-picker';
import { ScrollView } from 'react-native-gesture-handler';
import DoctorProfileDetailsCard from './DoctorProfileDetailsCard';

const AppointmentForm = () => {
  const params = useLocalSearchParams<{ data: string }>();
  const data = typeof params.data === 'string' ? JSON.parse(params.data) : params.data;

  const [appointmentReason, setAppointmentReason] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Selected date and time
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<Date>(new Date());

  // Modal visibility
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Formatted display
  const formattedDate = moment(selectedDate).format('dddd, MMMM D, YYYY');
  const formattedTime = moment(selectedTime).format('h:mm A');
  const [errors, setErrors] = useState({
    appointmentReason: '',
    date: '',
    time: '',
  });
  const validateForm = () => {
  let valid = true;
  const newErrors = { appointmentReason: '', date: '', time: '' };

  if (!appointmentReason.trim()) {
    newErrors.appointmentReason = 'Please provide a reason for the appointment';
    valid = false;
  } else if (appointmentReason.trim().length < 10) {
    newErrors.appointmentReason = 'Reason should be at least 10 characters';
    valid = false;
  }

  // Prevent selecting past dates
  const today = moment().startOf('day');
  const chosenDate = moment(selectedDate).startOf('day');
  if (chosenDate.isBefore(today)) {
    newErrors.date = 'Please select a current or future date';
    valid = false;
  }

  setErrors(newErrors);
  return valid;
};

  const handleBookForm = async () => {
     setErrors({ appointmentReason: '', date: '', time: '' }); // Clear previous errors

  if (!validateForm()) {
    return; // Stop submission if invalid
  }

  setLoading(true);

  try {
    const appointmentDateTime = new Date(selectedDate);
    appointmentDateTime.setHours(selectedTime.getHours());
    appointmentDateTime.setMinutes(selectedTime.getMinutes());
    appointmentDateTime.setSeconds(0);
    appointmentDateTime.setMilliseconds(0);

    const body = {
      doctorId: data.id,
      description: appointmentReason.trim(),
      dateTime: appointmentDateTime.toISOString(),
    };

    const response = await bookAppointmentWithDoctor(body);

    if (response?.status === 200 || response?.status === 201) {
      showToast.success('Success', 'Your appointment has been booked successfully.');
 

      // Optional: go back after success
      setTimeout(() => router.back(), 1500);
    } else {
      showToast.error('Failed', 'Could not book appointment. Please try again.');
    }
  } catch (error: any) {
    showToast.error('Error', error?.message || 'Something went wrong. Please try again.');
  } finally {
    setLoading(false);
  }
  };



  // Highlight selected date in calendar
  const markedDates = {
    [moment(selectedDate).format('YYYY-MM-DD')]: {
      selected: true,
      selectedColor: '#84A402',
      selectedTextColor: '#FFFFFF',
    },
  };

  return (
    <View style={{ flex: 1 }}>
      <GlobalHeader
        title="Appointment Form"
        leftIcon={<ChevronLeft size={20} />}
        onLeftPress={() => router.back()}
      />

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.contentContainer}>
          <DoctorProfileDetailsCard data={data} />

          {/* Reason for Appointment */}
          <View style={{ marginTop: 10 }}>
            <View style={styles.cardBackground}>
              <View style={styles.inputConatiner}>
                <Text style={styles.label}>Reason for Appointment</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Add some description"
                  value={appointmentReason}
                  onChangeText={(text) => {
                    setAppointmentReason(text);
                    setErrors((prev) => ({ ...prev, appointmentReason: '' }));
                  }}
                  multiline
                  placeholderTextColor="#B0B0B0"
                />
                {errors.appointmentReason && (
                  <Text style={styles.errorText}>{errors.appointmentReason}</Text>
                )}
              </View>
            </View>
          </View>

          {/* Date & Time Selection */}
          <View style={{ marginTop: 10 }}>
            <View style={styles.cardBackground}>
              <View style={styles.inputConatiner}>
                <Text style={styles.label}>Requested Date & Time</Text>

                {/* Date Selector */}
                <TouchableOpacity onPress={() => setShowCalendar(true)}>
                  <View style={styles.rowContainer}>
                    <Text style={styles.dateText}>{formattedDate}</Text>
                    <CalendarRange size={20} color="#84A402" />
                  </View>
                </TouchableOpacity>
                {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}

                {/* Time Selector */}
                <TouchableOpacity onPress={() => setShowTimePicker(true)} style={{ marginTop: 10 }}>
                  <View style={styles.rowContainer}>
                    <Text style={styles.dateText}>{formattedTime}</Text>
                    <Clock size={20} color="#84A402" />
                  </View>
                </TouchableOpacity>
                {errors.time && <Text style={styles.errorText}>{errors.time}</Text>}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Calendar Modal - Stays open after selection */}
      <Modal visible={showCalendar} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.calendarContainer}>
            <View style={styles.calendarHeader}>
              <Text style={styles.calendarTitle}>Select Date</Text>
              <TouchableOpacity onPress={() => setShowCalendar(false)}>
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <Calendar
              current={moment(selectedDate).format('YYYY-MM-DD')}
              markedDates={markedDates}
              onDayPress={(day) => {
                // Update selection but KEEP modal open
                setSelectedDate(new Date(day.timestamp));
              }}
              minDate={moment().format('YYYY-MM-DD')} // Disable past dates
              theme={{
                selectedDayBackgroundColor: '#84A402',
                selectedDayTextColor: '#FFFFFF',
                todayTextColor: '#84A402',
                arrowColor: '#84A402',
                textDayFontFamily: 'Poppins-Regular',
                textMonthFontFamily: 'Poppins-SemiBold',
                textDayHeaderFontFamily: 'Poppins-Medium',
                monthTextColor: '#000',
                textSectionTitleColor: '#888',
              }}
            />

            {/* Confirm Button */}
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => setShowCalendar(false)}
            >
              <Text style={styles.confirmButtonText}>Confirm Date</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Time Picker Modal */}
      <DatePicker
        modal
        open={showTimePicker}
        date={selectedTime}
        mode="time"
        onConfirm={(time) => {
          setSelectedTime(time);
          setShowTimePicker(false);
        }}
        onCancel={() => setShowTimePicker(false)}
      />

      {/* Submit Button */}
      <View style={styles.bottomButtonContainer}>
        <View style={styles.inputConatiner}>
          <TouchableOpacity style={styles.submitButton} onPress={handleBookForm}>
            {loading ? (
              <ActivityIndicator size={20} color="white" />
            ) : (
              <Text style={styles.submitText}>Submit</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: '20%',
  },
  contentContainer: {
    flex: 1,
  },
  cardBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 20,
    padding: 16,
  },
  inputConatiner: {
    borderRadius: 20,
  },
  label: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: 'rgb(15, 15, 15)',
    marginBottom: 8,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    padding: 16,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: 'black',
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  rowContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dateText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: 'black',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  bottomButtonContainer: {
    position: 'absolute',
    width: '100%',
    bottom: '2%',
    paddingHorizontal: 14,
  },
  submitButton: {
    backgroundColor: 'black',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#000',
  },
  confirmButton: {
    backgroundColor: '#84A402',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
});

export default AppointmentForm;