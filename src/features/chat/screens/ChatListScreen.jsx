import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/shared/theme/colors';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { subscribeToChats, deleteChat } from '../services/chatService';
import { timeAgo } from '@/shared/utils/timeAgo';

const ChatListScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToChats(user.uid, (data) => {
      setChats(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleDelete = (chatId) => {
    Alert.alert('Sohbeti Sil', 'Bu sohbeti silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: () => deleteChat(chatId) },
    ]);
  };

  const renderChatItem = ({ item }) => {
    const otherUserId = item.participants.find((id) => id !== user.uid);
    const otherUser = item.participantDetails[otherUserId] || { name: 'Kullanıcı', department: '' };
    const initials = otherUser.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '??';

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => navigation.navigate('ChatSession', { chatId: item.id, otherUser })}
        activeOpacity={0.7}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={styles.userName} numberOfLines={1}>{otherUser.name}</Text>
            <Text style={styles.time}>{timeAgo(item.lastMessageTimestamp)}</Text>
          </View>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage || 'Mesaj bulunmuyor...'}
          </Text>
        </View>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
          <Ionicons name="trash-outline" size={20} color={colors.textHint} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mesajlarım</Text>
        <TouchableOpacity style={styles.newChatBtn}>
          <Ionicons name="create-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {chats.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="chatbubbles-outline" size={60} color={colors.textHint} />
          </View>
          <Text style={styles.emptyTitle}>Henüz mesajın yok</Text>
          <Text style={styles.emptySubtitle}>İlanlar üzerinden iletişime geçerek sohbet başlatabilirsin.</Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          renderItem={renderChatItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: colors.surface,
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: colors.onSurface },
  newChatBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center', justifyContent: 'center',
  },
  listContent: { paddingBottom: 20 },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  chatInfo: { flex: 1, marginLeft: 16 },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  userName: { fontSize: 16, fontWeight: 'bold', color: colors.onSurface },
  time: { fontSize: 12, color: colors.textHint },
  lastMessage: { fontSize: 14, color: colors.textSecondary },
  deleteBtn: { padding: 8 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: colors.onSurface, marginBottom: 10 },
  emptySubtitle: { fontSize: 14, color: colors.textSecondary, textAlign: 'center' },
});

export default ChatListScreen;
