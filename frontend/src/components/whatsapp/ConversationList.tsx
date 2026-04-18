import React from 'react';
import { Search, MessageSquare, User, Phone } from 'lucide-react';
import { Conversation } from '../../types/whatsapp';

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onConversationSelect: (conversation: Conversation) => void;
  loading: boolean;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversation,
  searchTerm,
  onSearchChange,
  onConversationSelect,
  loading
}) => {
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

  const filteredConversations = conversations.filter(conv => 
    conv.profileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.phoneNumber.includes(searchTerm) ||
    conv.patient?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.patient?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="w-1/3 bg-white border-r border-gray-200 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar conversaciones..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <MessageSquare className="w-12 h-12 mb-3 text-gray-300" />
            <p className="text-sm">No hay conversaciones</p>
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <div
              key={conversation.phoneNumber}
              onClick={() => onConversationSelect(conversation)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedConversation?.phoneNumber === conversation.phoneNumber 
                  ? 'bg-indigo-50 border-indigo-200' 
                  : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    {conversation.patient ? (
                      <User className="w-5 h-5 text-indigo-600" />
                    ) : (
                      <Phone className="w-5 h-5 text-indigo-600" />
                    )}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {conversation.patient 
                        ? `${conversation.patient.firstName} ${conversation.patient.lastName}`
                        : conversation.profileName || conversation.phoneNumber
                      }
                    </p>
                    <span className="text-xs text-gray-500">
                      {formatTime(conversation.lastMessageAt)}
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-500 mb-1">
                    {conversation.phoneNumber}
                  </p>
                  
                  <p className="text-sm text-gray-600 truncate">
                    {conversation.lastMessageDirection === 'INCOMING' ? '📱 ' : '📤 '}
                    {conversation.lastMessage}
                  </p>
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">
                      {conversation.messageCount} mensajes
                    </span>
                    {conversation.patient && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        Paciente
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
