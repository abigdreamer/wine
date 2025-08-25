import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import { ThemeProvider } from './store/theme-store';
import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from './naviagtion/RootNavigation';
import MainNavigation from './naviagtion/MainNavigation';
import { AuthProvider } from "./store/auth-store";
import { QuestionsProvider } from "./store/question-store";

function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <QuestionsProvider>
            <NavigationContainer ref={navigationRef}>
              <MainNavigation />
            </NavigationContainer>
          </QuestionsProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default App;
