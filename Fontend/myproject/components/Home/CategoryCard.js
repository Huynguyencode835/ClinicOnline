import React, { useContext } from "react";
import { View, FlatList, Pressable, StyleSheet, Text } from "react-native";
import { Icon } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import COLORS from "../../styles/Colors";
import AnimatedPressable from "../Animation/AnimatedPressable";
import { useSnackbar } from "../../utils/contexts/SnackBarContext";
import { MyUserContext } from "../../utils/contexts/MyUserContext";


const categories = [
    { id: "1", icon: "calendar-plus", label: "Đặt khám\nlịch khám", screen: "BookingTab" },
    { id: "2", icon: "clipboard-list-outline", label: "Lịch hẹn\ncủa tôi", screen: "AppointmentsTab" },
    { id: "3", icon: "file-document", label: "Bệnh án\ncủa tôi", screen: "MedicalRecordTab" },
    { id: "4", icon: "message-text", label: "Chat\nhỗ trợ", screen: "ChatTab" },
    { id: "5", icon: "magnify", label: "Tìm kiếm\nbác sĩ", screen: "HomeTab", nestedScreen: "Search" },
    { id: "6", icon: "account-circle-outline", label: "Hồ sơ\ncá nhân", screen: "UserTab", nestedScreen: "ProfileDetail" },
    { id: "7", icon: "doctor", label: "Danh sách\nbác sĩ", screen: "HomeTab", nestedScreen: "Home" },
    { id: "8", icon: "calendar-check-outline", label: "Lịch làm\nviệc", screen: "WorkdayTab" },
    { id: "9", icon: "needle", label: "Kết quả\nxét nghiệm", screen: "MedicalRecordTab", nestedScreen: "UpdateTestResults" },
    { id: "10", icon: "pill", label: "Đơn thuốc\ncủa tôi", screen: "MedicalRecordTab", nestedScreen: "UpdatePrescription" },
    { id: "11", icon: "calendar-account", label: "Chi tiết\nlịch hẹn", screen: "AppointmentsTab" },
];

const CategoryCard = () => {

    const navigation = useNavigation();
    const {showSnackbar} = useSnackbar();
    const {user} = useContext(MyUserContext);

    return (
        <View style={styles.card}>
            <FlatList
                data={categories}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <AnimatedPressable scaleTo={0.97} bounciness={8}>
                        <Pressable
                            style={({ pressed }) => [
                                styles.chip,
                                pressed && styles.chipPressed,
                            ]}
                            onPress={() => {
                                if ((item.screen === "BookingTab" && user?.role !== "customer") || (item.screen === "WorkdayTab" && user?.role === "customer")) {
                                    showSnackbar("Bạn không có quyền truy cập","warning")
                                    return;
                                }
                                if (item.nestedScreen) {
                                    navigation.navigate(item.screen, { screen: item.nestedScreen });
                                } else {
                                    navigation.navigate(item.screen);
                                }
                            }}
                        >
                            <View style={styles.iconWrap}>
                                <Icon source={item.icon} size={28} color={COLORS.primary} />
                            </View>
                            <Text style={styles.label}>{item.label}</Text>
                        </Pressable>
                    </AnimatedPressable>

                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        paddingVertical: 16,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 6,
        marginVertical: 12,
    },
    listContent: {
        paddingHorizontal: 12,
        gap: 8,
    },
    chip: {
        alignItems: "center",
        justifyContent: "center",
        width: 80,
        paddingVertical: 10,
        paddingHorizontal: 6,
        borderRadius: 12,
        backgroundColor: COLORS.primary + "10",
    },
    chipPressed: {
        backgroundColor: COLORS.primary + "25",
    },
    iconWrap: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.primary + "15",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
    },
    label: {
        fontSize: 11,
        color: COLORS.text,
        textAlign: "center",
        lineHeight: 16,
    },
});

export default CategoryCard;