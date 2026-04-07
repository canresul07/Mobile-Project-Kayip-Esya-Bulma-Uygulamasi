import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import useAuth from '../hooks/useAuth';
import { colors } from '../theme/colors';

const LoginScreen = () => {
  const navigation = useNavigation();
  const { login, loading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validate = () => {
    let valid = true;
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Geçerli bir e-posta girin');
      valid = false;
    } else setEmailError('');
    if (password.length < 6) {
      setPasswordError('Şifre en az 6 karakter olmalı');
      valid = false;
    } else setPasswordError('');
    return valid;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    const result = await login(email.trim(), password);
    if (!result.success) {
      Alert.alert('Giriş Hatası', result.error);
    }
    // Başarılıysa RootNavigator otomatik yönlendirecek (user state değişince)
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>🔍</Text>
          <Text style={styles.appName}>KampüsBul</Text>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          <Text style={styles.title}>Tekrar Hoş Geldin! 👋</Text>
          <Text style={styles.subtitle}>Kampüs hesabınla giriş yap</Text>

          {/* Email */}
          <View style={styles.inputGroup}>
            <View style={[styles.inputWrapper, emailError ? styles.inputError : null]}>
              <Ionicons name="mail-outline" size={20} color={colors.textHint} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="E-posta adresi"
                placeholderTextColor={colors.textHint}
                value={email}
                onChangeText={(t) => { setEmail(t); setEmailError(''); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <View style={[styles.inputWrapper, passwordError ? styles.inputError : null]}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textHint} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Şifre"
                placeholderTextColor={colors.textHint}
                value={password}
                onChangeText={(t) => { setPassword(t); setPasswordError(''); }}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textHint} />
              </TouchableOpacity>
            </View>
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
          </View>

          {/* Login Button */}
          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Giriş Yap</Text>
            )}
          </TouchableOpacity>

          {/* Register Link */}
          <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.linkContainer}>
            <Text style={styles.linkText}>Hesabın yok mu? </Text>
            <Text style={[styles.linkText, styles.linkBold]}>Kayıt Ol</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1 },
  header: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 60,
  },
  emoji: { fontSize: 48 },
  appName: { fontSize: 30, fontWeight: 'bold', color: '#fff', marginTop: 8 },
  card: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginTop: -24,
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.onSurface },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 6, marginBottom: 28 },
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
    marginTop: 12,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  linkContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  linkText: { color: colors.primary, fontSize: 14 },
  linkBold: { fontWeight: 'bold' },
});

export default LoginScreen;
