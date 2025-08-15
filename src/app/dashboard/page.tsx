'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { Card, Row, Col, Statistic, Typography, Space, Spin, Alert, Button } from 'antd';
import { ClockCircleOutlined, TeamOutlined, CalendarOutlined, TrophyOutlined, LogoutOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Title } = Typography;

interface UserData {
  id: string;
  name: string;
  role: 'MANAGER' | 'CARE_WORKER';
  organizationId?: string;
}

function ManagerDashboard() {
  const [analytics, setAnalytics] = useState({
    activeShifts: 0,
    totalUsersToday: 0,
    avgHoursPerDay: 0,
    totalHoursThisWeek: 0
  });

  return (
    <div className="p-6">
      <Space direction="vertical" size="large" className="w-full">
        <div className="flex justify-between items-center">
          <Title level={2}>Manager Dashboard</Title>
          <Button 
            type="text" 
            icon={<LogoutOutlined />} 
            href="/api/auth/logout"
          >
            Logout
          </Button>
        </div>
        
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Active Shifts"
                value={analytics.activeShifts}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Staff Today"
                value={analytics.totalUsersToday}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Avg Hours/Day"
                value={analytics.avgHoursPerDay}
                precision={1}
                prefix={<CalendarOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Hours (Week)"
                value={analytics.totalHoursThisWeek}
                precision={1}
                prefix={<TrophyOutlined />}
                valueStyle={{ color: '#eb2f96' }}
              />
            </Card>
          </Col>
        </Row>

        <Alert
          message="Welcome to your Manager Dashboard"
          description="This is where you'll manage your organization's shift tracking. Features include setting location perimeters, viewing staff attendance, and generating reports."
          type="info"
          showIcon
        />
      </Space>
    </div>
  );
}

function CareWorkerDashboard() {
  const [currentShift, setCurrentShift] = useState(null);
  const [recentShifts, setRecentShifts] = useState([]);

  return (
    <div className="p-6">
      <Space direction="vertical" size="large" className="w-full">
        <div className="flex justify-between items-center">
          <Title level={2}>Care Worker Dashboard</Title>
          <Button 
            type="text" 
            icon={<LogoutOutlined />} 
            href="/api/auth/logout"
          >
            Logout
          </Button>
        </div>
        
        {currentShift && (
          <Alert
            message="You're currently clocked in"
            description={`Started at ${new Date().toLocaleString()}`}
            type="info"
            showIcon
          />
        )}
        
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Current Status"
                value={currentShift ? "Clocked In" : "Clocked Out"}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: currentShift ? '#3f8600' : '#cf1322' }}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Shifts This Week"
                value={recentShifts.length}
                prefix={<CalendarOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Hours This Week"
                value={0}
                precision={1}
                prefix={<TrophyOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        <Alert
          message="Welcome to your Care Worker Dashboard"
          description="Here you can clock in/out of your shifts, add notes, and view your shift history. Make sure you're within your organization's perimeter to clock in."
          type="info"
          showIcon
        />
      </Space>
    </div>
  );
}

export default function DashboardPage() {
  const { user, isLoading } = useUser();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      fetch('/api/user')
        .then(res => res.json())
        .then(data => {
          setUserData(data.user);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching user data:', error);
          setLoading(false);
        });
    } else if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert
          message="User data not found"
          description="Please complete your profile setup first."
          type="warning"
          showIcon
        />
      </div>
    );
  }

  if (userData.role === 'MANAGER') {
    return <ManagerDashboard />;
  } else {
    return <CareWorkerDashboard />;
  }
}