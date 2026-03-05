import './App.css';

function Home({ onNavigate }) {
  return (
    <div className="container">
      <h1 style={{ textAlign: 'center', marginBottom: '40px' }}>Basketball Management System</h1>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        maxWidth: '400px',
        margin: '0 auto'
      }}>
        <button
          onClick={() => onNavigate('contracts')}
          style={{
            padding: '20px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '8px'
          }}
        >
          Contracts
        </button>

        <button
          onClick={() => onNavigate('invoices')}
          style={{
            padding: '20px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '8px'
          }}
        >
          Invoices
        </button>

        <button
          onClick={() => onNavigate('generator')}
          style={{
            padding: '20px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
            backgroundColor: '#FF9800',
            color: 'white',
            border: 'none',
            borderRadius: '8px'
          }}
        >
          Contract-Invoice Generator
        </button>
      </div>
    </div>
  );
}

export default Home;
