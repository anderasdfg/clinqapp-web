import React, { useState } from 'react';
import { ArrowLeft, User, Phone, MessageSquare, Send } from 'lucide-react';
import { Conversation, Message } from '../../types/whatsapp';
import { useWhatsAppMessages } from '../../hooks/useWhatsAppMessages';

interface ChatAreaProps {
  selectedConversation: Conversation | null;
  messages: Message[];
  messagesLoading: boolean;
  onBack: () => void;
  onMessageSent: () => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  selectedConversation,
  messages,
  messagesLoading,
  onBack,
  onMessageSent
}) => {
  const [newMessage, setNewMessage] = useState('');
  const { sendMessage, sendingMessage } = useWhatsAppMessages();

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('es-PE', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('es-PE', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await sendMessage({
        phoneNumber: selectedConversation.phoneNumber,
        message: newMessage,
        organizationId: selectedConversation.organizationId
      });

      setNewMessage('');
      onMessageSent();
      
    } catch (error) {
      // Error is handled by the hook
    }
  };

  if (!selectedConversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">Selecciona una conversación</h3>
          <p className="text-sm">Elige una conversación de la lista para ver los mensajes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
            {selectedConversation.patient ? (
              <User className="w-5 h-5 text-indigo-600" />
            ) : (
              <Phone className="w-5 h-5 text-indigo-600" />
            )}
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900">
              {selectedConversation.patient 
                ? `${selectedConversation.patient.firstName} ${selectedConversation.patient.lastName}`
                : selectedConversation.profileName || 'Usuario desconocido'
              }
            </h3>
            <p className="text-sm text-gray-500">
              {selectedConversation.phoneNumber}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messagesLoading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No hay mensajes en esta conversación</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.direction === 'OUTGOING' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.direction === 'OUTGOING'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className={`text-xs ${
                    message.direction === 'OUTGOING' ? 'text-indigo-200' : 'text-gray-500'
                  }`}>
                    {formatTime(message.createdAt)}
                  </span>
                  {message.isAutoResponse && (
                    <span className={`text-xs ${
                      message.direction === 'OUTGOING' ? 'text-indigo-200' : 'text-gray-500'
                    }`}>
                      Auto
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe tu mensaje..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            disabled={sendingMessage}
          />
          <button
            type="submit"
            disabled={sendingMessage || !newMessage.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {sendingMessage ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
