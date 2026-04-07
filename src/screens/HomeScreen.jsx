import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  TextInput, ScrollView, SafeAreaView, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import useAuth from '../hooks/useAuth';
import useItems from '../hooks/useItems';
import ItemCard from '../components/ItemCard';
import { colors } from '../theme/colors';
import { timeAgo } from '../utils/timeAgo';

const FILTERS = [
  { key: 'ALL', label: 'Tümü' },
  { key: 'LOST', label: '🔴 Kayıp' },
  { key: 'FOUND', label: '🟢 Bulunan' },
];

const HomeScreen = () => {
  const navigation = useNavigation();
  const { userProfile } = useAuth();
  const { filteredItems, loading, activeFilter, searchQuery, setFilter, setSearchQuery, fetchStats } = useItems();
  const [stats, setStats] = useState({ lostCount: 0, foundCount: 0, todayCount: 0 });

  useEffect(() => {
    const loadStats = async () => {
      const result = await fetchStats();
      if (result.success) setStats(result.data);
    };
    loadStats();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* AppBar */}
      <View style={styles.appBar}>
        <View>
          <Text style={styles.greeting}>Merhaba 👋</Text>
          <Text style={styles.userName}>{userProfile?.name || 'Kullanıcı'}</Text>
        </View>
        <TouchableOpacity style={styles.notifBtn}>
          <Ionicons name="notifications-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={colors.textHint} />
          <TextInput
            style={styles.searchInput}
            placeholder="Eşya veya konum ara..."
            placeholderTextColor={colors.textHint}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textHint} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
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

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={() => (
          <>
            {/* Stats Row */}
            <View style={styles.statsRow}>
              {[
                { label: 'Aktif Kayıp', value: stats.lostCount, color: colors.lostColor },
                { label: 'Bulunan', value: stats.foundCount, color: colors.foundColor },
                { label: 'Bugün', value: stats.todayCount, color: colors.primary },
              ].map((stat) => (
                <View key={stat.label} style={styles.statCard}>
                  <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Son İlanlar</Text>
              <Text style={styles.seeAll}>Tümünü Gör</Text>
            </View>
          </>
        )}
        renderItem={({ item }) => (
          <ItemCard
            item={item}
            onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}
          />
        )}
        ListEmptyComponent={() =>
          loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
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
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  searchContainer: { backgroundColor: colors.primary, paddingBottom: 20, paddingHorizontal: 16 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 14,
    paddingHorizontal: 14, height: 48, marginBottom: 14,
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.onSurface },
  chipsScroll: { flexDirection: 'row' },
  chip: {
    paddingHorizontal: 18, paddingVertical: 8,
    borderRadius: 20, marginRight: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  chipActive: { backgroundColor: '#fff' },
  chipText: { fontSize: 13, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },
  chipTextActive: { color: colors.primary },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
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
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 64 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: colors.onSurface, marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: 8 },
});

export default HomeScreen;
