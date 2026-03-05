import { useState } from 'react';
import './App.css';
import { generateContract } from './contractGenerator';
import InvoiceForm from './InvoiceForm';
import { supabase } from './supabaseClient';

function Generator({ onNavigate, editingContract, editingInvoice }) {
  const [showInvoice, setShowInvoice] = useState(editingInvoice ? true : false);
  const [formData, setFormData] = useState(editingContract ? {
    ...editingContract.contract_data,
    _id: editingContract.id
  } : editingInvoice ? {
    ...editingInvoice.invoice_data.formData,
    _invoiceId: editingInvoice.id
  } : {
    contractDate: '',
    clubName: '',
    clubAddress: '',
    leaguesName: '',
    playerName: '',
    playerAddress: '',
    playerCountry: '',
    teamCountry: '',
    countryName: '',
    numberOfSeasons: '1',
    season: '2025/26',
    season1: '2025/26',
    season2: '2026/27',
    additionalSeason: '',
    additionalSeasonClause: '',
    currency: '€',
    seasons: [
      {
        seasonName: '2025/26',
        totalSalary: '',
        numberOfPayments: '10',
        payments: Array(10).fill(null).map(() => ({ date: '', amount: '' })),
        agencyFee: {
          totalAmount: '',
          numberOfPayments: '1',
          payments: [{ date: '', amount: '' }]
        }
      }
    ],
    teamBuyoutAmount: '',
    playerBuyoutAmount: '',
    buyoutDate: '',
    agentName: '',
    otherAgentName: '',
    emailAddress: '',
    fibaLicence: '',
    signeeTitle: '',
    signeeName: '',
    taxInfo: '',
    ticketClass: '',
    numberOfTickets: '',
    numberOfBedrooms: '',
    numberOfDays: '',
    includeNotClause: false,
    bonuses: [
      {
        competitionName: '',
        achievements: [
          { description: '', amount: '' }
        ]
      }
    ],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === 'checkbox' ? checked : value;

    if (name === 'numberOfSeasons') {
      const numSeasons = parseInt(value) || 1;
      const newSeasons = [];

      for (let i = 0; i < numSeasons; i++) {
        if (formData.seasons[i]) {
          newSeasons.push(formData.seasons[i]);
        } else {
          const year = 2025 + i;
          newSeasons.push({
            seasonName: `${year}/${(year + 1).toString().slice(2)}`,
            totalSalary: '',
            numberOfPayments: '10',
            payments: Array(10).fill(null).map(() => ({ date: '', amount: '' })),
            agencyFee: {
              totalAmount: '',
              numberOfPayments: '1',
              payments: [{ date: '', amount: '' }]
            }
          });
        }
      }

      setFormData(prev => ({
        ...prev,
        [name]: value,
        seasons: newSeasons,
        season1: newSeasons[0]?.seasonName || '2025/26',
        season2: newSeasons[1]?.seasonName || '2026/27'
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: inputValue }));
    }
  };

  const handleSeasonChange = (seasonIndex, field, value) => {
    const newSeasons = [...formData.seasons];

    if (field === 'numberOfPayments') {
      const numPayments = parseInt(value) || 1;
      const existingPayments = newSeasons[seasonIndex].payments || [];
      const newPayments = [];

      for (let i = 0; i < numPayments; i++) {
        if (existingPayments[i]) {
          newPayments.push(existingPayments[i]);
        } else {
          newPayments.push({ date: '', amount: '' });
        }
      }

      newSeasons[seasonIndex] = {
        ...newSeasons[seasonIndex],
        numberOfPayments: value,
        payments: newPayments
      };
    } else {
      newSeasons[seasonIndex][field] = value;
    }

    setFormData(prev => ({ ...prev, seasons: newSeasons }));
  };

  const handlePaymentChange = (seasonIndex, paymentIndex, field, value) => {
    const newSeasons = [...formData.seasons];
    newSeasons[seasonIndex].payments[paymentIndex][field] = value;
    setFormData(prev => ({ ...prev, seasons: newSeasons }));
  };

  const handleAgencyFeeChange = (seasonIndex, field, value) => {
    const newSeasons = [...formData.seasons];

    if (field === 'numberOfPayments') {
      const numPayments = parseInt(value) || 1;
      const existingPayments = newSeasons[seasonIndex].agencyFee.payments || [];
      const newPayments = [];

      for (let i = 0; i < numPayments; i++) {
        if (existingPayments[i]) {
          newPayments.push(existingPayments[i]);
        } else {
          newPayments.push({ date: '', amount: '' });
        }
      }

      newSeasons[seasonIndex].agencyFee = {
        ...newSeasons[seasonIndex].agencyFee,
        numberOfPayments: value,
        payments: newPayments
      };
    } else {
      newSeasons[seasonIndex].agencyFee[field] = value;
    }

    setFormData(prev => ({ ...prev, seasons: newSeasons }));
  };

  const handleAgencyFeePaymentChange = (seasonIndex, paymentIndex, field, value) => {
    const newSeasons = [...formData.seasons];
    newSeasons[seasonIndex].agencyFee.payments[paymentIndex][field] = value;
    setFormData(prev => ({ ...prev, seasons: newSeasons }));
  };

  const handleBonusCompetitionChange = (competitionIndex, value) => {
    const newBonuses = [...formData.bonuses];
    newBonuses[competitionIndex].competitionName = value;
    setFormData(prev => ({ ...prev, bonuses: newBonuses }));
  };

  const handleAchievementChange = (competitionIndex, achievementIndex, field, value) => {
    const newBonuses = [...formData.bonuses];
    newBonuses[competitionIndex].achievements[achievementIndex][field] = value;
    setFormData(prev => ({ ...prev, bonuses: newBonuses }));
  };

  const addAchievement = (competitionIndex) => {
    const newBonuses = [...formData.bonuses];
    newBonuses[competitionIndex].achievements.push({ description: '', amount: '' });
    setFormData(prev => ({ ...prev, bonuses: newBonuses }));
  };

  const removeAchievement = (competitionIndex, achievementIndex) => {
    const newBonuses = [...formData.bonuses];
    if (newBonuses[competitionIndex].achievements.length > 1) {
      newBonuses[competitionIndex].achievements.splice(achievementIndex, 1);
      setFormData(prev => ({ ...prev, bonuses: newBonuses }));
    }
  };

  const addCompetition = () => {
    setFormData(prev => ({
      ...prev,
      bonuses: [...prev.bonuses, { competitionName: '', achievements: [{ description: '', amount: '' }] }]
    }));
  };

  const removeCompetition = (competitionIndex) => {
    if (formData.bonuses.length > 1) {
      const newBonuses = formData.bonuses.filter((_, i) => i !== competitionIndex);
      setFormData(prev => ({ ...prev, bonuses: newBonuses }));
    }
  };

  const saveToDatabase = async (dataToSave) => {
    try {
      const contractId = formData._id;

      if (contractId) {
        const { error } = await supabase
          .from('contracts')
          .update({
            player_name: dataToSave.playerName,
            team_name: dataToSave.clubName,
            season: dataToSave.season,
            contract_data: dataToSave,
            updated_at: new Date().toISOString()
          })
          .eq('id', contractId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('contracts')
          .insert({
            player_name: dataToSave.playerName,
            team_name: dataToSave.clubName,
            season: dataToSave.season,
            contract_data: dataToSave
          });

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error saving to database:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await generateContract(formData);
      await saveToDatabase(formData);
      setSuccess('Contract generated successfully!');
      setShowInvoice(true);
    } catch (err) {
      console.error('Contract generation error:', err);
      setError(err.message || 'Failed to generate contract');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch('/template.docx');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Team_Contract_Template.docx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Dosya indirilemedi. Lütfen tekrar deneyin.');
    }
  };

  if (showInvoice) {
    return <InvoiceForm formData={formData} onBack={() => setShowInvoice(false)} onNavigate={onNavigate} editingInvoice={editingInvoice} />;
  }

  return (
    <div className="app">
      <div className="container">
        <header>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h1>Basketball Contract Generator</h1>
            <button onClick={() => onNavigate('home')} style={{ padding: '8px 16px' }}>Back to Home</button>
          </div>
          <p>Fill in the contract details based on template</p>
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="btn-download"
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Download Template
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <section className="form-section">
            <h2>Contract Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Contract Date *</label>
                <input
                  type="text"
                  name="contractDate"
                  value={formData.contractDate}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., January 15, 2025"
                />
              </div>
            </div>
          </section>

          <section className="form-section">
            <h2>Club Information</h2>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Club Name *</label>
                <input
                  type="text"
                  name="clubName"
                  value={formData.clubName}
                  onChange={handleInputChange}
                  required
                  placeholder="Name of the club"
                />
              </div>
              <div className="form-group full-width">
                <label>Club Address *</label>
                <input
                  type="text"
                  name="clubAddress"
                  value={formData.clubAddress}
                  onChange={handleInputChange}
                  required
                  placeholder="Address of the club"
                />
              </div>
              <div className="form-group full-width">
                <label>Leagues Name *</label>
                <input
                  type="text"
                  name="leaguesName"
                  value={formData.leaguesName}
                  onChange={handleInputChange}
                  required
                  placeholder="Name of the leagues"
                />
              </div>
              <div className="form-group">
                <label>Team Country *</label>
                <input
                  type="text"
                  name="teamCountry"
                  value={formData.teamCountry}
                  onChange={handleInputChange}
                  required
                  placeholder="Country of the team"
                />
              </div>
              <div className="form-group">
                <label>Country Name (for taxes) *</label>
                <input
                  type="text"
                  name="countryName"
                  value={formData.countryName}
                  onChange={handleInputChange}
                  required
                  placeholder="Country name"
                />
              </div>
              <div className="form-group">
                <label>VAT Number</label>
                <input
                  type="text"
                  name="taxInfo"
                  value={formData.taxInfo}
                  onChange={handleInputChange}
                  placeholder="e.g., SARIYER VERGI DAIRESI 2700863000"
                />
              </div>
            </div>
          </section>

          <section className="form-section">
            <h2>Player Information</h2>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Player Name *</label>
                <input
                  type="text"
                  name="playerName"
                  value={formData.playerName}
                  onChange={handleInputChange}
                  required
                  placeholder="Full name of the player"
                />
              </div>
              <div className="form-group full-width">
                <label>Player Address *</label>
                <input
                  type="text"
                  name="playerAddress"
                  value={formData.playerAddress}
                  onChange={handleInputChange}
                  required
                  placeholder="Address of the player"
                />
              </div>
              <div className="form-group">
                <label>Player Country *</label>
                <input
                  type="text"
                  name="playerCountry"
                  value={formData.playerCountry}
                  onChange={handleInputChange}
                  required
                  placeholder="Country of the player"
                />
              </div>
            </div>
          </section>

          <section className="form-section">
            <h2>Season Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Number of Seasons *</label>
                <select
                  name="numberOfSeasons"
                  value={formData.numberOfSeasons}
                  onChange={handleInputChange}
                  required
                >
                  <option value="1">1 Season</option>
                  <option value="2">2 Seasons</option>
                </select>
              </div>
              <div className="form-group">
                <label>Season *</label>
                <input
                  type="text"
                  name="season"
                  value={formData.season}
                  onChange={handleInputChange}
                  required
                  placeholder="2025/26"
                />
              </div>
              <div className="form-group">
                <label>Season 1</label>
                <input
                  type="text"
                  name="season1"
                  value={formData.season1}
                  onChange={handleInputChange}
                  placeholder="2025/26"
                />
              </div>
              <div className="form-group">
                <label>Season 2 (if applicable)</label>
                <input
                  type="text"
                  name="season2"
                  value={formData.season2}
                  onChange={handleInputChange}
                  placeholder="2026/27"
                />
              </div>
            </div>
          </section>

          <section className="form-section">
            <h2>Financial Terms</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Currency *</label>
                <input
                  type="text"
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  required
                  placeholder="€"
                />
              </div>
            </div>
          </section>

          <section className="form-section">
            <h2>Salary & Payment Schedule</h2>
            {formData.seasons.map((season, seasonIndex) => (
              <div key={seasonIndex} className="season-payment-section">
                <h3>Season {seasonIndex + 1}: {season.seasonName}</h3>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Season Name *</label>
                    <input
                      type="text"
                      value={season.seasonName}
                      onChange={(e) => handleSeasonChange(seasonIndex, 'seasonName', e.target.value)}
                      required
                      placeholder="e.g., 2025/26"
                    />
                  </div>
                  <div className="form-group">
                    <label>Total Salary for Season *</label>
                    <input
                      type="text"
                      value={season.totalSalary}
                      onChange={(e) => handleSeasonChange(seasonIndex, 'totalSalary', e.target.value)}
                      required
                      placeholder="e.g., 117,000"
                    />
                  </div>
                  <div className="form-group">
                    <label>Number of Payments *</label>
                    <select
                      value={season.numberOfPayments}
                      onChange={(e) => handleSeasonChange(seasonIndex, 'numberOfPayments', e.target.value)}
                      required
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="payments-container">
                  <h4>Payment Schedule</h4>
                  {season.payments.map((payment, paymentIndex) => (
                    <div key={paymentIndex} className="payment-item">
                      <div className="payment-header">Payment {paymentIndex + 1}</div>
                      <div className="form-grid">
                        <div className="form-group">
                          <label>Date *</label>
                          <input
                            type="text"
                            value={payment.date}
                            onChange={(e) => handlePaymentChange(seasonIndex, paymentIndex, 'date', e.target.value)}
                            required
                            placeholder="e.g., October 1st 2025"
                          />
                        </div>
                        <div className="form-group">
                          <label>Amount *</label>
                          <input
                            type="text"
                            value={payment.amount}
                            onChange={(e) => handlePaymentChange(seasonIndex, paymentIndex, 'amount', e.target.value)}
                            required
                            placeholder="e.g., 13,000"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="agency-fee-container" style={{ marginTop: '30px', borderTop: '2px solid #e0e0e0', paddingTop: '20px' }}>
                  <h4>Agency Fee for {season.seasonName}</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Total Agency Fee</label>
                      <input
                        type="text"
                        value={season.agencyFee.totalAmount}
                        onChange={(e) => handleAgencyFeeChange(seasonIndex, 'totalAmount', e.target.value)}
                        placeholder="e.g., 11,700"
                      />
                    </div>
                    <div className="form-group">
                      <label>Number of Agency Fee Payments</label>
                      <select
                        value={season.agencyFee.numberOfPayments}
                        onChange={(e) => handleAgencyFeeChange(seasonIndex, 'numberOfPayments', e.target.value)}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="payments-container">
                    <h5>Agency Fee Payment Schedule</h5>
                    {season.agencyFee.payments.map((payment, paymentIndex) => (
                      <div key={paymentIndex} className="payment-item">
                        <div className="payment-header">Agency Fee Payment {paymentIndex + 1}</div>
                        <div className="form-grid">
                          <div className="form-group">
                            <label>Date</label>
                            <input
                              type="text"
                              value={payment.date}
                              onChange={(e) => handleAgencyFeePaymentChange(seasonIndex, paymentIndex, 'date', e.target.value)}
                              placeholder="e.g., November 5, 2025"
                            />
                          </div>
                          <div className="form-group">
                            <label>Amount</label>
                            <input
                              type="text"
                              value={payment.amount}
                              onChange={(e) => handleAgencyFeePaymentChange(seasonIndex, paymentIndex, 'amount', e.target.value)}
                              placeholder="e.g., 5,850"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </section>

          <section className="form-section">
            <h2>Buyout Clauses</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Team Buyout Amount</label>
                <input
                  type="text"
                  name="teamBuyoutAmount"
                  value={formData.teamBuyoutAmount}
                  onChange={handleInputChange}
                  placeholder="e.g., 50,000.00"
                />
              </div>
              <div className="form-group">
                <label>Player Buyout Amount</label>
                <input
                  type="text"
                  name="playerBuyoutAmount"
                  value={formData.playerBuyoutAmount}
                  onChange={handleInputChange}
                  placeholder="e.g., 25,000.00"
                />
              </div>
              <div className="form-group">
                <label>Buyout Date</label>
                <input
                  type="text"
                  name="buyoutDate"
                  value={formData.buyoutDate}
                  onChange={handleInputChange}
                  placeholder="e.g., June 30, 2026"
                />
              </div>
            </div>
          </section>

          <section className="form-section">
            <h2>Agent Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Agent Name</label>
                <input
                  type="text"
                  name="agentName"
                  value={formData.agentName}
                  onChange={handleInputChange}
                  placeholder="Name of the agent"
                />
              </div>
              <div className="form-group">
                <label>Other Agent Name</label>
                <input
                  type="text"
                  name="otherAgentName"
                  value={formData.otherAgentName}
                  onChange={handleInputChange}
                  placeholder="And name of the other agent"
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="emailAddress"
                  value={formData.emailAddress}
                  onChange={handleInputChange}
                  placeholder="agent@example.com"
                />
              </div>
              <div className="form-group">
                <label>FIBA Licence Number</label>
                <input
                  type="text"
                  name="fibaLicence"
                  value={formData.fibaLicence}
                  onChange={handleInputChange}
                  placeholder="FIBA licence number"
                />
              </div>
            </div>
          </section>

          <section className="form-section">
            <h2>Signee Information (for the Club)</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Signee Title</label>
                <input
                  type="text"
                  name="signeeTitle"
                  value={formData.signeeTitle}
                  onChange={handleInputChange}
                  placeholder="e.g., General Manager"
                />
              </div>
              <div className="form-group">
                <label>Signee Name</label>
                <input
                  type="text"
                  name="signeeName"
                  value={formData.signeeName}
                  onChange={handleInputChange}
                  placeholder="Name of signee"
                />
              </div>
            </div>
          </section>

          <section className="form-section">
            <h2>Additional Benefits</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Ticket Class</label>
                <input
                  type="text"
                  name="ticketClass"
                  value={formData.ticketClass}
                  onChange={handleInputChange}
                  placeholder="e.g., Business"
                />
              </div>
              <div className="form-group">
                <label>Number of Tickets</label>
                <input
                  type="text"
                  name="numberOfTickets"
                  value={formData.numberOfTickets}
                  onChange={handleInputChange}
                  placeholder="e.g., 2"
                />
              </div>
              <div className="form-group">
                <label>Number of Bedrooms</label>
                <input
                  type="text"
                  name="numberOfBedrooms"
                  value={formData.numberOfBedrooms}
                  onChange={handleInputChange}
                  placeholder="e.g., 2"
                />
              </div>
              <div className="form-group">
                <label>Number of Days</label>
                <input
                  type="text"
                  name="numberOfDays"
                  value={formData.numberOfDays}
                  onChange={handleInputChange}
                  placeholder="e.g., 30"
                />
              </div>
              <div className="form-group full-width">
                <label>
                  <input
                    type="checkbox"
                    name="includeNotClause"
                    checked={formData.includeNotClause}
                    onChange={handleInputChange}
                    style={{ width: 'auto', marginRight: '8px' }}
                  />
                  Bonuses are NOT cumulative
                </label>
              </div>
            </div>
          </section>

          <section className="form-section">
            <h2>Bonuses</h2>
            {formData.bonuses.map((bonus, competitionIndex) => (
              <div key={competitionIndex} className="bonus-competition">
                <div className="bonus-competition-header">
                  <h3>Competition {competitionIndex + 1}</h3>
                  {formData.bonuses.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCompetition(competitionIndex)}
                      className="btn-remove"
                    >
                      Remove Competition
                    </button>
                  )}
                </div>

                <div className="form-group full-width">
                  <label>Competition Name</label>
                  <input
                    type="text"
                    value={bonus.competitionName}
                    onChange={(e) => handleBonusCompetitionChange(competitionIndex, e.target.value)}
                    placeholder="e.g., Basketball Super League (BSL)"
                  />
                </div>

                <div className="achievements-list">
                  <h4>Achievements</h4>
                  {bonus.achievements.map((achievement, achievementIndex) => (
                    <div key={achievementIndex} className="achievement-item">
                      <div className="form-grid">
                        <div className="form-group">
                          <label>Achievement Description</label>
                          <input
                            type="text"
                            value={achievement.description}
                            onChange={(e) => handleAchievementChange(competitionIndex, achievementIndex, 'description', e.target.value)}
                            placeholder="e.g., For each win"
                          />
                        </div>
                        <div className="form-group">
                          <label>Bonus Amount</label>
                          <input
                            type="text"
                            value={achievement.amount}
                            onChange={(e) => handleAchievementChange(competitionIndex, achievementIndex, 'amount', e.target.value)}
                            placeholder="e.g., $400 (four hundred U.S. dollars)"
                          />
                        </div>
                      </div>
                      {bonus.achievements.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeAchievement(competitionIndex, achievementIndex)}
                          className="btn-remove-small"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addAchievement(competitionIndex)}
                    className="btn-add"
                  >
                    + Add Achievement
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addCompetition}
              className="btn-add-large"
            >
              + Add Competition
            </button>
          </section>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Generating...' : 'Generate Contract'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Generator;
