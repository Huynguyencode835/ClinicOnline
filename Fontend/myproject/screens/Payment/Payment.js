import React, { useCallback, useState } from "react";
import { View, Text, ActivityIndicator, ScrollView, StyleSheet } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Divider } from "react-native-paper";
import { fetchWithAuth, updatePatchWithAuth,createWithAuth } from "../../utils/apiHelper";
import { endpoints } from "../../configs/Apis";
import AppHeader from "../../components/AppHeader";
import AppButton from "../../components/AppButton";
import COLORS from "../../styles/Colors";
import { useAlert } from "../../utils/contexts/AlertContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Linking } from "react-native";

const Payment = ({ route }) => {
    const navigation = useNavigation();
    const appointmentId = route.params?.appointmentId;
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(false);
    const { showAlert } = useAlert();

    useFocusEffect(
        useCallback(() => {
            fetchWithAuth(
                endpoints.appointmentInvoice(appointmentId),
                (data) => setInvoice(data),
                () => {}
            );
        }, [appointmentId])
    );

    const handlePayment =  async () => {
        console.log("handlePayment called"); 
        await createWithAuth(
            endpoints.vnpayCreate(appointmentId),
            {},
            (data) => {
                    console.log("payment_url:", data.payment_url);
                    navigation.navigate("VNPayWebView", {
                        paymentUrl: data.payment_url,
                        appointmentId,
                    });
            },
            () => { 
                console.log("error:", type, msg);
                showAlert({ 
                    type: "danger",
                    title: "Lỗi",
                    message: "Không tạo được link thanh toán!",
                    actions: [{ text: "OK" }]
                });
            },
            setLoading
        );
    };

    if (!invoice) return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
            <AppHeader titles="Hóa đơn thanh toán" onBack={() => navigation.goBack()} />

            <ScrollView contentContainerStyle={{ padding: 16 }}>

                {/* Thông tin lịch hẹn */}
                <Section title="Thông tin lịch hẹn" icon="calendar-check">
                    <Row label="Mã phiếu" value={`#${invoice.appointment_id}`} />
                </Section>

                {/* Dịch vụ */}
                <Section title="Dịch vụ khám" icon="medical-bag">
                    <Row label={invoice.service.name || "—"} value={invoice.service.fee} isCurrency />
                </Section>

                {/* Bác sĩ */}
                <Section title="Phí bác sĩ" icon="account-tie">
                    <Row label={invoice.doctor.name} value={invoice.doctor.fee} isCurrency />
                </Section>

                {/* Thuốc */}
                {invoice.prescription.items.length > 0 && (
                    <Section title="Đơn thuốc" icon="pill">
                        {invoice.prescription.items.map((item, i) => (
                            <Row
                                key={i}
                                label={`${item.name} x${item.quantity} ${item.unit}`}
                                value={item.total}
                                isCurrency
                            />
                        ))}
                        <Divider style={{ marginVertical: 6 }} />
                        <Row label="Tổng thuốc" value={invoice.prescription.fee} isCurrency bold />
                    </Section>
                )}

                {/* Xét nghiệm */}
                {invoice.tests.items.length > 0 && (
                    <Section title="Xét nghiệm" icon="test-tube">
                        {invoice.tests.items.map((item, i) => (
                            <Row key={i} label={item.name} value={item.price} isCurrency />
                        ))}
                        <Divider style={{ marginVertical: 6 }} />
                        <Row label="Tổng xét nghiệm" value={invoice.tests.fee} isCurrency bold />
                    </Section>
                )}

                {/* Tổng cộng */}
                <View style={styles.totalCard}>
                    <Text style={styles.totalLabel}>Tổng cộng</Text>
                    <Text style={styles.totalValue}>{invoice.total?.toLocaleString()} VNĐ</Text>
                </View>

            </ScrollView>
            {invoice.status === "Pending_payment" && (
                <AppButton
                    type="confirm"
                    label="Xác nhận thanh toán"
                    onPress={handlePayment}
                    loading={loading}
                />
            )}

            {invoice.status === "Completed" && (
                <View style={{ margin: 16, padding: 12, backgroundColor: "#E8F5E9", borderRadius: 8, alignItems: "center" }}>
                    <Text style={{ color: "#2E7D32", fontWeight: "600" }}>✓ Đã thanh toán</Text>
                </View>
            )}
        </View>
    );
};

const Section = ({ title, icon, children }) => (
    <View style={styles.card}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <MaterialCommunityIcons name={icon} size={16} color={COLORS.primary} />
            <Text style={{ fontWeight: "700", fontSize: 14, color: COLORS.text }}>{title}</Text>
        </View>
        {children}
    </View>
);

const Row = ({ label, value, isCurrency, bold }) => (
    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
        <Text style={{ fontSize: 13, color: bold ? COLORS.text : COLORS.textMuted, fontWeight: bold ? "600" : "400", flex: 1 }}>
            {label}
        </Text>
        <Text style={{ fontSize: 13, color: COLORS.text, fontWeight: bold ? "700" : "500" }}>
            {isCurrency ? `${value?.toLocaleString()} VNĐ` : value}
        </Text>
    </View>
);

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
    },
    totalCard: {
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        padding: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: "700",
        color: "#fff",
    },
    totalValue: {
        fontSize: 18,
        fontWeight: "800",
        color: "#fff",
    },
});

export default Payment;