// AppointmentCard.jsx
import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import COLORS from "../../styles/Colors";
import { DAY_VI } from "../../utils/mapping";
import { formatDate } from "../../utils/format";
import { MyUserContext } from "../../utils/contexts/MyUserContext";

const statusMap = {
    Pending:   { label: "Chờ khám",    bg: "#FFF3E0", text: "#E65100" },
    Confirmed: { label: "Đã xác nhận", bg: "#E3F2FD", text: "#1565C0" },
    Done:      { label: "Hoàn thành",  bg: "#E8F5E9", text: "#2E7D32" },
    Cancelled: { label: "Đã huỷ",      bg: "#FFEBEE", text: "#C62828" },
};

const avatarColors = [
    { bg: "#E3F2FD", text: "#1565C0" },
    { bg: "#E8F5E9", text: "#2E7D32" },
    { bg: "#F3E5F5", text: "#6A1B9A" },
    { bg: "#FFF3E0", text: "#E65100" },
    { bg: "#E0F2F1", text: "#00695C" },
];

const getInitials = (lastName = "", firstName = "") => {
    const l = lastName.trim().charAt(0).toUpperCase();
    const f = firstName.trim().charAt(0).toUpperCase();
    return `${l}${f}`;
};

const getAvatarColor = (id = 0) => avatarColors[id % avatarColors.length];

const InfoRow = ({ label, value }) => (
    <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue} numberOfLines={2}>
            {value || "—"}
        </Text>
    </View>
);

const AppointmentCard = ({ item, onPress }) => {
    const { doctor, customer, reason, symptoms, time_slot, status, id } = item;
    const { user } = useContext(MyUserContext);
    const isDoctor = user?.role === "doctor";
    const target = isDoctor ? customer : doctor;
    const targetRole = isDoctor ? "Bệnh nhân" : "Bác sĩ";

    const fullName = target ? `${target.last_name} ${target.first_name}`: "—";

    const initials = target ? getInitials(target.last_name, target.first_name) : "?";

    const avatarColor = getAvatarColor(target?.id ?? 0);

    const time = `${time_slot.start_time?.slice(0, 5)} - ${time_slot.end_time?.slice(0, 5)}`;
    const date = `${DAY_VI[time_slot.work_day?.day_of_week]} - ${formatDate(time_slot.work_day?.date)}`;
    const badge = statusMap[status] || { label: status, bg: "#F5F5F5", text: "#757575" };

    return (
        <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
            <View style={styles.card}>

                {/* ── Header ── */}
                <View style={styles.header}>
                    {target?.avatar ? (
                        <Image source={{ uri: target.avatar }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatar, styles.initialsWrap, { backgroundColor: avatarColor.bg }]}>
                            <Text style={[styles.initials, { color: avatarColor.text }]}>
                                {initials}
                            </Text>
                        </View>
                    )}

                    <View style={styles.headerInfo}>
                        <Text style={styles.doctorName} numberOfLines={1}>{fullName}</Text>
                        <Text style={styles.doctorSub}>{targetRole}</Text>
                    </View>

                    <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                        <Text style={[styles.badgeText, { color: badge.text }]}>
                            {badge.label}
                        </Text>
                    </View>
                </View>

                <View style={styles.divider} />

                {/* ── Info ── */}
                <View style={styles.infoBlock}>
                    <InfoRow label="Lý do"       value={reason} />
                    <InfoRow label="Triệu chứng" value={symptoms} />
                    <InfoRow label="Ngày"         value={date} />
                    <InfoRow label="Khung giờ"   value={time} />
                </View>

                <View style={styles.divider} />

                {/* ── Footer ── */}
                <View style={styles.footer}>
                    <Text style={styles.appointmentId}>Mã lịch hẹn #{id}</Text>
                    <Text style={styles.detailLink}>Xem chi tiết ›</Text>
                </View>

            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        backgroundColor: "#FFFFFF",
        marginBottom: 12,
        padding: 16,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
    },

    // Header
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    avatar: {
        width: 46,
        height: 46,
        borderRadius: 23,
        flexShrink: 0,
    },
    initialsWrap: {
        justifyContent: "center",
        alignItems: "center",
    },
    initials: {
        fontSize: 16,
        fontWeight: "600",
    },
    headerInfo: {
        flex: 1,
        gap: 2,
    },
    doctorName: {
        fontSize: 15,
        fontWeight: "700",
        color: COLORS.text,
    },
    doctorSub: {
        fontSize: 12,
        color: COLORS.textMuted,
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: "600",
    },

    // Divider
    divider: {
        height: 0.5,
        backgroundColor: "#E5E7EB",
        marginVertical: 12,
    },

    // Info
    infoBlock: {
        gap: 8,
    },
    infoRow: {
        flexDirection: "row",
        gap: 8,
    },
    infoLabel: {
        fontSize: 12,
        color: COLORS.textMuted,
        width: 90,
        flexShrink: 0,
    },
    infoValue: {
        fontSize: 12,
        color: COLORS.text,
        fontWeight: "500",
        flex: 1,
    },

    // Footer
    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    appointmentId: {
        fontSize: 12,
        color: COLORS.textMuted,
    },
    detailLink: {
        fontSize: 12,
        fontWeight: "600",
        color: COLORS.primary,
    },
});

export default AppointmentCard;