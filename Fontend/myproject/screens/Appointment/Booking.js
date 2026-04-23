import { View, StyleSheet } from "react-native";
import { Button } from "react-native-paper";
import React, { useState } from "react";
import BookingHeader from "../../components/Appointment/Bookingheader";
import Step1Schedule from "../Appointment/Step1Schedule"
import Step2Profile from "./Step2Profile";
import Step3Confirm from "./Step3Comfir";
import COLORS from "../../styles/Colors";

const API_USER = {
    id: 23,
    first_name: "Huy",
    last_name: "Nguyen",
    avatar: null,
    phone: "08999996734",
    email: "",
    gender: "male",
    profile: { height: null, weight: null },
};

const Booking = () => {
    const [step, setStep] = useState(0);

    const [bookingData, setBookingData] = useState({
        // Bước 1 - Lịch khám
        specialty: null,
        doctor: null,
        service: null,
        day: 0,
        shift: "morning",
        slots: [],

        patient: {
            id_patient: "",
            last_name: API_USER.last_name,
            first_name: API_USER.first_name,
            phone: API_USER.phone,
            email: API_USER.email,
            gender: API_USER.gender,
            dob: "",

            // BHYT
            insurance_id: "",
            insurance_exp: "",

            // Y tế
            blood_type: null,
            allergies: [],
        },
    });

    const updateBooking = (key, value) => {
        setBookingData(prev => ({ ...prev, [key]: value }));
    };

    const updatePatient = (key, value) => {
        setBookingData(prev => ({
            ...prev,
            patient: { ...prev.patient, [key]: value },
        }));
    };

    const canGoNext = () => {
        if (step === 0) return bookingData.specialty && bookingData.doctor && bookingData.service && bookingData.slots;
        if (step === 1) return bookingData.patient.last_name && bookingData.patient.first_name;
        if (step === 2) return true;
        return false;
    };

    const renderStep = () => {
        switch (step) {
            case 0: return <Step1Schedule data={bookingData} updateBooking={updateBooking} />;
            case 1: return <Step2Profile data={bookingData} updatePatient={updatePatient} />;
            case 2: return <Step3Confirm data={bookingData}/>;
        }
    };

    return (
        <View style={styles.screen}>
            <BookingHeader step={step} />

            <View style={{ flex: 1 }}>
                {renderStep()}
            </View>

            {step < 3 && (
                <View style={styles.footer}>
                    <Button
                        mode="contained"
                        disabled={!canGoNext()}
                        onPress={() => {
                            console.log(bookingData.slots)
                            setStep(prev => prev + 1)}}
                        style={styles.btnPrimary}
                        contentStyle={styles.btnContent}
                        labelStyle={styles.btnLabel}
                    >
                        {step === 2 ? "Xác nhận đặt lịch" : "Tiếp theo"}
                    </Button>
                    <Button
                        mode="outlined"
                        disabled={step === 0}
                        onPress={() => setStep(prev => prev - 1)}
                        style={styles.btnOutlined}
                        contentStyle={styles.btnContent}
                        labelStyle={styles.btnLabelOutlined}
                    >
                        Quay lại
                    </Button>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    footer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        gap: 8,
    },
    btnPrimary: {
        borderRadius: 12,
        backgroundColor: COLORS.primaryButton,
    },
    btnOutlined: {
        borderRadius: 12,
        borderColor: COLORS.primary,
    },
    btnContent: { height: 48 },
    btnLabel: {
        fontSize: 15,
        fontWeight: '700',
    },
    btnLabelOutlined: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.primary,
    },
});

export default Booking;