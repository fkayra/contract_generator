import { saveAs } from 'file-saver'
import html2pdf from 'html2pdf.js'

export const generateInvoice = async (invoice, index, downloadFormat = 'doc') => {
  console.log('Generating invoice:', { invoice, index, downloadFormat })

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

  const formatNumber = (num) => {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 3,
      useGrouping: true
    }).replace(/,/g, '.')
  }

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      size: A4;
      margin: 0;
    }
    body {
      font-family: Arial, sans-serif;
      margin: 20px 30px;
      font-size: 9pt;
      line-height: 1.1;
    }
    .header {
      text-align: center;
      margin-bottom: 10px;
    }
    .company-info {
      font-weight: bold;
      line-height: 1.1;
      font-size: 9pt;
    }
    .date {
      text-align: right;
      margin-bottom: 8px;
      font-size: 9pt;
    }
    .client-info-table {
      width: 60%;
      border-collapse: collapse;
      margin-bottom: 10px;
    }
    .client-info-table td {
      border: 1px solid #000;
      padding: 2px 5px;
      vertical-align: top;
      font-size: 9pt;
      line-height: 1.1;
    }
    .client-info-table td:first-child {
      width: 70px;
      font-weight: bold;
      white-space: nowrap;
    }
    .client-info-table td:last-child {
      word-wrap: break-word;
      word-break: normal;
    }
    .invoice-title {
      font-size: 11pt;
      font-weight: bold;
      margin: 8px 0;
      text-align: center;
    }
    .invoice-table {
      width: 85%;
      border-collapse: collapse;
      margin: 10px 0;
    }
    .invoice-table td {
      border: 1px solid #000;
      padding: 2px 5px;
      font-size: 9pt;
      line-height: 1.1;
    }
    .invoice-table .header-row td {
      font-weight: bold;
      text-align: center;
    }
    .invoice-table .amount-col {
      width: 100px;
      text-align: right;
    }
    .invoice-table .total-row {
      font-weight: bold;
    }
    .payment-info {
      margin-top: 10px;
      line-height: 1.1;
      font-size: 8pt;
    }
    .payment-info p {
      margin: 0.5px 0;
    }
    .spacing {
      margin: 15px 0;
    }
    hr {
      border: none;
      border-top: 2px solid #000;
      margin: 10px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-info">
      ${invoice.company.name}<br>
      ${invoice.company.address.replace(/\n/g, '<br>')}<br>
      ${invoice.company.fax ? `${invoice.company.fax}<br>` : ''}
      ${invoice.company.taxId || invoice.company.vatNumber}<br>
      ${invoice.company.name}
    </div>
  </div>

  <hr>

  <div class="date">${invoice.date}</div>

  <table class="client-info-table">
    <tr>
      <td>Name</td>
      <td>${invoice.clubName}</td>
    </tr>
    <tr>
      <td>Address</td>
      <td>${invoice.clubAddress}</td>
    </tr>
    <tr>
      <td>Country</td>
      <td>${invoice.teamCountry}</td>
    </tr>
    <tr>
      <td>VAT<br>Number</td>
      <td>${invoice.taxInfo || ''}</td>
    </tr>
  </table>

  <div class="invoice-title">
    Invoice ${String(index + 1).padStart(3, '0')}
  </div>

  <table class="invoice-table">
    <tr class="header-row">
      <td><strong>PROJECT DESCRIPTION</strong></td>
      <td class="amount-col"><strong>${invoice.currency.toUpperCase()}</strong></td>
    </tr>
    <tr>
      <td>Agency fee ${invoice.playerName || ''}</td>
      <td class="amount-col">${formatNumber(invoice.amount)}</td>
    </tr>
    <tr>
      <td>VAT (${invoice.includeVAT === 'yes' ? '19' : '0'}%)</td>
      <td class="amount-col">${invoice.includeVAT === 'yes' ? formatNumber(invoice.vatAmount) : ''}</td>
    </tr>
    <tr class="total-row">
      <td><strong>Total: ${invoice.amountInWords}</strong></td>
      <td class="amount-col"><strong>${invoice.currencySymbol}${formatNumber(invoice.finalAmount)}</strong></td>
    </tr>
  </table>

  <div class="spacing"></div>
  <div class="spacing"></div>
  <div class="spacing"></div>

  <div class="payment-info">
    <p><strong>Payment : Through Bank Transfer to the following Account</strong></p>
    <p><strong>${invoice.bankAccount.title}</strong></p>
    ${renderBankAccountDetails(invoice.bankAccount)}
  </div>

</body>
</html>
  `

  const baseFilename = `Invoice_${invoice.company.name.replace(/ /g, '_')}_${invoice.date.replace(/\//g, '-')}_${index + 1}`

  console.log('HTML content length:', htmlContent.length)
  console.log('First 500 chars of HTML:', htmlContent.substring(0, 500))

  if (downloadFormat === 'pdf') {
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = htmlContent
    document.body.appendChild(tempDiv)

    const opt = {
      margin: [10, 10, 10, 10],
      filename: `${baseFilename}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        logging: false,
        useCORS: true
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }

    try {
      console.log('Starting PDF generation...')
      await html2pdf().set(opt).from(tempDiv).save()
      console.log('PDF generation completed')
    } catch (error) {
      console.error('PDF generation error:', error)
      alert('PDF generation failed: ' + error.message)
    } finally {
      if (document.body.contains(tempDiv)) {
        document.body.removeChild(tempDiv)
      }
    }
  } else {
    const blob = new Blob(['\ufeff', htmlContent], {
      type: 'application/msword'
    })

    saveAs(blob, `${baseFilename}.doc`)
  }
}

export const generateAllInvoices = async (invoices, downloadFormat = 'doc') => {
  for (let index = 0; index < invoices.length; index++) {
    await generateInvoice(invoices[index], index, downloadFormat)
    if (index < invoices.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }
}
