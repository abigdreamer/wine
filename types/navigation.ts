import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";

export enum MainRoutes {
  Onboarding = "Onboarding",
  Login = "login",
  Home = "Home",
  History = "History",
  Profile = "Profile",
  Sessions = "Sessions",
  BottomTab = "BottomTab",
  LiveSession = "LiveSession",
  Preferences = "Preferences",
  FileUpload = "FileUpload",
  UserInfo = "UserInfo",
}

export type RootStackParamList = {
  [MainRoutes.Login]: undefined;
  [MainRoutes.Onboarding]: undefined;
  [MainRoutes.Home]: undefined;
  [MainRoutes.History]: undefined;
  [MainRoutes.Profile]: undefined;
  [MainRoutes.Sessions]: undefined;
  [MainRoutes.BottomTab]: undefined;
  [MainRoutes.LiveSession]: {
    id: string;
    startVoiceChat?: boolean;
  };
  [MainRoutes.Preferences]: undefined;
  [MainRoutes.FileUpload]: {
    source?: string;
  };
  [MainRoutes.UserInfo]: undefined;
  TabScreens: undefined; // Add this line
};

export type MainNavigationProp<
  RouteName extends keyof RootStackParamList = MainRoutes
> = NativeStackNavigationProp<RootStackParamList, RouteName>;

export type LoginScreenProps = {
  navigation: MainNavigationProp<MainRoutes.Login>;
};

export type OnboardingScreenProps = {
  navigation: MainNavigationProp<MainRoutes.Onboarding>;
};

export type BottomTabScreenProps = {
  navigation: MainNavigationProp<MainRoutes.BottomTab>;
};

export type HomeScreenProps = {
  navigation: MainNavigationProp<MainRoutes.Home>;
};

export type HistoryScreenProps = {
  navigation: MainNavigationProp<MainRoutes.History>;
};

export type SessionsScreenProps = {
  navigation: MainNavigationProp<MainRoutes.Sessions>;
};

export type ProfileScreenProps = {
  navigation: MainNavigationProp<MainRoutes.Profile>;
};

export type LiveSessionScreenProps = {
  navigation: MainNavigationProp<MainRoutes.LiveSession>;
  route: RouteProp<RootStackParamList, MainRoutes.LiveSession>;
};

export type PreferencesScreenProps = {
  navigation: MainNavigationProp<MainRoutes.Preferences>;
};

export type UserInfoScreenProps = {
  navigation: MainNavigationProp<MainRoutes.UserInfo>;
};

export type FileUploadScreenProps = {
  navigation: MainNavigationProp<MainRoutes.FileUpload>;
  route: RouteProp<RootStackParamList, MainRoutes.FileUpload>;
};
