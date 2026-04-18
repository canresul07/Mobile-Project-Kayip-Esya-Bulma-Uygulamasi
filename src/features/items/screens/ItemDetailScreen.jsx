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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useItems } from '../hooks/useItems';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { colors } from '@/shared/theme/colors';
import { timeAgo } from '@/shared/utils/timeAgo';
import { createOrGetChat } from '@/features/chat/services/chatService';

const ItemDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { itemId } = route.params;
  const { fetchItemById, resolveItem } = useItems();
  const { user, userProfile } = useAuth();

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
      Alert.alert('Bilgi', 'Bu zaten sizin ilananız.');
      return;
    }
    Alert.alert('Bu Senin Eşyan mı? 🎉', 'İlan sahibine bildirim gönderilecek.', [
      {
        text: 'Evet, Bildir',
        onPress: async () => {
          await resolveItem(itemId);
          Alert.alert('Tebrikler!', 'İlan sahibine bildirim gönderildi.', [
            { text: 'Tamam', onPress: () => navigation.goBack() },
          ]);
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
      navigation.navigate('ChatTab', {
        screen: 'ChatSession',
        params: {
          chatId: result.data.id,
          otherUser: {
            name: item.ownerName,
            department: item.ownerDepartment,
            uid: item.ownerId
          }
        }
      });
    } else {
      Alert.alert('Hata', 'Sohbet başlatılamadı: ' + result.error);
    }
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.imageContainer}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            {/* @ts-ignore */}
            <Text style={styles.imagePlaceholderEmoji}>{item.imageEmoji || '🎒'}</Text>
          </View>
        )}
        <View style={styles.imageOverlay} />
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, isLost ? styles.badgeLost : styles.badgeFound]}>
              <Text style={[styles.badgeText, { color: isLost ? colors.lostColor : colors.foundColor }]}>
                ● {isLost ? 'KAYIP' : 'BULUNDU'}
              </Text>
            </View>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{item.category}</Text>
            </View>
          </View>

          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>

          <View style={styles.divider} />

          {[
            { icon: 'location-outline', label: 'Konum', value: item.location },
            { icon: 'calendar-outline', label: 'Tarih', value: item.date || timeAgo(item.timestamp) },
            { icon: 'time-outline', label: 'Yayınlanma', value: timeAgo(item.timestamp) },
          ].map((info) => (
            <View key={info.label} style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name={info.icon} size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={styles.infoLabel}>{info.label}</Text>
                <Text style={styles.infoValue}>{info.value}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.ownerCard}>
          <View style={styles.ownerAvatar}>
            <Text style={styles.ownerAvatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.ownerLabel}>İlan Sahibi</Text>
            <Text style={styles.ownerName}>{item.ownerName}</Text>
            <Text style={styles.ownerDept}>{item.ownerDepartment}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textHint} />
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.outlineBtn} onPress={handleMyItem}>
          <Text style={styles.outlineBtnText}>Bu Benim Eşyam!</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryBtn} onPress={handleContact}>
          <Text style={styles.primaryBtnText}>İletişime Geç</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  imageContainer: { height: 260, position: 'relative' },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: {
    width: '100%', height: '100%',
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center', justifyContent: 'center',
  },
  imagePlaceholderEmoji: { fontSize: 80 },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  backBtn: {
    position: 'absolute', top: 16, left: 16,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  content: { paddingBottom: 100 },
  card: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginTop: -24,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  badge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  badgeLost: { backgroundColor: colors.lostBg },
  badgeFound: { backgroundColor: colors.foundBg },
  badgeText: { fontSize: 12, fontWeight: 'bold' },
  categoryBadge: { backgroundColor: colors.categoryBg, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  categoryBadgeText: { fontSize: 12, color: colors.primary },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.onSurface, marginBottom: 10 },
  description: { fontSize: 15, color: colors.textSecondary, lineHeight: 22, marginBottom: 20 },
  divider: { height: 1, backgroundColor: colors.divider, marginBottom: 20 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  infoIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center', justifyContent: 'center',
  },
  infoLabel: { fontSize: 11, color: colors.textHint },
  infoValue: { fontSize: 15, fontWeight: 'bold', color: colors.onSurface, marginTop: 2 },
  ownerCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: 16, marginTop: 16,
    borderRadius: 20, padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 4,
  },
  ownerAvatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: colors.secondary,
    alignItems: 'center', justifyContent: 'center',
  },
  ownerAvatarText: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  ownerLabel: { fontSize: 11, color: colors.textHint },
  ownerName: { fontSize: 16, fontWeight: 'bold', color: colors.onSurface },
  ownerDept: { fontSize: 13, color: colors.textSecondary },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: 12,
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    borderTopWidth: 1, borderTopColor: colors.divider,
  },
  outlineBtn: {
    flex: 1, height: 56, borderRadius: 16,
    borderWidth: 2, borderColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  outlineBtnText: { color: colors.primary, fontSize: 15, fontWeight: 'bold' },
  primaryBtn: {
    flex: 1, height: 56, borderRadius: 16,
    backgroundColor: colors.secondary,
    alignItems: 'center', justifyContent: 'center',
  },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
});

export default ItemDetailScreen;
