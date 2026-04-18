import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useItems } from '../hooks/useItems';
import { ItemCard } from '../components/ItemCard';
import { colors } from '@/shared/theme/colors';
import { Input } from '@/shared/components/Input';
import { CATEGORIES } from '../constants';

const FILTERS = [
  { key: 'ALL', label: 'Tümü' },
  { key: 'LOST', label: '🔴 Kayıp' },
  { key: 'FOUND', label: '🟢 Bulunan' },
  { key: 'RESOLVED', label: '✅ Çözüldü' },
];

const HomeScreen = () => {
  const navigation = useNavigation();
  const { userProfile } = useAuth();
  const {
    filteredItems,
    paginatedItems,
    loading,
    activeFilter,
    searchQuery,
    categoryFilter,
    dateInterval,
    visibleItemsCount,
    setFilter,
    setSearchQuery,
    setCategoryFilter,
    setDateInterval,
    loadMore,
    error,
    fetchStats,
  } = useItems();
  
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [stats, setStats] = useState({ lostCount: 0, foundCount: 0, todayCount: 0 });

  useEffect(() => {
    const loadStats = async () => {
      const result = await fetchStats();
      if (result.success && result.data) setStats(result.data);
    };
    loadStats();
  }, [fetchStats]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />
      <View style={styles.headerBackground}>
      <View style={styles.appBar}>
        <View>
          <Text style={styles.greeting}>İyi günler, 👋</Text>
          <Text style={styles.userName}>{userProfile?.name?.split(' ')[0] || 'Kullanıcı'}</Text>
        </View>
        <TouchableOpacity 
          style={styles.notifBtn} 
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Notifications')}
        >
          <View style={styles.notifBadge} />
          <Ionicons name="notifications-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchSection}>
        <Input
          placeholder="Eşya, kategori veya konum ara..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          icon="search-outline"
          containerStyle={styles.searchBarContainer}
          wrapperStyle={styles.searchBarWrapper}
          style={styles.searchBarInput}
          rightElement={
            searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close-circle" size={20} color={colors.textHint} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.filterBarBtn}
                onPress={() => setFilterModalVisible(true)}
              >
                <Ionicons name="options-outline" size={20} color={colors.primary} />
                {(categoryFilter || dateInterval !== 'ALL') && <View style={styles.filterDot} />}
              </TouchableOpacity>
            )
          }
        />

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.chipsScroll}
          contentContainerStyle={styles.chipsContent}
        >
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              activeOpacity={0.8}
              style={[styles.chip, activeFilter === f.key && styles.chipActive]}
              onPress={() => setFilter(f.key)}
            >
              <Text style={[styles.chipText, activeFilter === f.key && styles.chipTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>


      <View style={styles.contentWrapper}>
        <FlatList
          data={paginatedItems}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={() => (
            <>
              <View style={styles.statsRow}>
                {[
                  { label: 'Aktif Kayıp', value: stats.lostCount, color: colors.lostColor, filter: 'LOST' },
                  { label: 'Bulunan', value: stats.foundCount, color: colors.foundColor, filter: 'FOUND' },
                  { label: 'Bugün', value: stats.todayCount, color: colors.primary, filter: 'ALL' },
                ].map((stat) => (
                  <TouchableOpacity 
                    key={stat.label} 
                    style={[
                      styles.statCard, 
                      activeFilter === stat.filter && { borderColor: stat.color, borderWidth: 1 }
                    ]}
                    onPress={() => setFilter(stat.filter)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Son İlanlar</Text>
                <Text style={styles.seeAll}>Filtrelenen: {filteredItems.length} İlan</Text>
              </View>
            </>
          )}
          renderItem={({ item }) => (
            <ItemCard
              item={item}
              onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}
            />
          )}
          ListFooterComponent={() => (
            filteredItems.length > paginatedItems.length ? (
              <TouchableOpacity style={styles.loadMoreBtn} onPress={loadMore}>
                <Text style={styles.loadMoreText}>Daha Fazla Yükle</Text>
                <Ionicons name="chevron-down" size={16} color={colors.primary} />
              </TouchableOpacity>
            ) : filteredItems.length > 0 ? (
              <View style={styles.listEnd}>
                <Text style={styles.listEndText}>Tüm ilanlar listelendi</Text>
              </View>
            ) : null
          )}
          ListEmptyComponent={() =>
            loading ? (
              <ActivityIndicator color={colors.primary} style={styles.loader} />
            ) : error ? (
              <View style={styles.errorState}>
                <Ionicons name="alert-circle-outline" size={64} color={colors.lostColor} />
                <Text style={styles.errorTitle}>Listeleme Hatası</Text>
                <Text style={styles.errorSubtitle}>
                  {error.includes('index') 
                    ? 'Filtreleme için gerekli indeks henüz hazır değil. Lütfen terminaldeki linke tıklayarak indeksi oluşturun.' 
                    : error}
                </Text>
                <TouchableOpacity style={styles.retryBtn} onPress={() => setFilter('ALL')}>
                  <Text style={styles.retryBtnText}>Filtreyi Temizle</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🔍</Text>
                <Text style={styles.emptyTitle}>Henüz ilan yok</Text>
                <Text style={styles.emptySubtitle}>İlan eklemek için aşağıdaki + butonuna tıkla</Text>
              </View>
            )
          }
          showsVerticalScrollIndicator={false}
        />
      </View>

      <Modal
        visible={filterModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setFilterModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtrele</Text>
              <TouchableOpacity onPress={() => {
                setCategoryFilter('');
                setDateInterval('ALL');
              }}>
                <Text style={styles.clearFilters}>Temizle</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.filterGroupTitle}>Kategori</Text>
              <View style={styles.filterOptionsRows}>
                {['', ...CATEGORIES].map((cat) => (
                  <TouchableOpacity
                    key={cat || 'Tümü'}
                    style={[styles.filterOption, categoryFilter === cat && styles.filterOptionActive]}
                    onPress={() => setCategoryFilter(cat)}
                  >
                    <Text style={[styles.filterOptionText, categoryFilter === cat && styles.filterOptionTextActive]}>
                      {cat || 'Tümü'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.filterGroupTitle}>Zaman Aralığı</Text>
              <View style={styles.filterOptionsRows}>
                {[
                  { key: 'ALL', label: 'Tüm Zamanlar' },
                  { key: '3_DAYS', label: 'Son 3 Gün' },
                  { key: '1_WEEK', label: 'Son 1 Hafta' },
                ].map((interval) => (
                  <TouchableOpacity
                    key={interval.key}
                    style={[styles.filterOption, dateInterval === interval.key && styles.filterOptionActive]}
                    onPress={() => setDateInterval(interval.key)}
                  >
                    <Text style={[styles.filterOptionText, dateInterval === interval.key && styles.filterOptionTextActive]}>
                      {interval.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity 
                style={styles.applyBtn} 
                onPress={() => setFilterModalVisible(false)}
              >
                <Text style={styles.applyBtnText}>Uygula</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary },
  headerBackground: { backgroundColor: colors.primary },
  contentWrapper: { flex: 1, backgroundColor: colors.background },
  appBar: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  greeting: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  notifBtn: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  notifBadge: {
    position: 'absolute', top: 12, right: 12,
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: colors.secondary,
    borderWidth: 2, borderColor: colors.primary,
    zIndex: 1,
  },
  searchSection: { 
    backgroundColor: colors.primary, 
    paddingBottom: 24, 
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  searchBarContainer: { marginHorizontal: 20, marginBottom: 16 },
  searchBarWrapper: { 
    backgroundColor: '#fff', 
    borderRadius: 20, 
    height: 60,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  searchBarInput: { fontSize: 16 },
  filterBarBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: colors.background,
    alignItems: 'center', justifyContent: 'center',
  },
  chipsScroll: { marginTop: 4 },
  chipsContent: { paddingHorizontal: 20, gap: 10 },
  chip: {
    paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  chipActive: { backgroundColor: '#fff', borderColor: '#fff' },
  chipText: { fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  chipTextActive: { color: colors.primary, fontWeight: 'bold' },
  listContent: { paddingHorizontal: 16, paddingBottom: 120 },
  filterDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
    borderWidth: 1,
    borderColor: '#fff',
  },
  loadMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginRight: 6,
  },
  listEnd: {
    padding: 20,
    alignItems: 'center',
  },
  listEndText: {
    fontSize: 12,
    color: colors.textHint,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  clearFilters: {
    fontSize: 14,
    color: colors.error,
    fontWeight: '500',
  },
  filterGroupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 15,
    marginBottom: 10,
  },
  filterOptionsRows: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.background,
    margin: 5,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterOptionText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  filterOptionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  applyBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 10,
  },
  applyBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  statsRow: { flexDirection: 'row', gap: 8, marginTop: 20, marginBottom: 4 },
  statCard: {
    flex: 1, backgroundColor: colors.surface, borderRadius: 16,
    padding: 14, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  statValue: { fontSize: 28, fontWeight: 'bold' },
  statLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: 24, marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: colors.onSurface },
  seeAll: { fontSize: 13, color: colors.primary },
  loader: { marginTop: 40 },
  errorState: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 32 },
  errorTitle: { fontSize: 18, fontWeight: 'bold', color: colors.onSurface, marginTop: 16 },
  errorSubtitle: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  retryBtn: { 
    marginTop: 20, paddingHorizontal: 20, paddingVertical: 10, 
    backgroundColor: colors.primary, borderRadius: 12 
  },
  retryBtnText: { color: '#fff', fontWeight: 'bold' },
});

export default HomeScreen;
