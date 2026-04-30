import { View,Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import COLORS from "../../styles/Colors";
import React from "react";

const Row = ({ icon, label, value }) => (
    <View style={styles.row}>
        <View style={styles.rowIconWrap}>
            <MaterialCommunityIcons name={icon} size={16} color={COLORS.primary} />
        </View>
        <View style={{ flex: 1 }}>
            <Text style={styles.rowLabel}>{label}</Text>
            <Text style={styles.rowValue}>{value || "—"}</Text>
        </View>
    </View>
);

export default Row

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        paddingVertical: 10,
    },

    rowIconWrap: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: COLORS.successLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 1,
    },

    rowLabel: {
        fontSize: 11,
        color: COLORS.textLight,
        marginBottom: 3,
        fontWeight: '500',
    },

    rowValue: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
    },
})