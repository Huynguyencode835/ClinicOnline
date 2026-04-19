import React from 'react';
import { Surface, Text, Icon } from 'react-native-paper';
import { View } from 'react-native';
import Mystyles from '../../../styles/Mystyles';

const SectionCard = ({ title, icon, children, containerColor }) => {

    return (
        <Surface
            style={{
                borderRadius: 12,
                padding: 14,
                backgroundColor: containerColor,
                flex: 1,
            }}
            elevation={0}
        >
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                {icon && (
                    <Icon
                        source={icon}
                        size={18}
                    />
                )}
                <Text
                    variant="labelSmall"
                    style={Mystyles.title}
                >
                    {title}
                </Text>
            </View>

            {/* Content */}
            <View style={{ marginTop: 6 }}>
                {children}
            </View>
        </Surface>
    )
};

export default SectionCard;