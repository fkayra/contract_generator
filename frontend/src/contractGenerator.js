import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, Table, TableCell, TableRow, WidthType, BorderStyle } from 'docx'
import { saveAs } from 'file-saver'

export const generateContract = async (formData) => {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: 'BASKETBALL PLAYER CONTRACT',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: 'CONTRACT DETAILS',
                bold: true,
                size: 28,
              }),
            ],
            spacing: { before: 400, after: 200 },
          }),

          new Paragraph({
            children: [
              new TextRun({ text: 'Contract Date: ', bold: true }),
              new TextRun({ text: formData.contract_date }),
            ],
            spacing: { after: 100 },
          }),

          new Paragraph({
            children: [
              new TextRun({ text: 'Contract Period: ', bold: true }),
              new TextRun({ text: `${formData.contract_start_date} to ${formData.contract_end_date}` }),
            ],
            spacing: { after: 200 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: 'PLAYER INFORMATION',
                bold: true,
                size: 28,
              }),
            ],
            spacing: { before: 400, after: 200 },
          }),

          createInfoParagraph('Full Name', formData.player_name),
          createInfoParagraph('Passport Number', formData.player_passport),
          createInfoParagraph('Date of Birth', formData.player_birth_date),
          createInfoParagraph('Place of Birth', formData.player_birth_place),
          createInfoParagraph('Address', formData.player_address),
          createInfoParagraph('Tax Number', formData.player_tax_number),
          createInfoParagraph('Jersey Number', formData.jersey_number),

          new Paragraph({
            children: [
              new TextRun({
                text: 'FINANCIAL TERMS',
                bold: true,
                size: 28,
              }),
            ],
            spacing: { before: 400, after: 200 },
          }),

          new Paragraph({
            children: [
              new TextRun({ text: 'Total Salary: ', bold: true }),
              new TextRun({ text: `€${parseFloat(formData.total_salary).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` }),
            ],
            spacing: { after: 200 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: 'PAYMENT SCHEDULE',
                bold: true,
                size: 24,
              }),
            ],
            spacing: { before: 200, after: 200 },
          }),

          createPaymentTable(formData.payment_schedule),

          ...(formData.team_buyout ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: 'TEAM BUYOUT CLAUSE',
                  bold: true,
                  size: 28,
                }),
              ],
              spacing: { before: 400, after: 200 },
            }),
            createInfoParagraph('Buyout Amount', `€${parseFloat(formData.team_buyout.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`),
            createInfoParagraph('Deadline', formData.team_buyout.deadline),
          ] : []),

          ...(formData.player_buyout ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: 'PLAYER BUYOUT CLAUSE',
                  bold: true,
                  size: 28,
                }),
              ],
              spacing: { before: 400, after: 200 },
            }),
            createInfoParagraph('Buyout Amount', `€${parseFloat(formData.player_buyout.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`),
            createInfoParagraph('Deadline', formData.player_buyout.deadline),
          ] : []),

          new Paragraph({
            children: [
              new TextRun({
                text: 'SIGNATURES',
                bold: true,
                size: 28,
              }),
            ],
            spacing: { before: 600, after: 400 },
          }),

          new Paragraph({
            text: '_'.repeat(50),
            spacing: { before: 600, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Player Signature', bold: true }),
            ],
            spacing: { after: 400 },
          }),

          new Paragraph({
            text: '_'.repeat(50),
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Club Representative Signature', bold: true }),
            ],
          }),
        ],
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, `contract_${formData.player_name.replace(/\s+/g, '_')}.docx`)
}

function createInfoParagraph(label, value) {
  return new Paragraph({
    children: [
      new TextRun({ text: `${label}: `, bold: true }),
      new TextRun({ text: value }),
    ],
    spacing: { after: 100 },
  })
}

function createPaymentTable(payments) {
  const rows = [
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ text: 'Installment #', bold: true })],
          width: { size: 30, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [new Paragraph({ text: 'Amount (€)', bold: true })],
          width: { size: 35, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [new Paragraph({ text: 'Due Date', bold: true })],
          width: { size: 35, type: WidthType.PERCENTAGE },
        }),
      ],
    }),
    ...payments.map(
      (payment) =>
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: payment.installment_number.toString() })],
            }),
            new TableCell({
              children: [
                new Paragraph({
                  text: `€${parseFloat(payment.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                }),
              ],
            }),
            new TableCell({
              children: [new Paragraph({ text: payment.due_date })],
            }),
          ],
        })
    ),
  ]

  return new Table({
    rows,
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1 },
      bottom: { style: BorderStyle.SINGLE, size: 1 },
      left: { style: BorderStyle.SINGLE, size: 1 },
      right: { style: BorderStyle.SINGLE, size: 1 },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
      insideVertical: { style: BorderStyle.SINGLE, size: 1 },
    },
  })
}
