import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/shared/theme/colors';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { subscribeToChats, deleteChat } from '../services/chatService';
import { timeAgo } from '@/shared/utils/timeAgo';
import { Input } from '@/shared/components/Input';

const ChatListScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToChats(user.uid, (data) => {
      setChats(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const filteredChats = useMemo(() => {
    if (!searchQuery) return chats;
    const q = searchQuery.toLowerCase();
    return chats.filter((chat) => {
      const otherUserId = chat.participants.find((id) => id !== user.uid);
      const otherUser = chat.participantDetails[otherUserId];
      return (
        otherUser?.name?.toLowerCase().includes(q) ||
        chat.lastMessage?.toLowerCase().includes(q)
      );
    });
  }, [chats, searchQuery, user.uid]);

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
        style={styles.chatCard}
        onPress={() => navigation.navigate('ChatSession', { chatId: item.id, otherUser })}
        activeOpacity={0.7}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
          {/* Online badge placeholder */}
          <View style={styles.onlineBadge} />
        </View>
        
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={styles.userName} numberOfLines={1}>{otherUser.name}</Text>
            <Text style={styles.time}>{timeAgo(item.lastMessageTimestamp)}</Text>
          </View>
          
          <View style={styles.lastMsgRow}>
            <Text style={styles.lastMessage} numberOfLines={1}>
              {item.lastMessage || 'Sohbeti başlattınız...'}
            </Text>
            {item.itemContext && (
              <View style={styles.contextTag}>
                <Ionicons name="link-outline" size={12} color={colors.primary} />
                <Text style={styles.contextTagText} numberOfLines={1}>{item.itemContext.title}</Text>
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
          <Ionicons name="trash-outline" size={20} color={colors.lostColor} />
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
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Mesajlarım</Text>
          <Text style={styles.headerSubtitle}>{chats.length} aktif görüşme</Text>
        </View>
        <TouchableOpacity 
          style={styles.newChatBtn} 
          activeOpacity={0.8}
          onPress={() => navigation.navigate('UserSearch')}
        >
          <Ionicons name="create-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.contentWrapper}>
        <View style={styles.searchSection}>
          <Input
            placeholder="Sohbetlerde ara..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            icon="search-outline"
            containerStyle={styles.searchBarContainer}
            wrapperStyle={styles.searchBarWrapper}
          />
        </View>

        {chats.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="chatbubbles-outline" size={64} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>Henüz mesajın yok</Text>
            <Text style={styles.emptySubtitle}>İlanlar üzerinden iletişime geçerek veya yeni mesaj butonuna basarak sohbet başlatabilirsin.</Text>
            <TouchableOpacity 
              style={styles.startBtn}
              onPress={() => navigation.navigate('UserSearch')}
            >
              <Text style={styles.startBtnText}>Birine Mesaj At</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredChats}
            keyExtractor={(item) => item.id}
            renderItem={renderChatItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={styles.noResults}>Aramanızla eşleşen sohbet bulunamadı.</Text>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary },
  contentWrapper: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: colors.primary,
  },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  newChatBtn: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: colors.secondary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
  },
  searchSection: {
    backgroundColor: colors.primary,
    paddingBottom: 20,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  searchBarContainer: { marginBottom: 0 },
  searchBarWrapper: { 
    height: 52, 
    borderRadius: 16, 
    borderWidth: 0,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  listContent: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 120 },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarText: { color: colors.primary, fontSize: 22, fontWeight: 'bold' },
  onlineBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.foundColor,
    borderWidth: 2,
    borderColor: '#fff',
  },
  chatInfo: { flex: 1, marginLeft: 16 },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  userName: { fontSize: 17, fontWeight: 'bold', color: colors.onSurface },
  time: { fontSize: 12, color: colors.textHint },
  lastMsgRow: { flexDirection: 'column', gap: 6 },
  lastMessage: { fontSize: 14, color: colors.textSecondary },
  contextTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.categoryBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  contextTagText: { fontSize: 11, color: colors.primary, fontWeight: '600', marginLeft: 4, maxWidth: 120 },
  deleteBtn: { padding: 8, marginLeft: 8 },
  
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 40,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: { fontSize: 22, fontWeight: 'bold', color: colors.onSurface, marginBottom: 12 },
  emptySubtitle: { fontSize: 15, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  startBtn: { 
    marginTop: 30, backgroundColor: colors.primary, 
    paddingHorizontal: 32, paddingVertical: 14, borderRadius: 16 
  },
  startBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  noResults: { textAlign: 'center', color: colors.textHint, marginTop: 40 },
});

export default ChatListScreen;
