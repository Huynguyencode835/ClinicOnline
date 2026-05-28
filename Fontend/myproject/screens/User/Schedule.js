import { View, ScrollView, RefreshControl } from "react-native";
import { useEffect, useRef, useState } from "react";
import { Button, SegmentedButtons, Text, Card, Icon } from "react-native-paper";
import Mystyles from "../../styles/Mystyles";
import DaychipGroup from "../../components/Schedule/DayChipGroup";
import TimeSlot from "../../components/Schedule/TimeSlot";
import { createWithAuth, deleteWithAuth, fetchWithAuth, updatePatchWithAuth, updateWithAuth } from "../../utils/apiHelper";
import { endpoints } from "../../configs/Apis";
import { Calendar } from 'react-native-calendars';
import AppButton from "../../components/AppButton";
import AppSnackbar from "../../components/AppSnackbar";
import LoadingScreen from "../../components/LoadingScreen";
import AppHeader from "../../components/AppHeader";
import { useNavigation } from '@react-navigation/native';
import { useSnackbar } from "../../utils/contexts/SnackBarContext";
import TimeShift from "../../components/Schedule/TimeShift";
import { SectionLabel } from "../Appointment/Step1Schedule";
import { useAlert } from "../../utils/contexts/AlertContext";

const Schedule = ({ route }) => {
    const navigation = useNavigation();
    const [shift, setShift] = useState('morning');
    const [selectedDay, setSelectedDay] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const { showAlert } = useAlert();
    const [loading, setLoading] = useState(false);
    const [loadingFetch, setLoadingFetch] = useState(false);
    const hasChangedRef = useRef(false);
    const [loadingInit, setLoadingInit] = useState(true); 

    const generateSlots = (fromHour, toHour, duration = 60, step = 15) => {
        const slots = [];
        let startMinutes = fromHour * 60;
        const limitMinutes = toHour * 60;


        const fmt = (m) => {
            const h = Math.floor(m / 60).toString().padStart(2, '0');
            const min = (m % 60).toString().padStart(2, '0');
            return `${h}:${min}:00`;
        };

        while (startMinutes + duration <= limitMinutes) {
            const endMinutes = startMinutes + duration;
            slots.push({
                start_time: fmt(startMinutes),
                end_time: fmt(endMinutes),
                label: `${fmt(startMinutes)} - ${fmt(endMinutes)}`,
            });
            startMinutes += step;
        }
        return slots;
    };

    const DAY_KEYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const DAYS = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i + 1);
        return {
            key: DAY_KEYS[date.getDay()],
            value: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
        };
    });

    const [schedule, setSchedule] = useState({
        "date": DAYS[0].value,
        "time_slots": []
    })
    const SLOTS = {
        morning: generateSlots(6, 12),
        afternoon: generateSlots(12, 18),
        evening: generateSlots(18, 22),
    };
    const today = new Date();
    const minDate = DAYS[0].value;
    const maxDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const [selectDay, setSelectDay] = useState([])
    const { showSnackbar } = useSnackbar();
    const [currentMonth, setCurrentMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    });

    const loadWorkDay = async (isRefreshing = false, month = currentMonth) => {
        if (isRefreshing) {
            setRefreshing(true);
        }
        await fetchWithAuth(
            endpoints.workday,
            (data) => {
                setSelectDay(data)
            },
            (type, msg, errData) => {
                showSnackbar(msg, 'error', errData ? JSON.stringify(errData) : '')
            }, { month: month },
            setLoadingFetch
        )
        setRefreshing(false);
        setLoadingInit(false);
    }

    const loadDetailWorkday = async (id) => {
        await fetchWithAuth(
            endpoints.workdayDetail(id),
            (data) => {
                setSchedule(prev => ({ ...prev, time_slots: data.time_slots }));
            },
            (type, msg, errData) => {
                showSnackbar(msg, 'error', errData ? JSON.stringify(errData) : '')
            }, {},
            setLoadingFetch
        )
    }

    const deleteWorkday = async (id) => {
        await deleteWithAuth(
            endpoints.workdayDetail(id),
            () => {
                navigation.navigate("WorkdayTab", { deleted: true });
            },
            (errType, errMsg) => {
                if (errType === "server") {
                    showSnackbar("Không thể xóa ngày làm việc đã có lịch hẹn!", "warning");
                } else
                    showSnackbar("Xóa thất bại vui lòng thử lại", "error");
            }, setLoadingFetch
        );
    };

    const markedDates = selectDay.map(d => d.date).reduce((acc, date) => {
        acc[date] = {
            marked: true,
            dotColor: '#E24B4A',
        };
        return acc;
    }, {});

    const createWorkday = async () => {
        await createWithAuth(
            endpoints.workday,
            schedule,
            (data) => {
                showSnackbar("Tạo lịch trình thành công!", "success");
                loadWorkDay()
                setSchedule({
                    date: DAYS[0].value,
                    time_slots: []
                });
            },
            (type, msg, errData) => {
                showSnackbar(msg, "error", errData ? JSON.stringify(errData) : "");
            },
            setLoading
        )
    }

    const buildPayload = (schedule) => ({
        date: schedule.date,
        time_slots: schedule.time_slots.map(slot => {
            const s = {
                start_time: slot.start_time,
                end_time: slot.end_time,
            };
            if (slot.id !== undefined && slot.id !== null) {
                s.id = slot.id;
                s.status = slot.status;
            }
            return s;
        })
    });

    const updateWorkday = async (id) => {
        await updatePatchWithAuth(
            endpoints.updateworkday(id),
            buildPayload(schedule),
            (data) => {
                showSnackbar("Cập nhật lịch trình thành công!", "success");
                loadWorkDay();
            },
            (type, msg, errData) => {
                showSnackbar(msg, "error", errData ? JSON.stringify(errData) : "");
            },
            setLoading
        );
    };

    useEffect(() => {
        if (!route.params?.id){
            loadWorkDay(currentMonth)
        } 
        else {
            loadDetailWorkday(route.params.id);
        }
    }, [route.params?.id, currentMonth]);


    if (schedule.date) {
        markedDates[schedule.date] = {
            ...markedDates[schedule.date],
            selected: true,
            selectedColor: '#185FA5',
        };
    }

    if (loadingInit) return <LoadingScreen text="Đang tải thông tin..." />;

    const formattedSlots = schedule.time_slots.map(slot => ({
        ...slot,
        label: `${slot.start_time} - ${slot.end_time}`,
    }));

    return (
        <View style={{ flex: 1 }}>
            <AppHeader titles="Lịch làm việc" onBack={() => {
                navigation.goBack()
            }}>

            </AppHeader>
            <ScrollView
                style={{
                    marginTop: 16, paddingHorizontal: 16
                }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => loadWorkDay(true)}
                    />
                }
            >
                {!route.params?.id && (
                    <>
                        <SectionLabel text="Chọn ngày trong tuần" />
                        <Card style={{
                            marginBottom: 16,
                            borderRadius: 16,
                            backgroundColor: '#fff',
                            elevation: 2
                        }}>
                            <Card.Content>
                                <Calendar
                                    onDayPress={(day) => {
                                        if (selectDay.map(d => d.date).includes(day.dateString)) return;
                                        setSchedule(prev => ({ ...prev, date: day.dateString }));
                                    }}
                                    onMonthChange={(month) => {
                                        const key = `${month.year}-${String(month.month).padStart(2, "0")}`;
                                        setCurrentMonth(key);
                                    }}
                                    markedDates={markedDates}
                                    // minDate={minDate}
                                // maxDate={maxDate}
                                />
                            </Card.Content>
                        </Card>
                    </>
                )}

                <SectionLabel text="Chọn ca làm việc" />
                <TimeShift shift={shift} setShift={setShift} />

                <SectionLabel text="Chọn Khung giờ" />
                <Card style={{
                    marginBottom: 16,
                    borderRadius: 16,
                    backgroundColor: '#fff',
                    elevation: 2
                }}>
                    <Card.Content>
                        <View style={{
                            flex: 1,
                            alignItems: 'center'
                        }}>
                            <TimeSlot
                                shift={shift}
                                selectedSlots={schedule.time_slots}
                                SLOTS={SLOTS}
                                onSlotsChange={(slots) => {
                                    setSchedule(prev => ({ ...prev, time_slots: slots }))
                                    hasChangedRef.current = true;
                                }}
                            />
                        </View>
                    </Card.Content>

                </Card>

                {schedule.time_slots.length > 0 && (
                    <Card style={{
                        marginBottom: 16,
                        borderRadius: 16,
                        backgroundColor: '#ecfeff',
                        borderWidth: 1,
                        borderColor: '#a5f3fc',
                        elevation: 0,
                    }}>
                        <Card.Content>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                                <Icon source="clock-check-outline" size={16} color="#0891b2" />
                                <Text style={{ fontWeight: '700', color: '#155e75', fontSize: 13 }}>
                                    Đã chọn ({schedule.time_slots.length} khung giờ)
                                </Text>
                            </View>

                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                                {schedule.time_slots.map((s, i) => (
                                    <View key={i} style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: 4,
                                        backgroundColor: '#cffafe',
                                        borderRadius: 20,
                                        paddingHorizontal: 10,
                                        paddingVertical: 4,
                                        borderWidth: 1,
                                        borderColor: '#67e8f9',
                                    }}>
                                        <Icon source="clock-outline" size={12} color="#0891b2" />
                                        <Text style={{ fontSize: 12, color: '#0e7490', fontWeight: '600' }}>
                                            {s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </Card.Content>
                    </Card>
                )}

            </ScrollView>
            {!route.params?.id ? (
                <AppButton
                    type="save"
                    label="Lưu lịch trình"
                    disabled={schedule.time_slots.length === 0 ? true : false}
                    loading={loading}
                    onPress={() => createWorkday()}
                />
            ) : (
                <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                    <View style={{ flex: 1 }}>
                        <AppButton
                            type="save"
                            label="Cập nhật lịch trình"
                            disabled={!hasChangedRef.current}
                            loading={loading}
                            onPress={() => {
                                updateWorkday(route.params?.id)
                            }}
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <AppButton
                            type="delete"
                            label="Xóa lịch trình"
                            onPress={() => showAlert({
                                type: 'danger',
                                title: 'Xác nhận xóa',
                                message: 'Bạn có chắc muốn xóa ngày làm việc này? Hành động này không thể hoàn tác.',
                                actions: [
                                    {
                                        text: 'Hủy',
                                        style: 'cancel',
                                    },
                                    {
                                        text: 'Xóa',
                                        onPress: () => deleteWorkday(route.params?.id),
                                    },
                                ],
                            })}
                        />
                    </View>
                </View>
            )}

        </View>
    );
};

export default Schedule;