import { prisma } from './prisma';

export interface TeamBillingInfo {
  currentMembers: number;
  maxMembers: number;
  canAddMembers: boolean;
  upgradeNeeded: boolean;
}

// Get team billing info
export async function getTeamBillingInfo(
  teamId: string
): Promise<TeamBillingInfo> {
  try {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: true,
      },
    });

    if (!team) {
      throw new Error('Team not found');
    }

    const currentMembers = team.members.length;
    const maxMembers = team.maxMembers;

    return {
      currentMembers,
      maxMembers,
      canAddMembers: currentMembers < maxMembers,
      upgradeNeeded: currentMembers >= maxMembers,
    };
  } catch (error) {
    console.error('Error getting team billing info:', error);
    throw error;
  }
}

// Update team max members based on subscription tier
export async function updateTeamMaxMembers(
  userId: string,
  teamId: string,
  tier: string
) {
  try {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team || team.ownerId !== userId) {
      throw new Error('Unauthorized');
    }

    let maxMembers = 3;
    if (tier === 'pro') {
      maxMembers = 5;
    } else if (tier === 'team') {
      maxMembers = 20;
    }

    return await prisma.team.update({
      where: { id: teamId },
      data: { maxMembers },
    });
  } catch (error) {
    console.error('Error updating team max members:', error);
    throw error;
  }
}

// Check if team can add more members
export async function canTeamAddMembers(
  teamId: string
): Promise<boolean> {
  try {
    const billing = await getTeamBillingInfo(teamId);
    return billing.canAddMembers;
  } catch (error) {
    console.error('Error checking if team can add members:', error);
    return false;
  }
}