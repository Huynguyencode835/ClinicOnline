// configs/firebase/notifications.js
import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import firestore from '@react-native-firebase/firestore';


export const registerForPushNotifications = async () => {
    const authStatus = await messaging().requestPermission();

    const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
        alert('Không được cấp quyền thông báo!');
        return null;
    }

    const token = await messaging().getToken();
    console.log('FCM Token:', token);

    return token;
};

export const saveFCMTokenToFirestore = async (userId, token) => {
    await firestore().collection('users').doc(String(userId)).set({
        fcmToken: token,
        updatedAt: firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
};

export const onForegroundMessage = (callback) => {
    return messaging().onMessage(async remoteMessage => {
        callback(remoteMessage);
    });
};

export const onNotificationOpenedApp = (callback) => {
    return messaging().onNotificationOpenedApp(remoteMessage => {
        callback(remoteMessage);
    });
};

export const getInitialNotification = async () => {
    const remoteMessage = await messaging().getInitialNotification();
    return remoteMessage;
};

export const setBackgroundMessageHandler = () => {
    messaging().setBackgroundMessageHandler(async remoteMessage => {
    });
};