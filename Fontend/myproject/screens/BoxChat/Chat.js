import React, { useState, useRef, useContext, useCallback } from 'react';
import { View, FlatList, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { Text, TextInput, IconButton, Avatar, Surface } from 'react-native-paper';
import { createWithAuth } from '../../utils/apiHelper';
import { endpoints } from '../../configs/Apis';
import AppHeader from '../../components/AppHeader';
import COLORS from '../../styles/Colors';
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { MyUserContext } from '../../utils/contexts/MyUserContext';
import { useAlert } from '../../utils/contexts/AlertContext';

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const flatListRef = useRef(null);
    const navigation = useNavigation();
    const { user } = useContext(MyUserContext);
    const {showAlertAuth} = useAlert();

    useFocusEffect(
        useCallback(() => {
            if (!user) {
                showAlertAuth({ lable: "ChatBox" })
                return
            }
        }, [user])
    );

    const appendMessage = (text, sender) => {
        setMessages(prev => [...prev, { id: Date.now().toString(), text, sender }]);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    };

    const sendMessage = async () => {
        const text = input.trim();
        if (!text || loading) return;
        appendMessage(text, 'user');
        setInput('');
        await createWithAuth(
            endpoints.chatgemini,
            { message: text },
            (data) => appendMessage(data.reply, 'bot'),
            () => appendMessage('Lỗi kết nối, vui lòng thử lại.', 'bot'),
            setLoading,
        );
    };

    const renderItem = ({ item }) => {
        const isUser = item.sender === 'user';
        return (
            <View style={[styles.row, isUser ? styles.rowUser : styles.rowBot]}>
                {!isUser && (
                    <Avatar.Text
                        size={34}
                        label="AI"
                        style={styles.avatar}
                    />
                )}
                <Surface
                    style={[
                        styles.bubble,
                        { backgroundColor: isUser ? COLORS.primary : COLORS.white }
                    ]}
                    elevation={2}
                >
                    <Text style={[
                        styles.bubbleText,
                        { color: isUser ? COLORS.white : COLORS.text }
                    ]}>
                        {item.text}
                    </Text>
                    <Text style={[
                        styles.timeText,
                        { color: isUser ? 'rgba(255,255,255,0.65)' : COLORS.textMuted }
                    ]}>
                        {new Date(Number(item.id)).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </Text>
                </Surface>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <AppHeader titles="ChatBox Hỗ trợ sức khỏe" onBack={() => navigation.goBack()} />

            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Avatar.Text
                                size={64}
                                label="AI"
                                style={[styles.avatar, { marginBottom: 16 }]}
                            />
                            <Text variant="titleMedium" style={{ color: COLORS.text, fontWeight: '700', marginBottom: 8 }}>
                                Xin chào! Tôi có thể giúp gì cho bạn?
                            </Text>
                            <Text variant="bodyMedium" style={styles.emptyText}>
                                Để được chẩn đoán chính xác, bạn nên đến gặp bác sĩ tại cơ sở y tế gần nhất. Đừng tự ý dùng thuốc khi chưa có chỉ định nhé!
                            </Text>
                        </View>
                    }
                />

                {loading && (
                    <View style={[styles.rowBot, { paddingBottom: 8, paddingHorizontal: 16 }]}>
                        <Avatar.Text size={34} label="AI" style={styles.avatar} />
                        <Surface style={[styles.bubble, { backgroundColor: COLORS.white }]} elevation={2}>
                            <Text style={{ color: COLORS.textMuted, fontStyle: 'italic' }}>
                                Đang trả lời...
                            </Text>
                        </Surface>
                    </View>
                )}

                <Surface style={styles.inputBar} elevation={6}>
                    <TextInput
                        style={styles.input}
                        value={input}
                        onChangeText={setInput}
                        placeholder="Nhập câu hỏi..."
                        mode="outlined"
                        multiline
                        maxLength={500}
                        disabled={loading}
                        outlineColor="transparent"
                        activeOutlineColor={COLORS.primary}
                        dense
                    />
                    <IconButton
                        icon="send"
                        size={22}
                        disabled={!input.trim() || loading}
                        onPress={sendMessage}
                        iconColor={COLORS.white}
                        style={[
                            styles.sendBtn,
                            { backgroundColor: !input.trim() || loading ? COLORS.btnDisabled : COLORS.primary }
                        ]}
                    />
                </Surface>
            </KeyboardAvoidingView>
        </View>
    );
};

export default Chat;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F4F8',
    },
    flex: { flex: 1 },
    list: {
        padding: 16,
        gap: 12,
        flexGrow: 1,
    },
    empty: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 80,
        paddingHorizontal: 32,
        gap: 4,
    },
    emptyText: {
        color: COLORS.textMuted,
        textAlign: 'center',
        lineHeight: 22,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 8,
    },
    rowUser: {
        flexDirection: 'row-reverse',
    },
    rowBot: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 8,
    },
    avatar: {
        backgroundColor: COLORS.primary,
        elevation: 2,
    },
    bubble: {
        maxWidth: '75%',
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 14,
        gap: 4,
    },
    bubbleText: {
        fontSize: 15,
        lineHeight: 22,
    },
    timeText: {
        fontSize: 11,
        alignSelf: 'flex-end',
    },
    inputBar: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginHorizontal: 12,
        marginBottom: 16,
        marginTop: 4,
        borderRadius: 28,
        backgroundColor: COLORS.white,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    input: {
        flex: 1,
        backgroundColor: 'transparent',
        fontSize: 15,
    },
    sendBtn: {
        borderRadius: 22,
        margin: 0,
        marginBottom: 2,
    },
});