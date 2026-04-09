import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { translations, type Locale, type Translations } from './translations';

interface I18nContextValue {
  locale: Locale;
  t: Translations;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextValue>({
  locale: 'en',
  t: translations.en,
  setLocale: () => {},
});

function detectLocale(): Locale {
  const saved = localStorage.getItem('stackbreaker-locale') as Locale | null;
  if (saved && translations[saved]) return saved;
  const lang = navigator.language.slice(0, 2);
  if (lang === 'es') return 'es';
  if (lang === 'ru') return 'ru';
  return 'en';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(detectLocale);

  const setLocale = useCallback((l: Locale) => {
    localStorage.setItem('stackbreaker-locale', l);
    setLocaleState(l);
  }, []);

  return (
    <I18nContext.Provider value={{ locale, t: translations[locale], setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
