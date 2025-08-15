'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { Card, Button, Typography, Spin } from 'antd';

const { Title, Text } = Typography;

export default function TestAuthPage() {
  const { user, error, isLoading } = useUser();

  if (isLoading) return <Spin size="large" />;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="min-h-screen p-8">
      <Card className="max-w-md mx-auto">
        <Title level={2}>Auth Test</Title>
        
        {user ? (
          <div>
            <Text strong>Logged in as:</Text>
            <br />
            <Text>{user.name}</Text>
            <br />
            <Text>{user.email}</Text>
            <br />
            <img src={user.picture || '/default-avatar.png'} alt="Profile" width={50} height={50} className="rounded-full mt-2" />
            <br />
            <Button 
              type="primary" 
              href="/api/auth/logout" 
              className="mt-4"
            >
              Logout
            </Button>
          </div>
        ) : (
          <div>
            <Text>Not logged in</Text>
            <br />
            <Button 
              type="primary" 
              href="/api/auth/login"
              className="mt-4"
            >
              Login with Auth0
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}