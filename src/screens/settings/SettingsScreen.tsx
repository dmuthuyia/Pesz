import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../context/AuthContext';
import Toast from 'react-native-toast-message';

const SettingsScreen = ({ navigation }: any) => {
  const { user, logout } = useAuth();
  const [settings, setSettings] = useState({
    biometricAuth: false,
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    darkMode: false,
    autoLock: true,
    transactionAlerts: true,
  });

  const settingsGroups = [
    {
      title: 'Security',
      items: [
        {
          id: 'change-pin',
          title: 'Change PIN',
          subtitle: 'Update your transaction PIN',
          icon: 'lock',
          color: '#EF4444',
          onPress: () => navigation.navigate('ChangePin'),
        },
        {
          id: 'biometric-auth',
          title: 'Biometric Authentication',
          subtitle: 'Use fingerprint or face ID',
          icon: 'fingerprint',
          color: '#3B82F6',
          type: 'switch',
          value: settings.biometricAuth,
          onToggle: (value: boolean) => setSettings(prev => ({ ...prev, biometricAuth: value })),
        },
        {
          id: 'auto-lock',
          title: 'Auto Lock',
          subtitle: 'Lock app when inactive',
          icon: 'lock-clock',
          color: '#8B5CF6',
          type: 'switch',
          value: settings.autoLock,
          onToggle: (value: boolean) => setSettings(prev => ({ ...prev, autoLock: value })),
        },
        {
          id: 'two-factor',
          title: 'Two-Factor Authentication',
          subtitle: 'Add extra security to your account',
          icon: 'security',
          color: '#22C55E',
          onPress: () => navigation.navigate('TwoFactor'),
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          id: 'push-notifications',
          title: 'Push Notifications',
          subtitle: 'Receive app notifications',
          icon: 'notifications',
          color: '#F59E0B',
          type: 'switch',
          value: settings.pushNotifications,
          onToggle: (value: boolean) => setSettings(prev => ({ ...prev, pushNotifications: value })),
        },
        {
          id: 'email-notifications',
          title: 'Email Notifications',
          subtitle: 'Receive email updates',
          icon: 'email',
          color: '#3B82F6',
          type: 'switch',
          value: settings.emailNotifications,
          onToggle: (value: boolean) => setSettings(prev => ({ ...prev, emailNotifications: value })),
        },
        {
          id: 'sms-notifications',
          title: 'SMS Notifications',
          subtitle: 'Receive SMS alerts',
          icon: 'sms',
          color: '#22C55E',
          type: 'switch',
          value: settings.smsNotifications,
          onToggle: (value: boolean) => setSettings(prev => ({ ...prev, smsNotifications: value })),
        },
        {
          id: 'transaction-alerts',
          title: 'Transaction Alerts',
          subtitle: 'Get notified of all transactions',
          icon: 'receipt',
          color: '#EF4444',
          type: 'switch',
          value: settings.transactionAlerts,
          onToggle: (value: boolean) => setSettings(prev => ({ ...prev, transactionAlerts: value })),
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          id: 'dark-mode',
          title: 'Dark Mode',
          subtitle: 'Use dark theme',
          icon: 'dark-mode',
          color: '#374151',
          type: 'switch',
          value: settings.darkMode,
          onToggle: (value: boolean) => setSettings(prev => ({ ...prev, darkMode: value })),
        },
        {
          id: 'language',
          title: 'Language',
          subtitle: 'English',
          icon: 'language',
          color: '#8B5CF6',
          onPress: () => navigation.navigate('Language'),
        },
        {
          id: 'currency',
          title: 'Currency',
          subtitle: 'Kenyan Shilling (KES)',
          icon: 'attach-money',
          color: '#22C55E',
          onPress: () => navigation.navigate('Currency'),
        },
        {
          id: 'backup',
          title: 'Backup & Sync',
          subtitle: 'Backup your data',
          icon: 'backup',
          color: '#3B82F6',
          onPress: () => navigation.navigate('Backup'),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          id: 'help-center',
          title: 'Help Center',
          subtitle: 'Get help and support',
          icon: 'help',
          color: '#6B7280',
          onPress: () => navigation.navigate('HelpCenter'),
        },
        {
          id: 'contact-support',
          title: 'Contact Support',
          subtitle: 'Chat with our support team',
          icon: 'support-agent',
          color: '#22C55E',
          onPress: () => navigation.navigate('Chat', {
            chatId: 'support',
            chatName: 'PesaSoft Support',
            type: 'support',
          }),
        },
        {
          id: 'feedback',
          title: 'Send Feedback',
          subtitle: 'Help us improve the app',
          icon: 'feedback',
          color: '#F59E0B',
          onPress: () => navigation.navigate('Feedback'),
        },
        {
          id: 'rate-app',
          title: 'Rate App',
          subtitle: 'Rate us on the app store',
          icon: 'star',
          color: '#F59E0B',
          onPress: () => {
            Toast.show({
              type: 'info',
              text1: 'Thank you!',
              text2: 'Redirecting to app store...',
            });
          },
        },
      ],
    },
    {
      title: 'Legal',
      items: [
        {
          id: 'privacy-policy',
          title: 'Privacy Policy',
          subtitle: 'How we protect your data',
          icon: 'privacy-tip',
          color: '#6B7280',
          onPress: () => navigation.navigate('PrivacyPolicy'),
        },
        {
          id: 'terms-of-service',
          title: 'Terms of Service',
          subtitle: 'Our terms and conditions',
          icon: 'description',
          color: '#6B7280',
          onPress: () => navigation.navigate('TermsOfService'),
        },
        {
          id: 'licenses',
          title: 'Open Source Licenses',
          subtitle: 'Third-party licenses',
          icon: 'code',
          color: '#6B7280',
          onPress: () => navigation.navigate('Licenses'),
        },
      ],
    },
  ];

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              Toast.show({
                type: 'success',
                text1: 'Logged Out',
                text2: 'You have been successfully logged out',
              });
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to logout',
              });
            }
          },
        },
      ]
    );
  };

  const renderSettingItem = (item: any) => (
    <TouchableOpacity
      key={item.id}
      style={styles.settingItem}
      onPress={item.onPress}
      disabled={item.type === 'switch'}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.settingIcon, { backgroundColor: `${item.color}20` }]}>
          <Icon name={item.icon} size={24} color={item.color} />
        </View>
        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>{item.title}</Text>
          <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
        </View>
      </View>
      
      <View style={styles.settingRight}>
        {item.type === 'switch' ? (
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{ false: '#E5E7EB', true: '#22C55E40' }}
            thumbColor={item.value ? '#22C55E' : '#9CA3AF'}
          />
        ) : (
          <Icon name="chevron-right" size={24} color="#9CA3AF" />
        )}
      </View>
    </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Info */}
        <View style={styles.userInfo}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>
              {user?.firstName} {user?.lastName}
            </Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>

        {/* Settings Groups */}
        {settingsGroups.map((group) => (
          <View key={group.title} style={styles.settingsGroup}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <View style={styles.groupItems}>
              {group.items.map(renderSettingItem)}
            </View>
          </View>
        ))}

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>PesaSoft v1.0.0</Text>
          <Text style={styles.appBuild}>Build 2024.01.15</Text>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="logout" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* Delete Account */}
        <TouchableOpacity
          style={styles.deleteAccountButton}
          onPress={() => {
            Alert.alert(
              'Delete Account',
              'This action cannot be undone. All your data will be permanently deleted.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => {
                    Toast.show({
                      type: 'info',
                      text1: 'Coming Soon',
                      text2: 'Account deletion will be available soon',
                    });
                  },
                },
              ]
            );
          }}
        >
          <Text style={styles.deleteAccountText}>Delete Account</Text>
        </TouchableOpacity>
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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 20,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  settingsGroup: {
    marginBottom: 20,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  groupItems: {
    backgroundColor: '#FFFFFF',
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
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  settingRight: {
    marginLeft: 12,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  appVersion: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  appBuild: {
    fontSize: 12,
    color: '#D1D5DB',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 12,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 8,
  },
  deleteAccountButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 20,
  },
  deleteAccountText: {
    fontSize: 14,
    color: '#9CA3AF',
    textDecorationLine: 'underline',
  },
});

export default SettingsScreen;