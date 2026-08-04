import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text as RNText } from 'react-native';
import { Surface, Text, Card, Chip, Divider, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useAppSelector } from '../store';
import { formatCurrency } from '../utils/constants';

export const AnalyticsScreen: React.FC = () => {
  const theme = useTheme();
  const invoices = useAppSelector((state) => state.invoice.invoices);
  const products = useAppSelector((state) => state.billing.products);
  const settings = useAppSelector((state) => state.settings.settings);

  const [productFilter, setProductFilter] = useState<'all' | 'sold' | 'unsold'>('all');

  // KPI Computations
  const totalRevenue = invoices.reduce((acc, inv) => acc + inv.grandTotal, 0);
  const totalInvoicesCount = invoices.length;
  const totalGstCollected = invoices.reduce((acc, inv) => acc + inv.gstAmount, 0);
  const totalItemsSold = invoices.reduce(
    (acc, inv) => acc + inv.items.reduce((sum, i) => sum + i.quantity, 0),
    0
  );

  // Category-wise Breakdown
  const categorySales: { [key: string]: number } = {};
  invoices.forEach((inv) => {
    inv.items.forEach((item) => {
      const cat = item.product.category || 'Others';
      const itemTotal = item.product.price * item.quantity;
      categorySales[cat] = (categorySales[cat] || 0) + itemTotal;
    });
  });

  // Daily Revenue Graph Mapping (Last 7 Days)
  const last7Days: { dateStr: string; label: string; revenue: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const label = d.toLocaleDateString('en-US', { weekday: 'short' });

    const dayRevenue = invoices
      .filter((inv) => inv.date === dateStr)
      .reduce((sum, inv) => sum + inv.grandTotal, 0);

    last7Days.push({ dateStr, label, revenue: dayRevenue });
  }

  const maxDailyRevenue = Math.max(...last7Days.map((d) => d.revenue), 1);

  // Sold vs Unsold Product Computations
  const soldMap: { [productId: string]: { qty: number; totalRev: number } } = {};
  invoices.forEach((inv) => {
    inv.items.forEach((item) => {
      const pId = item.product.id;
      if (!soldMap[pId]) {
        soldMap[pId] = { qty: 0, totalRev: 0 };
      }
      soldMap[pId].qty += item.quantity;
      soldMap[pId].totalRev += item.product.price * item.quantity;
    });
  });

  const productPerformanceList = products.map((prod) => {
    const soldData = soldMap[prod.id];
    return {
      product: prod,
      soldQty: soldData ? soldData.qty : 0,
      totalRevenue: soldData ? soldData.totalRev : 0,
      isSold: !!soldData && soldData.qty > 0,
    };
  });

  const filteredProductPerformance = productPerformanceList.filter((item) => {
    if (productFilter === 'sold') return item.isSold;
    if (productFilter === 'unsold') return !item.isSold;
    return true;
  });

  const totalSoldTypes = productPerformanceList.filter((p) => p.isSold).length;
  const totalUnsoldTypes = productPerformanceList.filter((p) => !p.isSold).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Overview Cards (2x2 Grid) */}
      <View style={styles.kpiGrid}>
        <Surface style={[styles.kpiCard, { borderLeftColor: '#F97316' }]} elevation={2}>
          <View style={[styles.kpiIconWrapper, { backgroundColor: 'rgba(249, 115, 22, 0.1)' }]}>
            <MaterialCommunityIcons name="currency-inr" size={24} color="#F97316" />
          </View>
          <Text style={styles.kpiVal}>
            {formatCurrency(totalRevenue, settings.currencySymbol)}
          </Text>
          <Text style={styles.kpiLabel}>Total Revenue</Text>
        </Surface>

        <Surface style={[styles.kpiCard, { borderLeftColor: '#EA580C' }]} elevation={2}>
          <View style={[styles.kpiIconWrapper, { backgroundColor: 'rgba(234, 88, 12, 0.1)' }]}>
            <MaterialCommunityIcons name="receipt" size={24} color="#EA580C" />
          </View>
          <Text style={styles.kpiVal}>{totalInvoicesCount}</Text>
          <Text style={styles.kpiLabel}>Invoices Issued</Text>
        </Surface>

        <Surface style={[styles.kpiCard, { borderLeftColor: '#F59E0B' }]} elevation={2}>
          <View style={[styles.kpiIconWrapper, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
            <MaterialCommunityIcons name="cash-register" size={24} color="#F59E0B" />
          </View>
          <Text style={styles.kpiVal}>
            {formatCurrency(totalGstCollected, settings.currencySymbol)}
          </Text>
          <Text style={styles.kpiLabel}>GST Collected</Text>
        </Surface>

        <Surface style={[styles.kpiCard, { borderLeftColor: '#FB923C' }]} elevation={2}>
          <View style={[styles.kpiIconWrapper, { backgroundColor: 'rgba(251, 146, 60, 0.1)' }]}>
            <MaterialCommunityIcons name="shopping" size={24} color="#FB923C" />
          </View>
          <Text style={styles.kpiVal}>{totalItemsSold}</Text>
          <Text style={styles.kpiLabel}>Items Sold</Text>
        </Surface>
      </View>

      {/* Daily Sales Trend (7-Day Bar Chart) */}
      <Card style={styles.chartCard} mode="elevated">
        <Card.Content>
          <View style={styles.cardHeaderRow}>
            <MaterialCommunityIcons name="chart-bar" size={22} color="#F97316" />
            <Text variant="titleMedium" style={styles.cardTitle}>
              7-Day Sales Trend
            </Text>
          </View>
          <Text variant="bodySmall" style={styles.cardSub}>
            Daily revenue performance overview
          </Text>

          <View style={styles.barChartContainer}>
            {last7Days.map((day, idx) => {
              const barHeightPct =
                maxDailyRevenue > 0 ? (day.revenue / maxDailyRevenue) * 100 : 0;
              return (
                <View key={idx} style={styles.barCol}>
                  <Text style={styles.barValText}>
                    {day.revenue > 0 ? `₹${Math.round(day.revenue)}` : ''}
                  </Text>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: `${Math.max(barHeightPct, 6)}%`,
                          backgroundColor:
                            day.revenue > 0 ? '#F97316' : '#F1F5F9',
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barLabelText}>{day.label}</Text>
                </View>
              );
            })}
          </View>
        </Card.Content>
      </Card>

      {/* Category Performance Breakdown */}
      <Card style={styles.chartCard} mode="elevated">
        <Card.Content>
          <View style={styles.cardHeaderRow}>
            <MaterialCommunityIcons name="shape-outline" size={22} color="#EA580C" />
            <Text variant="titleMedium" style={styles.cardTitle}>
              Category Sales Breakdown
            </Text>
          </View>

          <View style={{ marginTop: 10 }}>
            {Object.keys(categorySales).length === 0 ? (
              <Text style={styles.emptyText}>No sales recorded yet.</Text>
            ) : (
              Object.entries(categorySales).map(([cat, rev], idx) => {
                const pct = totalRevenue > 0 ? (rev / totalRevenue) * 100 : 0;
                return (
                  <View key={idx} style={styles.catRow}>
                    <View style={styles.catInfoRow}>
                      <Text style={styles.catName}>{cat}</Text>
                      <Text style={styles.catRev}>
                        {formatCurrency(rev, settings.currencySymbol)} ({pct.toFixed(1)}%)
                      </Text>
                    </View>
                    <View style={styles.catBarTrack}>
                      <View
                        style={[
                          styles.catBarFill,
                          { width: `${pct}%`, backgroundColor: '#F97316' },
                        ]}
                      />
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </Card.Content>
      </Card>

      {/* Detailed Inventory Performance: Sold vs. Unsold */}
      <Card style={styles.chartCard} mode="elevated">
        <Card.Content>
          <View style={styles.cardHeaderRow}>
            <MaterialCommunityIcons name="package-variant" size={22} color="#FB923C" />
            <Text variant="titleMedium" style={styles.cardTitle}>
              Product Inventory Sales Performance
            </Text>
          </View>
          <Text variant="bodySmall" style={styles.cardSub}>
            Track sold vs unsold inventory items
          </Text>

          {/* Sold / Unsold Chips */}
          <View style={styles.chipFilterRow}>
            <Chip
              selected={productFilter === 'all'}
              onPress={() => setProductFilter('all')}
              style={[
                styles.filterChip,
                productFilter === 'all' && { backgroundColor: '#F97316' },
              ]}
              textStyle={{ color: productFilter === 'all' ? '#FFFFFF' : '#64748B', fontWeight: 'bold' }}
            >
              All ({productPerformanceList.length})
            </Chip>
            <Chip
              selected={productFilter === 'sold'}
              onPress={() => setProductFilter('sold')}
              style={[
                styles.filterChip,
                productFilter === 'sold' && { backgroundColor: '#16A34A' },
              ]}
              textStyle={{
                color: productFilter === 'sold' ? '#FFFFFF' : '#16A34A',
                fontWeight: 'bold',
              }}
            >
              Sold ({totalSoldTypes})
            </Chip>
            <Chip
              selected={productFilter === 'unsold'}
              onPress={() => setProductFilter('unsold')}
              style={[
                styles.filterChip,
                productFilter === 'unsold' && { backgroundColor: '#EF4444' },
              ]}
              textStyle={{
                color: productFilter === 'unsold' ? '#FFFFFF' : '#EF4444',
                fontWeight: 'bold',
              }}
            >
              Unsold ({totalUnsoldTypes})
            </Chip>
          </View>

          <Divider style={{ marginVertical: 8, backgroundColor: '#FED7AA' }} />

          {/* Product Items Table */}
          <View style={{ marginTop: 4 }}>
            {filteredProductPerformance.map((item, idx) => (
              <View key={idx} style={styles.prodPerfRow}>
                <View style={styles.prodPerfLeft}>
                  <Text style={styles.prodPerfName}>{item.product.name}</Text>
                  <Text style={styles.prodPerfCat}>
                    {item.product.category} • {formatCurrency(item.product.price, settings.currencySymbol)}
                  </Text>
                </View>

                {/* Sold / Unsold Badge */}
                <View style={styles.prodPerfRight}>
                  {item.isSold ? (
                    <View style={styles.badgeSold}>
                      <RNText style={styles.badgeSoldText}>
                        Sold: {item.soldQty} ({formatCurrency(item.totalRevenue, settings.currencySymbol)})
                      </RNText>
                    </View>
                  ) : (
                    <View style={styles.badgeUnsold}>
                      <RNText style={styles.badgeUnsoldText}>Unsold</RNText>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>
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
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  kpiCard: {
    flex: 1,
    minWidth: 155,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderLeftWidth: 4,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  kpiIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  kpiVal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    letterSpacing: 0.5,
  },
  kpiLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#FED7AA',
    elevation: 2,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontWeight: 'bold',
    color: '#1E293B',
    marginLeft: 8,
    fontSize: 16,
  },
  cardSub: {
    color: '#94A3B8',
    marginBottom: 12,
  },
  barChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
    paddingTop: 16,
    paddingBottom: 4,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barValText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#F97316',
    marginBottom: 2,
  },
  barTrack: {
    width: 20,
    height: 90,
    backgroundColor: '#FFF7ED',
    borderRadius: 8,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  barFill: {
    width: '100%',
    borderRadius: 8,
  },
  barLabelText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#64748B',
    marginTop: 4,
  },
  emptyText: {
    color: '#94A3B8',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 10,
  },
  catRow: {
    marginBottom: 12,
  },
  catInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  catName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  catRev: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#F97316',
  },
  catBarTrack: {
    height: 8,
    backgroundColor: '#FFF7ED',
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  catBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  chipFilterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  filterChip: {
    height: 34,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  prodPerfRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#FED7AA',
  },
  prodPerfLeft: {
    flex: 2,
  },
  prodPerfName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  prodPerfCat: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  prodPerfRight: {
    alignItems: 'flex-end',
    flex: 1.5,
  },
  badgeSold: {
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
    borderWidth: 1,
    borderColor: '#16A34A',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeSoldText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#16A34A',
  },
  badgeUnsold: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeUnsoldText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#EF4444',
  },
});
