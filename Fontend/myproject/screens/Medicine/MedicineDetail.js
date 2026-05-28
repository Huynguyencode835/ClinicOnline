import { useEffect, useState,useContext} from "react";
import { View, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import { Text, Surface, Chip, Divider } from "react-native-paper";
import { fetchWithAuth } from "../../utils/apiHelper";
import { endpoints } from "../../configs/Apis";
import COLORS from "../../styles/Colors";
import AppSnackbar from "../../components/AppSnackbar";
import SectionTitle from "../../components/Appointment/SectionTilte";
import InfoCard from "../../components/Appointment/InfoCard";
import {InfoCard2Col} from "../../components/Appointment/InfoCard";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AppHeader from "../../components/AppHeader";
import { useNavigation } from "@react-navigation/native";
import { formatDate, formatDate2 } from "../../utils/format";
import { genderMap } from "../../utils/mapping";
import { MyUserContext } from "../../utils/contexts/MyUserContext";
import AppButton from "../../components/AppButton";
import { updatePatchWithAuth } from "../../utils/apiHelper";
import { useSnackbar } from "../../utils/contexts/SnackBarContext";
import StyleMedicine from "../../components/Medicine/StyleMedicine";

const MedicineDetail = ({ route }) => {
    const { id } = route.params;
    const [medicine, setMedicine] = useState(null);
    const [loading, setLoading] = useState(true);
    const { showSnackbar } = useSnackbar();
    const navigation = useNavigation();
    const { user } = useContext(MyUserContext);

    useEffect(() => {
        fetchWithAuth(
            endpoints.medicineDetail(id),
            (data) => setMedicine(data),
            (errType, errMsg) => {
                showSnackbar("Không thể tải thông tin thuốc. Vui lòng thử lại sau.", "error");
                navigation.goBack();
            },
            {},
            setLoading
        );
    }, [id]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }
    const isLowStock = medicine.is_low_stock;
    const isExpiringSoon = medicine.is_expiring_soon;
    const isInactive = medicine.active === false;

    return (
        <View style={StyleMedicine.container}>
            <AppHeader titles="Chi tiết thuốc" onBack={() => navigation.goBack()} />

            <ScrollView contentContainerStyle={StyleMedicine.scrollContent}>
                {/* Hero Card */}
                <View style={StyleMedicine.heroCard}>
                    <View style={StyleMedicine.heroIconWrapper}>
                        <MaterialCommunityIcons name="pill" size={40} color={COLORS.primary} />
                    </View>
                    <Text style={StyleMedicine.medicineNameDetail}>{medicine.name}</Text>
                </View>

                {/* Price & Stock Row */}
                <View style={StyleMedicine.statsRow}>
                    <View style={StyleMedicine.statBox}>
                        <MaterialCommunityIcons name="currency-usd" size={20} color={COLORS.primary} />
                        <Text style={StyleMedicine.statLabel}>Giá bán</Text>
                        <Text style={StyleMedicine.statValue}>
                            {medicine.price?.toLocaleString("vi-VN")}đ
                        </Text>
                    </View>

                    <View style={StyleMedicine.statBox}>
                        <MaterialCommunityIcons
                            name="package-variant"
                            size={20}
                            color={isLowStock ? COLORS.error ?? "#e53935" : COLORS.primary}
                        />
                        <Text style={StyleMedicine.statLabel}>Tồn kho</Text>
                        <Text style={[StyleMedicine.statValue, isLowStock && StyleMedicine.lowStockValue]}>
                            {medicine.stock} {medicine.unit ?? ""}
                        </Text>
                    </View>
                </View>

                {/* Description */}
                {medicine.description && (
                    <View style={StyleMedicine.section}>
                        <View style={StyleMedicine.sectionHeader}>
                            <MaterialCommunityIcons name="text-box-outline" size={18} color={COLORS.primary} />
                            <Text style={StyleMedicine.sectionTitle}>Mô tả</Text>
                        </View>
                        <Text style={StyleMedicine.sectionBody}>{medicine.description}</Text>
                    </View>
                )}


                {/* Metadata Row */}
                <View style={StyleMedicine.metaRow}>
                    {medicine.production_date && (
                        <View style={StyleMedicine.metaItem}>
                            <MaterialCommunityIcons name="factory" size={16} color={COLORS.textMuted ?? "#999"} />
                            <Text style={StyleMedicine.metaText}>NSX: {formatDate(medicine.production_date)}</Text>
                        </View>
                    )}
                    {medicine.expiry_date && (
                        <View style={StyleMedicine.metaItem}>
                            <MaterialCommunityIcons name="calendar-clock" size={16} color={COLORS.textMuted ?? "#999"} />
                            <Text style={StyleMedicine.metaText}>HSD: {formatDate(medicine.expiry_date)}</Text>
                        </View>
                    )}
                </View>

                {/* Low stock warning */}
                {isLowStock && (
                    <View style={StyleMedicine.lowStockBanner}>
                        <MaterialCommunityIcons name="alert" size={20} color="#e53935" />
                        <Text style={StyleMedicine.lowStockBannerText}>
                            Tồn kho thấp — chỉ còn {medicine.stock} sản phẩm
                        </Text>
                    </View>
                )}

                {isExpiringSoon && (
                    <View style={StyleMedicine.warningBanner}>
                        <MaterialCommunityIcons name="calendar-alert" size={20} color="#f57c00"/>
                        <Text style={StyleMedicine.warningBannerText}>
                            Thuốc sắp hết hạn sử dụng
                        </Text>
                    </View>
                )}

                {isInactive && (
                    <View style={StyleMedicine.inactiveBanner}>
                        <MaterialCommunityIcons name="close-circle" size={20} color="#757575"/>
                        <Text style={StyleMedicine.inactiveBannerText}>
                            Thuốc đã ngừng kinh doanh
                        </Text>
                    </View>
                )}
            </ScrollView>
            {user?.role === "healthcare" && (
                <AppButton
                    type="edit"
                    label="Cập nhật"
                    onPress={() => navigation.navigate("UpdateMedicine",{medicine:medicine})}
                    style={styles.actionButton}
                />
            )}
        </View>
    );
};

export default MedicineDetail;

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});