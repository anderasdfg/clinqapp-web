import { useState, useCallback } from 'react';
import { SendMessageRequest, SendMessageResponse } from '../types/whatsapp';

export const useWhatsAppMessages = () => {
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const sendMessage = useCallback(async (request: SendMessageRequest): Promise<SendMessageResponse> => {
    try {
      setSendingMessage(true);
      setError('');
      setSuccess('');

      const response = await fetch('/api/webhooks/whatsapp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error('Error enviando mensaje');
      }

      const result: SendMessageResponse = await response.json();
      
      if (result.success) {
        setSuccess(`Mensaje enviado exitosamente. SID: ${result.messageSid}`);
      }
      
      return result;
      
    } catch (err: any) {
      const errorMessage = err.message || 'Error enviando mensaje';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setSendingMessage(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setError('');
    setSuccess('');
  }, []);

  return {
    sendMessage,
    sendingMessage,
    error,
    success,
    clearMessages
  };
};
