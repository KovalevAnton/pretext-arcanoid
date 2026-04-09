import { GamePage } from '@/pages/game/GamePage';
import { I18nProvider } from '@/shared/i18n';
import { Analytics } from '@vercel/analytics/react';

export function App() {
  return (
    <I18nProvider>
      <GamePage />
      <Analytics />
    </I18nProvider>
  );
}
