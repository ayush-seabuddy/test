import { bookAppointmentWithDoctor } from '@/src/apis/apiService';
import GlobalHeader from '@/src/components/GlobalHeader';
import { showToast } from '@/src/components/GlobalToast';
import { router } from 'expo-router';
import { useLocalSearchParams } from 'expo-router/build/hooks';
import { CalendarRange, ChevronLeft, Clock, X } from 'lucide-react-native';
import moment from 'moment';
import React, { useMemo, useState } from 'react';
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
import { t } from 'i18next';

const AppointmentForm = () => {
  const params = useLocalSearchParams<{ data: string }>();
  const data = typeof params.data === 'string' ? JSON.parse(params.data) : params.data;

  const [appointmentReason, setAppointmentReason] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // Derive formatted values only when selections exist
  const formattedDate = selectedDate ? moment(selectedDate).format('dddd, MMMM D, YYYY') : t('select_date');
  const formattedTime = selectedTime ? moment(selectedTime).format('h:mm A') : t('select_time');

  // Proper form validation using memo with correct dependencies
  const isFormValid = useMemo(() => {
    if (!appointmentReason.trim() || appointmentReason.trim().length < 10) return false;
    if (!selectedDate || !selectedTime) return false;

    const now = moment();
    const chosenDateTime = moment(selectedDate)
      .hours(selectedTime.getHours())
      .minutes(selectedTime.getMinutes());

    return chosenDateTime.isSameOrAfter(now);
  }, [appointmentReason, selectedDate, selectedTime]);

  const handleBookForm = async () => {
    if (!isFormValid) return;

    setLoading(true);

    try {
      const chosenDateTime = moment(selectedDate!)
        .hours(selectedTime!.getHours())
        .minutes(selectedTime!.getMinutes());

      const body = {
        doctorId: data.id,
        description: appointmentReason.trim(),
        dateTime: chosenDateTime.toISOString(),
      };

      const response = await bookAppointmentWithDoctor(body);

      if (response?.status === 200 || response?.status === 201) {
        showToast.success(t('success'), t('appointment_booked_success'));
        router.back(); // Immediate navigation after success
      } else {
        showToast.error(t('failed'), t('appointment_book_failed'));
      }
    } catch (error: any) {
      showToast.error(t('error'), error?.message || t('something_went_wrong'));
    } finally {
      setLoading(false);
    }
  };

  const markedDates = selectedDate
    ? { [moment(selectedDate).format('YYYY-MM-DD')]: { selected: true, selectedColor: '#84A402', selectedTextColor: '#fff' } }
    : {};

  return (
    <View style={styles.container}>
      <GlobalHeader
        title={t('Book_Appointment')}
        leftIcon={<ChevronLeft size={20} />}
        onLeftPress={() => router.back()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <DoctorProfileDetailsCard data={data} />

          {/* Reason */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('reason_for_appointment')}</Text>
            <View style={styles.inputCard}>
              <TextInput
                style={styles.textArea}
                placeholder={t('describe_your_reason')}
                value={appointmentReason}
                onChangeText={setAppointmentReason}
                multiline
                placeholderTextColor="#999"
              />
            </View>
          </View>

          {/* Date & Time */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('requested_date_time')}</Text>
            <View style={styles.inputCard}>
              <TouchableOpacity style={styles.pickerRow} onPress={() => setShowCalendar(true)}>
                <Text style={[styles.pickerText, !selectedDate && styles.placeholderText]}>
                  {formattedDate}
                </Text>
                <CalendarRange size={22} color="#84A402" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.pickerRow, { marginTop: 12 }]}
                onPress={() => selectedDate && setShowTimePicker(true)}
                disabled={!selectedDate}
              >
                <Text style={[styles.pickerText, !selectedTime && styles.placeholderText]}>
                  {formattedTime}
                </Text>
                <Clock size={22} color={selectedDate ? '#84A402' : '#aaa'} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Calendar Modal */}
      <Modal visible={showCalendar} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.calendarModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('select_date')}</Text>
              <TouchableOpacity onPress={() => setShowCalendar(false)}>
                <X size={26} color="#000" />
              </TouchableOpacity>
            </View>

            <Calendar
              minDate={moment().format('YYYY-MM-DD')}
              markedDates={markedDates}
              onDayPress={(day) => {
                setSelectedDate(new Date(day.timestamp));
                setSelectedTime(null); // Reset time when date changes
              }}
              theme={{
                selectedDayBackgroundColor: '#84A402',
                selectedDayTextColor: '#fff',
                todayTextColor: '#84A402',
                arrowColor: '#84A402',
              }}
            />

            <TouchableOpacity style={styles.confirmBtn} onPress={() => setShowCalendar(false)}>
              <Text style={styles.confirmBtnText}>{t('confirm_date')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Time Picker Modal */}
      <DatePicker
        modal
        open={showTimePicker}
        date={selectedTime || new Date()}
        mode="time"
        onConfirm={(time) => {
          setSelectedTime(time);
          setShowTimePicker(false);
        }}
        onCancel={() => setShowTimePicker(false)}
      />

      {/* Submit Button */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={[styles.submitButton, (!isFormValid || loading) && styles.submitButtonDisabled]}
          onPress={handleBookForm}
          disabled={!isFormValid || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size={22} />
          ) : (
            <Text style={styles.submitButtonText}>{t('submit')}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 },
  formContainer: { gap: 20 },
  section: { gap: 10 },
  sectionTitle: { fontSize: 15, fontFamily: 'Poppins-SemiBold', color: '#1a1a1a' },
  inputCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#333',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  pickerText: { fontSize: 15, fontFamily: 'Poppins-Medium', color: '#333' },
  placeholderText: { color: '#999' },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
  },
  submitButton: {
    backgroundColor: '#84A402',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#84A402',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: '#a0a0a0',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: { color: '#fff', fontSize: 16, fontFamily: 'Poppins-SemiBold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  calendarModal: { backgroundColor: '#fff', borderRadius: 20, width: '92%', padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontFamily: 'Poppins-SemiBold', color: '#000' },
  confirmBtn: { backgroundColor: '#84A402', paddingVertical: 14, borderRadius: 14, marginTop: 20, alignItems: 'center' },
  confirmBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Poppins-SemiBold' },
});

export default AppointmentForm;