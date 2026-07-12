import { useTranslation } from 'react-i18next';
import React from 'react';
import { 
  MessageCircle, Target, AlertCircle, Clock, Cpu, 
  SlidersHorizontal, Download, ArrowRight, AlertTriangle 
} from 'lucide-react';
import './AISystemMonitoringPage.css';

const AISystemMonitoringPage = () => {
  const { t } = useTranslation();
  const failedLogs = [
    {
      id: 1,
      time: '10:42 AM, Today',
      query: '"I need to cancel my lease early because..."',
      intent: 'Lease_Cancellation',
      status: 'Human Escalation',
      statusType: 'red'
    },
    {
      id: 2,
      time: '09:15 AM, Today',
      query: '"Show me apartments near the xyz fake street..."',
      intent: 'Search_Location',
      status: 'API_Timeout',
      statusType: 'orange'
    },
    {
      id: 3,
      time: '08:05 AM, Today',
      query: '"How do I reset the smart lock on door 4?"',
      intent: 'Hardware_Troubleshoot',
      status: 'Low_Confidence_Score',
      statusType: 'red'
    },
    {
      id: 4,
      time: 'Yesterday, 11:20 PM',
      query: '"Can I bring my pet iguana?"',
      intent: 'Pet_Policy',
      status: 'Missing_Entity_Data',
      statusType: 'red'
    }
  ];

  return (
    <div className="ai-monitor-container">
      {/* Header */}
      <div className="ai-monitor-header">
        <h1>{t('aISystemMonitoring.aiSystemMonitoring', 'AI System Monitoring')}</h1>
        <p>{t('aISystemMonitoring.realtimePerformanceMetricsAndDiagnostics', 'Real-time performance metrics and diagnostics for the Smart Stay intelligence engine.')}</p>
      </div>

      {/* Stats Cards Row */}
      <div className="ai-stats-row">
        <div className="ai-stat-card">
          <div className="ai-stat-card-title">{t('aISystemMonitoring.chatbotSatisfactionRate', 'CHATBOT SATISFACTION RATE')}</div>
          <div className="ai-stat-card-value-row">
            <span className="ai-stat-card-value">94.2%</span>
            <span className="trend-badge positive">↗+2.1%</span>
          </div>
          <p className="ai-stat-card-sub">{t('aISystemMonitoring.basedOnPostinteractionSurveysThis', 'Based on post-interaction surveys this week.')}</p>
          <MessageCircle size={64} className="ai-stat-icon-bg" />
        </div>

        <div className="ai-stat-card">
          <div className="ai-stat-card-title">{t('aISystemMonitoring.successfulRecommendations', 'SUCCESSFUL RECOMMENDATIONS')}</div>
          <div className="ai-stat-card-value-row">
            <span className="ai-stat-card-value">12,450</span>
            <span className="trend-badge positive">↗+8%</span>
          </div>
          <p className="ai-stat-card-sub">{t('aISystemMonitoring.propertyAndAmenityMatchesAccepted', 'Property and amenity matches accepted by users.')}</p>
          <Target size={64} className="ai-stat-icon-bg" />
        </div>

        <div className="ai-stat-card">
          <div className="ai-stat-card-title">{t('aISystemMonitoring.failedRequestRate', 'FAILED REQUEST RATE')}</div>
          <div className="ai-stat-card-value-row">
            <span className="ai-stat-card-value">1.8%</span>
            <span className="trend-badge negative">↘-0.4%</span>
          </div>
          <p className="ai-stat-card-sub">{t('aISystemMonitoring.queriesRequiringHumanFallbackOr', 'Queries requiring human fallback or resulting in errors.')}</p>
          <AlertCircle size={64} className="ai-stat-icon-bg" />
        </div>
      </div>

      {/* Middle Layout */}
      <div className="ai-middle-layout">
        
        {/* Chart Card */}
        <div className="ai-chart-card">
          <div className="ai-chart-header">
            <h3>{t('aISystemMonitoring.dailyAiVolume', 'Daily AI Volume')}</h3>
            <div className="ai-chart-legend">
              <div className="legend-item">
                <span className="legend-dot primary"></span>{t('aISystemMonitoring.totalQueries', 'Total Queries')}</div>
              <div className="legend-item">
                <span className="legend-dot secondary"></span>{t('aISystemMonitoring.complexTasks', 'Complex Tasks')}</div>
            </div>
          </div>
          
          <div className="ai-chart-mock-area">
            {/* Y Axis Labels */}
            <div className="chart-y-axis">
              <span>{t('aISystemMonitoring.5k', '5k')}</span>
              <span>{t('aISystemMonitoring.4k', '4k')}</span>
              <span>{t('aISystemMonitoring.3k', '3k')}</span>
              <span>{t('aISystemMonitoring.2k', '2k')}</span>
              <span>{t('aISystemMonitoring.1k', '1k')}</span>
              <span>0</span>
            </div>
            
            {/* Grid Lines */}
            <div className="chart-lines-container">
              <div className="chart-grid-line"></div>
              <div className="chart-grid-line"></div>
              <div className="chart-grid-line"></div>
              <div className="chart-grid-line"></div>
              <div className="chart-grid-line"></div>
              <div className="chart-grid-line"></div>
            </div>

            {/* X Axis Labels */}
            <div className="chart-x-axis">
              <span>{t('aISystemMonitoring.mon', 'Mon')}</span>
              <span>{t('aISystemMonitoring.tue', 'Tue')}</span>
              <span>{t('aISystemMonitoring.wed', 'Wed')}</span>
              <span>{t('aISystemMonitoring.thu', 'Thu')}</span>
              <span>{t('aISystemMonitoring.fri', 'Fri')}</span>
              <span>{t('aISystemMonitoring.sat', 'Sat')}</span>
              <span>{t('aISystemMonitoring.sun', 'Sun')}</span>
            </div>

            {/* Mock Data Bars */}
            <div className="chart-data-bars">
              {/* Mon */}
              <div className="mock-bar-group">
                <div className="mock-bar main" style={{ height: '40%' }}></div>
                <div className="mock-bar sub" style={{ height: '15%' }}></div>
              </div>
              {/* Tue */}
              <div className="mock-bar-group">
                <div className="mock-bar main" style={{ height: '55%' }}></div>
                <div className="mock-bar sub" style={{ height: '20%' }}></div>
              </div>
              {/* Wed */}
              <div className="mock-bar-group">
                <div className="mock-bar main" style={{ height: '45%' }}></div>
                <div className="mock-bar sub" style={{ height: '10%' }}></div>
              </div>
              {/* Thu */}
              <div className="mock-bar-group">
                <div className="mock-bar main" style={{ height: '60%' }}></div>
                <div className="mock-bar sub" style={{ height: '25%' }}></div>
              </div>
              {/* Fri */}
              <div className="mock-bar-group">
                <div className="mock-bar main" style={{ height: '80%' }}></div>
                <div className="mock-bar sub" style={{ height: '35%' }}></div>
              </div>
              {/* Sat */}
              <div className="mock-bar-group">
                <div className="mock-bar main" style={{ height: '90%' }}></div>
                <div className="mock-bar sub" style={{ height: '40%' }}></div>
              </div>
              {/* Sun */}
              <div className="mock-bar-group">
                <div className="mock-bar main" style={{ height: '70%' }}></div>
                <div className="mock-bar sub" style={{ height: '30%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Efficiency Metrics */}
        <div className="ai-efficiency-panel">
          <h3 className="efficiency-title">{t('aISystemMonitoring.efficiencyMetrics', 'Efficiency Metrics')}</h3>
          
          <div className="ai-metric-card">
            <div className="metric-card-header">
              <span className="metric-card-title">{t('aISystemMonitoring.avgResponseTime', 'Avg. Response Time')}</span>
              <Clock size={16} className="metric-icon" />
            </div>
            <div className="metric-card-value">{t('aISystemMonitoring.12s', '1.2s')}</div>
          </div>

          <div className="ai-metric-card">
            <div className="metric-card-header">
              <span className="metric-card-title">{t('aISystemMonitoring.automationRate', 'Automation Rate')}</span>
              <Cpu size={16} className="metric-icon" />
            </div>
            <div className="metric-card-value">88.5%</div>
            <div className="metric-progress-wrap">
              <div className="metric-progress-bg">
                <div className="metric-progress-fill" style={{ width: '88.5%' }}></div>
              </div>
            </div>
          </div>

          <button className="btn-adjust-params">
            <SlidersHorizontal size={18} />{t('aISystemMonitoring.adjustParameters', 'Adjust Parameters')}</button>
        </div>
      </div>

      {/* Bottom Table */}
      <div className="ai-table-card">
        <div className="ai-table-header">
          <div className="table-header-info">
            <h2>{t('aISystemMonitoring.failedRequestsLog', 'Failed Requests Log')}</h2>
            <p>{t('aISystemMonitoring.recentInteractionsRequiringAttentionOr', 'Recent interactions requiring attention or debugging.')}</p>
          </div>
          <button className="btn-export">
            <Download size={16} />{t('aISystemMonitoring.exportCsv', 'Export CSV')}</button>
        </div>

        <table className="ai-table">
          <thead>
            <tr>
              <th>{t('aISystemMonitoring.timestamp', 'TIMESTAMP')}</th>
              <th>{t('aISystemMonitoring.userQueryFragment', 'USER QUERY FRAGMENT')}</th>
              <th>{t('aISystemMonitoring.predictedIntent', 'PREDICTED INTENT')}</th>
              <th>{t('aISystemMonitoring.statusErrorCode', 'STATUS / ERROR CODE')}</th>
              <th>{t('aISystemMonitoring.action', 'ACTION')}</th>
            </tr>
          </thead>
          <tbody>
            {failedLogs.map(log => (
              <tr key={log.id}>
                <td>{log.time}</td>
                <td className="fragment">{log.query}</td>
                <td>
                  <span className="intent-pill">{log.intent}</span>
                </td>
                <td>
                  <span className={`error-pill ${log.statusType}`}>
                    <AlertTriangle size={12} /> {log.status}
                  </span>
                </td>
                <td>
                  <span className="action-link">{t('aISystemMonitoring.review', 'Review')}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="ai-table-footer">
          <a href="#" className="view-all-link">{t('aISystemMonitoring.viewAllLogs', 'View All Logs')}<ArrowRight size={16} />
          </a>
        </div>
      </div>

    </div>
  );
};

export default AISystemMonitoringPage;
