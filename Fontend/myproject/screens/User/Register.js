import InputField from "../../components/User/LoginRegister/Input";
import Mystyles from "../../styles/Mystyles";
import { useState } from "react";
import { View,Text, TouchableOpacity, ScrollView, Image} from "react-native";
import { Button, Icon} from "react-native-paper";
import * as ImagePicker from 'expo-image-picker';


const Register = ({ navigation }) => {
    const [user, setUser] = useState({});
    const info = [
        {
            label: "Họ và tên",
            placeholder: "Họ và tên",
            icon: "account",
            field: "fullName", 
            secureText: false,
            inputProps: {
                keyboardType: 'email-address',
                autoCapitalize: 'none',
                autoComplete: 'email',
            },
        },{
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
        },{
            label: "Nhập lại mật khẩu",
            field: "confirmPassword",
            placeholder: "*************",
            secureText: true,
            inputProps: {
                autoComplete: 'password',
            },
        }]

    const pickImage = async () => {
        let { status } =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                alert("Permissions denied!");
        } else {
            const result = 
                await ImagePicker.launchImageLibraryAsync();
            if (!result.canceled)
                setUser({ ...user, "avatar": result.assets[0] });
        }
    }

    return (
        <ScrollView style={{ marginTop: 100,paddingHorizontal: 28 }}>
            <Text style={{ fontSize: 24, fontWeight: '600', marginBottom: 30 }}>Đăng ký tài khoản</Text>

            <InputField list={info} user={user} setUser={setUser} />

            <View style={{ flexDirection: 'row', alignItems: 'center',justifyContent: 'space-between', gap: 12, marginTop: 20 }}>
                <TouchableOpacity onPress={pickImage} style={{ alignSelf: 'flex-start',
                    fontSize: 14,
                    width: '60%',
                    paddingHorizontal: 12, 
                    paddingVertical: 8, 
                    borderRadius: 14, 
                    backgroundColor: '#e0e0e8',
                    marginTop: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 6,}}
                    >
                    <Text style={{ color: '#000000' }}>Chọn ảnh đại diện</Text>
                    <Icon
                        source="camera"
                        size={20}
                    />
                </TouchableOpacity>

                {user.avatar && <Image source={{ uri: user.avatar.uri }} style={{ width: 100, height: 100, marginTop: 12, borderColor: '#2e2d2d', borderWidth: 1 ,borderRadius: 50}} />}
            </View>

            <View style={{ marginTop: 40 }}>
                <Button style={Mystyles.btnPrimary} icon="account-plus" mode="contained" onPress={() => console.log(user)}>
                    Đăng ký
                </Button>
            </View>

            <Text style={{ marginVertical: 20, textAlign: 'center', color: '#a4a4ad' }}>------ Hoặc đăng ký bằng ------</Text>
            
            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Button style={Mystyles.btnSocial} icon="google" mode="contained" onPress={() => console.log('Pressed')}>
                    Google
                </Button>

                <Button style={Mystyles.btnSocial } icon="facebook" mode="contained" onPress={() => console.log('Pressed')}>
                    Facebook
                </Button>
            </View>
            
            <View style={{ marginTop: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Text style={{ color: '#8a8a9a' }}>Bạn đã có tài khoản?</Text>
                <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                    <Text style={{ color: '#000000' }}>Đăng nhập</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

export default Register;