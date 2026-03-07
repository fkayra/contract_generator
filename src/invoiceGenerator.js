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
      margin: 15mm;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: Arial, sans-serif;
      padding: 0;
      font-size: 9pt;
      line-height: 1.2;
    }
    table {
      page-break-inside: avoid;
    }
    tr {
      page-break-inside: avoid;
    }
    div {
      page-break-inside: avoid;
    }
  </style>
</head>
<body>
  <div style="text-align: center; margin-bottom: 10px;">
    <div style="font-weight: bold; line-height: 1.2; font-size: 9pt;">
      ${invoice.company.name}<br>
      ${invoice.company.address.replace(/\n/g, '<br>')}<br>
      ${invoice.company.fax ? `${invoice.company.fax}<br>` : ''}
      ${invoice.company.taxId || invoice.company.vatNumber}<br>
      ${invoice.company.name}
    </div>
  </div>

  <hr style="border: none; border-top: 2px solid #000; margin: 10px 0;">

  <div style="text-align: right; margin-bottom: 10px; font-size: 9pt;">${invoice.date}</div>

  <table style="width: 60%; border-collapse: collapse; margin-bottom: 10px; border: 1px solid #000;">
    <tr>
      <td style="border: 1px solid #000; padding: 3px 5px; font-weight: bold; width: 80px; font-size: 9pt; vertical-align: top;">Name</td>
      <td style="border: 1px solid #000; padding: 3px 5px; font-size: 9pt; vertical-align: top;">${invoice.clubName}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 3px 5px; font-weight: bold; font-size: 9pt; vertical-align: top;">Address</td>
      <td style="border: 1px solid #000; padding: 3px 5px; font-size: 9pt; vertical-align: top;">${invoice.clubAddress}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 3px 5px; font-weight: bold; font-size: 9pt; vertical-align: top;">Country</td>
      <td style="border: 1px solid #000; padding: 3px 5px; font-size: 9pt; vertical-align: top;">${invoice.teamCountry}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 3px 5px; font-weight: bold; font-size: 9pt; vertical-align: top;">VAT<br>Number</td>
      <td style="border: 1px solid #000; padding: 3px 5px; font-size: 9pt; vertical-align: top;">${invoice.taxInfo || ''}</td>
    </tr>
  </table>

  <div style="font-size: 11pt; font-weight: bold; margin: 10px 0; text-align: center;">
    Invoice ${invoice.invoiceNumber || String(index + 1).padStart(3, '0')}
  </div>

  <table style="width: 85%; border-collapse: collapse; margin: 10px 0; border: 1px solid #000;">
    <tr>
      <td style="border: 1px solid #000; padding: 3px 5px; font-weight: bold; text-align: center; font-size: 9pt;">PROJECT DESCRIPTION</td>
      <td style="border: 1px solid #000; padding: 3px 5px; font-weight: bold; text-align: center; width: 100px; font-size: 9pt;">${invoice.currency.toUpperCase()}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 3px 5px; font-size: 9pt;">Agency fee ${invoice.playerName || ''}</td>
      <td style="border: 1px solid #000; padding: 3px 5px; text-align: right; font-size: 9pt;">${formatNumber(invoice.amount)}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 3px 5px; font-size: 9pt;">VAT (${invoice.includeVAT === 'yes' ? '19' : '0'}%)</td>
      <td style="border: 1px solid #000; padding: 3px 5px; text-align: right; font-size: 9pt;">${invoice.includeVAT === 'yes' ? formatNumber(invoice.vatAmount) : ''}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #000; padding: 3px 5px; font-weight: bold; font-size: 9pt;">Total: ${invoice.amountInWords}</td>
      <td style="border: 1px solid #000; padding: 3px 5px; text-align: right; font-weight: bold; font-size: 9pt;">${invoice.currencySymbol}${formatNumber(invoice.finalAmount)}</td>
    </tr>
  </table>

  <div style="margin-top: 30px; line-height: 1.3; font-size: 8pt;">
    <p style="margin: 2px 0;"><strong>Payment : Through Bank Transfer to the following Account</strong></p>
    <p style="margin: 2px 0;"><strong>${invoice.bankAccount.title}</strong></p>
    ${renderBankAccountDetails(invoice.bankAccount).replace(/<p>/g, '<p style="margin: 2px 0;">')}
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
      margin: [15, 15, 15, 15],
      filename: `${baseFilename}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        logging: false,
        useCORS: true,
        letterRendering: true
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
        compress: true
      },
      pagebreak: {
        mode: ['avoid-all', 'css', 'legacy'],
        avoid: ['table', 'tr', 'div']
      }
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
