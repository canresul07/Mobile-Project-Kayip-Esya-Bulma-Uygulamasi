import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '@/shared/theme/colors';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { subscribeToMessages, sendMessage } from '../services/chatService';
import { uploadImageToCloudinary } from '@/core/storage';

const ChatSessionScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { chatId, otherUser } = route.params;
  const { user } = useAuth();
  
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    const unsubscribe = subscribeToMessages(chatId, (data) => {
      setMessages(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [chatId]);

  const handleSend = async () => {
    if (inputText.trim() === '') return;
    const text = inputText.trim();
    setInputText('');
    await sendMessage(chatId, user.uid, text);
  };

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('İzin Gerekli', 'Fotoğraf seçmek için galeri izni gereklidir.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setUploading(true);
      const uploadResult = await uploadImageToCloudinary(result.assets[0].uri);
      if (uploadResult.success) {
        await sendMessage(chatId, user.uid, '', uploadResult.url);
      } else {
        Alert.alert('Hata', 'Görsel yüklenemedi: ' + uploadResult.error);
      }
      setUploading(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isMe = item.senderId === user.uid;
    return (
      <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.theirMessage]}>
        {item.imageUrl && (
          <Image source={{ uri: item.imageUrl }} style={styles.messageImage} />
        )}
        {item.text !== '' && (
          <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.theirMessageText]}>
            {item.text}
          </Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.userInfo} 
          onPress={() => navigation.navigate('ChatUserDetail', { user: otherUser })}
        >
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>
              {otherUser.name?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.headerName}>{otherUser.name}</Text>
            <Text style={styles.headerStatus}>{otherUser.department}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={loading ? <ActivityIndicator style={{marginTop: 20}} /> : null}
        showsVerticalScrollIndicator={false}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={styles.inputContainer}>
          <TouchableOpacity onPress={handlePickImage} disabled={uploading} style={styles.attachBtn}>
            {uploading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Ionicons name="image-outline" size={26} color={colors.primary} />
            )}
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Bir mesaj yaz..."
            value={inputText}
            onChangeText={setInputText}
            multiline
            placeholderTextColor={colors.textHint}
          />
          <TouchableOpacity 
            onPress={handleSend} 
            style={[styles.sendBtn, inputText.trim().length > 0 && styles.sendBtnActive]} 
            disabled={inputText.trim().length === 0}
          >
            <Ionicons 
              name="send" 
              size={24} 
              color={inputText.trim().length > 0 ? '#fff' : colors.textHint} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  backBtn: { padding: 4, marginRight: 8 },
  userInfo: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  headerAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12,
  },
  headerAvatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  headerName: { fontSize: 16, fontWeight: 'bold', color: colors.onSurface },
  headerStatus: { fontSize: 11, color: colors.textSecondary },
  messageList: { paddingHorizontal: 16, paddingVertical: 20 },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 20,
    marginBottom: 8,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 4, elevation: 4,
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  messageText: { fontSize: 15, lineHeight: 22 },
  myMessageText: { color: '#fff' },
  theirMessageText: { color: colors.onSurface },
  messageImage: { width: 220, height: 160, borderRadius: 12, marginBottom: 4 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  attachBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 8,
    maxHeight: 100,
    fontSize: 15,
    color: colors.onSurface,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  sendBtn: { 
    width: 44, height: 44, 
    borderRadius: 22, 
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.background,
  },
  sendBtnActive: { backgroundColor: colors.secondary },
});

export default ChatSessionScreen;
