import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  RefreshControl,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'transaction' | 'security' | 'promotion' | 'system';
  timestamp: Date;
  isRead: boolean;
  icon: string;
  color: string;
}

const NotificationsScreen = ({ navigation }: any) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    transactions: true,
    security: true,
    promotions: false,
    system: true,
  });

  // Mock notifications data
  const mockNotifications: Notification[] = [
    {
      id: '1',
      title: 'Payment Received',
      message: 'You received KES 2,500 from John Doe',
      type: 'transaction',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      isRead: false,
      icon: 'arrow-downward',
      color: '#22C55E',
    },
    {
      id: '2',
      title: 'Security Alert',
      message: 'New device login detected from Nairobi',
      type: 'security',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      isRead: false,
      icon: 'security',
      color: '#EF4444',
    },
    {
      id: '3',
      title: 'Payment Sent',
      message: 'KES 1,000 sent to Sarah Wilson successfully',
      type: 'transaction',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      isRead: true,
      icon: 'arrow-upward',
      color: '#3B82F6',
    },
    {
      id: '4',
      title: 'Special Offer',
      message: 'Get 5% cashback on your next top-up!',
      type: 'promotion',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
      isRead: true,
      icon: 'local-offer',
      color: '#F59E0B',
    },
    {
      id: '5',
      title: 'System Maintenance',
      message: 'Scheduled maintenance on Sunday 2AM - 4AM',
      type: 'system',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      isRead: true,
      icon: 'build',
      color: '#8B5CF6',
    },
  ];

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    // Simulate API call
    setNotifications(mockNotifications);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadNotifications();
    setIsRefreshing(false);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return timestamp.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.isRead && styles.unreadNotification]}
      onPress={() => markAsRead(item.id)}
    >
      <View style={styles.notificationLeft}>
        <View style={[styles.notificationIcon, { backgroundColor: `${item.color}20` }]}>
          <Icon name={item.icon} size={24} color={item.color} />
        </View>
        <View style={styles.notificationContent}>
          <Text style={[styles.notificationTitle, !item.isRead && styles.unreadTitle]}>
            {item.title}
          </Text>
          <Text style={styles.notificationMessage} numberOfLines={2}>
            {item.message}
          </Text>
          <Text style={styles.notificationTime}>
            {formatTimestamp(item.timestamp)}
          </Text>
        </View>
      </View>
      
      <View style={styles.notificationRight}>
        {!item.isRead && <View style={styles.unreadDot} />}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteNotification(item.id)}
        >
          <Icon name="close" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="notifications-none" size={64} color="#D1D5DB" />
      <Text style={styles.emptyStateTitle}>No notifications</Text>
      <Text style={styles.emptyStateText}>
        You're all caught up! New notifications will appear here.
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerActions}>
      {unreadCount > 0 && (
        <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
          <Icon name="done-all" size={20} color="#22C55E" />
          <Text style={styles.markAllText}>Mark all as read</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderSettings = () => (
    <View style={styles.settingsSection}>
      <Text style={styles.settingsTitle}>Notification Settings</Text>
      
      <View style={styles.settingItem}>
        <View style={styles.settingLeft}>
          <Icon name="swap-horiz" size={24} color="#22C55E" />
          <View style={styles.settingInfo}>
            <Text style={styles.settingName}>Transactions</Text>
            <Text style={styles.settingDescription}>
              Get notified about payments and transfers
            </Text>
          </View>
        </View>
        <Switch
          value={notificationSettings.transactions}
          onValueChange={(value) =>
            setNotificationSettings(prev => ({ ...prev, transactions: value }))
          }
          trackColor={{ false: '#E5E7EB', true: '#22C55E40' }}
          thumbColor={notificationSettings.transactions ? '#22C55E' : '#9CA3AF'}
        />
      </View>

      <View style={styles.settingItem}>
        <View style={styles.settingLeft}>
          <Icon name="security" size={24} color="#EF4444" />
          <View style={styles.settingInfo}>
            <Text style={styles.settingName}>Security</Text>
            <Text style={styles.settingDescription}>
              Important security alerts and login notifications
            </Text>
          </View>
        </View>
        <Switch
          value={notificationSettings.security}
          onValueChange={(value) =>
            setNotificationSettings(prev => ({ ...prev, security: value }))
          }
          trackColor={{ false: '#E5E7EB', true: '#22C55E40' }}
          thumbColor={notificationSettings.security ? '#22C55E' : '#9CA3AF'}
        />
      </View>

      <View style={styles.settingItem}>
        <View style={styles.settingLeft}>
          <Icon name="local-offer" size={24} color="#F59E0B" />
          <View style={styles.settingInfo}>
            <Text style={styles.settingName}>Promotions</Text>
            <Text style={styles.settingDescription}>
              Special offers and promotional content
            </Text>
          </View>
        </View>
        <Switch
          value={notificationSettings.promotions}
          onValueChange={(value) =>
            setNotificationSettings(prev => ({ ...prev, promotions: value }))
          }
          trackColor={{ false: '#E5E7EB', true: '#22C55E40' }}
          thumbColor={notificationSettings.promotions ? '#22C55E' : '#9CA3AF'}
        />
      </View>

      <View style={styles.settingItem}>
        <View style={styles.settingLeft}>
          <Icon name="build" size={24} color="#8B5CF6" />
          <View style={styles.settingInfo}>
            <Text style={styles.settingName}>System Updates</Text>
            <Text style={styles.settingDescription}>
              App updates and maintenance notifications
            </Text>
          </View>
        </View>
        <Switch
          value={notificationSettings.system}
          onValueChange={(value) =>
            setNotificationSettings(prev => ({ ...prev, system: value }))
          }
          trackColor={{ false: '#E5E7EB', true: '#22C55E40' }}
          thumbColor={notificationSettings.system ? '#22C55E' : '#9CA3AF'}
        />
      </View>
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
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.settingsButton}>
          <Icon name="tune" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        style={styles.notificationsList}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderSettings}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={notifications.length === 0 ? styles.emptyContainer : undefined}
      />
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
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  unreadBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  markAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#22C55E',
    marginLeft: 4,
  },
  notificationsList: {
    flex: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  unreadNotification: {
    backgroundColor: '#F0FDF4',
  },
  notificationLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  unreadTitle: {
    fontWeight: '600',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  notificationRight: {
    alignItems: 'center',
    marginLeft: 12,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    marginBottom: 8,
  },
  deleteButton: {
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
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
  },
  settingsSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 20,
    paddingVertical: 20,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  settingName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default NotificationsScreen;