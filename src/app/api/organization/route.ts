import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    // Create a proper response object for getSession
    const res = new NextResponse();
    const session = await getSession(req, res);
    
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