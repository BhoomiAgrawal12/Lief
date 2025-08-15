import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { prisma } from '@/lib/prisma';

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

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req, new NextResponse());
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { auth0Id: session.user.sub },
      include: { organization: true },
    });

    if (!currentUser?.organization) {
      return NextResponse.json({ shifts: [] });
    }

    const shifts = await prisma.shift.findMany({
      where: {
        organizationId: currentUser.organization.id,
        ...(currentUser.role === 'CARE_WORKER' ? { userId: currentUser.id } : {}),
      },
      include: { user: true, organization: true },
      orderBy: { clockInTime: 'desc' },
    });

    return NextResponse.json({ shifts });
  } catch (error) {
    console.error('Error fetching shifts:', error);
    return NextResponse.json({ error: 'Failed to fetch shifts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req, new NextResponse());
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { auth0Id: session.user.sub },
      include: { organization: true },
    });

    if (!currentUser?.organization) {
      return NextResponse.json({ error: 'User not part of organization' }, { status: 400 });
    }

    const { action, location, note } = await req.json();

    if (action === 'clockIn') {
      // Check if user is within perimeter
      const distance = calculateDistance(
        location.lat,
        location.lng,
        currentUser.organization.locationLat,
        currentUser.organization.locationLng
      );

      if (distance > currentUser.organization.perimeterRadius) {
        return NextResponse.json({ error: 'Outside organization perimeter' }, { status: 400 });
      }

      // Check if user already has active shift
      const activeShift = await prisma.shift.findFirst({
        where: {
          userId: currentUser.id,
          clockOutTime: null,
        },
      });

      if (activeShift) {
        return NextResponse.json({ error: 'User already has active shift' }, { status: 400 });
      }

      const shift = await prisma.shift.create({
        data: {
          userId: currentUser.id,
          organizationId: currentUser.organization.id,
          clockInTime: new Date(),
          clockInLat: location.lat,
          clockInLng: location.lng,
          clockInNote: note,
        },
        include: { user: true, organization: true },
      });

      return NextResponse.json({ shift });
    }

    if (action === 'clockOut') {
      // Find active shift
      const activeShift = await prisma.shift.findFirst({
        where: {
          userId: currentUser.id,
          clockOutTime: null,
        },
      });

      if (!activeShift) {
        return NextResponse.json({ error: 'No active shift found' }, { status: 400 });
      }

      const shift = await prisma.shift.update({
        where: { id: activeShift.id },
        data: {
          clockOutTime: new Date(),
          clockOutLat: location.lat,
          clockOutLng: location.lng,
          clockOutNote: note,
        },
        include: { user: true, organization: true },
      });

      return NextResponse.json({ shift });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error processing shift:', error);
    return NextResponse.json({ error: 'Failed to process shift' }, { status: 500 });
  }
}