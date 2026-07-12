const fs = require('fs');

const extractData = JSON.parse(fs.readFileSync('./extracted_translations.json', 'utf8'));
const viTranslateData = JSON.parse(fs.readFileSync('./translated_vi.json', 'utf8'));

const enPath = './client/src/locales/en.json';
const viPath = './client/src/locales/vi.json';

const currentEn = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const currentVi = JSON.parse(fs.readFileSync(viPath, 'utf8'));

// Update English
for (const [page, keys] of Object.entries(extractData)) {
    if (!currentEn[page]) currentEn[page] = {};
    for (const [key, value] of Object.entries(keys)) {
        // filter out weird JSX fragments
        if (!key.includes('return') && !key.includes('map') && !key.includes('filtered')) {
            currentEn[page][key] = value;
        }
    }
}

// Update Vietnamese
for (const [page, keys] of Object.entries(viTranslateData)) {
    if (!currentVi[page]) currentVi[page] = {};
    for (const [key, value] of Object.entries(keys)) {
        if (!key.includes('return') && !key.includes('map') && !key.includes('filtered')) {
            currentVi[page][key] = value;
        }
    }
}

fs.writeFileSync(enPath, JSON.stringify(currentEn, null, 2));
fs.writeFileSync(viPath, JSON.stringify(currentVi, null, 2));

console.log('Locales updated successfully!');
