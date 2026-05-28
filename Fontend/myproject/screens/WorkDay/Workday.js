import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { endpoints } from "../../configs/Apis";
import { fetchWithAuth } from "../../utils/apiHelper";
import { useSnackbar } from "../../utils/contexts/SnackBarContext";
import { useCallback, useContext, useEffect, useState } from "react";
import AppHeader from "../../components/AppHeader";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Calendar } from "react-native-calendars";
import AppButton from "../../components/AppButton";
import { useAlert } from "../../utils/contexts/AlertContext";
import LoadingScreen from "../../components/LoadingScreen";
import COLORS from "../../styles/Colors";
import { SectionLabel } from "../Appointment/Step1Schedule";
import { MyUserContext } from "../../utils/contexts/MyUserContext";
import { Icon } from "react-native-paper";
import { formatDate } from "../../utils/format";

const Workday = ({ route }) => {
    const [workdays, setWorkdays] = useState([]);
    const { showSnackbar } = useSnackbar();
    const [refreshing, setRefreshing] = useState(false);
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const { showAlert, showAlertAuth } = useAlert();
    const { user } = useContext(MyUserContext);
    const [currentMonth, setCurrentMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    });

    const loadWorkdays = async (isRefreshing = false) => {
        if (isRefreshing) setRefreshing(true);
        await fetchWithAuth(
            endpoints.workday,
            (data) => {
                console.log(data)
                setWorkdays(data)
            },
            () => showSnackbar("Lỗi vui lòng thử lại sau", "error"),
            {month: currentMonth}
        );
        setRefreshing(false);
        setLoading(false);
    };

    const checkUser = () => {
        if (!user) {
            showAlertAuth({ lable: "QL lịch làm việc" });
            setLoading(false);
            return false;
        }
        return true;
    };

    useEffect(() => {
        if (checkUser()) loadWorkdays();
    }, [currentMonth]);

    useFocusEffect(
        useCallback(() => {
            if (checkUser()) loadWorkdays();
            if (route.params?.deleted) {
                showSnackbar("Đã xóa ngày làm việc thành công", "success");
                navigation.setParams({ deleted: undefined });
            }
        }, [route.params?.deleted])
    );


    const markedDates = workdays.reduce((acc, d) => {
        const isCurrentMonth = d.date.startsWith(currentMonth);
        acc[d.date] = {
            selected: true,
            selectedColor: isCurrentMonth ? COLORS.primary : "#B0BEC5",
        };
        return acc;
    }, {});

    if (loading) return <LoadingScreen text="Đang xử lý..." />;

    return (
        <View style={styles.container}>
            <AppHeader titles="Lịch làm việc" onBack={() => navigation.goBack()} />

            <View style={styles.body}>

                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Icon source="clock-outline" size={20} color={COLORS.primary} />
                        <Text style={styles.statNumber}>{formatDate(currentMonth)}</Text>
                        <Text style={styles.statLabel}>Tháng đang chọn</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statCard}>
                        <Icon source="calendar-check-outline" size={20} color={COLORS.primary} />
                        <Text style={styles.statNumber}>{workdays.length}</Text>
                        <Text style={styles.statLabel}>Số ngày làm việc trong tháng</Text>
                    </View>
                </View>

                <View style={styles.calendarWrap}>
                    <SectionLabel text="Lịch làm việc theo tháng" />
                    <Calendar
                        style={styles.calendar}
                        theme={{
                            backgroundColor: "#fff",
                            calendarBackground: "#fff",
                            textSectionTitleColor: COLORS.primary,
                            selectedDayBackgroundColor: COLORS.primary,
                            selectedDayTextColor: "#fff",
                            todayTextColor: COLORS.primary,
                            dayTextColor: "#2d3436",
                            arrowColor: COLORS.primary,
                            monthTextColor: "#1a1a2e",
                            textMonthFontWeight: "700",
                            textDayFontSize: 13,
                            textMonthFontSize: 15,
                            dotColor: COLORS.primary,
                        }}
                        onMonthChange={(month) => {
                            const key = `${month.year}-${String(month.month).padStart(2, "0")}`;
                            setCurrentMonth(key);
                        }}
                        onDayPress={(day) => {
                            const match = workdays.find(d => d.date === day.dateString);
                            if (match)
                                navigation.navigate("UserTab", {
                                    screen: "Schedule",
                                    params: { id: match.id }
                                });
                        }}
                        disableAllTouchEventsForDisabledDays
                        markedDates={markedDates}
                    />
                </View>

                <View style={styles.hintRow}>
                    <View style={styles.hintDot} />
                    <Text style={styles.hintText}>Ngày tháng này</Text>
                    <View style={[styles.hintDot, { backgroundColor: "#B0BEC5" }]} />
                    <Text style={styles.hintText}>Tháng khác</Text>
                    <Icon source="gesture-tap" size={14} color="#999" />
                    <Text style={styles.hintText}>Nhấn để chỉnh sửa</Text>
                </View>
            </View>

            <AppButton
                label="Thêm ngày làm việc"
                mode="contained"
                onPress={() => navigation.navigate("UserTab", { screen: "Schedule" })}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    body: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
        gap: 16,
    },

    statsRow: {
        flexDirection: "row",
        backgroundColor: "#fff",
        borderRadius: 16,
        paddingVertical: 16,
        elevation: 2,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
    },
    statCard: {
        flex: 1,
        alignItems: "center",
        gap: 4,
    },
    statDivider: {
        width: 0.5,
        backgroundColor: "#E0E0E0",
        marginVertical: 4,
    },
    statNumber: {
        fontSize: 22,
        fontWeight: "700",
        color: COLORS.primary,
    },
    statLabel: {
        fontSize: 11,
        color: "#999",
        fontWeight: "500",
    },

    calendarWrap: {
        gap: 8,
    },
    calendar: {
        borderRadius: 16,
        elevation: 2,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        overflow: "hidden",
    },

    hintRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 4,
    },
    hintDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.primary,
    },
    hintText: {
        fontSize: 11,
        color: "#999",
        marginRight: 8,
    },
});

export default Workday;