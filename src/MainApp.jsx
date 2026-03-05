import { useState } from 'react';
import Home from './Home';
import ContractsList from './ContractsList';
import InvoicesList from './InvoicesList';
import Generator from './Generator';

function MainApp() {
  const [currentView, setCurrentView] = useState('home');
  const [editingContract, setEditingContract] = useState(null);
  const [editingInvoice, setEditingInvoice] = useState(null);

  const handleNavigate = (view) => {
    setCurrentView(view);
    setEditingContract(null);
    setEditingInvoice(null);
  };

  const handleEditContract = (contract) => {
    setEditingContract(contract);
    setCurrentView('generator');
  };

  const handleEditInvoice = (invoice) => {
    setEditingInvoice(invoice);
    setCurrentView('generator');
  };

  if (currentView === 'home') {
    return <Home onNavigate={handleNavigate} />;
  }

  if (currentView === 'contracts') {
    return <ContractsList onNavigate={handleNavigate} onEdit={handleEditContract} />;
  }

  if (currentView === 'invoices') {
    return <InvoicesList onNavigate={handleNavigate} onEdit={handleEditInvoice} />;
  }

  if (currentView === 'generator') {
    return (
      <Generator
        onNavigate={handleNavigate}
        editingContract={editingContract}
        editingInvoice={editingInvoice}
      />
    );
  }

  return null;
}

export default MainApp;
