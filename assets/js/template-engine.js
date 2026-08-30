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
  let targetDateObj = new Date(Date.now() + 86400000); // Tomorrow by default
  let selectedDateMode = 'tomorrow';
  let currentLengthMode = 'detailed';

  // ══════════════════════════════════════════════════════════════════
  // 1. Initialization
  // ══════════════════════════════════════════════════════════════════
  function init() {
    try {
      // 1. Initialize 12 Daily Signs with authentic astrology for target date (Tomorrow by default)
      currentSignsData = ContentScraper.generateAllDailySigns(targetDateObj, currentLengthMode);

      // 2. Initialize Video Engine Canvas
      VideoEngine.init('studioVideoCanvas');
      const isoDate = targetDateObj.toISOString().slice(0, 10);
      VideoEngine.setTargetDate(isoDate);
      loadSignIntoStudio(selectedSignId);

      // 3. Render Zodiac Selector Grid & Popular Sources
      renderZodiacGrid();
      renderPopularSourceChips();
      addSourceRow('https://www.astrosage.com/rashifal/kal-ka-rashifal.asp');

      // 4. Render Slide Timeline Thumbnails
      renderTimelineThumbs();

      // 5. Setup Event Listeners & Date / Length Controls
      setupEventListeners();
      setupDateControls();
      setupLengthAndFontControls();

      // 6. Load Saved Preset if any
      loadSavedPreset();
    } catch (err) {
      console.error('Studio init error:', err);
    }
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
    currentSignsData[signId] = sign;
    VideoEngine.setSign(sign);
    VideoEngine.setAllSignsData(currentSignsData);

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

    // Load Star Ratings into selects
    const ratings = sign.ratings || { health: 4, wealth: 5, family: 4, love: 3, business: 5, marriage: 4 };
    const selHealth = document.getElementById('selRatingHealth');
    const selWealth = document.getElementById('selRatingWealth');
    const selFamily = document.getElementById('selRatingFamily');
    const selLove = document.getElementById('selRatingLove');
    const selBusiness = document.getElementById('selRatingBusiness');
    const selMarriage = document.getElementById('selRatingMarriage');

    if (selHealth) selHealth.value = String(ratings.health || 4);
    if (selWealth) selWealth.value = String(ratings.wealth || 5);
    if (selFamily) selFamily.value = String(ratings.family || 4);
    if (selLove) selLove.value = String(ratings.love || 3);
    if (selBusiness) selBusiness.value = String(ratings.business || 5);
    if (selMarriage) selMarriage.value = String(ratings.marriage || 4);

    renderTimelineThumbs();
  }

  // ══════════════════════════════════════════════════════════════════
  // 3. Multi-Source URL Management & Scraping Handler
  // ══════════════════════════════════════════════════════════════════
  function renderPopularSourceChips() {
    const chipContainer = document.getElementById('popularSourcesList');
    if (!chipContainer) return;

    chipContainer.innerHTML = '';
    ContentScraper.POPULAR_SOURCES.forEach(src => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'source-quick-chip';
      chip.innerHTML = `<span>+ ${src.name}</span>`;
      chip.addEventListener('click', () => {
        addSourceRow(src.url);
      });
      chipContainer.appendChild(chip);
    });
  }

  function addSourceRow(url = '') {
    const container = document.getElementById('sourcesListContainer');
    if (!container) return;

    const row = document.createElement('div');
    row.className = 'source-url-row';
    row.innerHTML = `
      <input type="url" class="studio-input source-url-input" placeholder="https://example.com/aaj-ka-rashifal" value="${url}">
      <button type="button" class="btn-remove-source" onclick="TemplateEngine.removeSourceRow(this)" title="हटाएं"><i class="fa-solid fa-trash-can"></i></button>
    `;
    container.appendChild(row);
  }

  function removeSourceRow(btn) {
    const container = document.getElementById('sourcesListContainer');
    if (!container) return;
    const row = btn.closest('.source-url-row');
    if (row && container.children.length > 1) {
      row.remove();
    } else if (row) {
      row.querySelector('.source-url-input').value = '';
    }
  }

  async function handleScrapeUrl() {
    const inputs = document.querySelectorAll('.source-url-input');
    const urls = Array.from(inputs).map(inp => inp.value.trim()).filter(u => u.length > 0);

    const btnScrape = document.getElementById('btnScrape');
    if (urls.length === 0) {
      alert('कृपया कम से कम एक वेबसाइट लिंक दर्ज करें!');
      return;
    }

    const defaultBtnHtml = '<i class="fa-solid fa-bolt"></i> डेटा फेच करें';
    btnScrape.disabled = true;
    btnScrape.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> डेटा लोड हो रहा है...';

    try {
      const scrapedData = await ContentScraper.scrapeMultipleUrls(urls);
      currentSignsData = scrapedData;
      VideoEngine.setAllSignsData(currentSignsData);

      // If user entered a single-sign URL (e.g. mesh-kal-ka-rashifal.asp), auto-select that sign
      const singleSignMatch = ContentScraper.ZODIAC_SIGNS.find(s => urls.some(u => u.includes(s.astroSlug) || u.includes(s.id) || u.toLowerCase().includes(s.nameEn.toLowerCase())));
      if (singleSignMatch && scrapedData[singleSignMatch.id]) {
        selectedSignId = singleSignMatch.id;
        document.querySelectorAll('.zodiac-grid-pill').forEach(pill => {
          if (pill.getAttribute('data-sign') === selectedSignId) {
            pill.classList.add('active');
          } else {
            pill.classList.remove('active');
          }
        });
      }

      loadSignIntoStudio(selectedSignId);
      btnScrape.innerHTML = '<i class="fa-solid fa-check"></i> डेटा लोड हो गया!';
      setTimeout(() => {
        btnScrape.disabled = false;
        btnScrape.innerHTML = defaultBtnHtml;
      }, 2000);
    } catch (err) {
      alert('⚠️ ' + err.message);
      btnScrape.disabled = false;
      btnScrape.innerHTML = defaultBtnHtml;
    }
  }

  function handlePasteText() {
    const raw = prompt('यहाँ किसी भी वेबसाइट से कॉपी किया गया राशिफल या समाचार टेक्स्ट पेस्ट करें:');
    if (!raw || raw.trim().length < 20) return;

    try {
      const parsedData = ContentScraper.parseAstrologyText(raw);
      currentSignsData = parsedData;
      VideoEngine.setAllSignsData(currentSignsData);
      loadSignIntoStudio(selectedSignId);
      alert('✅ पेस्ट किए गए टेक्स्ट से 12 राशियों का कंटेंट सफलतापूर्वक लोड हो गया!');
    } catch (e) {
      alert('⚠️ टेक्स्ट प्रोसेस नहीं हो सका: ' + e.message);
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
      } else if (slide.type === 'ratings') {
        title = `Scene ${idx + 1}: Stars`;
        snippet = 'स्वास्थ्य, धन, परिवार, प्रेम, व्यवसाय, विवाह';
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

    try {
      const project = VideoEngine.getProjectData();
      const presets = (typeof localStorage !== 'undefined') ? JSON.parse(localStorage.getItem('ytshortgen_presets') || '{}') : {};
      presets[presetName] = {
        theme: project.theme,
        channelName: project.channelName,
        slides: project.slides
      };
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('ytshortgen_presets', JSON.stringify(presets));
      }
      alert(`✅ प्रीसेट "${presetName}" सफलतापूर्वक सेव हो गया!`);
    } catch(e) {
      console.warn('Could not save preset to localStorage:', e);
    }
  }

  function loadSavedPreset() {
    try {
      if (typeof localStorage === 'undefined') return;
      const presets = JSON.parse(localStorage.getItem('ytshortgen_presets') || '{}');
      const keys = Object.keys(presets);
      if (keys.length > 0) {
        const lastPreset = presets[keys[keys.length - 1]];
        VideoEngine.setTheme(lastPreset.theme || 'gold');
      }
    } catch(e) {
      console.warn('Could not load preset from localStorage:', e);
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // 6. Single Video Export Trigger & Modal
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
            const signName = sign.nameEn || sign.signNameEn || 'Aries';
            const dateStr = targetDateObj ? targetDateObj.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
            a.href = videoUrl;
            a.download = `Rashifal_${signName}_${dateStr}.webm`;
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
  // 7. Bulk 12-Signs Batch Export Studio Queue & Multi-Downloader
  // ══════════════════════════════════════════════════════════════════
  const batchRenderedVideos = {};
  let isBatchRunning = false;

  function openBatchModal() {
    const modal = document.getElementById('batchExportModalOverlay');
    if (modal) modal.classList.add('open');
    renderBatchGrid();
  }

  function closeBatchModal() {
    const modal = document.getElementById('batchExportModalOverlay');
    if (modal) modal.classList.remove('open');
  }

  function renderBatchGrid() {
    const grid = document.getElementById('batchSignsGrid');
    if (!grid) return;

    grid.innerHTML = '';
    ContentScraper.ZODIAC_SIGNS.forEach((sign, idx) => {
      const card = document.createElement('div');
      card.className = 'batch-sign-card';
      card.id = `batchCard_${sign.id}`;

      const rendered = batchRenderedVideos[sign.id];
      const statusHtml = rendered
        ? `<span class="batch-status ready"><i class="fa-solid fa-circle-check"></i> तैयार (${(rendered.blob.size / (1024 * 1024)).toFixed(1)} MB)</span>`
        : `<span class="batch-status pending"><i class="fa-regular fa-clock"></i> प्रतीक्षारत</span>`;

      const downloadBtnHtml = rendered
        ? `<button type="button" class="btn-batch-dl" onclick="TemplateEngine.downloadSingleBatchVideo('${sign.id}')"><i class="fa-solid fa-download"></i> डाउनलोड</button>`
        : `<button type="button" class="btn-batch-dl disabled" disabled><i class="fa-solid fa-download"></i> डाउनलोड</button>`;

      card.innerHTML = `
        <div class="batch-card-top">
          <span class="batch-card-symbol">${sign.symbol}</span>
          <div style="flex:1;">
            <div class="batch-card-title">${idx + 1}. ${sign.nameHi} राशि (${sign.nameEn})</div>
            <div class="batch-card-sub" id="batchSub_${sign.id}">${statusHtml}</div>
          </div>
          ${downloadBtnHtml}
        </div>
      `;
      grid.appendChild(card);
    });

    updateBatchHeaderProgress();
  }

  function updateBatchHeaderProgress() {
    const total = ContentScraper.ZODIAC_SIGNS.length;
    const readyCount = Object.keys(batchRenderedVideos).length;
    const progressFill = document.getElementById('batchOverallProgressFill');
    const statusText = document.getElementById('batchOverallStatusText');
    const dlAllBtn = document.getElementById('btnDownloadAll12');

    const pct = Math.round((readyCount / total) * 100);
    if (progressFill) progressFill.style.width = pct + '%';
    if (statusText) statusText.textContent = `${readyCount} / ${total} वीडियो तैयार (${pct}%)`;

    if (dlAllBtn) {
      if (readyCount > 0) {
        dlAllBtn.classList.remove('disabled');
        dlAllBtn.removeAttribute('disabled');
      } else {
        dlAllBtn.classList.add('disabled');
        dlAllBtn.setAttribute('disabled', 'true');
      }
    }
  }

  async function generateAll12Shorts() {
    openBatchModal();
    if (isBatchRunning) return;
    isBatchRunning = true;

    const startBtn = document.getElementById('btnStartBatchRender');
    if (startBtn) {
      startBtn.disabled = true;
      startBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> रेंडरिंग जारी है...';
    }

    for (let i = 0; i < ContentScraper.ZODIAC_SIGNS.length; i++) {
      const sign = ContentScraper.ZODIAC_SIGNS[i];
      const signData = currentSignsData[sign.id] || ContentScraper.generateDailySignData(sign, targetDateObj);

      // Highlight card in batch grid
      const subEl = document.getElementById(`batchSub_${sign.id}`);
      if (subEl) subEl.innerHTML = `<span class="batch-status rendering"><i class="fa-solid fa-spinner fa-spin"></i> 1080p रेंडरिंग...</span>`;

      // Set sign into engine
      VideoEngine.setSign(signData);

      await new Promise((resolve) => {
        VideoEngine.exportVideo(
          function onProgress(pct) {
            if (subEl) subEl.innerHTML = `<span class="batch-status rendering"><i class="fa-solid fa-spinner fa-spin"></i> ${pct}%</span>`;
          },
          function onComplete(videoUrl, blob) {
            batchRenderedVideos[sign.id] = {
              signId: sign.id,
              nameHi: sign.nameHi,
              nameEn: sign.nameEn,
              url: videoUrl,
              blob: blob
            };
            renderBatchGrid();
            resolve();
          },
          function onError(err) {
            if (subEl) subEl.innerHTML = `<span class="batch-status error">त्रुटि</span>`;
            resolve();
          }
        );
      });
    }

    isBatchRunning = false;
    if (startBtn) {
      startBtn.disabled = false;
      startBtn.innerHTML = '<i class="fa-solid fa-rotate-right"></i> पुनः सभी 12 रेंडर करें';
    }
    updateBatchHeaderProgress();
  }

  function downloadSingleBatchVideo(signId) {
    const item = batchRenderedVideos[signId];
    if (!item) return;

    const a = document.createElement('a');
    a.href = item.url;
    const dateStr = targetDateObj ? targetDateObj.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
    a.download = `Rashifal_${item.nameEn}_${dateStr}.webm`;
    a.click();
  }

  function downloadAllBatchVideos() {
    const keys = Object.keys(batchRenderedVideos);
    if (keys.length === 0) {
      alert('कृपया पहले वीडियो रेंडर होने दें!');
      return;
    }

    let delay = 0;
    keys.forEach((key) => {
      setTimeout(() => {
        downloadSingleBatchVideo(key);
      }, delay);
      delay += 700; // 700ms stagger so browser allows multi-file download
    });
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

      // Update ratings
      const selHealth = document.getElementById('selRatingHealth');
      const selWealth = document.getElementById('selRatingWealth');
      const selFamily = document.getElementById('selRatingFamily');
      const selLove = document.getElementById('selRatingLove');
      const selBusiness = document.getElementById('selRatingBusiness');
      const selMarriage = document.getElementById('selRatingMarriage');

      curSign.ratings = {
        health: selHealth ? parseInt(selHealth.value, 10) : 4,
        wealth: selWealth ? parseInt(selWealth.value, 10) : 5,
        family: selFamily ? parseInt(selFamily.value, 10) : 4,
        love: selLove ? parseInt(selLove.value, 10) : 3,
        business: selBusiness ? parseInt(selBusiness.value, 10) : 5,
        marriage: selMarriage ? parseInt(selMarriage.value, 10) : 4
      };

      currentSignsData[selectedSignId] = curSign;
      VideoEngine.setSign(curSign);
      VideoEngine.setAllSignsData(currentSignsData);
      renderTimelineThumbs();
    };

    [inpColor, inpNumber, inpPercent, txtPrediction, txtUpay,
     document.getElementById('selRatingHealth'),
     document.getElementById('selRatingWealth'),
     document.getElementById('selRatingFamily'),
     document.getElementById('selRatingLove'),
     document.getElementById('selRatingBusiness'),
     document.getElementById('selRatingMarriage')
    ].forEach(el => {
      if (el) {
        el.addEventListener('input', updateSignData);
        el.addEventListener('change', updateSignData);
      }
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

    // Custom Sign Image Upload
    const inpCustomImg = document.getElementById('inpSignCustomImg');
    if (inpCustomImg) {
      inpCustomImg.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const curSign = currentSignsData[selectedSignId] || {};
            curSign.customImage = img;
            VideoEngine.setSign(curSign);
            renderTimelineThumbs();
            alert('✅ इस राशि का फोटो सफलतापूर्ण लोड हो गया!');
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      });
    }

    // Custom BGM Audio File Upload
    const inpCustomAudio = document.getElementById('inpCustomAudio');
    if (inpCustomAudio) {
      inpCustomAudio.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) VideoEngine.setCustomAudioFile(file);
      });
    }

    // Layout Mode Switcher (Single Sign Video vs 12-in-1 Poster Mode)
    const btnLayoutSingle = document.getElementById('btnLayoutSingle');
    const btnLayoutPoster = document.getElementById('btnLayoutPoster');
    const btnDownloadPosterImg = document.getElementById('btnDownloadPosterImg');
    const bottomTimeline = document.getElementById('bottomTimeline');
    const posterTextSizeBar = document.getElementById('posterTextSizeBar');

    if (btnLayoutSingle && btnLayoutPoster) {
      btnLayoutSingle.addEventListener('click', () => {
        btnLayoutSingle.classList.add('active');
        btnLayoutPoster.classList.remove('active');
        if (btnDownloadPosterImg) btnDownloadPosterImg.style.display = 'none';
        if (posterTextSizeBar) posterTextSizeBar.style.display = 'none';
        if (bottomTimeline) bottomTimeline.style.display = 'block';
        VideoEngine.setLayoutMode('single');
      });

      btnLayoutPoster.addEventListener('click', () => {
        btnLayoutPoster.classList.add('active');
        btnLayoutSingle.classList.remove('active');
        if (btnDownloadPosterImg) btnDownloadPosterImg.style.display = 'inline-flex';
        if (posterTextSizeBar) posterTextSizeBar.style.display = 'flex';
        if (bottomTimeline) bottomTimeline.style.display = 'none';
        VideoEngine.setAllSignsData(currentSignsData);
        VideoEngine.setLayoutMode('poster');
      });
    }

    // Poster Live Text Size Slider
    const inpPosterLiveFontSize = document.getElementById('inpPosterLiveFontSize');
    const txtPosterLiveFontSizeVal = document.getElementById('txtPosterLiveFontSizeVal');
    if (inpPosterLiveFontSize) {
      inpPosterLiveFontSize.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        if (txtPosterLiveFontSizeVal) txtPosterLiveFontSizeVal.textContent = val + 'px';
        const leftSizeDisplay = document.getElementById('predictionFontSizeDisplay');
        const leftSizeSlider = document.getElementById('predictionFontSizeSlider');
        if (leftSizeDisplay) leftSizeDisplay.textContent = val + 'px';
        if (leftSizeSlider) leftSizeSlider.value = val;
        VideoEngine.setPosterFontSize(val);
      });
    }

    // Mobile Navigation Tab Switcher
    setupMobileTabs();
  }

  let currentHorizon = 'daily'; // 'daily' | 'weekly' | 'monthly' | 'yearly'
  let currentSubPeriod = 'tomorrow'; // 'today' | 'tomorrow' | 'this_week' | 'next_week' | 'this_month' | 'next_month' | 'this_year' | 'next_year'

  function setupDateControls() {
    const horizonButtons = document.querySelectorAll('.horizon-btn');
    const horizonBadge = document.getElementById('currentHorizonBadge');
    const txtActiveDisplay = document.getElementById('txtActivePeriodDisplay');
    const inpCustomDate = document.getElementById('inpCustomDate');

    const updateHorizonAndPeriod = () => {
      // 1. Calculate targetDateObj based on currentHorizon & currentSubPeriod
      if (currentHorizon === 'daily') {
        if (currentSubPeriod === 'tomorrow') {
          targetDateObj = new Date(Date.now() + 86400000);
          if (inpCustomDate) inpCustomDate.style.display = 'none';
        } else if (currentSubPeriod === 'today') {
          targetDateObj = new Date();
          if (inpCustomDate) inpCustomDate.style.display = 'none';
        } else if (currentSubPeriod === 'custom') {
          if (inpCustomDate) {
            inpCustomDate.style.display = 'block';
            if (inpCustomDate.value) targetDateObj = new Date(inpCustomDate.value);
          }
        }
      } else if (currentHorizon === 'weekly') {
        if (currentSubPeriod === 'this_week') {
          targetDateObj = new Date();
        } else if (currentSubPeriod === 'next_week') {
          targetDateObj = new Date(Date.now() + 7 * 86400000);
        }
      } else if (currentHorizon === 'monthly') {
        if (currentSubPeriod === 'this_month') {
          targetDateObj = new Date();
        } else if (currentSubPeriod === 'next_month') {
          const now = new Date();
          targetDateObj = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        }
      } else if (currentHorizon === 'yearly') {
        if (currentSubPeriod === 'this_year') {
          targetDateObj = new Date(2026, 0, 1);
        } else if (currentSubPeriod === 'next_year') {
          targetDateObj = new Date(2027, 0, 1);
        }
      }

      // 2. Update Video Engine State
      const isoDate = targetDateObj.toISOString().slice(0, 10);
      VideoEngine.setHorizon(currentHorizon, currentSubPeriod, isoDate);

      // 3. Update Text Display Badge in Left Panel
      if (txtActiveDisplay) {
        txtActiveDisplay.textContent = VideoEngine.getFormattedPeriodString(false);
      }

      // 4. Update default URL row placeholder/value for convenience
      const firstUrlInp = document.querySelector('.source-url-input');
      if (firstUrlInp && firstUrlInp.value.includes('astrosage.com')) {
        if (currentHorizon === 'daily') {
          firstUrlInp.value = currentSubPeriod === 'today' ? 'https://www.astrosage.com/rashifal/aaj-ka-rashifal.asp' : 'https://www.astrosage.com/rashifal/kal-ka-rashifal.asp';
        } else if (currentHorizon === 'weekly') {
          firstUrlInp.value = 'https://www.astrosage.com/rashifal/agla-saptahik-rashifal/';
        } else if (currentHorizon === 'monthly') {
          firstUrlInp.value = 'https://www.astrosage.com/rashifal/mesh-masik-rashifal.asp';
        } else if (currentHorizon === 'yearly') {
          firstUrlInp.value = currentSubPeriod === 'next_year' ? 'https://www.astrosage.com/2027/mesh-rashifal-2027.asp' : 'https://www.astrosage.com/2026/mesh-rashifal-2026.asp';
        }
      }

      // 5. Update local sign dataset if not scraped
      const hasScraped = Object.values(currentSignsData).some(s => s && s.isScraped);
      if (!hasScraped) {
        currentSignsData = ContentScraper.generateAllDailySigns(targetDateObj, currentLengthMode);
        VideoEngine.setAllSignsData(currentSignsData);
      }
      loadSignIntoStudio(selectedSignId);
    };

    // Horizon Button Click Handlers
    horizonButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        horizonButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentHorizon = btn.getAttribute('data-horizon');

        // Update Horizon Badge
        const horizonLabels = {
          daily: 'दैनिक',
          weekly: 'साप्ताहिक',
          monthly: 'मासिक',
          yearly: 'वार्षिक'
        };
        if (horizonBadge) horizonBadge.textContent = horizonLabels[currentHorizon] || 'दैनिक';

        // Toggle subperiod panels
        const pnlDaily = document.getElementById('subperiodDaily');
        const pnlWeekly = document.getElementById('subperiodWeekly');
        const pnlMonthly = document.getElementById('subperiodMonthly');
        const pnlYearly = document.getElementById('subperiodYearly');

        if (pnlDaily) pnlDaily.style.display = currentHorizon === 'daily' ? 'block' : 'none';
        if (pnlWeekly) pnlWeekly.style.display = currentHorizon === 'weekly' ? 'block' : 'none';
        if (pnlMonthly) pnlMonthly.style.display = currentHorizon === 'monthly' ? 'block' : 'none';
        if (pnlYearly) pnlYearly.style.display = currentHorizon === 'yearly' ? 'block' : 'none';

        // Set default subperiod for selected horizon
        if (currentHorizon === 'daily') currentSubPeriod = 'tomorrow';
        else if (currentHorizon === 'weekly') currentSubPeriod = 'this_week';
        else if (currentHorizon === 'monthly') currentSubPeriod = 'this_month';
        else if (currentHorizon === 'yearly') currentSubPeriod = 'this_year';

        updateHorizonAndPeriod();
      });
    });

    // Subperiod Radio Change Listeners
    ['dailySubMode', 'weeklySubMode', 'monthlySubMode', 'yearlySubMode'].forEach(groupName => {
      document.querySelectorAll(`input[name="${groupName}"]`).forEach(radio => {
        radio.addEventListener('change', (e) => {
          if (e.target.checked) {
            currentSubPeriod = e.target.value;
            updateHorizonAndPeriod();
          }
        });
      });
    });

    // Date radio pill click delegates
    document.querySelectorAll('.date-radio-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const radio = pill.querySelector('input[type="radio"]');
        if (radio) {
          radio.checked = true;
          currentSubPeriod = radio.value;
          updateHorizonAndPeriod();
        }
      });
    });

    if (inpCustomDate) {
      inpCustomDate.value = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
      inpCustomDate.addEventListener('change', updateHorizonAndPeriod);
    }

    // Initial run
    updateHorizonAndPeriod();

    // BGM Volume Slider
    const volSlider = document.getElementById('bgmVolumeSlider');
    const volDisplay = document.getElementById('bgmVolumeDisplay');
    if (volSlider) {
      volSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        if (volDisplay) volDisplay.textContent = val + '%';
        VideoEngine.setBgmVolume(val / 100);
      });
    }
  }

  function setupLengthAndFontControls() {
    // Length Mode Pills (20-25 Words Video / Full YouTube Post / Medium)
    document.querySelectorAll('.length-mode-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.length-mode-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const mode = pill.getAttribute('data-length');
        currentLengthMode = mode;

        const sizeSlider = document.getElementById('predictionFontSizeSlider');
        const sizeDisplay = document.getElementById('predictionFontSizeDisplay');

        if (mode === 'short') { // 20-25 Words Crisp Mode
          if (sizeSlider) {
            sizeSlider.value = '26';
            if (sizeDisplay) sizeDisplay.textContent = '26px';
            VideoEngine.setPredictionFontSize(30);
            VideoEngine.setPosterFontSize(26);
          }
        } else if (mode === 'detailed') { // 50-80 Words YouTube Post Mode
          if (sizeSlider) {
            sizeSlider.value = '22';
            if (sizeDisplay) sizeDisplay.textContent = '22px';
            VideoEngine.setPredictionFontSize(25);
            VideoEngine.setPosterFontSize(22);
          }
        } else { // Medium Mode
          if (sizeSlider) {
            sizeSlider.value = '24';
            if (sizeDisplay) sizeDisplay.textContent = '24px';
            VideoEngine.setPredictionFontSize(27);
            VideoEngine.setPosterFontSize(24);
          }
        }

        const hasScraped = Object.values(currentSignsData).some(s => s && s.isScraped);
        if (!hasScraped) {
          currentSignsData = ContentScraper.generateAllDailySigns(targetDateObj, currentLengthMode);
          VideoEngine.setAllSignsData(currentSignsData);
        }
        loadSignIntoStudio(selectedSignId);
      });
    });

    // Font Size Slider
    const sizeSlider = document.getElementById('predictionFontSizeSlider');
    const sizeDisplay = document.getElementById('predictionFontSizeDisplay');
    if (sizeSlider) {
      sizeSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        if (sizeDisplay) sizeDisplay.textContent = val + 'px';
        VideoEngine.setPredictionFontSize(val);
        VideoEngine.setPosterFontSize(val);
      });
    }
  }

  // 1-Click Copy All 12 Signs Formatted for YouTube Community Tab
  function copyYouTubeCommunityPost() {
    const signs = ContentScraper.ZODIAC_SIGNS;
    const periodStr = VideoEngine.getFormattedPeriodString(false);

    let postText = `✨【 संपूर्ण 12 राशि दैनिक राशिफल 】✨\n`;
    postText += `📅 ${periodStr}\n\n`;
    postText += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

    signs.forEach((s) => {
      const signData = (currentSignsData && currentSignsData[s.id]) || s;
      postText += `${s.symbol} ${s.nameHi} (${s.nameEn}):\n`;
      postText += `${signData.prediction || 'आज का दिन आपके लिए शुभ व फलदायी रहेगा।'}\n`;
      postText += `🎨 शुभ रंग: ${signData.luckyColor || 'लाल'} | 🔢 शुभ अंक: ${signData.luckyNumber || 7} | 💖 भाग्य: ${signData.luckPercent || 85}%\n`;
      if (signData.upay) {
        postText += `🪔 उपाय: ${signData.upay}\n`;
      }
      postText += `\n`;
    });

    postText += `━━━━━━━━━━━━━━━━━━━━━\n`;
    postText += `🔔 रोज़ाना सबसे पहले सटीक राशिफल जानने के लिए चैनल को सब्सक्राइब करें!\n`;
    postText += `#Rashifal #Horoscope #DailyHoroscope #Astrology #${signs[0].nameHi}राशिफल`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(postText).then(() => {
        alert('✅ 12 राशियों का संपूर्ण यूट्यूब कम्युनिटी पोस्ट क्लिपबोर्ड पर कॉपी हो गया!\n\nअब आप इसे YouTube Community Tab, WhatsApp या Facebook पर सीधे पेस्ट कर सकते हैं।');
      }).catch(() => {
        prompt('यहाँ से यूट्यूब पोस्ट टेक्स्ट कॉपी करें:', postText);
      });
    } else {
      prompt('यहाँ से यूट्यूब पोस्ट टेक्स्ट कॉपी करें:', postText);
    }
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
    addSourceRow: addSourceRow,
    removeSourceRow: removeSourceRow,
    handleScrapeUrl: handleScrapeUrl,
    handlePasteText: handlePasteText,
    startVideoExport: startVideoExport,
    closeExportModal: closeExportModal,
    openBatchModal: openBatchModal,
    closeBatchModal: closeBatchModal,
    generateAll12Shorts: generateAll12Shorts,
    startBatch12Render: generateAll12Shorts,
    downloadSingleBatchVideo: downloadSingleBatchVideo,
    downloadAllBatchVideos: downloadAllBatchVideos,
    copyYouTubeCommunityPost: copyYouTubeCommunityPost
  };
})();

// Attach globally
if (typeof window !== 'undefined') {
  window.TemplateEngine = TemplateEngine;
}

// Auto-boot on DOM ready or immediate if already interactive/complete
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      TemplateEngine.init();
    });
  } else {
    TemplateEngine.init();
  }
}
