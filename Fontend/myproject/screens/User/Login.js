import { useNavigation } from "@react-navigation/native";
import InputField from "../../components/User/LoginRegister/Input";
import Mystyles from "../../styles/Mystyles";
import { useContext, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Button, HelperText, Snackbar } from "react-native-paper";
import AppSnackbar from "../../components/AppSnackbar";
import Apis, { authApis, endpoints } from "../../configs/Apis";
import { MyUserContext } from "../../utils/contexts/MyUserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from 'expo-secure-store';
import { CLIENT_ID_APP, CLIENT_SECRET_APP } from "@env"

const Login = ({ navigation, route }) => {
    const [user, setUser] = useState({
        username: "",
        password: "",
    });
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

    const [snackbar, setSnackbar] = useState({});

    const [errors, setErrors] = useState({});

    const validate = (user) => {
        const err = {};

        if (user.username === "") {
            err.username = "Vui lòng nhập username";
        } else if (user.username.includes(" ")) {
            err.username = "Username không được chứa khoảng trắng";
        }

        if (!user.password) {
            err.password = "Vui lòng nhập mật khẩu";
        } else if (user.password.length < 2) {
            err.password = "Mật khẩu phải >= 6 ký tự";
        }
        return err;
    };

    const infoWithError = info.map((item) => ({
        ...item,
        error: !!errors?.[item.field],
        errorText: errors?.[item.field] || "",
    }));

    const [loading, setLoading] = useState(false);

    const { dispatch } = useContext(MyUserContext);

    const handleLogin = async () => {
        const err = validate(user);
        setErrors(err);
        if (Object.keys(err).length === 0) {
            try {
                setLoading(true);
                console.info(user);
                const res = await Apis.post(endpoints.login, {
                    username: user.username,
                    password: user.password,
                    client_id: CLIENT_ID_APP,
                    client_secret: CLIENT_SECRET_APP,
                    grant_type: "password",
                });

                await AsyncStorage.setItem("access_token", res.data.access_token);

                if (res.status === 200) {

                    setTimeout(async () => {
                        let userInfo = await authApis(res.data.access_token).get(endpoints.profile);
                        console.info("User info:", userInfo.data);
                        dispatch({ type: "LOGIN", payload: userInfo.data });
                        await SecureStore.setItemAsync("user", JSON.stringify(userInfo.data));
                    }, 500);

                    navigation.navigate("Home", {
                        successMessage: "Chào mừng bạn đã trở lại! Hãy khám phá các dịch vụ của chúng tôi.",
                    });
                }

            } catch (err) {
                const status = err.response?.status;
                if (status >= 400 && status < 500) {
                    setSnackbar({
                        visible: true,
                        message: "Đăng nhập thất bại!",
                        sub: err.response?.data?.detail || "Vui lòng kiểm tra lại thông tin.",
                        type: 'error',
                    });
                    console.log("Chi tiết lỗi 400:", JSON.stringify(err.response?.data));
                } else if (status >= 500) {
                    setSnackbar({
                        visible: true,
                        message: "Lỗi máy chủ!",
                        sub: "Vui lòng thử lại sau.",
                        type: 'error',
                    });
                } else {
                    setSnackbar({
                        visible: true,
                        message: "Không thể kết nối!",
                        sub: "Vui lòng kiểm tra kết nối mạng.",
                        type: 'error',
                    });
                }
            }
            finally {
                setLoading(false);
            }
        }

    }

    useEffect(() => {
        if (route?.params?.successMessage) {
            setSnackbar({
                visible: true,
                message: route.params.successMessage,
                sub: 'Vui lòng đăng nhập để tiếp tục',
                type: 'success',
            });
        }
    }, []);

    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={{ flex: 1, marginTop: 100, paddingHorizontal: 28 }}>

                <Text style={{ fontSize: 24, fontWeight: '600', marginBottom: 30 }}>Nhập tài khoản</Text>

                <InputField list={infoWithError} user={user} setUser={setUser} setErrors={setErrors} />
                <View style={{ marginTop: 40 }}>
                    <Button loading={loading} disabled={loading} style={Mystyles.btnPrimary} icon="account-plus" mode="contained" onPress={handleLogin}>
                        Đăng nhập
                    </Button>
                </View>

                <Text style={{ marginVertical: 20, textAlign: 'center', color: '#a4a4ad' }}>------ Hoặc đăng nhập bằng ------</Text>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
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
            <AppSnackbar
                visible={snackbar.visible}
                message={snackbar.message}
                sub={snackbar.sub}
                type={snackbar.type}
                onDismiss={() => setSnackbar(s => ({ ...s, visible: false }))}
            />
        </View>
    );
}

export default Login;