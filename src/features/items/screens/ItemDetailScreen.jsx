import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useItems } from '../hooks/useItems';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { colors } from '@/shared/theme/colors';
import { timeAgo } from '@/shared/utils/timeAgo';
import { createOrGetChat, sendMessage } from '@/features/chat/services/chatService';
import { sendNotification } from '@/features/notifications/services/notificationService';

const { width } = Dimensions.get('window');

const ItemDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { itemId } = route.params;
  const { fetchItemById, resolveItem, deleteItem } = useItems();
  const { user, userProfile } = useAuth();
  const insets = useSafeAreaInsets();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const result = await fetchItemById(itemId);
      if (result.success) setItem(result.data);
      setLoading(false);
    };
    load();
  }, [itemId, fetchItemById]);

  const handleMyItem = async () => {
    if (item.ownerId === user?.uid) {
      Alert.alert('Bilgi', 'Bu zaten sizin ilanınız.');
      return;
    }
    Alert.alert('Bu Senin Eşyan mı? 🎉', 'İlan sahibiyle otomatik olarak iletişime geçilecek ve bildirim gönderilecektir.', [
      {
        text: 'Evet, Bildir',
        onPress: async () => {
          setLoading(true);
          // 1. Create or Get Chat
          const chatRes = await createOrGetChat(
            user.uid,
            { name: userProfile?.name, department: userProfile?.department },
            item.ownerId,
            { name: item.ownerName, department: item.ownerDepartment },
            { id: item.id, title: item.title }
          );

          if (chatRes.success) {
            const chatId = chatRes.data.id;
            // 2. Send Auto Message
            await sendMessage(chatId, user.uid, `Merhaba, '${item.title}' başlıklı ilanınızdaki eşyanın bana ait olduğunu düşünüyorum. Detayları görüşebilir miyiz?`);

            // 3. Send Notification to owner
            await sendNotification(item.ownerId, 'ITEM_CLAIMED', {
              senderId: user.uid,
              senderName: userProfile?.name || 'Bir kullanıcı',
              itemTitle: item.title,
              chatId: chatId,
            });

            // 4. Navigate to Chat
            setLoading(false);
            navigation.navigate('ChatSession', {
              chatId: chatId,
              otherUser: {
                name: item.ownerName,
                department: item.ownerDepartment,
                uid: item.ownerId
              }
            });
          } else {
            setLoading(false);
            Alert.alert('Hata', 'Sohbet başlatılamadı: ' + chatRes.error);
          }
        },
      },
      { text: 'İptal', style: 'cancel' },
    ]);
  };

  const handleContact = async () => {
    if (!user) {
      Alert.alert('Hata', 'Mesaj göndermek için giriş yapmalısınız.');
      return;
    }

    if (item.ownerId === user.uid) {
      Alert.alert('Bilgi', 'Kendi ilanınıza mesaj gönderemezsiniz.');
      return;
    }

    setLoading(true);
    const result = await createOrGetChat(
      user.uid,
      { name: userProfile?.name, department: userProfile?.department },
      item.ownerId,
      { name: item.ownerName, department: item.ownerDepartment },
      { id: item.id, title: item.title }
    );
    setLoading(false);

    if (result.success) {
      navigation.navigate('ChatSession', {
        chatId: result.data.id,
        otherUser: {
          name: item.ownerName,
          department: item.ownerDepartment,
          uid: item.ownerId
        }
      });
    } else {
      Alert.alert('Hata', 'Sohbet başlatılamadı: ' + result.error);
    }
  };

  const handleResolve = () => {
    Alert.alert(
      'İlanı Çözümlendi Olarak İşaretle',
      'Bu eşya bulundu mu veya sahibine ulaştı mı? Bu işlem ilan durumunu "Çözüldü" olarak güncelleyecektir.',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Evet, Çözüldü',
          onPress: async () => {
            setLoading(true);
            const result = await resolveItem(itemId);
            if (result.success) {
              setItem(prev => ({ ...prev, status: 'RESOLVED', isResolved: true }));
              Alert.alert('Tebrikler! 🎉', 'İlan başarıyla "Çözüldü" olarak işaretlendi.');
            } else {
              Alert.alert('Hata', 'İşlem sırasında bir sorun oluştu: ' + result.error);
            }
            setLoading(false);
          }
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'İlanı Sil',
      'Bu ilanı tamamen kaldırmak istediğine emin misin? Bu işlem geri alınamaz.',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteItem(itemId);
            if (result.success) {
              Alert.alert('Başarılı', 'İlan başarıyla kaldırıldı.', [
                { text: 'Tamam', onPress: () => navigation.goBack() }
              ]);
            } else {
              Alert.alert('Hata', 'İlan silinirken bir sorun oluştu: ' + result.error);
            }
          }
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!item) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: colors.textSecondary }}>İlan bulunamadı.</Text>
      </View>
    );
  }

  const isLost = item.type === 'LOST';
  const initials = item.ownerName?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'KK';
  const isOwner = user?.uid === item.ownerId;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: isOwner ? insets.bottom + 40 : insets.bottom + 140 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageSection}>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderEmoji}>{item.imageEmoji || '🎒'}</Text>
            </View>
          )}
          <View style={styles.headerOverlay} />

          <SafeAreaView style={styles.headerActions} edges={['top']}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </TouchableOpacity>

            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.iconBtn}>
                <Ionicons name="share-outline" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.typeRow}>
            {item.status === 'RESOLVED' || item.isResolved ? (
              <View style={[styles.typeBadge, styles.badgeResolved]}>
                <Text style={[styles.typeText, { color: colors.primary }]}>
                  ✅ Çözüldü
                </Text>
              </View>
            ) : (
              <View style={[styles.typeBadge, isLost ? styles.badgeLost : styles.badgeFound]}>
                <Text style={[styles.typeText, { color: isLost ? colors.lostColor : colors.foundColor }]}>
                  {isLost ? '🔴 Kayıp İlanı' : '🟢 Bulundu İlanı'}
                </Text>
              </View>
            )}
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
          </View>

          <Text style={styles.title}>{item.title}</Text>

          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={14} color={colors.textHint} />
            <Text style={styles.metaText}>{timeAgo(item.timestamp)} tarihinde paylaşıldı</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Açıklama</Text>
          <Text style={styles.description}>{item.description}</Text>

          <View style={styles.detailsGrid}>
            <View style={styles.detailCard}>
              <View style={styles.detailIcon}>
                <Ionicons name="location-outline" size={20} color={colors.primary} />
              </View>
              <Text style={styles.detailLabel}>Konum</Text>
              <Text style={styles.detailValue} numberOfLines={1}>{item.location}</Text>
            </View>

            <View style={styles.detailCard}>
              <View style={styles.detailIcon}>
                <Ionicons name="time-outline" size={20} color={colors.primary} />
              </View>
              <Text style={styles.detailLabel}>Tarih</Text>
              <Text style={styles.detailValue} numberOfLines={1}>{item.date || 'Belirtilmedi'}</Text>
            </View>
          </View>

          <View style={styles.ownerSection}>
            <Text style={styles.sectionTitle}>İlan Sahibi</Text>
            <TouchableOpacity
              style={styles.ownerCard}
              onPress={() => navigation.navigate('ChatUserDetail', { user: { ...item, uid: item.ownerId, name: item.ownerName, department: item.ownerDepartment } })}
            >
              <View style={styles.avatar}>
                {item.ownerPhoto ? (
                  <Image source={{ uri: item.ownerPhoto }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarText}>{initials}</Text>
                )}
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={styles.ownerName}>{item.ownerName}</Text>
                <Text style={styles.ownerDept}>{item.ownerDepartment}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textHint} />
            </TouchableOpacity>
          </View>

          {isOwner && (item.status !== 'RESOLVED' && !item.isResolved) && (
            <View style={styles.ownerActionsCard}>
              <Text style={styles.ownerActionsTitle}>İlan Sahibi İşlemleri</Text>
              <Text style={styles.ownerActionsDesc}>Eşya bulunduysa veya sahibine ulaştıysa aşağıdaki butona tıkla.</Text>
              <View style={styles.ownerActionsButtons}>
                <TouchableOpacity style={styles.resolveBtn} onPress={handleResolve}>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                  <Text style={styles.resolveBtnText}>Çözüldü Olarak İşaretle</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.dangerZone}>
                <TouchableOpacity style={styles.deleteOutlineBtn} onPress={handleDelete}>
                  <Ionicons name="trash-outline" size={18} color={colors.lostColor} />
                  <Text style={styles.deleteOutlineBtnText}>İlanı Yayından Kaldır</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Bottom Bar - Only show if current user is NOT the owner */}
      {!isOwner && (
        <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <View style={styles.bottomBar}>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.outlineBtn}
                onPress={handleMyItem}
                activeOpacity={0.7}
              >
                <Text style={styles.outlineBtnText}>Benim Eşyam</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleContact}
                activeOpacity={0.8}
              >
                <Ionicons name="chatbubble-ellipses-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.primaryBtnText}>Mesaj At</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  scrollContent: { paddingBottom: 140 },

  imageSection: { height: 320, width: width, position: 'relative' },
  image: { width: '100%', height: '100%', borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  imagePlaceholder: {
    width: '100%', height: '100%',
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center', justifyContent: 'center',
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
  },
  imagePlaceholderEmoji: { fontSize: 80 },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
  },
  headerActions: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 20 : 0,
  },
  headerRight: { flexDirection: 'row', gap: 10 },
  iconBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  deleteBtn: { backgroundColor: 'rgba(255, 68, 68, 0.5)' },

  infoSection: { padding: 24, marginTop: -32, backgroundColor: colors.background, borderRadius: 32 },
  typeRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  typeBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  badgeLost: { backgroundColor: colors.lostBg },
  badgeFound: { backgroundColor: colors.foundBg },
  typeText: { fontSize: 12, fontWeight: 'bold' },
  categoryBadge: { backgroundColor: colors.categoryBg, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  categoryText: { fontSize: 12, color: colors.primary, fontWeight: 'bold' },

  title: { fontSize: 26, fontWeight: 'bold', color: colors.onSurface, marginBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 },
  metaText: { fontSize: 12, color: colors.textHint },

  divider: { height: 1.5, backgroundColor: colors.divider, marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: colors.onSurface, marginBottom: 12 },
  description: { fontSize: 16, color: colors.textSecondary, lineHeight: 24, marginBottom: 24 },

  detailsGrid: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  detailCard: {
    flex: 1, backgroundColor: colors.surface, padding: 16, borderRadius: 20,
    alignItems: 'flex-start',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05, shadowRadius: 10, elevation: 4,
  },
  detailIcon: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 10,
  },
  detailLabel: { fontSize: 11, color: colors.textHint, marginBottom: 2 },
  detailValue: { fontSize: 15, fontWeight: 'bold', color: colors.onSurface },

  ownerSection: { marginBottom: 20 },
  ownerCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16, borderRadius: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
  },
  avatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: colors.avatarBg,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', // Ensure image stays within bounds
  },
  avatarText: { fontSize: 18, fontWeight: 'bold', color: colors.primary },
  avatarImage: { width: '100%', height: '100%', borderRadius: 26 },
  ownerName: { fontSize: 16, fontWeight: 'bold', color: colors.onSurface },
  ownerDept: { fontSize: 13, color: colors.textSecondary },

  /* Fixed Bottom Controls */
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 20,
    zIndex: 10,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  actionButtons: { flexDirection: 'row', gap: 12 },
  outlineBtn: {
    flex: 0.8, height: 60, borderRadius: 18,
    borderWidth: 2, borderColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  outlineBtnText: { color: colors.primary, fontSize: 16, fontWeight: 'bold' },
  primaryBtn: {
    flex: 1, height: 60, borderRadius: 18,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8,
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  removeBtn: { backgroundColor: colors.lostColor, shadowColor: colors.lostColor },

  badgeResolved: { backgroundColor: colors.primaryLight },
  ownerActionsCard: {
    marginTop: 24,
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ownerActionsTitle: { fontSize: 16, fontWeight: 'bold', color: colors.onSurface, marginBottom: 4 },
  ownerActionsDesc: { fontSize: 13, color: colors.textSecondary, marginBottom: 16 },
  ownerActionsButtons: { flexDirection: 'row', gap: 10 },
  resolveBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  resolveBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  dangerZone: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  deleteOutlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.lostColor + '40', // Semi-transparent red border
    gap: 8,
  },
  deleteOutlineBtnText: {
    color: colors.lostColor,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ItemDetailScreen;
