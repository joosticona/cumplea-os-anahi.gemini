// Interactividad de Cumpleaños para Anahí:
// 1. Melodía de "Feliz Cumpleaños" sintetizada con Web Audio API (sin depender de archivos mp3 externos)
// 2. Soplar las velas (con botón, toque en cada vela o soplando al micrófono)
// 3. Efectos de partículas y lluvia de confeti en tonos Azul, Morado y Lila

document.addEventListener('DOMContentLoaded', () => {
  const welcomeOverlay = document.getElementById('welcome-overlay');
  const startBtn = document.getElementById('start-celebration-btn');
  const playSongBtn = document.getElementById('play-song-btn');
  const musicToggleBtn = document.getElementById('music-toggle');
  const musicLabel = document.getElementById('music-label');
  const blowBtn = document.getElementById('blow-candles-btn');
  const micBlowBtn = document.getElementById('mic-blow-btn');
  const relightBtn = document.getElementById('relight-candles-btn');
  const wishStatus = document.getElementById('wish-status');
  const candles = Array.from(document.querySelectorAll('.candle'));
  const momentCards = Array.from(document.querySelectorAll('.moment-card'));
  const toggleLetterBtn = document.getElementById('toggle-letter-btn');
  const letterPaper = document.getElementById('letter-paper');

  // --- WEB AUDIO API: Melodía de Feliz Cumpleaños ---
  let audioCtx = null;
  let isPlayingMelody = false;
  let melodyTimeouts = [];

  // Notas de "Feliz Cumpleaños" (Frecuencia en Hz y duración en segundos)
  const happyBirthdayNotes = [
    { f: 261.63, d: 0.35 },
    { f: 261.63, d: 0.25 },
    { f: 293.66, d: 0.55 },
    { f: 261.63, d: 0.55 },
    { f: 349.23, d: 0.55 },
    { f: 329.63, d: 0.95 },
    { f: 261.63, d: 0.35 },
    { f: 261.63, d: 0.25 },
    { f: 293.66, d: 0.55 },
    { f: 261.63, d: 0.55 },
    { f: 392.0, d: 0.55 },
    { f: 349.23, d: 0.95 },
    { f: 261.63, d: 0.35 },
    { f: 261.63, d: 0.25 },
    { f: 523.25, d: 0.55 },
    { f: 440.0, d: 0.55 },
    { f: 349.23, d: 0.55 },
    { f: 329.63, d: 0.55 },
    { f: 293.66, d: 0.85 },
    { f: 466.16, d: 0.35 },
    { f: 466.16, d: 0.25 },
    { f: 440.0, d: 0.55 },
    { f: 349.23, d: 0.55 },
    { f: 392.0, d: 0.55 },
    { f: 349.23, d: 1.1 },
  ];

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playBellNote(freq, duration, startTime) {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const subOsc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'triangle';
    subOsc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);
    subOsc.frequency.setValueAtTime(freq * 2, startTime); // Armónico suave tipo cajita musical

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.exponentialRampToValueAtTime(0.22, startTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    subOsc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(startTime);
    subOsc.start(startTime);
    osc.stop(startTime + duration + 0.05);
    subOsc.stop(startTime + duration + 0.05);
  }

  function stopMelody() {
    melodyTimeouts.forEach((t) => clearTimeout(t));
    melodyTimeouts = [];
    isPlayingMelody = false;
    if (musicToggleBtn) musicToggleBtn.classList.remove('playing');
    if (musicLabel) musicLabel.textContent = 'Tocar melodía 🎵';
  }

  function playBirthdayMelody() {
    initAudio();
    if (isPlayingMelody) {
      stopMelody();
      return;
    }
    isPlayingMelody = true;
    if (musicToggleBtn) musicToggleBtn.classList.add('playing');
    if (musicLabel) musicLabel.textContent = 'Sonando: Feliz Cumpleaños 🎶';

    let offset = 0;
    const now = audioCtx.currentTime + 0.05;

    happyBirthdayNotes.forEach((note) => {
      playBellNote(note.f, note.d, now + offset);
      offset += note.d + 0.07;
    });

    const endTimeout = setTimeout(() => {
      isPlayingMelody = false;
      if (musicToggleBtn) musicToggleBtn.classList.remove('playing');
      if (musicLabel) musicLabel.textContent = 'Repetir melodía 🎵';
    }, offset * 1000);

    melodyTimeouts.push(endTimeout);
  }

  // Sonido mágico al apagar velas
  function playWishChime() {
    initAudio();
    const chord = [523.25, 659.25, 783.99, 1046.5];
    const now = audioCtx.currentTime;
    chord.forEach((freq, i) => {
      playBellNote(freq, 0.8, now + i * 0.12);
    });
  }

  // --- CONFETI EN AZUL, MORADO Y LILA ---
  const confettiCanvas = document.getElementById('confetti-canvas');
  const cCtx = confettiCanvas.getContext('2d');
  let confettiPieces = [];

  function resizeCanvases() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
  }

  function launchConfetti(count = 95) {
    const palette = ['#2563eb', '#60a5fa', '#7c3aed', '#a855f7', '#c084fc', '#e9d5ff', '#fde047'];
    for (let i = 0; i < count; i++) {
      confettiPieces.push({
        x: window.innerWidth / 2 + (Math.random() - 0.5) * 260,
        y: window.innerHeight * 0.45,
        vx: (Math.random() - 0.5) * 12,
        vy: -Math.random() * 12 - 4,
        size: Math.random() * 8 + 5,
        color: palette[Math.floor(Math.random() * palette.length)],
        rotation: Math.random() * 360,
        vr: (Math.random() - 0.5) * 10,
        alpha: 1,
      });
    }
  }

  function updateConfetti() {
    cCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confettiPieces.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.26; // gravedad suave
      p.rotation += p.vr;
      p.alpha -= 0.006;

      cCtx.save();
      cCtx.globalAlpha = Math.max(0, p.alpha);
      cCtx.translate(p.x, p.y);
      cCtx.rotate((p.rotation * Math.PI) / 180);
      cCtx.fillStyle = p.color;
      cCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.65);
      cCtx.restore();
    });
    confettiPieces = confettiPieces.filter((p) => p.alpha > 0 && p.y < confettiCanvas.height + 30);
    requestAnimationFrame(updateConfetti);
  }

  // --- PARTÍCULAS DE FONDO ---
  const bgCanvas = document.getElementById('bg-canvas');
  const bCtx = bgCanvas.getContext('2d');
  const stars = Array.from({ length: 48 }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: Math.random() * 2.5 + 1,
    vy: -Math.random() * 0.4 - 0.15,
    color: ['#93c5fd', '#c084fc', '#e9d5ff'][Math.floor(Math.random() * 3)],
  }));

  function animateStars() {
    bCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    stars.forEach((s) => {
      s.y += s.vy;
      if (s.y < -10) {
        s.y = bgCanvas.height + 10;
        s.x = Math.random() * bgCanvas.width;
      }
      bCtx.beginPath();
      bCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      bCtx.fillStyle = s.color;
      bCtx.shadowBlur = 10;
      bCtx.shadowColor = s.color;
      bCtx.fill();
    });
    requestAnimationFrame(animateStars);
  }

  resizeCanvases();
  window.addEventListener('resize', resizeCanvases);
  updateConfetti();
  animateStars();

  // --- LÓGICA DE LAS VELAS ---
  function checkAllCandlesOut() {
    const allOut = candles.every((c) => c.classList.contains('out'));
    if (allOut) {
      wishStatus.textContent =
        '✨ ¡Deseo pedido! Que este cumpleaños sea el más hermoso de todos, mi Anahí 💜💙';
      launchConfetti(120);
      playWishChime();
    } else {
      const remaining = candles.filter((c) => !c.classList.contains('out')).length;
      wishStatus.textContent = `Faltan ${remaining} velita(s) por apagar... ¡Sigue soplando! 🌬️`;
    }
  }

  function blowAllCandles() {
    candles.forEach((candle, idx) => {
      setTimeout(() => {
        candle.classList.add('out');
        if (idx === candles.length - 1) {
          checkAllCandlesOut();
        }
      }, idx * 140);
    });
  }

  candles.forEach((candle) => {
    candle.addEventListener('click', () => {
      if (!candle.classList.contains('out')) {
        candle.classList.add('out');
        checkAllCandlesOut();
      }
    });
  });

  if (blowBtn) {
    blowBtn.addEventListener('click', blowAllCandles);
  }

  if (relightBtn) {
    relightBtn.addEventListener('click', () => {
      candles.forEach((c) => c.classList.remove('out'));
      wishStatus.textContent = 'Pide un deseo con todo el corazón y apaga las velitas 🎂';
    });
  }

  // Opción de soplar usando el micrófono
  if (micBlowBtn) {
    micBlowBtn.addEventListener('click', async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        initAudio();
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        const data = new Uint8Array(analyser.frequencyBinCount);

        wishStatus.textContent = '🎙️ ¡Sopla fuerte hacia tu micrófono ahora!';

        const listenBlow = () => {
          analyser.getByteFrequencyData(data);
          const avg = data.reduce((a, b) => a + b, 0) / data.length;
          if (avg > 42) {
            blowAllCandles();
            stream.getTracks().forEach((t) => t.stop());
          } else if (!candles.every((c) => c.classList.contains('out'))) {
            requestAnimationFrame(listenBlow);
          }
        };
        listenBlow();
      } catch (err) {
        // Si no da permiso de micrófono, apaga las velas suavemente igual
        blowAllCandles();
      }
    });
  }

  // --- EVENTOS DE BOTONES PRINCIPALES ---
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      welcomeOverlay.classList.add('hidden');
      launchConfetti(110);
      playBirthdayMelody();
    });
  }

  if (playSongBtn) {
    playSongBtn.addEventListener('click', () => {
      launchConfetti(80);
      playBirthdayMelody();
    });
  }

  if (musicToggleBtn) {
    musicToggleBtn.addEventListener('click', playBirthdayMelody);
  }

  // Tarjetas interactivas de gustos y recuerdos
  momentCards.forEach((card) => {
    card.addEventListener('click', () => {
      card.classList.toggle('active');
      launchConfetti(25);
    });
  });

  // Abrir/cerrar carta
  if (toggleLetterBtn && letterPaper) {
    toggleLetterBtn.addEventListener('click', () => {
      const isOpen = letterPaper.classList.toggle('open');
      toggleLetterBtn.textContent = isOpen ? 'Guardar carta 💌' : 'Leer tu carta de cumpleaños 💌';
      if (isOpen) {
        launchConfetti(60);
      }
    });
  }
});
