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

    result = result.replace(/«contractDate»/g,
      data.contractDate ? `<mark class="filled">${data.contractDate}</mark>` : '<mark class="empty">«contractDate»</mark>');

    result = result.replace(/«clubName»/g,
      data.clubName ? `<mark class="filled">${data.clubName}</mark>` : '<mark class="empty">«clubName»</mark>');

    result = result.replace(/«clubAddress»/g,
      data.clubAddress ? `<mark class="filled">${data.clubAddress}</mark>` : '<mark class="empty">«clubAddress»</mark>');

    result = result.replace(/«leaguesName»/g,
      data.leaguesName ? `<mark class="filled">${data.leaguesName}</mark>` : '<mark class="empty">«leaguesName»</mark>');

    result = result.replace(/«playerName»/g,
      data.playerName ? `<mark class="filled">${data.playerName}</mark>` : '<mark class="empty">«playerName»</mark>');

    result = result.replace(/«playerAddress»/g,
      data.playerAddress ? `<mark class="filled">${data.playerAddress}</mark>` : '<mark class="empty">«playerAddress»</mark>');

    result = result.replace(/«playerCountry»/g,
      data.playerCountry ? `<mark class="filled">${data.playerCountry}</mark>` : '<mark class="empty">«playerCountry»</mark>');

    result = result.replace(/«teamCountry»/g,
      data.teamCountry ? `<mark class="filled">${data.teamCountry}</mark>` : '<mark class="empty">«teamCountry»</mark>');

    result = result.replace(/«countryName»/g,
      data.countryName ? `<mark class="filled">${data.countryName}</mark>` : '<mark class="empty">«countryName»</mark>');

    result = result.replace(/«season»/g,
      data.season ? `<mark class="filled">${data.season}</mark>` : '<mark class="empty">«season»</mark>');

    result = result.replace(/«season1»/g,
      data.season1 ? `<mark class="filled">${data.season1}</mark>` : '<mark class="empty">«season1»</mark>');

    result = result.replace(/«season2»/g,
      data.season2 ? `<mark class="filled">${data.season2}</mark>` : '<mark class="empty">«season2»</mark>');

    result = result.replace(/«currency»/g,
      data.currency ? `<mark class="filled">${data.currency}</mark>` : '<mark class="empty">«currency»</mark>');

    if (data.seasons && data.seasons[0]) {
      const season1 = data.seasons[0];
      result = result.replace(/«season1TotalSalary»/g,
        season1.totalSalary ? `<mark class="filled">${season1.totalSalary}</mark>` : '<mark class="empty">«season1TotalSalary»</mark>');

      season1.payments.forEach((payment, idx) => {
        const dateVar = `«season1Payment${idx + 1}Date»`;
        const amountVar = `«season1Payment${idx + 1}Amount»`;

        result = result.replace(new RegExp(dateVar, 'g'),
          payment.date ? `<mark class="filled">${payment.date}</mark>` : `<mark class="empty">${dateVar}</mark>`);
        result = result.replace(new RegExp(amountVar, 'g'),
          payment.amount ? `<mark class="filled">${payment.amount}</mark>` : `<mark class="empty">${amountVar}</mark>`);
      });

      if (season1.agencyFee) {
        result = result.replace(/«season1AgencyFeeTotal»/g,
          season1.agencyFee.totalAmount ? `<mark class="filled">${season1.agencyFee.totalAmount}</mark>` : '<mark class="empty">«season1AgencyFeeTotal»</mark>');

        season1.agencyFee.payments.forEach((payment, idx) => {
          const dateVar = `«season1AgencyFeePayment${idx + 1}Date»`;
          const amountVar = `«season1AgencyFeePayment${idx + 1}Amount»`;

          result = result.replace(new RegExp(dateVar, 'g'),
            payment.date ? `<mark class="filled">${payment.date}</mark>` : `<mark class="empty">${dateVar}</mark>`);
          result = result.replace(new RegExp(amountVar, 'g'),
            payment.amount ? `<mark class="filled">${payment.amount}</mark>` : `<mark class="empty">${amountVar}</mark>`);
        });
      }
    }

    if (data.seasons && data.seasons[1]) {
      const season2 = data.seasons[1];
      result = result.replace(/«season2TotalSalary»/g,
        season2.totalSalary ? `<mark class="filled">${season2.totalSalary}</mark>` : '<mark class="empty">«season2TotalSalary»</mark>');

      season2.payments.forEach((payment, idx) => {
        const dateVar = `«season2Payment${idx + 1}Date»`;
        const amountVar = `«season2Payment${idx + 1}Amount»`;

        result = result.replace(new RegExp(dateVar, 'g'),
          payment.date ? `<mark class="filled">${payment.date}</mark>` : `<mark class="empty">${dateVar}</mark>`);
        result = result.replace(new RegExp(amountVar, 'g'),
          payment.amount ? `<mark class="filled">${payment.amount}</mark>` : `<mark class="empty">${amountVar}</mark>`);
      });

      if (season2.agencyFee) {
        result = result.replace(/«season2AgencyFeeTotal»/g,
          season2.agencyFee.totalAmount ? `<mark class="filled">${season2.agencyFee.totalAmount}</mark>` : '<mark class="empty">«season2AgencyFeeTotal»</mark>');

        season2.agencyFee.payments.forEach((payment, idx) => {
          const dateVar = `«season2AgencyFeePayment${idx + 1}Date»`;
          const amountVar = `«season2AgencyFeePayment${idx + 1}Amount»`;

          result = result.replace(new RegExp(dateVar, 'g'),
            payment.date ? `<mark class="filled">${payment.date}</mark>` : `<mark class="empty">${dateVar}</mark>`);
          result = result.replace(new RegExp(amountVar, 'g'),
            payment.amount ? `<mark class="filled">${payment.amount}</mark>` : `<mark class="empty">${amountVar}</mark>`);
        });
      }
    }

    result = result.replace(/«teamBuyoutAmount»/g,
      data.teamBuyoutAmount ? `<mark class="filled">${data.teamBuyoutAmount}</mark>` : '<mark class="empty">«teamBuyoutAmount»</mark>');

    result = result.replace(/«numberOfDays»/g,
      data.numberOfDays ? `<mark class="filled">${data.numberOfDays}</mark>` : '<mark class="empty">«numberOfDays»</mark>');

    result = result.replace(/«playerBuyoutAmount»/g,
      data.playerBuyoutAmount ? `<mark class="filled">${data.playerBuyoutAmount}</mark>` : '<mark class="empty">«playerBuyoutAmount»</mark>');

    result = result.replace(/«buyoutDate»/g,
      data.buyoutDate ? `<mark class="filled">${data.buyoutDate}</mark>` : '<mark class="empty">«buyoutDate»</mark>');

    result = result.replace(/«agentName»/g,
      data.agentName ? `<mark class="filled">${data.agentName}</mark>` : '<mark class="empty">«agentName»</mark>');

    result = result.replace(/«otherAgentName»/g,
      data.otherAgentName ? `<mark class="filled">${data.otherAgentName}</mark>` : '<mark class="empty">«otherAgentName»</mark>');

    result = result.replace(/«emailAddress»/g,
      data.emailAddress ? `<mark class="filled">${data.emailAddress}</mark>` : '<mark class="empty">«emailAddress»</mark>');

    result = result.replace(/«fibaLicence»/g,
      data.fibaLicence ? `<mark class="filled">${data.fibaLicence}</mark>` : '<mark class="empty">«fibaLicence»</mark>');

    result = result.replace(/«signeeTitle»/g,
      data.signeeTitle ? `<mark class="filled">${data.signeeTitle}</mark>` : '<mark class="empty">«signeeTitle»</mark>');

    result = result.replace(/«signeeName»/g,
      data.signeeName ? `<mark class="filled">${data.signeeName}</mark>` : '<mark class="empty">«signeeName»</mark>');

    result = result.replace(/«taxInfo»/g,
      data.taxInfo ? `<mark class="filled">${data.taxInfo}</mark>` : '<mark class="empty">«taxInfo»</mark>');

    result = result.replace(/«ticketClass»/g,
      data.ticketClass ? `<mark class="filled">${data.ticketClass}</mark>` : '<mark class="empty">«ticketClass»</mark>');

    result = result.replace(/«numberOfTickets»/g,
      data.numberOfTickets ? `<mark class="filled">${data.numberOfTickets}</mark>` : '<mark class="empty">«numberOfTickets»</mark>');

    result = result.replace(/«numberOfBedrooms»/g,
      data.numberOfBedrooms ? `<mark class="filled">${data.numberOfBedrooms}</mark>` : '<mark class="empty">«numberOfBedrooms»</mark>');

    if (data.bonuses && data.bonuses.length > 0) {
      data.bonuses.forEach((bonus, idx) => {
        const competitionVar = `«competition${idx + 1}Name»`;
        result = result.replace(new RegExp(competitionVar, 'g'),
          bonus.competitionName ? `<mark class="filled">${bonus.competitionName}</mark>` : `<mark class="empty">${competitionVar}</mark>`);

        if (bonus.achievements) {
          bonus.achievements.forEach((achievement, achIdx) => {
            const descVar = `«competition${idx + 1}Achievement${achIdx + 1}Desc»`;
            const amountVar = `«competition${idx + 1}Achievement${achIdx + 1}Amount»`;

            result = result.replace(new RegExp(descVar, 'g'),
              achievement.description ? `<mark class="filled">${achievement.description}</mark>` : `<mark class="empty">${descVar}</mark>`);
            result = result.replace(new RegExp(amountVar, 'g'),
              achievement.amount ? `<mark class="filled">${achievement.amount}</mark>` : `<mark class="empty">${amountVar}</mark>`);
          });
        }
      });
    }

    const notFilledRegex = /«[^»]+»/g;
    result = result.replace(notFilledRegex, (match) => {
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
