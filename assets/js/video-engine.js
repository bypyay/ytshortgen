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

    if (projectData.layoutMode === 'poster') {
      // Render 12-Zodiacs 1-Page All-in-One Poster
      drawPosterLayout(time);
    } else {
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
  }

  // Layer 1: Dynamic Animated Backgrounds (12+ Spiritual & Vintage Themes)
  function drawBackground(time) {
    const theme = projectData.theme || 'gold';

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

    } else if (theme === 'bhojpatra') { // 📜 Ancient Bhojpatra Parchment
      const grad = ctx.createRadialGradient(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 80, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 1100);
      grad.addColorStop(0, '#451a03');
      grad.addColorStop(0.5, '#290f02');
      grad.addColorStop(1, '#150600');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Sanskrit Sacred Geometry Border lines
      ctx.save();
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.15)';
      ctx.lineWidth = 3;
      ctx.strokeRect(30, 30, CANVAS_WIDTH - 60, CANVAS_HEIGHT - 60);
      ctx.strokeRect(45, 45, CANVAS_WIDTH - 90, CANVAS_HEIGHT - 90);
      ctx.restore();

    } else if (theme === 'newspaper') { // 📰 Vintage Newsprint Editorial
      const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      grad.addColorStop(0, '#1c1917');
      grad.addColorStop(0.5, '#0c0a09');
      grad.addColorStop(1, '#050505');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Editorial Double Border
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.lineWidth = 4;
      ctx.strokeRect(36, 36, CANVAS_WIDTH - 72, CANVAS_HEIGHT - 72);
      ctx.restore();

    } else if (theme === 'panchang') { // 🪔 Traditional Saffron Panchang
      const grad = ctx.createRadialGradient(CANVAS_WIDTH / 2, 600, 100, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 1100);
      grad.addColorStop(0, '#78350f');
      grad.addColorStop(0.5, '#451a03');
      grad.addColorStop(1, '#1c0701');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    } else if (theme === 'banarasi') { // ⚜️ Royal Banarasi Crimson & Zari
      const grad = ctx.createRadialGradient(CANVAS_WIDTH / 2, 800, 80, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 1100);
      grad.addColorStop(0, '#881337');
      grad.addColorStop(0.5, '#4c0519');
      grad.addColorStop(1, '#1f020a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    } else if (theme === 'shiva') { // 🕉️ Divine Shiva Neelkanth Blue
      const grad = ctx.createRadialGradient(CANVAS_WIDTH / 2, 700, 100, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 1200);
      grad.addColorStop(0, '#0369a1');
      grad.addColorStop(0.5, '#075985');
      grad.addColorStop(1, '#082f49');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    } else if (theme === 'nature') { // 🌿 Emerald Nature & Mercury Jade
      const grad = ctx.createRadialGradient(CANVAS_WIDTH / 2, 700, 100, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 1200);
      grad.addColorStop(0, '#065f46');
      grad.addColorStop(0.5, '#064e3b');
      grad.addColorStop(1, '#022c22');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    } else if (theme === 'copper') { // 🏛️ Antique Copper Inscription
      const grad = ctx.createRadialGradient(CANVAS_WIDTH / 2, 700, 100, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 1200);
      grad.addColorStop(0, '#7c2d12');
      grad.addColorStop(0.5, '#431407');
      grad.addColorStop(1, '#1e0802');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    } else if (theme === 'obsidian') { // 🌑 OLED Pure Obsidian
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    } else if (theme === 'saffron') { // 🌅 Surya Dawn Saffron
      const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      grad.addColorStop(0, '#c2410c');
      grad.addColorStop(0.4, '#9a3412');
      grad.addColorStop(1, '#431407');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    } else if (theme === 'cosmic') { // 🌌 Deep Cosmic Galaxy
      const grad = ctx.createRadialGradient(CANVAS_WIDTH / 2, 700, 100, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 1200);
      grad.addColorStop(0, '#3b0764');
      grad.addColorStop(0.5, '#0f172a');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    } else if (theme === 'cyber') { // ⚡ Cyber Neon
      const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      grad.addColorStop(0, '#083344');
      grad.addColorStop(0.5, '#021e2f');
      grad.addColorStop(1, '#020b12');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    } else { // royal / minimal
      const grad = ctx.createRadialGradient(CANVAS_WIDTH / 2, 800, 80, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 1100);
      grad.addColorStop(0, '#701a75');
      grad.addColorStop(0.6, '#2e0854');
      grad.addColorStop(1, '#0d021a');
      ctx.fillStyle = grad;
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

    // Zodiac Symbol or Custom Uploaded Image
    if (sign.customImage && (sign.customImage.complete || sign.customImage instanceof HTMLImageElement)) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(CANVAS_WIDTH / 2, badgeY, 80, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(sign.customImage, CANVAS_WIDTH / 2 - 80, badgeY - 80, 160, 160);
      ctx.restore();
    } else {
      ctx.font = '90px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#fef08a';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(sign.symbol || '♈', CANVAS_WIDTH / 2, badgeY - 5);
    }

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

    ctx.font = '800 38px "Noto Sans Devanagari", sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'left';
    ctx.fillText('🎨 शुभ रंग:', 170, 825);

    const colVal = sign.luckyColor || 'पीला (Yellow)';
    let colFontSize = 42;
    ctx.font = `900 ${colFontSize}px "Noto Sans Devanagari", sans-serif`;
    while (ctx.measureText(colVal).width > 440 && colFontSize > 26) {
      colFontSize -= 2;
      ctx.font = `900 ${colFontSize}px "Noto Sans Devanagari", sans-serif`;
    }
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'right';
    ctx.fillText(colVal, CANVAS_WIDTH - 170, 825);

    // 2. Lucky Number Box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    roundRect(ctx, 130, 920, CANVAS_WIDTH - 260, 140, 24);
    ctx.fill();
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = '800 38px "Noto Sans Devanagari", sans-serif';
    ctx.fillStyle = '#fbbf24';
    ctx.textAlign = 'left';
    ctx.fillText('🔢 शुभ अंक:', 170, 1005);

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
    ctx.fillStyle = 'rgba(0, 0, 0, 0.70)';
    roundRect(ctx, 80, 560, CANVAS_WIDTH - 160, 920, 36);
    ctx.fill();
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.font = '900 48px "Noto Sans Devanagari", sans-serif';
    ctx.fillStyle = '#fbbf24';
    ctx.textAlign = 'center';
    ctx.fillText('📖 दैनिक भविष्यफल (Prediction)', CANVAS_WIDTH / 2, 645);

    // Inner Text Box with subtle glass border
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    roundRect(ctx, 120, 705, CANVAS_WIDTH - 240, 735, 24);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.10)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Devanagari Word-Wrapped Paragraph with dynamic sizing
    const text = sign.prediction || 'आज का दिन आपके लिए मंगलकारी रहेगा। बिगड़े कार्य पूरे होंगे और आर्थिक लाभ मिलेगा।';
    const fontSize = projectData.predictionFontSize || 42;
    const lineHeight = Math.round(fontSize * 1.52);

    ctx.font = `600 ${fontSize}px "Noto Sans Devanagari", sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    wrapText(ctx, text, 160, 745, CANVAS_WIDTH - 320, lineHeight);

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
  // Layer 5: 12-Zodiacs 1-Page All-in-One Poster / Video Mode
  // ══════════════════════════════════════════════════════════════════
  function drawPosterLayout(time) {
    const signs = (typeof ContentScraper !== 'undefined') ? ContentScraper.ZODIAC_SIGNS : [];
    const targetDate = parseDateSafe(projectData.targetDate);
    const days = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
    const months = ['जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];
    const dateStr = `${targetDate.getDate()} ${months[targetDate.getMonth()]} ${targetDate.getFullYear()} ${days[targetDate.getDay()]}`;

    const isNewspaper = projectData.theme === 'newspaper';
    const isBhojpatra = projectData.theme === 'bhojpatra';
    const isPanchang = projectData.theme === 'panchang';

    // 1. Poster Canvas Background (Paper/Parchment or Classic White)
    if (isNewspaper) {
      ctx.fillStyle = '#f8f4e9';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 5;
      ctx.strokeRect(18, 18, CANVAS_WIDTH - 36, CANVAS_HEIGHT - 36);
    } else if (isBhojpatra) {
      const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      bgGrad.addColorStop(0, '#fef3c7');
      bgGrad.addColorStop(0.5, '#fde68a');
      bgGrad.addColorStop(1, '#f59e0b');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 5;
      ctx.strokeRect(18, 18, CANVAS_WIDTH - 36, CANVAS_HEIGHT - 36);
    } else if (isPanchang) {
      ctx.fillStyle = '#fffbeb';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 5;
      ctx.strokeRect(18, 18, CANVAS_WIDTH - 36, CANVAS_HEIGHT - 36);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.strokeStyle = '#991b1b';
      ctx.lineWidth = 5;
      ctx.strokeRect(18, 18, CANVAS_WIDTH - 36, CANVAS_HEIGHT - 36);
    }

    // 2. Top Header Title
    ctx.save();
    ctx.font = '900 78px "Noto Sans Devanagari", "Yatra One", sans-serif';
    ctx.fillStyle = isNewspaper ? '#0f172a' : '#111827';
    ctx.textAlign = 'center';
    ctx.fillText('आज का राशिफल', CANVAS_WIDTH / 2, 95);

    // Date Subheading
    ctx.font = '800 42px "Noto Sans Devanagari", sans-serif';
    ctx.fillStyle = '#1e293b';
    ctx.fillText(dateStr, CANVAS_WIDTH / 2, 165);

    // Channel Brand / Watermark Badge (Top Right)
    ctx.font = '800 28px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#d97706';
    ctx.textAlign = 'right';
    ctx.fillText(projectData.channelName || '@DailyRashifal', CANVAS_WIDTH - 40, 80);
    ctx.restore();

    // Top Divider Line
    ctx.beginPath();
    ctx.moveTo(40, 195);
    ctx.lineTo(CANVAS_WIDTH - 40, 195);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 3. 12-Zodiac Grid (3 Columns x 4 Rows)
    const startX = 36;
    const startY = 215;
    const gapX = 14;
    const gapY = 14;
    const colCount = 3;
    const boxW = Math.floor((CANVAS_WIDTH - (startX * 2) - (gapX * (colCount - 1))) / colCount); // ~326px
    const boxH = 370;

    const cardColors = [
      { border: '#dc2626', header: '#b91c1c' }, // Red (Aries)
      { border: '#2563eb', header: '#1d4ed8' }, // Blue (Taurus)
      { border: '#0284c7', header: '#0369a1' }, // Sky (Gemini)
      { border: '#dc2626', header: '#b91c1c' }, // Red (Cancer)
      { border: '#d97706', header: '#b45309' }, // Orange (Leo)
      { border: '#059669', header: '#047857' }, // Green (Virgo)
      { border: '#7c3aed', header: '#6d28d9' }, // Purple (Libra)
      { border: '#dc2626', header: '#b91c1c' }, // Red (Scorpio)
      { border: '#2563eb', header: '#1d4ed8' }, // Blue (Sagittarius)
      { border: '#059669', header: '#047857' }, // Green (Capricorn)
      { border: '#b91c1c', header: '#991b1b' }, // Maroon (Aquarius)
      { border: '#0284c7', header: '#0369a1' }  // Ocean (Pisces)
    ];

    for (let i = 0; i < signs.length; i++) {
      const sign = signs[i];
      const col = i % colCount;
      const row = Math.floor(i / colCount);
      const x = startX + col * (boxW + gapX);
      const y = startY + row * (boxH + gapY);

      const colorScheme = cardColors[i % cardColors.length];
      const signData = (projectData.allSignsData && projectData.allSignsData[sign.id]) || sign;

      // Draw Box
      ctx.save();
      ctx.fillStyle = '#ffffff';
      roundRect(ctx, x, y, boxW, boxH, 16);
      ctx.fill();
      ctx.strokeStyle = colorScheme.border;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Card Header: Sign Name (Left) + Sign Symbol / Icon (Right)
      ctx.font = '900 44px "Noto Sans Devanagari", sans-serif';
      ctx.fillStyle = colorScheme.header;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(sign.nameHi, x + 16, y + 16);

      // Sign Symbol or Custom Image
      if (signData.customImage && (signData.customImage.complete || signData.customImage instanceof HTMLImageElement)) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + boxW - 36, y + 36, 24, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(signData.customImage, x + boxW - 60, y + 12, 48, 48);
        ctx.restore();
      } else {
        ctx.font = '36px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = colorScheme.header;
        ctx.textAlign = 'right';
        ctx.fillText(sign.symbol || '♈', x + boxW - 16, y + 18);
      }

      // Divider inside box
      ctx.beginPath();
      ctx.moveTo(x + 12, y + 72);
      ctx.lineTo(x + boxW - 12, y + 72);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Prediction Text Lines
      const predText = signData.prediction || 'आज का दिन शुभ रहेगा। सोचे हुए कार्य पूरे होंगे और लाभ मिलेगा।';
      ctx.font = '600 24px "Noto Sans Devanagari", sans-serif';
      ctx.fillStyle = '#1e293b';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      wrapText(ctx, predText, x + 14, y + 84, boxW - 28, 38);

      ctx.restore();
    }

    // 4. Bottom Footer Call-To-Action (Matching Image 2)
    ctx.save();
    ctx.fillStyle = '#ffffff';
    roundRect(ctx, 36, 1770, CANVAS_WIDTH - 72, 110, 16);
    ctx.fill();
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.font = '900 38px "Noto Sans Devanagari", sans-serif';
    ctx.fillStyle = '#dc2626';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('रोज सबसे पहले सटीक राशिफल पाने के लिए 👍 Follow/Subscribe करें!', CANVAS_WIDTH / 2, 1825);
    ctx.restore();
  }

  // 1-Click HD Poster Image Download (1080x1920 PNG)
  function downloadPosterImage() {
    renderFrame(0);
    const link = document.createElement('a');
    link.download = `Rashifal_12_Signs_Poster_${projectData.targetDate || 'today'}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
  }

  // ══════════════════════════════════════════════════════════════════
  // 4. In-Browser Audio Synthesizer & Custom Audio Player
  // ══════════════════════════════════════════════════════════════════
  let customAudioBuffer = null;

  function setCustomAudioFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      try {
        customAudioBuffer = await audioCtx.decodeAudioData(e.target.result);
        bgmType = 'custom';
        alert('✅ आपका कस्टम बैकग्राउंड ऑडियो लोड हो गया!');
      } catch (err) {
        alert('⚠️ ऑडियो डिकोड करने में त्रुटि: ' + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
  }

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

    if (bgmType === 'custom' && customAudioBuffer) {
      const src = audioCtx.createBufferSource();
      src.buffer = customAudioBuffer;
      src.loop = true;
      src.connect(gain);
      src.start(now);
      src.stop(now + totalDuration + 2);
      return;
    }

    // 10 Peaceful Soundscapes Tuning Matrices
    let freqs = [108, 162, 216, 324, 432, 540]; // 1. 432Hz Spiritual Tanpura (Default)
    let waveType = 'sine';

    if (bgmType === 'temple_bells') { // 2. Morning Temple Bells
      freqs = [220, 440, 660, 880, 1320];
      waveType = 'triangle';
    } else if (bgmType === 'meditation_drone') { // 3. 528Hz Alpha Waves Drone
      freqs = [132, 264, 528, 792, 1056];
      waveType = 'sine';
    } else if (bgmType === 'bansuri') { // 4. Krishna Bansuri Harmonics
      freqs = [144, 216, 288, 432, 576, 864];
      waveType = 'triangle';
    } else if (bgmType === 'sitar') { // 5. Vedic Sitar & Swar Alap
      freqs = [110, 165, 220, 330, 440, 550];
      waveType = 'sawtooth';
    } else if (bgmType === 'peaceful_rain') { // 6. Nature Rain & Temple Tone
      freqs = [96, 144, 192, 288, 384, 576];
      waveType = 'sine';
    } else if (bgmType === 'om_chant') { // 7. Gayatri & Om Resonance
      freqs = [136.1, 272.2, 408.3, 544.4];
      waveType = 'sine';
    } else if (bgmType === 'singing_bowl') { // 8. Tibetan Singing Bowl
      freqs = [216, 432, 648, 864, 1296];
      waveType = 'sine';
    } else if (bgmType === 'chakra') { // 9. 741Hz Chakra Cleansing
      freqs = [185.25, 370.5, 741, 1111.5];
      waveType = 'triangle';
    } else if (bgmType === 'brahma_muhurta') { // 10. Brahma Muhurta Sunrise
      freqs = [120, 180, 240, 360, 480, 720];
      waveType = 'sine';
    }

    freqs.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const oscGain = audioCtx.createGain();

      osc.type = (waveType === 'sawtooth' && idx > 2) ? 'sine' : waveType;
      osc.frequency.setValueAtTime(freq, now);

      const noteVol = (waveType === 'sawtooth' ? 0.02 : 0.07) * vol;
      oscGain.gain.setValueAtTime(noteVol, now);
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

  function setPredictionFontSize(size) {
    projectData.predictionFontSize = parseInt(size, 10) || 42;
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

  function setLayoutMode(mode) {
    projectData.layoutMode = mode; // 'single' (4 scenes animation) or 'poster' (12-in-1 static video/image)
    renderFrame(currentTime);
  }

  function setAllSignsData(data) {
    projectData.allSignsData = data;
    renderFrame(currentTime);
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
    setPredictionFontSize: setPredictionFontSize,
    setLayoutMode: setLayoutMode,
    setAllSignsData: setAllSignsData,
    setCustomAudioFile: setCustomAudioFile,
    downloadPosterImage: downloadPosterImage,
    exportVideo: exportVideo,
    getProjectData: () => projectData,
    getTotalDuration: () => totalDuration
  };
})();

// Attach globally
if (typeof window !== 'undefined') {
  window.VideoEngine = VideoEngine;
}
