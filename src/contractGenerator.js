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
  // [COMPETITION] will be replaced later with bonus XML
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

  if (formData.bonuses && formData.bonuses.length > 0) {
    let bonusXML = ''

    formData.bonuses.forEach((bonus, index) => {
      if (bonus.competitionName && bonus.achievements.some(a => a.description || a.amount)) {
        // Competition name paragraph (bold)
        bonusXML += `<w:p w:rsidR="00000000" w:rsidDel="00000000" w:rsidP="00000000" w:rsidRDefault="00000000" w:rsidRPr="00000000" w14:paraId="00000000"><w:pPr><w:pStyle w:val="Normal"/><w:tabs><w:tab w:val="left" w:leader="none" w:pos="567"/><w:tab w:val="left" w:leader="none" w:pos="1134"/><w:tab w:val="left" w:leader="none" w:pos="1701"/><w:tab w:val="left" w:leader="none" w:pos="2268"/><w:tab w:val="left" w:leader="none" w:pos="2835"/><w:tab w:val="left" w:leader="none" w:pos="3402"/><w:tab w:val="left" w:leader="none" w:pos="3969"/><w:tab w:val="left" w:leader="none" w:pos="4536"/><w:tab w:val="left" w:leader="none" w:pos="5103"/><w:tab w:val="left" w:leader="none" w:pos="5670"/><w:tab w:val="left" w:leader="none" w:pos="6237"/><w:tab w:val="left" w:leader="none" w:pos="6804"/><w:tab w:val="left" w:leader="none" w:pos="7371"/><w:tab w:val="left" w:leader="none" w:pos="7938"/><w:tab w:val="left" w:leader="none" w:pos="8505"/><w:tab w:val="left" w:leader="none" w:pos="9072"/><w:tab w:val="left" w:leader="none" w:pos="9639"/></w:tabs><w:ind w:firstLine="567"/><w:jc w:val="both"/><w:rPr><w:rtl w:val="0"/></w:rPr></w:pPr><w:r w:rsidDel="00000000" w:rsidR="00000000" w:rsidRPr="00000000"><w:rPr><w:b w:val="1"/><w:bCs w:val="1"/><w:rtl w:val="0"/></w:rPr><w:t xml:space="preserve">${bonus.competitionName}</w:t></w:r></w:p>`

        // Achievement paragraphs with bullets
        bonus.achievements.forEach(achievement => {
          if (achievement.description && achievement.amount) {
            bonusXML += `<w:p w:rsidR="00000000" w:rsidDel="00000000" w:rsidP="00000000" w:rsidRDefault="00000000" w:rsidRPr="00000000" w14:paraId="00000000"><w:pPr><w:pStyle w:val="Normal"/><w:tabs><w:tab w:val="left" w:leader="none" w:pos="567"/><w:tab w:val="left" w:leader="none" w:pos="1134"/><w:tab w:val="left" w:leader="none" w:pos="1701"/><w:tab w:val="left" w:leader="none" w:pos="2268"/><w:tab w:val="left" w:leader="none" w:pos="2835"/><w:tab w:val="left" w:leader="none" w:pos="3402"/><w:tab w:val="left" w:leader="none" w:pos="3969"/><w:tab w:val="left" w:leader="none" w:pos="4536"/><w:tab w:val="left" w:leader="none" w:pos="5103"/><w:tab w:val="left" w:leader="none" w:pos="5670"/><w:tab w:val="left" w:leader="none" w:pos="6237"/><w:tab w:val="left" w:leader="none" w:pos="6804"/><w:tab w:val="left" w:leader="none" w:pos="7371"/><w:tab w:val="left" w:leader="none" w:pos="7938"/><w:tab w:val="left" w:leader="none" w:pos="8505"/><w:tab w:val="left" w:leader="none" w:pos="9072"/><w:tab w:val="left" w:leader="none" w:pos="9639"/></w:tabs><w:ind w:left="1134"/><w:jc w:val="both"/><w:rPr><w:rtl w:val="0"/></w:rPr></w:pPr><w:r w:rsidDel="00000000" w:rsidR="00000000" w:rsidRPr="00000000"><w:rPr><w:rtl w:val="0"/></w:rPr><w:t xml:space="preserve">• ${achievement.description}: ${achievement.amount}</w:t></w:r></w:p>`
          }
        })

        // Empty line between competitions (except after last one)
        if (index < formData.bonuses.length - 1) {
          bonusXML += `<w:p w:rsidR="00000000" w:rsidDel="00000000" w:rsidP="00000000" w:rsidRDefault="00000000" w:rsidRPr="00000000" w14:paraId="00000000"><w:pPr><w:pStyle w:val="Normal"/></w:pPr></w:p>`
        }
      }
    })

    // Replace [COMPETITION] placeholder with generated XML
    // Match the entire paragraph containing [COMPETITION], including any formatting tags
    const competitionRegex = /<w:p\s+[^>]*>[\s\S]*?\[COMPETITION\][\s\S]*?<\/w:p>/g
    content = content.replace(competitionRegex, bonusXML)
  }

  if (formData.paymentSchedule && formData.paymentSchedule.length > 0) {
    const getOrdinalSuffix = (num) => {
      if (num === 1) return 'ST'
      if (num === 2) return 'ND'
      if (num === 3) return 'RD'
      return 'TH'
    }

    const createFlexibleRegex = (pattern) => {
      const parts = pattern.split('').map(char => {
        if (char === '[' || char === ']' || char === '(' || char === ')') {
          return '\\' + char
        }
        return char
      })

      const flexible = parts.join('(?:<[^>]*>)*')
      return new RegExp(flexible, 'g')
    }

    formData.paymentSchedule.forEach((payment, index) => {
      const installmentNum = index + 1
      const suffix = getOrdinalSuffix(installmentNum)

      if (installmentNum === 1) {
        const pattern = `[DATE OF ${installmentNum}${suffix} SALARY]`
        const regex = createFlexibleRegex(pattern)
        content = content.replace(regex, payment.date || '')
      } else {
        const pattern = `DATE OF ${installmentNum}${suffix} SALARY`
        const regex = createFlexibleRegex(pattern)
        content = content.replace(regex, payment.date || '')
      }

      const amountRegex = createFlexibleRegex('[AMOUNT OF THAT MONTH]')
      content = content.replace(amountRegex, payment.amount || '')
    })
  }

  zip.file('word/document.xml', content)

  const blob = zip.generate({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  })

  saveAs(blob, `contract_${formData.playerName?.replace(/\s+/g, '_') || 'player'}.docx`)
}
