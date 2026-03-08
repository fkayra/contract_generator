import { useState, useEffect } from 'react';
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

        const result = await window.mammoth.convertToHtml({ arrayBuffer });
        let html = result.value;

        html = replaceTemplateVariables(html, formData);

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

  const replaceTemplateVariables = (html, data) => {
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

      result = result.replace(/\[SEASON NAME\]/gi,
        season1.seasonName ? `<mark class="filled">${season1.seasonName}</mark>` : '<mark class="empty">[SEASON NAME]</mark>');

      result = result.replace(/\[NUMBER OF PAYMENTS\]/gi,
        season1.numberOfPayments ? `<mark class="filled">${season1.numberOfPayments}</mark>` : '<mark class="empty">[NUMBER OF PAYMENTS]</mark>');

      result = result.replace(/\[TOTAL AMOUNT OF CONTRACY\]/gi,
        season1.totalSalary ? `<mark class="filled">${season1.totalSalary}</mark>` : '<mark class="empty">[TOTAL AMOUNT OF CONTRACY]</mark>');

      const numPayments = parseInt(season1.numberOfPayments) || 10;

      season1.payments.forEach((payment, idx) => {
        if (idx < 10) {
          const monthNum = idx + 1;
          const datePattern = new RegExp(`\\[DATE OF ${monthNum}.*?SALARY\\]`, 'gi');

          if (idx < numPayments) {
            result = result.replace(datePattern,
              payment.date ? `<mark class="filled">${payment.date}</mark>` : `<mark class="empty">[DATE OF ${monthNum} SALARY]</mark>`);
          } else {
            result = result.replace(datePattern, `<span class="payment-hide-${monthNum}">[DATE OF ${monthNum} SALARY]</span>`);
          }
        }
      });

      for (let i = 0; i < 10; i++) {
        result = result.replace(/\[AMOUNT OF THAT MONTH\]/i, (match) => {
          if (i < numPayments && i < season1.payments.length && season1.payments[i] && season1.payments[i].amount) {
            return `<mark class="filled">${season1.payments[i].amount}</mark>`;
          } else if (i >= numPayments) {
            return `<span class="payment-hide-amount-${i + 1}">[AMOUNT OF THAT MONTH]</span>`;
          }
          return `<mark class="empty">[AMOUNT OF THAT MONTH]</mark>`;
        });
      }

      for (let idx = numPayments + 1; idx <= 10; idx++) {
        const hidePattern = new RegExp(`<p>.*?payment-hide-${idx}.*?</p>`, 'gis');
        result = result.replace(hidePattern, '');
      }

      if (season1.agencyFee) {
        result = result.replace(/\[AGENCY FEE TOTAL\]/gi,
          season1.agencyFee.totalAmount ? `<mark class="filled">${season1.agencyFee.totalAmount}</mark>` : '<mark class="empty">[AGENCY FEE TOTAL]</mark>');

        result = result.replace(/\[AGENCY FEE NUMBER OF PAYMENTS\]/gi,
          season1.agencyFee.numberOfPayments ? `<mark class="filled">${season1.agencyFee.numberOfPayments}</mark>` : '<mark class="empty">[AGENCY FEE NUMBER OF PAYMENTS]</mark>');

        season1.agencyFee.payments.forEach((payment, idx) => {
          const feeNum = idx + 1;
          const datePattern = new RegExp(`\\[AGENCY FEE ${feeNum} DATE\\]`, 'gi');
          const amountPattern = new RegExp(`\\[AGENCY FEE ${feeNum} AMOUNT\\]`, 'gi');

          result = result.replace(datePattern,
            payment.date ? `<mark class="filled">${payment.date}</mark>` : `<mark class="empty">[AGENCY FEE ${feeNum} DATE]</mark>`);
          result = result.replace(amountPattern,
            payment.amount ? `<mark class="filled">${payment.amount}</mark>` : `<mark class="empty">[AGENCY FEE ${feeNum} AMOUNT]</mark>`);
        });
      }
    }

    if (data.numberOfSeasons === '1') {
      const additionalSeasonRegex = /<p[^>]*>.*?\[ADDITIONAL[_ ]SEASON\].*?<\/p>/gis;
      result = result.replace(additionalSeasonRegex, '');

      const additionalSeasonRegex2 = /\[ADDITIONAL[_ ]SEASON\]/gi;
      result = result.replace(additionalSeasonRegex2, '');
    }

    if (data.seasons && data.seasons[1]) {
      const season2 = data.seasons[1];

      result = result.replace(/\[SEASON 2 NAME\]/gi,
        season2.seasonName ? `<mark class="filled">${season2.seasonName}</mark>` : '<mark class="empty">[SEASON 2 NAME]</mark>');

      result = result.replace(/\[SEASON 2 NUMBER OF PAYMENTS\]/gi,
        season2.numberOfPayments ? `<mark class="filled">${season2.numberOfPayments}</mark>` : '<mark class="empty">[SEASON 2 NUMBER OF PAYMENTS]</mark>');

      result = result.replace(/\[SEASON 2 TOTAL AMOUNT\]/gi,
        season2.totalSalary ? `<mark class="filled">${season2.totalSalary}</mark>` : '<mark class="empty">[SEASON 2 TOTAL AMOUNT]</mark>');

      const numPayments2 = parseInt(season2.numberOfPayments) || 10;

      for (let idx = 0; idx < 10; idx++) {
        const monthNum = idx + 1;
        const payment = season2.payments[idx];

        if (idx < numPayments2 && payment) {
          const datePattern = new RegExp(`\\[SEASON 2 PAYMENT ${monthNum} DATE\\]`, 'gi');
          const amountPattern = new RegExp(`\\[SEASON 2 PAYMENT ${monthNum} AMOUNT\\]`, 'gi');

          result = result.replace(datePattern,
            payment.date ? `<mark class="filled">${payment.date}</mark>` : `<mark class="empty">[SEASON 2 PAYMENT ${monthNum} DATE]</mark>`);
          result = result.replace(amountPattern,
            payment.amount ? `<mark class="filled">${payment.amount}</mark>` : `<mark class="empty">[SEASON 2 PAYMENT ${monthNum} AMOUNT]</mark>`);
        } else {
          const patterns = [
            new RegExp(`<p[^>]*>.*?\\[SEASON 2 PAYMENT ${monthNum} DATE\\].*?</p>`, 'gis'),
            new RegExp(`\\[SEASON 2 PAYMENT ${monthNum} DATE\\][^<]*:[^<]*\\[SEASON 2 PAYMENT ${monthNum} AMOUNT\\][^<]*`, 'gi'),
          ];

          patterns.forEach(pattern => {
            result = result.replace(pattern, '');
          });
        }
      }

      if (season2.agencyFee) {
        result = result.replace(/\[SEASON 2 AGENCY FEE TOTAL\]/gi,
          season2.agencyFee.totalAmount ? `<mark class="filled">${season2.agencyFee.totalAmount}</mark>` : '<mark class="empty">[SEASON 2 AGENCY FEE TOTAL]</mark>');

        result = result.replace(/\[SEASON 2 AGENCY FEE NUMBER OF PAYMENTS\]/gi,
          season2.agencyFee.numberOfPayments ? `<mark class="filled">${season2.agencyFee.numberOfPayments}</mark>` : '<mark class="empty">[SEASON 2 AGENCY FEE NUMBER OF PAYMENTS]</mark>');

        season2.agencyFee.payments.forEach((payment, idx) => {
          const feeNum = idx + 1;
          const datePattern = new RegExp(`\\[SEASON 2 AGENCY FEE ${feeNum} DATE\\]`, 'gi');
          const amountPattern = new RegExp(`\\[SEASON 2 AGENCY FEE ${feeNum} AMOUNT\\]`, 'gi');

          result = result.replace(datePattern,
            payment.date ? `<mark class="filled">${payment.date}</mark>` : `<mark class="empty">[SEASON 2 AGENCY FEE ${feeNum} DATE]</mark>`);
          result = result.replace(amountPattern,
            payment.amount ? `<mark class="filled">${payment.amount}</mark>` : `<mark class="empty">[SEASON 2 AGENCY FEE ${feeNum} AMOUNT]</mark>`);
        });
      }
    }

    if (data.bonuses && data.bonuses.length > 0) {
      data.bonuses.forEach((bonus, idx) => {
        const compNum = idx + 1;
        const competitionPattern = new RegExp(`\\[COMPETITION\\]`, 'gi');

        if (idx === 0 && bonus.competitionName) {
          result = result.replace(competitionPattern,
            `<mark class="filled">${bonus.competitionName}</mark>`);
        }

        if (bonus.achievements) {
          bonus.achievements.forEach((achievement, achIdx) => {
            const achievementNum = achIdx + 1;
            const descPattern = new RegExp(`\\[ACHIEVEMENT\\]`, 'gi');
            const amountPattern = new RegExp(`\\[AMOUNT.*?\\]`, 'gi');

            if (achIdx === 0) {
              result = result.replace(descPattern,
                achievement.description ? `<mark class="filled">${achievement.description}</mark>` : '<mark class="empty">[ACHIEVEMENT]</mark>');
            }
          });
        }
      });
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
