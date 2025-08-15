import { NextRequest, NextResponse } from 'next/server';
import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { typeDefs } from '@/graphql/schema';
import { resolvers } from '@/graphql/resolvers';
import { createContext } from '@/graphql/context';

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const handler = startServerAndCreateNextHandler(server, {
  context: async (req) => createContext(req),
});

export async function POST(req: NextRequest) {
  return handler(req);
}

export async function GET() {
  return NextResponse.json({ 
    message: 'GraphQL endpoint - POST requests only' 
  });
}