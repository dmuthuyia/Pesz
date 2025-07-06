import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../context/AuthContext';

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  senderId: string;
  senderName: string;
  type: 'text' | 'payment' | 'system';
  paymentData?: {
    amount: number;
    status: 'pending' | 'completed' | 'failed';
  };
}

const ChatScreen = ({ navigation, route }: any) => {
  const { user } = useAuth();
  const { chatId, chatName, type } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Mock messages - replace with actual API calls
  const mockMessages: Message[] = [
    {
      id: '1',
      text: 'Hi! How can I help you today?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      senderId: chatId === 'support' ? 'support' : 'other',
      senderName: chatId === 'support' ? 'Support Agent' : chatName,
      type: 'text',
    },
    {
      id: '2',
      text: 'I need help with my recent transaction',
      timestamp: new Date(Date.now() - 1000 * 60 * 50),
      senderId: user?._id || 'me',
      senderName: `${user?.firstName} ${user?.lastName}`,
      type: 'text',
    },
    {
      id: '3',
      text: 'Payment sent successfully',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      senderId: user?._id || 'me',
      senderName: `${user?.firstName} ${user?.lastName}`,
      type: 'payment',
      paymentData: {
        amount: 1500,
        status: 'completed',
      },
    },
    {
      id: '4',
      text: 'Thank you for the payment!',
      timestamp: new Date(Date.now() - 1000 * 60 * 25),
      senderId: chatId === 'support' ? 'support' : 'other',
      senderName: chatId === 'support' ? 'Support Agent' : chatName,
      type: 'text',
    },
  ];

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    // Simulate API call
    setMessages(mockMessages);
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      timestamp: new Date(),
      senderId: user?._id || 'me',
      senderName: `${user?.firstName} ${user?.lastName}`,
      type: 'text',
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // Simulate typing indicator and response
    if (type === 'support') {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const response: Message = {
          id: (Date.now() + 1).toString(),
          text: 'Thank you for your message. Our team will get back to you shortly.',
          timestamp: new Date(),
          senderId: 'support',
          senderName: 'Support Agent',
          type: 'text',
        };
        setMessages(prev => [...prev, response]);
      }, 2000);
    }

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const sendPayment = () => {
    Alert.alert(
      'Send Payment',
      `Send money to ${chatName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Money',
          onPress: () => navigation.navigate('Send', { 
            recipient: { name: chatName, id: chatId }
          }),
        },
      ]
    );
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const isToday = timestamp.toDateString() === now.toDateString();
    
    if (isToday) {
      return timestamp.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    }
    
    return timestamp.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isMe = item.senderId === user?._id || item.senderId === 'me';
    const showTimestamp = index === 0 || 
      messages[index - 1].timestamp.getTime() - item.timestamp.getTime() > 300000; // 5 minutes

    return (
      <View style={styles.messageContainer}>
        {showTimestamp && (
          <Text style={styles.timestamp}>
            {formatTimestamp(item.timestamp)}
          </Text>
        )}
        
        <View style={[
          styles.messageBubble,
          isMe ? styles.myMessage : styles.otherMessage,
          item.type === 'payment' && styles.paymentMessage,
        ]}>
          {item.type === 'payment' ? (
            <View style={styles.paymentContent}>
              <Icon 
                name="payment" 
                size={24} 
                color={isMe ? '#FFFFFF' : '#22C55E'} 
              />
              <View style={styles.paymentDetails}>
                <Text style={[
                  styles.paymentAmount,
                  { color: isMe ? '#FFFFFF' : '#1F2937' }
                ]}>
                  KES {item.paymentData?.amount?.toLocaleString()}
                </Text>
                <Text style={[
                  styles.paymentStatus,
                  { color: isMe ? '#FFFFFF80' : '#6B7280' }
                ]}>
                  {item.paymentData?.status === 'completed' ? 'Payment sent' : 'Payment pending'}
                </Text>
              </View>
              <Icon 
                name={item.paymentData?.status === 'completed' ? 'check-circle' : 'schedule'} 
                size={20} 
                color={isMe ? '#FFFFFF' : '#22C55E'} 
              />
            </View>
          ) : (
            <Text style={[
              styles.messageText,
              { color: isMe ? '#FFFFFF' : '#1F2937' }
            ]}>
              {item.text}
            </Text>
          )}
        </View>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (!isTyping) return null;

    return (
      <View style={styles.typingContainer}>
        <View style={styles.typingBubble}>
          <View style={styles.typingDots}>
            <View style={[styles.typingDot, styles.typingDot1]} />
            <View style={[styles.typingDot, styles.typingDot2]} />
            <View style={[styles.typingDot, styles.typingDot3]} />
          </View>
        </View>
      </View>
    );
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
        
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{chatName}</Text>
          <Text style={styles.headerSubtitle}>
            {type === 'support' ? 'Support Agent' : 'Online'}
          </Text>
        </View>

        <View style={styles.headerActions}>
          {type !== 'support' && (
            <TouchableOpacity style={styles.headerAction} onPress={sendPayment}>
              <Icon name="payment" size={24} color="#22C55E" />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.headerAction}>
            <Icon name="more-vert" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
        
        {renderTypingIndicator()}

        {/* Input */}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton}>
            <Icon name="attach-file" size={24} color="#6B7280" />
          </TouchableOpacity>
          
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={1000}
          />
          
          {type !== 'support' && (
            <TouchableOpacity style={styles.paymentButton} onPress={sendPayment}>
              <Icon name="attach-money" size={24} color="#22C55E" />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[
              styles.sendButton,
              inputText.trim() && styles.sendButtonActive,
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <Icon 
              name="send" 
              size={20} 
              color={inputText.trim() ? '#FFFFFF' : '#9CA3AF'} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  messagesContent: {
    paddingVertical: 16,
  },
  messageContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  myMessage: {
    backgroundColor: '#22C55E',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  paymentMessage: {
    borderWidth: 1,
    borderColor: '#22C55E20',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  paymentContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentDetails: {
    flex: 1,
    marginHorizontal: 12,
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  paymentStatus: {
    fontSize: 12,
  },
  typingContainer: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  typingBubble: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9CA3AF',
    marginHorizontal: 2,
  },
  typingDot1: {
    // Animation would be added here
  },
  typingDot2: {
    // Animation would be added here
  },
  typingDot3: {
    // Animation would be added here
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
  },
  paymentButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#22C55E20',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonActive: {
    backgroundColor: '#22C55E',
  },
});

export default ChatScreen;