// Types for WhatsApp functionality
export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  organization: {
    id: string;
    name: string;
  };
}

export interface Organization {
  id: string;
  name: string;
  sendReminders: boolean;
  notificationWhatsapp: boolean;
  reminderHoursBefore: number;
  _count: {
    patients: number;
    appointments: number;
  };
}

export interface WhatsAppStats {
  totalOrganizations: number;
  whatsappEnabled: number;
  recentReminders: number;
  successRate: number;
}

export interface MessageForm {
  phoneNumber: string;
  message: string;
}

export interface Conversation {
  phoneNumber: string;
  profileName?: string;
  messageCount: number;
  lastMessageAt: string;
  lastMessage: string;
  lastMessageDirection: 'INCOMING' | 'OUTGOING';
  patient?: Patient;
  organizationId?: string;
}

export interface Message {
  id: string;
  phoneNumber: string;
  direction: 'INCOMING' | 'OUTGOING';
  content: string;
  status: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  createdAt: string;
  isAutoResponse: boolean;
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  organization?: {
    id: string;
    name: string;
  };
}

export interface SendMessageRequest {
  phoneNumber: string;
  message: string;
  organizationId?: string;
}

export interface SendMessageResponse {
  success: boolean;
  messageSid?: string;
  to: string;
  message: string;
  patientFound?: boolean;
  error?: string;
  details?: string;
}
