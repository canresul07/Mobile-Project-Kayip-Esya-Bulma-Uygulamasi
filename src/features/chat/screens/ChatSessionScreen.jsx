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
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '@/shared/theme/colors';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { subscribeToMessages, sendMessage } from '../services/chatService';
import { uploadImageToCloudinary } from '@/core/storage';
import { timeAgo } from '@/shared/utils/timeAgo';

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

  const renderMessage = ({ item, index }) => {
    const isMe = item.senderId === user.uid;
    const prevMsg = messages[index - 1];
    const isSameSender = prevMsg?.senderId === item.senderId;
    
    return (
      <View style={[
        styles.messageWrapper, 
        isMe ? styles.myWrapper : styles.theirWrapper,
        isSameSender && { marginTop: 2 }
      ]}>
        {!isMe && !isSameSender && (
          <View style={styles.miniAvatar}>
            <Text style={styles.miniAvatarText}>{otherUser.name?.charAt(0)}</Text>
          </View>
        )}
        
        <View style={[styles.bubbleContainer, isMe ? styles.myBubbleContainer : styles.theirBubbleContainer]}>
          {isMe ? (
            <LinearGradient
              colors={[colors.primary, '#4facfe']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.bubble, styles.myBubble]}
            >
              {item.imageUrl && (
                <Image source={{ uri: item.imageUrl }} style={styles.messageImage} />
              )}
              {item.text !== '' && (
                <Text style={[styles.messageText, styles.myText]}>{item.text}</Text>
              )}
            </LinearGradient>
          ) : (
            <View style={[styles.bubble, styles.theirBubble]}>
              {item.imageUrl && (
                <Image source={{ uri: item.imageUrl }} style={styles.messageImage} />
              )}
              {item.text !== '' && (
                <Text style={[styles.messageText, styles.theirText]}>{item.text}</Text>
              )}
            </View>
          )}
          <Text style={styles.msgTime}>{timeAgo(item.timestamp)}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.header} edges={['top']}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
            <Ionicons name="chevron-back" size={28} color={colors.onSurface} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.userInfo}
            onPress={() => navigation.navigate('ChatUserDetail', { user: otherUser })}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{otherUser.name?.charAt(0)}</Text>
              <View style={styles.onlineDot} />
            </View>
            <View>
              <Text style={styles.userName}>{otherUser.name}</Text>
              <Text style={styles.userStatus}>{otherUser.department || 'Öğrenci'}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.headerBtn}
            onPress={() => {
              Alert.alert(
                otherUser.name,
                'Yapmak istediğiniz işlemi seçin',
                [
                  { text: 'Profili Görüntüle', onPress: () => navigation.navigate('ChatUserDetail', { user: otherUser }) },
                  { text: 'Sohbeti Temizle', style: 'destructive', onPress: () => Alert.alert('Gelecek Güncelleme', 'Bu özellik yakında eklenecektir.') },
                  { text: 'Kullanıcıyı Bildir/Engelle', style: 'destructive', onPress: () => Alert.alert('Bildir', 'Kullanıcı bildirildi. İnceleme başlatılacaktır.') },
                  { text: 'Vazgeç', style: 'cancel' }
                ]
              );
            }}
          >
            <Ionicons name="ellipsis-horizontal" size={24} color={colors.textHint} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={loading ? <ActivityIndicator style={{marginTop: 40}} color={colors.primary} /> : null}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <SafeAreaView edges={['bottom']} style={styles.inputArea}>
          <View style={styles.inputWrapper}>
            <TouchableOpacity 
              style={styles.attachBtn} 
              onPress={handlePickImage}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Ionicons name="image-outline" size={24} color={colors.primary} />
              )}
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Mesajınızı yazın..."
              placeholderTextColor={colors.textHint}
              value={inputText}
              onChangeText={setInputText}
              multiline
            />

            <TouchableOpacity 
              style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]} 
              onPress={handleSend}
              disabled={!inputText.trim()}
            >
              <Ionicons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { 
    backgroundColor: '#fff', 
    borderBottomWidth: 1, 
    borderBottomColor: colors.divider,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 10, elevation: 5,
  },
  headerContent: {
    flexDirection: 'row', alignItems: 'center', 
    paddingHorizontal: 12, paddingVertical: 10,
  },
  headerBtn: { padding: 8 },
  userInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 4 },
  avatar: { 
    width: 40, height: 40, borderRadius: 14, 
    backgroundColor: colors.primary, 
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12, position: 'relative',
  },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  onlineDot: {
    position: 'absolute', bottom: -2, right: -2,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: colors.foundColor,
    borderWidth: 2, borderColor: '#fff',
  },
  userName: { fontSize: 16, fontWeight: 'bold', color: colors.onSurface },
  userStatus: { fontSize: 11, color: colors.textSecondary },

  listContent: { paddingHorizontal: 16, paddingVertical: 24 },
  messageWrapper: { marginBottom: 12, flexDirection: 'row', alignItems: 'flex-end' },
  myWrapper: { justifyContent: 'flex-end' },
  theirWrapper: { justifyContent: 'flex-start' },
  
  miniAvatar: {
    width: 28, height: 28, borderRadius: 10, 
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 8, marginBottom: 4,
  },
  miniAvatarText: { fontSize: 12, fontWeight: 'bold', color: colors.primary },

  bubbleContainer: { maxWidth: '80%' },
  myBubbleContainer: { alignItems: 'flex-end' },
  theirBubbleContainer: { alignItems: 'flex-start' },
  
  bubble: { padding: 12, borderRadius: 20 },
  myBubble: { borderBottomRightRadius: 4 },
  theirBubble: { backgroundColor: '#fff', borderBottomLeftRadius: 4 },
  
  messageText: { fontSize: 15, lineHeight: 22 },
  myText: { color: '#fff' },
  theirText: { color: colors.onSurface },
  messageImage: { width: 240, height: 180, borderRadius: 12, marginBottom: 8 },
  
  msgTime: { fontSize: 10, color: colors.textHint, marginTop: 4, marginHorizontal: 4 },

  inputArea: { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: colors.divider },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', 
    paddingHorizontal: 12, paddingVertical: 10,
  },
  attachBtn: { padding: 10 },
  input: {
    flex: 1, backgroundColor: '#F1F3F5', 
    borderRadius: 20, paddingHorizontal: 16, 
    paddingVertical: 10, maxHeight: 100,
    fontSize: 15, color: colors.onSurface,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 15,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    marginLeft: 8,
  },
  sendBtnDisabled: { backgroundColor: colors.textHint, opacity: 0.5 },
});

export default ChatSessionScreen;
