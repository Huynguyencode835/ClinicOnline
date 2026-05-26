import { useEffect, useState, useContext, useCallback, useRef } from "react";
import { View, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity,ScrollView } from "react-native";
import { Text, TextInput,Chip } from "react-native-paper";
import { fetchWithAuth } from "../../utils/apiHelper";
import { endpoints } from "../../configs/Apis";
import COLORS from "../../styles/Colors";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import AppHeader from "../../components/AppHeader";
import AppButton from "../../components/AppButton";
import SectionTitle from "../../components/Appointment/SectionTilte";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { MyUserContext } from "../../utils/contexts/MyUserContext";
import { useSnackbar } from "../../utils/contexts/SnackBarContext";
import LoadingScreen from "../../components/LoadingScreen";
import StyleMedicine from "../../components/Medicine/StyleMedicine";
import styles from "../../styles/Mystyles"



const FILTERS = [
    { key: "all", label: "Tất cả" },
    { key: "low_stock", label: "Gần hết hàng" },
    { key: "expiring_soon", label: "Gần hết hạn" },
    { key: "inactive", label: "Ngừng bán" },
    { key: "expired", label: "Đã hết hạn" },
];

const MedicineList = () => {
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingScreen, setLoadingScreen] = useState(true);
    const [q, setQ] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const { showSnackbar } = useSnackbar();
    const { user } = useContext(MyUserContext);
    const nav = useNavigation();

    const debounceTimer = useRef(null);
    const currentQ = useRef("");
    const isLoadingRef = useRef(false);
    
    const [activeFilter, setActiveFilter] = useState("all");

    // ========== API ==========

    const loadMedicines = async (pageNum, searchTerm,filterKey="all") => {
        if (isLoadingRef.current) return;
        isLoadingRef.current = true;
        try {
            setLoading(true);
            let url = `${endpoints.medicines}?page=${pageNum}`;
            if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
            if (filterKey !== "all") url += `&filter=${filterKey}`;
            await fetchWithAuth(
                url,
                (data) => {
                    if (Array.isArray(data)) {
                        setMedicines(data);
                        setTotalPages(1);
                    }
                    else {
                        setMedicines(data.results ?? []);
                        const actualPageSize = data.results?.length;
                        setTotalPages(Math.ceil((data.count ?? 0) / actualPageSize || 1));
                    }
                },
                () => showSnackbar("Không thể tải danh sách thuốc", "error")
            );
        } catch (error) {
            console.error("Error loading medicines:", error);
        } finally {
            setLoading(false);
            setLoadingScreen(false);
            isLoadingRef.current = false;
        }
    };
  
    const handleFilterChange = (key) => {
        setActiveFilter(key);
        setPage(1);
        loadMedicines(1,currentQ.current,key);
    };

    // ========== SEARCH ==========

    const handleSearchChange = (v) => {
        setQ(v);
        currentQ.current = v;
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            setPage(1);
            loadMedicines(1, v,activeFilter);
            console.info(`${endpoints.medicines}?page=${page}&search=${encodeURIComponent(v)}`);   
        }, 500);
    };

    // ========== PAGINATION ==========

    const handlePrev = () => {
        if (page <= 1 || loading) return;
        const prevPage = page - 1;
        setPage(prevPage);
        loadMedicines(prevPage, currentQ.current,activeFilter);
    };

    const handleNext = () => {
        if (page >= totalPages || loading) return;
        const nextPage = page + 1;
        setPage(nextPage);
        loadMedicines(nextPage, currentQ.current,activeFilter);
    };

    // ========== EFFECTS ==========

    // Cleanup debounce khi unmount
    useEffect(() => {
        return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
    }, []);

    // Reset + load lại khi vào screen
    useFocusEffect(
        useCallback(() => {
            if (!user) { setLoadingScreen(false); return; }
            setPage(1);
            setQ("");
            setActiveFilter("all");
            currentQ.current = "";
            setMedicines([]);
            setLoadingScreen(true);
            loadMedicines(1, "",activeFilter);
        }, [user])
    );

    // ========== RENDER ==========

    if (loadingScreen) return <LoadingScreen text="Đang tải danh sách thuốc..." />;

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
            <AppHeader titles="Danh sách thuốc" onBack={() => nav.goBack()} >
                <View style={styles.header}>
                    <Text style={styles.headerSub}>{medicines.length} thuốc</Text>
                </View>

                <View style={{ paddingVertical: 10 }}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filterRow}
                    >
                        {FILTERS.map((f) => {
                            const isActive = activeFilter === f.key;
                            return (
                                <TouchableOpacity
                                    key={f.key}
                                    style={[styles.filterChip, isActive && styles.filterChipActive]}
                                    onPress={() => handleFilterChange(f.key)}
                                    activeOpacity={0.5}
                                >
                                    <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                                        {f.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>                
            </AppHeader>
            <TextInput
                mode="outlined"
                label="Tìm thuốc..."
                value={q}
                onChangeText={handleSearchChange}
                left={<TextInput.Icon icon="magnify" />}
                right={q.length > 0
                    ? <TextInput.Icon icon="close" onPress={() => handleSearchChange("")} />
                    : null}
                outlineColor={COLORS.border}
                activeOutlineColor={COLORS.primary}
                style={styles.input}
            />

            <FlatList
                contentContainerStyle={{ padding: 16 }}
                data={medicines}
                keyExtractor={(item) => `medicine-${item.id}`}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={StyleMedicine.medicineCard}
                        onPress={() => nav.navigate("MedicineDetail", { id: item.id })}
                    >
                        <View style={StyleMedicine.medicineTop}>
                            <View style={StyleMedicine.iconContainer}>
                                <MaterialCommunityIcons name="pill" size={24} color={COLORS.primary} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={StyleMedicine.medicineName}>{item.name}</Text>
                                <Text style={StyleMedicine.medicineDesc}>{item.description}</Text>
                            </View>
                        </View>
                        <View style={StyleMedicine.medicineBottom}>
                            <Text style={StyleMedicine.priceText}>
                                {item.price?.toLocaleString("vi-VN")}đ
                            </Text>
                            <View style={[StyleMedicine.stockBadge, item.is_low_stock && StyleMedicine.lowStock]}>
                                <Text style={StyleMedicine.stockText}>Kho: {item.stock}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    !loading && (
                        <View style={{ alignItems: "center", marginVertical: 32 }}>
                            <MaterialCommunityIcons name="pill-multiple" size={48} color={COLORS.textMuted} />
                            <Text style={{ marginTop: 12, color: COLORS.textMuted }}>
                                {q ? "Không tìm thấy thuốc" : "Chưa có thuốc"}
                            </Text>
                        </View>
                    )
                }
                ListFooterComponent={
                    loading
                        ? <ActivityIndicator size="large" color={COLORS.primary} style={{ marginVertical: 16 }} />
                        : totalPages>1 && (
                            <View style={StyleMedicine.pagination}>
                                <TouchableOpacity
                                    style={[StyleMedicine.pageBtn, page <= 1 && StyleMedicine.pageBtnDisabled]}
                                    onPress={handlePrev}
                                    disabled={page <= 1 || loading}
                                >
                                    <MaterialCommunityIcons name="chevron-left" size={20}
                                        color={page <= 1 ? COLORS.textMuted : COLORS.primary} />
                                    <Text style={[StyleMedicine.pageBtnText, page <= 1 && StyleMedicine.pageBtnTextDisabled]}>
                                        Trước
                                    </Text>
                                </TouchableOpacity>

                                <Text style={StyleMedicine.pageInfo}>Trang {page} / {totalPages}</Text>

                                <TouchableOpacity
                                    style={[StyleMedicine.pageBtn, page >= totalPages && StyleMedicine.pageBtnDisabled]}
                                    onPress={handleNext}
                                    disabled={page >= totalPages || loading}
                                >
                                    <Text style={[StyleMedicine.pageBtnText, page >= totalPages && StyleMedicine.pageBtnTextDisabled]}>
                                        Sau
                                    </Text>
                                    <MaterialCommunityIcons name="chevron-right" size={20}
                                        color={page >= totalPages ? COLORS.textMuted : COLORS.primary} />
                                </TouchableOpacity>
                            </View>
                        )
                }
            />

            {user?.role === "healthcare" && (
                <AppButton
                    type="create"
                    label="Thêm thuốc"
                    onPress={() => nav.navigate("CreateMedicine")}
                    style={styles.actionButton}
                />
            )}
        </View>
    );
};

export default MedicineList;

