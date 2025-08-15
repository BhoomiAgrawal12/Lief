'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import Link from 'next/link';

export default function SimplePage() {
  const { user, isLoading, error } = useUser();
  const [status, setStatus] = useState('Loading...');

  useEffect(() => {
    if (isLoading) {
      setStatus('Loading authentication...');
    } else if (error) {
      setStatus(`Error: ${error.message}`);
    } else if (user) {
      setStatus(`Welcome, ${user.name || user.email}!`);
    } else {
      setStatus('Not authenticated');
    }
  }, [user, isLoading, error]);

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f0f2f5',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '2rem',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        maxWidth: '500px',
        width: '100%'
      }}>
        <h1 style={{ color: '#1890ff', marginBottom: '1rem' }}>
          🕐 Shift Tracker
        </h1>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          Care worker shift tracking application
        </p>
        
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#f6ffed', 
          border: '1px solid #b7eb8f',
          borderRadius: '4px',
          color: '#52c41a',
          marginBottom: '2rem'
        }}>
          <strong>Status:</strong> {status}
        </div>

        {!user && !isLoading && (
          <div>
            <Link 
              href="/api/auth/login"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                backgroundColor: '#1890ff',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: 'bold'
              }}
            >
              Get Started
            </Link>
          </div>
        )}

        {user && (
          <div>
            <p style={{ marginBottom: '1rem' }}>
              You are logged in as: <strong>{user.email}</strong>
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <a 
                href="/dashboard"
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#52c41a',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '4px'
                }}
              >
                Go to Dashboard
              </a>
              <Link 
                href="/api/auth/logout"
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#ff4d4f',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '4px'
                }}
              >
                Logout
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
