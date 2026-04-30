import React from 'react';
import { View, Text } from 'react-native';
import { Avatar, Card, Chip, useTheme } from 'react-native-paper';
import COLORS from '../../../styles/Colors';

const DEFAULT_AVATAR = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';

const ROLE_CONFIG = {
    doctor: {
        label: 'Bác sĩ',
        icon: 'stethoscope',
        color: undefined,
    },
    customer: {
        label: 'Bệnh nhân',
        icon: 'account-heart-outline',
        color: undefined,
    },
};

const ProfileHeader = ({ user }) => {
    const theme = useTheme();
    const roleConfig = ROLE_CONFIG[user?.role] ?? ROLE_CONFIG.customer;

    const fullName = `${user?.last_name ?? ''} ${user?.first_name ?? ''}`.trim();
    const displayTitle = user.profile?.degree ? `${user.profile?.degree} ${fullName}` : fullName;

    const initials = [user?.last_name, user?.first_name]
        .filter(Boolean)
        .map((n) => n.trim()[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <Card
            mode="elevated"
            elevation={1}
            style={{
                backgroundColor: COLORS.white,
                borderRadius: 16,
            }}
        >
            <Card.Content
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 14,
                }}
            >
                {user?.avatar ? (
                    <Avatar.Image size={72} source={{ uri: user.avatar }} />
                ) : (
                    <Avatar.Text
                        size={72}
                        label={initials || '?'}
                        style={{
                            backgroundColor: COLORS.primaryLight,
                        }}
                        labelStyle={{
                            color: COLORS.primary,
                        }}
                    />
                )}

                <View style={{ flex: 1, gap: 6 }}>
                    <Text
                        style={{
                            fontSize: 18,
                            fontWeight: '600',
                            color: COLORS.text,
                            flexWrap: 'wrap',
                        }}
                    >
                        {displayTitle}
                    </Text>

                    <View
                        style={{
                            flexDirection: 'row',
                            flexWrap: 'wrap',
                            gap: 6,
                            marginTop: 2,
                        }}
                    >
                        <Chip
                            compact
                            icon={roleConfig.icon}
                            mode="flat"
                            style={{
                                backgroundColor: COLORS.primaryLight,
                            }}
                            textStyle={{
                                color: COLORS.primary,
                            }}
                        >
                            {roleConfig.label}
                        </Chip>

                        {user?.gender && (
                            <Chip
                                compact
                                icon={user.gender === 'male' ? 'gender-male' : 'gender-female'}
                                mode="flat"
                                style={{
                                    backgroundColor: COLORS.bg,
                                }}
                                textStyle={{
                                    color: COLORS.text,
                                }}
                            >
                                {user.gender === 'male' ? 'Nam' : 'Nữ'}
                            </Chip>
                        )}

                        {user?.profile?.degree && (
                            <Chip
                                compact
                                icon="school"
                                mode="flat"
                                style={{
                                    backgroundColor: COLORS.secondaryLight || COLORS.bg,
                                }}
                                textStyle={{
                                    color: COLORS.secondary || COLORS.text,
                                }}
                            >
                                {user.profile?.degree ?? 'đang cập nhật'}
                            </Chip>
                        )}

                        {user?.profile?.experience && (
                            <Chip
                                compact
                                icon="clock-outline"
                                mode="flat"
                                style={{
                                    backgroundColor: COLORS.successLight,
                                }}
                                textStyle={{
                                    color: COLORS.success,
                                }}
                            >
                                {user.profile?.experience ?? 'đang cập nhật'} năm kinh nghiệm
                            </Chip>
                        )}
                    </View>
                </View>
            </Card.Content>
        </Card>
    );
};

export default ProfileHeader;