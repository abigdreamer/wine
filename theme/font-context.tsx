import React, { createContext, useContext, useState, useEffect } from 'react';
import { getConfig } from '../store/config-storage';

export type FontType = 'helvetica' | 'roboto' | 'openSans' | 'patrickHand';

interface FontContextType {
  currentFont: FontType;
  setFont: (font: FontType) => void;
  textStyles: {
    regular: { fontFamily: string };
    bold: { fontFamily: string };
    title: { fontFamily: string; fontSize: number };
    subtitle: { fontFamily: string; fontSize: number };
    body: { fontFamily: string; fontSize: number };
    button: { fontFamily: string; fontSize: number };
    caption: { fontFamily: string; fontSize: number };
  };
}

const fontMapping = {
  helvetica: {
    regular: 'Helvetica',
    bold: 'Helvetica-Bold'
  },
  roboto: {
    regular: 'Roboto-Regular',
    bold: 'Roboto-Bold'
  },
  openSans: {
    regular: 'OpenSans-Regular',
    bold: 'OpenSans-Bold'
  },
  patrickHand: {
    regular: 'Patrick Hand',
    bold: 'Patrick Hand' // Patrick Hand only has regular weight
  }
};

const FontContext = createContext<FontContextType | undefined>(undefined);

export function FontProvider({ children }: { children: React.ReactNode }) {
  const [currentFont, setCurrentFont] = useState<FontType>('helvetica');

  useEffect(() => {
    loadStoredFont();
  }, []);

  const loadStoredFont = async () => {
    try {
      const config = await getConfig();
      if (config?.font) {
        setCurrentFont(config.font as FontType);
      }
    } catch (error) {
      console.error('Error loading stored font:', error);
    }
  };

  const setFont = (font: FontType) => {
    setCurrentFont(font);
  };

  const currentFontFamily = fontMapping[currentFont];
  
  const textStyles = {
    regular: { fontFamily: currentFontFamily.regular },
    bold: { fontFamily: currentFontFamily.bold },
    title: { fontFamily: currentFontFamily.bold, fontSize: 28 },
    subtitle: { fontFamily: currentFontFamily.regular, fontSize: 16 },
    body: { fontFamily: currentFontFamily.regular, fontSize: 16 },
    button: { fontFamily: currentFontFamily.bold, fontSize: 16 },
    caption: { fontFamily: currentFontFamily.regular, fontSize: 14 }
  };

  return (
    <FontContext.Provider value={{ currentFont, setFont, textStyles }}>
      {children}
    </FontContext.Provider>
  );
}

export function useFont() {
  const context = useContext(FontContext);
  if (context === undefined) {
    throw new Error('useFont must be used within a FontProvider');
  }
  return context;
}
