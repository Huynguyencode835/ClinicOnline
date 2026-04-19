// "bio": "Bác sĩ Nguyễn Văn B có 3 năm kinh nghiệm trong lĩnh vực Ngoại tổng quát, Tim mạch, Thần kinh."
// "degree": "CKII"
// "experience": 3 
// "id": 2, 
// "specialties": [Array] 
// "user": [Object]

import { View,Text,ScrollView } from "react-native";
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
import Apis, { endpoints } from "../../configs/Apis";

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

const DoctorDetail = ({route }) => {
    const theme = useTheme();

    const { doctorId } = route.params;

    const specialtyIcons = {
        1:  "stethoscope",           // Nội tổng quát
        2:  "needle",                // Ngoại tổng quát
        3:  "heart-pulse",           // Tim mạch
        4:  "brain",                 // Thần kinh
        5:  "bone",                  // Chấn thương chỉnh hình
        6:  "human-pregnant",        // Sản phụ khoa
        7:  "baby-face-outline",     // Nhi khoa
        8:  "face-man-shimmer",      // Da liễu
        9:  "ear-hearing",           // Tai mũi họng
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
        "BS":     { label: "Bác sĩ",                    icon: "stethoscope" },
        "CKI":    { label: "Bác sĩ chuyên khoa I",      icon: "certificate-outline" },
        "CKII":   { label: "Bác sĩ chuyên khoa II",     icon: "certificate" },
        "ThS":    { label: "Thạc sĩ",                   icon: "school-outline" },
        "PGS.TS": { label: "Phó giáo sư - Tiến sĩ",    icon: "school" },
    };

    const [detailDoctor, setDetailDoctor] = useState({});
    const LoadDetailDoctor = async (id) => {
            try {
                const res = await Apis.get(endpoints.doctorDetail(id));
                setDetailDoctor(res.data);
            } catch (err) {
                console.log("Loading doctor detail for ID:", id);
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
                style={{ flex: 1, backgroundColor: theme.colors.background ,marginTop: 50}}
                contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 16 }}
                showsVerticalScrollIndicator={false}
            >
                <Card mode="elevated" elevation={1}>
                    <Card.Content style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14 }}>
                    <Avatar.Image
                        size={72}
                        source={{ uri: detailDoctor?.avatar || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y' }}
                    />
                    <View style={{ flex: 1, gap: 6 }}>
                        <Text variant="titleLarge">BS. {detailDoctor?.last_name} {detailDoctor?.first_name}</Text>

                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                        <Chip compact icon="certificate" mode="flat">
                            {detailDoctor?.degree ?? 'đang cập nhật'}
                        </Chip>
                        <Chip compact icon="clock-outline" mode="flat">
                            {detailDoctor?.profile?.experience ?? 'đang cập nhật'} năm kinh nghiệm
                        </Chip>
                        </View>
                    </View>
                    </Card.Content>
                </Card>
            
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <Surface
                        style={{
                            flex: 1,
                            borderRadius: 12,
                            padding: 14,
                            backgroundColor: theme.colors.secondaryContainer,
                        }}
                        elevation={0}
                        >
                        <Text variant="labelSmall" style={{ color: theme.colors.onSecondaryContainer }}>
                            Kinh nghiệm
                        </Text>
                        <Text
                            variant="displaySmall"
                            style={{ color: theme.colors.onSecondaryContainer, marginTop: 2 }}
                        >
                            {detailDoctor?.profile?.experience ?? 'đang cập nhật'}
                            <Text variant="bodyMedium" style={{ color: theme.colors.onSecondaryContainer }}>
                            {' '}năm
                            </Text>
                        </Text>
                    </Surface>
                
                    <Surface
                        style={{
                            flex: 1,
                            borderRadius: 12,
                            padding: 14,
                            backgroundColor: theme.colors.tertiaryContainer,
                        }}
                        elevation={0}
                        >
                        <Text variant="labelSmall" style={{ color: theme.colors.onTertiaryContainer }}>
                            Trình độ
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                            <Icon
                                source={degreeConfig[detailDoctor?.profile?.degree]?.icon ?? "account"}
                                size={20}
                                color={theme.colors.onTertiaryContainer}
                            />
                            <Text
                                variant="displaySmall"
                                style={{ color: theme.colors.onTertiaryContainer }}
                            >
                                {degreeConfig[detailDoctor?.profile?.degree]?.label ?? detailDoctor?.profile?.degree ?? 'Đang cập nhật'}
                            </Text>
                        </View>
                    </Surface>
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
            
                {/* ── Specialties ── */}
                <Card mode="elevated" elevation={1}>
                    <Card.Title
                    title="Chuyên khoa"
                    titleVariant="labelLarge"
                    left={(props) => <List.Icon {...props} icon="stethoscope" />}
                    />
                    <Card.Content style={{ gap: 0 }}>
                    {detailDoctor?.profile?.specialties.map((spec, index) => (
                        <React.Fragment key={spec.id}>
                            <List.Item
                                style={{ paddingVertical: 3, paddingHorizontal: 6 }}
                                title={spec.name}
                                titleStyle={{ fontSize: 14 }}
                                left={(props) => <List.Icon {...props} icon={specialtyIcons[spec.id] ?? "medical-bag"} />}
                                right={() => (
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
                                )}
                            />
                            {index < detailDoctor?.profile?.specialties.length - 1 && <Divider />}
                        </React.Fragment>
                    ))}
                    </Card.Content>
                </Card>
            
                {/* ── Contact ── */}
                <Card mode="elevated" elevation={1}>
                    <Card.Title
                    title="Thông tin liên hệ"
                    titleVariant="labelLarge"
                    left={(props) => <List.Icon {...props} icon="card-account-details-outline" />}
                    />
                    <Card.Content style={{ gap: 0 }}>
                    <List.Item
                        style={{ paddingVertical: 3, paddingHorizontal: 6 }}
                        title={detailDoctor?.email}
                        description="Email"
                        left={(props) => <List.Icon {...props} icon="email-outline" />}
                    />
                    <Divider />
                    <List.Item
                        title={detailDoctor?.phone}
                        description="Điện thoại"
                        left={(props) => <List.Icon {...props} icon="phone-outline" />}
                    />
                    </Card.Content>
                </Card>
            </ScrollView>
            <View style={{marginTop: 90, backgroundColor: 'transparent'}}>
            {/* ── Book Button ── */}
                <Button
                    style={{ marginTop: 90,position: 'absolute', bottom: 36, left: 16, right: 16, marginTop: 70 }}
                    mode="contained"
                    icon="calendar-plus"
                    contentStyle={{ paddingVertical: 6 }}
                    labelStyle={{ fontSize: 16 }}
                    onPress={() => {}}
                >
                    Đặt lịch khám
                </Button>
            </View>
        </View>
    );
}   

export default DoctorDetail;