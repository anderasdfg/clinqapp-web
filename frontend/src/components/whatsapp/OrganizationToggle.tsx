import React from 'react';
import { Building2 } from 'lucide-react';
import { Organization } from '../../types/whatsapp';

interface OrganizationToggleProps {
  organization: Organization;
  onToggle: (orgId: string, enabled: boolean) => Promise<void>;
}

export const OrganizationToggle: React.FC<OrganizationToggleProps> = ({
  organization,
  onToggle
}) => {
  const isEnabled = organization.sendReminders && organization.notificationWhatsapp;

  const handleToggle = async () => {
    try {
      await onToggle(organization.id, !isEnabled);
    } catch (error) {
      // Error handling is done in the parent component
      console.error('Error toggling WhatsApp:', error);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex-1">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{organization.name}</p>
            <p className="text-xs text-gray-500">
              {organization._count.patients} pacientes • {organization.reminderHoursBefore || 24}h antes
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className={`text-xs px-2 py-1 rounded-full ${
            isEnabled 
              ? 'bg-green-100 text-green-700' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            {isEnabled ? 'Activo' : 'Inactivo'}
          </span>
        </div>
        
        {/* Professional Switch */}
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={handleToggle}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
        </label>
      </div>
    </div>
  );
};
