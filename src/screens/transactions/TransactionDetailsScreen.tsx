import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Share,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';

const TransactionDetailsScreen = ({ navigation, route }: any) => {
  const { transaction } = route.params;

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#22C55E';
      case 'pending':
        return '#F59E0B';
      case 'failed':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return 'check-circle';
      case 'pending':
        return 'schedule';
      case 'failed':
        return 'error';
      default:
        return 'help';
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'send':
        return 'arrow-upward';
      case 'receive':
        return 'arrow-downward';
      case 'topup':
        return 'add-circle';
      case 'payment':
        return 'payment';
      default:
        return 'swap-horiz';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'send':
        return '#EF4444';
      case 'receive':
        return '#22C55E';
      case 'topup':
        return '#3B82F6';
      case 'payment':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const handleShare = async () => {
    try {
      const message = `Transaction Receipt\n\nType: ${transaction.type}\nAmount: ${formatCurrency(transaction.amount)}\nStatus: ${transaction.status}\nDate: ${formatDate(transaction.createdAt)}\nReference: ${transaction._id}\n\nPowered by PesaSoft`;
      
      await Share.share({
        message,
        title: 'Transaction Receipt',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to share transaction',
      });
    }
  };

  const handleDownloadReceipt = () => {
    Toast.show({
      type: 'info',
      text1: 'Coming Soon',
      text2: 'Receipt download will be available soon',
    });
  };

  const handleReportIssue = () => {
    navigation.navigate('Chat', {
      chatId: 'support',
      chatName: 'PesaSoft Support',
      type: 'support',
      transactionId: transaction._id,
    });
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
        <Text style={styles.headerTitle}>Transaction Details</Text>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Icon name="share" size={24} color="#22C55E" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={[
            styles.statusIcon,
            { backgroundColor: `${getStatusColor(transaction.status)}20` }
          ]}>
            <Icon
              name={getStatusIcon(transaction.status)}
              size={48}
              color={getStatusColor(transaction.status)}
            />
          </View>
          <Text style={styles.statusText}>
            Transaction {transaction.status}
          </Text>
          <Text style={[
            styles.amountText,
            { color: transaction.type === 'send' ? '#EF4444' : '#22C55E' }
          ]}>
            {transaction.type === 'send' ? '-' : '+'}
            {formatCurrency(transaction.amount)}
          </Text>
        </View>

        {/* Transaction Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardTitle}>Transaction Information</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Type</Text>
            <View style={styles.detailValue}>
              <Icon
                name={getTransactionIcon(transaction.type)}
                size={16}
                color={getTransactionColor(transaction.type)}
                style={styles.detailIcon}
              />
              <Text style={styles.detailText}>
                {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount</Text>
            <Text style={styles.detailText}>
              {formatCurrency(transaction.amount)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Fee</Text>
            <Text style={styles.detailText}>
              {formatCurrency(transaction.fee || 0)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total</Text>
            <Text style={[styles.detailText, styles.totalText]}>
              {formatCurrency(transaction.amount + (transaction.fee || 0))}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date & Time</Text>
            <Text style={styles.detailText}>
              {formatDate(transaction.createdAt)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Reference ID</Text>
            <TouchableOpacity
              style={styles.referenceContainer}
              onPress={() => {
                // Copy to clipboard
                Toast.show({
                  type: 'success',
                  text1: 'Copied',
                  text2: 'Reference ID copied to clipboard',
                });
              }}
            >
              <Text style={styles.referenceText}>{transaction._id}</Text>
              <Icon name="content-copy" size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {transaction.description && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Description</Text>
              <Text style={styles.detailText}>{transaction.description}</Text>
            </View>
          )}
        </View>

        {/* Recipient/Sender Details */}
        {(transaction.recipient || transaction.sender) && (
          <View style={styles.detailsCard}>
            <Text style={styles.cardTitle}>
              {transaction.type === 'send' ? 'Recipient' : 'Sender'} Details
            </Text>
            
            {transaction.recipient && (
              <>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Name</Text>
                  <Text style={styles.detailText}>
                    {transaction.recipient.name}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Phone</Text>
                  <Text style={styles.detailText}>
                    {transaction.recipient.phoneNumber}
                  </Text>
                </View>
              </>
            )}

            {transaction.sender && (
              <>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Name</Text>
                  <Text style={styles.detailText}>
                    {transaction.sender.name}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Phone</Text>
                  <Text style={styles.detailText}>
                    {transaction.sender.phoneNumber}
                  </Text>
                </View>
              </>
            )}
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsCard}>
          <TouchableOpacity style={styles.actionButton} onPress={handleDownloadReceipt}>
            <Icon name="download" size={20} color="#3B82F6" />
            <Text style={styles.actionButtonText}>Download Receipt</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleReportIssue}>
            <Icon name="report-problem" size={20} color="#F59E0B" />
            <Text style={styles.actionButtonText}>Report Issue</Text>
          </TouchableOpacity>

          {transaction.type === 'send' && transaction.recipient && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Send', {
                recipient: transaction.recipient,
              })}
            >
              <Icon name="repeat" size={20} color="#22C55E" />
              <Text style={styles.actionButtonText}>Send Again</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Help Text */}
        <View style={styles.helpCard}>
          <Icon name="info" size={20} color="#6B7280" />
          <Text style={styles.helpText}>
            If you have any questions about this transaction, please contact our support team.
          </Text>
        </View>
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
  shareButton: {
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
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  amountText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  detailValue: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  detailIcon: {
    marginRight: 4,
  },
  detailText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    textAlign: 'right',
    flex: 1,
  },
  totalText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  referenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  referenceText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1F2937',
    marginRight: 8,
    fontFamily: 'monospace',
  },
  actionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginLeft: 12,
  },
  helpCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  helpText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginLeft: 12,
    flex: 1,
  },
});

export default TransactionDetailsScreen;