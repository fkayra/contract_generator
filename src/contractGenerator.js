import PizZip from 'pizzip'
import { saveAs } from 'file-saver'

export const generateContract = async (formData) => {
  const response = await fetch('/src/assets/Team_Contract_2025_26_AI_(1)_(1).docx')
  const arrayBuffer = await response.arrayBuffer()

  const zip = new PizZip(arrayBuffer)

  let content = zip.file('word/document.xml').asText()

  content = content.replace(/\[CONTRACT DATE\]/g, formData.contractDate || '')
  content = content.replace(/\[NAME OF THE CLUB\]/g, formData.clubName || '')
  content = content.replace(/\[ADDRESS OF THE CLUB \]/g, formData.clubAddress || '')
  content = content.replace(/\[NAME OF THE LEAGUES\]/g, formData.leaguesName || '')
  content = content.replace(/\[NAME OF THE PLAYER\]/g, formData.playerName || '')
  content = content.replace(/\[ADDRESS OF THE LEAGUES\]/g, formData.playerAddress || '')
  content = content.replace(/\[NUMBER OF SEASON\]/g, formData.numberOfSeasons || '')
  content = content.replace(/\[AND THE ADDITIONAL SEASON\]/g, formData.additionalSeason || '')
  content = content.replace(/\[SEASON\]/g, formData.season || '2025/26')
  content = content.replace(/\[SEASON 1\]/g, formData.season1 || '2025/26')
  content = content.replace(/\[SEASON 2\]/g, formData.season2 || '2026/27')
  content = content.replace(/\[COUNNAME OF THE COUNTRY\]/g, formData.countryName || '')
  content = content.replace(/\[COUNNAME\]/g, formData.countryName || '')
  content = content.replace(/\[COUNTRY OF THE PLAYER\]/g, formData.playerCountry || '')
  content = content.replace(/\[COUNTRY OF THE TEAM\]/g, formData.teamCountry || '')
  content = content.replace(/\[CURRENCY\]/g, formData.currency || '€')
  content = content.replace(/\[TOTAL AMOUNT OF CONTRACY\]/g, formData.totalSalary || '')
  content = content.replace(/\[TEAM BUY OUT AMOUNT\]/g, formData.teamBuyoutAmount || '')
  content = content.replace(/\[PLAYER BUY OUT AMOUNT\]/g, formData.playerBuyoutAmount || '')
  content = content.replace(/\[DATE OF THE BUY OUT\]/g, formData.buyoutDate || '')
  content = content.replace(/\[NAME OF THE AGENT\]/g, formData.agentName || '')
  content = content.replace(/\[AND NAME OF THE OTHER AGENT\]/g, formData.otherAgentName || '')
  content = content.replace(/\[NUMBER OF THE AGENT\]/g, formData.agentNumber || '')
  content = content.replace(/\[EMAIL ADDRESS\]/g, formData.emailAddress || '')
  content = content.replace(/\[FIBA LICENCE NUMBER\]/g, formData.fibaLicence || '')
  content = content.replace(/\[TITLE OF SIGNEE\]/g, formData.signeeTitle || '')
  content = content.replace(/\[NAME\]/g, formData.signeeName || '')
  content = content.replace(/\[CLASS OF THE TICKET\]/g, formData.ticketClass || '')
  content = content.replace(/\[NUMBER OF TICKET\]/g, formData.numberOfTickets || '')
  content = content.replace(/\[NUMBER OF BEDROOM\]/g, formData.numberOfBedrooms || '')
  content = content.replace(/\[NUMBER OF DAYS\]/g, formData.numberOfDays || '')
  content = content.replace(/\[ACHIEVEMENT\]/g, formData.achievement || '')
  content = content.replace(/\[COMPETITION\]/g, formData.competition || '')
  content = content.replace(/\[NOT\]/g, formData.notClause || '')
  content = content.replace(/\[ADDITIONAL SEASON\]/g, formData.additionalSeasonClause || '')

  if (formData.paymentSchedule && formData.paymentSchedule.length > 0) {
    formData.paymentSchedule.forEach((payment, index) => {
      const installmentNum = index + 1
      content = content.replace(new RegExp(`\\[DATE OF ${installmentNum}`, 'g'), payment.date || '')
      content = content.replace(new RegExp(`DATE OF ${installmentNum}`, 'g'), payment.date || '')
      content = content.replace(/\[AMOUNT OF THAT MONTH\]/, payment.amount || '')
    })
  }

  zip.file('word/document.xml', content)

  const blob = zip.generate({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  })

  saveAs(blob, `contract_${formData.playerName?.replace(/\s+/g, '_') || 'player'}.docx`)
}
