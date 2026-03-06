import './App.css';

function Home({ onNavigate }) {
  const buttonStyle = {
    padding: '1.5rem 2rem',
    fontSize: '1.125rem',
    fontWeight: '700',
    cursor: 'pointer',
    color: 'white',
    border: 'none',
    borderRadius: '14px',
    transition: 'all 0.3s ease',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
    letterSpacing: '0.5px',
    position: 'relative',
    overflow: 'hidden'
  };

  return (
    <div className="app">
      <div className="container">
        <header style={{ marginBottom: '3rem' }}>
          <h1>Basketball Management System</h1>
          <p>Manage contracts and invoices efficiently</p>
        </header>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          maxWidth: '900px',
          margin: '0 auto'
        }}>
          <button
            onClick={() => onNavigate('contracts')}
            style={{
              ...buttonStyle,
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(16, 185, 129, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.2)';
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📄</div>
            Contracts
            <div style={{ fontSize: '0.875rem', fontWeight: '500', marginTop: '0.5rem', opacity: '0.9' }}>
              View and manage contracts
            </div>
          </button>

          <button
            onClick={() => onNavigate('invoices')}
            style={{
              ...buttonStyle,
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(59, 130, 246, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.2)';
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🧾</div>
            Invoices
            <div style={{ fontSize: '0.875rem', fontWeight: '500', marginTop: '0.5rem', opacity: '0.9' }}>
              View and manage invoices
            </div>
          </button>

          <button
            onClick={() => onNavigate('generator')}
            style={{
              ...buttonStyle,
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              gridColumn: 'span 1'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(245, 158, 11, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.2)';
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✨</div>
            Contract-Invoice Generator
            <div style={{ fontSize: '0.875rem', fontWeight: '500', marginTop: '0.5rem', opacity: '0.9' }}>
              Create new contracts and invoices
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
