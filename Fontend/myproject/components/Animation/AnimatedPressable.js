import React, { useRef } from 'react';
import { Animated } from 'react-native';

const AnimatedPressable = ({
    children,
    scaleTo = 0.95,
    bounciness = 10,
    style,
}) => {
    const scale = useRef(new Animated.Value(1)).current;

    const onPressIn = () => {
        Animated.spring(scale, {
            toValue: scaleTo,
            useNativeDriver: true,
            speed: 50,
            bounciness,
        }).start();
    };

    const onPressOut = () => {
        Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
            speed: 50,
            bounciness,
        }).start();
    };

    return (
        <Animated.View
            style={[{ transform: [{ scale }] }, style]}
<<<<<<< HEAD
            onStartShouldSetResponder={() => false}  // ← không chặn gesture của children
=======
            onStartShouldSetResponder={() => false}
>>>>>>> 6a97c2ab3aa46475216b679b9f79150b445a6074
        >
            {React.cloneElement(children, {
                onPressIn,
                onPressOut,
            })}
        </Animated.View>
    );
};

export default AnimatedPressable;