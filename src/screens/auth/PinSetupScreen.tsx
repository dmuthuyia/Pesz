import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const PinSetupScreen = ({ navigation }: any) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState(1); // 1: Enter PIN, 2: Confirm PIN

  const handleNumberPress = (number: string) => {
    if (step === 1) {
      if (pin.length < 4) {
        setPin(pin + number);
      }
    } else {
      if (confirmPin.length < 4) {
        setConfirmPin(confirmPin + number);
      }
    }
  };

  const handleBackspace = () => {
    if (step === 1) {
      setPin(pin.slice(0, -1));
    } else {
      setConfirmPin(confirmPin.slice(0, -1));
    }
  };

  const handleContinue = () => {
    if (step === 1 && pin.length === 4) {
      setStep(2);
    } else if (step === 2 && confirmPin.length === 4) {
      if (pin === confirmPin) {
        // Save PIN and navigate to main app
        Alert.alert('Success', 'PIN set successfully!', [
          { text: 'OK', onPress: () => navigation.replace('MainTabs') }
        ]);
      } else {
        Alert.alert('Error', 'PINs do not match. Please try again.', [
          { text: 'OK', onPress: () => {
            setStep(1);
            setPin('');
            setConfirmPin('');
          }}
        ]);
      }
    }
  };

  const renderPinDots = (currentPin: string) => {
    return (
      <View style={styles.pinContainer}>
        {[0, 1, 2, 3].map((index) => (
          <View
            key={index}
            style={[
              styles.pinDot,
              index < currentPin.length && styles.pinDotFilled,
            ]}
          />
        ))}
      </View>
    );
  };

  const renderNumberPad = () => {
    const numbers = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['', '0', 'backspace'],
    ];

    return (
      <View style={styles.numberPad}>
        {numbers.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.numberRow}>
            {row.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                style={[
                  styles.numberButton,
                  item === '' && styles.emptyButton,
                ]}
                onPress={() => {
                  if (item === 'backspace') {
                    handleBackspace();
                  } else if (item !== '') {
                    handleNumberPress(item);
                  }
                }}
                disabled={item === ''}
              >
                {item === 'backspace' ? (
                  <Icon name="backspace" size={24} color="#1F2937" />
                ) : (
                  <Text style={styles.numberText}>{item}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>
            {step === 1 ? 'Set Your PIN' : 'Confirm Your PIN'}
          </Text>
          <Text style={styles.subtitle}>
            {step === 1 
              ? 'Create a 4-digit PIN to secure your wallet'
              : 'Enter your PIN again to confirm'
            }
          </Text>
        </View>

        {renderPinDots(step === 1 ? pin : confirmPin)}
        {renderNumberPad()}

        <TouchableOpacity
          style={[
            styles.continueButton,
            ((step === 1 && pin.length === 4) || (step === 2 && confirmPin.length === 4))
              ? styles.continueButtonActive
              : styles.continueButtonInactive,
          ]}
          onPress={handleContinue}
          disabled={
            (step === 1 && pin.length !== 4) || (step === 2 && confirmPin.length !== 4)
          }
        >
          <Text
            style={[
              styles.continueButtonText,
              ((step === 1 && pin.length === 4) || (step === 2 && confirmPin.length === 4))
                ? styles.continueButtonTextActive
                : styles.continueButtonTextInactive,
            ]}
          >
            {step === 1 ? 'Continue' : 'Confirm'}
          </Text>
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
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 48,
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
  numberPad: {
    alignItems: 'center',
    marginBottom: 32,
  },
  numberRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  numberButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  emptyButton: {
    backgroundColor: 'transparent',
  },
  numberText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
  },
  continueButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginHorizontal: 24,
  },
  continueButtonActive: {
    backgroundColor: '#22C55E',
  },
  continueButtonInactive: {
    backgroundColor: '#F3F4F6',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  continueButtonTextActive: {
    color: '#FFFFFF',
  },
  continueButtonTextInactive: {
    color: '#9CA3AF',
  },
});

export default PinSetupScreen;