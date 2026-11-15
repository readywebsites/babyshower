/**
 * ==============================================================================
 * ROYAL GUJARATI BABY SHOWER INVITATION (FIXED CONTAINER SCROLL EXPERIENCE)
 * Rajil & Khushbu's Shrimant Sanskar &bull; The Grand Murli, Surat
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initAudio();
  initFixedExperienceScroll();
});

// ==============================================================================
// 1. FIXED CONTAINER SCROLL ENGINE (VIDEO SCRUBBING & 2ND SECTION REVEAL)
// ==============================================================================
function initFixedExperienceScroll() {
  const track = document.getElementById('scrollRunway');
  const videoStage = document.getElementById('videoStage');
  const secondStage = document.getElementById('secondSectionStage');
  const desktopVid = document.getElementById('heroVideoDesktop');
  const mobileVid = document.getElementById('heroVideoMobile');
  const scrollPrompt = document.getElementById('scrollHintPrompt');

  if (!track) return;

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

  // Activate only the video matching the device viewport
  const initialActive = getActiveVideo();
  if (initialActive) {
    activateVideo(initialActive);
  }

  // Non-blocking seek throttle for 60fps hardware-accelerated scrubbing
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

  function updateExperience() {
    const rect = track.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const totalScroll = rect.height - vh;
    if (totalScroll <= 0) {
      ticking = false;
      return;
    }

    // Normalized progress along the runway (0.0 at top -> 1.0 at end)
    const currentScroll = Math.max(0, -rect.top);
    const progress = Math.min(1, Math.max(0, currentScroll / totalScroll));

    const activeVid = getActiveVideo();
    if (activeVid && activeVid.preload !== 'auto') {
      activateVideo(activeVid);
    }

    // Scroll prompt hint fades out on first scroll
    if (scrollPrompt) {
      scrollPrompt.style.opacity = Math.max(0, 1 - (progress * 7)).toString();
    }

    // Timing phases:
    // 0.00 -> 0.48: Video scrubs forward/backward
    // 0.48 -> 0.62: Video completes, 2nd section photo & timing/location cards transition in
    // 0.62 -> 1.00: 2nd section photo, 11:00 AM ceremony, 12:30 PM lunch & maps button in full display
    const videoScrubEnd = 0.48;
    const transitionEnd = 0.62;

    // Phase 1: Video scrub
    if (activeVid && !isNaN(activeVid.duration) && activeVid.duration > 0) {
      const vidProgress = Math.min(1, progress / videoScrubEnd);
      performSeek(activeVid, vidProgress * activeVid.duration);
    }

    // Phase 2: Stage crossfade & rise
    if (progress < videoScrubEnd) {
      // 100% Video visible
      if (videoStage) {
        videoStage.style.opacity = '1';
        videoStage.style.transform = 'scale(1)';
        videoStage.style.pointerEvents = 'none';
      }
      if (secondStage) {
        secondStage.style.opacity = '0';
        secondStage.style.pointerEvents = 'none';
        secondStage.style.transform = 'translateY(28px) scale(0.97)';
      }
    } else if (progress >= videoScrubEnd && progress < transitionEnd) {
      // Crossfade transition
      const t = (progress - videoScrubEnd) / (transitionEnd - videoScrubEnd);
      if (videoStage) {
        videoStage.style.opacity = (1 - t).toFixed(3);
        videoStage.style.transform = `scale(${(1 - 0.03 * t).toFixed(3)})`;
      }
      if (secondStage) {
        secondStage.style.opacity = t.toFixed(3);
        secondStage.style.pointerEvents = t > 0.5 ? 'auto' : 'none';
        const translateY = 28 * (1 - t);
        const scale = 0.97 + (0.03 * t);
        secondStage.style.transform = `translateY(${translateY.toFixed(1)}px) scale(${scale.toFixed(3)})`;
      }
    } else {
      // 100% 2nd Section photo & details active
      if (videoStage) {
        videoStage.style.opacity = '0';
      }
      if (secondStage) {
        secondStage.style.opacity = '1';
        secondStage.style.pointerEvents = 'auto';
        secondStage.style.transform = 'translateY(0px) scale(1)';
      }
    }

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateExperience);
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener('touchmove', () => {
    if (!ticking) {
      requestAnimationFrame(updateExperience);
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', () => {
    const active = getActiveVideo();
    if (active) activateVideo(active);
    if (!ticking) {
      requestAnimationFrame(updateExperience);
      ticking = true;
    }
  });

  // Initial calculation
  updateExperience();
}

// ==============================================================================
// 2. AMBIENT SHEHNAI MUSIC ENGINE (AUTOPLAY ON FIRST TAP & FLOATING TOGGLE)
// ==============================================================================
function initAudio() {
  const audio = document.getElementById('bgMusic');
  const btn = document.getElementById('musicToggleBtn');
  const label = document.getElementById('musicLabel');
  const wave = document.getElementById('musicIconWave');

  if (!audio || !btn) return;

  let isPlaying = false;
  let hasInteracted = false;

  function updateMusicUI(playing) {
    isPlaying = playing;
    if (isPlaying) {
      btn.classList.add('bg-gold-100', 'border-gold-500');
      if (label) label.textContent = 'Pause Shehnai';
      if (wave) wave.classList.remove('opacity-40');
    } else {
      btn.classList.remove('bg-gold-100', 'border-gold-500');
      if (label) label.textContent = 'Play Shehnai';
      if (wave) wave.classList.add('opacity-40');
    }
  }

  function playMusic() {
    audio.play().then(() => {
      updateMusicUI(true);
    }).catch(() => {
      updateMusicUI(false);
    });
  }

  function pauseMusic() {
    audio.pause();
    updateMusicUI(false);
  }

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    if (isPlaying) pauseMusic();
    else playMusic();
  });

  // Autoplay softly upon first guest scroll or interaction
  function onFirstInteraction() {
    if (hasInteracted) return;
    hasInteracted = true;
    audio.volume = 0.55;
    playMusic();

    window.removeEventListener('click', onFirstInteraction);
    window.removeEventListener('scroll', onFirstInteraction);
    window.removeEventListener('touchstart', onFirstInteraction);
  }

  window.addEventListener('click', onFirstInteraction, { passive: true });
  window.addEventListener('scroll', onFirstInteraction, { passive: true });
  window.addEventListener('touchstart', onFirstInteraction, { passive: true });
}
