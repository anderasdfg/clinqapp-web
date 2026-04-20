import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

// Validation schemas
const loginSchema = z.object({
  username: z.string(),
  password: z.string()
});

const updateOrganizationSchema = z.object({
  sendReminders: z.boolean().optional(),
  notificationWhatsapp: z.boolean().optional(),
  reminderHoursBefore: z.number().min(1).max(72).optional(),
  subscriptionPlan: z.enum(['FREE_TRIAL', 'BASIC', 'PROFESSIONAL', 'ENTERPRISE']).optional(),
  subscriptionStatus: z.enum(['ACTIVE', 'CANCELLED', 'PAST_DUE', 'TRIALING']).optional()
});

export class AdminController {
  /**
   * Admin login with hardcoded credentials
   * POST /api/admin/login
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = loginSchema.parse(req.body);

      // Hardcoded admin credentials
      if (username === 'admin' && password === 'Admin4563') {
        // Simple session token (in production, use JWT)
        const token = 'admin-session-' + Date.now();
        
        res.status(200).json({
          success: true,
          message: 'Login successful',
          token,
          user: {
            username: 'admin',
            role: 'ADMIN'
          }
        });
      } else {
        res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }
    } catch (error) {
      console.error('Error in admin login:', error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Invalid request data',
          details: error.issues
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get dashboard statistics
   * GET /api/admin/dashboard
   */
  static async getDashboard(req: Request, res: Response): Promise<void> {
    try {
      // Get organization counts by plan
      const organizationStats = await prisma.organization.groupBy({
        by: ['subscriptionPlan'],
        _count: true,
        where: {
          deletedAt: null
        }
      });

      // Get total organizations
      const totalOrganizations = await prisma.organization.count({
        where: { deletedAt: null }
      });

      // Get organizations with WhatsApp enabled
      const whatsappEnabled = await prisma.organization.count({
        where: {
          deletedAt: null,
          notificationWhatsapp: true,
          sendReminders: true
        }
      });

      // Get recent appointments with reminders
      const recentReminders = await prisma.appointment.count({
        where: {
          reminderSentAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      });

      // Get total users
      const totalUsers = await prisma.user.count({
        where: { deletedAt: null }
      });

      res.status(200).json({
        success: true,
        data: {
          totalOrganizations,
          whatsappEnabled,
          recentReminders,
          totalUsers,
          organizationsByPlan: organizationStats.reduce((acc, stat) => {
            acc[stat.subscriptionPlan] = stat._count;
            return acc;
          }, {} as Record<string, number>)
        }
      });
    } catch (error) {
      console.error('Error in getDashboard:', error);
      
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get all organizations with pagination
   * GET /api/admin/organizations
   */
  static async getOrganizations(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;

      const skip = (page - 1) * limit;

      const where = {
        deletedAt: null,
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } }
          ]
        })
      };

      const [organizations, total] = await Promise.all([
        prisma.organization.findMany({
          where,
          skip,
          take: limit,
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            subscriptionPlan: true,
            subscriptionStatus: true,
            sendReminders: true,
            notificationWhatsapp: true,
            reminderHoursBefore: true,
            createdAt: true,
            _count: {
              select: {
                users: true,
                patients: true,
                appointments: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.organization.count({ where })
      ]);

      res.status(200).json({
        success: true,
        data: {
          organizations,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Error in getOrganizations:', error);
      
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get single organization details
   * GET /api/admin/organizations/:id
   */
  static async getOrganization(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const organization = await prisma.organization.findUnique({
        where: { id: id as string },
        include: {
          users: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
              createdAt: true
            },
            where: { deletedAt: null }
          },
          _count: {
            select: {
              patients: true,
              appointments: true,
              payments: true
            }
          }
        }
      });

      if (!organization) {
        res.status(404).json({
          success: false,
          error: 'Organization not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: organization
      });
    } catch (error) {
      console.error('Error in getOrganization:', error);
      
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Update organization settings
   * PUT /api/admin/organizations/:id
   */
  static async updateOrganization(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = updateOrganizationSchema.parse(req.body);

      const organization = await prisma.organization.update({
        where: { id: id as string },
        data: updateData,
        select: {
          id: true,
          name: true,
          sendReminders: true,
          notificationWhatsapp: true,
          reminderHoursBefore: true,
          subscriptionPlan: true,
          subscriptionStatus: true
        }
      });

      res.status(200).json({
        success: true,
        message: 'Organization updated successfully',
        data: organization
      });
    } catch (error) {
      console.error('Error in updateOrganization:', error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Invalid request data',
          details: error.issues
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get WhatsApp reminder statistics for an organization
   * GET /api/admin/organizations/:id/reminder-stats
   */
  static async getOrganizationReminderStats(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const days = parseInt(req.query.days as string) || 30;

      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      const endDate = new Date();

      const stats = await prisma.appointment.groupBy({
        by: ['reminderSentAt'],
        where: {
          organizationId: id as string,
          startTime: {
            gte: startDate,
            lte: endDate
          }
        },
        _count: true
      });

      const totalAppointments = await prisma.appointment.count({
        where: {
          organizationId: id as string,
          startTime: {
            gte: startDate,
            lte: endDate
          }
        }
      });

      const remindersSent = stats.filter(s => s.reminderSentAt !== null).reduce((acc, s) => acc + (s._count || 0), 0);
      const remindersNotSent = totalAppointments - remindersSent;

      res.status(200).json({
        success: true,
        data: {
          totalAppointments,
          remindersSent,
          remindersNotSent,
          reminderRate: totalAppointments > 0 ? (remindersSent / totalAppointments * 100).toFixed(2) : 0
        }
      });
    } catch (error) {
      console.error('Error in getOrganizationReminderStats:', error);
      
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}
