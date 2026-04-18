import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../hooks/useAuth';
import { colors } from '@/shared/theme/colors';
import { Input } from '@/shared/components/Input';

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const { userProfile, updateProfile, loading } = useAuth();

  const [name, setName] = useState(userProfile?.name || '');
  const [department, setDepartment] = useState(userProfile?.department || '');
  const [studentId, setStudentId] = useState(userProfile?.studentId || '');
  const [phoneNumber, setPhoneNumber] = useState(userProfile?.phoneNumber || '');
  const [imageUri, setImageUri] = useState(null);
  const [errors, setErrors] = useState({});

  const pickImage = async () => {
    console.log('[ImagePicker] Profile picker başlatılıyor...');
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İzin Gerekli', 'Fotoğraf seçmek için galeri izni gerekli.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      if (!result.canceled) {
        console.log('[ImagePicker] Fotoğraf seçildi:', result.assets[0].uri);
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('[ImagePicker] Hata:', error);
      Alert.alert('Hata', 'Galeri açılırken bir sorun oluştu.');
    }
  };

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = 'Ad soyad alanı boş bırakılamaz';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const updates = {
      name: name.trim(),
      department: department.trim(),
      studentId: studentId.trim(),
      phoneNumber: phoneNumber.trim(),
    };

    const result = await updateProfile(updates, imageUri);
    if (result.success) {
      Alert.alert('Başarılı ✨', 'Profilin güncellendi.', [
        { text: 'Tamam', onPress: () => navigation.goBack() },
      ]);
    } else {
      Alert.alert('Hata', result.error || 'Profil güncellenirken bir hata oluştu.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[colors.primary, '#4f46e5']}
        style={styles.headerGradient}
      >
        <View style={styles.headerNav}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profili Düzenle</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.avatarWrapper}>
          <TouchableOpacity style={styles.avatarMain} onPress={pickImage}>
            {imageUri || userProfile?.profilePicture ? (
              <Image 
                source={{ uri: imageUri || userProfile?.profilePicture }} 
                style={styles.avatarImg} 
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {userProfile?.name?.charAt(0).toUpperCase() || 'K'}
                </Text>
              </View>
            )}
            <View style={styles.editBadge}>
              <Ionicons name="camera" size={18} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Kişisel Bilgiler</Text>
          <Input
            label="Ad Soyad"
            placeholder="Adınızı ve soyadınızı girin"
            value={name}
            onChangeText={setName}
            error={errors.name}
            icon="person-outline"
          />

          <Input
            label="Bölüm"
            placeholder="Örn: Bilgisayar Mühendisliği"
            value={department}
            onChangeText={setDepartment}
            icon="business-outline"
          />

          <Input
            label="Öğrenci Numarası"
            placeholder="Örn: 20210001"
            value={studentId}
            onChangeText={setStudentId}
            icon="card-outline"
            keyboardType="numeric"
          />

          <Input
            label="Telefon Numarası"
            placeholder="Örn: 05xx xxx xx xx"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            icon="call-outline"
            keyboardType="phone-pad"
          />

          <TouchableOpacity 
            style={[styles.saveBtn, loading && styles.disabledBtn]} 
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.saveBtnText}>Değişiklikleri Kaydet</Text>
                <Ionicons name="sparkles" size={18} color="#fff" style={{ marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="shield-checkmark-outline" size={20} color={colors.textHint} />
          <Text style={styles.infoText}>
            Bilgileriniz sadece eşya eşleşmelerinde ve güvenli iletişimde kullanılır.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary },
  headerGradient: {
    paddingTop: 10,
    paddingBottom: 40,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  headerNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarWrapper: { alignItems: 'center' },
  avatarMain: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: '#fff', padding: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15, shadowRadius: 15, elevation: 12,
  },
  avatarImg: { width: '100%', height: '100%', borderRadius: 55 },
  avatarPlaceholder: {
    width: '100%', height: '100%', borderRadius: 55,
    backgroundColor: colors.avatarBg,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 40, fontWeight: 'bold', color: colors.primary },
  editBadge: {
    position: 'absolute', bottom: 4, right: 4,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.secondary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: '#fff',
  },
  content: { padding: 20, paddingBottom: 60 },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 24, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05, shadowRadius: 10, elevation: 4,
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: colors.primary, marginBottom: 20, letterSpacing: 0.5 },
  saveBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    height: 56, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 24,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
  },
  disabledBtn: { opacity: 0.7 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  infoBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 16, padding: 16, marginTop: 24,
    gap: 12,
  },
  infoText: { flex: 1, fontSize: 12, color: colors.textSecondary, lineHeight: 18 },
});

export default EditProfileScreen;
