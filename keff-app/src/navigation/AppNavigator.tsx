import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from '../screens/DashboardScreen';
import ExpensesScreen from '../screens/ExpensesScreen';
import CRMScreen from '../screens/CRMScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName: keyof typeof MaterialCommunityIcons.glyphMap = 'home';
            if (route.name === 'Dashboard') iconName = 'view-dashboard';
            else if (route.name === 'Expenses') iconName = 'cash-multiple';
            else if (route.name === 'CRM') iconName = 'contacts';
            else if (route.name === 'Settings') iconName = 'cog';
            return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard' }} />
        <Tab.Screen name="Expenses" component={ExpensesScreen} options={{ title: 'Expenses' }} />
        <Tab.Screen name="CRM" component={CRMScreen} options={{ title: 'CRM' }} />
        <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
