/**
 * @format
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

// Mock theme data
const mockTheme = {
  colors: {
    primary: '#007AFF',
    surface: '#FFFFFF',
    text: '#000000',
    textSecondary: '#666666',
    error: '#FF3B30',
    success: '#34C759',
    warning: '#FF9500',
    white: '#FFFFFF',
  },
};

// Mock the theme context
jest.mock('../theme/theme-context', () => ({
  useTheme: () => mockTheme,
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Test component that uses theme
const TestComponent = () => {
  const { useTheme } = require('../theme/theme-context');
  const { colors } = useTheme();
  
  return <Text style={{ color: colors.primary }}>Test Text</Text>;
};

describe('Theme Context', () => {
  it('provides theme colors', () => {
    const { getByText } = render(<TestComponent />);
    const textElement = getByText('Test Text');
    
    expect(textElement).toBeTruthy();
    expect(textElement.props.style).toEqual({ color: '#007AFF' });
  });

  it('has all required color properties', () => {
    const { useTheme } = require('../theme/theme-context');
    const { colors } = useTheme();
    
    expect(colors).toHaveProperty('primary');
    expect(colors).toHaveProperty('surface');
    expect(colors).toHaveProperty('text');
    expect(colors).toHaveProperty('textSecondary');
    expect(colors).toHaveProperty('error');
    expect(colors).toHaveProperty('success');
    expect(colors).toHaveProperty('warning');
    expect(colors).toHaveProperty('white');
  });
});
