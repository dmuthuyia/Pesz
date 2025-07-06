import React, { useState, useEffect } from 'react';
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
import { transactionAPI, userAPI } from '../../services/api';
import Toast from 'react-native-toast-message';

const SendMoneyScreen = ({ navigation }: any) => {
  const { user, wallet } = useAuth();
  const [step, setStep] = useState(1); // 1: Recipient, 2: Amount, 3: Confirm, 4: PIN
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState(null);

  useEffect(() => {
    if (recipient.length > 2) {
      searchUsers();
    } else {
      setSearchResults([]);
    }
  }, [recipient]);

  const searchUsers = async () => {
    try {
      const response = await userAPI.searchUsers(recipient);
      if (response.success) {
        setSearchResults(response.data.users);
      }
    } catch (error) {
      console.error('Search users error:', error);
    }
  };

  const handleRecipientSelect = (user: any) => {
    setSelectedRecipient(user);
    setRecipient(`${user.firstName} ${user.lastName} - ${user.phoneNumber}`);
    setSearchResults([]);
    setStep(2);
  };

  const handleAmountChange = (value: string) => {
    // Only allow numbers and decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    setAmount(numericValue);
  };

  const handleContinue = () => {
    if (step === 1) {
      if (!selectedRecipient) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Please select a recipient',
        });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!amount || parseFloat(amount) <= 0) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Please enter a valid amount',
        });
        return;
      }
      if (parseFloat(amount) > (wallet?.balance || 0)) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Insufficient balance',
        });
        return;
      }
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const handlePinInput = (digit: string) => {
    if (pin.length < 4) {
      setPin(pin + digit);
    }
  };

  const handlePinBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  const handleSendMoney = async () => {
    if (pin.length !== 4) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter your 4-digit PIN',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await transactionAPI.sendMoney({
        recipientId: selectedRecipient._id,
        amount: parseFloat(amount),
        description,
        pin,
      });

      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Money sent successfully!',
        });
        navigation.navigate('Home');
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to send money',
      });
      setPin('');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    return isNaN(num) ? 'KES 0' : `KES ${num.toLocaleString()}`;
  };

  const renderPinPad = () => {
    const numbers = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['', '0', 'backspace'],
    ];

    return (
      <View style={styles.pinPad}>
        {numbers.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.pinRow}>
            {row.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                style={[
                  styles.pinButton,
                  item === '' && styles.emptyPinButton,
                ]}
                onPress={() => {
                  if (item === 'backspace') {
                    handlePinBackspace();
                  } else if (item !== '') {
                    handlePinInput(item);
                  }
                }}
                disabled={item === '' || isLoading}
              >
                {item === 'backspace' ? (
                  <Icon name="backspace" size={24} color="#1F2937" />
                ) : (
                  <Text style={styles.pinButtonText}>{item}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    );
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Send Money To</Text>
            <Text style={styles.stepSubtitle}>Enter recipient's name or phone number</Text>

            <View style={styles.inputContainer}>
              <Icon name="person" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={recipient}
                onChangeText={setRecipient}
                placeholder="Name or phone number"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {searchResults.length > 0 && (
              <View style={styles.searchResults}>
                {searchResults.map((user: any) => (
                  <TouchableOpacity
                    key={user._id}
                    style={styles.searchResultItem}
                    onPress={() => handleRecipientSelect(user)}
                  >
                    <View style={styles.userAvatar}>
                      <Text style={styles.userAvatarText}>
                        {user.firstName[0]}{user.lastName[0]}
                      </Text>
                    </View>
                    <View style={styles.userInfo}>
                      <Text style={styles.userName}>
                        {user.firstName} {user.lastName}
                      </Text>
                      <Text style={styles.userPhone}>{user.phoneNumber}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Enter Amount</Text>
            <Text style={styles.stepSubtitle}>
              Available balance: KES {(wallet?.balance || 0).toLocaleString()}
            </Text>

            <View style={styles.amountContainer}>
              <Text style={styles.currencySymbol}>KES</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={handleAmountChange}
                placeholder="0"
                placeholderTextColor="#D1D5DB"
                keyboardType="numeric"
                autoFocus
              />
            </View>

            <View style={styles.inputContainer}>
              <Icon name="description" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={description}
                onChangeText={setDescription}
                placeholder="Description (optional)"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.quickAmounts}>
              {['100', '500', '1000', '2000'].map((quickAmount) => (
                <TouchableOpacity
                  key={quickAmount}
                  style={styles.quickAmountButton}
                  onPress={() => setAmount(quickAmount)}
                >
                  <Text style={styles.quickAmountText}>+{quickAmount}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Confirm Transaction</Text>
            <Text style={styles.stepSubtitle}>Please review the details below</Text>

            <View style={styles.confirmationCard}>
              <View style={styles.confirmationRow}>
                <Text style={styles.confirmationLabel}>Recipient</Text>
                <Text style={styles.confirmationValue}>
                  {selectedRecipient?.firstName} {selectedRecipient?.lastName}
                </Text>
              </View>
              <View style={styles.confirmationRow}>
                <Text style={styles.confirmationLabel}>Phone Number</Text>
                <Text style={styles.confirmationValue}>
                  {selectedRecipient?.phoneNumber}
                </Text>
              </View>
              <View style={styles.confirmationRow}>
                <Text style={styles.confirmationLabel}>Amount</Text>
                <Text style={styles.confirmationValue}>
                  {formatCurrency(amount)}
                </Text>
              </View>
              {description && (
                <View style={styles.confirmationRow}>
                  <Text style={styles.confirmationLabel}>Description</Text>
                  <Text style={styles.confirmationValue}>{description}</Text>
                </View>
              )}
              <View style={styles.divider} />
              <View style={styles.confirmationRow}>
                <Text style={styles.confirmationLabel}>Transaction Fee</Text>
                <Text style={styles.confirmationValue}>KES 0</Text>
              </View>
              <View style={styles.confirmationRow}>
                <Text style={[styles.confirmationLabel, styles.totalLabel]}>Total</Text>
                <Text style={[styles.confirmationValue, styles.totalValue]}>
                  {formatCurrency(amount)}
                </Text>
              </View>
            </View>
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Enter PIN</Text>
            <Text style={styles.stepSubtitle}>Enter your 4-digit PIN to confirm</Text>

            <View style={styles.pinContainer}>
              {[0, 1, 2, 3].map((index) => (
                <View
                  key={index}
                  style={[
                    styles.pinDot,
                    index < pin.length && styles.pinDotFilled,
                  ]}
                />
              ))}
            </View>

            {renderPinPad()}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (step > 1) {
              setStep(step - 1);
            } else {
              navigation.goBack();
            }
          }}
        >
          <Icon name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Send Money</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        {[1, 2, 3, 4].map((stepNumber) => (
          <View
            key={stepNumber}
            style={[
              styles.progressDot,
              stepNumber <= step && styles.progressDotActive,
            ]}
          />
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderStepContent()}
      </ScrollView>

      {/* Continue Button */}
      {step < 4 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              ((step === 1 && selectedRecipient) ||
                (step === 2 && amount && parseFloat(amount) > 0) ||
                step === 3) && styles.continueButtonActive,
            ]}
            onPress={handleContinue}
            disabled={
              (step === 1 && !selectedRecipient) ||
              (step === 2 && (!amount || parseFloat(amount) <= 0))
            }
          >
            <Text
              style={[
                styles.continueButtonText,
                ((step === 1 && selectedRecipient) ||
                  (step === 2 && amount && parseFloat(amount) > 0) ||
                  step === 3) && styles.continueButtonTextActive,
              ]}
            >
              Continue
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Send Button for PIN step */}
      {step === 4 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              pin.length === 4 && styles.continueButtonActive,
              isLoading && styles.disabledButton,
            ]}
            onPress={handleSendMoney}
            disabled={pin.length !== 4 || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text
                style={[
                  styles.continueButtonText,
                  pin.length === 4 && styles.continueButtonTextActive,
                ]}
              >
                Send Money
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
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
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: '#22C55E',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepContent: {
    paddingVertical: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    marginBottom: 16,
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
  searchResults: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 8,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: '#6B7280',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '600',
    color: '#6B7280',
    marginRight: 8,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    minWidth: 100,
  },
  quickAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  quickAmountButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  confirmationCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 20,
  },
  confirmationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  confirmationLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  confirmationValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#22C55E',
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginHorizontal: 12,
  },
  pinDotFilled: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  pinPad: {
    alignItems: 'center',
  },
  pinRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  pinButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  emptyPinButton: {
    backgroundColor: 'transparent',
  },
  pinButtonText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  continueButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueButtonActive: {
    backgroundColor: '#22C55E',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  continueButtonTextActive: {
    color: '#FFFFFF',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default SendMoneyScreen;