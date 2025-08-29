import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MainRoutes, RootStackParamList } from "../types/navigation";
import LoginScreen from "../screens/Login";
import OnboardingScreen from "../screens/Onboarding";
import BottomTabNavigation from "./BottonTabNavigations";
import LiveSessionScreen from "../screens/LiveSession";
import Preferences from "../screens/Preferences";
import UserInfo from "../screens/UserInfor";

const MainNavigation = () => {
  const Stack = createNativeStackNavigator<RootStackParamList>();

  return (
    <Stack.Navigator
      initialRouteName={MainRoutes.BottomTab}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name={MainRoutes.Login} component={LoginScreen} />
      <Stack.Screen name={MainRoutes.Preferences} component={Preferences} />
      <Stack.Screen name={MainRoutes.UserInfo} component={UserInfo} />
      <Stack.Screen name={MainRoutes.Onboarding} component={OnboardingScreen} />
      <Stack.Screen
        name={MainRoutes.BottomTab}
        component={BottomTabNavigation}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={MainRoutes.LiveSession}
        component={LiveSessionScreen}
      />
    </Stack.Navigator>
  );
};

export default MainNavigation;
