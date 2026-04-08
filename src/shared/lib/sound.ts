const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;

let audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioCtx();
  }
  return audioCtx;
}

function playTone(frequency: number, duration: number, type: OscillatorType = 'square', volume = 0.1) {
  const ctx = getAudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime);
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

export function playBounceWall() {
  playTone(300, 0.05, 'square', 0.08);
}

export function playBouncePaddle() {
  playTone(500, 0.08, 'square', 0.1);
}

export function playWordHit() {
  playTone(800, 0.12, 'sine', 0.12);
}

export function playPowerUp() {
  playTone(600, 0.1, 'sine', 0.1);
  setTimeout(() => playTone(900, 0.15, 'sine', 0.1), 80);
}

export function playLifeLost() {
  playTone(200, 0.3, 'sawtooth', 0.1);
}

export function playGameOver() {
  playTone(400, 0.2, 'sawtooth', 0.08);
  setTimeout(() => playTone(300, 0.2, 'sawtooth', 0.08), 200);
  setTimeout(() => playTone(200, 0.4, 'sawtooth', 0.08), 400);
}

export function playLevelComplete() {
  playTone(500, 0.1, 'sine', 0.1);
  setTimeout(() => playTone(700, 0.1, 'sine', 0.1), 100);
  setTimeout(() => playTone(900, 0.2, 'sine', 0.1), 200);
}
