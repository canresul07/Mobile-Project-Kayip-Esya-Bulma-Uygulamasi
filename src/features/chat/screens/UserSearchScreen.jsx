import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/shared/theme/colors';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { searchUsers } from '@/features/auth/services/authService';
import { getUserActiveItems } from '@/features/items/services/itemsService';
import { createOrGetChat } from '@/features/chat/services/chatService';
import { Input } from '@/shared/components/Input';

const UserSearchScreen = () => {
  const navigation = useNavigation();
  const { user, userProfile } = useAuth();
  
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userItems, setUserItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setUsers([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      const result = await searchUsers(query, user.uid);
      if (result.success) setUsers(result.data);
      setLoading(false);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query, user.uid]);

  const handleSelectUser = async (targetUser) => {
    setSelectedUser(targetUser);
    setLoadingItems(true);
    const result = await getUserActiveItems(targetUser.uid);
    if (result.success) setUserItems(result.data);
    setLoadingItems(false);
  };

  const handleStartChat = async (item = null) => {
    setLoading(true);
    const result = await createOrGetChat(
      user.uid,
      { name: userProfile?.name, department: userProfile?.department },
      selectedUser.uid,
      { name: selectedUser.name, department: selectedUser.department },
      item ? { id: item.id, title: item.title } : null
    );
    setLoading(false);

    if (result.success) {
      navigation.replace('ChatSession', { 
        chatId: result.data.id, 
        otherUser: { name: selectedUser.name, department: selectedUser.department, uid: selectedUser.uid } 
      });
    }
  };

  const renderUserInfo = ({ item }) => (
    <TouchableOpacity 
      style={styles.userCard} 
      onPress={() => handleSelectUser(item)}
      activeOpacity={0.7}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.name?.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userDept}>{item.department}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textHint} />
    </TouchableOpacity>
  );

  const renderItemContext = ({ item }) => (
    <TouchableOpacity 
      style={styles.itemCard} 
      onPress={() => handleStartChat(item)}
    >
      <View style={[styles.itemBadge, item.type === 'LOST' ? styles.badgeLost : styles.badgeFound]}>
        <Text style={styles.itemBadgeText}>{item.type === 'LOST' ? 'KAYIP' : 'BULUNDU'}</Text>
      </View>
      <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
      <Ionicons name="chatbubble-outline" size={18} color={colors.primary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yeni Mesaj</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {!selectedUser ? (
          <>
            <Input
              placeholder="İsim ile kullanıcı ara..."
              value={query}
              onChangeText={setQuery}
              icon="search-outline"
              containerStyle={styles.searchBar}
            />
            
            {loading ? (
              <ActivityIndicator style={{ marginTop: 20 }} color={colors.primary} />
            ) : (
              <FlatList
                data={users}
                keyExtractor={(item) => item.uid}
                renderItem={renderUserInfo}
                ListEmptyComponent={
                  query.length >= 2 ? (
                    <Text style={styles.emptyText}>Sonuç bulunamadı.</Text>
                  ) : (
                    <Text style={styles.emptyText}>En az 2 harf girin.</Text>
                  )
                }
                contentContainerStyle={{ paddingBottom: 20 }}
              />
            )}
          </>
        ) : (
          <View style={styles.contextContainer}>
            <View style={styles.selectedUserHeader}>
              <TouchableOpacity onPress={() => setSelectedUser(null)} style={styles.backToSearch}>
                <Ionicons name="arrow-back" size={20} color={colors.primary} />
                <Text style={styles.backText}>Geri dön</Text>
              </TouchableOpacity>
              
              <View style={styles.largeAvatar}>
                <Text style={styles.largeAvatarText}>{selectedUser.name?.charAt(0).toUpperCase()}</Text>
              </View>
              <Text style={styles.selectedName}>{selectedUser.name}</Text>
              <Text style={styles.selectedDept}>{selectedUser.department}</Text>
            </View>

            <View style={styles.contextSelection}>
              <Text style={styles.sectionTitle}>Sohbet Bağlamı Seçin</Text>
              <Text style={styles.sectionSubtitle}>Bu kişiyle bir ilan hakkında mı konuşmak istiyorsunuz?</Text>
              
              {loadingItems ? (
                <ActivityIndicator style={{ marginTop: 20 }} color={colors.primary} />
              ) : (
                <FlatList
                  data={userItems}
                  keyExtractor={(item) => item.id}
                  renderItem={renderItemContext}
                  ListHeaderComponent={() => (
                    <TouchableOpacity 
                      style={styles.directChatBtn} 
                      onPress={() => handleStartChat(null)}
                    >
                      <View style={styles.directIcon}>
                        <Ionicons name="chatbubbles-outline" size={20} color={colors.primary} />
                      </View>
                      <Text style={styles.directText}>Doğrudan mesaj gönder (Bağlamsız)</Text>
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={
                    <Text style={styles.emptyItemsText}>Bu kullanıcının aktif ilanı bulunmuyor.</Text>
                  }
                />
              )}
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: colors.onSurface },
  closeBtn: { padding: 8 },
  content: { flex: 1, padding: 20 },
  searchBar: { marginBottom: 20 },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  userName: { fontSize: 16, fontWeight: 'bold', color: colors.onSurface },
  userDept: { fontSize: 12, color: colors.textSecondary },
  emptyText: { textAlign: 'center', color: colors.textHint, marginTop: 40 },
  
  contextContainer: { flex: 1 },
  selectedUserHeader: { alignItems: 'center', marginBottom: 30 },
  backToSearch: { 
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    marginBottom: 10,
  },
  backText: { color: colors.primary, fontWeight: 'bold', marginLeft: 4 },
  largeAvatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  largeAvatarText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  selectedName: { fontSize: 22, fontWeight: 'bold', color: colors.onSurface },
  selectedDept: { fontSize: 14, color: colors.textSecondary },
  
  contextSelection: { flex: 1 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: colors.onSurface, marginBottom: 4 },
  sectionSubtitle: { fontSize: 13, color: colors.textSecondary, marginBottom: 20 },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  itemBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginRight: 10 },
  badgeLost: { backgroundColor: colors.lostBg },
  badgeFound: { backgroundColor: colors.foundBg },
  itemBadgeText: { fontSize: 10, fontWeight: 'bold', color: colors.primary },
  itemTitle: { flex: 1, fontSize: 14, color: colors.onSurface },
  
  directChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    marginBottom: 16,
  },
  directIcon: { 
    width: 36, height: 36, borderRadius: 18, 
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    marginRight: 12,
  },
  directText: { fontSize: 14, fontWeight: 'bold', color: colors.primary },
  emptyItemsText: { textAlign: 'center', color: colors.textHint, marginTop: 10 },
});

export default UserSearchScreen;
