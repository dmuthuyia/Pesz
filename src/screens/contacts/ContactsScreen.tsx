import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
  PermissionsAndroid,
  Platform,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Contacts from 'react-native-contacts';
import { userAPI } from '../../services/api';
import Toast from 'react-native-toast-message';

interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
  isRegistered: boolean;
  avatar?: string;
}

const ContactsScreen = ({ navigation }: any) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    requestContactsPermission();
  }, []);

  useEffect(() => {
    filterContacts();
  }, [contacts, searchQuery]);

  const requestContactsPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
          {
            title: 'Contacts Permission',
            message: 'PesaSoft needs access to your contacts to help you send money to friends.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setHasPermission(true);
          loadContacts();
        } else {
          setHasPermission(false);
          showPermissionAlert();
        }
      } catch (error) {
        console.error('Permission error:', error);
      }
    } else {
      // iOS permission handling would go here
      setHasPermission(true);
      loadContacts();
    }
  };

  const showPermissionAlert = () => {
    Alert.alert(
      'Contacts Permission Required',
      'To help you send money to your contacts, please allow access to your contacts in settings.',
      [
        { text: 'Cancel', onPress: () => navigation.goBack() },
        { text: 'Settings', onPress: () => {} },
      ]
    );
  };

  const loadContacts = async () => {
    setIsLoading(true);
    try {
      const deviceContacts = await Contacts.getAll();
      
      // Process contacts and check which ones are registered
      const processedContacts: Contact[] = [];
      
      for (const contact of deviceContacts) {
        if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
          const phoneNumber = contact.phoneNumbers[0].number.replace(/\s+/g, '');
          
          // Check if contact is registered (mock implementation)
          const isRegistered = Math.random() > 0.7; // 30% chance of being registered
          
          processedContacts.push({
            id: contact.recordID,
            name: `${contact.givenName || ''} ${contact.familyName || ''}`.trim() || 'Unknown',
            phoneNumber,
            isRegistered,
          });
        }
      }

      // Sort contacts: registered first, then alphabetically
      processedContacts.sort((a, b) => {
        if (a.isRegistered && !b.isRegistered) return -1;
        if (!a.isRegistered && b.isRegistered) return 1;
        return a.name.localeCompare(b.name);
      });

      setContacts(processedContacts);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load contacts',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterContacts = () => {
    if (!searchQuery) {
      setFilteredContacts(contacts);
      return;
    }

    const filtered = contacts.filter(contact =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phoneNumber.includes(searchQuery)
    );
    setFilteredContacts(filtered);
  };

  const handleContactSelect = (contact: Contact) => {
    if (contact.isRegistered) {
      navigation.navigate('Send', {
        recipient: {
          name: contact.name,
          phoneNumber: contact.phoneNumber,
        },
      });
    } else {
      Alert.alert(
        'Invite to PesaSoft',
        `${contact.name} is not on PesaSoft yet. Would you like to invite them?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Invite', onPress: () => inviteContact(contact) },
        ]
      );
    }
  };

  const inviteContact = (contact: Contact) => {
    // Implement SMS invitation
    Toast.show({
      type: 'info',
      text1: 'Invitation Sent',
      text2: `Invitation sent to ${contact.name}`,
    });
  };

  const startNewChat = (contact: Contact) => {
    if (contact.isRegistered) {
      navigation.navigate('Chat', {
        chatId: contact.id,
        chatName: contact.name,
        type: 'personal',
      });
    } else {
      Toast.show({
        type: 'info',
        text1: 'Not Available',
        text2: `${contact.name} is not on PesaSoft yet`,
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderContact = ({ item }: { item: Contact }) => (
    <TouchableOpacity
      style={styles.contactItem}
      onPress={() => handleContactSelect(item)}
    >
      <View style={styles.contactLeft}>
        <View style={[
          styles.avatar,
          { backgroundColor: item.isRegistered ? '#22C55E20' : '#F3F4F6' }
        ]}>
          <Text style={[
            styles.avatarText,
            { color: item.isRegistered ? '#22C55E' : '#9CA3AF' }
          ]}>
            {getInitials(item.name)}
          </Text>
        </View>
        
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{item.name}</Text>
          <Text style={styles.contactPhone}>{item.phoneNumber}</Text>
          {item.isRegistered && (
            <Text style={styles.registeredBadge}>On PesaSoft</Text>
          )}
        </View>
      </View>

      <View style={styles.contactActions}>
        {item.isRegistered ? (
          <>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => startNewChat(item)}
            >
              <Icon name="chat" size={20} color="#3B82F6" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleContactSelect(item)}
            >
              <Icon name="send" size={20} color="#22C55E" />
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={styles.inviteButton}
            onPress={() => inviteContact(item)}
          >
            <Text style={styles.inviteButtonText}>Invite</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="contacts" size={64} color="#D1D5DB" />
      <Text style={styles.emptyStateTitle}>No contacts found</Text>
      <Text style={styles.emptyStateText}>
        {searchQuery
          ? 'Try adjusting your search'
          : 'Your contacts will appear here once you grant permission'
        }
      </Text>
    </View>
  );

  const renderPermissionState = () => (
    <View style={styles.permissionState}>
      <Icon name="contacts" size={64} color="#D1D5DB" />
      <Text style={styles.permissionTitle}>Contacts Permission Required</Text>
      <Text style={styles.permissionText}>
        Allow PesaSoft to access your contacts to easily send money to friends and family.
      </Text>
      <TouchableOpacity
        style={styles.permissionButton}
        onPress={requestContactsPermission}
      >
        <Text style={styles.permissionButtonText}>Allow Access</Text>
      </TouchableOpacity>
    </View>
  );

  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Contacts</Text>
          <View style={styles.placeholder} />
        </View>
        {renderPermissionState()}
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>Contacts</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadContacts}
          disabled={isLoading}
        >
          <Icon name="refresh" size={24} color="#22C55E" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search contacts..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSearchQuery('')}
          >
            <Icon name="clear" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          {filteredContacts.filter(c => c.isRegistered).length} of {filteredContacts.length} contacts on PesaSoft
        </Text>
      </View>

      {/* Contacts List */}
      <FlatList
        data={filteredContacts}
        renderItem={renderContact}
        keyExtractor={(item) => item.id}
        style={styles.contactsList}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        refreshing={isLoading}
        onRefresh={loadContacts}
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#22C55E20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  clearButton: {
    padding: 4,
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  statsText: {
    fontSize: 14,
    color: '#6B7280',
  },
  contactsList: {
    flex: 1,
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  contactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  registeredBadge: {
    fontSize: 12,
    color: '#22C55E',
    fontWeight: '500',
  },
  contactActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  inviteButton: {
    backgroundColor: '#22C55E',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  inviteButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
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
  permissionState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: '#22C55E',
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ContactsScreen;