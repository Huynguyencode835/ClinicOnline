import React from "react";
import { View, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";
import { useNavigation } from "@react-navigation/native";
import AppHeader from "../../components/AppHeader";
import COLORS from "../../styles/Colors";
import { useAlert } from "../../utils/contexts/AlertContext";

const VNPayWebView = ({ route }) => {
    const navigation = useNavigation();
    const { paymentUrl } = route.params;
    const { showAlert } = useAlert();

    const handleNavChange = (navState) => {
        const { url } = navState;
        console.log("WebView URL:", url);

        if (url.includes("Payment/success")) {
            navigation.reset({
                index: 0,
                routes: [{ name: "AppointmentsTab" }]
            });
        }

        if (url.includes("Payment/failed")) {
            showAlert({
                type: "danger",
                title: "Thanh toán thất bại",
                message: "Giao dịch không thành công. Bạn có muốn thử lại?",
                actions: [
                    { text: "Hủy", onPress: () => navigation.goBack() },
                    { text: "Thử lại", onPress: () => navigation.goBack() }
                ]
            });
        }

         // Bắt trang lỗi VNPay — link hết hạn hoặc lỗi sandbox
        if (url.includes("vnpayment.vn/paymentv2/Payment/Error"))  {
            showAlert({
                type: "warning",
                title: "Link đã hết hạn",
                message: "Phiên thanh toán đã hết hạn. Vui lòng thử lại.",
                actions: [
                    { text: "Hủy", onPress: () => navigation.goBack() },
                    { text: "Tạo link mới",onPress: () => navigation.goBack() }
                ]
            });
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <AppHeader titles="Thanh toán VNPay" onBack={() => navigation.goBack()} />
            <WebView
                source={{ uri: paymentUrl }}
                onNavigationStateChange={handleNavChange}
                startInLoadingState
                renderLoading={() => (
                    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                    </View>
                )}
            />
        </View>
    );
};

export default VNPayWebView;