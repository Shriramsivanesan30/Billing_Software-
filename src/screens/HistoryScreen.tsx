import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Searchbar,
  Card,
  Text,
  Button,
  IconButton,
  Surface,
  useTheme,
} from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useAppDispatch, useAppSelector } from '../store';
import { setCurrentInvoice, clearInvoicesAsync } from '../store/invoiceSlice';
import { ReceiptModal } from '../components/ReceiptModal';
import { EmptyState } from '../components/EmptyState';
import { exportInvoicesToExcel } from '../services/excelService';
import { formatCurrency } from '../utils/constants';
import { Invoice } from '../types';

export const HistoryScreen: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { invoices, currentInvoice } = useAppSelector((state) => state.invoice);
  const settings = useAppSelector((state) => state.settings.settings);

  const [searchQuery, setSearchQuery] = useState('');
  const [receiptModalVisible, setReceiptModalVisible] = useState(false);
  const [exportingAll, setExportingAll] = useState(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);

  // Filter invoices by number or date
  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.date.includes(searchQuery)
  );

  const handleSelectInvoice = (invoice: Invoice) => {
    dispatch(setCurrentInvoice(invoice));
    setReceiptModalVisible(true);
  };

  const handleExportAllToExcel = async () => {
    if (invoices.length === 0) {
      Alert.alert('No Invoices', 'There are no billing records to export.');
      return;
    }

    try {
      setExportingAll(true);
      setExportStatus(null);
      const res = await exportInvoicesToExcel(
        invoices,
        'Ram_Stores_All_Sales_History',
        settings.exportFolderUri,
        true
      );
      setExportStatus(`Exported ${res.recordCount} invoices to Excel!`);
    } catch (error: any) {
      Alert.alert('Export Failed', error.message || 'Error exporting sales history.');
    } finally {
      setExportingAll(false);
    }
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear Billing History',
      'Are you sure you want to delete all invoice history? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => dispatch(clearInvoicesAsync()),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Search & Actions Surface */}
      <Surface style={styles.headerSurface} elevation={2}>
        <Searchbar
          placeholder="Search invoice number or date..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          inputStyle={styles.searchInput}
        />

        <View style={styles.actionRow}>
          <Button
            mode="contained"
            icon="file-excel"
            onPress={handleExportAllToExcel}
            loading={exportingAll}
            style={styles.btn}
            labelStyle={{ color: '#FFFFFF' }}
          >
            Export All (Excel)
          </Button>

          {invoices.length > 0 && (
            <IconButton
              icon="trash-can-outline"
              iconColor="#EF4444"
              size={24}
              onPress={handleClearHistory}
            />
          )}
        </View>

        {exportStatus && <Text style={styles.statusText}>{exportStatus}</Text>}
      </Surface>

      {/* Invoice History List */}
      <FlatList
        data={filteredInvoices}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleSelectInvoice(item)}
          >
            <Card style={styles.card} mode="elevated">
              <Card.Content style={styles.cardContent}>
                <View style={styles.invHeaderRow}>
                  <View style={styles.invHeaderLeft}>
                    <MaterialCommunityIcons
                      name="receipt"
                      size={24}
                      color="#F97316"
                    />
                    <Text variant="titleMedium" style={styles.invNumber}>
                      {item.invoiceNumber}
                    </Text>
                  </View>
                  <Text variant="titleLarge" style={styles.grandTotal}>
                    {formatCurrency(item.grandTotal, item.currencySymbol)}
                  </Text>
                </View>

                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>
                    📅 {item.date} at {item.time}
                  </Text>
                  <Text style={styles.metaText}>
                    🛒 {item.items.reduce((sum, i) => sum + i.quantity, 0)} items
                  </Text>
                </View>

                {item.excelSavedPath && (
                  <Text style={styles.excelPathText} numberOfLines={1}>
                    📊 Saved: {item.excelSavedPath.split('/').pop()}
                  </Text>
                )}
              </Card.Content>
            </Card>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="history"
            title="No Billing History"
            description="Completed invoices will appear here. Create bills from the 'Billing' tab."
          />
        }
      />

      {/* Receipt Modal */}
      <ReceiptModal
        visible={receiptModalVisible}
        invoice={currentInvoice}
        onDismiss={() => setReceiptModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerSurface: {
    padding: 12,
    backgroundColor: '#FFF7ED',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#FED7AA',
  },
  searchbar: {
    elevation: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    height: 44,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  searchInput: {
    fontSize: 13,
    minHeight: 44,
    color: '#1E293B',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  btn: {
    borderRadius: 10,
    flex: 1,
    backgroundColor: '#F97316',
  },
  statusText: {
    color: '#16A34A',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
  },
  listContent: {
    padding: 12,
  },
  card: {
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
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
  cardContent: {
    padding: 14,
  },
  invHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  invHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  invNumber: {
    fontWeight: 'bold',
    marginLeft: 6,
    fontSize: 15,
    color: '#1E293B',
  },
  grandTotal: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#F97316',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  metaText: {
    color: '#64748B',
    fontSize: 12,
  },
  excelPathText: {
    color: '#F97316',
    fontSize: 11,
    marginTop: 6,
    fontStyle: 'italic',
  },
});
