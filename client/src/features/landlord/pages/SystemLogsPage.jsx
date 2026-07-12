import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import { 
  LayoutGrid, AlertTriangle, Search, Calendar, ChevronDown, 
  Shield, ShieldAlert, User, Database, Info, Settings, X 
} from 'lucide-react';
import './SystemLogsPage.css';

const MOCK_LOGS = [
  { id: 1, time: '10:45:02 UTC', severity: 'CRITICAL', user: 'System Root', action: 'Multiple failed SSH authentication attempts detected.', ip: '192.168.1.105' },
  { id: 2, time: '10:42:15 UTC', severity: 'WARN', user: 'j.doe@smartstay.com', action: 'Modified global pricing multiplier (+5%).', ip: '10.0.0.52' },
  { id: 3, time: '10:30:00 UTC', severity: 'INFO', user: 'Automated CRON', action: 'Daily database snapshot created successfully.', ip: 'localhost' },
  { id: 4, time: '10:15:22 UTC', severity: 'INFO', user: 'm.smith@smartstay.com', action: "Approved new property listing 'Downtown Loft'.", ip: '172.16.0.4' },
  { id: 5, time: '09:55:10 UTC', severity: 'WARN', user: 'System Process', action: 'High memory utilization (85%) detected on node worker-3.', ip: '10.0.1.12' },
  { id: 6, time: '08:20:00 UTC', severity: 'INFO', user: 'admin@smartstay.com', action: 'User account "bob123" suspended manually.', ip: '192.168.1.5' },
  { id: 7, time: '07:15:33 UTC', severity: 'CRITICAL', user: 'Unknown', action: 'SQL Injection payload detected in login form.', ip: '45.33.22.1' },
];

const SystemLogsPage = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const renderBadge = (severity) => {
    switch (severity) {
      case 'CRITICAL': return <span className="badge critical"><AlertTriangle size={12}/>{t('systemLogs.critical', 'CRITICAL')}</span>;
      case 'WARN': return <span className="badge warn"><AlertTriangle size={12}/>{t('systemLogs.warn', 'WARN')}</span>;
      case 'INFO': return <span className="badge info"><Info size={12}/>{t('systemLogs.info', 'INFO')}</span>;
      default: return <span className="badge info">{severity}</span>;
    }
  };

  const toggleSeverity = (sev) => {
    if (severityFilter === sev) setSeverityFilter('ALL');
    else setSeverityFilter(sev);
    setCurrentPage(1); // reset to page 1 on filter
  };

  const filteredLogs = MOCK_LOGS.filter(log => {
    const matchesSearch = log.ip.includes(searchQuery) || 
                          log.user.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          log.action.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === 'ALL' || log.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const currentLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="system-logs-container">
      {/* Header & Stats */}
      <div className="system-logs-header">
        <div className="logs-title-section">
          <h1>{t('systemLogs.systemLogsActivity', 'System Logs & Activity')}</h1>
          <p>{t('systemLogs.liveTelemetryAndSecurityAudit', 'Live telemetry and security audit trail across the Smart Stay ecosystem.')}</p>
        </div>
        <div className="logs-stats-section">
          <div className="stat-card">
            <div className="stat-icon-wrapper blue">
              <LayoutGrid size={24} />
            </div>
            <div className="stat-info">
              <span>{t('systemLogs.eventsToday', 'EVENTS TODAY')}</span>
              <strong>14,208</strong>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrapper red">
              <AlertTriangle size={24} />
            </div>
            <div className="stat-info">
              <span>{t('systemLogs.criticalAlerts', 'CRITICAL ALERTS')}</span>
              <strong className="text-red">3</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="logs-filter-bar">
        <div className="filter-left">
          <div className="filter-search">
            <Search size={18} />
            <input 
              type="text" 
              placeholder={t('systemLogs.searchByIpUserOrPlaceholder', 'Search by IP, User, or Action')} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-severity">
            <span>{t('systemLogs.severity', 'Severity:')}</span>
            <span 
              className={`severity-pill info ${severityFilter === 'INFO' ? 'active' : ''}`}
              onClick={() => toggleSeverity('INFO')}
            >{t('systemLogs.info', 'Info')}</span>
            <span 
              className={`severity-pill warning ${severityFilter === 'WARN' ? 'active' : ''}`}
              onClick={() => toggleSeverity('WARN')}
            >{t('systemLogs.warning', 'Warning')}</span>
            <span 
              className={`severity-pill critical ${severityFilter === 'CRITICAL' ? 'active' : ''}`}
              onClick={() => toggleSeverity('CRITICAL')}
            >{t('systemLogs.critical', 'Critical')}</span>
          </div>
        </div>
        <div className="filter-right">
          <div className="filter-date">
            <Calendar size={16} />
            <span>{t('systemLogs.last24Hours', 'Last 24 Hours')}</span>
            <ChevronDown size={16} />
          </div>
          <button className="btn-filter" onClick={() => { setSearchQuery(''); setSeverityFilter('ALL'); setCurrentPage(1); }}>{t('systemLogs.clearFilters', 'Clear Filters')}</button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="logs-content-layout">
        
        {/* Table Area */}
        <div className="logs-table-card">
          <div className="logs-table-header">
            <h2>{t('systemLogs.liveEventStream', 'Live Event Stream')}</h2>
            <div className="live-badge">
              <span className="live-dot"></span>{t('systemLogs.liveUpdatesOn', 'Live Updates On')}</div>
          </div>
          
          <table className="logs-table">
            <thead>
              <tr>
                <th>{t('systemLogs.timestamp', 'Timestamp')}</th>
                <th>{t('systemLogs.severity', 'Severity')}</th>
                <th>{t('systemLogs.userActor', 'User / Actor')}</th>
                <th>{t('systemLogs.actionDescription', 'Action Description')}</th>
                <th>{t('systemLogs.ipAddress', 'IP Address')}</th>
              </tr>
            </thead>
            <tbody>
              {currentLogs.length > 0 ? currentLogs.map(log => (
                <tr key={log.id}>
                  <td>{log.time}</td>
                  <td>{renderBadge(log.severity)}</td>
                  <td>{log.user}</td>
                  <td>{log.action}</td>
                  <td className="font-mono">{log.ip}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>{t('systemLogs.noLogsMatchTheCurrent', 'No logs match the current filters.')}</td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="logs-table-footer">
            <span>Showing {(currentPage - 1) * itemsPerPage + (currentLogs.length > 0 ? 1 : 0)} to {Math.min(currentPage * itemsPerPage, filteredLogs.length)} of {filteredLogs.length} entries</span>
            <div className="pagination">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >{t('systemLogs.prev', 'Prev')}</button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
              >{t('systemLogs.next', 'Next')}</button>
            </div>
          </div>
        </div>

        {/* Audit Timeline Sidebar */}
        <div className="audit-timeline-card">
          <div className="timeline-header">
            <div className="timeline-icon-wrap">
              <Shield size={20} />
            </div>
            <h3>{t('systemLogs.securityAuditTimeline', 'Security Audit Timeline')}</h3>
          </div>
          
          <div className="timeline-list">
            <div className="timeline-item">
              <div className="timeline-dot critical"><ShieldAlert size={12}/></div>
              <div className="timeline-content">
                <span className="timeline-time">{t('systemLogs.104502Utc', '10:45:02 UTC')}</span>
                <div className="timeline-title">{t('systemLogs.multipleAuthFailures', 'Multiple Auth Failures')}</div>
                <div className="timeline-desc">{t('systemLogs.rootAccessAttemptedViaSsh', 'Root access attempted via SSH. IP addresses blocked temporarily.')}</div>
              </div>
            </div>
            
            <div className="timeline-item">
              <div className="timeline-dot info"><User size={12}/></div>
              <div className="timeline-content">
                <span className="timeline-time">{t('systemLogs.081244Utc', '08:12:44 UTC')}</span>
                <div className="timeline-title">{t('systemLogs.adminRoleElevated', 'Admin Role Elevated')}</div>
                <div className="timeline-desc">{t('systemLogs.userCwilliamsGrantedSuperadminPrivileges', 'User \'c.williams\' granted SuperAdmin privileges by \'a.admin\'.')}</div>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-dot warn"><Settings size={12}/></div>
              <div className="timeline-content">
                <span className="timeline-time">{t('systemLogs.yesterday2230Utc', 'Yesterday, 22:30 UTC')}</span>
                <div className="timeline-title">{t('systemLogs.globalPolicyChange', 'Global Policy Change')}</div>
                <div className="timeline-desc">{t('systemLogs.defaultCancellationPolicyUpdatedFor', 'Default cancellation policy updated for all new listings.')}</div>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-dot neutral"><Database size={12}/></div>
              <div className="timeline-content">
                <span className="timeline-time">{t('systemLogs.yesterday1405Utc', 'Yesterday, 14:05 UTC')}</span>
                <div className="timeline-title">{t('systemLogs.systemBackupVerified', 'System Backup Verified')}</div>
                <div className="timeline-desc">{t('systemLogs.weeklyEncryptedOffsiteBackupIntegrity', 'Weekly encrypted off-site backup integrity check passed.')}</div>
              </div>
            </div>
          </div>

          <button className="btn-full-audit">{t('systemLogs.viewFullAuditLog', 'View Full Audit Log')}</button>
        </div>
      </div>
    </div>
  );
};

export default SystemLogsPage;
