import { prisma } from './prisma';
import crypto from 'crypto';

// Create a new team
export async function createTeam(
  userId: string,
  name: string,
  slug: string,
  description?: string
) {
  try {
    const team = await prisma.team.create({
      data: {
        name,
        slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        description,
        ownerId: userId,
        members: {
          create: [
            {
              userId,
              role: 'owner',
            },
          ],
        },
      },
      include: {
        members: true,
      },
    });
    return team;
  } catch (error) {
    console.error('Error creating team:', error);
    throw error;
  }
}

// Get user's teams
export async function getUserTeams(userId: string) {
  try {
    const teams = await prisma.teamMember.findMany({
      where: { userId },
      include: {
        team: {
          include: {
            owner: {
              select: { id: true, name: true, email: true },
            },
            members: {
              select: { id: true, userId: true, role: true },
            },
          },
        },
      },
    });
    return teams.map((tm: any) => ({ ...tm.team, userRole: tm.role }));
  } catch (error) {
    console.error('Error fetching user teams:', error);
    throw error;
  }
}

// Get team details
export async function getTeamDetails(teamId: string) {
  try {
    return await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        invitations: {
          where: { status: 'pending' },
        },
      },
    });
  } catch (error) {
    console.error('Error fetching team details:', error);
    throw error;
  }
}

// Invite user to team
export async function inviteUserToTeam(
  teamId: string,
  email: string,
  invitedBy: string,
  role: string = 'member'
) {
  try {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    
    const invitation = await prisma.teamInvitation.upsert({
      where: {
        teamId_email: { teamId, email },
      },
      update: {
        status: 'pending',
        expiresAt,
        role,
        invitedBy,
      },
      create: {
        teamId,
        email,
        role,
        invitedBy,
        expiresAt,
      },
    });
    return invitation;
  } catch (error) {
    console.error('Error inviting user to team:', error);
    throw error;
  }
}

// Accept team invitation
export async function acceptTeamInvitation(
  invitationId: string,
  userId: string
) {
  try {
    const invitation = await prisma.teamInvitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) throw new Error('Invitation not found');
    if (invitation.status !== 'pending') throw new Error('Invitation already processed');
    if (invitation.expiresAt < new Date()) throw new Error('Invitation expired');

    await prisma.teamMember.create({
      data: {
        teamId: invitation.teamId,
        userId,
        role: invitation.role,
      },
    });

    return await prisma.teamInvitation.update({
      where: { id: invitationId },
      data: { status: 'accepted' },
    });
  } catch (error) {
    console.error('Error accepting team invitation:', error);
    throw error;
  }
}

// Remove team member
export async function removeTeamMember(
  teamId: string,
  memberId: string,
  requestingUserId: string
) {
  try {
    const requester = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId: requestingUserId } },
    });

    if (!requester || !['owner', 'manager'].includes(requester.role)) {
      throw new Error('Unauthorized');
    }

    return await prisma.teamMember.delete({
      where: { teamId_userId: { teamId, userId: memberId } },
    });
  } catch (error) {
    console.error('Error removing team member:', error);
    throw error;
  }
}