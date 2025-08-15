'use client';

import { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import { Card, Table, Space, Typography, Tabs, Tag, Tooltip, Button, Row, Col, Statistic } from 'antd';
import { UserOutlined, ClockCircleOutlined, CalendarOutlined } from '@ant-design/icons';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title as ChartTitle, Tooltip as ChartTooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ChartTitle,
  ChartTooltip,
  Legend,
  ArcElement
);

const { Title } = Typography;

const GET_ACTIVE_SHIFTS = gql`
  query GetActiveShifts {
    activeShifts {
      id
      user {
        id
        name
        email
      }
      clockInTime
      clockInLat
      clockInLng
      clockInNote
    }
  }
`;

const GET_ALL_SHIFTS = gql`
  query GetAllShifts {
    shifts {
      id
      user {
        id
        name
        email
      }
      clockInTime
      clockOutTime
      clockInLat
      clockInLng
      clockOutLat
      clockOutLng
      clockInNote
      clockOutNote
      duration
    }
  }
`;

const GET_USER_SHIFT_SUMMARIES = gql`
  query GetUserShiftSummaries {
    userShiftSummaries {
      user {
        id
        name
        email
        role
      }
      totalHoursThisWeek
      shiftsThisWeek
    }
  }
`;

function ActiveShiftsTab() {
  const { data, loading } = useQuery(GET_ACTIVE_SHIFTS, {
    pollInterval: 30000, // Poll every 30 seconds
  });

  const columns = [
    {
      title: 'Staff Member',
      dataIndex: ['user', 'name'],
      key: 'name',
      render: (text: string, record: any) => (
        <Space>
          <UserOutlined />
          <div>
            <div>{text}</div>
            <div className="text-gray-500 text-sm">{record.user.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Clock In Time',
      dataIndex: 'clockInTime',
      key: 'clockInTime',
      render: (time: string) => new Date(time).toLocaleString(),
    },
    {
      title: 'Duration',
      key: 'duration',
      render: (_: any, record: any) => {
        const duration = Date.now() - new Date(record.clockInTime).getTime();
        const hours = Math.floor(duration / (1000 * 60 * 60));
        const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
      },
    },
    {
      title: 'Location',
      key: 'location',
      render: (_: any, record: any) => (
        <Tooltip title={`Lat: ${record.clockInLat}, Lng: ${record.clockInLng}`}>
          <Button type="link" size="small">
            View Location
          </Button>
        </Tooltip>
      ),
    },
    {
      title: 'Note',
      dataIndex: 'clockInNote',
      key: 'note',
      render: (note: string) => note || '-',
    },
    {
      title: 'Status',
      key: 'status',
      render: () => (
        <Tag color="green">
          <ClockCircleOutlined /> Active
        </Tag>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data?.activeShifts || []}
      loading={loading}
      rowKey="id"
      pagination={{ pageSize: 10 }}
    />
  );
}

function AllShiftsTab() {
  const { data, loading } = useQuery(GET_ALL_SHIFTS);

  const columns = [
    {
      title: 'Staff Member',
      dataIndex: ['user', 'name'],
      key: 'name',
      render: (text: string, record: any) => (
        <Space>
          <UserOutlined />
          <div>
            <div>{text}</div>
            <div className="text-gray-500 text-sm">{record.user.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Clock In',
      dataIndex: 'clockInTime',
      key: 'clockInTime',
      render: (time: string) => new Date(time).toLocaleString(),
    },
    {
      title: 'Clock Out',
      dataIndex: 'clockOutTime',
      key: 'clockOutTime',
      render: (time: string) => time ? new Date(time).toLocaleString() : <Tag color="blue">In Progress</Tag>,
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration: number) => {
        if (!duration) return '-';
        const hours = Math.floor(duration / 60);
        const minutes = duration % 60;
        return `${hours}h ${minutes}m`;
      },
    },
    {
      title: 'Notes',
      key: 'notes',
      render: (_: any, record: any) => (
        <div>
          {record.clockInNote && <div><strong>In:</strong> {record.clockInNote}</div>}
          {record.clockOutNote && <div><strong>Out:</strong> {record.clockOutNote}</div>}
        </div>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data?.shifts || []}
      loading={loading}
      rowKey="id"
      pagination={{ pageSize: 10 }}
      scroll={{ x: true }}
    />
  );
}

function AnalyticsTab() {
  const { data, loading } = useQuery(GET_USER_SHIFT_SUMMARIES);

  if (loading) return <div>Loading analytics...</div>;

  const summaries = data?.userShiftSummaries || [];
  
  // Prepare data for charts
  const barChartData = {
    labels: summaries.map((s: any) => s.user.name),
    datasets: [
      {
        label: 'Hours This Week',
        data: summaries.map((s: any) => s.totalHoursThisWeek),
        backgroundColor: 'rgba(54, 162, 235, 0.8)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const doughnutChartData = {
    labels: summaries.map((s: any) => s.user.name),
    datasets: [
      {
        data: summaries.map((s: any) => s.shiftsThisWeek),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF6384',
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Staff Performance',
      },
    },
  };

  const columns = [
    {
      title: 'Staff Member',
      dataIndex: ['user', 'name'],
      key: 'name',
      render: (text: string, record: any) => (
        <Space>
          <UserOutlined />
          <div>
            <div>{text}</div>
            <div className="text-gray-500 text-sm">{record.user.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Total Hours (Week)',
      dataIndex: 'totalHoursThisWeek',
      key: 'totalHours',
      render: (hours: number) => `${hours.toFixed(1)}h`,
      sorter: (a: any, b: any) => a.totalHoursThisWeek - b.totalHoursThisWeek,
    },
    {
      title: 'Shifts (Week)',
      dataIndex: 'shiftsThisWeek',
      key: 'shifts',
      sorter: (a: any, b: any) => a.shiftsThisWeek - b.shiftsThisWeek,
    },
    {
      title: 'Avg Hours/Shift',
      key: 'avgHours',
      render: (_: any, record: any) => {
        const avg = record.shiftsThisWeek > 0 ? record.totalHoursThisWeek / record.shiftsThisWeek : 0;
        return `${avg.toFixed(1)}h`;
      },
    },
  ];

  return (
    <Space direction="vertical" size="large" className="w-full">
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Hours This Week">
            <Bar data={barChartData} options={chartOptions} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Shifts Distribution">
            <Doughnut data={doughnutChartData} options={chartOptions} />
          </Card>
        </Col>
      </Row>

      <Card>
        <Table
          columns={columns}
          dataSource={summaries}
          rowKey={(record: any) => record.user.id}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </Space>
  );
}

export default function StaffPage() {
  const { data: activeShiftsData } = useQuery(GET_ACTIVE_SHIFTS);
  const { data: summariesData } = useQuery(GET_USER_SHIFT_SUMMARIES);

  const activeShifts = activeShiftsData?.activeShifts?.length || 0;
  const totalStaff = summariesData?.userShiftSummaries?.length || 0;
  const totalHours = summariesData?.userShiftSummaries?.reduce((sum: number, summary: any) => 
    sum + summary.totalHoursThisWeek, 0) || 0;

  const tabItems = [
    {
      key: 'active',
      label: (
        <Space>
          <ClockCircleOutlined />
          Active Shifts
        </Space>
      ),
      children: <ActiveShiftsTab />,
    },
    {
      key: 'all',
      label: (
        <Space>
          <CalendarOutlined />
          All Shifts
        </Space>
      ),
      children: <AllShiftsTab />,
    },
    {
      key: 'analytics',
      label: (
        <Space>
          <UserOutlined />
          Analytics
        </Space>
      ),
      children: <AnalyticsTab />,
    },
  ];

  return (
    <Space direction="vertical" size="large" className="w-full">
      <Title level={2}>Staff Management</Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Active Shifts"
              value={activeShifts}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Staff"
              value={totalStaff}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Hours (Week)"
              value={totalHours}
              precision={1}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Tabs items={tabItems} />
      </Card>
    </Space>
  );
}