import PizZip from 'pizzip'
import Docxtemplater from 'docxtemplater'
import { readFileSync, writeFileSync } from 'fs'

const formData = {
  clubName: 'Test Club',
  playerName: 'Test Player',
  countryName: 'Türkiye',
  currency: '$',
  seasons: [
    {
      seasonName: '2025/26',
      totalSalary: '$117,000 (seven hundred seventeen thousand U.S. dollars)',
      numberOfPayments: 10,
      payments: [
        { date: 'after medical check', amount: '$ 5,000 (five thousand U.S. dollars)' },
        { date: 'on October 1st 2025', amount: '$ 8,000 (eight thousand U.S. dollars)' },
        { date: 'on November 1st 2025', amount: '$ 13,000 (thirteen thousand U.S. dollars)' },
        { date: 'on December 1st 2025', amount: '$ 13,000 (thirteen thousand U.S. dollars)' },
        { date: 'on January 1st 2026', amount: '$ 13,000 (thirteen thousand U.S. dollars)' },
        { date: 'on February 1st 2026', amount: '$ 13,000 (thirteen thousand U.S. dollars)' },
        { date: 'on March 1st 2026', amount: '$ 13,000 (thirteen thousand U.S. dollars)' },
        { date: 'on April 1st 2026', amount: '$ 13,000 (thirteen thousand U.S. dollars)' },
        { date: 'on May 1st 2026', amount: '$ 13,000 (thirteen thousand U.S. dollars)' },
        { date: 'on June 1st 2026', amount: '$ 13,000 (thirteen thousand U.S. dollars)' }
      ]
    },
    {
      seasonName: '2026/27',
      totalSalary: '$117,000 (seven hundred seventeen thousand U.S. dollars)',
      numberOfPayments: 4,
      payments: [
        { date: 'on May 1st 2026', amount: '12' },
        { date: 'on June 1st 2026', amount: '12' },
        { date: 'on April 1st 2026', amount: '13' },
        { date: 'on March 1st 2026', amount: '41' }
      ]
    }
  ]
}

console.log('Number of seasons:', formData.seasons.length)
console.log('Second season:', formData.seasons[1])

const content = readFileSync('public/template.docx', 'binary')
const zip = new PizZip(content)
const doc = new Docxtemplater(zip, {
  paragraphLoop: true,
  linebreaks: true,
})

let documentXML = zip.files['word/document.xml'].asText()

console.log('\nChecking for placeholder...')
const hasPlaceholder = documentXML.includes('[ADDITIONAL SEASON]')
console.log('Has [ADDITIONAL SEASON]:', hasPlaceholder)

if (formData.seasons.length > 1) {
  const secondSeason = formData.seasons[1]
  console.log('\nGenerating XML for second season...')

  let additionalSeasonXML = `<w:p w:rsidR="00000000" w14:paraId="00000000"><w:pPr><w:jc w:val="both"/></w:pPr><w:r><w:t xml:space="preserve">${secondSeason.seasonName} Season: ${secondSeason.totalSalary} ${formData.currency} net of any ${formData.countryName} taxes</w:t></w:r></w:p>`

  additionalSeasonXML += `<w:p w:rsidR="00000000" w14:paraId="00000000"><w:pPr><w:jc w:val="both"/></w:pPr><w:r><w:t xml:space="preserve">${secondSeason.seasonName} season schedule of payments:</w:t></w:r></w:p>`

  secondSeason.payments.forEach((payment) => {
    additionalSeasonXML += `<w:p w:rsidR="00000000" w14:paraId="00000000"><w:pPr><w:tabs><w:tab w:val="left" w:leader="none" w:pos="720"/><w:tab w:val="left" w:leader="none" w:pos="1440"/></w:tabs><w:jc w:val="both"/></w:pPr><w:r><w:rPr><w:rtl w:val="0"/></w:rPr><w:tab/><w:t xml:space="preserve">${payment.date}: ${payment.amount} net of any ${formData.countryName} taxes</w:t></w:r></w:p>`
  })

  console.log('Generated XML length:', additionalSeasonXML.length)
  console.log('First 200 chars:', additionalSeasonXML.substring(0, 200))

  const beforeReplace = documentXML.length
  documentXML = documentXML.replace(/\[ADDITIONAL SEASON\]/g, additionalSeasonXML)
  const afterReplace = documentXML.length

  console.log('\nDocument XML length before:', beforeReplace)
  console.log('Document XML length after:', afterReplace)
  console.log('Length increased by:', afterReplace - beforeReplace)
  console.log('Still has placeholder?:', documentXML.includes('[ADDITIONAL SEASON]'))

  // Save modified XML to check
  writeFileSync('/tmp/modified_document.xml', documentXML)
  console.log('\nSaved modified XML to /tmp/modified_document.xml')
}
