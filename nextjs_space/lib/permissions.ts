import { prisma } from './prisma';

type Role = 'owner' | 'manager' | 'member' | 'viewer';

const ROLE_PERMISSIONS: Record<Role, Set<string>> = {
  owner: new Set([
    'read',
    'create',
    'update',
    'delete',
    'invite',
    'remove_members',
    'manage_roles',
    'export',
    'view_audit_logs',
    'manage_team',
  ]),
  manager: new Set([
    'read',
    'create',
    'update',
    'delete',
    'invite',
    'export',
    'view_audit_logs',
  ]),
  member: new Set([
    'read',
    'create',
    'update',
    'delete',
    'export',
  ]),
  viewer: new Set([
    'read',
  ]),
};

// Check if user has permission for action on team
export async function hasTeamPermission(
  userId: string,
  teamId: string,
  action: string
): Promise<boolean> {
  try {
    const member = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: { teamId, userId },
      },
    });

    if (!member) return false;

    const role = member.role as Role;
    const permissions = ROLE_PERMISSIONS[role] || new Set();

    return permissions.has(action);
  } catch (error) {
    console.error('Error checking team permission:', error);
    return false;
  }
}

// Check multiple permissions
export async function hasTeamPermissions(
  userId: string,
  teamId: string,
  actions: string[]
): Promise<boolean> {
  for (const action of actions) {
    const hasPermission = await hasTeamPermission(userId, teamId, action);
    if (!hasPermission) return false;
  }
  return true;
}

// Get user's role in team
export async function getUserTeamRole(
  userId: string,
  teamId: string
): Promise<Role | null> {
  try {
    const member = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: { teamId, userId },
      },
    });

    return (member?.role as Role) || null;
  } catch (error) {
    console.error('Error fetching user team role:', error);
    return null;
  }
}

// Check if user can access transaction
export async function canAccessTransaction(
  userId: string,
  transactionId: string,
  teamId?: string
): Promise<boolean> {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) return false;

    if (transaction.userId === userId) return true;

    if (teamId) {
      return await hasTeamPermission(userId, teamId, 'read');
    }

    return false;
  } catch (error) {
    console.error('Error checking transaction access:', error);
    return false;
  }
}

// Check if user can access forecast
export async function canAccessForecast(
  userId: string,
  forecastId: string,
  teamId?: string
): Promise<boolean> {
  try {
    const forecast = await prisma.forecast.findUnique({
      where: { id: forecastId },
    });

    if (!forecast) return false;

    if (forecast.userId === userId) return true;

    if (teamId) {
      return await hasTeamPermission(userId, teamId, 'read');
    }

    return false;
  } catch (error) {
    console.error('Error checking forecast access:', error);
    return false;
  }
}