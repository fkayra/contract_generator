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

        html = addMarkupToPlaceholders(html, formData);

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
    if (data.seasons && data.seasons.length > 0) {
      const firstSeason = data.seasons[0];
      const paymentParaIds = [
        '0000001E', '00000020', '00000022', '00000024', '00000026',
        '00000028', '0000002A', '0000002C', '0000002E', '00000030'
      ];

      const emptyParaIds = [
        '0000001F', '00000021', '00000023', '00000025', '00000027',
        '00000029', '0000002B', '0000002D', '0000002F'
      ];

      const numPayments = parseInt(firstSeason.numberOfPayments) || firstSeason.payments.length;

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

    return content;
  };

  const addMarkupToPlaceholders = (html, data) => {
    let result = html;

    const replacements = {
      '\\[CONTRACT DATE\\]': data.contractDate,
      '\\[NAME OF THE CLUB\\]': data.clubName,
      '\\[ADDRESS OF THE CLUB\\s*\\]': data.clubAddress,
      '\\[NAME OF THE LEAGUES\\]': data.leaguesName,
      '\\[NAME OF THE PLAYER\\]': data.playerName,
      '\\[ADDRESS OF THE LEAGUES\\]': data.playerAddress,
      '\\[COUNTRY OF THE PLAYER\\]': data.playerCountry,
      '\\[COUNTRY OF THE TEAM\\]': data.teamCountry,
      '\\[COUNNAME OF THE COUNTRY\\]': data.countryName,
      '\\[COUNNAME\\]': data.countryName,
      '\\[SEASON\\]': data.season,
      '\\[SEASON 1\\]': data.season1,
      '\\[SEASON 2\\]': data.season2,
      '\\{SEASON_1\\}': data.season1 || (data.seasons && data.seasons[0] ? data.seasons[0].seasonName : null),
      '\\{SEASON_2\\}': data.season2 || (data.seasons && data.seasons[1] ? data.seasons[1].seasonName : null),
      '\\{MULTI_SEASON_CLAUSE_FULL\\}': data.multiSeasonClauseFull,
      '\\[CURRENCY\\]': data.currency,
      '\\[NUMBER OF SEASON\\]': data.numberOfSeasons,
      '\\[ADDITIONAL SEASON\\]': data.additionalSeason,
      '\\[ADDITIONAL_SEASON\\]': data.additionalSeason,
      '\\[AND THE ADDITIONAL SEASON\\]': data.additionalSeasonClause,
      '\\[TEAM BUY OUT AMOUNT\\]': data.teamBuyoutAmount,
      '\\[NUMBER OF DAYS\\]': data.numberOfDays,
      '\\[PLAYER BUY OUT AMOUNT\\]': data.playerBuyoutAmount,
      '\\[DATE OF THE BUY OUT\\]': data.buyoutDate,
      '\\[NAME OF THE AGENT\\]': data.agentName,
      '\\[NUMBER OF THE AGENT\\]': data.agentName,
      '\\[AND NAME OF THE OTHER AGENT\\]': data.otherAgentName,
      '\\[EMAIL ADDRESS\\]': data.emailAddress,
      '\\[FIBA LICENCE NUMBER\\]': data.fibaLicence,
      '\\[TITLE OF SIGNEE\\]': data.signeeTitle,
      '\\[NAME\\]': data.signeeName,
      '\\[TAX INFO\\]': data.taxInfo,
      '\\[CLASS OF THE TICKET\\]': data.ticketClass,
      '\\[NUMBER OF TICKET\\]': data.numberOfTickets,
      '\\[NUMBER OF BEDROOM\\]': data.numberOfBedrooms,
    };

    for (const [pattern, value] of Object.entries(replacements)) {
      const regex = new RegExp(pattern, 'gi');
      const placeholder = pattern
        .replace(/\\\[/g, '[').replace(/\\\]/g, ']')
        .replace(/\\\{/g, '{').replace(/\\\}/g, '}')
        .replace(/\\s\*/g, '');
      result = result.replace(regex,
        value ? `<mark class="filled">${value}</mark>` : `<mark class="empty">${placeholder}</mark>`);
    }

    if (data.seasons && data.seasons[0]) {
      const season1 = data.seasons[0];

      result = result.replace(/2025\/26 season/gi,
        season1.seasonName ? `<mark class="filled">${season1.seasonName}</mark> season` : '2025/26 season');

      result = result.replace(/\[TOTAL AMOUNT OF CONTRACY\]/gi,
        season1.totalSalary ? `<mark class="filled">${season1.totalSalary}</mark>` : '<mark class="empty">[TOTAL AMOUNT OF CONTRACY]</mark>');
    }

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
