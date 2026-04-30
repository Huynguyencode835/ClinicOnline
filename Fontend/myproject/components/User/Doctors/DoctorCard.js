import { Button ,Avatar,Card} from "react-native-paper";
import Mystyles from "../../../styles/Mystyles";
import { View , Text, Dimensions} from "react-native";
import StylesDoctorCard from "./StylesDoctorCard";

// {"avatar": "https://res.cloudinary.com/dkdvg8jix/image/upload/v1777429050/images_mhchu3", 
//  "email": "bsnguyenvana@gmail.com", 
//  "first_name": "A", 
//  "gender": "male", 
//  "id": 2, 
//  "last_name": "Nguyễn Văn", 
//  "phone": "0900111000"}
const DoctorCard = ({ item, navigation }) => {
    return (
        <Card
            style={StylesDoctorCard.card}
            onPress={() => navigation.navigate("DoctorDetail", { doctorId: item.id })}
            mode="elevated"
        >
            <Card.Content style={StylesDoctorCard.cardContent}>
                {/* Avatar */}
                <View style={StylesDoctorCard.avatarWrapper}>
                    {item.avatar
                        ? <Avatar.Image size={80} source={{ uri: item.avatar }} />
                        : <Avatar.Icon size={80} icon="doctor" style={StylesDoctorCard.avatarIcon} />
                    }
                </View>

                {/* Họ tên đầy đủ */}
                <Text style={StylesDoctorCard.name} numberOfLines={1}>
                    {item.last_name} {item.first_name}
                </Text>

                {/* Info rows */}
                <View style={StylesDoctorCard.infoRow}>
                    <Text style={{ fontSize: 12 }}>📧</Text>
                    <Text style={StylesDoctorCard.infoText} numberOfLines={1}>{item.email}</Text>
                </View>

                <View style={StylesDoctorCard.infoRow}>
                    <Text style={{ fontSize: 12 }}>📞</Text>
                    <Text style={StylesDoctorCard.infoText}>{item.phone}</Text>
                </View>

                <View style={StylesDoctorCard.infoRow}>
                    <Text style={{ fontSize: 12 }}>
                        {item.gender === "male" ? "👨‍⚕️" : item.gender === "female" ? "👩‍⚕️" : "🧑‍⚕️"}
                    </Text>
                    <Text style={StylesDoctorCard.infoText}>
                        {item.gender === "male" ? "Nam" : item.gender === "female" ? "Nữ" : "Khác"}
                    </Text>
                </View>
            </Card.Content>

            <Card.Actions style={StylesDoctorCard.cardActions}>
                <Button
                    mode="contained"
                    onPress={() => navigation.navigate("DoctorDetail", { doctorId: item.id })}
                    style={StylesDoctorCard.btn}
                    labelStyle={StylesDoctorCard.btnLabel}
                >
                    Tư vấn ngay
                </Button>
            </Card.Actions>
        </Card>
    );
};

export default DoctorCard;