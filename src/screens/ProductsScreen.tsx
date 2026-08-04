import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ScrollView,
  Alert,
  Text as RNText,
} from 'react-native';
import {
  Searchbar,
  Chip,
  Button,
  Card,
  IconButton,
  FAB,
  Surface,
  useTheme,
} from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../store';
import {
  addNewProduct,
  updateProduct,
  deleteProduct,
  setCategoryFilter,
  setSearchQuery,
} from '../store/billingSlice';
import { AddProductModal } from '../components/AddProductModal';
import { EditProductModal } from '../components/EditProductModal';
import { EmptyState } from '../components/EmptyState';
import { PRODUCT_CATEGORIES, formatCurrency } from '../utils/constants';
import { Product } from '../types';

export const ProductsScreen: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { products, selectedCategory, searchQuery } = useAppSelector(
    (state) => state.billing
  );
  const settings = useAppSelector((state) => state.settings.settings);

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const filteredProducts = products.filter((p) => {
    const matchesCat =
      selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleAddProduct = (newProd: Product) => {
    dispatch(addNewProduct(newProd));
  };

  const handleEditPress = (product: Product) => {
    setEditingProduct(product);
    setEditModalVisible(true);
  };

  const handleSaveEditedProduct = (updated: Product) => {
    dispatch(updateProduct(updated));
  };

  const handleDeleteProduct = (productId: string, productName: string) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${productName}" from inventory?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => dispatch(deleteProduct(productId)),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Search & Header Bar */}
      <Surface style={styles.headerSurface} elevation={2}>
        <Searchbar
          placeholder="Search inventory products..."
          onChangeText={(txt) => dispatch(setSearchQuery(txt))}
          value={searchQuery}
          style={styles.searchbar}
          inputStyle={styles.searchInput}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catRow}>
          {PRODUCT_CATEGORIES.map((cat) => (
            <Chip
              key={cat}
              selected={selectedCategory === cat}
              onPress={() => dispatch(setCategoryFilter(cat))}
              style={[
                styles.chip,
                selectedCategory === cat && { backgroundColor: '#F97316' },
              ]}
              textStyle={{
                color: selectedCategory === cat ? '#FFFFFF' : '#64748B',
                fontWeight: selectedCategory === cat ? 'bold' : 'normal',
              }}
            >
              {cat}
            </Chip>
          ))}
        </ScrollView>
      </Surface>

      {/* Product List */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Card style={styles.card} mode="elevated">
            <Card.Content style={styles.cardContent}>
              {/* Product Header & Title */}
              <View style={styles.cardHeader}>
                <RNText style={styles.prodName}>{item.name}</RNText>

                {/* Clear Contrast Badges */}
                <View style={styles.badgesRow}>
                  <View style={styles.categoryBadge}>
                    <RNText style={styles.categoryBadgeText}>{item.category}</RNText>
                  </View>

                  <View style={styles.gstBadge}>
                    <RNText style={styles.gstBadgeText}>
                      GST {item.gstRate !== undefined ? item.gstRate : 5}%
                    </RNText>
                  </View>
                </View>
              </View>

              <View style={styles.rowBottom}>
                <View style={styles.priceCol}>
                  <RNText style={styles.priceText}>
                    {formatCurrency(item.price, settings.currencySymbol)}
                  </RNText>
                  <RNText style={styles.unitText}>
                    per {item.unit}
                  </RNText>
                </View>

                {/* Edit & Delete Actions */}
                <View style={styles.actionCol}>
                  <Button
                    mode="contained-tonal"
                    icon="pencil"
                    compact
                    onPress={() => handleEditPress(item)}
                    style={styles.editBtn}
                  >
                    Edit
                  </Button>

                  <IconButton
                    icon="trash-can-outline"
                    iconColor="#EF4444"
                    size={22}
                    onPress={() => handleDeleteProduct(item.id, item.name)}
                  />
                </View>
              </View>
            </Card.Content>
          </Card>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="package-variant-closed"
            title="No Products Found"
            description="Tap the '+ Add Product' button below to add custom inventory products."
          />
        }
      />

      {/* Floating Action Button to Add New Product */}
      <FAB
        icon="plus"
        label="Add Product"
        style={styles.fab}
        color="#FFFFFF"
        onPress={() => setAddModalVisible(true)}
      />

      {/* Add Product Modal */}
      <AddProductModal
        visible={addModalVisible}
        onDismiss={() => setAddModalVisible(false)}
        onAddProduct={handleAddProduct}
      />

      {/* Edit Product Modal */}
      <EditProductModal
        visible={editModalVisible}
        product={editingProduct}
        onDismiss={() => setEditModalVisible(false)}
        onSaveProduct={handleSaveEditedProduct}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  headerSurface: {
    padding: 10,
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
  catRow: {
    flexDirection: 'row',
  },
  chip: {
    marginRight: 6,
    height: 34,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  listContent: {
    padding: 12,
    paddingBottom: 80,
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
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardContent: {
    padding: 14,
  },
  cardHeader: {
    marginBottom: 12,
  },
  prodName: {
    fontWeight: '700',
    fontSize: 18,
    color: '#1E293B',
    marginBottom: 8,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  categoryBadge: {
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    borderWidth: 1,
    borderColor: '#F97316',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  categoryBadgeText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#EA580C',
  },
  gstBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  gstBadgeText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#D97706',
  },
  rowBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceCol: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceText: {
    fontWeight: 'bold',
    fontSize: 19,
    color: '#F97316',
  },
  unitText: {
    color: '#94A3B8',
    fontSize: 13,
    marginLeft: 4,
  },
  actionCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editBtn: {
    borderRadius: 8,
    marginRight: 4,
    backgroundColor: '#FFF7ED',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    borderRadius: 28,
    backgroundColor: '#F97316',
  },
});
