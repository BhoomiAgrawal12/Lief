import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // For App Router, getSession() can be called without parameters
    const session = await getSession();
    
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
    // For App Router, getSession() can be called without parameters
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { name, role } = await req.json();

    const user = await prisma.user.upsert({
      where: { auth0Id: session.user.sub },
      update: {
        name: name || session.user.name,
        role,
      },
      create: {
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