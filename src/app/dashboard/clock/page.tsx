'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Form, Input, Typography, Space, Alert, Spin, message, Row, Col } from 'antd';
import { ClockCircleOutlined, EnvironmentOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function ClockPage() {
  const [form] = Form.useForm();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string>('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [currentShift, setCurrentShift] = useState<any>(null);
  const [canClockIn, setCanClockIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clockInLoading, setClockInLoading] = useState(false);
  const [clockOutLoading, setClockOutLoading] = useState(false);

  // Fetch current shift
  useEffect(() => {
    fetchCurrentShift();
  }, []);

  // Check if can clock in when location changes
  useEffect(() => {
    if (location) {
      checkCanClockIn();
    }
  }, [location]);

  const fetchCurrentShift = async () => {
    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query GetCurrentShift {
              currentShift {
                id
                clockInTime
                clockInLat
                clockInLng
                clockInNote
              }
            }
          `
        }),
      });

      const data = await response.json();
      if (data.data) {
        setCurrentShift(data.data.currentShift);
      }
    } catch (error) {
      console.error('Error fetching current shift:', error);
    }
  };

  const checkCanClockIn = async () => {
    if (!location) return;
    
    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query CanClockIn($location: LocationInput!) {
              canClockIn(location: $location)
            }
          `,
          variables: {
            location: {
              lat: location.lat,
              lng: location.lng
            }
          }
        }),
      });

      const data = await response.json();
      if (data.data && typeof data.data.canClockIn === 'boolean') {
        setCanClockIn(data.data.canClockIn);
      } else {
        setCanClockIn(false);
      }
    } catch (error) {
      console.error('Error checking clock in availability:', error);
      setCanClockIn(false);
    }
  };

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    setLocationError('');

    if (!('geolocation' in navigator)) {
      setLocationError('Geolocation is not supported by your browser');
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsGettingLocation(false);
        message.success('Location detected successfully!');
      },
      (error) => {
        setLocationError(`Failed to get location: ${error.message}`);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  useEffect(() => {
    // Automatically get location when component mounts
    getCurrentLocation();
  }, []);

  const handleClockIn = async (values: any) => {
    if (!location) {
      message.error('Please enable location access to clock in');
      return;
    }

    setClockInLoading(true);
    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation ClockIn($input: ClockInInput!) {
              clockIn(input: $input) {
                id
                clockInTime
                clockInNote
              }
            }
          `,
          variables: {
            input: {
              location: {
                lat: location.lat,
                lng: location.lng
              },
              note: values.note
            }
          }
        }),
      });

      const data = await response.json();
      if (data.data && data.data.clockIn) {
        message.success('Clocked in successfully!');
        fetchCurrentShift();
        form.resetFields();
      } else if (data.errors) {
        message.error(`Clock in failed: ${data.errors[0].message}`);
      } else {
        message.error('Clock in failed');
      }
    } catch (error) {
      message.error('Clock in failed');
    } finally {
      setClockInLoading(false);
    }
  };

  const handleClockOut = async (values: any) => {
    if (!location) {
      message.error('Please enable location access to clock out');
      return;
    }

    setClockOutLoading(true);
    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation ClockOut($input: ClockOutInput!) {
              clockOut(input: $input) {
                id
                clockOutTime
                clockOutNote
                duration
              }
            }
          `,
          variables: {
            input: {
              location: {
                lat: location.lat,
                lng: location.lng
              },
              note: values.note
            }
          }
        }),
      });

      const data = await response.json();
      if (data.data && data.data.clockOut) {
        message.success('Clocked out successfully!');
        fetchCurrentShift();
        form.resetFields();
      } else if (data.errors) {
        message.error(`Clock out failed: ${data.errors[0].message}`);
      } else {
        message.error('Clock out failed');
      }
    } catch (error) {
      message.error('Clock out failed');
    } finally {
      setClockOutLoading(false);
    }
  };

  if (loading) {
    return <Spin size="large" className="flex justify-center items-center h-64" />;
  }

  return (
    <Space direction="vertical" size="large" className="w-full">
      <Title level={2}>Clock In/Out</Title>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card>
            <Space direction="vertical" size="large" className="w-full">
              <div className="text-center">
                <ClockCircleOutlined className="text-4xl text-blue-500 mb-4" />
                <Title level={3}>
                  {currentShift ? 'Currently Clocked In' : 'Ready to Clock In'}
                </Title>
                
                {currentShift && (
                  <Alert
                    message={`Started: ${new Date(currentShift.clockInTime).toLocaleString()}`}
                    type="info"
                    className="mb-4"
                  />
                )}
              </div>

              <div>
                <Space className="mb-4">
                  <EnvironmentOutlined />
                  <Text>Location Status:</Text>
                  {isGettingLocation ? (
                    <Text type="secondary">Getting location...</Text>
                  ) : location ? (
                    <Text type="success">Location detected</Text>
                  ) : (
                    <Text type="danger">Location required</Text>
                  )}
                </Space>

                {!location && (
                  <Button 
                    onClick={getCurrentLocation} 
                    loading={isGettingLocation}
                    type="dashed"
                    className="w-full mb-4"
                  >
                    Get My Location
                  </Button>
                )}

                {locationError && (
                  <Alert
                    message="Location Error"
                    description={locationError}
                    type="error"
                    className="mb-4"
                  />
                )}

                {location && !currentShift && (
                  <>
                    {!canClockIn ? (
                      <Alert
                        message="Outside Perimeter"
                        description="You are outside the organization perimeter and cannot clock in from this location."
                        type="warning"
                        className="mb-4"
                      />
                    ) : (
                      <Alert
                        message="Within Perimeter"
                        description="You are within the organization perimeter and can clock in."
                        type="success"
                        className="mb-4"
                      />
                    )}
                  </>
                )}
              </div>

              <Form
                form={form}
                layout="vertical"
                onFinish={currentShift ? handleClockOut : handleClockIn}
              >
                <Form.Item
                  label="Note (Optional)"
                  name="note"
                >
                  <TextArea
                    rows={3}
                    placeholder={
                      currentShift
                        ? "Add any notes about your shift..."
                        : "Add any notes about starting your shift..."
                    }
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    loading={clockInLoading || clockOutLoading}
                    disabled={
                      !location ||
                      (currentShift ? false : !canClockIn)
                    }
                    className="w-full"
                    danger={!!currentShift}
                  >
                    {currentShift ? 'Clock Out' : 'Clock In'}
                  </Button>
                </Form.Item>
              </Form>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Location Information">
            <Space direction="vertical" className="w-full">
              {location ? (
                <>
                  <Text>
                    <strong>Latitude:</strong> {location.lat.toFixed(6)}
                  </Text>
                  <Text>
                    <strong>Longitude:</strong> {location.lng.toFixed(6)}
                  </Text>
                  <Text type="secondary">
                    Location accuracy is important for shift tracking. Make sure you&apos;re at your work location before clocking in.
                  </Text>
                </>
              ) : (
                <Text type="secondary">
                  Location access is required to clock in/out. This ensures you&apos;re at the correct work location.
                </Text>
              )}

              {currentShift && (
                <div className="mt-4">
                  <Title level={5}>Clock In Details</Title>
                  <Text>
                    <strong>Time:</strong> {new Date(currentShift.clockInTime).toLocaleString()}
                  </Text>
                  <br />
                  <Text>
                    <strong>Location:</strong> {currentShift.clockInLat.toFixed(6)}, {currentShift.clockInLng.toFixed(6)}
                  </Text>
                  {currentShift.clockInNote && (
                    <>
                      <br />
                      <Text>
                        <strong>Note:</strong> {currentShift.clockInNote}
                      </Text>
                    </>
                  )}
                </div>
              )}
            </Space>
          </Card>
        </Col>
      </Row>
    </Space>
  );
}