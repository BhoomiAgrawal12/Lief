'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import { Button, Card, Typography, Space, Spin, Alert, Row, Col } from 'antd';
import { LoginOutlined, ClockCircleOutlined, TeamOutlined, SafetyOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

export default function Home() {
  const { user, isLoading: userLoading, error: userError } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!userLoading && user) {
      setLoading(true);
      setError(null);
      
      // Check if user exists in our database
      fetch('/api/user')
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          console.log('User data received:', data);
          
          if (!data.user) {
            // User needs to complete setup
            console.log('Redirecting to setup - no user data');
            router.push('/setup');
          } else if (data.user.role === 'MANAGER' && !data.user.organizationId) {
            // Manager needs to create organization
            console.log('Redirecting to setup - manager needs organization');
            router.push('/setup');
          } else {
            // User is fully set up
            console.log('Redirecting to dashboard - user is set up');
            router.push('/dashboard');
          }
        })
        .catch(error => {
          console.error('Error fetching user:', error);
          setError(error.message);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [user, userLoading, router]);

  // Show error if Auth0 has an error
  if (userError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 p-4">
        <Card className="w-full max-w-md text-center shadow-lg">
          <Alert
            message="Authentication Error"
            description={userError.message || 'An error occurred during authentication'}
            type="error"
            showIcon
            className="mb-4"
          />
          <Button
            type="primary"
            href="/api/auth/login"
            className="w-full"
          >
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  // Show loading state only for initial Auth0 loading
  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Spin size="large" />
          <div className="mt-4 text-gray-600">Loading authentication...</div>
        </div>
      </div>
    );
  }

  // Show login page for unauthenticated users
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <Title level={1} className="text-blue-600 mb-4">
              <ClockCircleOutlined className="mr-3" />
              Shift Tracker
            </Title>
            <Paragraph className="text-xl text-gray-600 max-w-2xl mx-auto">
              Streamline care worker shift management with location-based tracking and real-time analytics
            </Paragraph>
          </div>

          <Row gutter={[24, 24]} className="mb-12">
            <Col xs={24} md={12}>
              <Card className="h-full shadow-lg">
                <div className="text-center">
                  <TeamOutlined className="text-4xl text-blue-500 mb-4" />
                  <Title level={3} className="mb-4">For Managers</Title>
                  <ul className="text-left space-y-2">
                    <li>• Set location perimeters for clock-in zones</li>
                    <li>• Track staff attendance in real-time</li>
                    <li>• View comprehensive analytics and reports</li>
                    <li>• Monitor shift patterns and productivity</li>
                  </ul>
                </div>
              </Card>
            </Col>
            
            <Col xs={24} md={12}>
              <Card className="h-full shadow-lg">
                <div className="text-center">
                  <SafetyOutlined className="text-4xl text-green-500 mb-4" />
                  <Title level={3} className="mb-4">For Care Workers</Title>
                  <ul className="text-left space-y-2">
                    <li>• Clock in/out with location verification</li>
                    <li>• Add optional notes to each shift</li>
                    <li>• View personal shift history</li>
                    <li>• Automatic perimeter detection</li>
                  </ul>
                </div>
              </Card>
            </Col>
          </Row>

          <div className="text-center">
            <Button
              type="primary"
              size="large"
              icon={<LoginOutlined />}
              href="/api/auth/login"
              className="h-14 px-8 text-lg"
            >
              Get Started with Shift Tracker
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state for authenticated users while checking setup
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Spin size="large" />
          <div className="mt-4 text-gray-600">Setting up your account...</div>
        </div>
      </div>
    );
  }

  // Show error state for authenticated users
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-100 p-4">
        <Card className="w-full max-w-md text-center shadow-lg">
          <Alert
            message="Error Loading User Data"
            description={error}
            type="warning"
            showIcon
            className="mb-4"
          />
          <Space>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
            <Button type="primary" href="/api/auth/logout">
              Logout
            </Button>
          </Space>
        </Card>
      </div>
    );
  }

  // This should not be reached, but just in case
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <Spin size="large" />
        <div className="mt-4 text-gray-600">Redirecting...</div>
      </div>
    </div>
  );
}

// import { redirect } from 'next/navigation';

// export default function HomePage() {
//   redirect('/dashboard');
// }
