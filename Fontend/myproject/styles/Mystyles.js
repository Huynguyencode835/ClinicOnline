import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f8f5',
        paddingHorizontal: 28,
        paddingTop: 60,
    },
    // Button
    btnPrimary: {
        backgroundColor: '#2196F3',
        borderRadius: 14,
        marginBottom: 4,
    },
    btnSocial: {
        flex: 1,
        backgroundColor: '#606afc',
        borderWidth: 1.5,
        borderColor: '#e0e0e8',     // ✅ viền rõ hơn để thấy trên nền trắng
        borderRadius: 14,
    },
});