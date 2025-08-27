import AsyncStorage from "@react-native-async-storage/async-storage";

export type UserConfig = {
  personality?: string;
  language?: string;
  name?: string;
  website?: string;
};

const CONFIG_KEY = "userConfig";

export const saveConfig = async (newConfig: Partial<UserConfig>) => {
  try {
    const existing = await AsyncStorage.getItem(CONFIG_KEY);
    const parsed: UserConfig = existing ? JSON.parse(existing) : {};
    const updated = { ...parsed, ...newConfig };
    await AsyncStorage.setItem(CONFIG_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save config", e);
  }
};

export const getConfig = async (): Promise<UserConfig | null> => {
  try {
    const data = await AsyncStorage.getItem(CONFIG_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error("Failed to load config", e);
    return null;
  }
};

export const clearConfig = async () => {
  try {
    await AsyncStorage.removeItem(CONFIG_KEY);
  } catch (e) {
    console.error("Failed to clear config", e);
  }
};
