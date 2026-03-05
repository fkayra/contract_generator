import PizZip from 'pizzip'
import { saveAs } from 'file-saver'

export const generateContract = async (formData) => {
  console.log('=== FORM DATA RECEIVED ===')
  console.log(JSON.stringify(formData, null, 2))

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
  content = content.replace(/\[TOTAL AMOUNT OF CONTRACY\]/g, formData.seasons[0]?.totalSalary || '')
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
  content = content.replace(/\[NOT\]/g, formData.includeNotClause ? formData.notClause || '' : '')
  // [ADDITIONAL_SEASON] will be replaced later with second season XML

  // Handle multi-season clause
  const isMultiSeason = formData.numberOfSeasons === '2'
  const multiSeasonClause = isMultiSeason
    ? `And will restart at the beginning of season ${formData.season2 || '2026/27'} to cease again 24 hours after the last official game of the Club for season ${formData.season2 || '2026/27'}`
    : ''

  const multiSeasonClauseFull = isMultiSeason
    ? ` ${multiSeasonClause} in which moment the Player will be a free agent and his letter of clearance will be issued if needed by the Club immediately upon request without any compensation payable to the Club`
    : ''

  content = content.replace(/\[MULTI SEASON CLAUSE\]/g, multiSeasonClause)
  content = content.replace(/\{MULTI_SEASON_CLAUSE\}/g, multiSeasonClause)
  content = content.replace(/\{MULTI_SEASON_CLAUSE_FULL\}/g, multiSeasonClauseFull)

  // Process salary/payment information BEFORE bonuses to avoid placeholder conflicts
  if (formData.seasons && formData.seasons.length > 0) {
    const getOrdinalSuffix = (num) => {
      if (num === 1) return 'ST'
      if (num === 2) return 'ND'
      if (num === 3) return 'RD'
      return 'TH'
    }

    const firstSeason = formData.seasons[0]
    if (firstSeason) {
      console.log('First Season Data:', firstSeason)
      console.log('Total Salary from firstSeason:', firstSeason.totalSalary)
      console.log('Type of totalSalary:', typeof firstSeason.totalSalary)

      // Replace season header (paraId 0000001A): "[SEASON] Season: [TOTAL AMOUNT OF CONTRACY] [CURRENCY]..."
      const seasonHeaderRegex = /<w:p[^>]*w14:paraId="0000001A"[^>]*>.*?<\/w:p>/s
      const seasonHeaderMatch = content.match(seasonHeaderRegex)
      if (seasonHeaderMatch) {
        let header = seasonHeaderMatch[0]
        console.log('Original header:', header.substring(0, 200))
        header = header.replace(/\[SEASON\]/g, firstSeason.seasonName || formData.season || '2025/26')
        header = header.replace(/\[TOTAL AMOUNT OF CONTRACY\]/g, firstSeason.totalSalary || '')
        header = header.replace(/\[CURRENCY\]/g, formData.currency || '$')
        header = header.replace(/\[COUNNAME OF THE COUNTRY\]/g, formData.countryName || '')
        console.log('After replacements, header substring:', header.substring(0, 300))
        content = content.replace(seasonHeaderRegex, header)
      } else {
        console.log('ERROR: Season header paragraph not found!')
      }

      // Replace payment schedule header (paraId 0000001C): "[SEASON] season schedule of payments:"
      const scheduleHeaderRegex = /<w:p[^>]*w14:paraId="0000001C"[^>]*>.*?<\/w:p>/s
      const scheduleHeaderMatch = content.match(scheduleHeaderRegex)
      if (scheduleHeaderMatch) {
        let scheduleHeader = scheduleHeaderMatch[0]
        scheduleHeader = scheduleHeader.replace(/\[SEASON\]/g, firstSeason.seasonName || formData.season || '2025/26')
        content = content.replace(scheduleHeaderRegex, scheduleHeader)
      }

      const paymentParaIds = [
        '0000001E', '00000020', '00000022', '00000024', '00000026',
        '00000028', '0000002A', '0000002C', '0000002E', '00000030'
      ]

      const emptyParaIds = [
        '0000001F', '00000021', '00000023', '00000025', '00000027',
        '00000029', '0000002B', '0000002D', '0000002F'
      ]

      // Only process the number of payments specified
      const numPayments = parseInt(firstSeason.numberOfPayments) || firstSeason.payments.length
      console.log('Number of payments to process:', numPayments)

      for (let i = 0; i < numPayments && i < firstSeason.payments.length; i++) {
        const payment = firstSeason.payments[i]
        const installmentNum = i + 1
        const suffix = getOrdinalSuffix(installmentNum)
        const paraId = paymentParaIds[i]

        console.log(`Processing payment ${installmentNum}:`, payment)

        const paraRegex = new RegExp(`<w:p[^>]*w14:paraId="${paraId}"[^>]*>.*?</w:p>`, 's')
        const paraMatch = content.match(paraRegex)

        if (paraMatch) {
          let para = paraMatch[0]

          // Date pattern is split across multiple <w:t> tags due to superscript formatting
          // Pattern: [DATE OF 1</w:t>...<w:t>ST</w:t>...<w:t> SALARY]
          // We need to replace the entire pattern including XML tags

          if (installmentNum === 1) {
            // First payment has brackets: [DATE OF 1ST SALARY]
            // We need to replace just the text content while preserving XML structure
            para = para.replace(/\[DATE OF 1<\/w:t>/, `${payment.date || ''}</w:t>`)
            para = para.replace(/<w:t xml:space="preserve">ST<\/w:t>/, '<w:t></w:t>')
            para = para.replace(/<w:t xml:space="preserve"> SALARY\]/, '<w:t xml:space="preserve">')
          } else {
            // Other payments don't have brackets: DATE OF 2ND SALARY
            para = para.replace(new RegExp(`DATE OF ${installmentNum}<\\/w:t>`), `${payment.date || ''}</w:t>`)
            para = para.replace(new RegExp(`<w:t xml:space="preserve">${suffix}<\\/w:t>`), '<w:t></w:t>')
            para = para.replace(/<w:t xml:space="preserve"> SALARY/, '<w:t xml:space="preserve">')
          }

          para = para.replace(/\[AMOUNT OF THAT MONTH\]/g, payment.amount || '')
          para = para.replace(/\[COUNNAME OF THE COUNTRY\]/g, formData.countryName || '')

          content = content.replace(paraRegex, para)
        }
      }

      // Remove unused payment paragraphs and their preceding empty paragraphs
      for (let i = numPayments; i < 10; i++) {
        const paraId = paymentParaIds[i]
        const paraRegex = new RegExp(`<w:p[^>]*w14:paraId="${paraId}"[^>]*>.*?</w:p>`, 's')
        content = content.replace(paraRegex, '')

        if (i < emptyParaIds.length) {
          const emptyParaId = emptyParaIds[i]
          const emptyParaRegex = new RegExp(`<w:p[^>]*w14:paraId="${emptyParaId}"[^>]*>.*?</w:p>`, 's')
          content = content.replace(emptyParaRegex, '')
        }
      }
    }

    console.log('=== SEASON CHECK ===')
    console.log('Checking seasons:', formData.seasons)
    console.log('Number of seasons:', formData.seasons?.length)
    console.log('Has [ADDITIONAL_SEASON] placeholder?', content.includes('[ADDITIONAL_SEASON]'))
    console.log('Has [ADDITIONAL SEASON] placeholder?', content.includes('[ADDITIONAL SEASON]'))

    if (formData.seasons.length > 1) {
      const secondSeason = formData.seasons[1]
      console.log('Second season found:', secondSeason)

      let additionalSeasonXML = `<w:p w:rsidR="00000000" w14:paraId="00000000"><w:pPr><w:jc w:val="both"/></w:pPr><w:r><w:t xml:space="preserve">${secondSeason.seasonName} Season: ${secondSeason.totalSalary} ${formData.currency} net of any ${formData.countryName} taxes</w:t></w:r></w:p>`

      additionalSeasonXML += `<w:p w:rsidR="00000000" w14:paraId="00000000"><w:pPr><w:jc w:val="both"/></w:pPr><w:r><w:t xml:space="preserve">${secondSeason.seasonName} season schedule of payments:</w:t></w:r></w:p>`

      secondSeason.payments.forEach((payment, index) => {
        additionalSeasonXML += `<w:p w:rsidR="00000000" w14:paraId="00000000"><w:pPr><w:tabs><w:tab w:val="left" w:leader="none" w:pos="720"/><w:tab w:val="left" w:leader="none" w:pos="1440"/></w:tabs><w:jc w:val="both"/></w:pPr><w:r><w:rPr><w:rtl w:val="0"/></w:rPr><w:tab/><w:t xml:space="preserve">${payment.date}: ${payment.amount} net of any ${formData.countryName} taxes</w:t></w:r></w:p>`
      })

      console.log('Generated additional season XML length:', additionalSeasonXML.length)
      console.log('First 200 chars:', additionalSeasonXML.substring(0, 200))

      const beforeLength = content.length
      // The placeholder is in paragraph with paraId="00000033"
      // Replace this specific paragraph with our new content
      const placeholderRegex = /<w:p[^>]*w14:paraId="00000033"[^>]*>.*?<\/w:p>/s
      const match = content.match(placeholderRegex)
      if (match) {
        console.log('Found placeholder paragraph (paraId=00000033), replacing with season 2 content')
        content = content.replace(placeholderRegex, additionalSeasonXML)
      } else {
        console.log('WARNING: Could not find paragraph with paraId=00000033!')
      }
      // Remove the wrong placeholder (with underscore) if it exists
      content = content.replace('[ADDITIONAL_SEASON]', '')
      const afterLength = content.length

      console.log('Document length before replace:', beforeLength)
      console.log('Document length after replace:', afterLength)
      console.log('Length difference:', afterLength - beforeLength)
      console.log('Still has [ADDITIONAL_SEASON]?', content.includes('[ADDITIONAL_SEASON]'))
      console.log('Still has [ADDITIONAL SEASON]?', content.includes('[ADDITIONAL SEASON]'))
    } else {
      console.log('No second season, removing placeholders')
      // Remove the paragraph with paraId="00000033" that contains [ADDITIONAL SEASON]
      const placeholderRegex = /<w:p[^>]*w14:paraId="00000033"[^>]*>.*?<\/w:p>/s
      content = content.replace(placeholderRegex, '')
      // Remove the wrong placeholder (with underscore) if it exists
      content = content.replace('[ADDITIONAL_SEASON]', '')
    }
  }

  // Agency Fee Section - Process each season's agency fee
  if (formData.seasons && formData.seasons.length > 0) {
    let allParagraphs = []

    // Build agency fee content for all seasons - group season header with its payments
    formData.seasons.forEach((season, seasonIndex) => {
      if (season.agencyFee && season.agencyFee.totalAmount) {
        const countryName = formData.countryName || 'Türkiye'

        // Add season header paragraph (only for seasons after the first)
        if (seasonIndex > 0) {
          const seasonHeaderXML = `<w:p w:rsidR="00000000" w:rsidDel="00000000" w:rsidP="00000000" w:rsidRDefault="00000000" w:rsidRPr="00000000" w14:paraId="0000006${seasonIndex}"><w:pPr><w:tabs><w:tab w:val="left" w:leader="none" w:pos="0"/><w:tab w:val="left" w:leader="none" w:pos="720"/><w:tab w:val="left" w:leader="none" w:pos="1440"/><w:tab w:val="left" w:leader="none" w:pos="2160"/><w:tab w:val="left" w:leader="none" w:pos="2880"/><w:tab w:val="left" w:leader="none" w:pos="3600"/><w:tab w:val="left" w:leader="none" w:pos="4320"/><w:tab w:val="left" w:leader="none" w:pos="5040"/><w:tab w:val="left" w:leader="none" w:pos="5760"/><w:tab w:val="left" w:leader="none" w:pos="6480"/><w:tab w:val="left" w:leader="none" w:pos="7200"/><w:tab w:val="left" w:leader="none" w:pos="7920"/><w:tab w:val="left" w:leader="none" w:pos="8640"/></w:tabs><w:jc w:val="both"/><w:rPr/></w:pPr><w:r w:rsidDel="00000000" w:rsidR="00000000" w:rsidRPr="00000000"><w:rPr><w:rtl w:val="0"/></w:rPr><w:t xml:space="preserve">
            ${season.seasonName} season: ${season.agencyFee.totalAmount} net of any ${countryName} taxes
</w:t></w:r></w:p>`
          allParagraphs.push(seasonHeaderXML)
        }

        // Add individual payment details for this season
        if (season.agencyFee.payments && season.agencyFee.payments.length > 0) {
          season.agencyFee.payments.forEach((payment, paymentIndex) => {
            if (payment.amount && payment.date) {
              const connector = paymentIndex === 0 ? '• ' : '• and '
              const text = `${connector}${formData.currency}${payment.amount} net of ${countryName} taxes no later than ${payment.date} will be directed from the CLUB to the Agent on behalf of the Player`

              allParagraphs.push(`<w:p w:rsidR="00000000" w:rsidDel="00000000" w:rsidP="00000000" w:rsidRDefault="00000000" w:rsidRPr="00000000" w14:paraId="0000007${seasonIndex}${paymentIndex}"><w:pPr><w:tabs><w:tab w:val="left" w:leader="none" w:pos="0"/><w:tab w:val="left" w:leader="none" w:pos="720"/><w:tab w:val="left" w:leader="none" w:pos="1440"/><w:tab w:val="left" w:leader="none" w:pos="2160"/><w:tab w:val="left" w:leader="none" w:pos="2880"/><w:tab w:val="left" w:leader="none" w:pos="3600"/><w:tab w:val="left" w:leader="none" w:pos="4320"/><w:tab w:val="left" w:leader="none" w:pos="5040"/><w:tab w:val="left" w:leader="none" w:pos="5760"/><w:tab w:val="left" w:leader="none" w:pos="6480"/><w:tab w:val="left" w:leader="none" w:pos="7200"/><w:tab w:val="left" w:leader="none" w:pos="7920"/><w:tab w:val="left" w:leader="none" w:pos="8640"/></w:tabs><w:jc w:val="both"/><w:rPr/></w:pPr><w:r w:rsidDel="00000000" w:rsidR="00000000" w:rsidRPr="00000000"><w:rPr><w:rtl w:val="0"/></w:rPr><w:t xml:space="preserve">${text}</w:t></w:r></w:p>`)
            }
          })
        }
      }
    })

    // Replace the placeholder paragraph and add payment detail paragraphs after it
    const agencyFeeRegex = /<w:p[^>]*w14:paraId="0000005F"[^>]*>.*?<\/w:p>/s
    const agencyFeeMatch = content.match(agencyFeeRegex)

    if (agencyFeeMatch) {
      let agencyFeePara = agencyFeeMatch[0]

      // Update the main paragraph with first season info
      if (formData.seasons.length > 0) {
        const firstSeason = formData.seasons[0]
        agencyFeePara = agencyFeePara.replace(/\[SEASON\]/g, firstSeason.seasonName || '2025/26')
        agencyFeePara = agencyFeePara.replace(/\[AMOUNT OF THAT MONTH\]/g, firstSeason.agencyFee?.totalAmount || '')
        agencyFeePara = agencyFeePara.replace(/\[COUNNAME OF THE COUNTRY\]/g, formData.countryName || 'Türkiye')
      }

      // Add all paragraphs (payments for all seasons) after the main paragraph
      const fullReplacement = agencyFeePara + allParagraphs.join('')
      content = content.replace(agencyFeeRegex, fullReplacement)
    }
  }

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
    // Match only the specific paragraph with paraId="0000004D" that contains [COMPETITION]
    const competitionRegex = /<w:p\s+[^>]*w14:paraId="0000004D"[^>]*>[\s\S]*?<\/w:p>/g
    content = content.replace(competitionRegex, bonusXML)
  }

  zip.file('word/document.xml', content)

  const blob = zip.generate({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  })

  saveAs(blob, `contract_${formData.playerName?.replace(/\s+/g, '_') || 'player'}.docx`)
}
