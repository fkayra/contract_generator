import { useState } from 'react'
import './App.css'
import { generateContract } from './contractGenerator'

function App() {
  const [formData, setFormData] = useState({
    contractDate: '',
    clubName: '',
    clubAddress: '',
    leaguesName: '',
    playerName: '',
    playerAddress: '',
    teamCountry: '',
    countryName: '',
    numberOfSeasons: '1',
    season: '2025/26',
    season1: '2025/26',
    season2: '2026/27',
    additionalSeason: '',
    additionalSeasonClause: '',
    currency: '€',
    totalSalary: '',
    paymentSchedule: Array(10).fill(null).map((_, i) => ({ date: '', amount: '' })),
    teamBuyoutAmount: '',
    playerBuyoutAmount: '',
    buyoutDate: '',
    agentName: '',
    otherAgentName: '',
    agentNumber: '',
    emailAddress: '',
    fibaLicence: '',
    signeeTitle: '',
    signeeName: '',
    ticketClass: '',
    numberOfTickets: '',
    numberOfBedrooms: '',
    numberOfDays: '',
    achievement: '',
    competition: '',
    notClause: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePaymentChange = (index, field, value) => {
    const newPayments = [...formData.paymentSchedule]
    newPayments[index][field] = value
    setFormData(prev => ({ ...prev, paymentSchedule: newPayments }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await generateContract(formData)
      setSuccess('Contract generated successfully!')
    } catch (err) {
      setError(err.message || 'Failed to generate contract')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <div className="container">
        <header>
          <h1>Basketball Contract Generator</h1>
          <p>Fill in the contract details based on template</p>
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
                <label>Address of the Leagues *</label>
                <input
                  type="text"
                  name="playerAddress"
                  value={formData.playerAddress}
                  onChange={handleInputChange}
                  required
                  placeholder="Address of the leagues"
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
              <div className="form-group full-width">
                <label>Additional Season Clause</label>
                <input
                  type="text"
                  name="additionalSeasonClause"
                  value={formData.additionalSeasonClause}
                  onChange={handleInputChange}
                  placeholder="e.g., 'and will restart at the beginning of season 2026/27'"
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
              <div className="form-group">
                <label>Total Salary Amount *</label>
                <input
                  type="text"
                  name="totalSalary"
                  value={formData.totalSalary}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., 100,000.00"
                />
              </div>
            </div>
          </section>

          <section className="form-section">
            <h2>Payment Schedule (Up to 10 installments)</h2>
            {formData.paymentSchedule.map((payment, index) => (
              <div key={index} className="payment-item">
                <h3>Payment {index + 1}</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Date</label>
                    <input
                      type="text"
                      value={payment.date}
                      onChange={(e) => handlePaymentChange(index, 'date', e.target.value)}
                      placeholder="e.g., September 30, 2025"
                    />
                  </div>
                  <div className="form-group">
                    <label>Amount</label>
                    <input
                      type="text"
                      value={payment.amount}
                      onChange={(e) => handlePaymentChange(index, 'amount', e.target.value)}
                      placeholder="e.g., 10,000.00"
                    />
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
                <label>Agent Number</label>
                <input
                  type="text"
                  name="agentNumber"
                  value={formData.agentNumber}
                  onChange={handleInputChange}
                  placeholder="Number of the agent"
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
            <h2>Signee Information</h2>
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
                <label>Achievement</label>
                <input
                  type="text"
                  name="achievement"
                  value={formData.achievement}
                  onChange={handleInputChange}
                  placeholder="Achievement clause"
                />
              </div>
              <div className="form-group full-width">
                <label>Competition</label>
                <input
                  type="text"
                  name="competition"
                  value={formData.competition}
                  onChange={handleInputChange}
                  placeholder="Competition clause"
                />
              </div>
              <div className="form-group full-width">
                <label>NOT Clause</label>
                <input
                  type="text"
                  name="notClause"
                  value={formData.notClause}
                  onChange={handleInputChange}
                  placeholder="NOT clause"
                />
              </div>
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
