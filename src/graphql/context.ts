import { NextRequest } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export interface GraphQLContext {
  prisma: typeof prisma;
  user?: {
    auth0Id: string;
    email: string;
    name?: string;
  };
}

export async function createContext(req: any): Promise<GraphQLContext> {
  const context: GraphQLContext = {
    prisma,
  };

  try {
    // For App Router, getSession() can be called without parameters
    const session = await getSession();
    
    if (session?.user) {
      context.user = {
        auth0Id: session.user.sub,
        email: session.user.email,
        name: session.user.name,
      };
    }
  } catch (error) {
    // Session not available - this is normal for unauthenticated GraphQL requests
    // Most GraphQL queries should work without authentication, only specific ones require it
    console.log('GraphQL context auth error:', error);
  }

  return context;
}