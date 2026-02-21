import PizZip from 'pizzip'
import { saveAs } from 'file-saver'

export const generateContract = async (formData) => {
  const response = await fetch('/template.docx')
  const arrayBuffer = await response.arrayBuffer()

  const zip = new PizZip(arrayBuffer)

  let content = zip.file('word/document.xml').asText()

  content = content.replace(/\[CONTRACT DATE\]/g, formData.contractDate || '')
  content = content.replace(/\[NAME OF THE CLUB\]/g, formData.clubName || '')
  content = content.replace(/\[ADDRESS OF THE CLUB \]/g, (formData.clubAddress || '') + ' ')
  content = content.replace(/\[NAME OF THE LEAGUES\]/g, formData.leaguesName || '')
  content = content.replace(/\[NAME OF THE PLAYER\]/g, formData.playerName || '')
  content = content.replace(/\[ADDRESS OF THE LEAGUES\]/g, formData.playerAddress || '')
  content = content.replace(/\[NUMBER OF SEASON\]/g, formData.numberOfSeasons || '')
  content = content.replace(/\[AND THE ADDITIONAL SEASON\]/g, formData.additionalSeason || '')
  content = content.replace(/\[SEASON\]/g, formData.season || '2025/26')
  content = content.replace(/\[SEASON 1\]/g, formData.season1 || '2025/26')
  content = content.replace(/\{SEASON_1\}/g, formData.season1 || '2025/26')
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
  content = content.replace(/\[NUMBER OF THE AGENT\]/g, formData.agentName || '')
  content = content.replace(/\[AND NAME OF THE OTHER AGENT\]/g, formData.otherAgentName || '')
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

  // Handle multi-season clause
  const isMultiSeason = formData.numberOfSeasons === '2'
  const multiSeasonClause = isMultiSeason
    ? `(and will restart at the beginning of season ${formData.season2 || '2026/27'} to cease again 24 hours after the last official game of the Club for season ${formData.season2 || '2026/27'})`
    : ''

  const multiSeasonClauseFull = isMultiSeason
    ? ` ${multiSeasonClause} in which moment the Player will be a free agent and his letter of clearance will be issued if needed by the Club immediately upon request without any compensation payable to the Club`
    : ''

  content = content.replace(/\[MULTI SEASON CLAUSE\]/g, multiSeasonClause)
  content = content.replace(/\{MULTI_SEASON_CLAUSE\}/g, multiSeasonClause)
  content = content.replace(/\{MULTI_SEASON_CLAUSE_FULL\}/g, multiSeasonClauseFull)

  if (formData.paymentSchedule && formData.paymentSchedule.length > 0) {
    const getOrdinalSuffix = (num) => {
      if (num === 1) return 'ST'
      if (num === 2) return 'ND'
      if (num === 3) return 'RD'
      return 'TH'
    }

    const replacePattern = (text, pattern, replacement) => {
      const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const parts = escapedPattern.split(/\s+/)
      const flexiblePattern = parts.join('(?:<[^>]*>|\\s)*')
      const regex = new RegExp(flexiblePattern, 'g')
      return text.replace(regex, replacement)
    }

    formData.paymentSchedule.forEach((payment, index) => {
      const installmentNum = index + 1
      const suffix = getOrdinalSuffix(installmentNum)

      if (installmentNum === 1) {
        const datePattern1 = `[DATE OF ${installmentNum}${suffix} SALARY]`
        content = replacePattern(content, datePattern1, payment.date || '')
      } else {
        const datePattern2 = `DATE OF ${installmentNum}${suffix} SALARY`
        content = replacePattern(content, datePattern2, payment.date || '')
      }

      content = replacePattern(content, '[AMOUNT OF THAT MONTH]', payment.amount || '')
    })
  }

  zip.file('word/document.xml', content)

  const blob = zip.generate({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  })

  saveAs(blob, `contract_${formData.playerName?.replace(/\s+/g, '_') || 'player'}.docx`)
}
