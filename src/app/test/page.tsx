export default function TestPage() {
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
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ color: '#1890ff', marginBottom: '1rem' }}>
          ✅ Shift Tracker Test Page
        </h1>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          If you can see this page, the basic Next.js setup is working!
        </p>
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#f6ffed', 
          border: '1px solid #b7eb8f',
          borderRadius: '4px',
          color: '#52c41a'
        }}>
          <strong>Status:</strong> Basic setup is working correctly
        </div>
      </div>
    </div>
  );
}
