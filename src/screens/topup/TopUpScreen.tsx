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
import { useAuth } from '../../context/AuthContext';
import { transactionAPI } from '../../services/api';
import Toast from 'react-native-toast-message';

const TopUpScreen = ({ navigation }: any) => {
  const { user, wallet } = useAuth();
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [selectedMethod, setSelectedMethod] = useState('mpesa');
  const [isLoading, setIsLoading] = useState(false);

  const topUpMethods = [
    {
      id: 'mpesa',
      name: 'M-Pesa',
      icon: 'phone-android',
      description: 'Top up using M-Pesa STK Push',
      color: '#22C55E',
    },
    {
      id: 'card',
      name: 'Debit/Credit Card',
      icon: 'credit-card',
      description: 'Top up using your saved cards',
      color: '#3B82F6',
    },
    {
      id: 'bank',
      name: 'Bank Transfer',
      icon: 'account-balance',
      description: 'Transfer from your bank account',
      color: '#8B5CF6',
    },
  ];

  const quickAmounts = [100, 500, 1000, 2000, 5000, 10000];

  const handleAmountChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setAmount(numericValue);
  };

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
  };

  const handleTopUp = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a valid amount',
      });
      return;
    }

    if (parseFloat(amount) < 10) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Minimum top-up amount is KES 10',
      });
      return;
    }

    if (parseFloat(amount) > 150000) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Maximum top-up amount is KES 150,000',
      });
      return;
    }

    setIsLoading(true);
    try {
      let response;
      
      if (selectedMethod === 'mpesa') {
        response = await transactionAPI.topUpWallet({
          amount: parseFloat(amount),
          phoneNumber: phoneNumber,
          method: 'mpesa',
        });
      } else if (selectedMethod === 'card') {
        // Navigate to card selection or payment
        navigation.navigate('Cards');
        return;
      } else {
        // Bank transfer
        Alert.alert(
          'Bank Transfer',
          'You will be redirected to your banking app to complete the transfer.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Continue', onPress: () => {} },
          ]
        );
        return;
      }

      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Top-up request sent! Check your phone for M-Pesa prompt.',
        });
        
        // Navigate back to home after a delay
        setTimeout(() => {
          navigation.navigate('Home');
        }, 2000);
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to initiate top-up',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    return isNaN(num) ? 'KES 0' : `KES ${num.toLocaleString()}`;
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
        <Text style={styles.headerTitle}>Top Up Wallet</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Balance */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <Text style={styles.balanceAmount}>
            KES {(wallet?.balance || 0).toLocaleString()}
          </Text>
        </View>

        {/* Amount Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Enter Amount</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>KES</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={handleAmountChange}
              placeholder="0"
              placeholderTextColor="#D1D5DB"
              keyboardType="numeric"
              maxLength={6}
            />
          </View>
          
          {amount && (
            <Text style={styles.amountPreview}>
              You will top up {formatCurrency(amount)}
            </Text>
          )}
        </View>

        {/* Quick Amounts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Amounts</Text>
          <View style={styles.quickAmountsGrid}>
            {quickAmounts.map((quickAmount) => (
              <TouchableOpacity
                key={quickAmount}
                style={[
                  styles.quickAmountButton,
                  amount === quickAmount.toString() && styles.quickAmountButtonActive,
                ]}
                onPress={() => handleQuickAmount(quickAmount)}
              >
                <Text
                  style={[
                    styles.quickAmountText,
                    amount === quickAmount.toString() && styles.quickAmountTextActive,
                  ]}
                >
                  {quickAmount.toLocaleString()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Top-up Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Payment Method</Text>
          {topUpMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodCard,
                selectedMethod === method.id && styles.methodCardActive,
              ]}
              onPress={() => setSelectedMethod(method.id)}
            >
              <View style={styles.methodLeft}>
                <View
                  style={[
                    styles.methodIcon,
                    { backgroundColor: `${method.color}20` },
                  ]}
                >
                  <Icon name={method.icon} size={24} color={method.color} />
                </View>
                <View style={styles.methodInfo}>
                  <Text style={styles.methodName}>{method.name}</Text>
                  <Text style={styles.methodDescription}>{method.description}</Text>
                </View>
              </View>
              <View
                style={[
                  styles.radioButton,
                  selectedMethod === method.id && styles.radioButtonActive,
                ]}
              >
                {selectedMethod === method.id && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Phone Number for M-Pesa */}
        {selectedMethod === 'mpesa' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>M-Pesa Phone Number</Text>
            <View style={styles.inputContainer}>
              <Icon name="phone" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="0712345678"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                maxLength={13}
              />
            </View>
          </View>
        )}

        {/* Transaction Limits */}
        <View style={styles.limitsCard}>
          <Text style={styles.limitsTitle}>Transaction Limits</Text>
          <View style={styles.limitRow}>
            <Text style={styles.limitLabel}>Minimum:</Text>
            <Text style={styles.limitValue}>KES 10</Text>
          </View>
          <View style={styles.limitRow}>
            <Text style={styles.limitLabel}>Maximum:</Text>
            <Text style={styles.limitValue}>KES 150,000</Text>
          </View>
          <View style={styles.limitRow}>
            <Text style={styles.limitLabel}>Daily Limit:</Text>
            <Text style={styles.limitValue}>KES 300,000</Text>
          </View>
        </View>
      </ScrollView>

      {/* Top Up Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.topUpButton,
            amount && parseFloat(amount) >= 10 && styles.topUpButtonActive,
            isLoading && styles.disabledButton,
          ]}
          onPress={handleTopUp}
          disabled={!amount || parseFloat(amount) < 10 || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Icon name="add-circle" size={20} color="#FFFFFF" />
              <Text style={styles.topUpButtonText}>
                Top Up {amount ? formatCurrency(amount) : 'Wallet'}
              </Text>
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
  balanceCard: {
    backgroundColor: '#22C55E',
    borderRadius: 16,
    padding: 20,
    marginVertical: 20,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#FFFFFF80',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingVertical: 20,
    marginBottom: 8,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '600',
    color: '#6B7280',
    marginRight: 8,
  },
  amountInput: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    minWidth: 100,
  },
  amountPreview: {
    fontSize: 14,
    color: '#22C55E',
    textAlign: 'center',
    fontWeight: '500',
  },
  quickAmountsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAmountButton: {
    width: '30%',
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quickAmountButtonActive: {
    backgroundColor: '#22C55E20',
    borderColor: '#22C55E',
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  quickAmountTextActive: {
    color: '#22C55E',
    fontWeight: '600',
  },
  methodCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  methodCardActive: {
    backgroundColor: '#22C55E10',
    borderColor: '#22C55E',
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  methodDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonActive: {
    borderColor: '#22C55E',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22C55E',
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
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  limitsCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  limitsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  limitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  limitLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  limitValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  topUpButton: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topUpButtonActive: {
    backgroundColor: '#22C55E',
  },
  topUpButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default TopUpScreen;