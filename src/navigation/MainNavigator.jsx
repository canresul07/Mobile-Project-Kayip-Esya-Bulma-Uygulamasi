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
import ItemDetailScreen from '@/features/items/screens/ItemDetailScreen';
import ChatListScreen from '@/features/chat/screens/ChatListScreen';
import ChatSessionScreen from '@/features/chat/screens/ChatSessionScreen';
import ChatUserDetailScreen from '@/features/chat/screens/ChatUserDetailScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const ChatStack = createNativeStackNavigator();

const HomeStackNavigator = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="HomeMain" component={HomeScreen} />
    <HomeStack.Screen
      name="ItemDetail"
      component={ItemDetailScreen}
      options={{ animation: 'slide_from_right' }}
    />
  </HomeStack.Navigator>
);

const ChatStackNavigator = () => (
  <ChatStack.Navigator screenOptions={{ headerShown: false }}>
    <ChatStack.Screen name="ChatList" component={ChatListScreen} />
    <ChatStack.Screen 
      name="ChatSession" 
      component={ChatSessionScreen} 
      options={{ animation: 'slide_from_right' }}
    />
    <ChatStack.Screen 
      name="ChatUserDetail" 
      component={ChatUserDetailScreen} 
      options={{ presentation: 'modal' }}
    />
  </ChatStack.Navigator>
);

const MainNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textHint,
      tabBarStyle: {
        backgroundColor: colors.surface,
        borderTopColor: colors.divider,
        borderTopWidth: 1,
        height: Platform.OS === 'ios' ? 88 : 64,
        paddingBottom: Platform.OS === 'ios' ? 28 : 8,
        paddingTop: 8,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
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
    <Tab.Screen name="HomeTab" component={HomeStackNavigator} options={{ title: 'Ana Sayfa' }} />
    <Tab.Screen name="ChatTab" component={ChatStackNavigator} options={{ title: 'Sohbet' }} />
    <Tab.Screen name="AddTab" component={AddItemScreen} options={{ title: 'İlan Ver' }} />
    <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Profilim' }} />
  </Tab.Navigator>
);

export default MainNavigator;
