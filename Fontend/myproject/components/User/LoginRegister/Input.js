import { HelperText, TextInput } from 'react-native-paper';
import StylesLoginRegister from './StylesLoginRegister';
import { useState } from 'react';
import { View } from 'react-native';

const InputItem = ({
    label,
    icon,
    value,
    onChangeText,
    placeholder,
    secureText = false,
    inputProps = {},
    }) => {

    const [visible, setVisible] = useState(false);

    return (
        <View  style={StylesLoginRegister.wrapper}>
            <TextInput
                label={label}
                placeholder={placeholder}
                secureTextEntry={secureText && !visible}
                mode="outlined"
                value={value}
                onChangeText={onChangeText}
                outlineStyle={StylesLoginRegister.outline}
                contentStyle={StylesLoginRegister.content}
                style={StylesLoginRegister.input}
                activeOutlineColor="#2196F3"
                outlineColor="#B8D9F8"
                textColor="#1a1a2e"
                selectionColor="#2196F3"
                right={
                    secureText ? (
                        <TextInput.Icon
                        icon={visible ? 'eye-off' : 'eye'}
                        onPress={() => setVisible(v => !v)}
                        color="#2196F3"
                        />
                    ) : icon ? (
                        <TextInput.Icon
                            icon={icon}
                        />
                    ) : null
                }
                {...inputProps}
            />
        </View>
    );
}

const InputField = ({ list = [], user = {}, setUser , setErrors}) => {
    return (
        <>
            {list.map((item) => (
                <View key={item.field}>
                    <InputItem
                        label={item.label}
                        icon={item.icon}
                        value={user[item.field]}
                        onChangeText={(v) => {
                            setUser({ ...user, [item.field]: v })
                            setErrors(prev => {
                                const newErrors = { ...prev };
                                delete newErrors[item.field];
                                return newErrors;
                            });
                        }}
                        error={!!item.error}
                        placeholder={item.placeholder}
                        secureText={item.secureText}
                        inputProps={item.inputProps}
                    />
                    {item.error && (
                        <HelperText type="error" visible={true}>
                            • {item.errorText}
                        </HelperText>
                    )}
                </View>
            ))}
        </>
    );
};

export { InputItem };
export default InputField;