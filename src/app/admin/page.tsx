'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { Card, Button, Typography, Space, message, Alert } from 'antd';
import { useRouter } from 'next/navigation';

const { Title } = Typography;

interface UserData {
  id: string;
  name: string;
  role: 'MANAGER' | 'CARE_WORKER';
  organizationId?: string;
}

export default function AdminPage() {
  const { user, isLoading } = useUser();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      fetchUserData();
    } else if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user');
      const data = await response.json();
      setUserData(data.user);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const changeRole = async (newRole: 'MANAGER' | 'CARE_WORKER') => {
    setLoading(true);
    try {
      const response = await fetch('/api/change-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error('Failed to change role');
      }

      const data = await response.json();
      setUserData(data.user);
      message.success(`Role changed to ${newRole}!`);
      
      // Redirect to dashboard to see the change
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (error: any) {
      message.error('Failed to change role: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user || !userData) {
    return <div>Loading user data...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <Space direction="vertical" className="w-full" size="large">
          <Title level={2} className="text-center">Role Switcher (Admin)</Title>
          
          <Alert
            message="Testing Purpose Only"
            description="This page allows you to switch between Manager and Care Worker roles to test both dashboards."
            type="info"
            showIcon
          />

          <div className="text-center">
            <p><strong>Current User:</strong> {userData.name}</p>
            <p><strong>Current Role:</strong> {userData.role}</p>
          </div>

          <Space direction="vertical" className="w-full">
            <Button
              type={userData.role === 'MANAGER' ? 'primary' : 'default'}
              onClick={() => changeRole('MANAGER')}
              loading={loading}
              className="w-full"
              disabled={userData.role === 'MANAGER'}
            >
              Switch to Manager
            </Button>
            
            <Button
              type={userData.role === 'CARE_WORKER' ? 'primary' : 'default'}
              onClick={() => changeRole('CARE_WORKER')}
              loading={loading}
              className="w-full"
              disabled={userData.role === 'CARE_WORKER'}
            >
              Switch to Care Worker
            </Button>
          </Space>

          <Button 
            type="link" 
            onClick={() => router.push('/dashboard')}
            className="w-full"
          >
            Go to Dashboard
          </Button>
        </Space>
      </Card>
    </div>
  );
}