'use client';

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { UserProvider } from '@auth0/nextjs-auth0/client';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider } from 'antd';
import { ApolloProvider } from '@/components/ApolloProvider';
import PWAInstaller from '@/components/PWAInstaller';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shift Tracker",
  description: "Care worker shift tracking application",
  manifest: "/manifest.json",
  themeColor: "#1890ff",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <UserProvider>
          <ApolloProvider>
            <AntdRegistry>
              <ConfigProvider
                theme={{
                  token: {
                    colorPrimary: '#1890ff',
                  },
                }}
              >
                {children}
                <PWAInstaller />
              </ConfigProvider>
            </AntdRegistry>
          </ApolloProvider>
        </UserProvider>
      </body>
    </html>
  );
}