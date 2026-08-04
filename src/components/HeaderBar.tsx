import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Appbar, Text } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useAppSelector } from '../store';

interface HeaderBarProps {
  title: string;
  subtitle?: string;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({ title, subtitle }) => {
  const settings = useAppSelector((state) => state.settings.settings);

  return (
    <Appbar.Header style={styles.header}>
      <View style={styles.iconBadge}>
        <MaterialCommunityIcons name="store-cog-outline" size={22} color="#F97316" />
      </View>
      <Appbar.Content
        title={<Text style={styles.title}>{title}</Text>}
        subtitle={
          <Text style={styles.subtitle}>
            {subtitle || settings.storeName || 'Ram Stores POS'}
          </Text>
        }
      />
    </Appbar.Header>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#FED7AA',
    elevation: 4,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    paddingHorizontal: 12,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    elevation: 2,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
  },
  title: {
    color: '#1E293B',
    fontWeight: 'bold',
    fontSize: 20,
    letterSpacing: 0.5,
  },
  subtitle: {
    color: '#F97316',
    fontSize: 12,
    fontWeight: '600',
  },
});
