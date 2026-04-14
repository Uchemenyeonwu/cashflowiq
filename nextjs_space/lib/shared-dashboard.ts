import { prisma } from './prisma';
import crypto from 'crypto';

export interface DashboardWidget {
  id: string;
  type: 'cash_flow' | 'category_breakdown' | 'monthly_comparison' | 'key_metrics';
  title: string;
  config?: Record<string, any>;
}

export interface DashboardLayout {
  gridCols: number;
  widgets: Array<{ widgetId: string; x: number; y: number; w: number; h: number }>;
}

// Create a shared dashboard
export async function createSharedDashboard(
  teamId: string,
  createdBy: string,
  name: string,
  description?: string,
  widgets?: DashboardWidget[],
  layout?: DashboardLayout
) {
  try {
    const shareToken = crypto.randomBytes(16).toString('hex');

    return await prisma.sharedDashboard.create({
      data: {
        teamId,
        createdBy,
        name,
        description,
        shareToken,
        widgets: widgets ? JSON.stringify(widgets) : null,
        layout: layout ? JSON.stringify(layout) : null,
      },
    });
  } catch (error) {
    console.error('Error creating shared dashboard:', error);
    throw error;
  }
}

// Get shared dashboard by ID
export async function getSharedDashboard(dashboardId: string) {
  try {
    const dashboard = await prisma.sharedDashboard.findUnique({
      where: { id: dashboardId },
    });

    if (!dashboard) return null;

    return {
      ...dashboard,
      widgets: dashboard.widgets ? JSON.parse(dashboard.widgets) : [],
      layout: dashboard.layout ? JSON.parse(dashboard.layout) : null,
    };
  } catch (error) {
    console.error('Error fetching shared dashboard:', error);
    throw error;
  }
}

// Get dashboard by share token
export async function getSharedDashboardByToken(shareToken: string) {
  try {
    const dashboard = await prisma.sharedDashboard.findUnique({
      where: { shareToken },
    });

    if (!dashboard || !dashboard.isPublic) return null;

    return {
      ...dashboard,
      widgets: dashboard.widgets ? JSON.parse(dashboard.widgets) : [],
      layout: dashboard.layout ? JSON.parse(dashboard.layout) : null,
    };
  } catch (error) {
    console.error('Error fetching public dashboard:', error);
    return null;
  }
}

// Get team's shared dashboards
export async function getTeamSharedDashboards(teamId: string) {
  try {
    const dashboards = await prisma.sharedDashboard.findMany({
      where: { teamId },
      orderBy: { createdAt: 'desc' },
    });

    return dashboards.map((d) => ({
      ...d,
      widgets: d.widgets ? JSON.parse(d.widgets) : [],
      layout: d.layout ? JSON.parse(d.layout) : null,
    }));
  } catch (error) {
    console.error('Error fetching team dashboards:', error);
    throw error;
  }
}

// Update shared dashboard
export async function updateSharedDashboard(
  dashboardId: string,
  updates: {
    name?: string;
    description?: string;
    isPublic?: boolean;
    widgets?: DashboardWidget[];
    layout?: DashboardLayout;
  }
) {
  try {
    return await prisma.sharedDashboard.update({
      where: { id: dashboardId },
      data: {
        ...updates,
        widgets: updates.widgets ? JSON.stringify(updates.widgets) : undefined,
        layout: updates.layout ? JSON.stringify(updates.layout) : undefined,
      },
    });
  } catch (error) {
    console.error('Error updating shared dashboard:', error);
    throw error;
  }
}

// Delete shared dashboard
export async function deleteSharedDashboard(dashboardId: string) {
  try {
    return await prisma.sharedDashboard.delete({
      where: { id: dashboardId },
    });
  } catch (error) {
    console.error('Error deleting shared dashboard:', error);
    throw error;
  }
}