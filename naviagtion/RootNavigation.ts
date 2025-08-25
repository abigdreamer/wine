import { createNavigationContainerRef, StackActions } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export const navigate = (name: string, params = {}) => {
  const interval = setInterval(() => {
    if (navigationRef.isReady()) {
      clearInterval(interval);
      //@ts-ignore
      return navigationRef.dispatch(
        StackActions.replace(name, params)
      );
    }
  }, 300);
}

export const currentScreen = () => {
  if (navigationRef.isReady()) {
    return navigationRef.getCurrentRoute()?.name;
  }
}