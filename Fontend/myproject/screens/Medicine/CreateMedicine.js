import { useEffect, useState, useContext, useCallback, useRef } from "react";
import { View, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity,ScrollView } from "react-native";
import { Text, TextInput,Chip } from "react-native-paper";
import { fetchWithAuth } from "../../utils/apiHelper";
import { endpoints } from "../../configs/Apis";
import COLORS from "../../styles/Colors";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import AppHeader from "../../components/AppHeader";
import AppButton from "../../components/AppButton";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { MyUserContext } from "../../utils/contexts/MyUserContext";
import { useSnackbar } from "../../utils/contexts/SnackBarContext";
import LoadingScreen from "../../components/LoadingScreen";
import StyleMedicine from "../../components/Medicine/StyleMedicine";
import styles from "../../styles/Mystyles"
import SectionTitle from "../../components/Appointment/SectionTilte";
import FieldWithError from "../../components/MedicalRecord/FieldWithError"
import DateField from "../../components/Medicine/DateField";
import {formatDate} from "../../utils/format"
import { createWithAuth } from "../../utils/apiHelper";


const CreateMedicine = () => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("");
    const [unit, setUnit] = useState("");
    const [productionDate, setProductionDate] = useState(null);
    const [expiryDate, setExpiryDate] = useState(null);
    const [loading, setLoading] = useState(false);
    const { showSnackbar } = useSnackbar();
    const navigation = useNavigation();
    const { user } = useContext(MyUserContext);
    const [errors, setErrors] = useState({});
    

    const handleSubmit = async () => {
        if (!name.trim()) {
            showSnackbar("Vui lòng nhập tên thuốc", "error");
            return;
        }
        if (!unit.trim()) {
            showSnackbar("Vui lòng đơn vị thuốc", "error");
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
        const body={
            name: name.trim(),
                description: description.trim(),
                unit: unit.trim(),
                price: Number(price),
                stock: Number(stock),
                production_date: productionDate || null,
                expiry_date: expiryDate || null,
        }
        await createWithAuth(
            endpoints.medicines,
            body,
            () => {
                showSnackbar("Tạo thuốc thành công", "success");
                navigation.goBack();
            },
            (type, msg, errData) => {
                if (errData && typeof errData === "object") {
                    setErrors(errData);
                } else {
                    showSnackbar(msg || "Cập nhật thất bại", "error");
                }
            },
            setLoading,
        );
    };

    return (
        <View  style={{ flex: 1, backgroundColor: COLORS.bg }}>
            <AppHeader titles="Thêm thuốc" onBack={() => navigation.goBack()} />
            <ScrollView contentContainerStyle={styles.scroll}>
                <SectionTitle icon="pill" text="Thông tin thuốc" />
                <FieldWithError label="Tên thuốc *" value={name} onChangeText={setName} error={errors.name}/>
                <FieldWithError label="Mô tả" value={description} onChangeText={setDescription} multiline error={errors.description}/>
                <FieldWithError label="Đơn vị *" value={unit} onChangeText={setUnit} placeholder="VD: Viên, Chai, Hộp" error={errors.unit}/>
                <FieldWithError label="Giá (VNĐ) *" value={price} onChangeText={setPrice} keyboardType="numeric" error={errors.price}/>
                <FieldWithError label="Tồn kho *" value={stock} onChangeText={setStock} keyboardType="numeric" error={errors.stock}/>
                <DateField label="Ngày sản xuất" value={productionDate} onChange={setProductionDate} placeholder="01-01-2025" error={errors.production_date}/>
                <DateField label="Ngày hết hạn" value={expiryDate} onChange={setExpiryDate} placeholder="12-31-2027" error={errors.expiry_date}/>


                <AppButton
                    type="create"
                    label="Lưu thuốc"
                    onPress={handleSubmit}
                    loading={loading}
                />
            </ScrollView>
        </View>
    );
};

export default CreateMedicine;