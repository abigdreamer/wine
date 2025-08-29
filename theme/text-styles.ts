import { StyleSheet } from 'react-native';
import { useFont } from './font-context';

export function useTextStyles() {
  const { textStyles } = useFont();

  return StyleSheet.create({
    h1: {
      ...textStyles.bold,
      fontSize: 26,
    },
    h2: {
      ...textStyles.bold,
      fontSize: 22,
    },
    h3: {
      ...textStyles.bold,
      fontSize: 18,
    },
    body: {
      ...textStyles.regular,
      fontSize: 16,
    },
    bodyBold: {
      ...textStyles.bold,
      fontSize: 16,
    },
    caption: {
      ...textStyles.regular,
      fontSize: 14,
    },
    captionBold: {
      ...textStyles.bold,
      fontSize: 14,
    },
    small: {
      ...textStyles.regular,
      fontSize: 12,
    },
  });
}
