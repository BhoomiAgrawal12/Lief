import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shift Tracker - Care Worker Management",
  description: "Professional shift tracking application for healthcare workers with location-based clock in/out system",
};

export default function MinimalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#1890ff" />
      </head>
      <body style={{ 
        margin: 0, 
        padding: 0, 
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f0f2f5'
      }}>
        {children}
      </body>
    </html>
  );
}
