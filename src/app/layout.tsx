import type { Metadata, Viewport } from "next";
import { UserProvider } from '@auth0/nextjs-auth0/client';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider } from 'antd';
import { ApolloProvider } from '@/components/ApolloProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import PWAInstaller from '@/components/PWAInstaller';
import "./globals.css";

export const metadata: Metadata = {
  title: "Shift Tracker - Care Worker Management",
  description: "Professional shift tracking application for healthcare workers with location-based clock in/out system",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: '/favicon.svg' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#1890ff' },
    { media: '(prefers-color-scheme: dark)', color: '#1890ff' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#1890ff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Shift Tracker" />
      </head>
      <body className="antialiased">
        <UserProvider>
          <ErrorBoundary>
            <ApolloProvider>
              <AntdRegistry>
                <ConfigProvider
                  theme={{
                    token: {
                      colorPrimary: '#1890ff',
                      borderRadius: 8,
                    },
                    components: {
                      Button: {
                        borderRadius: 8,
                      },
                      Card: {
                        borderRadius: 12,
                      },
                    },
                  }}
                >
                  <main className="min-h-screen">
                    {children}
                  </main>
                  <PWAInstaller />
                </ConfigProvider>
              </AntdRegistry>
            </ApolloProvider>
          </ErrorBoundary>
        </UserProvider>
      </body>
    </html>
  );
}

