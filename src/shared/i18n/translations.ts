export type Locale = 'en' | 'es' | 'ru';

export interface Translations {
  // HUD
  score: string;
  hi: string;
  lives: string;
  level: string;
  downloadCv: string;
  cvLocked: string;
  imInAHurry: string;
  sndOn: string;
  sndOff: string;

  // Footer
  role: string;
  experience: string;
  inspiredBy: string;

  // GamePage rotate overlay
  rotateHint: string;

  // Canvas overlay
  gameOver: string;
  pressSpaceRestart: string;
  levelComplete: (level: number) => string;
  pressSpaceNextLevel: string;
  pressUpToLaunch: string;
  builtBy: string;

  // Engine power-ups
  balls: (n: number) => string;
  widen: (seconds: number) => string;

  // Leaderboard
  leaderboard: string;
  enterName: string;
  submit: string;
  rank: string;
  player: string;
  noScores: string;
  yourScore: string;
  close: string;

  // Text wall
  textWallPhrases: string[];
}

const en: Translations = {
  score: 'SCORE',
  hi: 'HI',
  lives: 'LIVES',
  level: 'LEVEL',
  downloadCv: 'DOWNLOAD CV',
  cvLocked: 'CV LOCKED \u2014 complete level 1',
  imInAHurry: "i'm in a hurry",
  sndOn: 'SND ON',
  sndOff: 'SND OFF',

  role: 'Senior Frontend Developer',
  experience: '9+ yrs',
  inspiredBy: 'Inspired by',

  rotateHint: 'Rotate your device to play',

  gameOver: 'GAME OVER',
  pressSpaceRestart: 'Press SPACE or tap to restart',
  levelComplete: (level) => `LEVEL ${level} COMPLETE`,
  pressSpaceNextLevel: 'Press SPACE or tap for next level',
  pressUpToLaunch: 'Press UP / tap to launch the glyph',
  builtBy: 'Built by Anton Kovalev',

  balls: (n) => `${n} BALLS`,
  widen: (s) => `WIDEN ${s}s`,

  leaderboard: 'LEADERBOARD',
  enterName: 'Enter your name',
  submit: 'SUBMIT',
  rank: '#',
  player: 'PLAYER',
  noScores: 'No scores yet',
  yourScore: 'YOUR SCORE',
  close: 'CLOSE',

  textWallPhrases: [
    'Anton Kovalev Senior Frontend Developer 9+ years React Next.js TypeScript Migrated React application to Next.js App Router Implemented translations for 50+ countries Developed caching system with SWR reducing server load by 35% Created reusable UI-kit components Optimized build time from 85 to 26 seconds',
    'Launched MVP mobile app from scratch using React Native Expo Integrated Airtable API Implemented push notifications and authentication Kanban board with custom drag-and-drop infinite scrolling sorting filtering Custom file uploader with carousel deployed in 7+ applications Enhancing test coverage and onboarding',
    'Optimized React interfaces with hooks Reduced delivery by 20% through e2e testing Decreased bundle size by 25% improved page load by 30% Boosted client engagement by 140% Reduced bug rate by 30% transitioning to TypeScript Educational platform with React Redux Team lead managing Scrum daily code reviews',
  ],
};

const es: Translations = {
  score: 'PUNTOS',
  hi: 'MAX',
  lives: 'VIDAS',
  level: 'NIVEL',
  downloadCv: 'DESCARGAR CV',
  cvLocked: 'CV BLOQUEADO \u2014 completa nivel 1',
  imInAHurry: 'tengo prisa',
  sndOn: 'SON ON',
  sndOff: 'SON OFF',

  role: 'Desarrollador Frontend Senior',
  experience: '9+ a\u00f1os',
  inspiredBy: 'Inspirado por',

  rotateHint: 'Gira tu dispositivo para jugar',

  gameOver: 'FIN DEL JUEGO',
  pressSpaceRestart: 'Presiona ESPACIO o toca para reiniciar',
  levelComplete: (level) => `NIVEL ${level} COMPLETO`,
  pressSpaceNextLevel: 'Presiona ESPACIO o toca para siguiente nivel',
  pressUpToLaunch: 'Presiona ARRIBA o toca para lanzar',
  builtBy: 'Hecho por Anton Kovalev',

  balls: (n) => `${n} BOLAS`,
  widen: (s) => `ANCHO ${s}s`,

  leaderboard: 'CLASIFICACI\u00d3N',
  enterName: 'Ingresa tu nombre',
  submit: 'ENVIAR',
  rank: '#',
  player: 'JUGADOR',
  noScores: 'Sin puntajes a\u00fan',
  yourScore: 'TU PUNTAJE',
  close: 'CERRAR',

  textWallPhrases: [
    'Anton Kovalev Desarrollador Frontend Senior 9+ a\u00f1os React Next.js TypeScript Migr\u00f3 aplicaci\u00f3n React a Next.js App Router Implement\u00f3 traducciones para 50+ pa\u00edses Desarroll\u00f3 sistema de cach\u00e9 con SWR reduciendo carga del servidor en 35% Cre\u00f3 componentes UI-kit reutilizables Optimiz\u00f3 tiempo de build de 85 a 26 segundos',
    'Lanz\u00f3 MVP de app m\u00f3vil desde cero usando React Native Expo Integr\u00f3 Airtable API Implement\u00f3 notificaciones push y autenticaci\u00f3n Tablero Kanban con drag-and-drop personalizado scroll infinito ordenamiento filtrado Cargador de archivos con carrusel desplegado en 7+ aplicaciones Mejorando cobertura de tests',
    'Optimiz\u00f3 interfaces React con hooks Redujo entrega en 20% con testing e2e Redujo tama\u00f1o del bundle en 25% mejor\u00f3 carga de p\u00e1gina en 30% Aument\u00f3 engagement de clientes en 140% Redujo tasa de bugs en 30% migrando a TypeScript Plataforma educativa con React Redux L\u00edder de equipo gestionando Scrum revisiones diarias de c\u00f3digo',
  ],
};

const ru: Translations = {
  score: '\u0421\u0427\u0401\u0422',
  hi: '\u0420\u0415\u041a',
  lives: '\u0416\u0418\u0417\u041d\u0418',
  level: '\u0423\u0420\u041e\u0412\u0415\u041d\u042c',
  downloadCv: '\u0421\u041a\u0410\u0427\u0410\u0422\u042c CV',
  cvLocked: 'CV \u0437\u0430\u0431\u043b\u043e\u043a\u0438\u0440\u043e\u0432\u0430\u043d\u043e \u2014 \u043f\u0440\u043e\u0439\u0434\u0438 \u0443\u0440\u043e\u0432\u0435\u043d\u044c 1',
  imInAHurry: '\u043c\u043d\u0435 \u043d\u0435\u043a\u043e\u0433\u0434\u0430',
  sndOn: '\u0417\u0412\u0423\u041a \u0412\u041a\u041b',
  sndOff: '\u0417\u0412\u0423\u041a \u0412\u042b\u041a\u041b',

  role: '\u0421\u0442\u0430\u0440\u0448\u0438\u0439 \u0444\u0440\u043e\u043d\u0442\u0435\u043d\u0434-\u0440\u0430\u0437\u0440\u0430\u0431\u043e\u0442\u0447\u0438\u043a',
  experience: '9+ \u043b\u0435\u0442',
  inspiredBy: '\u0412\u0434\u043e\u0445\u043d\u043e\u0432\u043b\u0451\u043d',

  rotateHint: '\u041f\u043e\u0432\u0435\u0440\u043d\u0438 \u0443\u0441\u0442\u0440\u043e\u0439\u0441\u0442\u0432\u043e \u0434\u043b\u044f \u0438\u0433\u0440\u044b',

  gameOver: '\u0418\u0413\u0420\u0410 \u041e\u041a\u041e\u041d\u0427\u0415\u041d\u0410',
  pressSpaceRestart: '\u041d\u0430\u0436\u043c\u0438 \u041f\u0420\u041e\u0411\u0415\u041b \u0438\u043b\u0438 \u043a\u043e\u0441\u043d\u0438\u0441\u044c \u0434\u043b\u044f \u0440\u0435\u0441\u0442\u0430\u0440\u0442\u0430',
  levelComplete: (level) => `\u0423\u0420\u041e\u0412\u0415\u041d\u042c ${level} \u041f\u0420\u041e\u0419\u0414\u0415\u041d`,
  pressSpaceNextLevel: '\u041d\u0430\u0436\u043c\u0438 \u041f\u0420\u041e\u0411\u0415\u041b \u0438\u043b\u0438 \u043a\u043e\u0441\u043d\u0438\u0441\u044c \u0434\u043b\u044f \u0441\u043b\u0435\u0434\u0443\u044e\u0449\u0435\u0433\u043e \u0443\u0440\u043e\u0432\u043d\u044f',
  pressUpToLaunch: '\u041d\u0430\u0436\u043c\u0438 \u0412\u0412\u0415\u0420\u0425 \u0438\u043b\u0438 \u043a\u043e\u0441\u043d\u0438\u0441\u044c \u0434\u043b\u044f \u0437\u0430\u043f\u0443\u0441\u043a\u0430',
  builtBy: '\u0421\u043e\u0437\u0434\u0430\u043b \u0410\u043d\u0442\u043e\u043d \u041a\u043e\u0432\u0430\u043b\u0451\u0432',

  balls: (n) => `${n} \u0428\u0410\u0420\u041e\u0412`,
  widen: (s) => `\u0428\u0418\u0420\u0415 ${s}\u0441`,

  leaderboard: '\u0422\u0410\u0411\u041b\u0418\u0426\u0410 \u041b\u0418\u0414\u0415\u0420\u041e\u0412',
  enterName: '\u0412\u0432\u0435\u0434\u0438 \u0438\u043c\u044f',
  submit: '\u041e\u0422\u041f\u0420\u0410\u0412\u0418\u0422\u042c',
  rank: '#',
  player: '\u0418\u0413\u0420\u041e\u041a',
  noScores: '\u041f\u043e\u043a\u0430 \u043d\u0435\u0442 \u0440\u0435\u0437\u0443\u043b\u044c\u0442\u0430\u0442\u043e\u0432',
  yourScore: '\u0422\u0412\u041e\u0419 \u0421\u0427\u0401\u0422',
  close: '\u0417\u0410\u041a\u0420\u042b\u0422\u042c',

  textWallPhrases: [
    '\u0410\u043d\u0442\u043e\u043d \u041a\u043e\u0432\u0430\u043b\u0451\u0432 \u0421\u0442\u0430\u0440\u0448\u0438\u0439 \u0444\u0440\u043e\u043d\u0442\u0435\u043d\u0434-\u0440\u0430\u0437\u0440\u0430\u0431\u043e\u0442\u0447\u0438\u043a 9+ \u043b\u0435\u0442 React Next.js TypeScript \u041c\u0438\u0433\u0440\u0438\u0440\u043e\u0432\u0430\u043b React \u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u0435 \u043d\u0430 Next.js App Router \u0420\u0435\u0430\u043b\u0438\u0437\u043e\u0432\u0430\u043b \u043f\u0435\u0440\u0435\u0432\u043e\u0434\u044b \u0434\u043b\u044f 50+ \u0441\u0442\u0440\u0430\u043d \u0420\u0430\u0437\u0440\u0430\u0431\u043e\u0442\u0430\u043b \u0441\u0438\u0441\u0442\u0435\u043c\u0443 \u043a\u0435\u0448\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u044f \u0441 SWR \u0441\u043d\u0438\u0437\u0438\u0432 \u043d\u0430\u0433\u0440\u0443\u0437\u043a\u0443 \u0441\u0435\u0440\u0432\u0435\u0440\u0430 \u043d\u0430 35% \u0421\u043e\u0437\u0434\u0430\u043b UI-kit \u043a\u043e\u043c\u043f\u043e\u043d\u0435\u043d\u0442\u044b \u041e\u043f\u0442\u0438\u043c\u0438\u0437\u0438\u0440\u043e\u0432\u0430\u043b \u0441\u0431\u043e\u0440\u043a\u0443 \u0441 85 \u0434\u043e 26 \u0441\u0435\u043a\u0443\u043d\u0434',
    '\u0417\u0430\u043f\u0443\u0441\u0442\u0438\u043b MVP \u043c\u043e\u0431\u0438\u043b\u044c\u043d\u043e\u0435 \u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u0435 \u0441 \u043d\u0443\u043b\u044f \u043d\u0430 React Native Expo \u0418\u043d\u0442\u0435\u0433\u0440\u0438\u0440\u043e\u0432\u0430\u043b Airtable API \u0420\u0435\u0430\u043b\u0438\u0437\u043e\u0432\u0430\u043b push-\u0443\u0432\u0435\u0434\u043e\u043c\u043b\u0435\u043d\u0438\u044f \u0438 \u0430\u0432\u0442\u043e\u0440\u0438\u0437\u0430\u0446\u0438\u044e Kanban-\u0434\u043e\u0441\u043a\u0430 \u0441 drag-and-drop \u0431\u0435\u0441\u043a\u043e\u043d\u0435\u0447\u043d\u044b\u0439 \u0441\u043a\u0440\u043e\u043b\u043b \u0441\u043e\u0440\u0442\u0438\u0440\u043e\u0432\u043a\u0430 \u0444\u0438\u043b\u044c\u0442\u0440\u0430\u0446\u0438\u044f \u0417\u0430\u0433\u0440\u0443\u0437\u0447\u0438\u043a \u0444\u0430\u0439\u043b\u043e\u0432 \u0441 \u043a\u0430\u0440\u0443\u0441\u0435\u043b\u044c\u044e \u0440\u0430\u0437\u0432\u0451\u0440\u043d\u0443\u0442 \u0432 7+ \u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u044f\u0445 \u0423\u043b\u0443\u0447\u0448\u0435\u043d\u0438\u0435 \u043f\u043e\u043a\u0440\u044b\u0442\u0438\u044f \u0442\u0435\u0441\u0442\u0430\u043c\u0438',
    '\u041e\u043f\u0442\u0438\u043c\u0438\u0437\u0438\u0440\u043e\u0432\u0430\u043b React-\u0438\u043d\u0442\u0435\u0440\u0444\u0435\u0439\u0441\u044b \u0441 hooks \u0421\u043e\u043a\u0440\u0430\u0442\u0438\u043b \u0434\u043e\u0441\u0442\u0430\u0432\u043a\u0443 \u043d\u0430 20% \u0447\u0435\u0440\u0435\u0437 e2e-\u0442\u0435\u0441\u0442\u044b \u0423\u043c\u0435\u043d\u044c\u0448\u0438\u043b \u0431\u0430\u043d\u0434\u043b \u043d\u0430 25% \u0443\u0441\u043a\u043e\u0440\u0438\u043b \u0437\u0430\u0433\u0440\u0443\u0437\u043a\u0443 \u043d\u0430 30% \u041f\u043e\u0432\u044b\u0441\u0438\u043b \u0432\u043e\u0432\u043b\u0435\u0447\u0451\u043d\u043d\u043e\u0441\u0442\u044c \u043a\u043b\u0438\u0435\u043d\u0442\u043e\u0432 \u043d\u0430 140% \u0421\u043d\u0438\u0437\u0438\u043b \u0447\u0430\u0441\u0442\u043e\u0442\u0443 \u0431\u0430\u0433\u043e\u0432 \u043d\u0430 30% \u043f\u0435\u0440\u0435\u0439\u0434\u044f \u043d\u0430 TypeScript \u041e\u0431\u0440\u0430\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044c\u043d\u0430\u044f \u043f\u043b\u0430\u0442\u0444\u043e\u0440\u043c\u0430 \u043d\u0430 React Redux \u041b\u0438\u0434\u0435\u0440 \u043a\u043e\u043c\u0430\u043d\u0434\u044b Scrum \u0435\u0436\u0435\u0434\u043d\u0435\u0432\u043d\u044b\u0435 \u0440\u0435\u0432\u044c\u044e \u043a\u043e\u0434\u0430',
  ],
};

export const translations: Record<Locale, Translations> = { en, es, ru };

export function getT(): Translations {
  const saved = localStorage.getItem('stackbreaker-locale') as Locale | null;
  const locale = saved && translations[saved] ? saved : 'en';
  return translations[locale];
}
