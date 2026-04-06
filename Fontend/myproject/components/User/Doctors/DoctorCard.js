import { Button ,Avatar,Card} from "react-native-paper";
import Mystyles from "../../../styles/Mystyles";
import { View , Text, Dimensions} from "react-native";
import StylesDoctorCard from "./StylesDoctorCard";


const DoctorCard = ({ item, onPress }) => {
    return (
        <>
            <Card style={StylesDoctorCard.card} onPress={() => onPress(item)} mode="elevated">
                <Card.Content style={StylesDoctorCard.cardContent}>
                    {/* Avatar */}
                    <View style={StylesDoctorCard.avatarWrapper}>
                        {item.avatar
                        ? <Avatar.Image size={80} source={{ uri: item.avatar }} />
                        : <Avatar.Icon size={80} icon="doctor" style={StylesDoctorCard.avatarIcon} />
                        }
                    </View>

                    {/* Degree + Name */}
                    <Text style={StylesDoctorCard.degree}>{item.degree}.</Text>
                    <Text style={StylesDoctorCard.name} numberOfLines={1}>{item.name}</Text>

                    {/* Info rows */}
                    <View style={StylesDoctorCard.infoRow}>
                        <Text style = {{fontSize: 12}}>🏥</Text>
                        <Text style={StylesDoctorCard.infoText} numberOfLines={1}>Bác sĩ Chuyên Khoa</Text>
                    </View>
                    <View style={StylesDoctorCard.infoRow}>
                        <Text style = {{fontSize: 12}}>🩺</Text>
                        <Text style={StylesDoctorCard.infoText} numberOfLines={1}>{item.specialty}</Text>
                    </View>
                    <View style={StylesDoctorCard.infoRow}>
                        <Text style = {{fontSize: 12}}>💰</Text>
                        <Text style={StylesDoctorCard.infoText}>{item.price}</Text>
                    </View>
                </Card.Content>

                <Card.Actions style={StylesDoctorCard.cardActions}>
                    <Button
                        mode="contained"
                        onPress={() => onPress(item)}
                        style={StylesDoctorCard.btn}
                        labelStyle={StylesDoctorCard.btnLabel}
                    >
                        Tư vấn ngay
                    </Button>
                </Card.Actions>
            </Card>
        </>
    );
};

export default DoctorCard;