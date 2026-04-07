import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';
import RootNavigator from './src/navigation/RootNavigator';
import useAuth from './src/hooks/useAuth';

const AuthProvider = ({ children }) => {
  useAuth();
  return children;
};

export default function App() {
  return (
    <>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
      <Toast />
      <StatusBar style="light" />
    </>
  );
}
