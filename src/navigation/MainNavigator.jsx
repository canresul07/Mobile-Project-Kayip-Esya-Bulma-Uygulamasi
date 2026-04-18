import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { colors } from '@/shared/theme/colors';

// Screen Imports
import HomeScreen from '@/features/items/screens/HomeScreen';
import AddItemScreen from '@/features/items/screens/AddItemScreen';
import ProfileScreen from '@/features/auth/screens/ProfileScreen';
import EditProfileScreen from '@/features/auth/screens/EditProfileScreen';
import ItemDetailScreen from '@/features/items/screens/ItemDetailScreen';
import ChatListScreen from '@/features/chat/screens/ChatListScreen';
import ChatSessionScreen from '@/features/chat/screens/ChatSessionScreen';
import ChatUserDetailScreen from '@/features/chat/screens/ChatUserDetailScreen';
import UserSearchScreen from '@/features/chat/screens/UserSearchScreen';
import NotificationScreen from '../features/notifications/screens/NotificationScreen';

const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textHint,
      tabBarStyle: {
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        position: 'absolute',
        borderTopColor: 'transparent',
        height: Platform.OS === 'ios' ? 88 : 72,
        paddingBottom: Platform.OS === 'ios' ? 32 : 12,
        paddingTop: 8,
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      tabBarLabelStyle: {
        fontSize: 11,
        fontWeight: 'bold',
      },
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        if (route.name === 'HomeTab') iconName = focused ? 'home' : 'home-outline';
        else if (route.name === 'ChatTab') iconName = focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline';
        else if (route.name === 'AddTab') iconName = focused ? 'add-circle' : 'add-circle-outline';
        else if (route.name === 'ProfileTab') iconName = focused ? 'person' : 'person-outline';
        return <Ionicons name={iconName} size={size + 2} color={color} />;
      },
    })}
  >
    <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: 'Ana Sayfa' }} />
    <Tab.Screen name="ChatTab" component={ChatListScreen} options={{ title: 'Sohbet' }} />
    <Tab.Screen name="AddTab" component={AddItemScreen} options={{ title: 'İlan Ver' }} />
    <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Profilim' }} />
  </Tab.Navigator>
);

const MainNavigator = () => (
  <RootStack.Navigator screenOptions={{ headerShown: false }}>
    <RootStack.Screen name="TabMain" component={TabNavigator} />
    <RootStack.Screen 
      name="ItemDetail" 
      component={ItemDetailScreen} 
      options={{ animation: 'slide_from_right' }}
    />
    <RootStack.Screen 
      name="ChatSession" 
      component={ChatSessionScreen} 
      options={{ animation: 'slide_from_right' }}
    />
    <RootStack.Screen 
      name="ChatUserDetail" 
      component={ChatUserDetailScreen} 
      options={{ presentation: 'modal' }}
    />
    <RootStack.Screen 
      name="UserSearch" 
      component={UserSearchScreen} 
      options={{ presentation: 'modal', headerTitle: 'Yeni Mesaj' }}
    />
    <RootStack.Screen 
      name="Notifications" 
      component={NotificationScreen} 
      options={{ animation: 'slide_from_bottom', headerTitle: 'Bildirimler' }}
    />
    <RootStack.Screen 
      name="EditProfile" 
      component={EditProfileScreen} 
      options={{ animation: 'slide_from_right' }}
    />
  </RootStack.Navigator>
);

export default MainNavigator;
