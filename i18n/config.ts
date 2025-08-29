import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { Platform, NativeModules } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import translations
import en from './locales/en.json';
import es from './locales/es.json';

const getDeviceLanguage = () => {
  try {
    // Get device language for iOS
    if (Platform.OS === 'ios') {
      const locale = 
        NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] || // iOS 13 and earlier
        NativeModules.SettingsManager?.settings?.AppleLocale || // iOS 14 and later
        'en'; // fallback to English
      return locale.split('_')[0];
    }
    
    // Get device language for Android
    if (Platform.OS === 'android') {
      const locale = NativeModules.I18nManager?.localeIdentifier || 'en';
      return locale.split('_')[0];
    }

    return 'en'; // Default fallback
  } catch (error) {
    console.warn('Error getting device language:', error);
    return 'en'; // Default fallback
  }
};

const initI18n = async () => {
  try {
    // Get saved language from config storage
    const config = await AsyncStorage.getItem('userConfig');
    const savedConfig = config ? JSON.parse(config) : null;
    const savedLanguage = savedConfig?.language;
    
    await i18n
      .use(initReactI18next)
      .init({
        resources: {
          en: { translation: en },
          es: { translation: es }
        },
        fallbackLng: 'en',
        lng: savedLanguage || getDeviceLanguage(),
        supportedLngs: ['en', 'es'],
        interpolation: {
          escapeValue: false
        },
        react: {
          useSuspense: false,
          bindI18n: 'languageChanged'
        }
      });

    // Force update on language change
    i18n.on('languageChanged', () => {
      // This will trigger a re-render in components using useTranslation
      console.log('Language changed to:', i18n.language);
    });

  } catch (error) {
    console.warn('Error initializing i18n:', error);
  }
};

initI18n();

export default i18n;
