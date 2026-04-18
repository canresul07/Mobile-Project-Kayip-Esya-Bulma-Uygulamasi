import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/shared/theme/colors';

const ChatUserDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user: initialUser } = route.params;
  const [fullUser, setFullUser] = React.useState(initialUser);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const fetchUser = async () => {
      if (initialUser.uid && (!initialUser.studentId || !initialUser.email)) {
        setLoading(true);
        try {
          // Import service inside useEffect to avoid complexity if not ready
          const { getUserProfile } = require('@/features/auth/services/authService');
          const result = await getUserProfile(initialUser.uid);
          if (result.success) {
            setFullUser({ ...initialUser, ...result.data });
          }
        } catch (err) {
          console.log('Error fetching user profile:', err);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchUser();
  }, [initialUser]);

  const initials = fullUser.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '??';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="close" size={28} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kullanıcı Bilgileri</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            {fullUser.profilePicture ? (
              <Image source={{ uri: fullUser.profilePicture }} style={styles.avatarImg} />
            ) : (
              <Text style={styles.avatarText}>{initials}</Text>
            )}
          </View>
          <Text style={styles.userName}>{fullUser.name}</Text>
          <Text style={styles.userDept}>{fullUser.department || 'Öğrenci'}</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginBottom: 20 }} />
        ) : (
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <View style={styles.iconBox}>
                <Ionicons name="school-outline" size={22} color={colors.primary} />
              </View>
              <View style={styles.infoTextWrapper}>
                <Text style={styles.infoLabel}>Bölüm</Text>
                <Text style={styles.infoValue}>{fullUser.department || 'Belirtilmemiş'}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.iconBox}>
                <Ionicons name="card-outline" size={22} color={colors.primary} />
              </View>
              <View style={styles.infoTextWrapper}>
                <Text style={styles.infoLabel}>Öğrenci No</Text>
                <Text style={styles.infoValue}>{fullUser.studentId || 'Belirtilmemiş'}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.iconBox}>
                <Ionicons name="mail-outline" size={22} color={colors.primary} />
              </View>
              <View style={styles.infoTextWrapper}>
                <Text style={styles.infoLabel}>E-posta</Text>
                <Text style={styles.infoValue}>{fullUser.email || 'Gizli'}</Text>
              </View>
            </View>
          </View>
        )}

        <TouchableOpacity 
          style={styles.actionBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.actionBtnText}>Sohbete Dön</Text>
        </TouchableOpacity>
      </ScrollView>
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
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: colors.onSurface },
  backBtn: { padding: 4 },
  content: { padding: 20 },
  profileCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 32,
    borderRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8,
  },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  userName: { fontSize: 24, fontWeight: 'bold', color: colors.onSurface, marginBottom: 4 },
  userDept: { fontSize: 15, color: colors.textSecondary },
  infoSection: {
    backgroundColor: colors.surface,
    padding: 24,
    borderRadius: 32,
    gap: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03, shadowRadius: 12, elevation: 2,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  iconBox: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: colors.background,
    alignItems: 'center', justifyContent: 'center',
  },
  infoTextWrapper: { marginLeft: 16 },
  infoLabel: { fontSize: 12, color: colors.textHint, marginBottom: 2 },
  infoValue: { fontSize: 16, fontWeight: '600', color: colors.onSurface },
  actionBtn: {
    marginTop: 32,
    backgroundColor: colors.secondary,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.secondary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
  },
  avatarImg: { width: '100%', height: '100%', borderRadius: 50 },
  actionBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default ChatUserDetailScreen;
