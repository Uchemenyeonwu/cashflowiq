import { prisma } from './prisma';

export interface AuditLogData {
  teamId: string;
  userId: string;
  action: 'create' | 'update' | 'delete' | 'export' | 'invite' | 'access';
  entityType: string;
  entityId?: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

// Log an audit event
export async function logAuditEvent(data: AuditLogData) {
  try {
    await prisma.auditLog.create({
      data: {
        teamId: data.teamId,
        userId: data.userId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        changes: data.changes ? JSON.stringify(data.changes) : null,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  } catch (error) {
    console.error('Error logging audit event:', error);
  }
}

// Get audit logs for a team
export async function getTeamAuditLogs(
  teamId: string,
  limit: number = 50,
  offset: number = 0
) {
  try {
    return await prisma.auditLog.findMany({
      where: { teamId },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    throw error;
  }
}

// Get audit logs for a specific entity
export async function getEntityAuditLogs(
  teamId: string,
  entityType: string,
  entityId: string
) {
  try {
    return await prisma.auditLog.findMany({
      where: {
        teamId,
        entityType,
        entityId,
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Error fetching entity audit logs:', error);
    throw error;
  }
}