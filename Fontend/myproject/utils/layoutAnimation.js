import { LayoutAnimation, Platform, UIManager } from 'react-native';

if (Platform.OS === 'android') {
    UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

export const animateLayout = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
};


export const animateSpring = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
};

export const animateFast = () => {
    LayoutAnimation.configureNext({
        duration: 200,
        create: { type: 'easeInEaseOut', property: 'opacity' },
        update: { type: 'easeInEaseOut' },
        delete: { type: 'easeInEaseOut', property: 'opacity' },
    });
};