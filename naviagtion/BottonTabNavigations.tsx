import { Home, MessageSquare, History, User } from "lucide-react-native";
import React from "react";
import { useTheme } from "../theme/theme-context";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';

import { MainRoutes } from '../types/navigation';
import HomeScreen from '../screens/Home';
import HistoryScreen from '../screens/History';
import SessionsScreen from '../screens/Sessions';
import ProfileScreen from '../screens/Profile';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigation() {
    const { colors } = useTheme();
    const { t } = useTranslation();

    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textSecondary,
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                },
                headerShown: false,
            }}
        >
            <Tab.Screen
                name={MainRoutes.Home} 
                component={HomeScreen}
                options={{
                    title: t('navigation.home'),
                    tabBarIcon: ({ color }) => <Home size={24} color={color} />,
                }}
            />
            <Tab.Screen 
                name={MainRoutes.History} 
                component={HistoryScreen}
                options={{
                    title: t('navigation.history'),
                    tabBarIcon: ({ color }) => <History size={24} color={color} />,
                }}
            />
            <Tab.Screen 
                name={MainRoutes.Profile} 
                component={ProfileScreen}
                options={{
                    title: t('navigation.profile'),
                    tabBarIcon: ({ color }) => <User size={24} color={color} />,
                }}
            />
            <Tab.Screen 
                name={MainRoutes.Sessions} 
                component={SessionsScreen} 
                options={{
                    title: t('navigation.sessions'),
                    tabBarIcon: ({ color }) => <MessageSquare size={24} color={color} />,
                }}
            />
        </Tab.Navigator>
    )
}