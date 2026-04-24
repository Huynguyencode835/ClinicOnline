import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Card, SegmentedButtons } from "react-native-paper";
import React from "react";
import ListDropDown from "../../components/Appointment/ListDropDown";
import TimeSlot from "../../components/Schedule/TimeSlot";
import DaychipGroup from "../../components/Schedule/DayChipGroup";
import COLORS from "../../styles/Colors";

// Data
const SPECIALTIES = [
    { id: "1", name: "Sản phụ khoa" },
    { id: "2", name: "Tim mạch" },
    { id: "3", name: "Nhi khoa" },
    { id: "4", name: "Da liễu" },
    { id: "5", name: "Răng hàm mặt" },
    { id: "6", name: "Thần kinh" },
    { id: "7", name: "Chấn thương chỉnh hình" },
    { id: "8", name: "Nội tổng quát" },
    { id: "9", name: "Ngoại tổng quát" },
];
const DOCTORS = [
    { id: "1", name: "Nguyễn Văn A", specialty: "Nội tổng quát", price: "200.000đ" },
    { id: "2", name: "Trần Thị B", specialty: "Tim mạch", price: "250.000đ" },
    { id: "3", name: "Lê Văn C", specialty: "Nhi khoa", price: "180.000đ" },
    { id: "4", name: "Phạm Thị D", specialty: "Da liễu", price: "220.000đ" },
    { id: "5", name: "Hoàng Văn E", specialty: "Răng hàm mặt", price: "300.000đ" },
    { id: "6", name: "Đỗ Thị F", specialty: "Thần kinh", price: "270.000đ" },
    { id: "7", name: "Vũ Văn G", specialty: "Chấn thương chỉnh hình", price: "250.000đ" },
    { id: "8", name: "Ngô Thị H", specialty: "Sản phụ khoa", price: "230.000đ" },
];
const SERVICES = [
    { id: "1", name: "Khám thường", description: "Khám lâm sàng và tư vấn điều trị" },
    { id: "2", name: "Khám chuyên sâu", description: "Khám kỹ lưỡng với các xét nghiệm cần thiết" },
    { id: "3", name: "Khám định kỳ", description: "Gói khám định kỳ cho người cao tuổi" },
    { id: "4", name: "Khám sức khỏe tổng quát", description: "Gói khám tổng quát cho mọi lứa tuổi" },
];
const SLOTS = {
    morning: [
        { start: "07:00", end: "08:00", label: "07:00 - 08:00" },
        { start: "08:00", end: "09:00", label: "08:00 - 09:00" },
        { start: "09:15", end: "10:15", label: "09:15 - 10:15" },
        { start: "10:30", end: "11:30", label: "10:30 - 11:30" },
    ],
    afternoon: [
        { start: "13:00", end: "14:00", label: "13:00 - 14:00" },
        { start: "14:00", end: "15:00", label: "14:00 - 15:00" },
        { start: "15:15", end: "16:15", label: "15:15 - 16:15" },
    ],
    evening: [
        { start: "18:00", end: "19:00", label: "18:00 - 19:00" },
        { start: "19:00", end: "20:00", label: "19:00 - 20:00" },
        { start: "20:15", end: "21:15", label: "20:15 - 21:15" },
    ],
};

const SectionLabel = ({ text }) => (
    <View style={styles.sectionLabelRow}>
        <View style={styles.sectionLabelDot} />
        <Text style={styles.sectionLabel}>{text}</Text>
    </View>
);

const Step1Schedule = ({ data, updateBooking }) => {
    return (
        <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
            <SectionLabel text="Chọn chuyên khoa" />
            <ListDropDown
                title="Chọn chuyên khoa"
                value={data.specialty}
                icon="stethoscope"
                data={SPECIALTIES}
                onSelect={(item) => updateBooking("specialty", item)}
            />

            <SectionLabel text="Chọn bác sĩ" />
            <ListDropDown
                title="Chọn bác sĩ"
                value={data.doctor}
                icon="account-tie"
                data={DOCTORS}
                onSelect={(item) => updateBooking("doctor", item)}
            />

            <SectionLabel text="Chọn dịch vụ" />
            <ListDropDown
                title="Chọn dịch vụ"
                value={data.service}
                icon="medical-bag"
                data={SERVICES}
                onSelect={(item) => updateBooking("service", item)}
            />

            <SectionLabel text="Chọn ngày trong tuần" />
            <Card style={styles.card}>
                <Card.Content>
                    <DaychipGroup
                        selected={data.day}
                        onToggle={(day) => {
                            updateBooking("day", day);
                            updateBooking("shift", "morning");
                            updateBooking("slots", []);
                        }}
                    />
                </Card.Content>
            </Card>

            <SectionLabel text="Chọn ca làm việc" />
            <Card style={styles.card}>
                <Card.Content>
                    <SegmentedButtons
                        value={data.shift}
                        onValueChange={(value) => {
                            updateBooking("shift", value);
                            updateBooking("slots", []);
                        }}
                        style={styles.segmented}
                        theme={{
                            colors: {
                                secondaryContainer: COLORS.primary,
                                onSecondaryContainer: '#ffffff',
                                outline: '#e2e8f0',
                            },
                        }}
                        buttons={[
                            { value: 'morning',   label: '🌤 Sáng',  style: styles.segBtn },
                            { value: 'afternoon', label: '☀️ Chiều', style: styles.segBtn },
                            { value: 'evening',   label: '🌙 Tối',   style: styles.segBtn },
                        ]}
                    />
                </Card.Content>
            </Card>

            <SectionLabel text="Chọn giờ làm việc" />
            <Card style={[styles.card, { marginBottom: 8 }]}>
                <Card.Content>
                    <TimeSlot
                        shift={data.shift}
                        selectedSlots={data.slots}
                        onSlotsChange={(slots) => updateBooking("slots", slots)}
                        SLOTS={SLOTS}
                        multiple={false}
                    />
                </Card.Content>
            </Card>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollContent: {
        padding: 16,
        paddingBottom: 8,
        backgroundColor: COLORS.bg,
    },

    sectionLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        marginTop: 4,
        gap: 8,
    },

    sectionLabelDot: {
        width: 4,
        height: 16,
        borderRadius: 4,
        backgroundColor: COLORS.primary,
    },

    sectionLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.primary,
        letterSpacing: 0.2,
    },

    card: {
        borderRadius: 16,
        backgroundColor: COLORS.white,
        elevation: 2,
        marginBottom: 16,

        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
    },

    segmented: {
        borderRadius: 12,
        backgroundColor: COLORS.bg,
    },

    segBtn: {
        borderRadius: 10,
    },
});

export default Step1Schedule;