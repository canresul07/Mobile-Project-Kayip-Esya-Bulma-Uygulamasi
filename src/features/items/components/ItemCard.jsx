import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/shared/theme/colors';
import { timeAgo } from '@/shared/utils/timeAgo';

/**
 * ItemCard component for displaying item summaries.
 * @param {object} props { item, onPress, onDelete }
 */
export const ItemCard = ({ item, onPress, onDelete }) => {
  const isLost = item.type === 'LOST';
  const initials = item.ownerName?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'KK';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.topRow}>
        {(item.status === 'RESOLVED' || item.isResolved) ? (
          <View style={[styles.badge, styles.badgeResolved]}>
            <Text style={[styles.badgeText, { color: colors.primary }]}>
              ● ÇÖZÜLDÜ
            </Text>
          </View>
        ) : (
          <View style={[styles.badge, isLost ? styles.badgeLost : styles.badgeFound]}>
            <Text style={[styles.badgeText, { color: isLost ? colors.lostColor : colors.foundColor }]}>
              ● {isLost ? 'KAYIP' : 'BULUNDU'}
            </Text>
          </View>
        )}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText} numberOfLines={1}>{item.category}</Text>
        </View>
        <Text style={styles.timeText}>{timeAgo(item.timestamp)}</Text>
        
        {onDelete && (
          <TouchableOpacity 
            style={styles.deleteBtn} 
            onPress={(e) => {
              e.stopPropagation();
              onDelete(item.id);
            }}
          >
            <Ionicons name="trash-outline" size={18} color={colors.lostColor} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.contentRow}>
        <View style={styles.imageContainer}>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
          ) : (
            <View style={styles.emojiContainer}>
              <Text style={styles.emoji}>{item.imageEmoji || '🎒'}</Text>
            </View>
          )}
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={12} color={colors.primary} />
            <Text style={styles.location} numberOfLines={1}>{item.location}</Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />
      <View style={styles.bottomRow}>
        <View style={styles.avatar}>
          {item.ownerPhoto ? (
            <Image source={{ uri: item.ownerPhoto }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>{initials}</Text>
          )}
        </View>
        <Text style={styles.ownerName}>{item.ownerName}</Text>
        <TouchableOpacity style={styles.contactBtn} onPress={onPress}>
          <Text style={styles.contactBtnText}>İletişim</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeLost: { backgroundColor: colors.lostBg },
  badgeFound: { backgroundColor: colors.foundBg },
  badgeText: { fontSize: 11, fontWeight: 'bold' },
  categoryBadge: {
    backgroundColor: colors.categoryBg,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, flex: 1,
  },
  categoryText: { fontSize: 11, color: colors.primary },
  timeText: { fontSize: 11, color: colors.textHint },
  deleteBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.lostBg,
    alignItems: 'center', justifyContent: 'center',
    marginLeft: 8,
  },
  contentRow: { flexDirection: 'row', gap: 14 },
  imageContainer: { width: 80, height: 80, borderRadius: 12, overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  emojiContainer: {
    width: '100%', height: '100%',
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center', justifyContent: 'center',
  },
  emoji: { fontSize: 36 },
  textContainer: { flex: 1 },
  title: { fontSize: 16, fontWeight: 'bold', color: colors.onSurface },
  description: { fontSize: 13, color: colors.textSecondary, marginTop: 4, lineHeight: 18 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 4 },
  location: { fontSize: 12, color: colors.primary, flex: 1 },
  divider: { height: 1, backgroundColor: colors.divider, marginVertical: 12 },
  bottomRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatar: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.avatarBg,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarText: { fontSize: 11, fontWeight: 'bold', color: colors.primary },
  avatarImage: { width: '100%', height: '100%', borderRadius: 14 },
  ownerName: { flex: 1, fontSize: 12, color: colors.textSecondary },
  contactBtn: {
    paddingHorizontal: 16, paddingVertical: 6,
    borderRadius: 20, backgroundColor: colors.surfaceVariant,
    borderWidth: 1, borderColor: colors.divider,
  },
  contactBtnText: { fontSize: 12, fontWeight: 'bold', color: colors.primary },
  badgeResolved: { backgroundColor: '#E8EAF6' }, // Very light Indigo for high contrast
});

