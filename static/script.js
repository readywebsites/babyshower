// ==========================================================================
// BABY SHOWER CELEBRATION - 60FPS INTERACTIVE JAVASCRIPT ENGINE
// ==========================================================================

// Global State & Settings
const defaultSettings = {
  coupleNames: "Rajil & Khushbu",
  celebrationType: "Baby Shower Celebration",
  culturalTitle: "શ્રીમંત સંસ્કાર / Shrimant Sanskar",
  eventDate: "2026-11-19T11:00",
  displayDate: "19th Nov 2026",
  displayTime: "11 AM onwards",
  venueName: "The Grand Murli",
  venueAddress: "Near Mahavir College, Vesu, Surat",
  boyVotes: 52,
  girlVotes: 48,
  hasVoted: false,
  userVote: null
};

function getSettings() {
  const urlParams = new URLSearchParams(window.location.search);
  const saved = localStorage.getItem('babyShowerSettings');
  let current = saved ? JSON.parse(saved) : { ...defaultSettings };

  if (urlParams.get('couple')) current.coupleNames = decodeURIComponent(urlParams.get('couple'));
  if (urlParams.get('venue')) current.venueName = decodeURIComponent(urlParams.get('venue'));
  if (urlParams.get('date')) current.displayDate = decodeURIComponent(urlParams.get('date'));
  if (urlParams.get('time')) current.displayTime = decodeURIComponent(urlParams.get('time'));

  return current;
}

let settings = getSettings();

// 1. Toast Notification Banner Helper
let toastTimer = null;
function showToast(msg) {
  const banner = document.getElementById('toastBanner');
  const textEl = document.getElementById('toastMessage');
  if (!banner || !textEl) return;
  textEl.textContent = msg;
  banner.classList.remove('opacity-0', 'translate-y-4');
  banner.classList.add('opacity-100', 'translate-y-0');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    banner.classList.remove('opacity-100', 'translate-y-0');
    banner.classList.add('opacity-0', 'translate-y-4');
  }, 3200);
}

// 2. Synthesized Sound Effects via Web Audio API (No audio assets required for clicks/chimes)
class SoundFX {
  constructor() {
    this.ctx = null;
  }
  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
  }
  playChime() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.15);
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.3);
      osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.45);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.9);
    } catch (e) {}
  }
  playToggleSound() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.18);
    } catch (e) {}
  }
}
const sfx = new SoundFX();

// 3. Background Music Player Control
const bgMusic = document.getElementById('bg-music');
const musicToggleBtn = document.getElementById('music-toggle-btn');
const soundVisualizer = document.getElementById('sound-visualizer');
let isMusicPlaying = false;

function toggleMusic() {
  if (!bgMusic) return;
  sfx.init();
  if (isMusicPlaying) {
    bgMusic.pause();
    isMusicPlaying = false;
    if (soundVisualizer) soundVisualizer.classList.add('paused');
    if (musicToggleBtn) musicToggleBtn.setAttribute('aria-label', 'Play Background Music');
  } else {
    bgMusic.play().then(() => {
      isMusicPlaying = true;
      if (soundVisualizer) soundVisualizer.classList.remove('paused');
      if (musicToggleBtn) musicToggleBtn.setAttribute('aria-label', 'Pause Background Music');
    }).catch(err => {
      console.log('Autoplay restriction:', err);
    });
  }
}

if (musicToggleBtn) {
  musicToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMusic();
  });
}

// User first gesture unlocks audio
let firstGesture = true;
function handleFirstGesture() {
  if (firstGesture) {
    firstGesture = false;
    sfx.init();
    if (bgMusic && bgMusic.paused) {
      bgMusic.volume = 0.55;
      bgMusic.play().then(() => {
        isMusicPlaying = true;
        if (soundVisualizer) soundVisualizer.classList.remove('paused');
      }).catch(() => {});
    }
    document.removeEventListener('click', handleFirstGesture);
    document.removeEventListener('touchstart', handleFirstGesture);
  }
}
document.addEventListener('click', handleFirstGesture);
document.addEventListener('touchstart', handleFirstGesture);

// 4. Soft Drifting Rose Petals Canvas
function initPetalsCanvas() {
  const canvas = document.getElementById('petals-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const petals = [];
  const colors = [
    'rgba(244, 114, 182, 0.7)',
    'rgba(251, 207, 232, 0.7)',
    'rgba(250, 204, 21, 0.65)',
    'rgba(249, 115, 22, 0.65)',
    'rgba(212, 175, 55, 0.7)'
  ];

  for (let i = 0; i < 28; i++) {
    petals.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 8 + 6,
      speedY: Math.random() * 1.2 + 0.6,
      speedX: Math.random() * 1.4 - 0.7,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.03,
      color: colors[Math.floor(Math.random() * colors.length)],
      sway: Math.random() * 2
    });
  }

  function render() {
    ctx.clearRect(0, 0, width, height);
    for (let p of petals) {
      p.y += p.speedY;
      p.x += Math.sin(p.y * 0.01 + p.sway) * 0.8 + p.speedX;
      p.rotation += p.rotationSpeed;

      if (p.y > height + 20) {
        p.y = -20;
        p.x = Math.random() * width;
      }
      if (p.x > width + 20) p.x = -20;
      if (p.x < -20) p.x = width + 20;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(p.size, -p.size, p.size * 1.5, p.size, 0, p.size * 1.8);
      ctx.bezierCurveTo(-p.size * 1.5, p.size, -p.size, -p.size, 0, 0);
      ctx.fill();
      ctx.restore();
    }
    requestAnimationFrame(render);
  }
  render();
}

// 5. Drifting Hero Rose Petals Particles
function initHeroParticles() {
  const container = document.getElementById('heroParticles');
  if (!container) return;
  const petalColors = ['#F472B6', '#FBCFE8', '#D4AF37', '#FBBF24'];
  for (let i = 0; i < 16; i++) {
    const petal = document.createElement('span');
    const size = 8 + (i % 4) * 3;
    const left = (i * 6.5) % 96;
    const duration = 6.5 + (i % 5) * 1.4;
    const delay = (i * 0.6) % 5;
    const color = petalColors[i % petalColors.length];

    petal.className = 'petal-particle absolute rounded-tl-full rounded-br-full';
    petal.style.width = `${size}px`;
    petal.style.height = `${size * 0.72}px`;
    petal.style.left = `${left}%`;
    petal.style.top = `${(i % 3) * 18}%`;
    petal.style.backgroundColor = color;
    petal.style.opacity = '0.75';
    petal.style.animationDuration = `${duration}s`;
    petal.style.animationDelay = `${delay}s`;
    container.appendChild(petal);
  }
}

// 6. Live Event Countdown Timer (Nov 19, 2026, 11:00 AM IST)
function initCountdown() {
  const daysEl = document.getElementById('cdDays');
  const hoursEl = document.getElementById('cdHours');
  const minsEl = document.getElementById('cdMins');
  const secsEl = document.getElementById('cdSecs');

  if (!daysEl) return;

  function update() {
    const target = new Date(settings.eventDate || "2026-11-19T11:00:00+05:30").getTime();
    const now = Date.now();
    const diff = Math.max(0, target - now);

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);

    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minsEl.textContent = String(mins).padStart(2, '0');
    secsEl.textContent = String(secs).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

// 7. Hero Video Scroll-Based Scrubbing (Front & Back Play with Optimized Responsive Loading)
function initHeroVideoScrub() {
  const desktopVid = document.getElementById('heroVideoDesktop');
  const mobileVid = document.getElementById('heroVideoMobile');
  if (!desktopVid && !mobileVid) return;

  function getActiveVideo() {
    const isMobile = window.innerWidth < 768;
    return isMobile ? mobileVid : desktopVid;
  }

  function activateVideo(vid) {
    if (!vid) return;
    if (vid.preload !== 'auto') {
      vid.preload = 'auto';
    }
    vid.muted = true;
    vid.playsInline = true;
    if (vid.paused && vid.readyState < 1) {
      vid.load();
    }
  }

  // Only load and buffer the active video for the detected viewport (saves 50%+ bandwidth)
  const initialActive = getActiveVideo();
  if (initialActive) {
    activateVideo(initialActive);
  }

  // Smooth seek throttle to prevent decoder backpressure during rapid scrolling
  let isSeeking = false;
  let nextSeekTime = null;

  function performSeek(vid, targetTime) {
    if (!vid || isNaN(vid.duration) || vid.duration <= 0) return;
    if (Math.abs(vid.currentTime - targetTime) < 0.02) return;

    if (isSeeking || vid.seeking) {
      nextSeekTime = targetTime;
      return;
    }

    isSeeking = true;
    vid.currentTime = targetTime;
  }

  function onSeekFinished() {
    isSeeking = false;
    if (nextSeekTime !== null) {
      const t = nextSeekTime;
      nextSeekTime = null;
      const active = getActiveVideo();
      if (active) performSeek(active, t);
    }
  }

  [desktopVid, mobileVid].forEach(vid => {
    if (!vid) return;
    vid.muted = true;
    vid.playsInline = true;
    vid.addEventListener('seeked', onSeekFinished);
    vid.addEventListener('loadedmetadata', () => {
      vid.currentTime = 0;
      vid.pause();
    });
  });

  let ticking = false;

  function updateVideoScrub() {
    const isMobile = window.innerWidth < 768;
    const activeVid = isMobile ? mobileVid : desktopVid;

    if (!activeVid) {
      ticking = false;
      return;
    }

    if (activeVid.preload !== 'auto') {
      activateVideo(activeVid);
    }

    if (isNaN(activeVid.duration) || activeVid.duration <= 0) {
      ticking = false;
      return;
    }

    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    // Scrub range: over the hero scroll runway (~550px mobile, ~700px desktop)
    const scrubRange = isMobile ? 550 : 700;
    const progress = Math.min(1, Math.max(0, scrollY / scrubRange));
    const targetTime = progress * activeVid.duration;

    performSeek(activeVid, targetTime);
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateVideoScrub);
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener('touchmove', () => {
    if (!ticking) {
      requestAnimationFrame(updateVideoScrub);
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', () => {
    const active = getActiveVideo();
    if (active) activateVideo(active);
    if (!ticking) {
      requestAnimationFrame(updateVideoScrub);
      ticking = true;
    }
  });

  // Initial calculation
  updateVideoScrub();
}

// 7b. Family Photos Scroll-Based Mode Switch (Front & Back, on Mobiles & Desktop)
// No buttons or mode text required; purely scroll-driven!
let isTimeParPose = false;

function setFamilyPose(timeParActive) {
  isTimeParPose = timeParActive;
  const namasteEls = document.querySelectorAll('.pose-namaste');
  const timeParEls = document.querySelectorAll('.pose-timepar');
  const timeParWord = document.getElementById('timeParHeadline');
  const card1 = document.getElementById('cardDadaDadi');
  const card2 = document.getElementById('cardChachuChachi');

  if (timeParWord) {
    if (isTimeParPose) {
      timeParWord.classList.add('active');
    } else {
      timeParWord.classList.remove('active');
    }
  }

  if (card1) {
    if (isTimeParPose) card1.classList.add('time-par-glow');
    else card1.classList.remove('time-par-glow');
  }
  if (card2) {
    if (isTimeParPose) card2.classList.add('time-par-glow');
    else card2.classList.remove('time-par-glow');
  }

  if (isTimeParPose) {
    namasteEls.forEach(el => {
      el.classList.remove('pose-visible');
      el.classList.add('pose-hidden');
    });
    timeParEls.forEach(el => {
      el.classList.remove('pose-hidden');
      el.classList.add('pose-visible');
    });
  } else {
    timeParEls.forEach(el => {
      el.classList.remove('pose-visible');
      el.classList.add('pose-hidden');
    });
    namasteEls.forEach(el => {
      el.classList.remove('pose-hidden');
      el.classList.add('pose-visible');
    });
  }
}

function initFamilyScrollTrigger() {
  const familySec = document.getElementById('family');
  const triggerSec = document.getElementById('familySectionTrigger') || familySec;
  const card1 = document.getElementById('cardDadaDadi');
  if (!familySec && !triggerSec) return;

  let isMastiActive = false;
  let ticking = false;

  function evaluateFamilyScroll() {
    const sec = familySec || triggerSec;
    const secRect = sec.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;

    // If completely above or below screen:
    if (secRect.bottom < 0 || secRect.top > vh) {
      if (isMastiActive) {
        isMastiActive = false;
        setFamilyPose(false);
      }
      ticking = false;
      return;
    }

    // Midway trigger calculation:
    // When scrolling down, keep in Namaste mode while entering so guests clearly see Namaste.
    // Trigger Masti mode only when scrolled midway through the section/cards!
    let triggerMasti = false;
    let triggerNamaste = false;

    if (card1) {
      const cRect = card1.getBoundingClientRect();
      const cardCenter = cRect.top + (cRect.height * 0.5);

      // Masti triggers when card center reaches middle of viewport (or card top <= 38% vh)
      // AND section hasn't scrolled completely off
      if ((cardCenter <= vh * 0.52 || cRect.top <= vh * 0.38) && secRect.bottom >= vh * 0.20) {
        triggerMasti = true;
      }

      // Reset to Namaste when scrolling back up so card center drops below 62% vh
      if (cardCenter > vh * 0.62 && cRect.top > vh * 0.48) {
        triggerNamaste = true;
      }
    } else {
      // Fallback based on section midpoint
      const secMidpoint = secRect.top + (secRect.height * 0.5);
      if (secMidpoint <= vh * 0.52 && secRect.bottom >= vh * 0.20) {
        triggerMasti = true;
      }
      if (secMidpoint > vh * 0.65) {
        triggerNamaste = true;
      }
    }

    if (triggerMasti && !isMastiActive) {
      isMastiActive = true;
      setFamilyPose(true);
    } else if (triggerNamaste && isMastiActive) {
      isMastiActive = false;
      setFamilyPose(false);
    }

    ticking = false;
  }

  // Bind scroll, touchmove and resize listeners
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(evaluateFamilyScroll);
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener('touchmove', () => {
    if (!ticking) {
      requestAnimationFrame(evaluateFamilyScroll);
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', () => {
    if (!ticking) {
      requestAnimationFrame(evaluateFamilyScroll);
      ticking = true;
    }
  });

  // Ensure initial Namaste state on load
  setFamilyPose(false);
  evaluateFamilyScroll();
}

// Graceful Parallax Engine (Hero section parallax completely removed as requested)
function initGracefulParallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return; // Respect accessibility preference
  }

  const venueImg = document.getElementById('venueParallaxImg');
  const mapContainer = document.getElementById('mapParallaxContainer');

  let ticking = false;

  function onParallaxScroll() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    const windowH = window.innerHeight;

    // 1. Section 2 Venue stage photo depth shift
    if (venueImg) {
      const rect = venueImg.getBoundingClientRect();
      if (rect.top < windowH && rect.bottom > 0) {
        const offset = (windowH - rect.top) * 0.05;
        venueImg.style.transform = `translate3d(0, ${Math.round(offset - 12)}px, 0) scale(1.02)`;
      }
    }

    // 2. Section 5 3D Isometric Map floating depth shift
    if (mapContainer) {
      const rect = mapContainer.getBoundingClientRect();
      if (rect.top < windowH && rect.bottom > 0) {
        const offset = (windowH - rect.top) * 0.04;
        mapContainer.style.transform = `translate3d(0, ${Math.round(offset - 10)}px, 0)`;
      }
    }

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(onParallaxScroll);
      ticking = true;
    }
  }, { passive: true });

  onParallaxScroll();
}

// 8. Intersection Observer for Scroll Reveals
function initScrollObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));
}

// 9. Interactive "Boy or Girl?" Poll with Live API & LocalStorage
const POLL_STORAGE_KEY = 'rk_babyshower_poll_v2';
let selectedChoice = null;
let pollState = {
  boyVotes: 0,
  girlVotes: 0,
  userVoted: null
};

function loadPollState() {
  // 1. Load local selection if already voted on this device
  try {
    const saved = localStorage.getItem(POLL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.userVoted) {
        pollState.userVoted = parsed.userVoted;
        selectedChoice = parsed.userVoted;
        highlightCard(selectedChoice);
      }
    }
  } catch (e) {}

  // 2. Fetch live counts from server API (SQLite)
  fetch('/api/poll')
    .then(res => res.ok ? res.json() : Promise.reject())
    .then(data => {
      if (data && typeof data.boy === 'number' && typeof data.girl === 'number') {
        pollState.boyVotes = data.boy;
        pollState.girlVotes = data.girl;
      }
      renderPollResults(false);
    })
    .catch(() => {
      // Fallback to local state if offline
      renderPollResults(false);
    });
}

function highlightCard(choice) {
  const cardBoy = document.getElementById('cardBoy');
  const cardGirl = document.getElementById('cardGirl');
  const boyBadge = document.getElementById('boyCheckBadge');
  const girlBadge = document.getElementById('girlCheckBadge');

  if (!cardBoy || !cardGirl) return;

  cardBoy.classList.remove('poll-card-selected');
  cardGirl.classList.remove('poll-card-selected');
  if (boyBadge) { boyBadge.classList.add('hidden'); boyBadge.classList.remove('inline-flex'); }
  if (girlBadge) { girlBadge.classList.add('hidden'); girlBadge.classList.remove('inline-flex'); }

  if (choice === 'boy') {
    cardBoy.classList.add('poll-card-selected');
    if (boyBadge) { boyBadge.classList.remove('hidden'); boyBadge.classList.add('inline-flex'); }
  } else if (choice === 'girl') {
    cardGirl.classList.add('poll-card-selected');
    if (girlBadge) { girlBadge.classList.remove('hidden'); girlBadge.classList.add('inline-flex'); }
  }
}

window.selectGuess = function(choice) {
  selectedChoice = choice;
  sfx.playToggleSound();
  highlightCard(choice);
  const feedback = document.getElementById('pollFeedbackMsg');
  if (feedback && !pollState.userVoted) {
    feedback.textContent = `Team ${choice === 'boy' ? 'Boy 🍼' : 'Girl 🎀'} selected! Click "Submit Vote" below.`;
  }
};

function renderPollResults(withConfetti) {
  const total = pollState.boyVotes + pollState.girlVotes;
  const boyBar = document.getElementById('boyProgressBar');
  const boyTxt = document.getElementById('boyPercentText');
  const girlBar = document.getElementById('girlProgressBar');
  const girlTxt = document.getElementById('girlPercentText');
  const btn = document.getElementById('submitVoteBtn');
  const feedback = document.getElementById('pollFeedbackMsg');

  if (total === 0) {
    if (boyBar) boyBar.style.width = '50%';
    if (boyTxt) boyTxt.textContent = '0% (0 votes)';
    if (girlBar) girlBar.style.width = '50%';
    if (girlTxt) girlTxt.textContent = '0% (0 votes)';
    if (!pollState.userVoted && feedback) {
      feedback.textContent = 'Be the first to vote Team Boy 🍼 or Team Girl 🎀!';
    }
  } else {
    const boyPct = Math.round((pollState.boyVotes / total) * 100);
    const girlPct = 100 - boyPct;
    if (boyBar) boyBar.style.width = `${boyPct}%`;
    if (boyTxt) boyTxt.textContent = `${boyPct}% (${pollState.boyVotes} votes)`;
    if (girlBar) girlBar.style.width = `${girlPct}%`;
    if (girlTxt) girlTxt.textContent = `${girlPct}% (${pollState.girlVotes} votes)`;
  }

  if (pollState.userVoted) {
    if (btn) btn.textContent = 'Vote Submitted ✓';
    if (feedback) {
      feedback.textContent = `Thank you! You guessed Team ${pollState.userVoted === 'boy' ? 'Boy 🍼' : 'Girl 🎀'} (${total} total votes).`;
    }
  }

  if (withConfetti && typeof confetti === 'function') {
    confetti({
      particleCount: 110,
      spread: 75,
      origin: { y: 0.65 },
      colors: pollState.userVoted === 'boy' 
        ? ['#38BDF8', '#60A5FA', '#D4AF37', '#FFFFFF'] 
        : ['#F472B6', '#FB7185', '#D4AF37', '#FFFFFF']
    });
  }
}

window.submitPollVote = function() {
  if (!selectedChoice) {
    showToast('Please tap Boy or Girl first!');
    return;
  }

  pollState.userVoted = selectedChoice;
  try {
    localStorage.setItem(POLL_STORAGE_KEY, JSON.stringify(pollState));
  } catch (e) {}

  // Post to live server API
  fetch('/api/poll', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ choice: selectedChoice })
  })
    .then(res => res.ok ? res.json() : Promise.reject())
    .then(data => {
      if (data && typeof data.boy === 'number' && typeof data.girl === 'number') {
        pollState.boyVotes = data.boy;
        pollState.girlVotes = data.girl;
      }
      sfx.playChime();
      renderPollResults(true);
      showToast(`Your Team ${selectedChoice.toUpperCase()} vote has been recorded! 🎉`);
    })
    .catch(() => {
      // Local fallback
      if (selectedChoice === 'boy') pollState.boyVotes += 1;
      else pollState.girlVotes += 1;
      sfx.playChime();
      renderPollResults(true);
      showToast(`Your Team ${selectedChoice.toUpperCase()} vote has been recorded! 🎉`);
    });
};

// 10. Download .ICS Calendar File
window.downloadCalendarEvent = function() {
  const title = `${settings.coupleNames}'s Baby Shower Celebration (Shrimant Sanskar)`;
  const desc = `You are cordially invited to celebrate the auspicious Baby Shower of ${settings.coupleNames}! Pahochij Jajo Time Par!`;
  const loc = `${settings.venueName}, ${settings.venueAddress}`;
  const d = new Date(settings.eventDate || "2026-11-19T11:00:00+05:30");
  const startStr = d.toISOString().replace(/-|:|\.\d\d\d/g, "");
  const endD = new Date(d.getTime() + 4 * 60 * 60 * 1000);
  const endStr = endD.toISOString().replace(/-|:|\.\d\d\d/g, "");

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Rajil & Khushbu//Baby Shower Invitation//EN',
    'BEGIN:VEVENT',
    `SUMMARY:${title}`,
    `DESCRIPTION:${desc}`,
    `LOCATION:${loc}`,
    `DTSTART:${startStr}`,
    `DTEND:${endStr}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'Rajil-Khushbu-Baby-Shower.ics';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  showToast('Calendar invite downloaded for 19th Nov 2026! 📅');
};

// 11. Native HTML5 Dialog Fallback per Modern Web Guidance
const rsvpDialog = document.getElementById('rsvp-dialog');
const rsvpForm = document.getElementById('rsvp-form');
const rsvpSuccessMsg = document.getElementById('rsvp-success-msg');

function setupDialogFallbacks(dialog) {
  if (!dialog) return;
  if (!('closedBy' in HTMLDialogElement.prototype)) {
    dialog.addEventListener('click', (event) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      const isDialogContent = (
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width
      );
      if (isDialogContent) return;
      dialog.close();
    });
  }
}
setupDialogFallbacks(rsvpDialog);

if (rsvpForm) {
  rsvpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('rsvp-name').value;
    const guests = document.getElementById('rsvp-guests').value;
    const status = document.getElementById('rsvp-status').value;
    const diet = document.getElementById('rsvp-diet').value;

    const payload = { name, guests, status, diet };

    // 1. Post to live server API (SQLite)
    fetch('/api/rsvps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(() => {});

    // 2. Backup to localStorage
    const rsvps = JSON.parse(localStorage.getItem('babyShowerRSVPs') || '[]');
    rsvps.push({ ...payload, time: new Date().toISOString() });
    localStorage.setItem('babyShowerRSVPs', JSON.stringify(rsvps));

    sfx.playChime();
    if (typeof confetti === 'function') {
      confetti({ particleCount: 90, spread: 65, origin: { y: 0.5 } });
    }

    rsvpForm.classList.add('hidden');
    rsvpSuccessMsg.classList.remove('hidden');

    setTimeout(() => {
      rsvpDialog.close();
      rsvpForm.reset();
      rsvpForm.classList.remove('hidden');
      rsvpSuccessMsg.classList.add('hidden');
    }, 2400);
  });
}

// 12. Wishes Guestbook with Live API (SQLite)
const wishesList = document.getElementById('wishes-list');
const wishForm = document.getElementById('wish-form');

const initialWishes = [];

let currentWishes = [];

function renderWishes() {
  if (!wishesList) return;

  // Fetch live wishes from server API (SQLite)
  fetch('/api/wishes')
    .then(res => res.ok ? res.json() : Promise.reject())
    .then(data => {
      if (Array.isArray(data)) {
        currentWishes = data;
        localStorage.setItem('babyShowerWishes', JSON.stringify(data));
      } else {
        currentWishes = JSON.parse(localStorage.getItem('babyShowerWishes')) || [];
      }
      displayWishesHTML(currentWishes);
    })
    .catch(() => {
      // Fallback to localStorage if offline
      currentWishes = JSON.parse(localStorage.getItem('babyShowerWishes')) || [];
      displayWishesHTML(currentWishes);
    });
}

function displayWishesHTML(wishes) {
  if (!wishesList) return;
  if (!wishes || wishes.length === 0) {
    wishesList.innerHTML = `
      <div class="col-span-full p-8 text-center text-gold-700 bg-white/90 rounded-2xl border border-gold-500/30 shadow-xs">
        <span class="text-3xl block mb-2">🌸</span>
        <p class="font-editorial text-lg text-maroon-800 font-bold">No blessings posted yet</p>
        <p class="text-xs text-stone-500 mt-1">Be the first to shower Rajil &amp; Khushbu with your love &amp; blessings below!</p>
      </div>
    `;
    return;
  }
  wishesList.innerHTML = wishes.map((w, idx) => `
    <div class="p-5 rounded-2xl bg-white/90 border border-gold-500/30 shadow-xs relative group transition hover:shadow-md">
      <div class="flex items-center justify-between mb-2">
        <h4 class="font-bold text-maroon-900 font-editorial text-lg flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-gold-500"></span>
          ${escapeHTML(w.name)}
        </h4>
        <span class="text-xs text-gold-700/70">${escapeHTML(w.time || 'Recent')}</span>
      </div>
      <p class="text-stone-700 text-sm leading-relaxed">${escapeHTML(w.text)}</p>
      <div class="mt-3 flex items-center justify-between text-xs text-gold-700">
        <button type="button" onclick="likeWish(${w.id || idx}, ${idx})" class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-ivory-50 hover:bg-ivory-100 transition border border-gold-500/30 cursor-pointer">
          <span>❤️</span>
          <span id="wish-likes-${w.id || idx}">${w.likes || 1}</span>
        </button>
        <span class="font-semibold text-gold-600">#BabyShowerBlessings</span>
      </div>
    </div>
  `).join('');
}

function escapeHTML(str) {
  return String(str).replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
}

window.likeWish = function(wishId, idx) {
  sfx.playToggleSound();

  // Optimistic UI update
  const el = document.getElementById(`wish-likes-${wishId}`);
  if (el) {
    const cur = parseInt(el.textContent, 10) || 0;
    el.textContent = cur + 1;
  }

  // Live Server Call
  if (typeof wishId === 'number' && wishId > 0) {
    fetch(`/api/wishes/${wishId}/like`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (data && data.likes && el) el.textContent = data.likes;
      })
      .catch(() => {});
  }
};

if (wishForm) {
  wishForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('wish-name');
    const textInput = document.getElementById('wish-message');
    const name = nameInput.value.trim();
    const text = textInput.value.trim();
    if (!name || !text) return;

    sfx.playChime();
    if (typeof confetti === 'function') {
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.8 } });
    }

    // Post to live server API
    fetch('/api/wishes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, text })
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(() => {
        renderWishes();
        showToast('Your blessing has been posted live! 🌸');
      })
      .catch(() => {
        // Fallback local insert
        const stored = JSON.parse(localStorage.getItem('babyShowerWishes')) || initialWishes;
        stored.unshift({ id: Date.now(), name, text, time: "Just now", likes: 1 });
        localStorage.setItem('babyShowerWishes', JSON.stringify(stored));
        renderWishes();
        showToast('Your blessing has been posted! 🌸');
      });

    nameInput.value = '';
    textInput.value = '';
  });
}

// 13. Live Customizer Drawer
const customizerDrawer = document.getElementById('customizer-drawer');
const openCustomizerBtn = document.getElementById('open-customizer-btn');
const closeCustomizerBtn = document.getElementById('close-customizer-btn');
const customizerForm = document.getElementById('customizer-form');

function toggleCustomizer(open) {
  sfx.playToggleSound();
  if (open) customizerDrawer.classList.remove('closed');
  else customizerDrawer.classList.add('closed');
}

if (openCustomizerBtn) openCustomizerBtn.addEventListener('click', () => toggleCustomizer(true));
if (closeCustomizerBtn) closeCustomizerBtn.addEventListener('click', () => toggleCustomizer(false));

function applySettingsToDOM() {
  document.querySelectorAll('.couple-names-text').forEach(el => el.textContent = settings.coupleNames);
  document.querySelectorAll('.venue-name-text').forEach(el => el.textContent = settings.venueName);
  document.querySelectorAll('.venue-address-text').forEach(el => el.textContent = settings.venueAddress);
  document.querySelectorAll('.event-date-text').forEach(el => el.textContent = settings.displayDate);
  document.querySelectorAll('.event-time-text').forEach(el => el.textContent = settings.displayTime);
  document.querySelectorAll('.cultural-title-text').forEach(el => el.textContent = settings.culturalTitle);

  if (document.getElementById('input-couple-names')) document.getElementById('input-couple-names').value = settings.coupleNames;
  if (document.getElementById('input-venue-name')) document.getElementById('input-venue-name').value = settings.venueName;
  if (document.getElementById('input-venue-address')) document.getElementById('input-venue-address').value = settings.venueAddress;
  if (document.getElementById('input-event-date')) document.getElementById('input-event-date').value = settings.displayDate;
  if (document.getElementById('input-event-time')) document.getElementById('input-event-time').value = settings.displayTime;
  if (document.getElementById('input-cultural-title')) document.getElementById('input-cultural-title').value = settings.culturalTitle;
}

if (customizerForm) {
  customizerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    settings.coupleNames = document.getElementById('input-couple-names').value;
    settings.venueName = document.getElementById('input-venue-name').value;
    settings.venueAddress = document.getElementById('input-venue-address').value;
    settings.displayDate = document.getElementById('input-event-date').value;
    settings.displayTime = document.getElementById('input-event-time').value;
    settings.culturalTitle = document.getElementById('input-cultural-title').value;

    localStorage.setItem('babyShowerSettings', JSON.stringify(settings));
    applySettingsToDOM();
    sfx.playChime();
    toggleCustomizer(false);
    showToast('Invitation updated with your custom details! 🎉');
  });
}

window.copyShareLink = function() {
  const url = new URL(window.location.href);
  url.searchParams.set('couple', encodeURIComponent(settings.coupleNames));
  url.searchParams.set('venue', encodeURIComponent(settings.venueName));
  url.searchParams.set('date', encodeURIComponent(settings.displayDate));
  url.searchParams.set('time', encodeURIComponent(settings.displayTime));

  navigator.clipboard.writeText(url.toString()).then(() => {
    showToast('WhatsApp link copied with your custom details!');
  }).catch(() => {
    prompt('Copy invitation link:', url.toString());
  });
};

// Global Initialize on Load
window.addEventListener('DOMContentLoaded', () => {
  applySettingsToDOM();
  initPetalsCanvas();
  initHeroParticles();
  initCountdown();
  initScrollObserver();
  loadPollState();
  renderWishes();
  
  // Initialize scroll-based video scrubbing (front and back play on desktop & mobile)
  initHeroVideoScrub();
  // Initialize scroll-driven mode switch for family photos (front and back, on mobiles also)
  initFamilyScrollTrigger();
  // Initialize graceful parallax for venue & map
  initGracefulParallax();
});
