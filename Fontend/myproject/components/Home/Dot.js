import { Animated, StyleSheet } from "react-native";

const Dot = ({ index, scrollX, bannerWidth = BANNER_WIDTH }) => {
    const dotWidth = scrollX.interpolate({
        inputRange: [
            (index - 1) * bannerWidth,
            index * bannerWidth,
            (index + 1) * bannerWidth,
        ],
        outputRange: [6, 20, 6],
        extrapolate: 'clamp',
    });

    const dotColor = scrollX.interpolate({
        inputRange: [
            (index - 1) * bannerWidth,
            index * bannerWidth,
            (index + 1) * bannerWidth,
        ],
        outputRange: ['#cbd5e1', '#1976D2', '#cbd5e1'],
        extrapolate: 'clamp',
    });

    return (
        <Animated.View style={[styles.dot, { width: dotWidth, backgroundColor: dotColor }]} />
    );
};

export default Dot

const styles = StyleSheet.create({
    dots: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
        marginTop: 10,
    },
    dot: {
        height: 6,
        borderRadius: 3,
    },
});