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
  Image,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { useItems } from '@/features/items/hooks/useItems';
import { ItemCard } from '@/features/items/components/ItemCard';
import { colors } from '@/shared/theme/colors';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { user, userProfile, logout, updatePassword } = useAuth();
  const { fetchMyItems, deleteItem } = useItems();
  
  const [myItems, setMyItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [visibleItemsCount, setVisibleItemsCount] = useState(3);
  const [itemsFilter, setItemsFilter] = useState('ALL'); // 'ALL' | 'RESOLVED'
  const [guideVisible, setGuideVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const load = async () => {
    setLoadingItems(true);
    const result = await fetchMyItems();
    if (result.success) setMyItems(result.data);
    setLoadingItems(false);
  };

  useEffect(() => {
    load();
  }, [fetchMyItems]);

  const handleLogout = () => {
    Alert.alert('Çıkış Yap', 'Hesabından çıkış yapmak istediğine emin misin?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Çıkış Yap', style: 'destructive', onPress: async () => { await logout(); } },
    ]);
  };
  
  const handlePasswordUpdate = async () => {
    if (newPassword.length < 6) {
      Alert.alert('Hata', 'Yeni şifre en az 6 karakter olmalıdır.');
      return;
    }

    setUpdatingPassword(true);
    const result = await updatePassword(newPassword);
    setUpdatingPassword(false);

    if (result.success) {
      Alert.alert('Başarılı', 'Şifreniz başarıyla güncellendi.');
      setPasswordModalVisible(false);
      setNewPassword('');
    } else {
      let errorMsg = 'Şifre güncellenemedi.';
      if (result.error?.includes('requires-recent-login')) {
        errorMsg = 'Güvenlik nedeniyle bu işlemi yapmak için yeni giriş yapmış olmanız gerekiyor. Lütfen çıkış yapıp tekrar giriş yaptıktan sonra deneyin.';
      } else {
        errorMsg += ' ' + (result.error || 'Lütfen daha sonra tekrar deneyin.');
      }
      Alert.alert('Hata', errorMsg);
    }
  };

  const handleDeleteItem = (itemId) => {
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
              // Optimistic update
              setMyItems(prev => prev.filter(item => item.id !== itemId));
              Alert.alert('Başarılı', 'İlan başarıyla kaldırıldı.');
            } else {
              Alert.alert('Hata', 'İlan silinirken bir sorun oluştu: ' + result.error);
            }
          } 
        },
      ]
    );
  };

  const activeCount = (myItems || []).filter((i) => !(i.isResolved || i.status === 'RESOLVED')).length;
  const resolvedCount = (myItems || []).filter((i) => i.isResolved || i.status === 'RESOLVED').length;

  const getFilteredMyItems = () => {
    if (itemsFilter === 'RESOLVED') {
      return myItems.filter(i => i.isResolved || i.status === 'RESOLVED');
    }
    return myItems;
  };

  const filteredMyItems = getFilteredMyItems();
  const paginatedMyItems = filteredMyItems.slice(0, visibleItemsCount);
  const displayName = userProfile?.name || 'Kullanıcı';
  const initials = displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'KK';

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
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />
      <View style={styles.contentWrapper}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              {userProfile?.profilePicture ? (
                <Image source={{ uri: userProfile.profilePicture }} style={styles.avatarImg} />
              ) : (
                <Text style={styles.avatarText}>{initials}</Text>
              )}
            </View>
            <Text style={styles.name}>{displayName}</Text>
            <Text style={styles.dept}>
              {userProfile?.department ? `${userProfile.department} • ` : ''}
              {userProfile?.studentId ? `No: ${userProfile.studentId}` : ''}
            </Text>
          </View>

          <View style={styles.statsRow}>
            {[
              { id: 'ALL', label: 'Aktif İlan', value: activeCount, color: colors.primary },
              { id: 'RESOLVED', label: 'Çözüldü', value: resolvedCount, color: colors.foundColor },
              { id: 'TRUST', label: 'Güvenilir', value: '5.0', color: '#FFD700', isIcon: true },
            ].map((s, idx) => (
              <TouchableOpacity 
                key={idx} 
                style={[
                  styles.statCard, 
                  (itemsFilter === s.id || (itemsFilter === 'ALL' && s.id === 'ALL')) && styles.statCardActive
                ]}
                onPress={() => {
                  if (s.id === 'ALL' || s.id === 'RESOLVED') {
                    setItemsFilter(s.id);
                    setVisibleItemsCount(3);
                  }
                }}
              >
                <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </TouchableOpacity>
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
          ) : (
            <>
              <View style={styles.myItemsList}>
                {paginatedMyItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onDelete={handleDeleteItem}
                    onPress={() => navigation.navigate('HomeTab', {
                      screen: 'ItemDetail',
                      params: { itemId: item.id },
                    })}
                  />
                ))}
              </View>
              {filteredMyItems.length > paginatedMyItems.length && (
                <TouchableOpacity 
                  style={styles.loadMoreItemsBtn} 
                  onPress={() => setVisibleItemsCount(prev => prev + 3)}
                >
                  <Text style={styles.loadMoreItemsText}>Daha Fazla Göster</Text>
                  <Ionicons name="chevron-down" size={14} color={colors.primary} />
                </TouchableOpacity>
              )}
            </>
          )}

          <Text style={styles.sectionTitleGroup}>Hesap Ayarları</Text>
          <View style={styles.settingsCard}>
            <SettingItem 
              icon="person-outline" 
              label="Profili Düzenle" 
              onPress={() => navigation.navigate('EditProfile')} 
            />
            <View style={styles.settingDivider} />
            <SettingItem 
              icon="lock-closed-outline" 
              label="Şifre Değiştir" 
              onPress={() => setPasswordModalVisible(true)} 
            />
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
            <SettingItem 
              icon="help-circle-outline" 
              label="Nasıl Kullanılır?" 
              onPress={() => setGuideVisible(true)} 
            />
            <View style={styles.settingDivider} />
            <SettingItem icon="log-out-outline" label="Çıkış Yap" onPress={handleLogout} danger />
          </View>
        </ScrollView>

        <Modal
          visible={guideVisible}
          animationType="fade"
          transparent
          onRequestClose={() => setGuideVisible(false)}
        >
          <View style={styles.guideOverlay}>
            <View style={styles.guideContent}>
              <View style={styles.guideHeader}>
                <Text style={styles.guideTitle}>📱 Uygulama Rehberi</Text>
                <TouchableOpacity onPress={() => setGuideVisible(false)}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.guideBody}>
                <GuideSection 
                  icon="add-circle" 
                  color={colors.primary} 
                  title="İlan Ver" 
                  desc="Kaybettiğin veya bulduğun bir eşyayı 'İlan Ver' butonunu kullanarak sisteme ekle. Fotoğraf ve detay eklemeyi unutma!" 
                />
                <GuideSection 
                  icon="search" 
                  color={colors.foundColor} 
                  title="Filtrele & Ara" 
                  desc="Kategori ve tarih bazlı filtrelemeyi kullanarak aradığın eşyayı çok daha hızlı bir şekilde bulabilirsin." 
                />
                <GuideSection 
                  icon="chatbubbles" 
                  color={colors.primary} 
                  title="Mesajlaş" 
                  desc="Eşyanın sahibiyle veya bulan kişiyle uygulama üzerinden güvenli iletişim kur. Detayları sohbette netleştir." 
                />
                <GuideSection 
                  icon="checkmark-circle" 
                  color={colors.primary} 
                  title="Çözüldü Olarak İşaretle" 
                  desc="Eşyan sahibine ulaştığında ilan detayından 'Çözüldü' butonuna basarak ilanı kapatmayı unutma!" 
                />
              </ScrollView>

              <TouchableOpacity 
                style={styles.guideCloseBtn} 
                onPress={() => setGuideVisible(false)}
              >
                <Text style={styles.guideCloseText}>Anladım</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal
          visible={passwordModalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setPasswordModalVisible(false)}
        >
          <View style={styles.guideOverlay}>
            <View style={styles.passwordContent}>
              <View style={styles.guideHeader}>
                <Text style={styles.guideTitle}>🔐 Şifre Değiştir</Text>
                <TouchableOpacity onPress={() => setPasswordModalVisible(false)} disabled={updatingPassword}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <Text style={styles.passwordHint}>Hesabınızın güvenliği için en az 6 karakterli güçlü bir şifre belirleyin.</Text>
              
              <View style={styles.inputContainer}>
                <Ionicons name="key-outline" size={20} color={colors.primary} style={styles.inputIcon} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Giriş Şifresi</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ color: colors.textHint, fontSize: 13 }}>••••••••••••</Text>
                    <Text style={{ color: colors.primary, fontSize: 12, marginLeft: 8 }}>(Yeni şifre belirle)</Text>
                  </View>
                </View>
              </View>

              <View style={styles.newPasswordInput}>
                <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} style={styles.inputIcon} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Yeni Şifre</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Yeni şifrenizi giriniz"
                    placeholderTextColor={colors.textHint}
                    secureTextEntry
                    value={newPassword}
                    onChangeText={setNewPassword}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.guideCloseBtn, (newPassword.length < 6 || updatingPassword) && { opacity: 0.6 }]} 
                onPress={handlePasswordUpdate}
                disabled={newPassword.length < 6 || updatingPassword}
              >
                {updatingPassword ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.guideCloseText}>Şifreyi Güncelle</Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.cancelBtn} 
                onPress={() => setPasswordModalVisible(false)}
                disabled={updatingPassword}
              >
                <Text style={styles.cancelText}> Vazgeç</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const GuideSection = ({ icon, color, title, desc }) => (
  <View style={styles.guideSection}>
    <View style={[styles.guideIconBox, { backgroundColor: color + '15' }]}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <View style={styles.guideTextInfo}>
      <Text style={styles.guideSectionTitle}>{title}</Text>
      <Text style={styles.guideSectionDesc}>{desc}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary },
  headerBackground: { backgroundColor: colors.primary },
  contentWrapper: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 120 },
  header: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 72,
    paddingHorizontal: 24,
  },
  avatarContainer: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: colors.avatarBg,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 10,
    overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%' },
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
  statCardActive: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: '#fff',
  },
  loadMoreItemsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  loadMoreItemsText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginRight: 4,
  },
  guideOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  guideContent: {
    backgroundColor: '#fff',
    borderRadius: 28,
    width: '100%',
    maxHeight: '80%',
    padding: 24,
  },
  guideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  guideTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  guideBody: {
    marginBottom: 10,
  },
  guideSection: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  guideIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  guideTextInfo: {
    flex: 1,
  },
  guideSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  guideSectionDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  guideCloseBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  guideCloseText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  passwordContent: {
    backgroundColor: '#fff',
    borderRadius: 28,
    width: '100%',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  passwordHint: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.divider,
    opacity: 0.7,
  },
  newPasswordInput: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: colors.primary + '30',
  },
  inputIcon: { marginRight: 16 },
  inputLabel: { fontSize: 11, color: colors.textSecondary, marginBottom: 2, fontWeight: '600', textTransform: 'uppercase' },
  textInput: { fontSize: 16, color: colors.text, paddingVertical: 4 },
  cancelBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelText: { color: colors.textHint, fontSize: 14, fontWeight: '500' },
});

export default ProfileScreen;
