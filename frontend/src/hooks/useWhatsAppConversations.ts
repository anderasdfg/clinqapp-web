import { useState, useEffect, useCallback } from 'react';
import { Conversation, Message } from '../types/whatsapp';
import { AppConfig } from '../lib/config/app.config';

export const useWhatsAppConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`${AppConfig.apiUrl}/webhooks/whatsapp/conversations`);
      
      if (!response.ok) {
        throw new Error('Error cargando conversaciones');
      }

      const data = await response.json();
      setConversations(data.conversations || []);
      
    } catch (err: any) {
      setError(err.message || 'Error cargando conversaciones');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return {
    conversations,
    loading,
    error,
    loadConversations,
    clearError: () => setError('')
  };
};

export const useConversationMessages = (phoneNumber: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadMessages = useCallback(async (phone: string) => {
    try {
      setLoading(true);
      setError('');
      
      const encodedPhone = encodeURIComponent(phone);
      const response = await fetch(`${AppConfig.apiUrl}/webhooks/whatsapp/conversations/${encodedPhone}/messages`);
      
      if (!response.ok) {
        throw new Error('Error cargando mensajes');
      }

      const data = await response.json();
      setMessages(data.messages || []);
      
    } catch (err: any) {
      setError(err.message || 'Error cargando mensajes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (phoneNumber) {
      loadMessages(phoneNumber);
    } else {
      setMessages([]);
    }
  }, [phoneNumber, loadMessages]);

  return {
    messages,
    loading,
    error,
    loadMessages,
    clearError: () => setError('')
  };
};
