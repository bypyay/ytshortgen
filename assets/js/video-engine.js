/**
 * ══════════════════════════════════════════════════════════════════
 * AI YOUTUBE SHORTS STUDIO — 60FPS 9:16 VIDEO CANVAS & EXPORT ENGINE
 * Multi-layer rendering, particle physics, text animation, and WebM/MP4 export
 * ══════════════════════════════════════════════════════════════════
 */

const VideoEngine = (function() {
  'use strict';

  // Canvas & Context references
  let canvas = null;
  let ctx = null;
  let animFrameId = null;

  // Video Dimensions (9:16 Vertical HD)
  const CANVAS_WIDTH = 1080;
  const CANVAS_HEIGHT = 1920;

  // Playback & Timeline State
  let isPlaying = false;
  let currentTime = 0; // in seconds
  let totalDuration = 16; // default 16s short
  let lastTimestamp = 0;

  // Particle System
  const particles = [];
  const MAX_PARTICLES = 65;

  // Audio & Voice State
  let audioCtx = null;
  let bgmGainNode = null;
  let isAudioPlaying = false;
  let bgmType = 'spiritual'; // 'spiritual', 'cosmic', 'bells', 'none'

  // Current Video Project Data
  let projectData = {
    theme: 'gold', // 'gold', 'cosmic', 'devotional', 'cyber', 'royal', 'minimal'
    fontFamily: 'Noto Sans Devanagari',
    targetDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10), // Tomorrow by default
    bgmVolume: 0.85, // rich spiritual sound
    sign: {
      id: 'aries',
      nameHi: 'मेष',
      nameEn: 'Aries',
      symbol: '♈',
      lord: 'मंगल',
      element: 'अग्नि',
      luckyColor: 'लाल (Red)',
      luckyNumber: 9,
      luckPercent: 88,
      prediction: 'आज का दिन आपके लिए आर्थिक व पारिवारिक रूप से बेहद शुभ रहेगा। कार्यक्षेत्र में नए अवसर प्राप्त होंगे और सोचे हुए कार्य पूरे होंगे।',
      upay: 'हनुमान चालीसा का पाठ करें और सिंदूर का तिलक लगाएं।'
    },
    dateText: 'कल का पंचांग एवं राशिफल',
    channelName: '@DailyRashifal',
    slides: [
      { id: 1, type: 'intro', duration: 3.5 },
      { id: 2, type: 'metrics', duration: 4.0 },
      { id: 3, type: 'prediction', duration: 5.5 },
      { id: 4, type: 'upay', duration: 3.0 }
    ]
  };

  // ══════════════════════════════════════════════════════════════════
  // 1. Initialization
  // ══════════════════════════════════════════════════════════════════
  function init(canvasId) {
    canvas = document.getElementById(canvasId);
    if (!canvas) return;

    ctx = canvas.getContext('2d');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    initParticles();
    calculateTotalDuration();
    renderFrame(0);
  }

  function initParticles() {
    particles.length = 0;
    for (let i = 0; i < MAX_PARTICLES; i++) {
      particles.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        radius: Math.random() * 4 + 1.5,
        speedX: (Math.random() - 0.5) * 1.2,
        speedY: (Math.random() - 1.2) * 1.8,
        opacity: Math.random() * 0.8 + 0.2,
        pulsingSpeed: Math.random() * 0.05 + 0.02
      });
    }
  }

  function calculateTotalDuration() {
    totalDuration = projectData.slides.reduce((sum, s) => sum + (s.duration || 3), 0);
  }

  // ══════════════════════════════════════════════════════════════════
  // 2. Playback & Timeline Controls
  // ══════════════════════════════════════════════════════════════════
  function play() {
    if (isPlaying) return;
    isPlaying = true;
    lastTimestamp = performance.now();
    startAudio();

    function loop(now) {
      if (!isPlaying) return;
      const delta = (now - lastTimestamp) / 1000;
      lastTimestamp = now;

      currentTime += delta;
      if (currentTime >= totalDuration) {
        currentTime = 0; // loop
      }

      renderFrame(currentTime);
      updateTimelineUI();
      animFrameId = requestAnimationFrame(loop);
    }
    animFrameId = requestAnimationFrame(loop);
  }

  function pause() {
    isPlaying = false;
    if (animFrameId) cancelAnimationFrame(animFrameId);
    stopAudio();
    updatePlayPauseButton();
  }

  function togglePlay() {
    if (isPlaying) pause();
    else play();
    updatePlayPauseButton();
  }

  function seek(targetTime) {
    currentTime = Math.max(0, Math.min(totalDuration, targetTime));
    renderFrame(currentTime);
    updateTimelineUI();
  }

  function updatePlayPauseButton() {
    const btn = document.getElementById('btnPlayPause');
    if (btn) {
      btn.innerHTML = isPlaying ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>';
    }
  }

  function updateTimelineUI() {
    const slider = document.getElementById('timelineSlider');
    const timeDisplay = document.getElementById('timecodeDisplay');

    if (slider) {
      slider.max = totalDuration;
      slider.value = currentTime;
    }
    if (timeDisplay) {
      const curM = Math.floor(currentTime / 60);
      const curS = Math.floor(currentTime % 60);
      const totM = Math.floor(totalDuration / 60);
      const totS = Math.floor(totalDuration % 60);
      timeDisplay.textContent = `${padZero(curM)}:${padZero(curS)} / ${padZero(totM)}:${padZero(totS)}`;
    }
  }

  function padZero(num) {
    return num < 10 ? '0' + num : num;
  }

  // ══════════════════════════════════════════════════════════════════
  // 3. 60FPS Canvas Render Pipeline
  // ══════════════════════════════════════════════════════════════════
  function renderFrame(time) {
    if (!ctx || !canvas) return;

    // Clear Screen
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Layer 1: Background & Particle Effects
    drawBackground(time);
    drawParticles(time);

    // Layer 2: Decorative Frame & Header
    drawOrnateHeader(time);

    // Layer 3: Dynamic Slide Content (based on current time)
    drawActiveSlide(time);

    // Layer 4: Footer & Watermark
    drawFooter(time);
  }

  // Layer 1: Dynamic Animated Backgrounds
  function drawBackground(time) {
    const theme = projectData.theme;

    if (theme === 'gold') {
      const grad = ctx.createRadialGradient(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 50, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 1100);
      grad.addColorStop(0, '#582103');
      grad.addColorStop(0.4, '#2d0f01');
      grad.addColorStop(1, '#0b0400');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Rotating Golden Rays
      ctx.save();
      ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      ctx.rotate(time * 0.08);
      for (let i = 0; i < 12; i++) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, 1200, (i * Math.PI) / 6, ((i + 0.4) * Math.PI) / 6);
        ctx.fillStyle = 'rgba(245, 158, 11, 0.04)';
        ctx.fill();
      }
      ctx.restore();

    } else if (theme === 'cosmic') {
      const grad = ctx.createRadialGradient(CANVAS_WIDTH / 2, 700, 100, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 1200);
      grad.addColorStop(0, '#3b0764');
      grad.addColorStop(0.5, '#0f172a');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    } else if (theme === 'devotional') {
      const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      grad.addColorStop(0, '#7c2d12');
      grad.addColorStop(0.4, '#431407');
      grad.addColorStop(1, '#1c0802');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    } else if (theme === 'cyber') {
      const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      grad.addColorStop(0, '#083344');
      grad.addColorStop(0.5, '#021e2f');
      grad.addColorStop(1, '#020b12');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    } else if (theme === 'royal') {
      const grad = ctx.createRadialGradient(CANVAS_WIDTH / 2, 800, 80, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 1100);
      grad.addColorStop(0, '#701a75');
      grad.addColorStop(0.6, '#2e0854');
      grad.addColorStop(1, '#0d021a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    } else { // minimal
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
  }

  // Floating Golden Sparkles / Particle System
  function drawParticles(time) {
    ctx.save();
    particles.forEach(p => {
      p.y += p.speedY;
      p.x += p.speedX;

      if (p.y < 0) {
        p.y = CANVAS_HEIGHT;
        p.x = Math.random() * CANVAS_WIDTH;
      }
      if (p.x < 0) p.x = CANVAS_WIDTH;
      if (p.x > CANVAS_WIDTH) p.x = 0;

      const alpha = p.opacity * (0.6 + 0.4 * Math.sin(time * 3 + p.x));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(251, 191, 36, ${alpha})`;
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 10;
      ctx.fill();
    });
    ctx.restore();
  }

  // Layer 2: Ornate Top Header Banner
  function drawOrnateHeader(time) {
    const sign = projectData.sign;

    // Top Date Bar
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    roundRect(ctx, 80, 70, CANVAS_WIDTH - 160, 90, 24);
    ctx.fill();
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Date & Day Text
    const targetDate = parseDateSafe(projectData.targetDate);
    const days = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
    const months = ['जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];
    const dateStr = `🕉️ ${days[targetDate.getDay()]}, ${targetDate.getDate()} ${months[targetDate.getMonth()]} ${targetDate.getFullYear()} 🪔`;

    ctx.font = '800 36px "Noto Sans Devanagari", sans-serif';
    ctx.fillStyle = '#fbbf24';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(dateStr, CANVAS_WIDTH / 2, 115);
    ctx.restore();

    // Zodiac Circular Glowing Badge
    ctx.save();
    const badgeY = 280;
    const pulse = 1 + 0.03 * Math.sin(time * 4);

    // Glowing Circles
    ctx.beginPath();
    ctx.arc(CANVAS_WIDTH / 2, badgeY, 110 * pulse, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 30;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(CANVAS_WIDTH / 2, badgeY, 95, 0, Math.PI * 2);
    ctx.fillStyle = '#1e0a02';
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 4;
    ctx.fill();
    ctx.stroke();

    // Zodiac Symbol
    ctx.font = '90px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#fef08a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(sign.symbol || '♈', CANVAS_WIDTH / 2, badgeY - 5);

    // Sign Name Label below badge (Fixed undefined bug!)
    ctx.font = '900 68px "Noto Sans Devanagari", "Yatra One", sans-serif';
    const grad = ctx.createLinearGradient(CANVAS_WIDTH / 2 - 200, 0, CANVAS_WIDTH / 2 + 200, 0);
    grad.addColorStop(0, '#fef08a');
    grad.addColorStop(0.5, '#fbbf24');
    grad.addColorStop(1, '#f59e0b');
    ctx.fillStyle = grad;
    ctx.shadowColor = 'rgba(245, 158, 11, 0.6)';
    ctx.shadowBlur = 18;
    const signNameHi = sign.nameHi || sign.signNameHi || 'मेष';
    const signNameEn = sign.nameEn || sign.signNameEn || 'Aries';
    ctx.fillText(`${signNameHi} राशि (${signNameEn})`, CANVAS_WIDTH / 2, badgeY + 140);
    ctx.restore();
  }

  // Layer 3: Multi-Slide Dynamic Scene Sequencer
  function drawActiveSlide(time) {
    let accumulatedTime = 0;
    let activeSlide = projectData.slides[0];
    let slideLocalTime = 0;

    for (let i = 0; i < projectData.slides.length; i++) {
      const s = projectData.slides[i];
      if (time >= accumulatedTime && time < accumulatedTime + s.duration) {
        activeSlide = s;
        slideLocalTime = time - accumulatedTime;
        break;
      }
      accumulatedTime += s.duration;
    }

    if (activeSlide.type === 'intro') {
      renderSlideIntro(slideLocalTime, activeSlide.duration);
    } else if (activeSlide.type === 'metrics') {
      renderSlideMetrics(slideLocalTime, activeSlide.duration);
    } else if (activeSlide.type === 'prediction') {
      renderSlidePrediction(slideLocalTime, activeSlide.duration);
    } else if (activeSlide.type === 'upay') {
      renderSlideUpay(slideLocalTime, activeSlide.duration);
    }
  }

  // Slide 1: Hook / Intro Scene
  function renderSlideIntro(t, dur) {
    const sign = projectData.sign;
    const progress = Math.min(1, t / 0.6); // smooth entrance

    ctx.save();
    ctx.translate(0, (1 - progress) * 40);
    ctx.globalAlpha = progress;

    // Center Banner Box
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    roundRect(ctx, 80, 620, CANVAS_WIDTH - 160, 800, 36);
    ctx.fill();
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Hook Heading
    ctx.font = '900 56px "Noto Sans Devanagari", sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'center';
    ctx.fillText('🌟 आज का दैनिक राशिफल 🌟', CANVAS_WIDTH / 2, 730);

    // Lord & Element Info Pill
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    roundRect(ctx, 160, 800, CANVAS_WIDTH - 320, 80, 20);
    ctx.fill();

    const lord = sign.lord || 'मंगल';
    const element = sign.element || 'अग्नि';
    ctx.font = '700 38px "Noto Sans Devanagari", sans-serif';
    ctx.fillStyle = '#fed7aa';
    ctx.fillText(`स्वामी ग्रह: ${lord} | तत्व: ${element}`, CANVAS_WIDTH / 2, 852);

    // Animated Highlights
    ctx.font = '800 48px "Noto Sans Devanagari", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('जानिए आज आपका भाग्य कैसा रहेगा?', CANVAS_WIDTH / 2, 1000);

    ctx.font = '600 38px "Noto Sans Devanagari", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('करियर • धन लाभ • व्यापार • शुभ उपाय', CANVAS_WIDTH / 2, 1090);

    // Pulsing Arrow
    const arrowBounce = Math.sin(t * 8) * 15;
    ctx.font = '54px "Noto Sans Devanagari", sans-serif';
    ctx.fillStyle = '#fbbf24';
    ctx.fillText('⬇️ शुभ अंक व रंग आगे देखें ⬇️', CANVAS_WIDTH / 2, 1260 + arrowBounce);

    ctx.restore();
  }

  // Slide 2: Lucky Metrics Scene (शुभ रंग, शुभ अंक, भाग्य %)
  function renderSlideMetrics(t, dur) {
    const sign = projectData.sign;
    const progress = Math.min(1, t / 0.5);

    ctx.save();
    ctx.globalAlpha = progress;

    // Main Card
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    roundRect(ctx, 80, 580, CANVAS_WIDTH - 160, 860, 36);
    ctx.fill();
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.font = '900 52px "Noto Sans Devanagari", sans-serif';
    ctx.fillStyle = '#fbbf24';
    ctx.textAlign = 'center';
    ctx.fillText('✨ आज के लकी फैक्टर्स ✨', CANVAS_WIDTH / 2, 670);

    // 1. Lucky Color Box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    roundRect(ctx, 130, 740, CANVAS_WIDTH - 260, 140, 24);
    ctx.fill();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = '700 36px "Noto Sans Devanagari", sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'left';
    ctx.fillText('🎨 शुभ रंग (Lucky Color):', 170, 825);

    ctx.font = '900 44px "Noto Sans Devanagari", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'right';
    ctx.fillText(sign.luckyColor || 'पीला (Yellow)', CANVAS_WIDTH - 170, 825);

    // 2. Lucky Number Box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    roundRect(ctx, 130, 920, CANVAS_WIDTH - 260, 140, 24);
    ctx.fill();
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = '700 36px "Noto Sans Devanagari", sans-serif';
    ctx.fillStyle = '#fbbf24';
    ctx.textAlign = 'left';
    ctx.fillText('🔢 शुभ अंक (Lucky Number):', 170, 1005);

    ctx.font = '900 52px "JetBrains Mono", sans-serif';
    ctx.fillStyle = '#fbbf24';
    ctx.textAlign = 'right';
    ctx.fillText(String(sign.luckyNumber || 7), CANVAS_WIDTH - 170, 1005);

    // 3. Luck % Progress Meter Box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    roundRect(ctx, 130, 1100, CANVAS_WIDTH - 260, 220, 24);
    ctx.fill();
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = '700 36px "Noto Sans Devanagari", sans-serif';
    ctx.fillStyle = '#34d399';
    ctx.textAlign = 'left';
    ctx.fillText('📈 आज भाग्य का साथ:', 170, 1170);

    ctx.font = '900 48px "JetBrains Mono", sans-serif';
    ctx.fillStyle = '#34d399';
    ctx.textAlign = 'right';
    ctx.fillText(`${sign.luckPercent || 85}%`, CANVAS_WIDTH - 170, 1170);

    // Progress Bar Track
    const barX = 170;
    const barY = 1220;
    const barW = CANVAS_WIDTH - 340;
    const barH = 26;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    roundRect(ctx, barX, barY, barW, barH, 13);
    ctx.fill();

    // Animated Fill Bar
    const fillPercent = Math.min(1, t / 1.5) * ((sign.luckPercent || 85) / 100);
    const fillGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    fillGrad.addColorStop(0, '#f59e0b');
    fillGrad.addColorStop(1, '#10b981');
    ctx.fillStyle = fillGrad;
    roundRect(ctx, barX, barY, barW * fillPercent, barH, 13);
    ctx.fill();

    ctx.restore();
  }

  // Slide 3: Main Daily Forecast / Prediction
  function renderSlidePrediction(t, dur) {
    const sign = projectData.sign;
    const progress = Math.min(1, t / 0.5);

    ctx.save();
    ctx.globalAlpha = progress;

    // Prediction Card
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    roundRect(ctx, 80, 560, CANVAS_WIDTH - 160, 900, 36);
    ctx.fill();
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.font = '900 48px "Noto Sans Devanagari", sans-serif';
    ctx.fillStyle = '#fbbf24';
    ctx.textAlign = 'center';
    ctx.fillText('📖 दैनिक भविष्यफल (Prediction)', CANVAS_WIDTH / 2, 650);

    // Inner Text Box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    roundRect(ctx, 120, 720, CANVAS_WIDTH - 240, 680, 24);
    ctx.fill();

    // Devanagari Word-Wrapped Paragraph
    const text = sign.prediction || 'आज का दिन आपके लिए मंगलकारी रहेगा। बिगड़े कार्य पूरे होंगे और आर्थिक लाभ मिलेगा।';
    ctx.font = '600 44px "Noto Sans Devanagari", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    wrapText(ctx, text, 160, 770, CANVAS_WIDTH - 320, 70);

    ctx.restore();
  }

  // Slide 4: Astrological Remedy (उपाय) & Subscribe Outro
  function renderSlideUpay(t, dur) {
    const sign = projectData.sign;
    const progress = Math.min(1, t / 0.5);

    ctx.save();
    ctx.globalAlpha = progress;

    // Upay Card
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    roundRect(ctx, 80, 560, CANVAS_WIDTH - 160, 900, 36);
    ctx.fill();
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.font = '900 52px "Noto Sans Devanagari", sans-serif';
    ctx.fillStyle = '#f59e0b';
    ctx.textAlign = 'center';
    ctx.fillText('🪔 आज का विशेष उपाय 🪔', CANVAS_WIDTH / 2, 650);

    // Upay Text Card
    ctx.fillStyle = 'rgba(245, 158, 11, 0.12)';
    roundRect(ctx, 120, 730, CANVAS_WIDTH - 240, 320, 24);
    ctx.fill();
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    const upayText = sign.upay || 'हनुमान चालीसा का पाठ करें और सिंदूर का तिलक लगाएं।';
    ctx.font = '700 42px "Noto Sans Devanagari", sans-serif';
    ctx.fillStyle = '#fef08a';
    ctx.textAlign = 'center';
    wrapText(ctx, upayText, CANVAS_WIDTH / 2, 810, CANVAS_WIDTH - 320, 65, true);

    // Subscribe / Like Outro Button
    const pulse = 1 + 0.05 * Math.sin(t * 8);
    ctx.save();
    ctx.translate(CANVAS_WIDTH / 2, 1220);
    ctx.scale(pulse, pulse);

    ctx.fillStyle = '#dc2626';
    roundRect(ctx, -280, -60, 560, 120, 60);
    ctx.fill();
    ctx.shadowColor = '#dc2626';
    ctx.shadowBlur = 25;

    ctx.font = '900 44px "Noto Sans Devanagari", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🔔 Like & Subscribe करें', 0, 0);
    ctx.restore();

    ctx.restore();
  }

  // Layer 4: Footer Watermark
  function drawFooter(time) {
    ctx.save();
    ctx.font = '800 32px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.textAlign = 'center';
    ctx.fillText(projectData.channelName || '@DailyRashifal', CANVAS_WIDTH / 2, 1840);
    ctx.restore();
  }

  // ══════════════════════════════════════════════════════════════════
  // 4. In-Browser Audio Synthesizer (Zero External Dependencies)
  // ══════════════════════════════════════════════════════════════════
  function startAudio() {
    if (bgmType === 'none') return;
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      playAmbientSynthLoop();
    } catch (e) {
      console.warn('Audio play prevented by browser autoplay policy:', e);
    }
  }

  function stopAudio() {
    if (bgmGainNode) {
      try { bgmGainNode.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.3); } catch(e){}
    }
  }

  function playAmbientSynthLoop(targetDestination = null) {
    if (!audioCtx || bgmType === 'none') return;
    const now = audioCtx.currentTime;

    const vol = (projectData.bgmVolume !== undefined) ? projectData.bgmVolume : 0.85;

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(vol * 0.45, now);

    if (targetDestination) {
      gain.connect(targetDestination);
    } else {
      gain.connect(audioCtx.destination);
      bgmGainNode = gain;
    }

    // Warm spiritual ambient chords (Tanpura / Flute harmonics) with richer resonance
    const freqs = [108, 162, 216, 324, 432, 540]; // 432Hz sacred harmonic tuning
    freqs.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const oscGain = audioCtx.createGain();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      oscGain.gain.setValueAtTime(0.08 * vol, now);
      osc.connect(oscGain);
      oscGain.connect(gain);

      osc.start(now);
      osc.stop(now + totalDuration + 2);
    });
  }

  // ══════════════════════════════════════════════════════════════════
  // 5. In-Browser 1080x1920 Video Export Engine (MediaRecorder)
  // ══════════════════════════════════════════════════════════════════
  async function exportVideo(onProgress, onComplete, onError) {
    pause();
    currentTime = 0;

    // Draw initial frame
    renderFrame(0);

    const stream = canvas.captureStream(30); // 30fps stream for solid recording

    // Initialize Web Audio synth track for pristine synchronized audio
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      try { await audioCtx.resume(); } catch(e) {}
    }

    const dest = audioCtx.createMediaStreamDestination();
    playAmbientSynthLoop(dest); // connect synth to stream destination

    let combinedStream = stream;
    const audioTracks = dest.stream.getAudioTracks();
    if (audioTracks && audioTracks.length > 0) {
      combinedStream = new MediaStream([stream.getVideoTracks()[0], audioTracks[0]]);
    }

    let mimeType = 'video/webm;codecs=vp8,opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm;codecs=vp9,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/mp4';
        }
      }
    }

    const recordedChunks = [];
    let recorder;
    try {
      recorder = new MediaRecorder(combinedStream, {
        mimeType: mimeType,
        videoBitsPerSecond: 6000000 // 6 Mbps High Quality
      });
    } catch(e) {
      recorder = new MediaRecorder(combinedStream);
    }

    recorder.ondataavailable = function(e) {
      if (e.data && e.data.size > 0) {
        recordedChunks.push(e.data);
      }
    };

    recorder.onstop = function() {
      const blob = new Blob(recordedChunks, { type: recorder.mimeType || mimeType });
      const videoUrl = URL.createObjectURL(blob);
      if (onComplete) onComplete(videoUrl, blob);
    };

    recorder.start(200); // 200ms chunk interval

    const exportStartTime = performance.now();
    let exportAnimId = null;

    function exportLoop(now) {
      const elapsedMs = now - exportStartTime;
      const progressSec = elapsedMs / 1000;

      if (progressSec >= totalDuration) {
        renderFrame(totalDuration);
        if (onProgress) onProgress(100);

        try { recorder.requestData(); } catch(e) {}

        setTimeout(function() {
          try {
            recorder.stop();
          } catch(e) {
            if (onError) onError(e);
          }
        }, 350);
        return;
      }

      renderFrame(progressSec);
      if (onProgress) {
        onProgress(Math.min(99, Math.round((progressSec / totalDuration) * 100)));
      }

      exportAnimId = requestAnimationFrame(exportLoop);
    }

    exportAnimId = requestAnimationFrame(exportLoop);
  }

  // ══════════════════════════════════════════════════════════════════
  // 6. Utility Functions
  // ══════════════════════════════════════════════════════════════════
  function roundRect(c, x, y, width, height, radius) {
    c.beginPath();
    c.moveTo(x + radius, y);
    c.lineTo(x + width - radius, y);
    c.quadraticCurveTo(x + width, y, x + width, y + radius);
    c.lineTo(x + width, y + height - radius);
    c.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    c.lineTo(x + radius, y + height);
    c.quadraticCurveTo(x, y + height, x, y + height - radius);
    c.lineTo(x, y + radius);
    c.quadraticCurveTo(x, y, x + radius, y);
    c.closePath();
  }

  function wrapText(c, text, x, y, maxWidth, lineHeight, isCenter = false) {
    const words = text.split(' ');
    let line = '';
    let curY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = c.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > maxWidth && n > 0) {
        if (isCenter) c.fillText(line.trim(), x, curY);
        else c.fillText(line.trim(), x, curY);
        line = words[n] + ' ';
        curY += lineHeight;
      } else {
        line = testLine;
      }
    }
    if (isCenter) c.fillText(line.trim(), x, curY);
    else c.fillText(line.trim(), x, curY);
  }

  // Setters for external UI bindings
  function setProjectData(newData) {
    projectData = Object.assign(projectData, newData);
    calculateTotalDuration();
    renderFrame(currentTime);
  }

  function setSign(signObj) {
    projectData.sign = Object.assign({}, projectData.sign, signObj);
    renderFrame(currentTime);
  }

  function setTheme(themeName) {
    projectData.theme = themeName;
    renderFrame(currentTime);
  }

  function setBgmType(type) {
    bgmType = type;
  }

  function setBgmVolume(val) {
    projectData.bgmVolume = parseFloat(val);
    if (bgmGainNode && audioCtx) {
      try {
        bgmGainNode.gain.setValueAtTime(projectData.bgmVolume * 0.45, audioCtx.currentTime);
      } catch(e) {}
    }
  }

  function setTargetDate(dateStr) {
    projectData.targetDate = dateStr;
    renderFrame(currentTime);
  }

  function parseDateSafe(dateInput) {
    if (!dateInput) return new Date();
    if (dateInput instanceof Date) return dateInput;
    if (typeof dateInput === 'string') {
      const parts = dateInput.split('-');
      if (parts.length === 3) {
        return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      }
    }
    return new Date(dateInput);
  }

  return {
    init: init,
    play: play,
    pause: pause,
    togglePlay: togglePlay,
    seek: seek,
    setProjectData: setProjectData,
    setSign: setSign,
    setTheme: setTheme,
    setBgmType: setBgmType,
    setBgmVolume: setBgmVolume,
    setTargetDate: setTargetDate,
    exportVideo: exportVideo,
    getProjectData: () => projectData,
    getTotalDuration: () => totalDuration
  };
})();

// Attach globally
if (typeof window !== 'undefined') {
  window.VideoEngine = VideoEngine;
}
