'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useEffect, useState } from 'react';
import { Layout, Menu, Dropdown, Avatar, Space, Typography } from 'antd';
import { UserOutlined, LogoutOutlined, DashboardOutlined, ClockCircleOutlined, TeamOutlined } from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUser();
  const [userData, setUserData] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (user) {
      fetch('/api/user')
        .then(res => res.json())
        .then(data => setUserData(data.user))
        .catch(console.error);
    }
  }, [user]);

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: () => router.push('/api/auth/logout'),
    },
  ];

  const getMenuItems = () => {
    const items = [
      {
        key: '/dashboard',
        icon: <DashboardOutlined />,
        label: <Link href="/dashboard">Dashboard</Link>,
      },
    ];

    if (userData?.role === 'CARE_WORKER') {
      items.push({
        key: '/dashboard/clock',
        icon: <ClockCircleOutlined />,
        label: <Link href="/dashboard/clock">Clock In/Out</Link>,
      });
    }

    if (userData?.role === 'MANAGER') {
      items.push({
        key: '/dashboard/staff',
        icon: <TeamOutlined />,
        label: <Link href="/dashboard/staff">Staff Management</Link>,
      });
    }

    return items;
  };

  return (
    <Layout className="min-h-screen">
      <Header className="flex items-center justify-between bg-white shadow-sm border-b">
        <div className="flex items-center">
          <Typography.Title level={4} className="mb-0 text-blue-600">
            Shift Tracker
          </Typography.Title>
        </div>
        
        <Space>
          <Text>Welcome, {userData?.name || user?.name}</Text>
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            trigger={['click']}
          >
            <Avatar
              className="cursor-pointer"
              icon={<UserOutlined />}
              src={user?.picture}
            />
          </Dropdown>
        </Space>
      </Header>

      <Layout>
        <Sider width={250} className="bg-white shadow-sm">
          <Menu
            mode="inline"
            selectedKeys={[pathname]}
            items={getMenuItems()}
            className="h-full border-none"
          />
        </Sider>
        
        <Layout className="p-6">
          <Content className="bg-white rounded-lg shadow-sm p-6">
            {children}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}