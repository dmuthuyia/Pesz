import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { walletAPI } from '../../services/api';
import Toast from 'react-native-toast-message';

const AddCardScreen = ({ navigation }: any) => {
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    bankName: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;

    // Format card number with spaces
    if (field === 'cardNumber') {
      formattedValue = value
        .replace(/\s/g, '')
        .replace(/(.{4})/g, '$1 ')
        .trim()
        .slice(0, 19); // Max 16 digits + 3 spaces
    }

    // Format expiry date
    if (field === 'expiryDate') {
      formattedValue = value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '$1/$2')
        .slice(0, 5);
    }

    // Format CVV
    if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }

    // Format cardholder name
    if (field === 'cardholderName') {
      formattedValue = value.toUpperCase();
    }

    setCardData(prev => ({ ...prev, [field]: formattedValue }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateCard = () => {
    const newErrors: any = {};

    // Validate card number
    const cardNumberDigits = cardData.cardNumber.replace(/\s/g, '');
    if (!cardNumberDigits) {
      newErrors.cardNumber = 'Card number is required';
    } else if (cardNumberDigits.length < 13 || cardNumberDigits.length > 19) {
      newErrors.cardNumber = 'Invalid card number';
    }

    // Validate expiry date
    if (!cardData.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
    } else if (!/^\d{2}\/\d{2}$/.test(cardData.expiryDate)) {
      newErrors.expiryDate = 'Invalid expiry date format';
    } else {
      const [month, year] = cardData.expiryDate.split('/');
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100;
      const currentMonth = currentDate.getMonth() + 1;
      
      if (parseInt(month) < 1 || parseInt(month) > 12) {
        newErrors.expiryDate = 'Invalid month';
      } else if (parseInt(year) < currentYear || 
                (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        newErrors.expiryDate = 'Card has expired';
      }
    }

    // Validate CVV
    if (!cardData.cvv) {
      newErrors.cvv = 'CVV is required';
    } else if (cardData.cvv.length < 3) {
      newErrors.cvv = 'Invalid CVV';
    }

    // Validate cardholder name
    if (!cardData.cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    }

    // Validate bank name
    if (!cardData.bankName.trim()) {
      newErrors.bankName = 'Bank name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const detectCardType = (cardNumber: string) => {
    const number = cardNumber.replace(/\s/g, '');
    
    if (/^4/.test(number)) return 'Visa';
    if (/^5[1-5]/.test(number)) return 'Mastercard';
    if (/^3[47]/.test(number)) return 'American Express';
    if (/^6/.test(number)) return 'Discover';
    
    return 'Unknown';
  };

  const handleAddCard = async () => {
    if (!validateCard()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please fix the errors and try again',
      });
      return;
    }

    setIsLoading(true);
    try {
      const cardType = detectCardType(cardData.cardNumber);
      
      const response = await walletAPI.addCard({
        ...cardData,
        cardType,
        cardNumber: cardData.cardNumber.replace(/\s/g, ''),
      });

      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Card added successfully!',
        });
        navigation.goBack();
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to add card',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCardIcon = () => {
    const cardType = detectCardType(cardData.cardNumber);
    switch (cardType) {
      case 'Visa':
        return 'credit-card';
      case 'Mastercard':
        return 'credit-card';
      case 'American Express':
        return 'credit-card';
      default:
        return 'credit-card';
    }
  };

  const getCardColor = () => {
    const cardType = detectCardType(cardData.cardNumber);
    switch (cardType) {
      case 'Visa':
        return '#1A1F71';
      case 'Mastercard':
        return '#EB001B';
      case 'American Express':
        return '#006FCF';
      default:
        return '#374151';
    }
  };

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
        <Text style={styles.headerTitle}>Add New Card</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Card Preview */}
        <View style={styles.cardPreview}>
          <View style={[styles.previewCard, { backgroundColor: getCardColor() }]}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewBankName}>
                {cardData.bankName || 'Bank Name'}
              </Text>
              <Icon name={getCardIcon()} size={32} color="#FFFFFF" />
            </View>
            
            <Text style={styles.previewCardNumber}>
              {cardData.cardNumber || '•••• •••• •••• ••••'}
            </Text>
            
            <View style={styles.previewDetails}>
              <View>
                <Text style={styles.previewLabel}>CARDHOLDER</Text>
                <Text style={styles.previewValue}>
                  {cardData.cardholderName || 'CARDHOLDER NAME'}
                </Text>
              </View>
              <View>
                <Text style={styles.previewLabel}>EXPIRES</Text>
                <Text style={styles.previewValue}>
                  {cardData.expiryDate || 'MM/YY'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Card Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Card Number</Text>
            <View style={[styles.inputContainer, errors.cardNumber && styles.inputError]}>
              <Icon name="credit-card" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={cardData.cardNumber}
                onChangeText={(value) => handleInputChange('cardNumber', value)}
                placeholder="1234 5678 9012 3456"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                maxLength={19}
              />
            </View>
            {errors.cardNumber && (
              <Text style={styles.errorText}>{errors.cardNumber}</Text>
            )}
          </View>

          {/* Expiry Date and CVV */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Expiry Date</Text>
              <View style={[styles.inputContainer, errors.expiryDate && styles.inputError]}>
                <Icon name="date-range" size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={cardData.expiryDate}
                  onChangeText={(value) => handleInputChange('expiryDate', value)}
                  placeholder="MM/YY"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>
              {errors.expiryDate && (
                <Text style={styles.errorText}>{errors.expiryDate}</Text>
              )}
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>CVV</Text>
              <View style={[styles.inputContainer, errors.cvv && styles.inputError]}>
                <Icon name="lock" size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={cardData.cvv}
                  onChangeText={(value) => handleInputChange('cvv', value)}
                  placeholder="123"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                />
              </View>
              {errors.cvv && (
                <Text style={styles.errorText}>{errors.cvv}</Text>
              )}
            </View>
          </View>

          {/* Cardholder Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cardholder Name</Text>
            <View style={[styles.inputContainer, errors.cardholderName && styles.inputError]}>
              <Icon name="person" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={cardData.cardholderName}
                onChangeText={(value) => handleInputChange('cardholderName', value)}
                placeholder="JOHN DOE"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="characters"
              />
            </View>
            {errors.cardholderName && (
              <Text style={styles.errorText}>{errors.cardholderName}</Text>
            )}
          </View>

          {/* Bank Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bank Name</Text>
            <View style={[styles.inputContainer, errors.bankName && styles.inputError]}>
              <Icon name="account-balance" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={cardData.bankName}
                onChangeText={(value) => handleInputChange('bankName', value)}
                placeholder="KCB Bank"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            {errors.bankName && (
              <Text style={styles.errorText}>{errors.bankName}</Text>
            )}
          </View>
        </View>

        {/* Security Notice */}
        <View style={styles.securityNotice}>
          <Icon name="security" size={24} color="#22C55E" />
          <View style={styles.securityText}>
            <Text style={styles.securityTitle}>Your card is secure</Text>
            <Text style={styles.securityDescription}>
              We use 256-bit SSL encryption to protect your card information. 
              Your details are never stored on our servers.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Add Card Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.addButton,
            Object.values(cardData).every(value => value.trim()) && styles.addButtonActive,
            isLoading && styles.disabledButton,
          ]}
          onPress={handleAddCard}
          disabled={!Object.values(cardData).every(value => value.trim()) || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Icon name="add-circle" size={20} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add Card</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  cardPreview: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  previewCard: {
    width: '90%',
    height: 200,
    borderRadius: 16,
    padding: 20,
    justifyContent: 'space-between',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewBankName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  previewCardNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 2,
    textAlign: 'center',
  },
  previewDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  previewLabel: {
    fontSize: 10,
    color: '#FFFFFF80',
    marginBottom: 4,
    letterSpacing: 1,
  },
  previewValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  form: {
    paddingVertical: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    marginBottom: 4,
  },
  securityDescription: {
    fontSize: 12,
    color: '#16A34A',
    lineHeight: 16,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonActive: {
    backgroundColor: '#22C55E',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default AddCardScreen;