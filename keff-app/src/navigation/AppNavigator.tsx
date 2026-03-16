import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from '../screens/DashboardScreen';
import ExpensesScreen from '../screens/ExpensesScreen';
import CRMScreen from '../screens/CRMScreen';
import BudgetsScreen from '../screens/BudgetsScreen';
import InvoicesScreen from '../screens/InvoicesScreen';
import SavingsScreen from '../screens/SavingsScreen';
import DebugScreen from '../screens/DebugScreen';
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
            else if (route.name === 'Savings') iconName = 'piggy-bank';
            else if (route.name === 'Budgets') iconName = 'account-cash';
            else if (route.name === 'Invoices') iconName = 'file-document';
            else if (route.name === 'Settings') iconName = 'cog';
            else if (route.name === 'Debug') iconName = 'bug';
            return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard' }} />
        <Tab.Screen name="Expenses" component={ExpensesScreen} options={{ title: 'Expenses' }} />
        <Tab.Screen name="CRM" component={CRMScreen} options={{ title: 'CRM' }} />
      <Tab.Screen name="Budgets" component={BudgetsScreen} options={{ title: 'Budgets' }}/>
      <Tab.Screen name="Invoices" component={InvoicesScreen} options={{ title: 'Invoices' }}/>
      <Tab.Screen name="Savings" component={SavingsScreen} options={{ title: 'Tabungan' }}/>
      <Tab.Screen name="Debug" component={DebugScreen} options={{ title: 'Debug' }}/>
        <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
