import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, IconButton } from 'react-native-paper';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description }) => {
  return (
    <View style={styles.container}>
      <IconButton icon={icon} size={64} iconColor="#FDBA74" />
      <Text variant="titleMedium" style={styles.title}>
        {title}
      </Text>
      <Text variant="bodyMedium" style={styles.description}>
        {description}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontWeight: 'bold',
    color: '#64748B',
    marginTop: 8,
  },
  description: {
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
  },
});
