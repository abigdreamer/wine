import React, { createContext, useContext, ReactNode } from 'react';
import { ElevenLabsProvider as ElevenLabsSDKProvider } from '@elevenlabs/react-native';

interface ElevenLabsContextType {
  // You can add shared state and methods here if needed
}

const ElevenLabsContext = createContext<ElevenLabsContextType | undefined>(undefined);

interface ElevenLabsProviderProps {
  children: ReactNode;
}

export const ElevenLabsProvider: React.FC<ElevenLabsProviderProps> = ({ children }) => {
  return (
    <ElevenLabsSDKProvider>
      <ElevenLabsContext.Provider value={{}}>
        {children}
      </ElevenLabsContext.Provider>
    </ElevenLabsSDKProvider>
  );
};

export const useElevenLabs = (): ElevenLabsContextType => {
  const context = useContext(ElevenLabsContext);
  if (context === undefined) {
    throw new Error('useElevenLabs must be used within an ElevenLabsProvider');
  }
  return context;
};
