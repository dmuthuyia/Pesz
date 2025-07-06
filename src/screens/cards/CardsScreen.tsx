import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { walletAPI } from '../../services/api';
import Toast from 'react-native-toast-message';

interface Card {
  _id: string;
  cardNumber: string;
  cardType: string;
  expiryDate: string;
  cardholderName: string;
  isDefault: boolean;
  bankName: string;
}

const CardsScreen = ({ navigation }: any) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock cards data - replace with actual API calls
  const mockCards: Card[] = [
    {
      _id: '1',
      cardNumber: '4532 **** **** 1234',
      cardType: 'Visa',
      expiryDate: '12/25',
      cardholderName: 'John Doe',
      isDefault: true,
      bankName: 'KCB Bank',
    },
    {
      _id: '2',
      cardNumber: '5555 **** **** 5678',
      cardType: 'Mastercard',
      expiryDate: '08/26',
      cardholderName: 'John Doe',
      isDefault: false,
      bankName: 'Equity Bank',
    },
  ];

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      // Simulate API call
      setCards(mockCards);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load cards',
      });
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadCards();
    setIsRefreshing(false);
  };

  const handleSetDefault = async (cardId: string) => {
    try {
      setIsLoading(true);
      // await walletAPI.setDefaultCard(cardId);
      
      // Update local state
      setCards(prev => prev.map(card => ({
        ...card,
        isDefault: card._id === cardId,
      })));

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Default card updated',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update default card',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCard = (cardId: string) => {
    Alert.alert(
      'Remove Card',
      'Are you sure you want to remove this card?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              // await walletAPI.removeCard(cardId);
              
              setCards(prev => prev.filter(card => card._id !== cardId));
              
              Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Card removed successfully',
              });
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to remove card',
              });
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const getCardGradient = (cardType: string) => {
    switch (cardType.toLowerCase()) {
      case 'visa':
        return ['#1A1F71', '#0F4C75'];
      case 'mastercard':
        return ['#EB001B', '#F79E1B'];
      case 'amex':
        return ['#006FCF', '#0099CC'];
      default:
        return ['#374151', '#1F2937'];
    }
  };

  const getCardIcon = (cardType: string) => {
    switch (cardType.toLowerCase()) {
      case 'visa':
        return 'credit-card';
      case 'mastercard':
        return 'credit-card';
      case 'amex':
        return 'credit-card';
      default:
        return 'credit-card';
    }
  };

  const renderCard = (card: Card) => (
    <View key={card._id} style={styles.cardContainer}>
      <LinearGradient
        colors={getCardGradient(card.cardType)}
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.bankName}>{card.bankName}</Text>
          <Icon name={getCardIcon(card.cardType)} size={32} color="#FFFFFF" />
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.cardNumber}>{card.cardNumber}</Text>
          <View style={styles.cardDetails}>
            <View>
              <Text style={styles.cardLabel}>CARDHOLDER</Text>
              <Text style={styles.cardValue}>{card.cardholderName}</Text>
            </View>
            <View>
              <Text style={styles.cardLabel}>EXPIRES</Text>
              <Text style={styles.cardValue}>{card.expiryDate}</Text>
            </View>
          </View>
        </View>

        {card.isDefault && (
          <View style={styles.defaultBadge}>
            <Icon name="star" size={16} color="#F59E0B" />
            <Text style={styles.defaultText}>Default</Text>
          </View>
        )}
      </LinearGradient>

      <View style={styles.cardActions}>
        {!card.isDefault && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleSetDefault(card._id)}
            disabled={isLoading}
          >
            <Icon name="star-border" size={20} color="#22C55E" />
            <Text style={styles.actionButtonText}>Set Default</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[styles.actionButton, styles.removeButton]}
          onPress={() => handleRemoveCard(card._id)}
          disabled={isLoading}
        >
          <Icon name="delete" size={20} color="#EF4444" />
          <Text style={[styles.actionButtonText, styles.removeButtonText]}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="credit-card" size={64} color="#D1D5DB" />
      <Text style={styles.emptyStateTitle}>No cards added</Text>
      <Text style={styles.emptyStateText}>
        Add your debit or credit cards to make payments easier
      </Text>
      <TouchableOpacity
        style={styles.addFirstCardButton}
        onPress={() => navigation.navigate('AddCard')}
      >
        <Icon name="add" size={20} color="#FFFFFF" />
        <Text style={styles.addFirstCardButtonText}>Add Your First Card</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cards & Accounts</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddCard')}
        >
          <Icon name="add" size={24} color="#22C55E" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {cards.length > 0 ? (
          <>
            {/* Cards List */}
            <View style={styles.cardsSection}>
              <Text style={styles.sectionTitle}>Your Cards</Text>
              {cards.map(renderCard)}
            </View>

            {/* Add New Card */}
            <TouchableOpacity
              style={styles.addCardButton}
              onPress={() => navigation.navigate('AddCard')}
            >
              <Icon name="add-circle" size={24} color="#22C55E" />
              <Text style={styles.addCardButtonText}>Add New Card</Text>
              <Icon name="chevron-right" size={24} color="#9CA3AF" />
            </TouchableOpacity>

            {/* Bank Accounts Section */}
            <View style={styles.bankAccountsSection}>
              <Text style={styles.sectionTitle}>Bank Accounts</Text>
              <TouchableOpacity
                style={styles.bankAccountItem}
                onPress={() => {
                  // Navigate to bank account linking
                  Toast.show({
                    type: 'info',
                    text1: 'Coming Soon',
                    text2: 'Bank account linking will be available soon',
                  });
                }}
              >
                <View style={styles.bankAccountLeft}>
                  <View style={styles.bankAccountIcon}>
                    <Icon name="account-balance" size={24} color="#3B82F6" />
                  </View>
                  <View style={styles.bankAccountInfo}>
                    <Text style={styles.bankAccountTitle}>Link Bank Account</Text>
                    <Text style={styles.bankAccountSubtitle}>
                      Connect your bank account for easy transfers
                    </Text>
                  </View>
                </View>
                <Icon name="chevron-right" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {/* Security Info */}
            <View style={styles.securityInfo}>
              <Icon name="security" size={24} color="#22C55E" />
              <View style={styles.securityText}>
                <Text style={styles.securityTitle}>Your cards are secure</Text>
                <Text style={styles.securityDescription}>
                  We use bank-level encryption to protect your card information
                </Text>
              </View>
            </View>
          </>
        ) : (
          renderEmptyState()
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#22C55E20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  cardsSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  cardContainer: {
    marginBottom: 20,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    height: 200,
    position: 'relative',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  bankName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cardBody: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginBottom: 20,
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontSize: 10,
    color: '#FFFFFF80',
    marginBottom: 4,
    letterSpacing: 1,
  },
  cardValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  defaultBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
    marginLeft: 4,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#22C55E',
    marginLeft: 4,
  },
  removeButton: {
    // Additional styles for remove button if needed
  },
  removeButtonText: {
    color: '#EF4444',
  },
  addCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  addCardButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginLeft: 12,
  },
  bankAccountsSection: {
    marginBottom: 20,
  },
  bankAccountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bankAccountLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bankAccountIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#3B82F620',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bankAccountInfo: {
    flex: 1,
  },
  bankAccountTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  bankAccountSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22C55E10',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  securityText: {
    flex: 1,
    marginLeft: 12,
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22C55E',
    marginBottom: 2,
  },
  securityDescription: {
    fontSize: 12,
    color: '#16A34A',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  addFirstCardButton: {
    flexDirection: 'row',
    backgroundColor: '#22C55E',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  addFirstCardButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});

export default CardsScreen;