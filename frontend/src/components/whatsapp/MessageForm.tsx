import React, { useState } from 'react';
import { Send, Phone, CheckCircle, XCircle } from 'lucide-react';
import { useWhatsAppMessages } from '../../hooks/useWhatsAppMessages';

interface MessageFormProps {
  onSuccess?: () => void;
  organizationId?: string;
}

export const MessageForm: React.FC<MessageFormProps> = ({ onSuccess, organizationId }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const { sendMessage, sendingMessage, error, success, clearMessages } = useWhatsAppMessages();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber.trim() || !message.trim()) {
      return;
    }

    try {
      await sendMessage({
        phoneNumber: phoneNumber.trim(),
        message: message.trim(),
        organizationId
      });
      
      setPhoneNumber('');
      setMessage('');
      onSuccess?.();
      
    } catch (error) {
      // Error is handled by the hook
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Enviar Mensaje Manual
        </h3>
        <Send className="w-5 h-5 text-gray-400" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Número de Teléfono
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Ej: +51987654321 o 987654321"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                disabled={sendingMessage}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Formato: +51987654321 o 987654321
            </p>
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Mensaje
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe tu mensaje aquí..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              disabled={sendingMessage}
            />
            <p className="text-xs text-gray-500 mt-1">
              Máximo 1600 caracteres
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <XCircle className="w-4 h-4 text-red-500 mr-2" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <button
                type="button"
                onClick={clearMessages}
                className="text-red-400 hover:text-red-600"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <p className="text-sm text-green-700">{success}</p>
              </div>
              <button
                type="button"
                onClick={clearMessages}
                className="text-green-400 hover:text-green-600"
              >
                ×
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={sendingMessage || !phoneNumber.trim() || !message.trim()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sendingMessage ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Enviar Mensaje
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
