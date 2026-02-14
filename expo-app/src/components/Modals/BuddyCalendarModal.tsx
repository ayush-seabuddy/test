import GlobalHeader from '@/src/components/GlobalHeader';
import Colors from '@/src/utils/Colors';
import { Clock } from 'lucide-react-native';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import DatePicker from 'react-native-date-picker';

interface BuddyCalendarModalProps {
    visible: boolean;
    onClose: () => void;
    onDateSelect: (dates: {
        startDate: string;
        endDate: string;
        startTime: Date;
        endTime: Date;
    }) => void;
    prefillStartDate?: string | null;
    prefillEndDate?: string | null;
    prefillStartTime?: string | null;
    prefillEndTime?: string | null;
}

const BuddyCalendarModal = ({
    visible,
    onClose,
    onDateSelect,
    prefillStartDate,
    prefillEndDate,
    prefillStartTime,
    prefillEndTime,
}: BuddyCalendarModalProps) => {
    const { t } = useTranslation();

    const todayStr = moment().format('YYYY-MM-DD');

    const [startDate, setStartDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [endTime, setEndTime] = useState<Date | null>(null);
    const [markedDates, setMarkedDates] = useState({});
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    // Prefill data if coming back to edit
    useEffect(() => {
        if (prefillStartDate) {
            setStartDate(prefillStartDate);
            setEndDate(prefillEndDate || prefillStartDate);

            if (prefillStartTime) {
                setStartTime(new Date(prefillStartTime));
            }

            if (prefillEndTime) {
                setEndTime(new Date(prefillEndTime));
            }
        }
    }, [prefillStartDate, prefillEndDate, prefillStartTime, prefillEndTime]);

    useEffect(() => {
        if (startDate && endDate) {
            setMarkedDates(getDateRange(startDate, endDate));
        } else if (startDate) {
            setMarkedDates({
                [startDate]: {
                    selected: true,
                    color: Colors.lightGreen,
                    textColor: '#fff',
                },
            });
        } else {
            setMarkedDates({});
        }
    }, [startDate, endDate]);

    const getDateRange = (start: string, end: string) => {
        const range: any = {};
        let current = new Date(start);
        const endD = new Date(end);

        while (current <= endD) {
            const str = moment(current).format('YYYY-MM-DD');
            range[str] = {
                color: Colors.lightGreen,
                textColor: '#fff',
                startingDay: str === start,
                endingDay: str === end,
            };
            current.setDate(current.getDate() + 1);
        }
        return range;
    };

    const onDateSelectHandler = (day: any) => {
        const selected = day.dateString;
        if (selected < todayStr) return;

        if (!startDate || endDate) {
            setStartDate(selected);
            setEndDate(null);
            setStartTime(null);
            setEndTime(null);
        } else {
            if (selected >= startDate) {
                setEndDate(selected);
            } else {
                setStartDate(selected);
                setEndDate(null);
                setStartTime(null);
                setEndTime(null);
            }
        }
    };

    const getMinimumStartTime = () => {
        if (!startDate || startDate === todayStr) {
            const now = new Date();
            now.setSeconds(0, 0);
            now.setMinutes(now.getMinutes() + 15);
            return now;
        }
        return moment(startDate).startOf('day').toDate();
    };

    const getMinimumEndTime = () => {
        if (!startDate || !startTime) {
            return getMinimumStartTime();
        }

        const effectiveEndDate = endDate ?? startDate;

        if (effectiveEndDate === startDate) {
            const minEnd = new Date(startTime);
            minEnd.setMinutes(minEnd.getMinutes() + 15);
            minEnd.setSeconds(0, 0);
            return minEnd;
        }

        return moment(effectiveEndDate).startOf('day').toDate();
    };

    const getDefaultEndPickerDate = () => {
        if (endTime) return endTime;

        if (!startDate || !startTime) {
            return getMinimumEndTime();
        }

        const effectiveEndDate = endDate ?? startDate;

        if (effectiveEndDate === startDate) {
            return getMinimumEndTime();
        }

        const defaultTime = new Date(startTime);
        defaultTime.setHours(defaultTime.getHours() + 1);
        defaultTime.setMinutes(0);
        defaultTime.setSeconds(0, 0);
        return defaultTime;
    };

    const getTimeLabel = (time: Date | null, placeholder: string) =>
        time ? moment(time).format('hh:mm A') : t(placeholder);

    const handleSubmit = () => {
        if (!startDate || !startTime || !endTime) return;

        const effectiveEndDate = endDate ?? startDate;

        onDateSelect({
            startDate,
            endDate: effectiveEndDate,
            startTime,
            endTime,
        });

        onClose();
    };

    const handleClose = () => {
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={handleClose}
        >
            <View style={styles.main}>
                <View style={styles.appBar}>
                    <GlobalHeader
                        title={t('calendar')}
                        onLeftPress={handleClose}
                    />
                </View>
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.calendarContainer}>
                        <Calendar
                            enableSwipeMonths
                            minDate={todayStr}
                            markingType="period"
                            markedDates={markedDates}
                            onDayPress={onDateSelectHandler}
                            theme={{
                                todayTextColor: Colors.lightGreen,
                                arrowColor: Colors.lightGreen,
                                calendarBackground:'#fafafa'
                                
                            }}
                            style={{ borderWidth: 1, borderColor: '#ededed', borderRadius: 10 }}
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.pickerContainer}
                        onPress={() => setShowStartPicker(true)}
                    >
                        <Clock color={Colors.lightGreen} />
                        <Text style={[styles.pickerText, !startTime && { color: 'gray' }]}>
                            {getTimeLabel(startTime, 'startTime')}
                        </Text>
                    </TouchableOpacity>

                    <DatePicker
                        modal
                        open={showStartPicker}
                        date={startTime || getMinimumStartTime()}
                        mode="time"
                        minimumDate={getMinimumStartTime()}
                        onConfirm={(date) => {
                            setStartTime(date);
                            setEndTime(null);
                            setShowStartPicker(false);
                        }}
                        onCancel={() => setShowStartPicker(false)}
                    />

                    <TouchableOpacity
                        style={styles.pickerContainer}
                        onPress={() => setShowEndPicker(true)}
                    >
                        <Clock color={Colors.lightGreen} />
                        <Text style={[styles.pickerText, !endTime && { color: 'gray' }]}>
                            {getTimeLabel(endTime, 'endTime')}
                        </Text>
                    </TouchableOpacity>

                    <DatePicker
                        modal
                        open={showEndPicker}
                        date={getDefaultEndPickerDate()}
                        mode="time"
                        minimumDate={getMinimumEndTime()}
                        onConfirm={(date) => {
                            setEndTime(date);
                            setShowEndPicker(false);
                        }}
                        onCancel={() => setShowEndPicker(false)}
                    />

                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            (!startDate || !startTime || !endTime) && styles.disabledButton,
                        ]}
                        onPress={handleSubmit}
                        disabled={!startDate || !startTime || !endTime}
                    >
                        <Text style={styles.submitText}>{t('submit')}</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </Modal>
    );
};

export default BuddyCalendarModal;

const styles = StyleSheet.create({
    main: { flex: 1, backgroundColor: '#fff' },
    appBar: { marginTop: 40 },
    content: { paddingHorizontal: 16, paddingVertical: 10 },
    calendarContainer: { marginBottom: 20 },
    pickerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 10,
        backgroundColor: '#fafafa',
        marginBottom: 10,
        borderWidth: 1, borderColor: '#ededed',
        paddingHorizontal: 15,
        paddingVertical: 12,
    },
    pickerText: {
        flex: 1,
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        marginLeft: 10,
    },
    submitButton: {
        backgroundColor: Colors.lightGreen,
        padding: 13,
        alignItems: 'center',
        borderRadius: 8,
        marginTop: 30,
    },
    submitText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
    },
    disabledButton: {
        backgroundColor: '#c1c1c1',
    },
});