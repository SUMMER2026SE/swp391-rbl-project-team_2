const fs = require('fs');
const path = require('path');

const dir = './client/src/features/landlord/pages/';
const files = [
  'AddPropertyPage.jsx',
  'PropertiesPage.jsx',
  'PropertyDashboardPage.jsx',
  'RoomManagementPage.jsx',
  'RentalRequestsPage.jsx',
  'ContractsPage.jsx',
  'PaymentsPage.jsx',
  'DepositManagementPage.jsx',
  'ComplaintsPage.jsx',
  'MessagesPage.jsx',
  'LandlordNotificationsPage.jsx',
  'AISystemMonitoringPage.jsx',
  'SystemLogsPage.jsx'
];

let globalTranslations = {};
let totalModifications = 0;

files.forEach(file => {
    let fullPath = path.join(dir, file);
    if (!fs.existsSync(fullPath)) return;
    
    let content = fs.readFileSync(fullPath, 'utf8');
    let pageName = file.replace('Page.jsx', '');
    pageName = pageName.charAt(0).toLowerCase() + pageName.slice(1);
    globalTranslations[pageName] = {};

    let modified = false;

    if (!content.includes('useTranslation')) {
        content = content.replace("import React", "import { useTranslation } from 'react-i18next';\nimport React");
        modified = true;
    }

    if (!content.includes('const { t } = useTranslation();')) {
        content = content.replace(/const [a-zA-Z0-9_]+ = \([^)]*\) => {/, match => {
            return match + "\n  const { t } = useTranslation();";
        });
        modified = true;
    }

    const generateKey = (text, suffix = '') => {
        let clean = text.replace(/[^a-zA-Z0-9\s]/g, '');
        let words = clean.split(/\s+/).filter(w => w);
        if (words.length === 0) return null;
        let key = words.slice(0, 5).map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
        return key + suffix;
    };

    // Safely replace text between > and <
    content = content.replace(/>([^<{}]+)</g, (match, text) => {
        let trimmed = text.trim();
        
        // Strict exclusions to avoid matching JS code
        if (!trimmed || 
            trimmed.length < 2 || 
            !/[a-zA-Z]/.test(trimmed) || 
            /[\n\r;=(){}\[\]_]/.test(trimmed) || // No newlines, no code syntax
            trimmed.includes('&&') ||
            trimmed.includes('||') ||
            trimmed.includes('!==') ||
            trimmed.includes('===') ||
            trimmed === 'VNĐ' ||
            /^[\d\W]+$/.test(trimmed)
        ) {
            return match;
        }

        let key = generateKey(trimmed);
        if (!key) return match;
        
        globalTranslations[pageName][key] = trimmed;
        let escaped = trimmed.replace(/'/g, "\\'");
        
        totalModifications++;
        return `>{t('${pageName}.${key}', '${escaped}')}<`;
    });

    // Replace placeholder
    content = content.replace(/placeholder="([^"]+)"/g, (match, text) => {
        let trimmed = text.trim();
        if (!trimmed || !/[a-zA-Z]/.test(trimmed)) return match;

        let key = generateKey(trimmed, 'Placeholder');
        if (!key) return match;
        
        globalTranslations[pageName][key] = trimmed;
        let escaped = trimmed.replace(/'/g, "\\'");
        
        totalModifications++;
        return `placeholder={t('${pageName}.${key}', '${escaped}')}`;
    });

    if (modified) {
        fs.writeFileSync(fullPath, content);
    }
});

fs.writeFileSync('./extracted_translations.json', JSON.stringify(globalTranslations, null, 2));
console.log(`Processed ${files.length} files. Made ${totalModifications} text replacements.`);
