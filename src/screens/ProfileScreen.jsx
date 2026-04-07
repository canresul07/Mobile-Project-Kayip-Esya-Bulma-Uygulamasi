import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Alert, Switch, SafeAreaView, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import useAuth from '../hooks/useAuth';
import useItems from '../hooks/useItems';
import ItemCard from '../components/ItemCard';
import { colors } from '../theme/colors';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { user, userProfile, logout } = useAuth();
  const { fetchMyItems, resolveItem } = useItems();
  const [myItems, setMyItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    const load = async () => {
      const result = await fetchMyItems();
      if (result.success) setMyItems(result.data);
      setLoadingItems(false);
    };
    load();
  }, []);

  const handleLogout = () => {
    Alert.alert('Çıkış Yap', 'Hesabından çıkış yapmak istediğine emin misin?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Çıkış Yap', style: 'destructive', onPress: async () => { await logout(); } },
    ]);
  };

  const activeCount = myItems.filter((i) => !i.isResolved).length;
  const resolvedCount = myItems.filter((i) => i.isResolved).length;
  const initials = userProfile?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'KK';

  const SettingItem = ({ emoji, label, onPress, right, danger }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <Text style={styles.settingEmoji}>{emoji}</Text>
      <Text style={[styles.settingLabel, danger && { color: colors.lostColor }]}>{label}</Text>
      {right || <Ionicons name="chevron-forward" size={16} color={colors.textHint} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{userProfile?.name || 'Kullanıcı'}</Text>
          <Text style={styles.dept}>
            {userProfile?.department ? `${userProfile.department} • ` : ''}
            {userProfile?.studentId ? `No: ${userProfile.studentId}` : ''}
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Aktif İlan', value: activeCount, color: colors.primary },
            { label: 'Çözüldü', value: resolvedCount, color: colors.foundColor },
            { label: '⭐', value: 'Güvenilir', color: colors.star, isText: true },
          ].map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* My Posts */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>İlanlarım</Text>
          <Text style={styles.sectionCount}>{myItems.length} ilan</Text>
        </View>

        {loadingItems ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />
        ) : myItems.length === 0 ? (
          <View style={styles.emptyPosts}>
            <Text style={{ fontSize: 32 }}>📋</Text>
            <Text style={styles.emptyPostsText}>Henüz ilan oluşturmadın</Text>
          </View>
        ) : (
          <View style={styles.myItemsList}>
            {myItems.slice(0, 3).map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onPress={() => navigation.navigate('HomeTab', {
                  screen: 'ItemDetail',
                  params: { itemId: item.id },
                })}
              />
            ))}
          </View>
        )}

        {/* Settings */}
        <Text style={styles.sectionTitle2}>Hesap</Text>
        <View style={styles.settingsCard}>
          <SettingItem emoji="✏️" label="Profili Düzenle" onPress={() => Alert.alert('Yakında eklenecek')} />
          <View style={styles.settingDivider} />
          <SettingItem
            emoji="🔔"
            label="Bildirimler"
            right={
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: colors.divider, true: colors.primaryLight }}
                thumbColor={notifications ? colors.primary : '#fff'}
              />
            }
          />
          <View style={styles.settingDivider} />
          <SettingItem emoji="ℹ️" label="Hakkında" onPress={() => Alert.alert('KampüsBul v1.0', 'Üniversite kayıp-bulunan uygulaması')} />
          <View style={styles.settingDivider} />
          <SettingItem emoji="🚪" label="Çıkış Yap" onPress={handleLogout} danger />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 40 },
  header: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 60,
    paddingHorizontal: 24,
  },
  avatarContainer: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: colors.secondary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 36, fontWeight: 'bold', color: '#fff' },
  name: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginTop: 14 },
  dept: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4, textAlign: 'center' },
  statsRow: {
    flexDirection: 'row', gap: 8,
    marginHorizontal: 16, marginTop: -28,
  },
  statCard: {
    flex: 1, backgroundColor: colors.surface, borderRadius: 16,
    padding: 14, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 6,
  },
  statValue: { fontSize: 22, fontWeight: 'bold' },
  statLabel: { fontSize: 10, color: colors.textSecondary, marginTop: 2, textAlign: 'center' },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, marginTop: 24, marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: colors.onSurface },
  sectionTitle2: { fontSize: 18, fontWeight: 'bold', color: colors.onSurface, marginLeft: 20, marginTop: 24, marginBottom: 12 },
  sectionCount: { fontSize: 13, color: colors.primary },
  emptyPosts: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  emptyPostsText: { fontSize: 14, color: colors.textSecondary },
  myItemsList: { paddingHorizontal: 16 },
  settingsCard: {
    backgroundColor: colors.surface, marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 4,
  },
  settingItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
  },
  settingEmoji: { fontSize: 20, marginRight: 16 },
  settingLabel: { flex: 1, fontSize: 15, color: colors.onSurface },
  settingDivider: { height: 1, backgroundColor: colors.divider, marginLeft: 56 },
});

export default ProfileScreen;
