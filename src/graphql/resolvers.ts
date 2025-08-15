import { GraphQLContext } from './context';
import { Role } from '@prisma/client';
import { GraphQLError } from 'graphql';

// Helper function to calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

export const resolvers = {
  Query: {
    me: async (_: any, __: any, { prisma, user }: GraphQLContext) => {
      if (!user) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });

      return await prisma.user.findUnique({
        where: { auth0Id: user.auth0Id },
        include: { organization: true },
      });
    },

    organization: async (_: any, __: any, { prisma, user }: GraphQLContext) => {
      if (!user) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });

      const currentUser = await prisma.user.findUnique({
        where: { auth0Id: user.auth0Id },
        include: { organization: true },
      });

      return currentUser?.organization;
    },

    shifts: async (_: any, { userId }: { userId?: string }, { prisma, user }: GraphQLContext) => {
      if (!user) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });

      const currentUser = await prisma.user.findUnique({
        where: { auth0Id: user.auth0Id },
        include: { organization: true },
      });

      if (!currentUser?.organization) throw new GraphQLError('User not part of organization', { extensions: { code: 'BAD_USER_INPUT' } });

      const where: any = {
        organizationId: currentUser.organization.id,
      };

      if (userId) {
        if (currentUser.role !== Role.MANAGER && userId !== currentUser.id) {
          throw new GraphQLError('Not authorized to view other user shifts', { extensions: { code: 'FORBIDDEN' } });
        }
        where.userId = userId;
      }

      return await prisma.shift.findMany({
        where,
        include: { user: true, organization: true },
        orderBy: { clockInTime: 'desc' },
      });
    },

    activeShifts: async (_: any, __: any, { prisma, user }: GraphQLContext) => {
      if (!user) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });

      const currentUser = await prisma.user.findUnique({
        where: { auth0Id: user.auth0Id },
        include: { organization: true },
      });

      if (!currentUser?.organization || currentUser.role !== Role.MANAGER) {
        throw new GraphQLError('Manager access required', { extensions: { code: 'FORBIDDEN' } });
      }

      return await prisma.shift.findMany({
        where: {
          organizationId: currentUser.organization.id,
          clockOutTime: null,
        },
        include: { user: true, organization: true },
        orderBy: { clockInTime: 'desc' },
      });
    },

    shiftAnalytics: async (_: any, __: any, { prisma, user }: GraphQLContext) => {
      if (!user) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });

      const currentUser = await prisma.user.findUnique({
        where: { auth0Id: user.auth0Id },
        include: { organization: true },
      });

      if (!currentUser?.organization || currentUser.role !== Role.MANAGER) {
        throw new GraphQLError('Manager access required', { extensions: { code: 'FORBIDDEN' } });
      }

      const organizationId = currentUser.organization.id;
      const today = new Date();
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - 7);

      // Active shifts count
      const activeShifts = await prisma.shift.count({
        where: {
          organizationId,
          clockOutTime: null,
        },
      });

      // Users who clocked in today
      const totalUsersToday = await prisma.shift.count({
        where: {
          organizationId,
          clockInTime: {
            gte: startOfToday,
          },
        },
      });

      // Get completed shifts from this week for calculations
      const weekShifts = await prisma.shift.findMany({
        where: {
          organizationId,
          clockInTime: {
            gte: startOfWeek,
          },
          clockOutTime: {
            not: null,
          },
        },
      });

      const totalHours = weekShifts.reduce((acc, shift) => {
        if (shift.clockOutTime) {
          const duration = new Date(shift.clockOutTime).getTime() - new Date(shift.clockInTime).getTime();
          return acc + (duration / (1000 * 60 * 60)); // Convert to hours
        }
        return acc;
      }, 0);

      const avgHoursPerDay = weekShifts.length > 0 ? totalHours / 7 : 0;

      return {
        avgHoursPerDay,
        totalUsersToday,
        totalHoursThisWeek: totalHours,
        activeShifts,
      };
    },

    userShiftSummaries: async (_: any, __: any, { prisma, user }: GraphQLContext) => {
      if (!user) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });

      const currentUser = await prisma.user.findUnique({
        where: { auth0Id: user.auth0Id },
        include: { organization: true },
      });

      if (!currentUser?.organization || currentUser.role !== Role.MANAGER) {
        throw new GraphQLError('Manager access required', { extensions: { code: 'FORBIDDEN' } });
      }

      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - 7);

      const users = await prisma.user.findMany({
        where: {
          organizationId: currentUser.organization.id,
        },
        include: {
          shifts: {
            where: {
              clockInTime: {
                gte: startOfWeek,
              },
              clockOutTime: {
                not: null,
              },
            },
          },
        },
      });

      return users.map(user => {
        const totalHours = user.shifts.reduce((acc, shift) => {
          if (shift.clockOutTime) {
            const duration = new Date(shift.clockOutTime).getTime() - new Date(shift.clockInTime).getTime();
            return acc + (duration / (1000 * 60 * 60));
          }
          return acc;
        }, 0);

        return {
          user,
          totalHoursThisWeek: totalHours,
          shiftsThisWeek: user.shifts.length,
        };
      });
    },

    canClockIn: async (_: any, { location }: { location: { lat: number; lng: number } }, { prisma, user }: GraphQLContext) => {
      if (!user) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });

      const currentUser = await prisma.user.findUnique({
        where: { auth0Id: user.auth0Id },
        include: { organization: true },
      });

      if (!currentUser?.organization) return false;

      const distance = calculateDistance(
        location.lat,
        location.lng,
        currentUser.organization.locationLat,
        currentUser.organization.locationLng
      );

      return distance <= currentUser.organization.perimeterRadius;
    },

    currentShift: async (_: any, __: any, { prisma, user }: GraphQLContext) => {
      if (!user) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });

      const currentUser = await prisma.user.findUnique({
        where: { auth0Id: user.auth0Id },
      });

      if (!currentUser) throw new GraphQLError('User not found', { extensions: { code: 'UNAUTHENTICATED' } });

      return await prisma.shift.findFirst({
        where: {
          userId: currentUser.id,
          clockOutTime: null,
        },
        include: { user: true, organization: true },
      });
    },
  },

  Mutation: {
    createUser: async (_: any, { name, role }: { name: string; role: Role }, { prisma, user }: GraphQLContext) => {
      if (!user) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });

      return await prisma.user.create({
        data: {
          auth0Id: user.auth0Id,
          email: user.email,
          name: name || user.name,
          role,
        },
      });
    },

    updateUserRole: async (_: any, { userId, role }: { userId: string; role: Role }, { prisma, user }: GraphQLContext) => {
      if (!user) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });

      const currentUser = await prisma.user.findUnique({
        where: { auth0Id: user.auth0Id },
      });

      if (!currentUser || currentUser.role !== Role.MANAGER) {
        throw new GraphQLError('Manager access required', { extensions: { code: 'FORBIDDEN' } });
      }

      return await prisma.user.update({
        where: { id: userId },
        data: { role },
      });
    },

    createOrganization: async (_: any, { input }: { input: any }, { prisma, user }: GraphQLContext) => {
      if (!user) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });

      const currentUser = await prisma.user.findUnique({
        where: { auth0Id: user.auth0Id },
      });

      if (!currentUser || currentUser.role !== Role.MANAGER) {
        throw new GraphQLError('Manager access required', { extensions: { code: 'FORBIDDEN' } });
      }

      const organization = await prisma.organization.create({
        data: {
          name: input.name,
          locationLat: input.location.lat,
          locationLng: input.location.lng,
          perimeterRadius: input.perimeterRadius,
        },
      });

      // Associate the manager with the organization
      await prisma.user.update({
        where: { id: currentUser.id },
        data: { organizationId: organization.id },
      });

      return organization;
    },

    clockIn: async (_: any, { input }: { input: any }, { prisma, user }: GraphQLContext) => {
      if (!user) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });

      const currentUser = await prisma.user.findUnique({
        where: { auth0Id: user.auth0Id },
        include: { organization: true },
      });

      if (!currentUser?.organization) {
        throw new GraphQLError('User not part of organization', { extensions: { code: 'BAD_USER_INPUT' } });
      }

      // Check if user is within perimeter
      const distance = calculateDistance(
        input.location.lat,
        input.location.lng,
        currentUser.organization.locationLat,
        currentUser.organization.locationLng
      );

      if (distance > currentUser.organization.perimeterRadius) {
        throw new GraphQLError('Outside organization perimeter', { extensions: { code: 'BAD_USER_INPUT' } });
      }

      // Check if user already has active shift
      const activeShift = await prisma.shift.findFirst({
        where: {
          userId: currentUser.id,
          clockOutTime: null,
        },
      });

      if (activeShift) {
        throw new GraphQLError('User already has active shift', { extensions: { code: 'BAD_USER_INPUT' } });
      }

      return await prisma.shift.create({
        data: {
          userId: currentUser.id,
          organizationId: currentUser.organization.id,
          clockInTime: new Date(),
          clockInLat: input.location.lat,
          clockInLng: input.location.lng,
          clockInNote: input.note,
        },
        include: { user: true, organization: true },
      });
    },

    clockOut: async (_: any, { input }: { input: any }, { prisma, user }: GraphQLContext) => {
      if (!user) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });

      const currentUser = await prisma.user.findUnique({
        where: { auth0Id: user.auth0Id },
      });

      if (!currentUser) throw new GraphQLError('User not found', { extensions: { code: 'UNAUTHENTICATED' } });

      // Find active shift
      const activeShift = await prisma.shift.findFirst({
        where: {
          userId: currentUser.id,
          clockOutTime: null,
        },
      });

      if (!activeShift) {
        throw new GraphQLError('No active shift found', { extensions: { code: 'BAD_USER_INPUT' } });
      }

      return await prisma.shift.update({
        where: { id: activeShift.id },
        data: {
          clockOutTime: new Date(),
          clockOutLat: input.location.lat,
          clockOutLng: input.location.lng,
          clockOutNote: input.note,
        },
        include: { user: true, organization: true },
      });
    },
  },

  Shift: {
    duration: (shift: any) => {
      if (!shift.clockOutTime) return null;
      const start = new Date(shift.clockInTime).getTime();
      const end = new Date(shift.clockOutTime).getTime();
      return Math.floor((end - start) / (1000 * 60)); // Duration in minutes
    },
  },
};