import React from 'react';
import { Surface, Text, Icon } from 'react-native-paper';
import { View } from 'react-native';
import COLORS from '../../../styles/Colors'; // ⚠️ sửa path nếu cần

const SectionCard = ({ title, icon, children, containerColor }) => {

    return (
        <Surface
            style={{
                borderRadius: 14,
                padding: 14,
                backgroundColor: containerColor || COLORS.white,
                flex: 1,
                shadowColor: COLORS.primary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 6,
            }}
            elevation={1}
        >
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                }}
            >
                {icon && (
                    <Icon
                        source={icon}
                        size={18}
                        color={COLORS.primary}
                    />
                )}

                <Text
                    variant="labelSmall"
                    style={{
                        color: COLORS.primary,
                        fontWeight: '600',
                        letterSpacing: 0.3,
                    }}
                >
                    {title}
                </Text>
            </View>

            <View style={{ marginTop: 8 }}>
                {children}
            </View>
        </Surface>
    )
};

export default SectionCard;