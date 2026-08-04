import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Button, useTheme } from 'react-native-paper';
import { Product } from '../types';
import { formatCurrency } from '../utils/constants';

interface ProductCardProps {
  product: Product;
  currencySymbol: string;
  onAddToCart: (product: Product) => void;
  cartQuantity?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  currencySymbol,
  onAddToCart,
  cartQuantity = 0,
}) => {
  const theme = useTheme();

  return (
    <Card style={styles.card} mode="elevated">
      <Card.Content style={styles.content}>
        {/* Crisp Header Badges */}
        <View style={styles.headerRow}>
          <View style={[styles.badge, { backgroundColor: 'rgba(249, 115, 22, 0.1)', borderColor: '#F97316' }]}>
            <Text style={[styles.badgeText, { color: '#EA580C' }]}>
              {product.category}
            </Text>
          </View>

          <View style={[styles.badge, { backgroundColor: 'rgba(245, 158, 11, 0.1)', borderColor: '#F59E0B' }]}>
            <Text style={[styles.badgeText, { color: '#D97706' }]}>
              GST: {product.gstRate !== undefined ? product.gstRate : 5}%
            </Text>
          </View>

          {cartQuantity > 0 && (
            <View style={[styles.badge, { backgroundColor: 'rgba(22, 163, 74, 0.1)', borderColor: '#16A34A' }]}>
              <Text style={[styles.badgeText, { color: '#16A34A' }]}>
                Cart: {cartQuantity}
              </Text>
            </View>
          )}
        </View>

        {/* Product Name */}
        <Text variant="titleMedium" style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>

        {/* Price Row */}
        <View style={styles.priceRow}>
          <Text variant="headlineSmall" style={styles.price}>
            {formatCurrency(product.price, currencySymbol)}
          </Text>
          <Text variant="bodySmall" style={styles.unitText}>
            / {product.unit}
          </Text>
        </View>
      </Card.Content>

      <Card.Actions style={styles.actions}>
        <Button
          mode="contained"
          icon="cart-plus"
          onPress={() => onAddToCart(product)}
          style={styles.addButton}
          labelStyle={styles.buttonLabel}
        >
          Add to Cart
        </Button>
      </Card.Actions>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 6,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FED7AA',
    elevation: 2,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    flex: 1,
    minWidth: 155,
  },
  content: {
    padding: 12,
  },
  headerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    lineHeight: 14,
  },
  productName: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#1E293B',
    minHeight: 36,
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
  },
  price: {
    fontWeight: 'bold',
    fontSize: 17,
    color: '#F97316',
  },
  unitText: {
    color: '#94A3B8',
    marginLeft: 4,
  },
  actions: {
    paddingHorizontal: 8,
    paddingBottom: 8,
    paddingTop: 0,
  },
  addButton: {
    borderRadius: 10,
    backgroundColor: '#F97316',
    flex: 1,
  },
  buttonLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
