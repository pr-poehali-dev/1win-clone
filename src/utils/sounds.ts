const createOscillator = (frequency: number, duration: number, type: OscillatorType = 'sine') => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = frequency;
  oscillator.type = type;

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
};

export const playWinSound = () => {
  createOscillator(523.25, 0.1);
  setTimeout(() => createOscillator(659.25, 0.1), 100);
  setTimeout(() => createOscillator(783.99, 0.2), 200);
};

export const playJackpotSound = () => {
  createOscillator(523.25, 0.15);
  setTimeout(() => createOscillator(659.25, 0.15), 100);
  setTimeout(() => createOscillator(783.99, 0.15), 200);
  setTimeout(() => createOscillator(1046.50, 0.3), 300);
};

export const playBetSound = () => {
  createOscillator(440, 0.1, 'square');
};

export const playLoseSound = () => {
  createOscillator(200, 0.3, 'sawtooth');
};

export const playClickSound = () => {
  createOscillator(800, 0.05, 'square');
};

export const playCashoutSound = () => {
  createOscillator(659.25, 0.1);
  setTimeout(() => createOscillator(783.99, 0.15), 80);
  setTimeout(() => createOscillator(1046.50, 0.2), 160);
};

export const playSpinSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.setValueAtTime(100, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(1000, audioContext.currentTime + 0.5);
  oscillator.type = 'sawtooth';

  gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
};
