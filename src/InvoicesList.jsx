import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import './App.css';

function InvoicesList({ onNavigate, onEdit }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;

    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchInvoices();
    } catch (error) {
      console.error('Error deleting invoice:', error);
      alert('Failed to delete invoice');
    }
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Saved Invoices</h1>
        <button onClick={() => onNavigate('home')}>Back to Home</button>
      </div>

      {invoices.length === 0 ? (
        <p>No invoices saved yet.</p>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              style={{
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '15px',
                backgroundColor: '#f9f9f9'
              }}
            >
              <h3 style={{ margin: '0 0 10px 0' }}>{invoice.client_name}</h3>
              <p style={{ margin: '5px 0' }}><strong>Invoice #:</strong> {invoice.invoice_number}</p>
              <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>
                Created: {new Date(invoice.created_at).toLocaleDateString()}
              </p>
              <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => onEdit(invoice)}
                  style={{ backgroundColor: '#2196F3', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}
                >
                  View/Edit
                </button>
                <button
                  onClick={() => handleDelete(invoice.id)}
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

export default InvoicesList;
