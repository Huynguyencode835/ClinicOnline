// utils/hooks/useNotification.js
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';


Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

export const useNotification = () => {

    const requestPermission = async () => {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
            return false;
        }
        return true;
    };

    // Đặt lịch nhắc trước 1 ngày lúc 8h sáng
    const scheduleAppointmentReminder = async (appointment) => {
        const granted = await requestPermission();
        if (!granted) return;

        const appointmentDate = new Date(appointment.date);

        // Nhắc trước 1 ngày lúc 8h sáng
        const reminderDate = new Date(appointmentDate);
        reminderDate.setDate(reminderDate.getDate() - 1);
        reminderDate.setHours(8, 0, 0, 0);

        // Nhắc trước 2 tiếng
        const reminderDate2h = new Date(appointmentDate);
        reminderDate2h.setHours(reminderDate2h.getHours() - 2);

        if (reminderDate > new Date()) {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: '🏥 Nhắc lịch khám bệnh ngày mai',
                    body: `Bạn có lịch khám với BS. ${appointment.doctor_name} lúc ${appointment.time}`,
                    data: { appointment_id: appointment.id },
                },
                trigger: reminderDate,
            });
        }

        if (reminderDate2h > new Date()) {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: '🏥 Còn 2 tiếng nữa đến lịch khám',
                    body: `Chuẩn bị đến khám với BS. ${appointment.doctor_name}`,
                    data: { appointment_id: appointment.id },
                },
                trigger: reminderDate2h,
            });
        }
    };

    // Hủy notification khi hủy lịch hẹn
    const cancelAppointmentReminder = async (appointmentId) => {
        const scheduled = await Notifications.getAllScheduledNotificationsAsync();
        for (const notif of scheduled) {
            if (notif.content.data?.appointment_id === appointmentId) {
                await Notifications.cancelScheduledNotificationAsync(notif.identifier);
            }
        }
    };

    // Thông báo tức thì (khi bác sĩ xác nhận/hủy)
    const sendImmediateNotification = async (title, body, data = {}) => {
        const granted = await requestPermission();
        if (!granted) return;

        await Notifications.scheduleNotificationAsync({
            content: { title, body, data },
            trigger: null, // null = hiện ngay lập tức
        });
    };

    return {
        scheduleAppointmentReminder,
        cancelAppointmentReminder,
        sendImmediateNotification,
        requestPermission,
    };
};