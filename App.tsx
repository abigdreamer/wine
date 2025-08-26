import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from './naviagtion/RootNavigation';
import MainNavigation from './naviagtion/MainNavigation';
import { AuthProvider } from "./store/auth-store";
import { QuestionsProvider } from "./store/question-store";
import { ApplicationProvider } from '@ui-kitten/components';
import * as eva from '@eva-design/eva';
import { ThemeProvider } from './theme/theme-context';



function App() {
  return (
    <ApplicationProvider {...eva} theme={eva.light}>
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
    </ApplicationProvider>
  );
}

export default App;
