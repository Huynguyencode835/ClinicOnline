import { useState, useEffect } from "react";
import {
    View, ScrollView, StyleSheet, Switch
} from "react-native";
import { Text } from "react-native-paper";
import AppHeader from "../../components/AppHeader";
import AppButton from "../../components/AppButton";
import COLORS from "../../styles/Colors";
import { fetchWithAuth, updatePatchWithAuth } from "../../utils/apiHelper";
import { endpoints } from "../../configs/Apis";
import { useSnackbar } from "../../utils/contexts/SnackBarContext";
import Field from "../../components/MedicalRecord/Field";
import FieldWithError from "../../components/MedicalRecord/FieldWithError";
import SectionTitle from "../../components/Appointment/SectionTilte";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import styles from "../../styles/Mystyles"

const UpdateMedicine = ({ navigation, route }) => {
    const { medicine } = route.params;
    const { showSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(false);

    const [name, setName] = useState(medicine?.name ?? "");
    const [description, setDescription] = useState(medicine?.description ?? "");
    const [price, setPrice] = useState(String(medicine?.price ?? ""));
    const [stock, setStock] = useState(String(medicine?.stock ?? 0));
    const [unit, setUnit] = useState(medicine?.unit ?? "");
    const [productionDate, setProductionDate] = useState(medicine?.production_date ?? "");
    const [expiryDate, setExpiryDate] = useState(medicine?.expiry_date ?? "");
    const [active, setActive] = useState(medicine?.active ?? true);
    const [errors, setErrors] = useState({});


    const handleSubmit = async () => {
        if (!name.trim()) {
            showSnackbar("Vui lòng nhập tên thuốc", "error");
            return;
        }
        if (!price || isNaN(Number(price))) {
            showSnackbar("Giá thuốc không hợp lệ", "error");
            return;
        }
        if (!stock || isNaN(Number(stock))) {
            showSnackbar("Tồn kho không hợp lệ", "error");
            return;
        }

        await updatePatchWithAuth(
            endpoints.medicineDetail(medicine.id),
            {
                name: name.trim(),
                description: description.trim(),
                price: Number(price),
                stock: Number(stock),
                unit: unit.trim(),
                production_date: productionDate.trim() || null,
                expiry_date: expiryDate.trim() || null,
                active,
            },
            () => {
                showSnackbar("Cập nhật thuốc thành công", "success");
                navigation.pop(2);
            },
            (type, msg, errData) => {
                if (errData && typeof errData === "object") {
                    setErrors(errData);
                } else {
                    showSnackbar(msg || "Cập nhật thất bại", "error");
                }
            },
            setLoading
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
            <AppHeader titles="Cập nhật thuốc" onBack={() => navigation.goBack()} />
            <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>

                <SectionTitle icon="pill" text="Thông tin thuốc" />
                <View style={styles.card}>
                    <FieldWithError label="Tên thuốc *" value={name} onChangeText={setName} error={errors.name}/>
                    <FieldWithError label="Mô tả" value={description} onChangeText={setDescription} multiline error={errors.description}/>
                    <FieldWithError label="Đơn vị" value={unit} onChangeText={setUnit} placeholder="VD: viên, chai, hộp" error={errors.unit}/>
                </View>

                <SectionTitle icon="package-variant" text="Kho & Giá" />
                <View style={styles.card}>
                    <FieldWithError label="Giá (VNĐ) *" value={price} onChangeText={setPrice} keyboardType="numeric" error={errors.price}/>
                    <FieldWithError label="Tồn kho *" value={stock} onChangeText={setStock} keyboardType="numeric" error={errors.stock}/>
                    <FieldWithError label="Ngày sản xuất (YYYY-MM-DD)" value={productionDate} onChangeText={setProductionDate} placeholder="2025-01-01" error={errors.production_date}/>
                    <FieldWithError label="Ngày hết hạn (YYYY-MM-DD)" value={expiryDate} onChangeText={setExpiryDate} placeholder="2027-12-31" error={errors.expiry_date}/>
                </View>

                <SectionTitle icon="toggle-switch" text="Trạng thái" />
                <View style={styles.card}>
                    <View style={localStyles.switchRow}>
                        <View>
                            <Text style={localStyles.switchLabel}>Đang kinh doanh</Text>
                            <Text style={localStyles.switchSub}>
                                {active ? "Thuốc đang được bán" : "Thuốc đã ngừng bán"}
                            </Text>
                        </View>
                        <Switch
                            value={active}
                            onValueChange={setActive}
                            trackColor={{ false: "#E5E7EB", true: COLORS.primary }}
                            thumbColor="#fff"
                        />
                    </View>
                </View>

                <AppButton
                    type="create"
                    label="Lưu thay đổi"
                    onPress={handleSubmit}
                    loading={loading}
                />
            </ScrollView>
        </View>
    );
};

export default UpdateMedicine;

const localStyles = StyleSheet.create({
    switchRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    switchLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: COLORS.text,
    },
    switchSub: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginTop: 2,
    },
});