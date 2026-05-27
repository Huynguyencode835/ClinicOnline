import { useEffect, useState ,useRef} from "react";
import {
    View, ScrollView, StyleSheet,
    TouchableOpacity, ActivityIndicator
} from "react-native";
import { Text, Divider } from "react-native-paper";
import AppHeader from "../../components/AppHeader";
import AppButton from "../../components/AppButton";
import COLORS from "../../styles/Colors";
import { fetchWithAuth, createWithAuth,updatePatchWithAuth } from "../../utils/apiHelper";
import { endpoints } from "../../configs/Apis";
import { useSnackbar } from "../../utils/contexts/SnackBarContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { TextInput } from "react-native-paper";
import SectionTitle from "../../components/Appointment/SectionTilte";
import Field from "../../components/MedicalRecord/Field";
import styles from "../../styles/Mystyles";
import confirmDelete from "../../components/MedicalRecord/ConfirmDelete";
const UpdatePrescription = ({ navigation , route}) => {
    const { medicalRecordId, prescription } = route.params;
    const {showSnackbar} = useSnackbar();
    const [loading, setLoading] = useState(false);
    const [medicineResults, setMedicineResults] = useState([]);
    const medicineDebounce = useRef(null);
    const [searchingMedicine, setSearchingMedicine] = useState(false);
    const [medicineSearch, setMedicineSearch] = useState("");
    const [instructionNotes, setInstructionNotes] = useState(prescription?.instruction_notes ?? "");
    const [prescriptionDetails, setPrescriptionDetails] = useState(
        prescription?.details?.map(d => ({
            medicine_id: d.medicine_id,
            name: d.medicine_name,
            quantity: String(d.quantity),
            dosage: d.dosage,
        })) ?? []
    );

    const searchMedicines = async (keyword) => {
        if (!keyword.trim()) { setMedicineResults([]); return; }
        let url = `${endpoints.medicines}?search=${encodeURIComponent(keyword)}`;
        setSearchingMedicine(true);
        await fetchWithAuth(
            url,
            (data) => setMedicineResults(Array.isArray(data) ? data : (data.results ?? [])),
            () => showSnackbar("Không tìm được thuốc", "error")
        );
        setSearchingMedicine(false);
    };

    const filteredMedicines = medicineResults.filter(
        m => !prescriptionDetails.find(d => d.medicine_id === m.id)
    );

    const addMedicine = (m) => {
        setPrescriptionDetails(prev => [...prev, { medicine_id: m.id, name: m.name, quantity: "", dosage: "" }]);
        setMedicineSearch("");
    };

    const updateMedicine = (index, field, value) => {
        setPrescriptionDetails(prev =>
            prev.map((item, i) => i === index ? { ...item, [field]: value } : item)
        );
    };

    const removeMedicine = (index) => {
        confirmDelete({
            message: `Bạn có chắc muốn xóa thuốc "${prescriptionDetails[index]?.name}" không?`,
            onConfirm: () => {
            setPrescriptionDetails(prev => prev.filter((_, i) => i !== index));
        }
        });
    };

    const handleApiError = (type, msg, errData) => {
        console.log("handleApiError:", type, msg, JSON.stringify(errData));
        if (errData && typeof errData === "object") {
            // Lỗi dạng { details: [{non_field_errors: [...]}] }
            if (Array.isArray(errData.details)) {
                const messages = errData.details
                    .flatMap(item => item?.non_field_errors ?? [])
                    .filter(Boolean)
                    .join("\n");
                if (messages) { showSnackbar(messages, "error"); return; }
            }
            // Lỗi dạng { field: ["lỗi"] } hoặc { detail: "..." }
            const messages = Object.entries(errData)
                .flatMap(([_, errors]) =>
                    Array.isArray(errors) ? errors : [String(errors)]
                )
                .filter(Boolean)
                .join("\n");
            if (messages) { showSnackbar(messages, "error"); return; }
        }
        showSnackbar(msg || "Có lỗi xảy ra", "error");
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const body = {
                instruction_notes: instructionNotes.trim(),
                details: prescriptionDetails.map(d => ({
                    medicine_id: d.medicine_id,
                    quantity: parseInt(d.quantity) || 0,
                    dosage: d.dosage.trim(),
                }))
            };

            console.log("prescription?.id:", prescription?.id);
            console.log("endpoint:", endpoints.prescriptionDetail(prescription?.id));
            console.log("body:", JSON.stringify(body, null, 2));

            if (prescription?.id) {
                // Cập nhật đơn thuốc đã có
                await updatePatchWithAuth(
                    endpoints.prescriptionDetail(prescription.id),
                    body,
                    (data) => {
                        console.log("success:", JSON.stringify(data, null, 2));
                        showSnackbar("Cập nhật đơn thuốc thành công", "success");
                        navigation.goBack();
                    },
                    handleApiError,
                    setLoading
                );
            } else {
                // Tạo mới đơn thuốc
                await createWithAuth(
                    endpoints.prescriptions,
                    { ...body, medical_record_id: medicalRecordId },
                    (data) => {
                        console.log("success:", JSON.stringify(data, null, 2));
                        showSnackbar("Tạo đơn thuốc thành công", "success");
                        navigation.goBack();
                    },
                    handleApiError,
                    setLoading
                );
            }
            // navigation.goBack();
        } catch (err) {
            console.log("submit error:", err);
            showSnackbar("Đã có lỗi xảy ra. Vui lòng thử lại.", "error");
        } finally {
            setLoading(false);
        }
    };


    return (
        <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
            <AppHeader
                titles={prescription?.id ? "Cập nhật đơn thuốc" : "Tạo đơn thuốc"}
                onBack={() => navigation.goBack()}
            />   
            <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
                <SectionTitle title="Thông tin đơn thuốc" />
                {/* ── ĐƠN THUỐC ── */}
                <View style={styles.card}>
                    <Field
                        label="Hướng dẫn sử dụng"
                        value={instructionNotes}
                        onChangeText={setInstructionNotes}
                        multiline
                    />

                    {/* Thanh tìm kiếm thuốc dùng chung */}
                    <TextInput
                        mode="outlined"
                        label="Tìm và thêm thuốc..."
                        value={medicineSearch}
                        onChangeText={(v)=>{
                            setMedicineSearch(v);
                            if (medicineDebounce.current) clearTimeout(medicineDebounce.current);
                            medicineDebounce.current = setTimeout(() => {
                                searchMedicines(v);
                            }, 500);
                        }}
                        left={<TextInput.Icon icon="magnify" />}
                        outlineColor={COLORS.border}
                        activeOutlineColor={COLORS.primary}
                        style={styles.input}
                    />

                    {/* Kết quả tìm kiếm */}
                    {medicineSearch.trim().length > 0 && (
                        <View style={localStyles.searchResults}>
                            <ScrollView
                                nestedScrollEnabled={true}
                                keyboardShouldPersistTaps="handled"
                                style={{maxHeight:200}}
                            >
                            {filteredMedicines.map(m => (
                                    <TouchableOpacity
                                        key={m.id}
                                        style={localStyles.searchResultItem}
                                        onPress={() => {
                                            addMedicine(m)
                                        }}
                                    >
                                        <MaterialCommunityIcons name="pill" size={14} color={COLORS.primary} />
                                        <Text style={localStyles.searchResultText}>{m.name}</Text>
                                        <MaterialCommunityIcons name="plus-circle-outline" size={16} color={COLORS.primary} />
                                    </TouchableOpacity>
                                ))
                            }
                            {filteredMedicines.length === 0  && (
                                <Text style={localStyles.noResult}>Không tìm thấy thuốc</Text>
                            )}
                            </ScrollView>
                        </View>
                    )}
                    {/* Danh sách thuốc đã thêm */}
                    {prescriptionDetails.map((detail, index) => (
                        
                        <View key={`medicine-${detail.medicine_id}`} style={localStyles.medicineItem}>
                            <View style={localStyles.medicineHeader}>
                                <View style={localStyles.selectedMedicine}>
                                    <MaterialCommunityIcons name="pill" size={14} color={COLORS.primary} />
                                    <Text style={localStyles.selectedMedicineName}>{detail.name}</Text>
                                </View>
                                <TouchableOpacity onPress={() => removeMedicine(index)}>
                                    <MaterialCommunityIcons name="close-circle" size={20} color="#EF4444"/>
                                </TouchableOpacity>
                            </View>

                            <Field
                                label="Số lượng"
                                value={detail.quantity}
                                onChangeText={(v) => updateMedicine(index, "quantity", v)}
                                keyboardType="numeric"
                            />
                            <Field
                                label="Liều dùng"
                                value={detail.dosage}
                                onChangeText={(v) => updateMedicine(index, "dosage", v)}
                            />
                        </View>
                          
                    ))}
                        
                </View>
                <AppButton
                    type="create"
                    label={prescription?.id ? "Lưu cập nhật" : "Tạo đơn thuốc"}
                    onPress={handleSubmit}
                    loading={loading}
                />
            </ScrollView>

            
        </View>
        
    );
}

export default UpdatePrescription;

const localStyles = StyleSheet.create({
    searchResults: {
        backgroundColor: "#fff",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
    },
    searchResultItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: "#F3F4F6",
    },
    searchResultText: {
        flex: 1,
        fontSize: 13,
        color: COLORS.text,
    },
    noResult: {
        padding: 14,
        fontSize: 13,
        color: COLORS.textMuted,
        textAlign: "center",
    },
    medicineItem: {
        gap: 8,
        backgroundColor: "#F8FAFC",
        borderRadius: 10,
        padding: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        marginBottom: 10, 
    },
    medicineHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    selectedMedicine: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        flex: 1,
    },
    selectedMedicineName: {
        flex: 1,
        fontSize: 13,
        fontWeight: "600",
        color: COLORS.text,
    },
});