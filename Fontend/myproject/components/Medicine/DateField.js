import { Calendar } from "react-native-calendars";
import { useState } from "react";
import { View,TouchableOpacity} from "react-native";
import FieldWithError from "../MedicalRecord/FieldWithError";
import { Text, TextInput,Chip } from "react-native-paper";
import COLORS from "../../styles/Colors"; 
import { formatDate } from "../../utils/format";

const DateField = ({ label, value, onChange, error }) => {
    const [show, setShow] = useState(false);
    console.log("DateField show:", show, "value:", value); // debug

    return (
        <View style={{ marginBottom: 4 }}>
            <FieldWithError
                label={label}
                value={value ? formatDate(value) : ""}
                onChangeText={() => {}}
                placeholder="DD/MM/YYYY"
                error={error}
                editable={false}
                right={
                    <TextInput.Icon
                        icon="calendar"
                        onPress={() => setShow(prev => !prev)}
                    />
                }
            />

            {show && (
                <Calendar
                    current={value || undefined}
                    onDayPress={(day) => {
                        onChange(day.dateString);
                        setShow(false);
                    }}
                    markedDates={
                        value
                            ? { [value]: { selected: true, selectedColor: COLORS.primary } }
                            : {}
                    }
                />
            )}
        </View>
    );
};

export default DateField;
