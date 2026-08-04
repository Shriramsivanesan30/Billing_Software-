import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import {
  TextInput,
  Switch,
  Button,
  Text,
  Card,
  Divider,
  Surface,
  useTheme,
} from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useAppDispatch, useAppSelector } from '../store';
import { saveSettingsAsync, updateLocalSettings } from '../store/settingsSlice';
import { requestFolderAccessPermission } from '../services/excelService';

export const SettingsScreen: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const settings = useAppSelector((state) => state.settings.settings);

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      setSaving(true);
      setSuccessMsg(null);
      await dispatch(saveSettingsAsync(settings)).unwrap();
      setSuccessMsg('Settings saved successfully!');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectFolder = async () => {
    const res = await requestFolderAccessPermission();
    if (res) {
      dispatch(
        updateLocalSettings({
          exportFolderUri: res.uri,
          exportFolderName: res.name,
        })
      );
      Alert.alert('Folder Selected', `Excel exports will be saved to:\n${res.name}`);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Store Information */}
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="store" size={24} color="#F97316" />
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Store Information
            </Text>
          </View>
          <Divider style={{ marginVertical: 10, backgroundColor: '#FED7AA' }} />

          <TextInput
            label="Store Name"
            value={settings.storeName}
            onChangeText={(txt) => dispatch(updateLocalSettings({ storeName: txt }))}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Store Address"
            value={settings.address}
            onChangeText={(txt) => dispatch(updateLocalSettings({ address: txt }))}
            mode="outlined"
            multiline
            numberOfLines={2}
            style={styles.input}
          />

          <TextInput
            label="Phone / Contact Number"
            value={settings.phone}
            onChangeText={(txt) => dispatch(updateLocalSettings({ phone: txt }))}
            keyboardType="phone-pad"
            mode="outlined"
            style={styles.input}
          />
        </Card.Content>
      </Card>

      {/* Tax & Currency Configuration */}
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="calculator" size={24} color="#EA580C" />
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Tax & Currency Settings
            </Text>
          </View>
          <Divider style={{ marginVertical: 10, backgroundColor: '#FED7AA' }} />

          <View style={styles.switchRow}>
            <View>
              <Text variant="titleSmall" style={styles.switchLabel}>
                Enable GST Tax Calculation
              </Text>
              <Text variant="bodySmall" style={styles.switchSub}>
                Automatically calculate itemized GST on invoices
              </Text>
            </View>
            <Switch
              value={settings.gstEnabled}
              onValueChange={(val) => {
                dispatch(updateLocalSettings({ gstEnabled: val }));
              }}
              color="#F97316"
            />
          </View>

          {settings.gstEnabled && (
            <TextInput
              label="Fallback Global GST Rate (%)"
              value={settings.gstPercentage.toString()}
              onChangeText={(txt) => {
                dispatch(updateLocalSettings({ gstPercentage: parseFloat(txt) || 0 }));
              }}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
            />
          )}

          <TextInput
            label="Currency Symbol"
            value={settings.currencySymbol}
            onChangeText={(txt) => {
              dispatch(updateLocalSettings({ currencySymbol: txt }));
            }}
            mode="outlined"
            style={styles.input}
          />
        </Card.Content>
      </Card>

      {/* Receipt & Excel Folder Path */}
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="folder-text-outline" size={24} color="#FB923C" />
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Receipt & Export Settings
            </Text>
          </View>
          <Divider style={{ marginVertical: 10, backgroundColor: '#FED7AA' }} />

          <TextInput
            label="Receipt Footer Message"
            value={settings.footerMessage}
            onChangeText={(txt) => dispatch(updateLocalSettings({ footerMessage: txt }))}
            mode="outlined"
            multiline
            numberOfLines={2}
            style={styles.input}
          />

          {Platform.OS === 'android' && (
            <View style={{ marginTop: 6 }}>
              <Text variant="titleSmall" style={styles.switchLabel}>
                Excel Export Save Folder
              </Text>
              <Text variant="bodySmall" style={{ color: '#94A3B8', marginBottom: 8 }}>
                Current Folder: {settings.exportFolderName || 'Default App Downloads'}
              </Text>
              <Button
                mode="outlined"
                icon="folder-open"
                onPress={handleSelectFolder}
                style={{ borderRadius: 8, borderColor: '#F97316' }}
                textColor="#F97316"
              >
                Select Storage Folder (SAF)
              </Button>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Save Button & Status */}
      <Surface style={styles.saveSurface} elevation={2}>
        <Button
          mode="contained"
          icon="content-save"
          onPress={handleSave}
          loading={saving}
          style={styles.saveBtn}
          contentStyle={{ height: 48 }}
          labelStyle={{ fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' }}
        >
          Save All Settings
        </Button>
        {successMsg && <Text style={styles.successText}>{successMsg}</Text>}
      </Surface>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: 12,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderLeftWidth: 4,
    borderLeftColor: '#F97316',
    elevation: 2,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#1E293B',
    fontSize: 16,
  },
  input: {
    marginBottom: 10,
    backgroundColor: '#FFF7ED',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  switchLabel: {
    fontWeight: 'bold',
    color: '#1E293B',
  },
  switchSub: {
    color: '#94A3B8',
  },
  saveSurface: {
    padding: 14,
    backgroundColor: '#FFF7ED',
    borderRadius: 16,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  saveBtn: {
    borderRadius: 12,
    backgroundColor: '#F97316',
  },
  successText: {
    color: '#16A34A',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
  },
});
