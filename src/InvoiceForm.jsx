import { useState, useEffect } from 'react'
import './App.css'
import { generateAllInvoices } from './invoiceGenerator'
import { supabase } from './supabaseClient'

function InvoiceForm({ formData, onBack, onNavigate, editingInvoice }) {
  const [step, setStep] = useState(editingInvoice ? 6 : 1)
  const [downloadFormat, setDownloadFormat] = useState('doc')
  const [invoiceData, setInvoiceData] = useState(editingInvoice ? editingInvoice.invoice_data.invoiceSettings : {
    company: '',
    bank: '',
    currency: '',
    includeVAT: 'no',
    invoiceNumber: ''
  })

  const [invoices, setInvoices] = useState(editingInvoice ? editingInvoice.invoice_data.invoices : [])

  useEffect(() => {
    if (editingInvoice) {
      setStep(6);
      setInvoiceData(editingInvoice.invoice_data.invoiceSettings);
      setInvoices(editingInvoice.invoice_data.invoices);
    }
  }, [editingInvoice])

  const companyInfo = {
    'Nsi Management Ltd': {
      name: 'Nsi Management Ltd',
      address: '10 Vasilissis Freiderikis, 1st Floor, 1066 Nicosia, Cyprus',
      fax: 'Fax No. 00357 22679474',
      taxId: 'TAX ID#: CY 10369596O'
    },
    'SBM INTL LTD': {
      name: 'SBM INTL LTD',
      address: 'NIKIS AVENUE AND KASTOROS 1\n1ST FLOOR\nNICOSIA 1087\nCYPRUS',
      vatNumber: 'VAT NUMBER: 60199341G'
    }
  }

  const bankAccounts = {
    'Nsi Management Ltd_OPTIMA BANK - GREECE_EURO': {
      title: 'Payments in EURO',
      beneficiaryName: 'Nsi Management Ltd',
      beneficiaryAddress: '10 V Freiderikis, Nicosia 1066, Cyprus',
      iban: 'GR4903400250025023192027197',
      swiftCode: 'IBOGGRAA',
      bankName: 'OPTIMA BANK',
      bankAddress: '32 Aigialeias St, Marousi 15125, Greece'
    },
    'Nsi Management Ltd_OPTIMA BANK - GREECE_USD': {
      title: 'Payments in USD',
      beneficiaryName: 'Nsi Management Ltd',
      beneficiaryAddress: '10 V Freiderikis, Nicosia 1066, Cyprus',
      iban: 'GR2203400250025023192027101',
      swiftCode: 'IBOGGRAA',
      bankName: 'OPTIMA BANK',
      bankAddress: '32 Aigialeias St, Marousi 15125, Greece'
    },
    'Nsi Management Ltd_ECOMMBX BANK - CYPRUS_EURO': {
      title: 'PAYMENT IN EURO',
      accountOwner: 'NSI MANAGEMENT LTD',
      accountNumber: '0000001000003157-0',
      currency: 'EURO',
      iban: 'CY10905000010000001000003157',
      bic: 'ECBXCY2N',
      bank: 'Ecommbx Bank'
    },
    'Nsi Management Ltd_ECOMMBX BANK - CYPRUS_USD': {
      title: 'Payment in USD',
      accountOwner: 'NSI MANAGEMENT LTD',
      accountNumber: '0000001000003158-0',
      currency: 'USD',
      iban: 'CY80905000010000001000003158',
      bic: 'ECBXCY2N',
      bank: 'Ecommbx Bank'
    },
    'SBM INTL LTD_ECOMMBX BANK - CYPRUS_EURO': {
      title: 'Payment in EURO',
      accountOwner: 'SBM INTL LTD',
      accountNumber: '0000001000004884-0',
      currency: 'EURO',
      iban: 'CY38905000010000001000004884',
      bic: 'ECBXCY2N',
      bank: 'Ecommbx Bank'
    }
  }

  const handleCompanySelect = (company) => {
    setInvoiceData({ ...invoiceData, company, bank: '', currency: '' })
    setStep(2)
  }

  const handleBankSelect = (bank) => {
    setInvoiceData({ ...invoiceData, bank })
    setStep(3)
  }

  const handleCurrencySelect = (currency) => {
    setInvoiceData({ ...invoiceData, currency })
    if (editingInvoice && invoices.length > 0) {
      setStep(6)
    } else {
      setStep(4)
    }
  }

  const handleVATChange = (value) => {
    setInvoiceData({ ...invoiceData, includeVAT: value })
  }

  const numberToWords = (num) => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']

    if (num === 0) return 'Zero'

    const convertHundreds = (n) => {
      if (n === 0) return ''
      if (n < 10) return ones[n]
      if (n < 20) return teens[n - 10]
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 > 0 ? ' ' + ones[n % 10] : '')
      return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 > 0 ? ' ' + convertHundreds(n % 100) : '')
    }

    if (num < 1000) return convertHundreds(num)
    if (num < 1000000) {
      const thousands = Math.floor(num / 1000)
      const remainder = num % 1000
      return convertHundreds(thousands) + ' Thousand' + (remainder > 0 ? ' ' + convertHundreds(remainder) : '')
    }

    const millions = Math.floor(num / 1000000)
    const remainder = num % 1000000
    let result = convertHundreds(millions) + ' Million'

    if (remainder >= 1000) {
      const thousands = Math.floor(remainder / 1000)
      const rest = remainder % 1000
      result += ' ' + convertHundreds(thousands) + ' Thousand'
      if (rest > 0) result += ' ' + convertHundreds(rest)
    } else if (remainder > 0) {
      result += ' ' + convertHundreds(remainder)
    }

    return result.trim()
  }

  const getBankOptions = () => {
    if (invoiceData.company === 'Nsi Management Ltd') {
      return ['OPTIMA BANK - GREECE', 'ECOMMBX BANK - CYPRUS']
    }
    return []
  }

  const getCurrencyOptions = () => {
    if (invoiceData.company === 'SBM INTL LTD') {
      return ['EURO']
    }
    return ['EURO', 'USD']
  }

  const getBankAccountInfo = () => {
    const key = `${invoiceData.company}_${invoiceData.bank}_${invoiceData.currency}`
    return bankAccounts[key]
  }

  const generateInvoiceNumber = (baseNumber, index) => {
    if (!baseNumber) return String(index + 1).padStart(3, '0')

    const numMatch = baseNumber.match(/\d+/)
    if (numMatch) {
      const baseNum = parseInt(numMatch[0])
      const prefix = baseNumber.substring(0, numMatch.index)
      const suffix = baseNumber.substring(numMatch.index + numMatch[0].length)
      const newNum = (baseNum + index).toString().padStart(numMatch[0].length, '0')
      return prefix + newNum + suffix
    }
    return baseNumber
  }

  const generateInvoiceData = (navigateToStep6 = true) => {
    const generatedInvoices = []
    let invoiceCounter = 0

    formData.seasons.forEach((season) => {
      season.agencyFee.payments.forEach((payment) => {
        if (payment.date && payment.amount) {
          let numStr = payment.amount.toString().trim()
          numStr = numStr.replace(/[€$\s]/g, '')

          const decimalMatch = numStr.match(/[.,](\d{1,2})$/)
          if (decimalMatch) {
            const decimalPart = decimalMatch[1]
            numStr = numStr.substring(0, numStr.length - decimalMatch[0].length)
            numStr = numStr.replace(/[.,]/g, '') + '.' + decimalPart
          } else {
            numStr = numStr.replace(/[.,]/g, '')
          }
          const amount = parseFloat(numStr) || 0
          let baseAmount = amount
          let vatAmount = 0
          let totalAmount = amount

          if (invoiceData.includeVAT === 'yes') {
            vatAmount = amount * 0.19
            totalAmount = amount + vatAmount
          }

          const existingInvoice = invoices[invoiceCounter]
          const generatedNumber = generateInvoiceNumber(invoiceData.invoiceNumber, invoiceCounter)

          const invoice = {
            date: payment.date,
            amount: baseAmount,
            vatAmount: vatAmount,
            finalAmount: totalAmount,
            amountInWords: numberToWords(Math.round(totalAmount)),
            company: companyInfo[invoiceData.company],
            bankAccount: getBankAccountInfo(),
            clubName: formData.clubName,
            clubAddress: formData.clubAddress,
            teamCountry: formData.teamCountry,
            taxInfo: formData.taxInfo,
            playerName: season.playerName || '',
            currency: invoiceData.currency === 'EURO' ? 'Euro' : 'USD',
            currencySymbol: invoiceData.currency === 'EURO' ? '€' : '$',
            includeVAT: invoiceData.includeVAT,
            invoiceNumber: existingInvoice?.invoiceNumber || generatedNumber
          }

          generatedInvoices.push(invoice)
          invoiceCounter++
        }
      })
    })

    setInvoices(generatedInvoices)
    if (navigateToStep6) {
      setStep(6)
    }
  }

  const saveToDatabase = async () => {
    try {
      const invoiceId = editingInvoice?.id;
      const firstInvoice = invoices[0];

      const invoiceNumbers = invoices.map(inv => inv.invoiceNumber).filter(Boolean).join(', ') || `INV-${Date.now()}`

      const dataToSave = {
        client_name: firstInvoice.clubName,
        invoice_number: invoiceNumbers,
        invoice_data: {
          invoiceSettings: invoiceData,
          invoices: invoices,
          formData: formData
        }
      };

      if (invoiceId) {
        const { error } = await supabase
          .from('invoices')
          .update({
            ...dataToSave,
            updated_at: new Date().toISOString()
          })
          .eq('id', invoiceId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('invoices')
          .insert(dataToSave);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error saving to database:', error);
    }
  };

  const downloadInvoices = async () => {
    await saveToDatabase();
    await generateAllInvoices(invoices, downloadFormat);
  }

  const renderBankAccountDetails = (bankAccount) => {
    if (bankAccount.beneficiaryName) {
      return (
        <div>
          <p><strong>Beneficiary Name:</strong> {bankAccount.beneficiaryName}</p>
          <p><strong>Beneficiary Address:</strong> {bankAccount.beneficiaryAddress}</p>
          <p><strong>IBAN:</strong> {bankAccount.iban}</p>
          <p><strong>SWIFT CODE:</strong> {bankAccount.swiftCode}</p>
          <p><strong>Name of Bank:</strong> {bankAccount.bankName}</p>
          <p><strong>Bank Address:</strong> {bankAccount.bankAddress}</p>
        </div>
      )
    } else {
      return (
        <div>
          <p><strong>Account Owner:</strong> {bankAccount.accountOwner}</p>
          <p><strong>Account Number:</strong> {bankAccount.accountNumber}</p>
          <p><strong>Currency:</strong> {bankAccount.currency}</p>
          <p><strong>International Bank Account Number (IBAN):</strong> {bankAccount.iban}</p>
          <p><strong>Bank Identification Code (BIC Swift):</strong> {bankAccount.bic}</p>
          <p><strong>Bank:</strong> {bankAccount.bank}</p>
        </div>
      )
    }
  }

  return (
    <div className="container">
      {step === 1 && (
        <div>
          <h1>Select Company</h1>
          <div style={{ marginTop: '20px' }}>
            <button
              onClick={() => handleCompanySelect('Nsi Management Ltd')}
              style={{ marginRight: '10px', padding: '15px 30px', fontSize: '16px' }}
            >
              Nsi Management Ltd
            </button>
            <button
              onClick={() => handleCompanySelect('SBM INTL LTD')}
              style={{ padding: '15px 30px', fontSize: '16px' }}
            >
              SBM INTL LTD
            </button>
          </div>
          <button onClick={onBack} style={{ marginTop: '20px' }}>
            {editingInvoice ? 'Back to Invoice List' : 'Back to Contract'}
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h1>Select Bank</h1>
          <div style={{ marginTop: '20px' }}>
            {getBankOptions().map((bank) => (
              <button
                key={bank}
                onClick={() => handleBankSelect(bank)}
                style={{ marginRight: '10px', padding: '15px 30px', fontSize: '16px', marginBottom: '10px' }}
              >
                {bank}
              </button>
            ))}
          </div>
          <button onClick={() => setStep(1)} style={{ marginTop: '20px' }}>Back</button>
        </div>
      )}

      {step === 3 && (
        <div>
          <h1>Select Currency</h1>
          <div style={{ marginTop: '20px' }}>
            {getCurrencyOptions().map((currency) => (
              <button
                key={currency}
                onClick={() => handleCurrencySelect(currency)}
                style={{ marginRight: '10px', padding: '15px 30px', fontSize: '16px' }}
              >
                {currency}
              </button>
            ))}
          </div>
          <button onClick={() => setStep(invoiceData.company === 'SBM INTL LTD' ? 1 : 2)} style={{ marginTop: '20px' }}>Back</button>
        </div>
      )}

      {step === 4 && (
        <div>
          <h1>Invoice Preview</h1>

          <section className="form-section">
            <h2>Company Information</h2>
            <div style={{ whiteSpace: 'pre-line' }}>
              {companyInfo[invoiceData.company].address}
              <br />
              {companyInfo[invoiceData.company].fax}
              <br />
              {companyInfo[invoiceData.company].taxId || companyInfo[invoiceData.company].vatNumber}
            </div>
          </section>

          <section className="form-section">
            <h2>Club Information</h2>
            <p><strong>Name:</strong> {formData.clubName}</p>
            <p><strong>Address:</strong> {formData.clubAddress}</p>
            <p><strong>Country:</strong> {formData.teamCountry}</p>
            <p><strong>Tax Info:</strong> {formData.taxInfo}</p>
          </section>

          <section className="form-section">
            <h2>Payment Information</h2>
            <h3>{getBankAccountInfo()?.title}</h3>
            {renderBankAccountDetails(getBankAccountInfo())}
          </section>

          <section className="form-section">
            <h2>Invoice Settings</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Starting Invoice Number (will auto-increment for multiple invoices)</label>
                <input
                  type="text"
                  value={invoiceData.invoiceNumber}
                  onChange={(e) => setInvoiceData({ ...invoiceData, invoiceNumber: e.target.value })}
                  placeholder="e.g., 001, INV-001"
                />
                <small style={{ fontSize: '12px', color: '#666', display: 'block', marginTop: '5px' }}>
                  For multiple invoices, system will generate: {invoiceData.invoiceNumber || '001'}, {invoiceData.invoiceNumber ? (parseInt(invoiceData.invoiceNumber) + 1).toString().padStart(3, '0') : '002'}, etc.
                </small>
              </div>
              <div className="form-group">
                <label>Include VAT (19%)</label>
                <select
                  value={invoiceData.includeVAT}
                  onChange={(e) => handleVATChange(e.target.value)}
                >
                  <option value="no">No - VAT (0%)</option>
                  <option value="yes">Yes - VAT (19%)</option>
                </select>
              </div>
            </div>
          </section>

          <div style={{ marginTop: '20px' }}>
            <button onClick={generateInvoiceData} style={{ marginRight: '10px', padding: '15px 30px', fontSize: '16px' }}>
              Preview Invoices
            </button>
            <button onClick={() => setStep(3)}>Back</button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div>
          <h1>Review and Edit Invoice Data</h1>

          <section className="form-section">
            <h2>Contract Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Club Name</label>
                <input
                  type="text"
                  value={formData.clubName}
                  onChange={(e) => formData.clubName = e.target.value}
                  readOnly
                  style={{ backgroundColor: '#f5f5f5' }}
                />
              </div>
              <div className="form-group">
                <label>Club Address</label>
                <input
                  type="text"
                  value={formData.clubAddress}
                  readOnly
                  style={{ backgroundColor: '#f5f5f5' }}
                />
              </div>
              <div className="form-group">
                <label>Team Country</label>
                <input
                  type="text"
                  value={formData.teamCountry}
                  readOnly
                  style={{ backgroundColor: '#f5f5f5' }}
                />
              </div>
              <div className="form-group">
                <label>Tax Info</label>
                <input
                  type="text"
                  value={formData.taxInfo}
                  readOnly
                  style={{ backgroundColor: '#f5f5f5' }}
                />
              </div>
            </div>
          </section>

          <section className="form-section">
            <h2>Invoice Settings</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Company</label>
                <p style={{ padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>{invoiceData.company}</p>
              </div>
              <div className="form-group">
                <label>Bank</label>
                <p style={{ padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>{invoiceData.bank}</p>
              </div>
              <div className="form-group">
                <label>Currency</label>
                <p style={{ padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>{invoiceData.currency}</p>
              </div>
              <div className="form-group">
                <label>VAT</label>
                <p style={{ padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>{invoiceData.includeVAT === 'yes' ? 'Yes (19%)' : 'No (0%)'}</p>
              </div>
              <div className="form-group">
                <label>Invoice Number</label>
                <p style={{ padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>{invoiceData.invoiceNumber}</p>
              </div>
            </div>
          </section>

          <section className="form-section">
            <h2>Payment Schedule</h2>
            {formData.seasons.map((season, seasonIndex) => (
              <div key={seasonIndex} style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                <h3>Season: {season.seasonName}</h3>
                <div style={{ marginTop: '10px' }}>
                  <h4>Agency Fee Payments</h4>
                  {season.agencyFee.payments.map((payment, paymentIndex) => (
                    payment.date && payment.amount && (
                      <div key={paymentIndex} style={{ padding: '10px', marginBottom: '10px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '4px' }}>
                        <p><strong>Payment {paymentIndex + 1}</strong></p>
                        <p>Date: {payment.date}</p>
                        <p>Amount: {payment.amount}</p>
                      </div>
                    )
                  ))}
                </div>
              </div>
            ))}
          </section>

          <div style={{ marginTop: '20px' }}>
            <button onClick={generateInvoiceData} style={{ marginRight: '10px', padding: '15px 30px', fontSize: '16px' }}>
              Generate Invoices
            </button>
            <button onClick={() => setStep(4)} style={{ padding: '15px 30px', fontSize: '16px' }}>
              Back
            </button>
          </div>
        </div>
      )}

      {step === 6 && (
        <div>
          <h1>Invoice Preview ({invoices.length})</h1>

          <section className="form-section" style={{ marginBottom: '20px' }}>
            <h2>General Settings</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Company</label>
                <p style={{ padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px', margin: 0 }}>{invoiceData.company}</p>
              </div>
              <div className="form-group">
                <label>Bank</label>
                <p style={{ padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px', margin: 0 }}>{invoiceData.bank}</p>
              </div>
              <div className="form-group">
                <label>Currency</label>
                <p style={{ padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px', margin: 0 }}>{invoiceData.currency}</p>
              </div>
              <div className="form-group">
                <label>VAT</label>
                <p style={{ padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px', margin: 0 }}>{invoiceData.includeVAT === 'yes' ? 'Yes (19%)' : 'No (0%)'}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button
                onClick={() => setStep(1)}
                style={{ padding: '10px 20px', fontSize: '14px' }}
              >
                Change All Settings
              </button>
              <button
                onClick={() => generateInvoiceData(false)}
                style={{ padding: '10px 20px', fontSize: '14px', backgroundColor: '#4CAF50', color: 'white' }}
              >
                Apply Changes & Regenerate
              </button>
            </div>
          </section>

          {invoices.map((invoice, index) => (
            <div key={index} style={{ border: '2px solid #333', padding: '20px', marginBottom: '20px', backgroundColor: '#f9f9f9' }}>
              <h2>Invoice {index + 1}</h2>

              <div className="form-group" style={{ marginTop: '15px', marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Invoice Number</label>
                <input
                  type="text"
                  value={invoice.invoiceNumber}
                  onChange={(e) => {
                    const updatedInvoices = [...invoices]
                    updatedInvoices[index].invoiceNumber = e.target.value
                    setInvoices(updatedInvoices)
                  }}
                  placeholder="e.g., 001, 002, INV-001"
                  style={{ width: '200px', padding: '8px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <h3>{invoice.company.name}</h3>
                <div style={{ whiteSpace: 'pre-line', fontSize: '14px' }}>
                  {invoice.company.address}
                </div>
                {invoice.company.fax && <p>{invoice.company.fax}</p>}
                <p>{invoice.company.taxId || invoice.company.vatNumber}</p>
              </div>

              <p><strong>Date:</strong> {invoice.date}</p>

              <div style={{ marginBottom: '15px' }}>
                <p><strong>Name:</strong> {invoice.clubName}</p>
                <p><strong>Address:</strong> {invoice.clubAddress}</p>
                <p><strong>Country:</strong> {invoice.teamCountry}</p>
                <p><strong>Tax Info:</strong> {invoice.taxInfo}</p>
              </div>

              <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff', border: '1px solid #ddd' }}>
                <h3>Invoice Details</h3>
                <p><strong>Amount:</strong> {invoice.currencySymbol} {invoice.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                {invoice.includeVAT === 'yes' && (
                  <>
                    <p><strong>VAT (19%):</strong> {invoice.currencySymbol} {invoice.vatAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                    <p><strong>Amount after VAT:</strong> {invoice.currencySymbol} {invoice.finalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                  </>
                )}
                {invoice.includeVAT === 'no' && <p><strong>VAT (0%):</strong></p>}
                <p><strong>Total:</strong> {invoice.amountInWords} {invoice.currency}</p>
                <p style={{ fontSize: '18px', fontWeight: 'bold' }}>{invoice.currencySymbol} {invoice.finalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
              </div>

              <div style={{ marginTop: '20px' }}>
                <h3>Payment: Through Bank Transfer to the following Account</h3>
                <h4>{invoice.bankAccount.title}</h4>
                {renderBankAccountDetails(invoice.bankAccount)}
              </div>
            </div>
          ))}

          <section className="form-section">
            <h2>Download Options</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Download As</label>
                <select
                  value={downloadFormat}
                  onChange={(e) => setDownloadFormat(e.target.value)}
                >
                  <option value="doc">DOC</option>
                  <option value="pdf">PDF</option>
                </select>
              </div>
            </div>
          </section>

          <div style={{ marginTop: '20px' }}>
            <button onClick={downloadInvoices} style={{ marginRight: '10px', padding: '15px 30px', fontSize: '16px' }}>
              Generate Invoices
            </button>
            <button onClick={() => setStep(5)} style={{ marginRight: '10px', padding: '15px 30px', fontSize: '16px' }}>
              Back to Review
            </button>
            <button onClick={() => onNavigate('home')} style={{ padding: '15px 30px', fontSize: '16px' }}>
              Back to Home
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default InvoiceForm
