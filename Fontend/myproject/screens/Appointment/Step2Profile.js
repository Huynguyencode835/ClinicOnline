import React from "react";
import {
    View, Text, ScrollView, StyleSheet,
    TextInput, Pressable
} from "react-native";
import { Card, SegmentedButtons, Chip } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import COLORS from "../../styles/Colors";

const BLOOD_TYPES = ["A+", "B+", "AB+", "O+", "A-", "B-", "AB-", "O-"];

const SectionLabel = ({ icon, text }) => (
    <View style={styles.sectionRow}>
        <MaterialCommunityIcons name={icon} size={15} color={COLORS.primary} />
        <Text style={styles.sectionText}>{text}</Text>
    </View>
);

const Field = ({ label, required, children }) => (
    <View style={styles.fieldWrap}>
        <Text style={styles.fieldLabel}>
            {label}
            {required && <Text style={{ color: COLORS.error }}> *</Text>}
        </Text>
        {children}
    </View>
);

const StyledInput = ({ style, ...props }) => (
    <TextInput
        style={[styles.input, style]}
        placeholderTextColor={COLORS.textLight}
        {...props}
    />
);

const Step2Profile = ({ data, updatePatient, updateProfile }) => {
    const p = data.patient;

    return (
        <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
        >
            {/* ── THÔNG TIN CÁ NHÂN ── */}
            <SectionLabel icon="account-edit-outline" text="Thông tin cá nhân" />
            <Card style={styles.card}>
                <Card.Content style={styles.cardContent}>

                    <View style={styles.row2}>
                        <Field label="Họ" required>
                            <StyledInput
                                placeholder="Nguyễn"
                                value={p.last_name}
                                onChangeText={(v) => updatePatient("last_name", v)}
                            />
                        </Field>
                        <Field label="Tên" required>
                            <StyledInput
                                placeholder="Văn A"
                                value={p.first_name}
                                onChangeText={(v) => updatePatient("first_name", v)}
                            />
                        </Field>
                    </View>

                    <Field label="Số điện thoại" required>
                        <StyledInput
                            placeholder="0xxxxxxxxx"
                            keyboardType="phone-pad"
                            value={p.phone}
                            onChangeText={(v) => updatePatient("phone", v)}
                        />
                    </Field>

                    <Field label="Email">
                        <StyledInput
                            placeholder="example@email.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={p.email}
                            onChangeText={(v) => updatePatient("email", v)}
                        />
                    </Field>

                    <Field label="Ngày sinh">
                        <StyledInput
                            placeholder="DD/MM/YYYY"
                            value={p.dob}
                            onChangeText={(v) => updatePatient("dob", v)}
                        />
                    </Field>

                    <Field label="Giới tính">
                        <SegmentedButtons
                            value={p.gender}
                            onValueChange={(v) => updatePatient("gender", v)}
                            style={styles.segmented}
                            theme={{
                                colors: {
                                    secondaryContainer: COLORS.primary,
                                    onSecondaryContainer: COLORS.white,
                                    outline: COLORS.border,
                                },
                            }}
                            buttons={[
                                { value: 'male', label: '👨 Nam', style: styles.segBtn },
                                { value: 'female', label: '👩 Nữ', style: styles.segBtn },
                                { value: 'other', label: 'Khác', style: styles.segBtn },
                            ]}
                        />
                    </Field>

                </Card.Content>
            </Card>

            {/* ── BẢO HIỂM Y TẾ ── */}
            <SectionLabel icon="card-account-details-outline" text="Bảo hiểm y tế" />
            <Card style={styles.card}>
                <Card.Content style={styles.cardContent}>

                    <Field label="Số thẻ BHYT">
                        <StyledInput
                            placeholder="VD: HS4012345678901"
                            value={p.profile.insurance_number}
                            onChangeText={(v) => updateProfile("insurance_number", v)}
                            autoCapitalize="characters"
                        />
                    </Field>

                    <Field label="Ngày hết hạn thẻ">
                        <StyledInput
                            placeholder="DD/MM/YYYY"
                            value={p.profile.insurance_expiry_date}
                            onChangeText={(v) => updateProfile("insurance_expiry_date", v)}
                        />
                    </Field>

                    <View style={styles.infoBadge}>
                        <MaterialCommunityIcons name="information-outline" size={14} color={COLORS.primary} />
                        <Text style={styles.infoBadgeText}>
                            Thẻ BHYT giúp giảm chi phí khám chữa bệnh theo quy định nhà nước
                        </Text>
                    </View>

                </Card.Content>
            </Card>

            {/* ── THÔNG TIN Y TẾ ── */}
            <SectionLabel icon="heart-pulse" text="Thông tin y tế" />
            <Card style={[styles.card, { marginBottom: 8 }]}>
                <Card.Content style={styles.cardContent}>

                    <Field label="Nhóm máu">
                        <View style={styles.bloodGroup}>
                            {BLOOD_TYPES.map(bt => (
                                <Pressable
                                    key={bt}
                                    onPress={() => updateProfile("blood_group", bt)}
                                    style={[
                                        styles.bloodChip,
                                        p.profile.blood_group === bt && styles.bloodChipActive,
                                    ]}
                                >
                                    <Text style={[
                                        styles.bloodChipText,
                                        p.profile.blood_group === bt && styles.bloodChipTextActive,
                                    ]}>
                                        {bt}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    </Field>

                    <Field label="Dị ứng">
                        <View style={styles.chipInputRow}>
                            <StyledInput
                                placeholder="VD: Penicillin, hải sản..."
                                value={p.profile.allergy_history ?? ""}
                                onChangeText={(v) => updateProfile("allergy_history", v)}
                                returnKeyType="done"
                                style={{ flex: 1 }}
                            />
                        </View>


                    </Field>

                </Card.Content>
            </Card>

            {/* ── LÝ DO KHÁM ── */}
            <SectionLabel icon="clipboard-text-outline" text="Lý do khám" />
            <Card style={[styles.card, { marginBottom: 8 }]}>
                <Card.Content style={styles.cardContent}>

                    <Field label="Lý do khám" required>
                        <StyledInput
                            placeholder="VD: Đau đầu, mệt mỏi, khám định kỳ..."
                            value={p.reason}
                            onChangeText={(v) => updatePatient("reason", v)}
                        />
                    </Field>

                    <Field label="Triệu chứng đang gặp phải">
                        <StyledInput
                            placeholder="VD: Sốt 3 ngày, ho khan, khó thở nhẹ..."
                            value={p.symptoms}
                            onChangeText={(v) => updatePatient("symptoms", v)}
                            multiline
                            numberOfLines={4}
                            style={{ textAlignVertical: 'top', minHeight: 100 }}
                        />
                    </Field>

                    <View style={styles.infoBadge}>
                        <MaterialCommunityIcons name="information-outline" size={14} color={COLORS.primary} />
                        <Text style={styles.infoBadgeText}>
                            Mô tả chi tiết giúp bác sĩ chuẩn bị tốt hơn trước buổi khám
                        </Text>
                    </View>

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

    cardContent: { gap: 14 },

    row2: { flexDirection: 'row', gap: 12 },

    fieldWrap: { gap: 6, flex: 1 },

    fieldLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.textMuted,
    },

    input: {
        borderWidth: 1.5,
        borderColor: COLORS.border,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 11,
        fontSize: 15,
        color: COLORS.text,
        backgroundColor: COLORS.bg,
    },

    segmented: {
        borderRadius: 10,
        backgroundColor: COLORS.bg,
    },

    segBtn: { borderRadius: 8 },

    infoBadge: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 6,
        backgroundColor: COLORS.successLight,
        borderRadius: 8,
        padding: 10,
        borderLeftWidth: 3,
        borderLeftColor: COLORS.primary,
    },

    infoBadgeText: {
        flex: 1,
        fontSize: 12,
        color: COLORS.textMuted,
        lineHeight: 18,
    },

    bloodGroup: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 4,
    },

    bloodChip: {
        paddingHorizontal: 16,
        paddingVertical: 9,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        backgroundColor: COLORS.bg,
        minWidth: 52,
        alignItems: 'center',
    },

    bloodChipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },

    bloodChipText: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.textMuted,
    },

    bloodChipTextActive: {
        color: COLORS.white,
    },

    chipInputRow: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },

    addBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: 10,
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },

    chipList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 10,
    },

    chip: {
        backgroundColor: COLORS.successLight,
        borderColor: COLORS.primaryBorder,
        borderWidth: 1,
    },

    chipText: {
        fontSize: 13,
        color: COLORS.primary,
    },

    emptyHint: {
        fontSize: 12,
        color: COLORS.textLight,
        fontStyle: 'italic',
        marginTop: 4,
    },
});

export default Step2Profile;