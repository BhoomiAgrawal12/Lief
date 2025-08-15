import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // Create a proper response object for getSession
    const res = new NextResponse();
    const session = await getSession(req, res);
    
    if (!session?.user) {
      return NextResponse.json({ user: null });
    }

    const user = await prisma.user.findUnique({
      where: { auth0Id: session.user.sub },
      include: { organization: true },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ user: null });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Create a proper response object for getSession
    const res = new NextResponse();
    const session = await getSession(req, res);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { name, role } = await req.json();

    const user = await prisma.user.create({
      data: {
        auth0Id: session.user.sub,
        email: session.user.email,
        name: name || session.user.name,
        role,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}