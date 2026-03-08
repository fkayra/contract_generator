import { useState, useEffect } from 'react';
import './ContractPreview.css';

function ContractPreview({ formData }) {
  const [highlightedSections, setHighlightedSections] = useState(new Set());

  useEffect(() => {
    const newHighlights = new Set();

    if (formData.contractDate) newHighlights.add('contractDate');
    if (formData.clubName) newHighlights.add('clubName');
    if (formData.playerName) newHighlights.add('playerName');
    if (formData.season) newHighlights.add('season');
    if (formData.seasons?.[0]?.totalSalary) newHighlights.add('salary');
    if (formData.hasTeamBuyout || formData.hasPlayerBuyout) newHighlights.add('buyout');
    if (formData.agentName) newHighlights.add('agent');
    if (formData.bonuses?.some(b => b.competitionName)) newHighlights.add('bonuses');
    if (formData.ticketClass || formData.numberOfBedrooms) newHighlights.add('benefits');

    setHighlightedSections(newHighlights);
  }, [formData]);

  const formatCurrency = (amount) => {
    if (!amount) return '___';
    return `${formData.currency || '€'} ${amount}`;
  };

  const formatDate = (date) => {
    return date || '___________';
  };

  return (
    <div className="contract-preview">
      <div className="preview-header">
        <h3>Live Contract Preview</h3>
        <div className="preview-legend">
          <span className="legend-item">
            <span className="legend-dot filled"></span> Filled
          </span>
          <span className="legend-item">
            <span className="legend-dot empty"></span> Empty
          </span>
        </div>
      </div>

      <div className="preview-content">
        <div className={`preview-section ${highlightedSections.has('contractDate') ? 'filled' : ''}`}>
          <div className="section-label">Contract Date</div>
          <div className="section-value">{formatDate(formData.contractDate)}</div>
        </div>

        <div className="preview-divider">PARTIES</div>

        <div className={`preview-section ${highlightedSections.has('clubName') ? 'filled' : ''}`}>
          <div className="section-label">Club</div>
          <div className="section-value">{formData.clubName || 'Club Name Not Set'}</div>
          {formData.clubAddress && <div className="section-detail">{formData.clubAddress}</div>}
        </div>

        <div className={`preview-section ${highlightedSections.has('playerName') ? 'filled' : ''}`}>
          <div className="section-label">Player</div>
          <div className="section-value">{formData.playerName || 'Player Name Not Set'}</div>
          {formData.playerAddress && <div className="section-detail">{formData.playerAddress}</div>}
          {formData.playerCountry && <div className="section-detail">{formData.playerCountry}</div>}
        </div>

        <div className="preview-divider">TERM</div>

        <div className={`preview-section ${highlightedSections.has('season') ? 'filled' : ''}`}>
          <div className="section-label">Season(s)</div>
          <div className="section-value">
            {formData.numberOfSeasons || '1'} Season(s)
          </div>
          <div className="section-detail">
            {formData.season || '2025/26'}
            {formData.numberOfSeasons === '2' && ` - ${formData.season2 || '2026/27'}`}
          </div>
        </div>

        <div className="preview-divider">COMPENSATION</div>

        {formData.seasons?.map((season, idx) => (
          <div key={idx} className={`preview-section ${season.totalSalary ? 'filled' : ''}`}>
            <div className="section-label">Season {idx + 1}: {season.seasonName}</div>
            <div className="section-value">{formatCurrency(season.totalSalary)}</div>
            {season.totalSalary && (
              <div className="section-detail">
                {season.numberOfPayments} payment(s)
              </div>
            )}
            {season.payments?.some(p => p.date && p.amount) && (
              <div className="payment-preview">
                {season.payments.filter(p => p.date || p.amount).map((payment, pIdx) => (
                  <div key={pIdx} className="payment-line">
                    {formatDate(payment.date)}: {formatCurrency(payment.amount)}
                  </div>
                ))}
              </div>
            )}
            {season.agencyFee?.totalAmount && (
              <div className="agency-fee-preview">
                <div className="section-sublabel">Agency Fee</div>
                <div className="section-detail">{formatCurrency(season.agencyFee.totalAmount)}</div>
              </div>
            )}
          </div>
        ))}

        <div className="preview-divider">BUYOUT CLAUSES</div>

        <div className={`preview-section ${highlightedSections.has('buyout') ? 'filled' : ''}`}>
          {!formData.hasTeamBuyout && !formData.hasPlayerBuyout ? (
            <div className="section-value empty-notice">No buyout clauses selected</div>
          ) : (
            <>
              {formData.hasTeamBuyout && (
                <div className="buyout-item">
                  <div className="section-sublabel">Team Buy-out</div>
                  <div className="section-value">{formatCurrency(formData.teamBuyoutAmount)}</div>
                  {formData.numberOfDays && (
                    <div className="section-detail">{formData.numberOfDays} days after last game</div>
                  )}
                </div>
              )}
              {formData.hasPlayerBuyout && (
                <div className="buyout-item">
                  <div className="section-sublabel">Player Buy-out</div>
                  <div className="section-value">{formatCurrency(formData.playerBuyoutAmount)}</div>
                  {formData.buyoutDate && (
                    <div className="section-detail">Deadline: {formData.buyoutDate}</div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className="preview-divider">BONUSES</div>

        <div className={`preview-section ${highlightedSections.has('bonuses') ? 'filled' : ''}`}>
          {formData.bonuses?.filter(b => b.competitionName).length > 0 ? (
            formData.bonuses.filter(b => b.competitionName).map((bonus, idx) => (
              <div key={idx} className="bonus-preview">
                <div className="section-sublabel">{bonus.competitionName}</div>
                {bonus.achievements?.filter(a => a.description).map((achievement, aIdx) => (
                  <div key={aIdx} className="achievement-preview">
                    <span className="achievement-desc">{achievement.description}</span>
                    {achievement.amount && (
                      <span className="achievement-amount">: {achievement.amount}</span>
                    )}
                  </div>
                ))}
              </div>
            ))
          ) : (
            <div className="section-value empty-notice">No bonuses configured</div>
          )}
          {formData.includeNotClause && (
            <div className="section-detail note">Bonuses are NOT cumulative</div>
          )}
        </div>

        <div className="preview-divider">BENEFITS</div>

        <div className={`preview-section ${highlightedSections.has('benefits') ? 'filled' : ''}`}>
          {formData.ticketClass && (
            <div className="benefit-item">
              <span className="benefit-label">Tickets:</span>
              <span> {formData.numberOfTickets || '_'} × {formData.ticketClass}</span>
            </div>
          )}
          {formData.numberOfBedrooms && (
            <div className="benefit-item">
              <span className="benefit-label">Accommodation:</span>
              <span> {formData.numberOfBedrooms} bedroom(s)</span>
            </div>
          )}
          {!formData.ticketClass && !formData.numberOfBedrooms && (
            <div className="section-value empty-notice">No additional benefits</div>
          )}
        </div>

        <div className="preview-divider">AGENT</div>

        <div className={`preview-section ${highlightedSections.has('agent') ? 'filled' : ''}`}>
          <div className="section-value">
            {formData.agentName || 'No agent specified'}
            {formData.otherAgentName && ` & ${formData.otherAgentName}`}
          </div>
          {formData.emailAddress && (
            <div className="section-detail">{formData.emailAddress}</div>
          )}
          {formData.fibaLicence && (
            <div className="section-detail">FIBA: {formData.fibaLicence}</div>
          )}
        </div>

        {(formData.signeeTitle || formData.signeeName) && (
          <>
            <div className="preview-divider">CLUB SIGNEE</div>
            <div className="preview-section filled">
              <div className="section-value">
                {formData.signeeName || 'Not specified'}
              </div>
              {formData.signeeTitle && (
                <div className="section-detail">{formData.signeeTitle}</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ContractPreview;
