import { useState, useEffect } from 'react';
import PizZip from 'pizzip';
import './ContractPreview.css';

function ContractPreview({ formData }) {
  const [htmlContent, setHtmlContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAndRenderTemplate = async () => {
      try {
        setLoading(true);

        if (!window.mammoth) {
          console.error('Mammoth library not loaded');
          setHtmlContent('<p style="color: red;">Mammoth library not loaded</p>');
          setLoading(false);
          return;
        }

        const response = await fetch('/template.docx');
        const arrayBuffer = await response.arrayBuffer();

        const zip = new PizZip(arrayBuffer);
        let content = zip.file('word/document.xml').asText();

        content = processXmlContent(content, formData);

        zip.file('word/document.xml', content);
        const modifiedArrayBuffer = zip.generate({ type: 'arraybuffer' });

        const result = await window.mammoth.convertToHtml({ arrayBuffer: modifiedArrayBuffer });
        let html = result.value;

        html = addMarkupToPlaceholders(html);

        setHtmlContent(html);
      } catch (error) {
        console.error('Error loading template:', error);
        setHtmlContent('<p style="color: red;">Error loading template</p>');
      } finally {
        setLoading(false);
      }
    };

    loadAndRenderTemplate();
  }, [formData]);

  const processXmlContent = (content, data) => {
    content = content.replace(/\[CONTRACT DATE\]/g, data.contractDate || '');
    content = content.replace(/\[NAME OF THE CLUB\]/g, data.clubName || '');
    content = content.replace(/\[ADDRESS OF THE CLUB \]/g, (data.clubAddress || '') + ' ');
    content = content.replace(/\[NAME OF THE LEAGUES\]/g, data.leaguesName || '');
    content = content.replace(/\[NAME OF THE PLAYER\]/g, data.playerName || '');
    content = content.replace(/\[ADDRESS OF THE LEAGUES\]/g, data.playerAddress || '');
    content = content.replace(/\[NUMBER OF SEASON\]/g, data.numberOfSeasons || '');
    content = content.replace(/\[AND THE ADDITIONAL SEASON\]/g, data.additionalSeason || '');
    content = content.replace(/\[SEASON\]/g, data.season || '2025/26');
    content = content.replace(/\[SEASON 1\]/g, data.season1 || '2025/26');
    content = content.replace(/\{SEASON_1\}/g, data.season1 || '2025/26');
    content = content.replace(/\[SEASON 2\]/g, data.season2 || '2026/27');
    content = content.replace(/\[COUNNAME OF THE COUNTRY\]/g, data.countryName || '');
    content = content.replace(/\[COUNNAME\]/g, data.countryName || '');
    content = content.replace(/\[COUNTRY OF THE PLAYER\]/g, data.playerCountry || '');
    content = content.replace(/\[COUNTRY OF THE TEAM\]/g, data.teamCountry || '');
    content = content.replace(/\[CURRENCY\]/g, data.currency || '€');
    content = content.replace(/\[TOTAL AMOUNT OF CONTRACY\]/g, data.seasons[0]?.totalSalary || '');
    content = content.replace(/\[TEAM BUY OUT AMOUNT\]/g, data.teamBuyoutAmount || '');
    content = content.replace(/\[PLAYER BUY OUT AMOUNT\]/g, data.playerBuyoutAmount || '');
    content = content.replace(/\[DATE OF THE BUY OUT\]/g, data.buyoutDate || '');
    content = content.replace(/\[NUMBER OF DAYS\]/g, data.numberOfDays || '');
    content = content.replace(/\[NAME OF THE AGENT\]/g, data.agentName || '');
    content = content.replace(/\[NUMBER OF THE AGENT\]/g, data.agentName || '');
    content = content.replace(/\[AND NAME OF THE OTHER AGENT\]/g, data.otherAgentName || '');
    content = content.replace(/\[EMAIL ADDRESS\]/g, data.emailAddress || '');
    content = content.replace(/\[FIBA LICENCE NUMBER\]/g, data.fibaLicence || '');
    content = content.replace(/\[TITLE OF SIGNEE\]/g, data.signeeTitle || '');
    content = content.replace(/\[NAME\]/g, data.signeeName || '');
    content = content.replace(/\[CLASS OF THE TICKET\]/g, data.ticketClass || '');
    content = content.replace(/\[NUMBER OF TICKET\]/g, data.numberOfTickets || '');
    content = content.replace(/\[NUMBER OF BEDROOM\]/g, data.numberOfBedrooms || '');
    content = content.replace(/\[ACHIEVEMENT\]/g, data.achievement || '');
    content = content.replace(/\[NOT\]/g, data.includeNotClause ? 'NOT' : '');

    const isMultiSeason = data.numberOfSeasons === '2';
    const multiSeasonClause = isMultiSeason
      ? `And will restart at the beginning of season ${data.season2 || '2026/27'} to cease again 24 hours after the last official game of the Club for season ${data.season2 || '2026/27'}`
      : '';
    const multiSeasonClauseFull = isMultiSeason
      ? ` ${multiSeasonClause} in which moment the Player will be a free agent and his letter of clearance will be issued if needed by the Club immediately upon request without any compensation payable to the Club`
      : '';

    content = content.replace(/\[MULTI SEASON CLAUSE\]/g, multiSeasonClause);
    content = content.replace(/\{MULTI_SEASON_CLAUSE\}/g, multiSeasonClause);
    content = content.replace(/\{MULTI_SEASON_CLAUSE_FULL\}/g, multiSeasonClauseFull);

    if (data.seasons && data.seasons.length > 0) {
      const getOrdinalSuffix = (num) => {
        if (num === 1) return 'ST';
        if (num === 2) return 'ND';
        if (num === 3) return 'RD';
        return 'TH';
      };

      const firstSeason = data.seasons[0];
      if (firstSeason) {
        const seasonHeaderRegex = /<w:p[^>]*w14:paraId="0000001A"[^>]*>.*?<\/w:p>/s;
        const seasonHeaderMatch = content.match(seasonHeaderRegex);
        if (seasonHeaderMatch) {
          let header = seasonHeaderMatch[0];
          header = header.replace(/\[SEASON\]/g, firstSeason.seasonName || data.season || '2025/26');
          header = header.replace(/\[TOTAL AMOUNT OF CONTRACY\]/g, firstSeason.totalSalary || '');
          header = header.replace(/\[CURRENCY\]/g, data.currency || '€');
          header = header.replace(/\[COUNNAME OF THE COUNTRY\]/g, data.countryName || '');
          content = content.replace(seasonHeaderRegex, header);
        }

        const scheduleHeaderRegex = /<w:p[^>]*w14:paraId="0000001C"[^>]*>.*?<\/w:p>/s;
        const scheduleHeaderMatch = content.match(scheduleHeaderRegex);
        if (scheduleHeaderMatch) {
          let scheduleHeader = scheduleHeaderMatch[0];
          scheduleHeader = scheduleHeader.replace(/\[SEASON\]/g, firstSeason.seasonName || data.season || '2025/26');
          content = content.replace(scheduleHeaderRegex, scheduleHeader);
        }

        const paymentParaIds = [
          '0000001E', '00000020', '00000022', '00000024', '00000026',
          '00000028', '0000002A', '0000002C', '0000002E', '00000030'
        ];

        const emptyParaIds = [
          '0000001F', '00000021', '00000023', '00000025', '00000027',
          '00000029', '0000002B', '0000002D', '0000002F'
        ];

        const numPayments = parseInt(firstSeason.numberOfPayments) || firstSeason.payments.length;

        for (let i = 0; i < numPayments && i < firstSeason.payments.length; i++) {
          const payment = firstSeason.payments[i];
          const installmentNum = i + 1;
          const suffix = getOrdinalSuffix(installmentNum);
          const paraId = paymentParaIds[i];

          const paraRegex = new RegExp(`<w:p[^>]*w14:paraId="${paraId}"[^>]*>.*?</w:p>`, 's');
          const paraMatch = content.match(paraRegex);

          if (paraMatch) {
            let para = paraMatch[0];

            if (installmentNum === 1) {
              para = para.replace(/\[DATE OF 1<\/w:t>/, `${payment.date || ''}</w:t>`);
              para = para.replace(/<w:t xml:space="preserve">ST<\/w:t>/, '<w:t></w:t>');
              para = para.replace(/<w:t xml:space="preserve"> SALARY\]/, '<w:t xml:space="preserve">');
            } else {
              para = para.replace(new RegExp(`DATE OF ${installmentNum}<\\/w:t>`), `${payment.date || ''}</w:t>`);
              para = para.replace(new RegExp(`<w:t xml:space="preserve">${suffix}<\\/w:t>`), '<w:t></w:t>');
              para = para.replace(/<w:t xml:space="preserve"> SALARY/, '<w:t xml:space="preserve">');
            }

            para = para.replace(/\[AMOUNT OF THAT MONTH\]/g, payment.amount || '');
            para = para.replace(/\[COUNNAME OF THE COUNTRY\]/g, data.countryName || '');

            content = content.replace(paraRegex, para);
          }
        }

        for (let i = numPayments; i < 10; i++) {
          const paraId = paymentParaIds[i];
          const paraRegex = new RegExp(`<w:p[^>]*w14:paraId="${paraId}"[^>]*>.*?</w:p>`, 's');
          content = content.replace(paraRegex, '');

          if (i < emptyParaIds.length) {
            const emptyParaId = emptyParaIds[i];
            const emptyParaRegex = new RegExp(`<w:p[^>]*w14:paraId="${emptyParaId}"[^>]*>.*?</w:p>`, 's');
            content = content.replace(emptyParaRegex, '');
          }
        }
      }

      if (data.seasons.length > 1) {
        const secondSeason = data.seasons[1];
        let additionalSeasonXML = `<w:p w:rsidR="00000000" w14:paraId="00000000"><w:pPr><w:jc w:val="both"/></w:pPr><w:r><w:t xml:space="preserve">${secondSeason.seasonName} Season: ${secondSeason.totalSalary} ${data.currency} net of any ${data.countryName} taxes</w:t></w:r></w:p>`;

        additionalSeasonXML += `<w:p w:rsidR="00000000" w14:paraId="00000000"><w:pPr><w:jc w:val="both"/></w:pPr><w:r><w:t xml:space="preserve">${secondSeason.seasonName} season schedule of payments:</w:t></w:r></w:p>`;

        secondSeason.payments.forEach((payment) => {
          additionalSeasonXML += `<w:p w:rsidR="00000000" w14:paraId="00000000"><w:pPr><w:tabs><w:tab w:val="left" w:leader="none" w:pos="720"/><w:tab w:val="left" w:leader="none" w:pos="1440"/></w:tabs><w:jc w:val="both"/></w:pPr><w:r><w:rPr><w:rtl w:val="0"/></w:rPr><w:tab/><w:t xml:space="preserve">${payment.date}: ${payment.amount} net of any ${data.countryName} taxes</w:t></w:r></w:p>`;
        });

        const placeholderRegex = /<w:p[^>]*w14:paraId="00000033"[^>]*>.*?<\/w:p>/s;
        const match = content.match(placeholderRegex);
        if (match) {
          content = content.replace(placeholderRegex, additionalSeasonXML);
        }
        content = content.replace('[ADDITIONAL_SEASON]', '');
      } else {
        const placeholderRegex = /<w:p[^>]*w14:paraId="00000033"[^>]*>.*?<\/w:p>/s;
        content = content.replace(placeholderRegex, '');
        content = content.replace('[ADDITIONAL_SEASON]', '');
      }
    }

    if (data.seasons && data.seasons.length > 0) {
      let allParagraphs = [];

      data.seasons.forEach((season, seasonIndex) => {
        if (season.agencyFee && season.agencyFee.totalAmount) {
          const countryName = data.countryName || 'Türkiye';

          if (seasonIndex > 0) {
            const seasonHeaderXML = `<w:p w:rsidR="00000000" w:rsidDel="00000000" w:rsidP="00000000" w:rsidRDefault="00000000" w:rsidRPr="00000000" w14:paraId="0000006${seasonIndex}"><w:pPr><w:tabs><w:tab w:val="left" w:leader="none" w:pos="0"/><w:tab w:val="left" w:leader="none" w:pos="720"/><w:tab w:val="left" w:leader="none" w:pos="1440"/><w:tab w:val="left" w:leader="none" w:pos="2160"/><w:tab w:val="left" w:leader="none" w:pos="2880"/><w:tab w:val="left" w:leader="none" w:pos="3600"/><w:tab w:val="left" w:leader="none" w:pos="4320"/><w:tab w:val="left" w:leader="none" w:pos="5040"/><w:tab w:val="left" w:leader="none" w:pos="5760"/><w:tab w:val="left" w:leader="none" w:pos="6480"/><w:tab w:val="left" w:leader="none" w:pos="7200"/><w:tab w:val="left" w:leader="none" w:pos="7920"/><w:tab w:val="left" w:leader="none" w:pos="8640"/></w:tabs><w:jc w:val="both"/><w:rPr/></w:pPr><w:r w:rsidDel="00000000" w:rsidR="00000000" w:rsidRPr="00000000"><w:rPr><w:rtl w:val="0"/></w:rPr><w:t xml:space="preserve">
            ${season.seasonName} season: ${season.agencyFee.totalAmount} net of any ${countryName} taxes
</w:t></w:r></w:p>`;
            allParagraphs.push(seasonHeaderXML);
          }

          if (season.agencyFee.payments && season.agencyFee.payments.length > 0) {
            season.agencyFee.payments.forEach((payment, paymentIndex) => {
              if (payment.amount && payment.date) {
                const connector = paymentIndex === 0 ? '• ' : '• and ';
                const text = `${connector}${data.currency}${payment.amount} net of ${countryName} taxes no later than ${payment.date} will be directed from the CLUB to the Agent on behalf of the Player`;

                allParagraphs.push(`<w:p w:rsidR="00000000" w:rsidDel="00000000" w:rsidP="00000000" w:rsidRDefault="00000000" w:rsidRPr="00000000" w14:paraId="0000007${seasonIndex}${paymentIndex}"><w:pPr><w:tabs><w:tab w:val="left" w:leader="none" w:pos="0"/><w:tab w:val="left" w:leader="none" w:pos="720"/><w:tab w:val="left" w:leader="none" w:pos="1440"/><w:tab w:val="left" w:leader="none" w:pos="2160"/><w:tab w:val="left" w:leader="none" w:pos="2880"/><w:tab w:val="left" w:leader="none" w:pos="3600"/><w:tab w:val="left" w:leader="none" w:pos="4320"/><w:tab w:val="left" w:leader="none" w:pos="5040"/><w:tab w:val="left" w:leader="none" w:pos="5760"/><w:tab w:val="left" w:leader="none" w:pos="6480"/><w:tab w:val="left" w:leader="none" w:pos="7200"/><w:tab w:val="left" w:leader="none" w:pos="7920"/><w:tab w:val="left" w:leader="none" w:pos="8640"/></w:tabs><w:jc w:val="both"/><w:rPr/></w:pPr><w:r w:rsidDel="00000000" w:rsidR="00000000" w:rsidRPr="00000000"><w:rPr><w:rtl w:val="0"/></w:rPr><w:t xml:space="preserve">${text}</w:t></w:r></w:p>`);
              }
            });
          }
        }
      });

      const agencyFeeRegex = /<w:p[^>]*w14:paraId="0000005F"[^>]*>.*?<\/w:p>/s;
      const agencyFeeMatch = content.match(agencyFeeRegex);

      if (agencyFeeMatch) {
        let agencyFeePara = agencyFeeMatch[0];

        if (data.seasons.length > 0) {
          const firstSeason = data.seasons[0];
          agencyFeePara = agencyFeePara.replace(/\[SEASON\]/g, firstSeason.seasonName || '2025/26');
          agencyFeePara = agencyFeePara.replace(/\[AMOUNT OF THAT MONTH\]/g, firstSeason.agencyFee?.totalAmount || '');
          agencyFeePara = agencyFeePara.replace(/\[COUNNAME OF THE COUNTRY\]/g, data.countryName || 'Türkiye');
        }

        const fullReplacement = agencyFeePara + allParagraphs.join('');
        content = content.replace(agencyFeeRegex, fullReplacement);
      }
    }

    if (data.bonuses && data.bonuses.length > 0) {
      let bonusXML = '';

      data.bonuses.forEach((bonus, index) => {
        if (bonus.competitionName && bonus.achievements.some(a => a.description || a.amount)) {
          bonusXML += `<w:p w:rsidR="00000000" w:rsidDel="00000000" w:rsidP="00000000" w:rsidRDefault="00000000" w:rsidRPr="00000000" w14:paraId="00000000"><w:pPr><w:pStyle w:val="Normal"/><w:tabs><w:tab w:val="left" w:leader="none" w:pos="567"/><w:tab w:val="left" w:leader="none" w:pos="1134"/><w:tab w:val="left" w:leader="none" w:pos="1701"/><w:tab w:val="left" w:leader="none" w:pos="2268"/><w:tab w:val="left" w:leader="none" w:pos="2835"/><w:tab w:val="left" w:leader="none" w:pos="3402"/><w:tab w:val="left" w:leader="none" w:pos="3969"/><w:tab w:val="left" w:leader="none" w:pos="4536"/><w:tab w:val="left" w:leader="none" w:pos="5103"/><w:tab w:val="left" w:leader="none" w:pos="5670"/><w:tab w:val="left" w:leader="none" w:pos="6237"/><w:tab w:val="left" w:leader="none" w:pos="6804"/><w:tab w:val="left" w:leader="none" w:pos="7371"/><w:tab w:val="left" w:leader="none" w:pos="7938"/><w:tab w:val="left" w:leader="none" w:pos="8505"/><w:tab w:val="left" w:leader="none" w:pos="9072"/><w:tab w:val="left" w:leader="none" w:pos="9639"/></w:tabs><w:ind w:firstLine="567"/><w:jc w:val="both"/><w:rPr><w:rtl w:val="0"/></w:rPr></w:pPr><w:r w:rsidDel="00000000" w:rsidR="00000000" w:rsidRPr="00000000"><w:rPr><w:b w:val="1"/><w:bCs w:val="1"/><w:rtl w:val="0"/></w:rPr><w:t xml:space="preserve">${bonus.competitionName}</w:t></w:r></w:p>`;

          bonus.achievements.forEach(achievement => {
            if (achievement.description && achievement.amount) {
              bonusXML += `<w:p w:rsidR="00000000" w:rsidDel="00000000" w:rsidP="00000000" w:rsidRDefault="00000000" w:rsidRPr="00000000" w14:paraId="00000000"><w:pPr><w:pStyle w:val="Normal"/><w:tabs><w:tab w:val="left" w:leader="none" w:pos="567"/><w:tab w:val="left" w:leader="none" w:pos="1134"/><w:tab w:val="left" w:leader="none" w:pos="1701"/><w:tab w:val="left" w:leader="none" w:pos="2268"/><w:tab w:val="left" w:leader="none" w:pos="2835"/><w:tab w:val="left" w:leader="none" w:pos="3402"/><w:tab w:val="left" w:leader="none" w:pos="3969"/><w:tab w:val="left" w:leader="none" w:pos="4536"/><w:tab w:val="left" w:leader="none" w:pos="5103"/><w:tab w:val="left" w:leader="none" w:pos="5670"/><w:tab w:val="left" w:leader="none" w:pos="6237"/><w:tab w:val="left" w:leader="none" w:pos="6804"/><w:tab w:val="left" w:leader="none" w:pos="7371"/><w:tab w:val="left" w:leader="none" w:pos="7938"/><w:tab w:val="left" w:leader="none" w:pos="8505"/><w:tab w:val="left" w:leader="none" w:pos="9072"/><w:tab w:val="left" w:leader="none" w:pos="9639"/></w:tabs><w:ind w:left="1134"/><w:jc w:val="both"/><w:rPr><w:rtl w:val="0"/></w:rPr></w:pPr><w:r w:rsidDel="00000000" w:rsidR="00000000" w:rsidRPr="00000000"><w:rPr><w:rtl w:val="0"/></w:rPr><w:t xml:space="preserve">• ${achievement.description}: ${achievement.amount}</w:t></w:r></w:p>`;
            }
          });

          if (index < data.bonuses.length - 1) {
            bonusXML += `<w:p w:rsidR="00000000" w:rsidDel="00000000" w:rsidP="00000000" w:rsidRDefault="00000000" w:rsidRPr="00000000" w14:paraId="00000000"><w:pPr><w:pStyle w:val="Normal"/></w:pPr></w:p>`;
          }
        }
      });

      const competitionRegex = /<w:p\s+[^>]*w14:paraId="0000004D"[^>]*>[\s\S]*?<\/w:p>/g;
      content = content.replace(competitionRegex, bonusXML);
    }

    return content;
  };

  const addMarkupToPlaceholders = (html) => {
    let result = html;

    const bracketPlaceholders = /\[[^\]]+\]/g;
    result = result.replace(bracketPlaceholders, (match) => {
      return `<mark class="empty">${match}</mark>`;
    });

    const curlyPlaceholders = /\{[^\}]+\}/g;
    result = result.replace(curlyPlaceholders, (match) => {
      return `<mark class="empty">${match}</mark>`;
    });

    return result;
  };

  return (
    <div className="contract-preview">
      <div className="preview-header">
        <h3>Live Document Preview</h3>
        <div className="preview-legend">
          <span className="legend-item">
            <span className="legend-dot filled"></span> Filled
          </span>
          <span className="legend-item">
            <span className="legend-dot empty"></span> Empty
          </span>
        </div>
      </div>

      <div className="preview-content document-preview">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading template...</p>
          </div>
        ) : (
          <div
            className="document-content"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        )}
      </div>
    </div>
  );
}

export default ContractPreview;
