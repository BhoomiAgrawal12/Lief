'use client';

import { useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { Card, Form, Input, Select, Button, Typography, Space, message } from 'antd';
import { useRouter } from 'next/navigation';

const { Title } = Typography;
const { Option } = Select;

export default function SetupPage() {
  const { user, isLoading } = useUser();
  const [form] = Form.useForm();
  const [createUserLoading, setCreateUserLoading] = useState(false);
  const [createOrgLoading, setCreateOrgLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [userRole, setUserRole] = useState<'MANAGER' | 'CARE_WORKER' | null>(null);
  const router = useRouter();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    router.push('/api/auth/login');
    return null;
  }

  const handleCreateUser = async (values: any) => {
    setCreateUserLoading(true);
    try {
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          role: values.role,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create user');
      }
      
      setUserRole(values.role);
      
      if (values.role === 'MANAGER') {
        setStep(2);
      } else {
        message.success('Profile created successfully!');
        router.push('/dashboard');
      }
    } catch (error: any) {
      message.error('Failed to create profile: ' + error.message);
    } finally {
      setCreateUserLoading(false);
    }
  };

  const handleCreateOrganization = async (values: any) => {
    setCreateOrgLoading(true);
    try {
      const response = await fetch('/api/organization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.organizationName,
          location: {
            lat: parseFloat(values.locationLat),
            lng: parseFloat(values.locationLng),
          },
          perimeterRadius: parseInt(values.perimeterRadius),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create organization');
      }
      
      message.success('Organization created successfully!');
      router.push('/dashboard');
    } catch (error: any) {
      message.error('Failed to create organization: ' + error.message);
    } finally {
      setCreateOrgLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          form.setFieldsValue({
            locationLat: position.coords.latitude.toString(),
            locationLng: position.coords.longitude.toString(),
          });
          message.success('Location detected successfully!');
        },
        (error) => {
          message.error('Failed to get location: ' + error.message);
        }
      );
    } else {
      message.error('Geolocation is not supported by your browser');
    }
  };

  if (step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <Space direction="vertical" className="w-full" size="large">
            <Title level={2} className="text-center">Welcome to Shift Tracker</Title>
            <Typography.Paragraph className="text-center text-gray-600">
              Let&apos;s set up your profile to get started.
            </Typography.Paragraph>
            
            <Form
              form={form}
              layout="vertical"
              onFinish={handleCreateUser}
              initialValues={{
                name: user.name || '',
              }}
            >
              <Form.Item
                label="Full Name"
                name="name"
                rules={[{ required: true, message: 'Please enter your full name' }]}
              >
                <Input placeholder="Enter your full name" />
              </Form.Item>

              <Form.Item
                label="Role"
                name="role"
                rules={[{ required: true, message: 'Please select your role' }]}
              >
                <Select placeholder="Select your role">
                  <Option value="MANAGER">Manager</Option>
                  <Option value="CARE_WORKER">Care Worker</Option>
                </Select>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={createUserLoading}
                  className="w-full"
                >
                  Continue
                </Button>
              </Form.Item>
            </Form>
          </Space>
        </Card>
      </div>
    );
  }

  if (step === 2 && userRole === 'MANAGER') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <Space direction="vertical" className="w-full" size="large">
            <Title level={2} className="text-center">Create Organization</Title>
            <Typography.Paragraph className="text-center text-gray-600">
              Set up your organization details and location.
            </Typography.Paragraph>
            
            <Form
              form={form}
              layout="vertical"
              onFinish={handleCreateOrganization}
            >
              <Form.Item
                label="Organization Name"
                name="organizationName"
                rules={[{ required: true, message: 'Please enter organization name' }]}
              >
                <Input placeholder="Enter organization name" />
              </Form.Item>

              <Form.Item
                label="Location Latitude"
                name="locationLat"
                rules={[{ required: true, message: 'Please enter latitude' }]}
              >
                <Input placeholder="Latitude" type="number" step="any" />
              </Form.Item>

              <Form.Item
                label="Location Longitude"
                name="locationLng"
                rules={[{ required: true, message: 'Please enter longitude' }]}
              >
                <Input placeholder="Longitude" type="number" step="any" />
              </Form.Item>

              <Form.Item>
                <Button onClick={getCurrentLocation} className="w-full mb-2">
                  Get Current Location
                </Button>
              </Form.Item>

              <Form.Item
                label="Perimeter Radius (meters)"
                name="perimeterRadius"
                rules={[{ required: true, message: 'Please enter perimeter radius' }]}
                initialValue={2000}
              >
                <Input placeholder="Radius in meters" type="number" />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={createOrgLoading}
                  className="w-full"
                >
                  Create Organization
                </Button>
              </Form.Item>
            </Form>
          </Space>
        </Card>
      </div>
    );
  }

  return null;
}