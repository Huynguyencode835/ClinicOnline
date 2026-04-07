import { useNavigation } from "@react-navigation/native";
import InputField from "../../components/User/LoginRegister/Input";
import Mystyles from "../../styles/Mystyles";
import { useState } from "react";
import { View,Text, TouchableOpacity, ScrollView} from "react-native";
import { Button} from "react-native-paper";


const Login = ({ navigation }) => {
    const [user, setUser] = useState({});
    const info = [
        {
            label: "Tên đăng nhập",
            icon: "account",
            placeholder: "username",
            field: "username",
            secureText: false,
            inputProps: {
                keyboardType: 'email-address',
                autoCapitalize: 'none',
                autoComplete: 'email',
            },
        },
        {
            label: "Mật khẩu",
            field: "password",
            placeholder: "*************",
            secureText: true,
            inputProps: {
                autoComplete: 'password',
            },
        },]


    return (
        <ScrollView style={{ marginTop: 100, paddingHorizontal: 28}}>
            <Text style={{ fontSize: 24, fontWeight: '600', marginBottom: 30 }}>Nhập tài khoản</Text>

            <InputField list={info} user={user} setUser={setUser} />
            
            <View style={{ marginTop: 40 }}>
                <Button style={Mystyles.btnPrimary} icon="account-plus" mode="contained" onPress={() => console.log(user)}>
                    Đăng nhập
                </Button>
            </View>

            <Text style={{ marginVertical: 20, textAlign: 'center', color: '#a4a4ad' }}>------ Hoặc đăng nhập bằng ------</Text>
            
            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Button style={Mystyles.btnSocial} icon="google" mode="contained" onPress={() => console.log('Pressed')}>
                    Google
                </Button>

                <Button style={Mystyles.btnSocial} icon="facebook" mode="contained" onPress={() => console.log('Pressed')}>
                    Facebook
                </Button>
            </View>
            
            <View style={{ marginTop: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Text style={{ color: '#8a8a9a' }}>Bạn chưa có tài khoản?</Text>
                <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                    <Text style={{ color: '#000000' }}>Đăng ký</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

export default Login;