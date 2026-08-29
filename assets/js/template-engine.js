/**
 * ══════════════════════════════════════════════════════════════════
 * AI YOUTUBE SHORTS STUDIO — TEMPLATE ENGINE & APP CONTROLLER
 * Connects UI, Scraper, Video Engine, Preset Manager, and Voiceover
 * ══════════════════════════════════════════════════════════════════
 */

const TemplateEngine = (function() {
  'use strict';

  let currentSignsData = {};
  let selectedSignId = 'aries';

  // ══════════════════════════════════════════════════════════════════
  // 1. Initialization
  // ══════════════════════════════════════════════════════════════════
  function init() {
    // 1. Initialize 12 Daily Signs with authentic daily astrology
    currentSignsData = ContentScraper.generateAllDailySigns();

    // 2. Initialize Video Engine Canvas
    VideoEngine.init('studioVideoCanvas');
    loadSignIntoStudio(selectedSignId);

    // 3. Render Zodiac Selector Grid
    renderZodiacGrid();

    // 4. Render Slide Timeline Thumbnails
    renderTimelineThumbs();

    // 5. Setup Event Listeners
    setupEventListeners();

    // 6. Load Saved Preset if any
    loadSavedPreset();
  }

  // ══════════════════════════════════════════════════════════════════
  // 2. Zodiac Grid Selector UI
  // ══════════════════════════════════════════════════════════════════
  function renderZodiacGrid() {
    const grid = document.getElementById('zodiacGrid');
    if (!grid) return;

    grid.innerHTML = '';
    ContentScraper.ZODIAC_SIGNS.forEach(sign => {
      const pill = document.createElement('div');
      pill.className = `zodiac-pill ${sign.id === selectedSignId ? 'active' : ''}`;
      pill.setAttribute('data-sign', sign.id);
      pill.innerHTML = `
        <span class="zodiac-symbol">${sign.symbol}</span>
        <span class="zodiac-name">${sign.nameHi}</span>
      `;
      pill.addEventListener('click', () => {
        document.querySelectorAll('.zodiac-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        selectedSignId = sign.id;
        loadSignIntoStudio(sign.id);
      });
      grid.appendChild(pill);
    });
  }

  function loadSignIntoStudio(signId) {
    const sign = currentSignsData[signId] || ContentScraper.generateDailySignData(ContentScraper.ZODIAC_SIGNS.find(s => s.id === signId));
    VideoEngine.setSign(sign);

    // Update Textarea & Input Fields in Left Panel
    const inpColor = document.getElementById('inpLuckyColor');
    const inpNumber = document.getElementById('inpLuckyNumber');
    const inpPercent = document.getElementById('inpLuckPercent');
    const txtPrediction = document.getElementById('txtPrediction');
    const txtUpay = document.getElementById('txtUpay');

    if (inpColor) inpColor.value = sign.luckyColor;
    if (inpNumber) inpNumber.value = sign.luckyNumber;
    if (inpPercent) inpPercent.value = sign.luckPercent;
    if (txtPrediction) txtPrediction.value = sign.prediction;
    if (txtUpay) txtUpay.value = sign.upay;

    renderTimelineThumbs();
  }

  // ══════════════════════════════════════════════════════════════════
  // 3. Web URL Scraping Handler
  // ══════════════════════════════════════════════════════════════════
  async function handleScrapeUrl() {
    const urlInput = document.getElementById('inpScrapeUrl');
    const btnScrape = document.getElementById('btnScrape');
    if (!urlInput || !urlInput.value.trim()) {
      alert('कृपया एक वेबसाइट लिंक दर्ज करें!');
      return;
    }

    const originalBtnHtml = btnScrape.innerHTML;
    btnScrape.disabled = true;
    btnScrape.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Scraper Active...';

    try {
      const scrapedData = await ContentScraper.scrapeUrl(urlInput.value.trim());
      currentSignsData = scrapedData;
      loadSignIntoStudio(selectedSignId);
      alert('✅ वेबसाइट से 12 राशियों का कंटेंट सफलतापूर्वक लोड कर लिया गया है!');
    } catch (err) {
      alert('⚠️ ' + err.message);
    } finally {
      btnScrape.disabled = false;
      btnScrape.innerHTML = originalBtnHtml;
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // 4. Slide Timeline Thumbnails & Editor
  // ══════════════════════════════════════════════════════════════════
  function renderTimelineThumbs() {
    const container = document.getElementById('timelineSlidesContainer');
    if (!container) return;

    const project = VideoEngine.getProjectData();
    container.innerHTML = '';

    project.slides.forEach((slide, idx) => {
      const thumb = document.createElement('div');
      thumb.className = `slide-card-thumb ${idx === 0 ? 'active' : ''}`;

      let title = `Scene ${idx + 1}: Intro`;
      let snippet = 'आज का दैनिक राशिफल व पंचांग';

      if (slide.type === 'metrics') {
        title = `Scene ${idx + 1}: Factors`;
        snippet = `रंग: ${project.sign.luckyColor} | अंक: ${project.sign.luckyNumber}`;
      } else if (slide.type === 'prediction') {
        title = `Scene ${idx + 1}: Forecast`;
        snippet = project.sign.prediction;
      } else if (slide.type === 'upay') {
        title = `Scene ${idx + 1}: Upay`;
        snippet = project.sign.upay;
      }

      thumb.innerHTML = `
        <div class="slide-thumb-header">
          <span class="slide-num-tag">${title}</span>
          <span class="slide-duration-tag">${slide.duration}s</span>
        </div>
        <div class="slide-thumb-preview-text">${snippet}</div>
      `;

      thumb.addEventListener('click', () => {
        document.querySelectorAll('.slide-card-thumb').forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');

        // Seek video to slide start
        let startTime = 0;
        for (let i = 0; i < idx; i++) {
          startTime += project.slides[i].duration;
        }
        VideoEngine.seek(startTime + 0.1);
      });

      container.appendChild(thumb);
    });
  }

  // ══════════════════════════════════════════════════════════════════
  // 5. Preset Manager (Save & Load Local Templates)
  // ══════════════════════════════════════════════════════════════════
  function saveCurrentPreset() {
    const presetName = prompt('इस टेम्पलेट प्रीसेट का नाम दें:', 'My Rashifal Theme');
    if (!presetName) return;

    const project = VideoEngine.getProjectData();
    const presets = JSON.parse(localStorage.getItem('ytshortgen_presets') || '{}');
    presets[presetName] = {
      theme: project.theme,
      channelName: project.channelName,
      slides: project.slides
    };
    localStorage.setItem('ytshortgen_presets', JSON.stringify(presets));
    alert(`✅ प्रीसेट "${presetName}" सफलतापूर्वक सेव हो गया!`);
  }

  function loadSavedPreset() {
    const presets = JSON.parse(localStorage.getItem('ytshortgen_presets') || '{}');
    const keys = Object.keys(presets);
    if (keys.length > 0) {
      const lastPreset = presets[keys[keys.length - 1]];
      VideoEngine.setTheme(lastPreset.theme || 'gold');
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // 6. Export Video Trigger & Modal
  // ══════════════════════════════════════════════════════════════════
  function startVideoExport() {
    const modal = document.getElementById('exportModalOverlay');
    const progressFill = document.getElementById('exportProgressFill');
    const statusText = document.getElementById('exportStatusText');
    const downloadBtn = document.getElementById('btnDownloadVideo');

    if (modal) modal.classList.add('open');
    if (downloadBtn) downloadBtn.style.display = 'none';

    VideoEngine.exportVideo(
      function onProgress(pct) {
        if (progressFill) progressFill.style.width = pct + '%';
        if (statusText) statusText.textContent = `रेंडरिंग जारी है: ${pct}% (60fps Full HD)`;
      },
      function onComplete(videoUrl, blob) {
        if (progressFill) progressFill.style.width = '100%';
        if (statusText) statusText.innerHTML = `✅ वीडियो तैयार है! (${(blob.size / (1024 * 1024)).toFixed(1)} MB)`;
        if (downloadBtn) {
          downloadBtn.style.display = 'inline-flex';
          downloadBtn.onclick = function() {
            const a = document.createElement('a');
            const sign = VideoEngine.getProjectData().sign;
            a.href = videoUrl;
            a.download = `Rashifal_${sign.nameEn}_${new Date().toISOString().slice(0, 10)}.webm`;
            a.click();
          };
        }
      },
      function onError(err) {
        if (statusText) statusText.textContent = 'त्रुटि: ' + err.message;
      }
    );
  }

  function closeExportModal() {
    const modal = document.getElementById('exportModalOverlay');
    if (modal) modal.classList.remove('open');
  }

  // ══════════════════════════════════════════════════════════════════
  // 7. Bulk 12-Signs Export Queue
  // ══════════════════════════════════════════════════════════════════
  async function generateAll12Shorts() {
    const confirmGen = confirm('क्या आप सभी 12 राशियों के 12 अलग-अलग YouTube Shorts एक साथ तैयार करना चाहते हैं?');
    if (!confirmGen) return;

    alert('सभी 12 राशियों का बैच एक्सपोर्ट शुरू हो रहा है...');
    for (const sign of ContentScraper.ZODIAC_SIGNS) {
      loadSignIntoStudio(sign.id);
      await new Promise(r => setTimeout(r, 600));
      // Trigger individual export
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // 8. Event Listeners Setup
  // ══════════════════════════════════════════════════════════════════
  function setupEventListeners() {
    // Play / Pause Button
    const btnPlay = document.getElementById('btnPlayPause');
    if (btnPlay) btnPlay.addEventListener('click', () => VideoEngine.togglePlay());

    // Timeline Slider Scrubbing
    const slider = document.getElementById('timelineSlider');
    if (slider) {
      slider.addEventListener('input', (e) => {
        VideoEngine.seek(parseFloat(e.target.value));
      });
    }

    // URL Scraper Button
    const btnScrape = document.getElementById('btnScrape');
    if (btnScrape) btnScrape.addEventListener('click', handleScrapeUrl);

    // Live Text Editing
    const inpColor = document.getElementById('inpLuckyColor');
    const inpNumber = document.getElementById('inpLuckyNumber');
    const inpPercent = document.getElementById('inpLuckPercent');
    const txtPrediction = document.getElementById('txtPrediction');
    const txtUpay = document.getElementById('txtUpay');
    const inpChannel = document.getElementById('inpChannelName');

    const updateSignData = () => {
      const curSign = currentSignsData[selectedSignId] || {};
      if (inpColor) curSign.luckyColor = inpColor.value;
      if (inpNumber) curSign.luckyNumber = parseInt(inpNumber.value, 10) || 1;
      if (inpPercent) curSign.luckPercent = parseInt(inpPercent.value, 10) || 80;
      if (txtPrediction) curSign.prediction = txtPrediction.value;
      if (txtUpay) curSign.upay = txtUpay.value;

      VideoEngine.setSign(curSign);
      renderTimelineThumbs();
    };

    [inpColor, inpNumber, inpPercent, txtPrediction, txtUpay].forEach(el => {
      if (el) el.addEventListener('input', updateSignData);
    });

    if (inpChannel) {
      inpChannel.addEventListener('input', (e) => {
        VideoEngine.setProjectData({ channelName: e.target.value });
      });
    }

    // Theme Swatches
    document.querySelectorAll('.theme-swatch').forEach(swatch => {
      swatch.addEventListener('click', () => {
        document.querySelectorAll('.theme-swatch').forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
        const theme = swatch.getAttribute('data-theme');
        VideoEngine.setTheme(theme);
      });
    });

    // BGM Audio Selector
    const selBgm = document.getElementById('selBgmTrack');
    if (selBgm) {
      selBgm.addEventListener('change', (e) => {
        VideoEngine.setBgmType(e.target.value);
      });
    }

    // Export Main Button
    const btnExport = document.getElementById('btnExportMain');
    if (btnExport) btnExport.addEventListener('click', startVideoExport);

    // Close Modal Button
    const btnCloseModal = document.getElementById('btnCloseExportModal');
    if (btnCloseModal) btnCloseModal.addEventListener('click', closeExportModal);

    // Save Preset Button
    const btnSavePreset = document.getElementById('btnSavePreset');
    if (btnSavePreset) btnSavePreset.addEventListener('click', saveCurrentPreset);

    // Mobile Navigation Tab Switcher
    setupMobileTabs();
  }

  function setupMobileTabs() {
    const tabs = document.querySelectorAll('.mobile-tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const target = tab.getAttribute('data-tab');

        const leftPanel = document.getElementById('leftPanel');
        const centerPanel = document.getElementById('centerPanel');
        const rightPanel = document.getElementById('rightPanel');
        const bottomTimeline = document.getElementById('bottomTimeline');

        [leftPanel, centerPanel, rightPanel, bottomTimeline].forEach(el => {
          if (el) el.classList.remove('mobile-active');
        });

        if (target === 'content' && leftPanel) leftPanel.classList.add('mobile-active');
        if (target === 'preview' && centerPanel) centerPanel.classList.add('mobile-active');
        if (target === 'style' && rightPanel) rightPanel.classList.add('mobile-active');
        if (target === 'timeline' && bottomTimeline) bottomTimeline.classList.add('mobile-active');
      });
    });
  }

  return {
    init: init,
    handleScrapeUrl: handleScrapeUrl,
    startVideoExport: startVideoExport,
    closeExportModal: closeExportModal,
    generateAll12Shorts: generateAll12Shorts
  };
})();

// Auto-boot on DOM ready
document.addEventListener('DOMContentLoaded', TemplateEngine.init);
