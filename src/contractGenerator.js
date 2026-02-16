import Docxtemplater from 'docxtemplater'
import PizZip from 'pizzip'
import { saveAs } from 'file-saver'

export const generateContract = async (formData) => {
  const response = await fetch('/src/assets/Team_Contract_2025_26_AI_(1)_(1).docx')
  const arrayBuffer = await response.arrayBuffer()

  const zip = new PizZip(arrayBuffer)
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  })

  doc.setData({
    player_name: formData.player_name,
    player_passport: formData.player_passport,
    player_birth_date: formData.player_birth_date,
    player_birth_place: formData.player_birth_place,
    player_address: formData.player_address,
    player_tax_number: formData.player_tax_number,
    jersey_number: formData.jersey_number,
    contract_date: formData.contract_date,
    contract_start_date: formData.contract_start_date,
    contract_end_date: formData.contract_end_date,
    total_salary: parseFloat(formData.total_salary).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    payment_schedule: formData.payment_schedule.map(p => ({
      installment_number: p.installment_number,
      amount: parseFloat(p.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      due_date: p.due_date
    })),
    has_team_buyout: formData.team_buyout && formData.team_buyout.amount,
    team_buyout_amount: formData.team_buyout?.amount ? parseFloat(formData.team_buyout.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '',
    team_buyout_deadline: formData.team_buyout?.deadline || '',
    has_player_buyout: formData.player_buyout && formData.player_buyout.amount,
    player_buyout_amount: formData.player_buyout?.amount ? parseFloat(formData.player_buyout.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '',
    player_buyout_deadline: formData.player_buyout?.deadline || '',
  })

  doc.render()

  const blob = doc.getZip().generate({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  })

  saveAs(blob, `contract_${formData.player_name.replace(/\s+/g, '_')}.docx`)
}
