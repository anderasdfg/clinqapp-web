import { Request, Response, NextFunction } from 'express';

export interface AdminRequest extends Request {
  admin?: {
    username: string;
    role: string;
  };
}

/**
 * Middleware to protect admin routes
 */
export const adminAuth = (req: AdminRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.'
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Simple token validation (in production, use JWT)
    if (!token.startsWith('admin-session-')) {
      res.status(401).json({
        success: false,
        error: 'Access denied. Invalid token.'
      });
      return;
    }

    // Add admin info to request
    req.admin = {
      username: 'admin',
      role: 'ADMIN'
    };

    next();
  } catch (error) {
    console.error('Error in admin auth middleware:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Optional admin auth - doesn't block if no token
 */
export const optionalAdminAuth = (req: AdminRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      if (token.startsWith('admin-session-')) {
        req.admin = {
          username: 'admin',
          role: 'ADMIN'
        };
      }
    }

    next();
  } catch (error) {
    console.error('Error in optional admin auth middleware:', error);
    next(); // Continue anyway
  }
};
