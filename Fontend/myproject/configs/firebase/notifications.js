// configs/firebase/notifications.js
import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import firestore from '@react-native-firebase/firestore';

// Xin quyền thông báo + lấy FCM Token
export const registerForPushNotifications = async () => {
    // Xin quyền (iOS bắt buộc, Android 13+ cũng cần)
    const authStatus = await messaging().requestPermission();

    const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
        alert('Không được cấp quyền thông báo!');
        return null;
    }

    // Lấy FCM Token
    const token = await messaging().getToken();
    console.log('FCM Token:', token);

    return token;
};

export const saveFCMTokenToFirestore = async (userId, token) => {
    await firestore().collection('users').doc(String(userId)).set({
        fcmToken: token,
        updatedAt: firestore.FieldValue.serverTimestamp(),
    }, { merge: true }); // merge để không ghi đè data khác
};

// Lắng nghe thông báo khi app đang MỞ
export const onForegroundMessage = (callback) => {
    return messaging().onMessage(async remoteMessage => {
        callback(remoteMessage);
    });
};

// Lắng nghe khi user NHẤN vào thông báo (app background)
export const onNotificationOpenedApp = (callback) => {
    return messaging().onNotificationOpenedApp(remoteMessage => {
        callback(remoteMessage);
    });
};

// Kiểm tra app được MỞ TỪ thông báo (app đang tắt hoàn toàn)
export const getInitialNotification = async () => {
    const remoteMessage = await messaging().getInitialNotification();
    return remoteMessage;
};

// Xử lý thông báo khi app TẮT HOÀN TOÀN (background handler)
export const setBackgroundMessageHandler = () => {
    messaging().setBackgroundMessageHandler(async remoteMessage => {
    });
};