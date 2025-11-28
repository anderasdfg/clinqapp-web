import axios from 'axios';
import { AppConfig } from '@/lib/config/app.config';
import { AuthService } from '@/services/auth.service';
import type { CompleteOnboardingData } from '@/lib/validations/onboarding';

export class OnboardingService {
    /**
     * Complete onboarding process
     * Sends all collected data to the backend
     */
    static async completeOnboarding(data: CompleteOnboardingData) {
        try {
            const session = await AuthService.getSession();
            if (!session) {
                throw new Error('No session found');
            }

            const response = await axios.post(
                `${AppConfig.apiUrl}/onboarding/complete`,
                data,
                {
                    headers: {
                        Authorization: `Bearer ${session.access_token}`,
                    },
                }
            );

            return {
                success: true,
                data: response.data,
            };
        } catch (error: any) {
            console.error('Error completing onboarding:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Error al completar el onboarding',
            };
        }
    }
}
