import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '@/store/auth/authStore';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { colors } from '@/shared/theme/colors';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const setLoading = useAuthStore((state) => state.setLoading);
  const [showRetry, setShowRetry] = useState(false);

  useEffect(() => {
    let timer;
    if (loading) {
      console.log('[RootNavigator] App is in loading state...');
      timer = setTimeout(() => {
        console.log('[RootNavigator] Loading timeout reached. Showing retry button.');
        setShowRetry(true);
      }, 15000);
    } else {
      console.log('[RootNavigator] Loading finished. User status:', user ? 'Logged In' : 'Logged Out');
      setShowRetry(false);
    }
    return () => clearTimeout(timer);
  }, [loading, user]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.primary }}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ color: '#fff', marginTop: 20 }}>Uygulama Hazırlanıyor...</Text>
        
        {showRetry && (
          <TouchableOpacity 
            onPress={() => {
              console.log('[RootNavigator] Manual loading bypass triggered.');
              setLoading(false);
            }}
            style={{ marginTop: 30, padding: 15, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10 }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Hala yüklenmedi mi? Devam et {'>'}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <Stack.Screen name="Main" component={MainNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
