import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  SectionList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/shared/theme/colors';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { 
  subscribeToNotifications, 
  markAsRead, 
  deleteNotification, 
  markAllAsRead, 
  clearAllNotifications 
} from '../services/notificationService';
import { timeAgo } from '@/shared/utils/timeAgo';

const NotificationScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToNotifications(user.uid, (data) => {
      setNotifications(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const sections = useMemo(() => {
    if (!notifications.length) return [];
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = today - 86400000;

    const grouped = {
      'Bugün': [],
      'Dün': [],
      'Daha Eski': []
    };

    notifications.forEach(n => {
      let date;
      if (n.timestamp?.toDate) date = n.timestamp.toDate();
      else if (n.timestamp?.seconds) date = new Date(n.timestamp.seconds * 1000);
      else date = new Date(n.timestamp);

      const time = date.getTime();
      if (time >= today) grouped['Bugün'].push(n);
      else if (time >= yesterday) grouped['Dün'].push(n);
      else grouped['Daha Eski'].push(n);
    });

    return Object.keys(grouped)
      .filter(key => grouped[key].length > 0)
      .map(key => ({ title: key, data: grouped[key] }));
  }, [notifications]);

  const handleNotificationPress = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    if (notification.type === 'NEW_MESSAGE' || notification.type === 'ITEM_CLAIMED') {
      navigation.navigate('ChatSession', { 
        chatId: notification.data.chatId,
        otherUser: { 
          name: notification.data.senderName, 
          uid: notification.data.senderId,
          department: notification.data.senderDept || ''
        }
      });
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Bildirimi Sil',
      'Bu bildirimi silmek istediğine emin misin?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        { text: 'Sil', style: 'destructive', onPress: () => deleteNotification(id) }
      ]
    );
  };

  const handleClearAll = () => {
    if (!notifications.length) return;
    Alert.alert(
      'Tümünü Temizle',
      'Tüm bildirimlerini silmek istediğine emin misin? Bu işlem geri alınamaz.',
      [
        { text: 'Vazgeç', style: 'cancel' },
        { text: 'Temizle', style: 'destructive', onPress: () => clearAllNotifications(user.uid) }
      ]
    );
  };

  const handleMarkAllRead = () => {
    const hasUnread = notifications.some(n => !n.read);
    if (!hasUnread) return;
    markAllAsRead(user.uid);
  };

  const renderNotification = ({ item }) => {
    const isMessage = item.type === 'NEW_MESSAGE';
    const isClaim = item.type === 'ITEM_CLAIMED';

    return (
      <View style={styles.cardContainer}>
        <TouchableOpacity 
          style={[styles.card, !item.read && styles.unreadCard]} 
          onPress={() => handleNotificationPress(item)}
          activeOpacity={0.7}
        >
          <View style={[styles.iconContainer, isMessage ? styles.msgIcon : styles.claimIcon]}>
            <Ionicons 
              name={isMessage ? 'chatbubble-ellipses' : 'sparkles'} 
              size={22} 
              color="#fff" 
            />
            {!item.read && <View style={styles.unreadBadge} />}
          </View>
          
          <View style={styles.content}>
            <View style={styles.contentHeader}>
              <Text style={styles.title} numberOfLines={1}>
                {isClaim ? 'Eşyanız Teşhis Edildi!' : 'Yeni Mesaj'}
              </Text>
              <Text style={styles.time}>{timeAgo(item.timestamp)}</Text>
            </View>
            <Text style={styles.body} numberOfLines={2}>
              {isClaim 
                ? `${item.data.senderName}, '${item.data.itemTitle}' ilanınız için sizinle iletişime geçti.`
                : `${item.data.senderName} size bir mesaj gönderdi.`
              }
            </Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.deleteBtn} 
          onPress={() => handleDelete(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color={colors.textHint} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[colors.primary, '#4f46e5']}
        style={styles.headerGradient}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="chevron-down" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Bildirimler</Text>
            <TouchableOpacity onPress={handleClearAll} style={styles.headerActionCircle}>
              <Ionicons name="trash-bin-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.headerTabs}>
            <TouchableOpacity style={styles.tabActive} onPress={handleMarkAllRead}>
              <Text style={styles.tabTextActive}>Tümünü Okundu İşaretle</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderNotification}
          renderSectionHeader={({ section: { title } }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{title}</Text>
            </View>
          )}
          contentContainerStyle={styles.list}
          stickySectionHeadersEnabled={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="notifications-off-outline" size={50} color={colors.primary} />
              </View>
              <Text style={styles.emptyText}>Buralar Biraz Sessiz</Text>
              <Text style={styles.emptySubText}>Henüz bir bildiriminiz bulunmuyor.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerGradient: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingBottom: 16,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1, shadowRadius: 20, elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  backBtn: { 
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerActionCircle: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  tabActive: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tabTextActive: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 20, paddingBottom: 100 },
  sectionHeader: { marginTop: 20, marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 },
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03, shadowRadius: 10, elevation: 2,
    borderWidth: 1, borderColor: 'transparent',
  },
  unreadCard: {
    backgroundColor: colors.surface,
    borderColor: 'rgba(26,35,126,0.1)',
    shadowOpacity: 0.08, elevation: 4,
  },
  iconContainer: {
    width: 52, height: 52, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 16,
  },
  msgIcon: { backgroundColor: colors.primary },
  claimIcon: { backgroundColor: colors.secondary },
  unreadBadge: {
    position: 'absolute', top: -4, right: -4,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: colors.lostColor,
    borderWidth: 2, borderColor: '#fff',
  },
  content: { flex: 1 },
  contentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  title: { fontSize: 15, fontWeight: 'bold', color: colors.onSurface, flex: 1, marginRight: 8 },
  body: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
  time: { fontSize: 10, color: colors.textHint, fontWeight: '600' },
  deleteBtn: {
    width: 44, height: 44,
    alignItems: 'center', justifyContent: 'center',
    marginLeft: 4,
  },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 80 },
  emptyIconCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
  },
  emptyText: { color: colors.onSurface, fontSize: 20, fontWeight: 'bold' },
  emptySubText: { color: colors.textSecondary, marginTop: 8, fontSize: 14, textAlign: 'center' },
});

export default NotificationScreen;
