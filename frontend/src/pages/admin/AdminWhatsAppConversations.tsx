import { useState, useEffect } from 'react';
import { useWhatsAppConversations, useConversationMessages } from '../../hooks/useWhatsAppConversations';
import { ConversationList } from '../../components/whatsapp/ConversationList';
import { ChatArea } from '../../components/whatsapp/ChatArea';
import { Conversation } from '../../types/whatsapp';
import { RefreshCw } from 'lucide-react';

export default function AdminWhatsAppConversations() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { conversations, loading, error, loadConversations } = useWhatsAppConversations();
  const { messages, loading: messagesLoading, loadMessages } = useConversationMessages(selectedConversation?.phoneNumber || null);
  
  // Cargar conversaciones solo al montar el componente
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const handleMessageSent = () => {
    if (selectedConversation) {
      loadMessages(selectedConversation.phoneNumber);
    }
    // Actualizar la lista de conversaciones para reflejar el nuevo mensaje
    loadConversations();
  };

  const handleBack = () => {
    setSelectedConversation(null);
  };

  if (loading && conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="h-[90vh] flex flex-col">
      {/* Compact Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Centro de Comunicaciones</h1>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">
              {conversations.length} chats
            </span>
            <button
              onClick={loadConversations}
              disabled={loading}
              className="flex items-center px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 disabled:opacity-50 transition-colors"
              title="Actualizar"
            >
              <RefreshCw className={`w-3 h-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
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
