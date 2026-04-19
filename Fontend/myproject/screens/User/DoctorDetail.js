// "bio": "Bác sĩ Nguyễn Văn B có 3 năm kinh nghiệm trong lĩnh vực Ngoại tổng quát, Tim mạch, Thần kinh."
// "degree": "CKII"
// "experience": 3 
// "id": 2, 
// "specialties": [Array] 
// "user": [Object]

import { View, Text, ScrollView } from "react-native";
import React, { useEffect, useState } from 'react';
import {
    Avatar,
    Button,
    Card,
    Chip,
    Divider,
    Icon,
    List,
    Surface,
    useTheme,
} from 'react-native-paper';
import Apis, { endpoints } from "../../utils/Apis";
import ProfileHeader from "../../components/User/Profile/ProfileHeader";
import SectionCard from "../../components/User/Profile/SectionCard";
import ProfileInfoRow from "../../components/User/Profile/ProfileInforow";
// "id": 2,
// "first_name": "A",
// "last_name": "Nguyễn Văn",
// "avatar": null,
// "phone": "0900111000",
// "email": "bsnguyenvana@gmail.com",
// "username": "nguyenvana1",
// "gender": "male",
// "role": "doctor",
// "profile": {
//     "id": 1,
//     "specialties": [
//         {
//             "id": 1,
//             "name": "Nội tổng quát",
//             "description": "Khám và điều trị các bệnh nội khoa tổng quát"
//         },
//         {
//             "id": 5,
//             "name": "Chấn thương chỉnh hình",
//             "description": "Điều trị gãy xương, khớp và cơ"
//         }
//     ],
//     "degree": "Giáo sư Hugy nguyesn",
//     "experience": 10,
//     "bio": null,
//     "workday_set": []
// }

const DoctorDetail = ({ route }) => {
    const theme = useTheme();

    const { doctorId } = route.params;

    const specialtyIcons = {
        1: "stethoscope",           // Nội tổng quát
        2: "needle",                // Ngoại tổng quát
        3: "heart-pulse",           // Tim mạch
        4: "brain",                 // Thần kinh
        5: "bone",                  // Chấn thương chỉnh hình
        6: "human-pregnant",        // Sản phụ khoa
        7: "baby-face-outline",     // Nhi khoa
        8: "face-man-shimmer",      // Da liễu
        9: "ear-hearing",           // Tai mũi họng
        10: "tooth-outline",         // Răng hàm mặt
        11: "eye-outline",           // Mắt
        12: "lungs",                 // Hô hấp
        13: "stomach",               // Tiêu hóa
        14: "needle-off",            // Nội tiết (hormone)
        15: "kidney-outline",        // Thận - tiết niệu
        16: "ribbon",                // Ung bướu
        17: "water",                 // Huyết học (máu)
        18: "virus-outline",         // Truyền nhiễm
        19: "leaf",                  // Y học cổ truyền
        20: "human-cane",            // Phục hồi chức năng
        21: "ambulance",             // Hồi sức cấp cứu
        22: "sleep",                 // Gây mê hồi sức
        23: "food-apple-outline",    // Dinh dưỡng
    };

    const degreeConfig = {
        "BS": { label: "Bác sĩ", icon: "stethoscope" },
        "CKI": { label: "Bác sĩ chuyên khoa I", icon: "certificate-outline" },
        "CKII": { label: "Bác sĩ chuyên khoa II", icon: "certificate" },
        "ThS": { label: "Thạc sĩ", icon: "school-outline" },
        "PGS.TS": { label: "Phó giáo sư - Tiến sĩ", icon: "school" },
    };

    const [detailDoctor, setDetailDoctor] = useState({});
    const LoadDetailDoctor = async (id) => {
        try {
            const res = await Apis.get(endpoints.doctorDetail(id));
            console.log("Chi tiết bác sĩ:", res.data);
            setDetailDoctor(res.data);
        } catch (err) {
            console.error("Lỗi khi tải chi tiết bác sĩ:", err);
            return null;
        }
    };

    useEffect(() => {
        LoadDetailDoctor(doctorId);
    }, [doctorId]);

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <ScrollView
                style={{ flex: 1, backgroundColor: theme.colors.background, marginTop: 50 }}
                contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 16 }}
                showsVerticalScrollIndicator={false}
            >
                <ProfileHeader user={detailDoctor} />

                <View style={{ flex: 1, flexDirection: 'row', gap: 10, justifyContent: 'space-between' }}>
                    <SectionCard title="Kinh nghiệm" containerColor={theme.colors.secondaryContainer}>
                        <Text
                            variant="displaySmall"
                            style={{ color: theme.colors.onSecondaryContainer, marginTop: 2 }}
                        >
                            {detailDoctor?.profile?.experience ?? 'đang cập nhật'}
                            <Text variant="bodyMedium" style={{ color: theme.colors.onSecondaryContainer }}>
                                {' '}năm
                            </Text>
                        </Text>
                    </SectionCard>
                    <SectionCard title="Trình độ" icon="school" containerColor={theme.colors.tertiaryContainer}>
                        <Text variant="titleMedium">
                            {
                                degreeConfig[detailDoctor?.profile?.degree]?.label ??
                                detailDoctor?.profile?.degree ??
                                "Đang cập nhật"
                            }
                        </Text>
                    </SectionCard>
                </View>
                <Card mode="elevated" elevation={1}>
                    <Card.Title
                        title="Giới thiệu"
                        titleVariant="labelLarge"
                        left={(props) => <List.Icon {...props} icon="account-circle-outline" />}
                    />
                    <Card.Content>
                        <Text variant="bodyMedium" style={{ lineHeight: 22 }}>
                            {detailDoctor?.profile?.bio ?? 'Bác sĩ chưa cập nhật thông tin giới thiệu.'}
                        </Text>
                    </Card.Content>
                </Card>
                <ProfileInfoRow
                    title="Chuyên khoa"
                    icon="stethoscope"
                    items={detailDoctor?.profile?.specialties.map((spec, index) => ({
                        key: spec.id,
                        title: spec.name,
                        icon: specialtyIcons[spec.id] ?? "medical-bag",
                        right: () => (
                            <Chip
                                compact
                                mode="flat"
                                style={{
                                    alignSelf: 'center',
                                    backgroundColor: index === 0
                                        ? theme.colors.primaryContainer
                                        : theme.colors.surfaceVariant,
                                }}
                                textStyle={{
                                    color: index === 0
                                        ? theme.colors.onPrimaryContainer
                                        : theme.colors.onSurfaceVariant,
                                }}
                            >
                                {index === 0 ? 'Chính' : 'Phụ'}
                            </Chip>
                        )
                    }))}
                />
                <ProfileInfoRow
                    title="Thông tin liên hệ"
                    icon="card-account-details-outline"
                    items={[
                        {
                            key: 'email',
                            title: detailDoctor?.email,
                            description: 'Email',
                            icon: 'email-outline',
                        },
                        {
                            key: 'phone',
                            title: detailDoctor?.phone,
                            description: 'Điện thoại',
                            icon: 'phone-outline',
                        }
                    ]}
                />
            </ScrollView>
            <View style={{ marginTop: 90, backgroundColor: 'transparent' }}>
                {/* ── Book Button ── */}
                <Button
                    style={{ marginTop: 90, position: 'absolute', bottom: 36, left: 16, right: 16, marginTop: 70 }}
                    mode="contained"
                    icon="calendar-plus"
                    contentStyle={{ paddingVertical: 6 }}
                    labelStyle={{ fontSize: 16 }}
                    onPress={() => { }}
                >
                    Đặt lịch khám
                </Button>
            </View>
        </View>
    );
}

export default DoctorDetail;