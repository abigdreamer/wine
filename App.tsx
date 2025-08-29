import React, { useState, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from './naviagtion/RootNavigation';
import MainNavigation from './naviagtion/MainNavigation';
import i18n from './i18n/config';
import { AuthProvider } from "./store/auth-store";
import { QuestionsProvider } from "./store/question-store";
import { ApplicationProvider } from '@ui-kitten/components';
import * as eva from '@eva-design/eva';
import { ThemeProvider, useTheme } from './theme/theme-context';
import { IconProvider } from './src/services/IconProvider';
import { ConfigProvider } from './store/config-context';
import { FontProvider } from './theme/font-context';

function AppContent() {
  const { isDark } = useTheme();
  
  return (
    <ApplicationProvider {...eva} theme={isDark ? eva.dark : eva.light}>
      <SafeAreaProvider>
        <NavigationContainer ref={navigationRef}>
          <MainNavigation />
        </NavigationContainer>
      </SafeAreaProvider>
    </ApplicationProvider>
  );
}

function App() {
  return (
    <IconProvider>
      <ThemeProvider>
        <FontProvider>
          <ConfigProvider>
            <AuthProvider>
              <QuestionsProvider>
                {/* Force app-wide re-render on language change */}
                <AppContent key={i18n.language} />
              </QuestionsProvider>
            </AuthProvider>
          </ConfigProvider>
        </FontProvider>
      </ThemeProvider>
    </IconProvider>
  );
}

export default App;
