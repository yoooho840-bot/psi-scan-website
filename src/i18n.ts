import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationKO from './locales/ko/translation.json';
import translationEN from './locales/en/translation.json';

// Initialize i18next
const setupI18n = () => {
    // Check initial mode directly from localStorage or domain for the first load
    const saved = localStorage.getItem('appMode');
    let initialLang = 'en'; // default

    if (saved === 'KOREA') {
        initialLang = 'ko';
    } else if (saved === 'GLOBAL') {
        initialLang = 'en';
    } else {
        const hostname = window.location.hostname;
        initialLang = (hostname.includes('.kr') || hostname.includes('kr.')) ? 'ko' : 'en';
    }

    i18n
        .use(initReactI18next) // passes i18n down to react-i18next
        .init({
            resources: {
                en: {
                    translation: translationEN
                },
                ko: {
                    translation: translationKO
                }
            },
            lng: initialLang, // default language
            fallbackLng: 'en', // use en if translation is not found
            interpolation: {
                escapeValue: false // react already safes from xss
            }
        });

    return i18n;
};

// Listen for mode changes to switch language dynamically
window.addEventListener('appModeChanged', (e: any) => {
    if (e.detail && e.detail.mode) {
        i18n.changeLanguage(e.detail.mode === 'KOREA' ? 'ko' : 'en');
    }
});

export default setupI18n();
