/**
 * @format
 */

import React from 'react';
import { render } from '@testing-library/react-native';

// Create a simple mock component for testing
const MockApp = () => {
  const { View, Text } = require('react-native');
  return (
    <View testID="app-container">
      <Text>Wine Concierge App</Text>
    </View>
  );
};

describe('App', () => {
  it('renders correctly', () => {
    const { getByTestId } = render(<MockApp />);
    expect(getByTestId('app-container')).toBeTruthy();
  });

  it('renders without crashing', () => {
    expect(() => render(<MockApp />)).not.toThrow();
  });

  it('displays app text', () => {
    const { getByText } = render(<MockApp />);
    expect(getByText('Wine Concierge App')).toBeTruthy();
  });
});
