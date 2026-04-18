import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { Input } from '@/shared/components/Input';
import { colors } from '@/shared/theme/colors';

const LoginScreen = () => {
  const navigation = useNavigation();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Uyarı', 'Lütfen tüm alanları doldurun.');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Giriş Başarısız', result.error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Ionicons name="search" size={32} color={colors.primary} />
            </View>
            <Text style={styles.title}>Hoş Geldiniz</Text>
            <Text style={styles.subtitle}>Kayıp eşyalarını bulmaya hazır mısın?</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="E-posta"
              icon="mail-outline"
              placeholder="okulno@ogr.duzce.edu.tr"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="Şifre"
              icon="lock-closed-outline"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
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

            <TouchableOpacity style={styles.forgotPass}>
              <Text style={styles.forgotPassText}>Şifremi Unuttum?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginBtn, loading && styles.disabledBtn]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginBtnText}>Giriş Yap</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Hesabınız yok mu? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Kayıt Ol</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
  header: { alignItems: 'center', marginTop: 60, marginBottom: 40 },
  logoBadge: {
    width: 64, height: 64, borderRadius: 20,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 28, fontWeight: 'bold', color: colors.onSurface },
  subtitle: { fontSize: 16, color: colors.textSecondary, marginTop: 8, textAlign: 'center' },
  form: { width: '100%' },
  forgotPass: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotPassText: { color: colors.primary, fontSize: 14, fontWeight: '600' },
  loginBtn: {
    height: 56, backgroundColor: colors.primary,
    borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
  },
  disabledBtn: { opacity: 0.7 },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  footer: {
    flexDirection: 'row', justifyContent: 'center',
    marginTop: 40, alignItems: 'center',
  },
  footerText: { fontSize: 14, color: colors.textSecondary },
  registerLink: { fontSize: 14, color: colors.primary, fontWeight: 'bold' },
});

export default LoginScreen;
