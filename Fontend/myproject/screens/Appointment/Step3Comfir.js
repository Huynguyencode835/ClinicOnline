import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Card } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import COLORS from "../../styles/Colors";
const Row = ({ icon, label, value }) => (
    <View style={styles.row}>
        <View style={styles.rowIconWrap}>
            <MaterialCommunityIcons name={icon} size={16} color={COLORS.primary} />
        </View>
        <View style={{ flex: 1 }}>
            <Text style={styles.rowLabel}>{label}</Text>
            <Text style={styles.rowValue}>{value || "—"}</Text>
        </View>
    </View>
);

const SectionTitle = ({ icon, text }) => (
    <View style={styles.sectionRow}>
        <MaterialCommunityIcons name={icon} size={15} color={COLORS.primary} />
        <Text style={styles.sectionText}>{text}</Text>
    </View>
);

const shiftMap = { morning: "🌤 Buổi sáng", afternoon: "☀️ Buổi chiều", evening: "🌙 Buổi tối" };
const genderMap = { male: "Nam", female: "Nữ", other: "Khác" };

const Step3Confirm = ({ data }) => {
    const p = data.patient;
    const fullName = `${p.last_name} ${p.first_name}`;

    return (
        <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
            {/* ── BANNER ── */}
            <View style={styles.banner}>
                <View style={styles.bannerIcon}>
                    <MaterialCommunityIcons name="clipboard-check-outline" size={28} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.bannerTitle}>Xác nhận thông tin đặt lịch</Text>
                    <Text style={styles.bannerSub}>Vui lòng kiểm tra kỹ trước khi xác nhận</Text>
                </View>
            </View>

            {/* ── LỊCH KHÁM ── */}
            <SectionTitle icon="calendar-clock" text="Thông tin lịch khám" />
            <Card style={styles.card}>
                <Card.Content style={styles.cardContent}>
                    <Row icon="stethoscope" label="Chuyên khoa" value={data.specialty?.name} />
                    <View style={styles.divider} />
                    <Row icon="account-tie" label="Bác sĩ" value={data.doctor?.name} />
                    <View style={styles.divider} />
                    <Row icon="medical-bag" label="Dịch vụ" value={data.service?.name} />
                    <View style={styles.divider} />
                    <Row icon="currency-usd" label="Chi phí" value={data.doctor?.price} />
                    <View style={styles.divider} />
                    <Row icon="calendar" label="Ngày khám" value={data.day} />
                    <View style={styles.divider} />
                    <Row icon="weather-sunset" label="Ca làm việc" value={shiftMap[data.shift]} />
                    <View style={styles.divider} />
                    <Row icon="clock-outline" label="Giờ khám" value={`${data.slots.start} - ${data.slots.end}`} />
                </Card.Content>
            </Card>

            {/* ── BỆNH NHÂN ── */}
            <SectionTitle icon="account" text="Thông tin bệnh nhân" />
            <Card style={styles.card}>
                <Card.Content style={styles.cardContent}>
                    <Row icon="account-outline" label="Họ và tên" value={fullName} />
                    <View style={styles.divider} />
                    <Row icon="phone-outline" label="Điện thoại" value={p.phone} />
                    <View style={styles.divider} />
                    <Row icon="email-outline" label="Email" value={p.email} />
                    <View style={styles.divider} />
                    <Row icon="cake-variant-outline" label="Ngày sinh" value={p.dob} />
                    <View style={styles.divider} />
                    <Row icon="gender-male-female" label="Giới tính" value={genderMap[p.gender]} />
                </Card.Content>
            </Card>

            {/* ── Y TẾ ── */}
            <SectionTitle icon="heart-pulse" text="Thông tin y tế" />
            <Card style={[styles.card, { marginBottom: 8 }]}>
                <Card.Content style={styles.cardContent}>
                    <Row icon="card-account-details-outline" label="Số thẻ BHYT" value={p.insurance_id} />
                    <View style={styles.divider} />
                    <Row icon="calendar-end" label="Hết hạn BHYT" value={p.insurance_exp} />
                    <View style={styles.divider} />
                    <Row icon="water" label="Nhóm máu" value={p.blood_type} />

                    {p.allergies?.length > 0 && (
                        <>
                            <View style={styles.divider} />
                            <View style={styles.row}>
                                <View style={styles.rowIconWrap}>
                                    <MaterialCommunityIcons name="alert-circle-outline" size={16} color={COLORS.primary} />
                                </View>
                                <View style={{ flex: 1, gap: 6 }}>
                                    <Text style={styles.rowLabel}>Dị ứng</Text>
                                    <View style={styles.tagRow}>
                                        {p.allergies.map((item, i) => (
                                            <View key={i} style={styles.tag}>
                                                <Text style={styles.tagText}>{item}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            </View>
                        </>
                    )}
                </Card.Content>
            </Card>

            {/* ── WARNING ── */}
            <View style={styles.warningBadge}>
                <MaterialCommunityIcons name="clock-alert-outline" size={16} color={COLORS.warning} />
                <Text style={styles.warningText}>
                    Vui lòng có mặt trước giờ khám <Text style={{ fontWeight: '700' }}>15 phút</Text> để làm thủ tục.
                    Liên hệ hủy lịch trước <Text style={{ fontWeight: '700' }}>24 giờ</Text> nếu không đến được.
                </Text>
            </View>

        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollContent: {
        padding: 16,
        paddingBottom: 8,
        backgroundColor: COLORS.bg,
    },

    banner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: COLORS.successLight,
        borderRadius: 14,
        padding: 14,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.primaryBorder,
    },

    bannerIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
    },

    bannerTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.primary,
    },

    bannerSub: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginTop: 2,
    },

    sectionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
        marginTop: 4,
    },

    sectionText: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.primary,
        letterSpacing: 0.3,
        textTransform: 'uppercase',
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

    cardContent: { gap: 0 },

    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        paddingVertical: 10,
    },

    rowIconWrap: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: COLORS.successLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 1,
    },

    rowLabel: {
        fontSize: 11,
        color: COLORS.textLight,
        marginBottom: 3,
        fontWeight: '500',
    },

    rowValue: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
    },

    divider: {
        height: 1,
        backgroundColor: COLORS.divider,
        marginHorizontal: -16,
    },

    tagRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },

    tag: {
        backgroundColor: COLORS.warning + "20",
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: COLORS.warning,
    },

    tagText: {
        fontSize: 12,
        color: COLORS.warning,
        fontWeight: '600',
    },

    warningBadge: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        backgroundColor: COLORS.warning + "15",
        borderRadius: 12,
        padding: 14,
        borderLeftWidth: 3,
        borderLeftColor: COLORS.warning,
        marginBottom: 8,
    },

    warningText: {
        flex: 1,
        fontSize: 12,
        color: COLORS.warning,
        lineHeight: 18,
    },
});

export default Step3Confirm;