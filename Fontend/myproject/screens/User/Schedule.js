import { View, ScrollView } from "react-native";
import { useState } from "react";
import {
    Button,
    SegmentedButtons,
    Text,
    Card
} from "react-native-paper";
import Mystyles from "../../styles/Mystyles";
import DaychipGroup from "../../components/Schedule/DayChipGroup";
import TimeSlot from "../../components/Schedule/TimeSlot";

const Schedule = () => {

    const [shift, setShift] = useState('morning');
    const [selectedDays, setSelectedDays] = useState(null);
    const [schedule, setSchedule] = useState([]);
    const [selectedSlots, setSelectedSlots] = useState([]);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);


    const generateSlots = (fromHour, toHour, duration = 60, step = 15) => {
        const slots = [];
        let startMinutes = fromHour * 60;
        const limitMinutes = toHour * 60;

        const fmt = (m) => {
            const h = Math.floor(m / 60).toString().padStart(2, '0');
            const min = (m % 60).toString().padStart(2, '0');
            return `${h}:${min}`;
        };

        while (startMinutes + duration <= limitMinutes) {
            const endMinutes = startMinutes + duration;
            slots.push({
                start: fmt(startMinutes),
                end: fmt(endMinutes),
                label: `${fmt(startMinutes)} - ${fmt(endMinutes)}`,
            });
            startMinutes += step;
        }
        return slots;
    };

    const SLOTS = {
        morning: generateSlots(6, 12),
        afternoon: generateSlots(12, 18),
        evening: generateSlots(18, 22),
    };

    return (
        <ScrollView
            style={{
                marginTop: 100, paddingHorizontal: 16
            }}
            showsVerticalScrollIndicator={false}
        >
            {/* TITLE */}
            <Text
                variant="titleLarge"
                style={{
                    marginBottom: 16,
                    fontWeight: '700',
                    color: '#0f172a'
                }}
            >
                Tạo lịch làm việc
            </Text>

            {/* DATE RANGE */}
            <Card style={{
                marginBottom: 16,
                borderRadius: 16,
                backgroundColor: '#fff',
                elevation: 2
            }}>
                <Card.Content>
                    <Text style={{
                        marginBottom: 10,
                        fontWeight: '600',
                        color: '#0f766e'
                    }}>
                        Khoảng thời gian
                    </Text>

                    <View style={{
                        flexDirection: 'row',
                        gap: 10
                    }}>

                        <Button
                            mode="outlined"
                            style={{
                                flex: 1,
                                borderRadius: 12,
                                borderColor: '#38bdf8'
                            }}
                            textColor="#0369a1"
                            onPress={() => setStartDate(new Date())}
                        >
                            {startDate
                                ? startDate.toLocaleDateString('vi-VN')
                                : 'Ngày bắt đầu'}
                        </Button>

                        <Button
                            mode="outlined"
                            style={{
                                flex: 1,
                                borderRadius: 12,
                                borderColor: '#38bdf8'
                            }}
                            textColor="#0369a1"
                            onPress={() => {
                                const d = new Date();
                                d.setDate(d.getDate() + 3);
                                setEndDate(d);
                            }}
                        >
                            {endDate
                                ? endDate.toLocaleDateString('vi-VN')
                                : 'Ngày kết thúc'}
                        </Button>

                    </View>
                </Card.Content>
            </Card>

            {/* DAYS */}
            <Card style={{
                marginBottom: 16,
                borderRadius: 16,
                backgroundColor: '#fff',
                elevation: 2
            }}>
                <Card.Content>

                    <Text style={{
                        marginBottom: 10,
                        fontWeight: '600',
                        color: '#0f766e'
                    }}>
                        Chọn ngày trong tuần
                    </Text>

                    <DaychipGroup
                        selected={selectedDays}
                        onToggle={(day) => {
                            setSelectedDays(day);
                            setShift('morning');
                            setSelectedSlots([]);
                        }}
                    />

                </Card.Content>
            </Card>

            {/* SHIFT */}
            <Card style={{
                marginBottom: 16,
                borderRadius: 16,
                backgroundColor: '#fff',
                elevation: 2
            }}>
                <Card.Content>

                    <Text style={{
                        marginBottom: 10,
                        fontWeight: '600',
                        color: '#0f766e'
                    }}>
                        Chọn ca làm việc
                    </Text>

                    <SegmentedButtons
                        value={shift}
                        onValueChange={(value) => {
                            setShift(value);
                            setSelectedSlots([]);
                        }}
                        style={{
                            marginTop: 4,
                            borderRadius: 14,
                            backgroundColor: '#f1f5f9',
                            padding: 4,
                        }}
                        theme={{
                            colors: {
                                secondaryContainer: '#2196F3',
                                onSecondaryContainer: '#ffffff',
                                outline: '#e2e8f0',
                            },
                        }}
                        buttons={[
                            {
                                value: 'morning',
                                label: 'Sáng',
                                style: {
                                    borderRadius: 10,
                                },
                            },
                            {
                                value: 'afternoon',
                                label: 'Chiều',
                                style: {
                                    borderRadius: 10,
                                },
                            },
                            {
                                value: 'evening',
                                label: 'Tối',
                                style: {
                                    borderRadius: 10,
                                },
                            },
                        ]}
                    />

                </Card.Content>
            </Card>

            {/* TIME SLOT */}
            <Card style={{
                marginBottom: 16,
                borderRadius: 16,
                backgroundColor: '#fff',
                elevation: 2
            }}>
                <Card.Content>

                    <TimeSlot
                        shift={shift}
                        selectedSlots={selectedSlots}
                        SLOTS={SLOTS}
                        onSlotsChange={(slots) => setSelectedSlots(slots)}
                    />

                </Card.Content>
            </Card>

            {/* PREVIEW */}
            {selectedSlots.length > 0 && (
                <Card style={{
                    marginBottom: 16,
                    borderRadius: 16,
                    backgroundColor: '#ecfeff',
                    borderWidth: 1,
                    borderColor: '#a5f3fc'
                }}>
                    <Card.Content>

                        <Text style={{
                            marginBottom: 6,
                            fontWeight: '600',
                            color: '#155e75'
                        }}>
                            Đã chọn ({selectedSlots.length})
                        </Text>

                        {selectedSlots.map((s, i) => (
                            <Text key={i} style={{ color: '#0f172a' }}>
                                • {s.start} - {s.end}
                            </Text>
                        ))}

                    </Card.Content>
                </Card>
            )}

            {/* BUTTON */}
            <Button
                mode="contained"
                contentStyle={{ paddingVertical: 5 }}
                style={[Mystyles.primaryButton, { marginBottom: 10 }]}
                labelStyle={{
                    fontWeight: '700',
                    fontSize: 15
                }}
                onPress={() => {
                    if (selectedDays === null || selectedSlots.length === 0) {
                        console.log('Thiếu dữ liệu');
                        return;
                    }

                    const dayMap = [
                        'Monday', 'Tuesday', 'Wednesday',
                        'Thursday', 'Friday', 'Saturday', 'Sunday'
                    ];

                    const dayName = dayMap[selectedDays];

                    const newSlots = selectedSlots.map(s => ({
                        start_time: s.start,
                        end_time: s.end
                    }));

                    setSchedule(prev => {
                        const exist = prev.find(
                            item => item.day_of_week === dayName
                        );

                        let newData;

                        if (exist) {

                            const isOverlap = (a, b) =>
                                a.start_time < b.end_time &&
                                b.start_time < a.end_time;

                            const conflict = newSlots.some(newSlot =>
                                exist.timeslot_set.some(oldSlot =>
                                    isOverlap(oldSlot, newSlot)
                                )
                            );

                            if (conflict) {
                                console.log('Trùng hoặc đè giờ');
                                return prev;
                            }

                            newData = prev.map(item =>
                                item.day_of_week === dayName
                                    ? {
                                        ...item,
                                        timeslot_set: [
                                            ...(item.timeslot_set || []),
                                            ...newSlots
                                        ]
                                    }
                                    : item
                            );

                        } else {
                            newData = [
                                ...prev,
                                {
                                    day_of_week: dayName,
                                    timeslot_set: newSlots
                                }
                            ];
                        }

                        console.log(JSON.stringify(newData, null, 2));
                        return newData;
                    });

                    setSelectedSlots([]);
                }}
            >
                Lưu lịch trình
            </Button>

        </ScrollView>
    );
};

export default Schedule;