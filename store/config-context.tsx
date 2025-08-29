import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { UserConfig, getConfig, saveConfig } from './config-storage';
import { useTheme } from '../theme/theme-context';

interface ConfigContextType {
  config: UserConfig | null;
  loading: boolean;
  saveUserConfig: (newConfig: Partial<UserConfig>) => Promise<void>;
  isConfigured: boolean;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

interface ConfigProviderProps {
  children: ReactNode;
}

export const ConfigProvider = ({ children }: ConfigProviderProps) => {
  const [config, setConfig] = useState<UserConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const { colors } = useTheme();

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const savedConfig = await getConfig();
      setConfig(savedConfig);
    } catch (error) {
      console.error('Error loading config:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveUserConfig = async (newConfig: Partial<UserConfig>) => {
    try {
      await saveConfig(newConfig);
      setConfig(prev => ({ ...prev, ...newConfig }));
    } catch (error) {
      console.error('Error saving config:', error);
      throw error; // Re-throw to handle in UI
    }
  };

  // Check if essential config is set
  const isConfigured = Boolean(
    config?.name &&
    config?.website
  );

  return (
    <ConfigContext.Provider
      value={{
        config,
        loading,
        saveUserConfig,
        isConfigured,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};
