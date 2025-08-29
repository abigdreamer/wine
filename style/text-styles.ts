import { TextStyle } from 'react-native';

export const createTextStyle = (fontFamily: string): { [key: string]: TextStyle } => ({
  regular: {
    fontFamily: `${fontFamily}-Regular`,
  },
  bold: {
    fontFamily: `${fontFamily}-Bold`,
  },
  title: {
    fontFamily: `${fontFamily}-Bold`,
    fontSize: 28,
  },
  subtitle: {
    fontFamily: `${fontFamily}-Regular`,
    fontSize: 16,
  },
  body: {
    fontFamily: `${fontFamily}-Regular`,
    fontSize: 16,
  },
  button: {
    fontFamily: `${fontFamily}-Bold`,
    fontSize: 16,
  },
  caption: {
    fontFamily: `${fontFamily}-Regular`,
    fontSize: 14,
  },
});
