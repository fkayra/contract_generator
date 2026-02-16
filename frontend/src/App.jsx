import { useState } from 'react'
import axios from 'axios'
import './App.css'

const API_URL = 'http://localhost:8000'

function App() {
  const [formData, setFormData] = useState({
    player_name: '',
    player_passport: '',
    player_birth_date: '',
    player_birth_place: '',
    player_address: '',
    player_tax_number: '',
    contract_date: new Date().toISOString().split('T')[0],
    contract_start_date: '',
    contract_end_date: '',
    jersey_number: '',
    total_salary: '',
    payment_schedule: [{ installment_number: 1, amount: '', due_date: '' }],
    team_buyout: null,
    player_buyout: null,
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePaymentChange = (index, field, value) => {
    const newPayments = [...formData.payment_schedule]
    newPayments[index][field] = value
    setFormData(prev => ({ ...prev, payment_schedule: newPayments }))
  }

  const addPayment = () => {
    setFormData(prev => ({
      ...prev,
      payment_schedule: [
        ...prev.payment_schedule,
        { installment_number: prev.payment_schedule.length + 1, amount: '', due_date: '' }
      ]
    }))
  }

  const removePayment = (index) => {
    if (formData.payment_schedule.length > 1) {
      setFormData(prev => ({
        ...prev,
        payment_schedule: prev.payment_schedule.filter((_, i) => i !== index)
      }))
    }
  }

  const handleBuyoutChange = (type, field, value) => {
    setFormData(prev => ({
      ...prev,
      [type]: {
        ...(prev[type] || { amount: '', deadline: '' }),
        [field]: value
      }
    }))
  }

  const removeBuyout = (type) => {
    setFormData(prev => ({ ...prev, [type]: null }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const payload = {
        ...formData,
        total_salary: parseFloat(formData.total_salary),
        payment_schedule: formData.payment_schedule.map(p => ({
          ...p,
          amount: parseFloat(p.amount)
        })),
        team_buyout: formData.team_buyout && formData.team_buyout.amount ? {
          ...formData.team_buyout,
          amount: parseFloat(formData.team_buyout.amount)
        } : undefined,
        player_buyout: formData.player_buyout && formData.player_buyout.amount ? {
          ...formData.player_buyout,
          amount: parseFloat(formData.player_buyout.amount)
        } : undefined,
      }

      const response = await axios.post(`${API_URL}/generate-contract`, payload, {
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `contract_${formData.player_name.replace(/\s+/g, '_')}.docx`)
      document.body.appendChild(link)
      link.click()
      link.remove()

      setSuccess('Contract generated successfully!')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate contract')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <div className="container">
        <header>
          <h1>Basketball Contract Generator</h1>
          <p>Fill in the player details to generate a professional contract</p>
        </header>

        <form onSubmit={handleSubmit}>
          <section className="form-section">
            <h2>Player Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Player Name *</label>
                <input
                  type="text"
                  name="player_name"
                  value={formData.player_name}
                  onChange={handleInputChange}
                  required
                  placeholder="John Doe"
                />
              </div>

              <div className="form-group">
                <label>Passport Number *</label>
                <input
                  type="text"
                  name="player_passport"
                  value={formData.player_passport}
                  onChange={handleInputChange}
                  required
                  placeholder="A12345678"
                />
              </div>

              <div className="form-group">
                <label>Birth Date *</label>
                <input
                  type="date"
                  name="player_birth_date"
                  value={formData.player_birth_date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Birth Place *</label>
                <input
                  type="text"
                  name="player_birth_place"
                  value={formData.player_birth_place}
                  onChange={handleInputChange}
                  required
                  placeholder="New York, USA"
                />
              </div>

              <div className="form-group full-width">
                <label>Address *</label>
                <input
                  type="text"
                  name="player_address"
                  value={formData.player_address}
                  onChange={handleInputChange}
                  required
                  placeholder="123 Main St, City, Country"
                />
              </div>

              <div className="form-group">
                <label>Tax Number *</label>
                <input
                  type="text"
                  name="player_tax_number"
                  value={formData.player_tax_number}
                  onChange={handleInputChange}
                  required
                  placeholder="123456789"
                />
              </div>

              <div className="form-group">
                <label>Jersey Number *</label>
                <input
                  type="text"
                  name="jersey_number"
                  value={formData.jersey_number}
                  onChange={handleInputChange}
                  required
                  placeholder="23"
                />
              </div>
            </div>
          </section>

          <section className="form-section">
            <h2>Contract Details</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Contract Date *</label>
                <input
                  type="date"
                  name="contract_date"
                  value={formData.contract_date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Contract Start Date *</label>
                <input
                  type="date"
                  name="contract_start_date"
                  value={formData.contract_start_date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Contract End Date *</label>
                <input
                  type="date"
                  name="contract_end_date"
                  value={formData.contract_end_date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Total Salary (€) *</label>
                <input
                  type="number"
                  name="total_salary"
                  value={formData.total_salary}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="50000.00"
                />
              </div>
            </div>
          </section>

          <section className="form-section">
            <h2>Payment Schedule</h2>
            {formData.payment_schedule.map((payment, index) => (
              <div key={index} className="payment-item">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Installment #{payment.installment_number}</label>
                    <input
                      type="number"
                      value={payment.amount}
                      onChange={(e) => handlePaymentChange(index, 'amount', e.target.value)}
                      required
                      min="0"
                      step="0.01"
                      placeholder="Amount"
                    />
                  </div>
                  <div className="form-group">
                    <label>Due Date</label>
                    <input
                      type="date"
                      value={payment.due_date}
                      onChange={(e) => handlePaymentChange(index, 'due_date', e.target.value)}
                      required
                    />
                  </div>
                </div>
                {formData.payment_schedule.length > 1 && (
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => removePayment(index)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button type="button" className="btn-add" onClick={addPayment}>
              + Add Payment
            </button>
          </section>

          <section className="form-section">
            <h2>Buyout Clauses (Optional)</h2>

            <div className="buyout-section">
              <h3>Team Buyout</h3>
              {formData.team_buyout ? (
                <div className="form-grid">
                  <div className="form-group">
                    <label>Amount (€)</label>
                    <input
                      type="number"
                      value={formData.team_buyout.amount}
                      onChange={(e) => handleBuyoutChange('team_buyout', 'amount', e.target.value)}
                      min="0"
                      step="0.01"
                      placeholder="10000.00"
                    />
                  </div>
                  <div className="form-group">
                    <label>Deadline</label>
                    <input
                      type="date"
                      value={formData.team_buyout.deadline}
                      onChange={(e) => handleBuyoutChange('team_buyout', 'deadline', e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => removeBuyout('team_buyout')}
                  >
                    Remove Team Buyout
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="btn-add"
                  onClick={() => setFormData(prev => ({ ...prev, team_buyout: { amount: '', deadline: '' } }))}
                >
                  + Add Team Buyout
                </button>
              )}
            </div>

            <div className="buyout-section">
              <h3>Player Buyout</h3>
              {formData.player_buyout ? (
                <div className="form-grid">
                  <div className="form-group">
                    <label>Amount (€)</label>
                    <input
                      type="number"
                      value={formData.player_buyout.amount}
                      onChange={(e) => handleBuyoutChange('player_buyout', 'amount', e.target.value)}
                      min="0"
                      step="0.01"
                      placeholder="5000.00"
                    />
                  </div>
                  <div className="form-group">
                    <label>Deadline</label>
                    <input
                      type="date"
                      value={formData.player_buyout.deadline}
                      onChange={(e) => handleBuyoutChange('player_buyout', 'deadline', e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => removeBuyout('player_buyout')}
                  >
                    Remove Player Buyout
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="btn-add"
                  onClick={() => setFormData(prev => ({ ...prev, player_buyout: { amount: '', deadline: '' } }))}
                >
                  + Add Player Buyout
                </button>
              )}
            </div>
          </section>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Generating...' : 'Generate Contract'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default App
