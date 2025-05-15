import fs from 'fs';
import path from 'path';

const languages = {};
const localesDir = path.join(__dirname, '../locales');

fs.readdirSync(localesDir).forEach(file => {
  if (file.endsWith('.json')) {
    const langCode = file.split('.')[0];
    languages[langCode] = JSON.parse(fs.readFileSync(path.join(localesDir, file), 'utf8'));
  }
});

export const getTranslation = (lang, key) => {
  return languages[lang] && languages[lang][key] ? languages[lang][key] : languages['ru'][key] || key;
};

export const getButtonText = (lang, buttonKey) => {
  return languages[lang] && languages[lang].buttons && languages[lang].buttons[buttonKey] ? languages[lang].buttons[buttonKey] : languages['ru'].buttons[buttonKey] || buttonKey;
};

export default languages; 