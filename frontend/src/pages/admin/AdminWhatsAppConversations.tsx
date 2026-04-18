import { useState } from 'react';
import { useWhatsAppConversations, useConversationMessages } from '../../hooks/useWhatsAppConversations';
import { ConversationList } from '../../components/whatsapp/ConversationList';
import { ChatArea } from '../../components/whatsapp/ChatArea';
import { Conversation } from '../../types/whatsapp';

export default function AdminWhatsAppConversations() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { conversations, loading, error } = useWhatsAppConversations();
  const { messages, loading: messagesLoading, loadMessages } = useConversationMessages(selectedConversation?.phoneNumber || null);

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const handleMessageSent = () => {
    if (selectedConversation) {
      loadMessages(selectedConversation.phoneNumber);
    }
  };

  const handleBack = () => {
    setSelectedConversation(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Conversaciones WhatsApp</h1>
            <p className="text-gray-600 mt-1">
              Gestiona las conversaciones con tus pacientes
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {conversations.length} conversaciones
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Lista de conversaciones */}
        <ConversationList
          conversations={conversations}
          selectedConversation={selectedConversation}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onConversationSelect={handleConversationSelect}
          loading={loading}
        />

        {/* Main Chat Area */}
        <ChatArea
          selectedConversation={selectedConversation}
          messages={messages}
          messagesLoading={messagesLoading}
          onBack={handleBack}
          onMessageSent={handleMessageSent}
        />
      </div>

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <p className="text-sm">{error}</p>
          <button
            onClick={() => {}}
            className="ml-2 text-red-200 hover:text-white"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
