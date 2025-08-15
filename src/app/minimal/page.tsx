export default function MinimalPage() {
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
          <strong>Status:</strong> Basic Next.js setup is working!
        </div>

        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#fff7e6', 
          border: '1px solid #ffd591',
          borderRadius: '4px',
          color: '#d46b08',
          marginBottom: '2rem'
        }}>
          <strong>Next Steps:</strong>
          <ul style={{ textAlign: 'left', margin: '0.5rem 0 0 0', paddingLeft: '1.5rem' }}>
            <li>Authentication setup</li>
            <li>Database connection</li>
            <li>UI components</li>
            <li>Location services</li>
          </ul>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <a 
            href="/test"
            style={{
              padding: '8px 16px',
              backgroundColor: '#52c41a',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px'
            }}
          >
            Test Page
          </a>
          <a 
            href="/simple"
            style={{
              padding: '8px 16px',
              backgroundColor: '#1890ff',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px'
            }}
          >
            Simple Auth
          </a>
        </div>
      </div>
    </div>
  );
}
