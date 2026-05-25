import React, { useRef, useEffect, useState } from 'react';
import { View, Animated, Dimensions, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import Dot from '../../components/Home/Dot';

const { width } = Dimensions.get('window');

const BANNERS = [
    { id: '1', image: { uri: 'https://img.magnific.com/vector-mien-phi/mau-facebook-trung-tam-y-te-gradient_23-2150117335.jpg?semt=ais_hybrid&w=740&q=80' } },
    { id: '2', image: { uri: 'https://img.magnific.com/vector-mien-phi/thiet-ke-mau-benh-vien_23-2150363197.jpg?semt=ais_hybrid&w=740&q=80' } },
    { id: '3', image: { uri: 'https://img.magnific.com/vector-mien-phi/anh-bia-facebook-y-te-thiet-ke-phang_23-2149080862.jpg?semt=ais_hybrid&w=740&q=80' } },
    { id: '4', image: { uri: 'https://img.magnific.com/vector-mien-phi/anh-bia-facebook-y-te-thiet-ke-phang_23-2149194301.jpg?semt=ais_hybrid&w=740&q=80' } },
    { id: '5', image: { uri: 'https://img.magnific.com/psd-cao-cap/banner-y-te-suc-khoe_220346-2501.jpg?semt=ais_hybrid&w=740&q=80' } },
    { id: '6', image: { uri: 'https://img.magnific.com/vector-mien-phi/anh-bia-facebook-y-te-gradient_23-2149055589.jpg?semt=ais_hybrid&w=740&q=80' } },
    { id: '7', image: { uri: 'https://img.magnific.com/vector-cao-cap/mau-banner-cham-soc-suc-khoe-tren-web-hoac-facebook_544391-317.jpg?semt=ais_hybrid&w=740&q=80' } },
    { id: '8', image: { uri: 'https://img.magnific.com/psd-cao-cap/mau-bia-giao-duc-y-te-tot-nhat_678818-14.jpg?semt=ais_hybrid&w=740&q=80' } },
    { id: '9', image: { uri: 'https://img.magnific.com/vector-cao-cap/mau-bai-dang-tren-mang-xa-hoi-ve-cham-soc-suc-khoe_544391-490.jpg?semt=ais_hybrid&w=740&q=80' } },
];

const BANNER_WIDTH = width - 32;

const BannerSlider = ({ banners = BANNERS, onPress }) => {
    const scrollX = useRef(new Animated.Value(0)).current;
    const flatListRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const timerRef = useRef(null);

    const startAutoPlay = () => {
        timerRef.current = setInterval(() => {
            setCurrentIndex(prev => {
                const next = (prev + 1) % banners.length;
                flatListRef.current?.scrollToIndex({ index: next, animated: true });
                return next;
            });
        }, 3000);
    };

    useEffect(() => {
        startAutoPlay();
        return () => clearInterval(timerRef.current);
    }, []);

    return (
        <View style={styles.container}>
            <Animated.FlatList
                ref={flatListRef}
                data={banners}
                keyExtractor={item => item.id}
                horizontal
                pagingEnabled
                snapToInterval={BANNER_WIDTH}
                decelerationRate="fast"
                showsHorizontalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
                onScrollBeginDrag={() => clearInterval(timerRef.current)}
                onScrollEndDrag={() => startAutoPlay()}
                onMomentumScrollEnd={(e) => {
                    const index = Math.round(e.nativeEvent.contentOffset.x / BANNER_WIDTH);
                    setCurrentIndex(index);
                }}
                getItemLayout={(_, index) => ({
                    length: BANNER_WIDTH,
                    offset: BANNER_WIDTH * index,
                    index,
                })}
                renderItem={({ item, index }) => {
                    const inputRange = [
                        (index - 1) * BANNER_WIDTH,
                        index * BANNER_WIDTH,
                        (index + 1) * BANNER_WIDTH,
                    ];

                    const scale = scrollX.interpolate({
                        inputRange,
                        outputRange: [0.93, 1, 0.93],
                        extrapolate: 'clamp',
                    });

                    const opacity = scrollX.interpolate({
                        inputRange,
                        outputRange: [0.65, 1, 0.65],
                        extrapolate: 'clamp',
                    });

                    return (
                        <Animated.View style={{ width: BANNER_WIDTH, transform: [{ scale }], opacity }}>
                            <TouchableOpacity
                                activeOpacity={0.92}
                                onPress={() => onPress?.(item)}
                                style={styles.bannerWrapper}
                            >
                                <ImageBackground
                                    source={item.image}
                                    style={styles.banner}
                                    imageStyle={{ borderRadius: 20 }}
                                    resizeMode="cover"
                                />
                            </TouchableOpacity>
                        </Animated.View>
                    );
                }}
            />

            <View style={styles.dots}>
                {banners.map((_, i) => (
                    <Dot key={i} index={i} scrollX={scrollX} bannerWidth={BANNER_WIDTH}/>
                ))}
            </View>
        </View>
    );
};

export default BannerSlider;

const styles = StyleSheet.create({
    container: {
        marginBottom: 8,
    },
    bannerWrapper: {
        borderRadius: 20,
        overflow: 'hidden',
    },
    banner: {
        height: 160,
    },
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