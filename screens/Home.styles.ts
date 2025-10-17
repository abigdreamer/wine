import { StyleSheet } from 'react-native';
import { useFont } from '../theme/font-context';

export const useHomeStyles = () => {
  const { textStyles } = useFont();
  
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    header: {
      paddingHorizontal: 24,
      paddingTop: 24,
      paddingBottom: 32,
    },
    greeting: {
      ...textStyles.title,
      marginBottom: 8,
    },
    subtitle: {
      ...textStyles.body,
      lineHeight: 22,
    },
    inputCard: {
      marginHorizontal: 24,
      borderRadius: 16,
      padding: 20,
      marginBottom: 32,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    input: {
      ...textStyles.body,
      minHeight: 80,
      textAlignVertical: "top",
      marginBottom: 16,
    },
    inputActions: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    micButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: "center",
      alignItems: "center",
    },
    sendButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: "center",
      alignItems: "center",
    },
    quickActions: {
      paddingHorizontal: 24,
    },
    sectionTitle: {
      ...textStyles.title,
      marginBottom: 16,
    },
    actionCard: {
      flexDirection: "row",
      alignItems: "center",
      padding: 20,
      borderRadius: 16,
      marginBottom: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    actionIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    actionContent: {
      flex: 1,
    },
    actionTitle: {
      ...textStyles.button,
      marginBottom: 4,
    },
    actionSubtitle: {
      ...textStyles.caption,
    },
  });
};
