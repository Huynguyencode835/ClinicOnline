import { useEffect, useState, useContext, useCallback } from "react";
import { View, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import { Text, Surface, Chip, Divider } from "react-native-paper";
import { fetchWithAuth } from "../../utils/apiHelper";
import { endpoints } from "../../configs/Apis";
import COLORS from "../../styles/Colors";
import AppSnackbar from "../../components/AppSnackbar";
import SectionTitle from "../../components/Appointment/SectionTilte";
import InfoCard from "../../components/Appointment/InfoCard";
import { InfoCard2Col } from "../../components/Appointment/InfoCard";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AppHeader from "../../components/AppHeader";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { formatDate, formatDate2 } from "../../utils/format";
import { genderMap } from "../../utils/mapping";
import { MyUserContext } from "../../utils/contexts/MyUserContext";
import AppButton from "../../components/AppButton";
import { updatePatchWithAuth } from "../../utils/apiHelper";
import { useSnackbar } from "../../utils/contexts/SnackBarContext";

const InfoRow = ({ icon, label, value }) => (
    <View style={styles.infoRow}>
        <View style={styles.iconWrap}>
            <MaterialCommunityIcons name={icon} size={16} color={COLORS.primary} />
        </View>
        <View style={{ flex: 1 }}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue} numberOfLines={3}>
                {value || "—"}
            </Text>
        </View>
    </View>
);

const Card = ({ title, children, style }) => (
    <Surface style={[styles.card, style]}>
        {title && <Text style={styles.cardTitle}>{title}</Text>}
        {children}
    </Surface>
);

const MedicalRecordDetail = ({ route }) => {
    const navigation = useNavigation();
    const id = route.params?.id;
    const [record, setRecord] = useState(null);
    const [snackbar, setSnackbar] = useState({});
    const [loading, setLoading] = useState(false);
    const { user } = useContext(MyUserContext);
    const { showSnackbar } = useSnackbar();

    useFocusEffect(
        useCallback(() => {
            fetchWithAuth(
                endpoints.medicalRecordDetail(id),
                (data) => setRecord(data),
                (type, msg) => setSnackbar({ visible: true, message: msg, type }),
                {},
                setLoading
            );
        }, [id])
    );

    const handleComplete = async () => {
        if (!record?.appointment?.id) {
            showSnackbar("ID hồ sơ không hợp lệ", "error");
            return;
        }

        const appointmentId = record.appointment?.id;
        const endpoint = endpoints.appointmentDetail(appointmentId);

        try {
            setLoading(true);
            await updatePatchWithAuth(endpoint,
                { status: "Pending_payment" },
                (data) => {
                    showSnackbar("Hoàn thành hồ sơ, chờ bệnh nhân thanh toán", "success");
                    setLoading(false);
                    navigation.goBack();
                },
                (type, msg, errData) => {
                    console.log("errData:", JSON.stringify(errData, null, 2));
                    if (errData && typeof errData === "object") {
                        const messages = Object.entries(errData).map(([field, errors]) => Array.isArray(errors) ? errors.join(", ") : errors).join("\n");
                        showSnackbar(
                            messages || "Hoàn thành hồ sơ thất bại",
                            "error"
                        );
                    } else {
                        showSnackbar(
                            msg || "Hoàn thành hồ sơ thất bại",
                            "error"
                        );
                    }
                    setLoading(false);
                },
                setLoading
            );
        } catch (error) {
            showSnackbar("Có lỗi xảy ra", "error");
            setLoading(false);
        }
    };

    if (!record) return (
        <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
    );

    const { customer, doctor, prescription, test_results: rawTestResults = [], appointment } = record;

    const fullNameC = customer ? `${customer.last_name} ${customer.first_name}` : "—";
    const fullNameD = doctor ? `${doctor.last_name} ${doctor.first_name}` : "—";

    const test_results = rawTestResults.filter(
        (item, index, self) => index === self.findIndex(r => r.id === item.id)
    );

    const hasPrescription = prescription?.details?.length > 0;

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
            <AppHeader titles="Chi tiết hồ sơ bệnh án" onBack={() => navigation.goBack()} />

            <ScrollView contentContainerStyle={styles.scroll}>

                <SectionTitle icon="account" text="Thông tin bệnh nhân" />
                <InfoCard2Col
                    rows={[
                        { icon: "account-outline", label: "Họ và tên", value: fullNameC },
                        { icon: "phone-outline", label: "Điện thoại", value: customer?.phone },
                        { icon: "email-outline", label: "Email", value: customer?.email },
                        { icon: "gender-male-female", label: "Giới tính", value: genderMap[customer?.gender] },
                        { icon: "card-account-details-outline", label: "Số thẻ BHYT", value: customer?.profile?.insurance_number },
                        { icon: "calendar-end", label: "Hết hạn BHYT", value: customer?.profile?.insurance_expiry_date },
                        { icon: "water", label: "Nhóm máu", value: customer?.profile?.blood_group },
                        { icon: "needle", label: "Tiền sử dị ứng", value: customer?.profile?.allergy_history },
                        { icon: "human", label: "Chiều cao", value: customer?.profile?.height ? `${customer?.profile?.height} cm` : null },
                        { icon: "weight", label: "Cân nặng", value: customer?.profile?.weight ? `${customer?.profile?.weight} kg` : null }
                    ]}
                />


                <SectionTitle icon="account-tie" text="Thông tin bác sĩ" />
                <InfoCard
                    rows={[
                        { icon: "account-outline", label: "Họ và tên", value: fullNameD },
                        { icon: "phone-outline", label: "Điện thoại", value: doctor?.phone },
                        { icon: "stethoscope", label: "Chuyên khoa", value: doctor?.specialties?.join(", ") }
                    ]}
                    iconBgColor="#c2dcfa"
                />


                <SectionTitle icon="file-document-outline" text="Hồ sơ bệnh án" />
                <InfoCard
                    rows={[
                        { icon: "stethoscope", label: "Chẩn đoán", value: record.diagnosis },
                        { icon: "alert-circle-outline", label: "Triệu chứng", value: record.symptoms },
                        { icon: "text-box-outline", label: "Ghi chú", value: record.medical_notes },
                        { icon: "calendar-clock", label: "Ngày tái khám", value: record.follow_up_date ? formatDate(record.follow_up_date) : null },
                        { icon: "clock-outline", label: "Ngày tạo", value: record.created_date ? formatDate2(record.created_date) : null },
                    ]}
                    iconBgColor="#FFF3E0"
                />


                <SectionTitle icon="test-tube" text="Kết quả xét nghiệm" />
                {test_results.length > 0 ? (
                    <Card>
                        {test_results.map((result, index) => (
                            <View key={result.id ?? index}>
                                <View style={styles.testRow}>
                                    <View style={styles.testIconWrap}>
                                        <MaterialCommunityIcons name="test-tube" size={16} color={COLORS.primary} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.testName}>{result.test.name}</Text>
                                        <Text style={styles.testResult}>Kết quả: {result.result}</Text>
                                        {result.file && (
                                            <Text style={styles.testFile}>File: {result.file.name}</Text>
                                        )}
                                    </View>
                                </View>
                                {index < test_results.length - 1 && (
                                    <Divider style={{ marginLeft: 44, marginVertical: 6 }} />
                                )}
                            </View>
                        ))}
                    </Card>
                ) : (
                    <Card style={styles.emptyCard}>
                        <MaterialCommunityIcons name="test-tube-off" size={32} color={COLORS.textMuted} />
                        <Text style={styles.emptyText}>Chưa có kết quả xét nghiệm</Text>
                    </Card>
                )}

                <SectionTitle icon="pill" text="Đơn thuốc" />
                {hasPrescription ? (
                    <Card>
                        {prescription.instruction_notes && (
                            <>
                                <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
                                    <View style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: "#dbeff7", alignItems: "center", justifyContent: "center" }}>
                                        <MaterialCommunityIcons name="text-box-outline" size={16} color={COLORS.primary} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 2 }}>Hướng dẫn sử dụng</Text>
                                        <Text style={{ fontSize: 13, fontWeight: "600", color: COLORS.text }}>{prescription.instruction_notes}</Text>
                                    </View>
                                </View>
                                <Divider style={{ marginBottom: 10 }} />
                            </>
                        )}

                        {prescription.details?.map((detail, index) => (
                            <View key={detail.medicine_name ?? index}>
                                <View style={styles.medicineRow}>
                                    <View style={styles.medicineIconWrap}>
                                        <MaterialCommunityIcons name="pill" size={16} color={COLORS.primary} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.medicineName}>{detail.medicine_name}</Text>
                                        <Text style={styles.medicineSub}>
                                            {detail.dosage} • {detail.quantity} {detail.medicine_unit}
                                        </Text>
                                    </View>

                                </View>
                                {index < prescription.details.length - 1 && (
                                    <Divider style={{ marginLeft: 44, marginVertical: 6 }} />
                                )}
                            </View>
                        ))}
                    </Card>
                ) : (
                    <Card style={styles.emptyCard}>
                        <MaterialCommunityIcons name="pill-off" size={32} color={COLORS.textMuted} />
                        <Text style={styles.emptyText}>Chưa có đơn thuốc</Text>
                    </Card>
                )}

                {user?.role === "doctor" && (
                    record.appointment?.status === "Completed" ? (
                        <View style={{ margin: 16, padding: 12, backgroundColor: "#E8F5E9", borderRadius: 8, alignItems: "center" }}>
                            <Text style={{ color: "#2E7D32", fontWeight: "600" }}>Đã hoàn thành hồ sơ</Text>
                        </View>
                    ) : (
                        <View style={styles.actionContainer}>


                            {record.appointment?.status === "Pending_payment" ? (
                                <View style={{flex: 1}}>
                                    <AppButton
                                        type="pending"
                                        textColor="#F57C00"
                                        label="Chờ thanh toán"
                                        style={{ marginHorizontal: 0 }}
                                    />
                                </View>
                            ) : (
                                <>
                                    <View style={styles.actionButtonWrap}>
                                        <AppButton
                                            type="edit"
                                            label="Hồ sơ"
                                            onPress={() =>
                                                navigation.navigate("UpdateMedicalRecord", {
                                                    id: record.id,
                                                    record,
                                                })
                                            }
                                            style={styles.actionButton}
                                        />
                                    </View>

                                    <View style={styles.actionButtonWrap}>
                                        <AppButton
                                            type="edit"
                                            label="Đơn thuốc"
                                            onPress={() => {
                                                navigation.navigate("UpdatePrescription", {
                                                    medicalRecordId: record.id,
                                                    prescription: record.prescription ?? null,
                                                })
                                            }
                                            }
                                            style={styles.actionButton}
                                        />
                                    </View>

                                    <View style={styles.actionButtonWrap}>
                                        <AppButton
                                            type="edit"
                                            label="KQXN"
                                            onPress={() =>
                                                navigation.navigate("UpdateTestResults", {
                                                    medicalRecordId: record.id,
                                                    testResults: record.test_results ?? [],
                                                })
                                            }
                                            style={styles.actionButton}
                                        />
                                    </View>
                                    <View style={styles.actionButtonWrap}>
                                        <AppButton
                                            type="create"
                                            label="Hoàn thành"
                                            onPress={handleComplete}
                                            loading={loading}
                                            style={{ marginHorizontal: 0 }}
                                        />
                                    </View>
                                </>
                            )
                            }
                        </View>
                    )
                )}

            </ScrollView>


            <AppSnackbar
                visible={snackbar.visible}
                message={snackbar.message}
                type={snackbar.type}
                onDismiss={() => setSnackbar(s => ({ ...s, visible: false }))}
            />
        </View>
    );
};

export default MedicalRecordDetail;

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    scroll: { padding: 16, paddingBottom: 32 },
    actionContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        paddingHorizontal: 12,
        marginTop: 8,
    },

    actionButtonWrap: {
        width: "48%",
    },

    actionButton: {
        marginHorizontal: 0,
    },
    card: {
        borderRadius: 12,
        padding: 14,
        backgroundColor: "#fff",
        marginBottom: 12,
        elevation: 1,
    },
    emptyCard: {
        alignItems: "center",
        gap: 8,
        paddingVertical: 24,
    },
    emptyText: { color: "#7F8C8D", fontSize: 13 },

    rowDivider: { marginVertical: 10 },

    infoRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
    iconWrap: {
        width: 30, height: 30, borderRadius: 8,
        backgroundColor: "#EEF6FF",
        alignItems: "center", justifyContent: "center",
    },
    infoLabel: { fontSize: 11, color: COLORS.textMuted, marginBottom: 2 },
    infoValue: { fontSize: 13, fontWeight: "600", color: COLORS.text },

    testRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 4 },
    testIconWrap: {
        width: 32, height: 32, borderRadius: 8,
        backgroundColor: "#E8F5E9",
        alignItems: "center", justifyContent: "center",
    },
    testName: { fontSize: 13, fontWeight: "500", color: "#2C3E50" },
    testResult: { fontSize: 13, color: "#3a4040", marginTop: 2 },

    prescriptionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
    prescriptionTitle: { fontWeight: "600", fontSize: 14, color: "#2C3E50" },
    prescriptionNote: { fontSize: 15, color: "#2C3E50", marginTop: 2 },
    chip: { backgroundColor: "#E8F5E9" },
    chipText: { fontSize: 11, color: "#2E7D32" },

    medicineRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 4 },
    medicineIconWrap: {
        width: 32, height: 32, borderRadius: 8,
        backgroundColor: "#E3F2FD",
        alignItems: "center", justifyContent: "center",
    },
    medicineName: { fontSize: 13, fontWeight: "500", color: "#2C3E50" },
    medicineSub: { fontSize: 11, color: "#7F8C8D", marginTop: 2 },
    medicinePrice: { fontSize: 12, fontWeight: "600", color: COLORS.primary },

    totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    totalLabel: { fontWeight: "600", fontSize: 14, color: "#2C3E50" },
    totalValue: { fontWeight: "700", fontSize: 16, color: COLORS.primary },
});