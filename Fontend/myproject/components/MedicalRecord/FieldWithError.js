import { View } from "react-native";
import { Text,HelperText } from "react-native-paper";
import Field from "./Field";

const FieldWithError = ({ error, ...props }) => (
    <View>
        <Field {...props} />
        {error && (
            <HelperText type="error" visible={!!error} style={{ marginTop: -2 }}>
                {Array.isArray(error) ? error.join(", ") : error}
            </HelperText>
        )}
    </View>
);

export default FieldWithError;