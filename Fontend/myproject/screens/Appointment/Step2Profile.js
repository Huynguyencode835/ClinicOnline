import React from "react";
import {
    View, Text, ScrollView, StyleSheet,
    TextInput, Pressable
} from "react-native";
import { Card, SegmentedButtons, Chip } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import COLORS from "../../styles/Colors";

const BLOOD_TYPES = ["A", "B", "AB", "O", "A-", "B-", "AB-", "O-"];

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

const Step2Profile = ({ data, updatePatient }) => {
    const p = data.patient;

    const addAllergy = () => {
        const val = (p.allergy_input ?? "").trim();
        if (!val) return;
        updatePatient("allergies", [...(p.allergies ?? []), val]);
        updatePatient("allergy_input", "");
    };

    const removeAllergy = (index) => {
        updatePatient("allergies", p.allergies.filter((_, i) => i !== index));
    };

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
                                onChangeText={v => updatePatient("last_name", v)}
                            />
                        </Field>
                        <Field label="Tên" required>
                            <StyledInput
                                placeholder="Văn A"
                                value={p.first_name}
                                onChangeText={v => updatePatient("first_name", v)}
                            />
                        </Field>
                    </View>

                    <Field label="Số điện thoại" required>
                        <StyledInput
                            placeholder="0xxxxxxxxx"
                            keyboardType="phone-pad"
                            value={p.phone}
                            onChangeText={v => updatePatient("phone", v)}
                        />
                    </Field>

                    <Field label="Email">
                        <StyledInput
                            placeholder="example@email.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={p.email}
                            onChangeText={v => updatePatient("email", v)}
                        />
                    </Field>

                    <Field label="Ngày sinh">
                        <StyledInput
                            placeholder="DD/MM/YYYY"
                            value={p.dob}
                            onChangeText={v => updatePatient("dob", v)}
                        />
                    </Field>

                    <Field label="Giới tính">
                        <SegmentedButtons
                            value={p.gender}
                            onValueChange={v => updatePatient("gender", v)}
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
                            value={p.insurance_id}
                            onChangeText={v => updatePatient("insurance_id", v)}
                            autoCapitalize="characters"
                        />
                    </Field>

                    <Field label="Ngày hết hạn thẻ">
                        <StyledInput
                            placeholder="DD/MM/YYYY"
                            value={p.insurance_exp}
                            onChangeText={v => updatePatient("insurance_exp", v)}
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
                                    onPress={() => updatePatient("blood_type", bt)}
                                    style={[
                                        styles.bloodChip,
                                        p.blood_type === bt && styles.bloodChipActive,
                                    ]}
                                >
                                    <Text style={[
                                        styles.bloodChipText,
                                        p.blood_type === bt && styles.bloodChipTextActive,
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
                                value={p.allergy_input ?? ""}
                                onChangeText={v => updatePatient("allergy_input", v)}
                                onSubmitEditing={addAllergy}
                                returnKeyType="done"
                                style={{ flex: 1 }}
                            />
                            <Pressable style={styles.addBtn} onPress={addAllergy}>
                                <MaterialCommunityIcons name="plus" size={20} color={COLORS.white} />
                            </Pressable>
                        </View>

                        {p.allergies?.length > 0 ? (
                            <View style={styles.chipList}>
                                {p.allergies.map((item, i) => (
                                    <Chip
                                        key={i}
                                        onClose={() => removeAllergy(i)}
                                        style={styles.chip}
                                        textStyle={styles.chipText}
                                    >
                                        {item}
                                    </Chip>
                                ))}
                            </View>
                        ) : (
                            <Text style={styles.emptyHint}>
                                Chưa có dị ứng nào được ghi nhận
                            </Text>
                        )}
                    </Field>

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