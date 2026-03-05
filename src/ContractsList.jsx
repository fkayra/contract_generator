import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import './App.css';

function ContractsList({ onNavigate, onEdit }) {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContracts(data || []);
    } catch (error) {
      console.error('Error fetching contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this contract?')) return;

    try {
      const { error } = await supabase
        .from('contracts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchContracts();
    } catch (error) {
      console.error('Error deleting contract:', error);
      alert('Failed to delete contract');
    }
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Saved Contracts</h1>
        <button onClick={() => onNavigate('home')}>Back to Home</button>
      </div>

      {contracts.length === 0 ? (
        <p>No contracts saved yet.</p>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {contracts.map((contract) => (
            <div
              key={contract.id}
              style={{
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '15px',
                backgroundColor: '#f9f9f9'
              }}
            >
              <h3 style={{ margin: '0 0 10px 0' }}>{contract.player_name}</h3>
              <p style={{ margin: '5px 0' }}><strong>Team:</strong> {contract.team_name}</p>
              <p style={{ margin: '5px 0' }}><strong>Season:</strong> {contract.season}</p>
              <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>
                Created: {new Date(contract.created_at).toLocaleDateString()}
              </p>
              <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => onEdit(contract)}
                  style={{ backgroundColor: '#4CAF50', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}
                >
                  View/Edit
                </button>
                <button
                  onClick={() => handleDelete(contract.id)}
                  style={{ backgroundColor: '#f44336', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ContractsList;
