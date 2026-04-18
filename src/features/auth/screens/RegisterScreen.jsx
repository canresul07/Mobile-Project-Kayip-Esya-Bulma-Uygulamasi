import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { Input } from '@/shared/components/Input';
import { colors } from '@/shared/theme/colors';

const DEPARTMENTS = [
  'Bilgisayar Mühendisliği',
  'Yazılım Mühendisliği',
  'Elektrik-Elektronik Mühendisliği',
  'Makine Mühendisliği',
  'İnşaat Mühendisliği',
  'Endüstri Mühendisliği',
  'İşletme',
  'Hukuk',
  'Tıp',
  'Mimarlık',
  'Diğer',
];

const RegisterScreen = () => {
  const navigation = useNavigation();
  const { register } = useAuth();
  
  const [form, setForm] = useState({ 
    name: '', 
    studentId: '', 
    department: '', 
    email: '', 
    password: '' 
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [deptModal, setDeptModal] = useState(false);
  const [errors, setErrors] = useState({});

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 3) e.name = 'Ad Soyad çok kısa';
    if (!form.studentId.trim()) e.studentId = 'Öğrenci numarası gerekli';
    if (!form.department) e.department = 'Bölüm seçin';
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Geçerli e-posta girin';
    if (form.password.length < 6) e.password = 'Şifre en az 6 karakter olmalı';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    
    setLoading(true);
    const result = await register(form.email.trim(), form.password, {
      name: form.name.trim(),
      studentId: form.studentId.trim(),
      department: form.department,
    });
    setLoading(false);

    if (!result.success) {
      Alert.alert('Kayıt Hatası', result.error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={colors.onPrimary} />
            </TouchableOpacity>
            <Text style={styles.title}>Hesap Oluştur</Text>
            <Text style={styles.subtitle}>KampüsBul ailesine katıl 🎓</Text>
          </View>

          <View style={styles.formCard}>
            <Input
              label="Ad Soyad"
              placeholder="Ad Soyad"
              icon="person-outline"
              value={form.name}
              onChangeText={(t) => update('name', t)}
              error={errors.name}
            />

            <Input
              label="Öğrenci Numarası"
              placeholder="Öğrenci Numarası"
              icon="card-outline"
              value={form.studentId}
              onChangeText={(t) => update('studentId', t)}
              keyboardType="numeric"
              error={errors.studentId}
            />

            <TouchableOpacity
              style={[styles.picker, !!errors.department && styles.pickerError]}
              onPress={() => setDeptModal(true)}
            >
              <Ionicons name="school-outline" size={20} color={colors.textHint} />
              <Text style={[styles.pickerText, !form.department && { color: colors.textHint }]}>
                {form.department || 'Bölüm Seç'}
              </Text>
              <Ionicons name="chevron-down" size={18} color={colors.textHint} />
            </TouchableOpacity>
            {errors.department && <Text style={styles.errorLabel}>{errors.department}</Text>}

            <Input
              label="E-posta"
              placeholder="okulno@ogr.duzce.edu.tr"
              icon="mail-outline"
              value={form.email}
              onChangeText={(t) => update('email', t)}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />

            <Input
              label="Şifre"
              placeholder="••••••••"
              icon="lock-closed-outline"
              value={form.password}
              onChangeText={(t) => update('password', t)}
              secureTextEntry={!showPassword}
              error={errors.password}
              rightElement={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.textHint}
                  />
                </TouchableOpacity>
              }
            />

            <TouchableOpacity
              style={[styles.registerBtn, loading && styles.disabledBtn]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.registerBtnText}>Kayıt Ol</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Zaten hesabın var mı? </Text>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.loginLink}>Giriş Yap</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        <Modal visible={deptModal} transparent animationType="slide">
          <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPress={() => setDeptModal(false)}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Bölüm Seç</Text>
                <TouchableOpacity onPress={() => setDeptModal(false)}>
                  <Ionicons name="close" size={24} color={colors.onSurface} />
                </TouchableOpacity>
              </View>
              <FlatList
                data={DEPARTMENTS}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => { update('department', item); setDeptModal(false); }}
                  >
                    <Text style={[styles.modalItemText, form.department === item && styles.modalItemActive]}>
                      {item}
                    </Text>
                    {form.department === item && <Ionicons name="checkmark" size={18} color={colors.primary} />}
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary },
  scrollContent: { paddingBottom: 40 },
  header: { paddingHorizontal: 24, paddingVertical: 20 },
  backBtn: { marginBottom: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  formCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 40,
    flex: 1,
    minHeight: 600,
  },
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.divider,
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 16,
  },
  pickerError: { borderColor: colors.lostColor },
  pickerText: { flex: 1, marginLeft: 10, fontSize: 15, color: colors.onSurface },
  errorLabel: { color: colors.lostColor, fontSize: 12, marginTop: -12, marginBottom: 16, marginLeft: 4 },
  registerBtn: {
    height: 56, backgroundColor: colors.secondary,
    borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    marginTop: 10,
    shadowColor: colors.secondary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
  },
  disabledBtn: { opacity: 0.7 },
  registerBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  footer: {
    flexDirection: 'row', justifyContent: 'center',
    marginTop: 30, alignItems: 'center',
  },
  footerText: { fontSize: 14, color: colors.textSecondary },
  loginLink: { fontSize: 14, color: colors.primary, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    maxHeight: '70%',
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: colors.onSurface },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  modalItemText: { fontSize: 16, color: colors.onSurface },
  modalItemActive: { color: colors.primary, fontWeight: 'bold' },
});

export default RegisterScreen;
