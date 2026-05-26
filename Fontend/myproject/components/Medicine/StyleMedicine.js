import { StyleSheet } from 'react-native';
import COLORS from '../../styles/Colors';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },

    medicineCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 14,

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 4,

        elevation: 3,
    },

    medicineTop: {
        flexDirection: "row",
        alignItems: "center",
    },

    iconContainer: {
        width: 52,
        height: 52,
        borderRadius: 14,
        backgroundColor: "#EEF4FF",

        justifyContent: "center",
        alignItems: "center",

        marginRight: 14,
    },

    medicineName: {
        fontSize: 16,
        fontWeight: "700",
        color: COLORS.text,
    },

    medicineDesc: {
        marginTop: 4,
        color: COLORS.textMuted,
        fontSize: 13,
        lineHeight: 18,
    },

    medicineBottom: {
        marginTop: 14,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    priceText: {
        fontSize: 16,
        fontWeight: "700",
        color: COLORS.primary,
    },

    stockBadge: {
        backgroundColor: "#E8F7EE",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 999,
    },

    lowStock: {
        backgroundColor: "#FFE8E8",
    },

    stockText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#2E7D32",
    },
     pagination: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 8,
    },
    pageBtn: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: COLORS.surface,
        gap: 4,
    },
    pageBtnDisabled: {
        opacity: 0.4,
    },
    pageBtnText: {
        color: COLORS.primary,
        fontWeight: "600",
    },
    pageBtnTextDisabled: {
        color: COLORS.textMuted,
    },
    pageInfo: {
        color: COLORS.text,
        fontWeight: "500",
    },
    
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 32,
    },

    // Hero
    heroCard: {
        backgroundColor: COLORS.surface ?? "#fff",
        borderRadius: 16,
        padding: 24,
        alignItems: "center",
        marginBottom: 16,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
    },
    heroIconWrapper: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: COLORS.primaryLight ?? "#e8f5e9",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    medicineNameDetail: {
        fontSize: 22,
        fontWeight: "700",
        color: COLORS.text ?? "#1a1a1a",
        textAlign: "center",
        marginBottom: 8,
    },
    categoryChip: {
        backgroundColor: COLORS.primaryLight ?? "#e8f5e9",
        marginTop: 4,
    },
    categoryChipText: {
        color: COLORS.primary,
        fontSize: 12,
    },

    // Stats
    statsRow: {
        flexDirection: "row",
        backgroundColor: COLORS.surface ?? "#fff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
    },
    statBox: {
        flex: 1,
        alignItems: "center",
        gap: 4,
    },
    statDivider: {
        width: 1,
        backgroundColor: COLORS.border ?? "#e0e0e0",
        marginHorizontal: 8,
    },
    statLabel: {
        fontSize: 11,
        color: COLORS.textMuted ?? "#999",
        marginTop: 4,
    },
    statValue: {
        fontSize: 15,
        fontWeight: "700",
        color: COLORS.text ?? "#1a1a1a",
    },
    lowStockValue: {
        color: "#e53935",
    },

    // Sections
    section: {
        backgroundColor: COLORS.surface ?? "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 1,
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
    },
    warningSection: {
        backgroundColor: "#fff8f8",
        borderLeftWidth: 3,
        borderLeftColor: "#e53935",
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: COLORS.text ?? "#1a1a1a",
    },
    warningTitle: {
        color: "#e53935",
    },
    sectionBody: {
        fontSize: 14,
        color: COLORS.textSecondary ?? "#555",
        lineHeight: 22,
    },

    divider: {
        marginVertical: 12,
        backgroundColor: COLORS.border ?? "#e0e0e0",
    },

    // Meta
    metaRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
        marginBottom: 16,
    },
    metaItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: COLORS.surface ?? "#fff",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        elevation: 1,
    },
    metaText: {
        fontSize: 13,
        color: COLORS.textMuted ?? "#999",
    },

    // Low stock banner
    lowStockBanner: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "#fff3f3",
        borderRadius: 10,
        padding: 12,
        borderWidth: 1,
        borderColor: "#ffcdd2",
    },
    lowStockBannerText: {
        fontSize: 13,
        color: "#e53935",
        fontWeight: "500",
    },
    warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFF3E0",
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    },

    warningBannerText: {
        color: "#f57c00",
        fontWeight: "600",
    },

    inactiveBanner: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "#F3F4F6",
        borderRadius: 12,
        padding: 12,
        marginTop: 12,
    },

    inactiveBannerText: {
        color: "#616161",
        fontWeight: "600",
    },
});
