import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView,
  Platform, Modal, FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import useAuth from '../hooks/useAuth';
import { colors } from '../theme/colors';

const DEPARTMENTS = [
  'Bilgisayar Mühendisliği', 'Yazılım Mühendisliği',
  'Elektrik-Elektronik Mühendisliği', 'Makine Mühendisliği',
  'İnşaat Mühendisliği', 'Endüstri Mühendisliği',
  'İşletme', 'Hukuk', 'Tıp', 'Mimarlık', 'Diğer',
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, paddingBottom: 40 },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 60,
    paddingBottom: 50,
    paddingHorizontal: 20,
  },
  backBtn: { marginBottom: 16 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#fff' },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  card: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  inputGroup: { marginBottom: 16 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.divider,
    paddingHorizontal: 14,
    height: 52,
  },
  inputError: { borderColor: colors.lostColor },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: colors.onSurface },
  errorText: { color: colors.lostColor, fontSize: 12, marginTop: 4, marginLeft: 4 },
  button: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  linkContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  linkText: { color: colors.primary, fontSize: 14 },
  linkBold: { fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '60%',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: colors.onSurface, marginBottom: 16 },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  modalItemText: { fontSize: 15, color: colors.onSurface },
  modalItemActive: { color: colors.primary, fontWeight: 'bold' },
});

/** Modül seviyesinde tanımlı — render'da yeniden oluşturulmaz, klavye/odak kaybını önler */
function RegisterField({
  icon,
  placeholder,
  field,
  keyboardType,
  secureEntry,
  children,
  form,
  errors,
  update,
}) {
  return (
    <View style={styles.inputGroup}>
      <View style={[styles.inputWrapper, errors[field] ? styles.inputError : null]}>
        <Ionicons name={icon} size={20} color={colors.textHint} style={styles.inputIcon} />
        {children || (
          <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor={colors.textHint}
            value={form[field]}
            onChangeText={(t) => update(field, t)}
            keyboardType={keyboardType || 'default'}
            autoCapitalize={field === 'email' ? 'none' : 'words'}
            secureTextEntry={secureEntry}
          />
        )}
      </View>
      {errors[field] ? <Text style={styles.errorText}>{errors[field]}</Text> : null}
    </View>
  );
}

const RegisterScreen = () => {
  const navigation = useNavigation();
  const { register, loading } = useAuth();
  const [form, setForm] = useState({ name: '', studentId: '', department: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [deptModal, setDeptModal] = useState(false);
  const [errors, setErrors] = useState({});

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 3) e.name = 'Ad Soyad gerekli';
    if (!form.studentId.trim()) e.studentId = 'Öğrenci numarası gerekli';
    if (!form.department) e.department = 'Bölüm seçin';
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Geçerli e-posta girin';
    if (form.password.length < 6) e.password = 'En az 6 karakter';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    const result = await register(form.email.trim(), form.password, {
      name: form.name.trim(),
      studentId: form.studentId.trim(),
      department: form.department,
    });
    if (!result.success) Alert.alert('Kayıt Hatası', result.error);
  };

  const fieldProps = { form, errors, update };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hesap Oluştur</Text>
          <Text style={styles.headerSubtitle}>KampüsBul ailesine katıl 🎓</Text>
        </View>

        <View style={styles.card}>
          <RegisterField icon="person-outline" placeholder="Ad Soyad" field="name" {...fieldProps} />
          <RegisterField icon="card-outline" placeholder="Öğrenci Numarası" field="studentId" keyboardType="numeric" {...fieldProps} />

          <View style={styles.inputGroup}>
            <TouchableOpacity
              style={[styles.inputWrapper, errors.department ? styles.inputError : null]}
              onPress={() => setDeptModal(true)}
            >
              <Ionicons name="school-outline" size={20} color={colors.textHint} style={styles.inputIcon} />
              <Text style={[styles.input, !form.department && { color: colors.textHint }]}>
                {form.department || 'Bölüm Seç'}
              </Text>
              <Ionicons name="chevron-down" size={18} color={colors.textHint} />
            </TouchableOpacity>
            {errors.department ? <Text style={styles.errorText}>{errors.department}</Text> : null}
          </View>

          <RegisterField icon="mail-outline" placeholder="E-posta adresi" field="email" keyboardType="email-address" {...fieldProps} />
          <RegisterField icon="lock-closed-outline" placeholder="Şifre" field="password" secureEntry={!showPassword} {...fieldProps}>
            <TextInput
              style={styles.input}
              placeholder="Şifre"
              placeholderTextColor={colors.textHint}
              value={form.password}
              onChangeText={(t) => update('password', t)}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textHint} />
            </TouchableOpacity>
          </RegisterField>

          <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Kayıt Ol</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.linkContainer}>
            <Text style={styles.linkText}>Zaten hesabın var mı? </Text>
            <Text style={[styles.linkText, styles.linkBold]}>Giriş Yap</Text>
          </TouchableOpacity>
        </View>

        <Modal visible={deptModal} transparent animationType="slide">
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setDeptModal(false)}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Bölüm Seç</Text>
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;
