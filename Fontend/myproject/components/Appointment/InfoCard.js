import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { Card } from "react-native-paper";
import COLORS from "../../styles/Colors";
import Row from "./Row";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const InfoCard = ({ style, rows }) => (
    <Card style={[styles.card, style]}>
        <Card.Content style={styles.cardContent}>
            {rows.map((row, i) => (
                <React.Fragment key={i}>
                    {i > 0 && <View style={styles.divider} />}
                    {row.custom ?? (
                        <Row icon={row.icon} label={row.label} value={row.value} />
                    )}
                </React.Fragment>
            ))}
        </Card.Content>
    </Card>
);

const InfoCard2Col = ({ style, rows }) => {
    const pairs = rows.reduce((acc, row, i) => {
        if (i % 2 === 0) acc.push([row]);
        else acc[acc.length - 1].push(row);
        return acc;
    }, []);

    return (
        <Card style={[styles.card, style]}>
            <Card.Content style={styles.cardContent}>
                {pairs.map((pair, pi) => (
                    <React.Fragment key={pi}>
                        {pi > 0 && <View style={styles.divider} />}

                        <View style={styles.rowPair}>
                            {pair.map((row, ri) => (
                                <View key={ri} style={styles.halfCol}>
                                    <View style={styles.colRow}>
                                        <View style={styles.rowIconWrap}>
                                            <MaterialCommunityIcons
                                                name={row.icon}
                                                size={16}
                                                color={COLORS.primary}
                                            />
                                        </View>

                                        {/* TEXT BLOCK */}
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.rowLabel}>
                                                {row.label}
                                            </Text>

                                            <Text style={styles.rowValue}>
                                                {row.value || "—"}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            ))}

                            {/* nếu lẻ thì fill cho cân */}
                            {pair.length === 1 && <View style={styles.halfCol} />}
                        </View>
                    </React.Fragment>
                ))}
            </Card.Content>
        </Card>
    );
};

export { InfoCard2Col };
export default InfoCard;

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        backgroundColor: COLORS.white,
        elevation: 2,
        marginBottom: 16,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
    },

    cardContent: {
        gap: 0,
    },

    divider: {
        height: 1,
        backgroundColor: COLORS.divider,
        marginHorizontal: -16,
    },

    rowPair: {
        flexDirection: "row",
        gap: 8,
    },

    halfCol: {
        flex: 1,
        paddingVertical: 4,
        paddingRight: 8,
        minWidth: 0, // 🔥 cực quan trọng để text wrap
    },

    colRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        paddingVertical: 10,
        gap: 8,
    },

    rowIconWrap: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: "#EEF6FF",
        alignItems: "center",
        justifyContent: "center",
    },

    rowLabel: {
        fontSize: 12,
        color: "#888",
        flexShrink: 1,
    },

    rowValue: {
        fontSize: 14,
        fontWeight: "500",
        color: "#222",
        flexShrink: 1,
        lineHeight: 20,
    },
});