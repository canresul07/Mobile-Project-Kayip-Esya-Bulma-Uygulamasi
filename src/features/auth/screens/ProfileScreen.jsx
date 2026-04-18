import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { useItems } from '@/features/items/hooks/useItems';
import { ItemCard } from '@/features/items/components/ItemCard';
import { colors } from '@/shared/theme/colors';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { user, userProfile, logout } = useAuth();
  const { fetchMyItems } = useItems();
  
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
  }, [fetchMyItems]);

  const handleLogout = () => {
    Alert.alert('Çıkış Yap', 'Hesabından çıkış yapmak istediğine emin misin?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Çıkış Yap', style: 'destructive', onPress: async () => { await logout(); } },
    ]);
  };

  const activeCount = myItems.filter((i) => !i.isResolved).length;
  const resolvedCount = myItems.filter((i) => i.isResolved).length;
  const initials = userProfile?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'KK';

  const SettingItem = ({ icon, label, onPress, right, danger }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={[styles.iconBox, danger && { backgroundColor: colors.lostBg }]}>
        <Ionicons name={icon} size={20} color={danger ? colors.lostColor : colors.primary} />
      </View>
      <Text style={[styles.settingLabel, danger && { color: colors.lostColor }]}>{label}</Text>
      {right || <Ionicons name="chevron-forward" size={16} color={colors.textHint} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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

        <View style={styles.statsRow}>
          {[
            { label: 'Aktif İlan', value: activeCount, color: colors.primary },
            { label: 'Çözüldü', value: resolvedCount, color: colors.foundColor },
            { label: 'Güvenilir', value: '5.0', color: '#FFD700', isIcon: true },
          ].map((s, idx) => (
            <View key={idx} style={styles.statCard}>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>İlanlarım</Text>
          <TouchableOpacity onPress={() => {}}>
            <Text style={styles.sectionCount}>{myItems.length} ilan</Text>
          </TouchableOpacity>
        </View>

        {loadingItems ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />
        ) : myItems.length === 0 ? (
          <View style={styles.emptyItems}>
            <Ionicons name="document-text-outline" size={48} color={colors.textHint} />
            <Text style={styles.emptyItemsText}>Henüz ilan oluşturmadın</Text>
          </View>
        ) : (
          <View style={styles.myItemsList}>
            {myItems.map((item) => (
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

        <Text style={styles.sectionTitleGroup}>Hesap Ayarları</Text>
        <View style={styles.settingsCard}>
          <SettingItem icon="person-outline" label="Profili Düzenle" onPress={() => {}} />
          <View style={styles.settingDivider} />
          <SettingItem
            icon="notifications-outline"
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
          <SettingItem icon="information-circle-outline" label="Uygulama Hakkında" onPress={() => {}} />
          <View style={styles.settingDivider} />
          <SettingItem icon="log-out-outline" label="Çıkış Yap" onPress={handleLogout} danger />
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
    paddingTop: 32,
    paddingBottom: 72,
    paddingHorizontal: 24,
  },
  avatarContainer: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 10,
  },
  avatarText: { fontSize: 36, fontWeight: 'bold', color: colors.primary },
  name: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginTop: 16 },
  dept: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4, textAlign: 'center' },
  statsRow: {
    flexDirection: 'row', gap: 12,
    marginHorizontal: 16, marginTop: -36,
  },
  statCard: {
    flex: 1, backgroundColor: colors.surface, borderRadius: 24,
    padding: 16, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 12, elevation: 8,
  },
  statValue: { fontSize: 24, fontWeight: 'bold' },
  statLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 2, fontWeight: '500' },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, marginTop: 32, marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: colors.onSurface },
  sectionTitleGroup: { fontSize: 18, fontWeight: 'bold', color: colors.onSurface, marginLeft: 24, marginTop: 32, marginBottom: 16 },
  sectionCount: { fontSize: 14, color: colors.primary, fontWeight: '600' },
  emptyItems: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyItemsText: { fontSize: 15, color: colors.textHint },
  myItemsList: { paddingHorizontal: 16, gap: 12 },
  settingsCard: {
    backgroundColor: colors.surface, marginHorizontal: 16,
    borderRadius: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 12, elevation: 2,
    paddingVertical: 8,
  },
  settingItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  iconBox: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: colors.background,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 16,
  },
  settingLabel: { flex: 1, fontSize: 16, color: colors.onSurface, fontWeight: '500' },
  settingDivider: { height: 1, backgroundColor: colors.divider, marginLeft: 72 },
});

export default ProfileScreen;
