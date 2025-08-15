import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // For App Router, getSession() can be called without parameters
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const organizations = await prisma.organization.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    return NextResponse.json({ organizations });
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json({ error: 'Failed to fetch organizations' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // For App Router, getSession() can be called without parameters
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { auth0Id: session.user.sub },
    });

    if (!currentUser || currentUser.role !== 'MANAGER') {
      return NextResponse.json({ error: 'Manager access required' }, { status: 403 });
    }

    const { name, location, perimeterRadius } = await req.json();

    const organization = await prisma.organization.create({
      data: {
        name,
        locationLat: location.lat,
        locationLng: location.lng,
        perimeterRadius,
      },
    });

    // Associate the manager with the organization
    await prisma.user.update({
      where: { id: currentUser.id },
      data: { organizationId: organization.id },
    });

    return NextResponse.json({ organization });
  } catch (error) {
    console.error('Error creating organization:', error);
    return NextResponse.json({ error: 'Failed to create organization' }, { status: 500 });
  }
}