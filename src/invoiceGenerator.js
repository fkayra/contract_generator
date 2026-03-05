import { saveAs } from 'file-saver'

export const generateInvoice = (invoice, index) => {
  const renderBankAccountDetails = (bankAccount) => {
    if (bankAccount.beneficiaryName) {
      return `
        <p><strong>Beneficiary Name:</strong> ${bankAccount.beneficiaryName}</p>
        <p><strong>Beneficiary Address:</strong> ${bankAccount.beneficiaryAddress}</p>
        <p><strong>IBAN:</strong> ${bankAccount.iban}</p>
        <p><strong>SWIFT CODE:</strong> ${bankAccount.swiftCode}</p>
        <p><strong>Name of Bank:</strong> ${bankAccount.bankName}</p>
        <p><strong>Bank Address:</strong> ${bankAccount.bankAddress}</p>
      `
    } else {
      return `
        <p><strong>Account Owner:</strong> ${bankAccount.accountOwner}</p>
        <p><strong>Account Number:</strong> ${bankAccount.accountNumber}</p>
        <p><strong>Currency:</strong> ${bankAccount.currency}</p>
        <p><strong>International Bank Account Number (IBAN):</strong> ${bankAccount.iban}</p>
        <p><strong>Bank Identification Code (BIC Swift):</strong> ${bankAccount.bic}</p>
        <p><strong>Bank:</strong> ${bankAccount.bank}</p>
      `
    }
  }

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 40px;
      font-size: 11pt;
    }
    .header {
      text-align: left;
      margin-bottom: 30px;
    }
    .company-info {
      margin-bottom: 20px;
    }
    .date {
      text-align: right;
      margin-bottom: 20px;
    }
    .client-info {
      margin-bottom: 30px;
      border: 1px solid #000;
      padding: 15px;
    }
    .invoice-title {
      font-size: 14pt;
      font-weight: bold;
      margin: 20px 0;
    }
    .invoice-details {
      margin: 20px 0;
      border: 1px solid #000;
      padding: 15px;
    }
    .payment-info {
      margin-top: 30px;
      border: 1px solid #000;
      padding: 15px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    td {
      padding: 8px;
      border: 1px solid #000;
    }
    .total-row {
      font-weight: bold;
      font-size: 12pt;
    }
    p {
      margin: 5px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-info">
      <strong>${invoice.company.name}</strong><br>
      ${invoice.company.address.replace(/\n/g, '<br>')}<br>
      ${invoice.company.fax || ''}<br>
      ${invoice.company.taxId || invoice.company.vatNumber}
    </div>
  </div>

  <div class="date">
    <strong>${invoice.date}</strong>
  </div>

  <div class="client-info">
    <p><strong>Name:</strong> ${invoice.clubName}</p>
    <p><strong>Address:</strong> ${invoice.clubAddress}</p>
    <p><strong>Country:</strong> ${invoice.teamCountry}</p>
    ${invoice.taxInfo ? `<p><strong>Tax Info:</strong> ${invoice.taxInfo}</p>` : ''}
  </div>

  <div class="invoice-title">
    Invoice #${String(index + 1).padStart(3, '0')}
  </div>

  <table>
    <tr>
      <td width="70%"><strong>PROJECT DESCRIPTION</strong></td>
      <td width="30%" style="text-align: right;"><strong>${invoice.currency.toUpperCase()}</strong></td>
    </tr>
    <tr>
      <td>Professional services for basketball agency</td>
      <td style="text-align: right;">${invoice.currencySymbol} ${invoice.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
    </tr>
    ${invoice.includeVAT === 'yes' ? `
    <tr>
      <td>VAT (19%)</td>
      <td style="text-align: right;">${invoice.currencySymbol} ${invoice.vatAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
    </tr>
    ` : `
    <tr>
      <td>VAT (0%)</td>
      <td style="text-align: right;"></td>
    </tr>
    `}
    <tr class="total-row">
      <td>Total: ${invoice.amountInWords} ${invoice.currency}</td>
      <td style="text-align: right;">${invoice.currencySymbol} ${invoice.finalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
    </tr>
  </table>

  <div class="payment-info">
    <p><strong>Payment: Through Bank Transfer to the following Account</strong></p>
    <p><strong>${invoice.bankAccount.title}</strong></p>
    ${renderBankAccountDetails(invoice.bankAccount)}
  </div>

</body>
</html>
  `

  // Create blob with HTML content in Word format
  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/msword'
  })

  // Generate filename with date
  const filename = `Invoice_${invoice.company.name.replace(/ /g, '_')}_${invoice.date.replace(/\//g, '-')}_${index + 1}.doc`

  // Save file
  saveAs(blob, filename)
}

export const generateAllInvoices = (invoices) => {
  invoices.forEach((invoice, index) => {
    setTimeout(() => {
      generateInvoice(invoice, index)
    }, index * 500) // Delay each download by 500ms to avoid browser blocking
  })
}
