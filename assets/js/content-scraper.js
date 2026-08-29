/**
 * ══════════════════════════════════════════════════════════════════
 * AI YOUTUBE SHORTS STUDIO — CONTENT INGESTION & WEB SCRAPER ENGINE
 * Real-time URL scraping, Zodiac parser, and Daily Rashifal Engine
 * ══════════════════════════════════════════════════════════════════
 */

const ContentScraper = (function() {
  'use strict';

  // 12 Zodiac Signs Master Dictionary
  const ZODIAC_SIGNS = [
    { id: 'aries', nameHi: 'मेष', nameEn: 'Aries', symbol: '♈', lord: 'मंगल', element: 'अग्नि' },
    { id: 'taurus', nameHi: 'वृषभ', nameEn: 'Taurus', symbol: '♉', lord: 'शुक्र', element: 'पृथ्वी' },
    { id: 'gemini', nameHi: 'मिथुन', nameEn: 'Gemini', symbol: '♊', lord: 'बुध', element: 'वायु' },
    { id: 'cancer', nameHi: 'कर्क', nameEn: 'Cancer', symbol: '♋', lord: 'चंद्रमा', element: 'जल' },
    { id: 'leo', nameHi: 'सिंह', nameEn: 'Leo', symbol: '♌', lord: 'सूर्य', element: 'अग्नि' },
    { id: 'virgo', nameHi: 'कन्या', nameEn: 'Virgo', symbol: '♍', lord: 'बुध', element: 'पृथ्वी' },
    { id: 'libra', nameHi: 'तुला', nameEn: 'Libra', symbol: '♎', lord: 'शुक्र', element: 'वायु' },
    { id: 'scorpio', nameHi: 'वृश्चिक', nameEn: 'Scorpio', symbol: '♏', lord: 'मंगल', element: 'जल' },
    { id: 'sagittarius', nameHi: 'धनु', nameEn: 'Sagittarius', symbol: '♐', lord: 'बृहस्पति', element: 'अग्नि' },
    { id: 'capricorn', nameHi: 'मकर', nameEn: 'Capricorn', symbol: '♑', lord: 'शनि', element: 'पृथ्वी' },
    { id: 'aquarius', nameHi: 'कुंभ', nameEn: 'Aquarius', symbol: '♒', lord: 'शनि', element: 'वायु' },
    { id: 'pisces', nameHi: 'मीन', nameEn: 'Pisces', symbol: '♓', lord: 'बृहस्पति', element: 'जल' }
  ];

  // Daily Astrological Remedial Bank (उपाय एवं मंत्र)
  const UPAY_BANK = [
    'हनुमान चालीसा का पाठ करें और सिंदूर का तिलक लगाएं।',
    'माता-पिता का आशीर्वाद लें और सूर्य देव को तांबे के लोटे से जल अर्पित करें।',
    'शिवलिंग पर कच्चा दूध व बेलपत्र चढ़ाएं, बिगड़े काम बनेंगे।',
    'पक्षियों को दाना डालें और ॐ नमः शिवाय मंत्र का 108 बार जाप करें।',
    'ज़रूरतमंदों को फल या अन्न दान करें, सकारात्मक ऊर्जा मिलेगी।',
    'गाय को हरा चारा या गुड़ की रोटी खिलाएं, धन लाभ के योग बनेंगे।',
    'गणेश जी को दूर्वा अर्पित करें, विघ्न-बाधाएं दूर होंगी।'
  ];

  const LUCKY_COLORS = ['लाल (Red)', 'पीला (Yellow)', 'सुनहरा (Gold)', 'हरा (Green)', 'सफेद (White)', 'नारंगी (Orange)', 'गुलाबी (Pink)', 'केसरिया (Saffron)'];

  // ══════════════════════════════════════════════════════════════════
  // 1. Fetch & Scrape Content from User-Provided URL
  // ══════════════════════════════════════════════════════════════════
  async function scrapeUrl(targetUrl) {
    if (!targetUrl || !targetUrl.startsWith('http')) {
      throw new Error('कृपया एक वैध वेबसाइट URL (http/https) दर्ज करें।');
    }

    const proxies = [
      `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`,
      `https://api.codetab.org/v1/proxy?quest=${encodeURIComponent(targetUrl)}`,
      targetUrl
    ];

    let htmlText = '';
    let success = false;

    for (const proxy of proxies) {
      try {
        const response = await fetch(proxy, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (response.ok) {
          if (proxy.includes('allorigins')) {
            const data = await response.json();
            htmlText = data.contents;
          } else {
            htmlText = await response.text();
          }
          if (htmlText && htmlText.length > 200) {
            success = true;
            break;
          }
        }
      } catch (e) {
        console.warn('Proxy attempt failed:', proxy);
      }
    }

    if (!success || !htmlText) {
      throw new Error('वेबसाइट से डेटा लोड नहीं हो सका। कृपया लिंक जांचें या टेक्स्ट मैन्युअल रूप से पेस्ट करें।');
    }

    // Parse HTML to clean text
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');

    // Remove scripts, styles, navs
    const unwanted = doc.querySelectorAll('script, style, nav, footer, header, noscript, iframe, .ads');
    unwanted.forEach(el => el.remove());

    const bodyText = doc.body.innerText || '';
    return parseAstrologyText(bodyText);
  }

  // ══════════════════════════════════════════════════════════════════
  // 2. Intelligent Text & Zodiac Sign Parser
  // ══════════════════════════════════════════════════════════════════
  function parseAstrologyText(rawText) {
    const results = {};
    const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const fullText = lines.join(' ');

    ZODIAC_SIGNS.forEach(sign => {
      // Look for sign name in Hindi and English
      const pattern = new RegExp(`(${sign.nameHi}|${sign.nameEn})[\\s\\S]{1,500}?(?=(मेष|वृषभ|मिथुन|कर्क|सिंह|कन्या|तुला|वृश्चिक|धनु|मकर|कुंभ|मीन|Aries|Taurus|Gemini|$))`, 'i');
      const match = fullText.match(pattern);

      if (match) {
        const snippet = match[0].trim();
        results[sign.id] = cleanZodiacSnippet(snippet, sign);
      } else {
        // Fallback: Generate algorithmic authentic daily prediction
        results[sign.id] = generateDailySignData(sign);
      }
    });

    return results;
  }

  function cleanZodiacSnippet(snippet, sign) {
    // Extract Lucky Color
    let luckyColor = LUCKY_COLORS[Math.floor(Math.random() * LUCKY_COLORS.length)];
    const colorMatch = snippet.match(/शुभ\s*रंग[:\s\-]*([^\,\.\n]+)/i);
    if (colorMatch && colorMatch[1]) luckyColor = colorMatch[1].trim();

    // Extract Lucky Number
    let luckyNumber = Math.floor(Math.random() * 9) + 1;
    const numMatch = snippet.match(/शुभ\s*अंक[:\s\-]*(\d+)/i);
    if (numMatch && numMatch[1]) luckyNumber = parseInt(numMatch[1], 10);

    // Extract Bhagya %
    let luckPercent = Math.floor(Math.random() * 26) + 70; // 70% - 95%
    const luckMatch = snippet.match(/भाग्य[:\s\-]*(\d+)%/i);
    if (luckMatch && luckMatch[1]) luckPercent = parseInt(luckMatch[1], 10);

    // Clean Main Prediction
    let prediction = snippet
      .replace(new RegExp(`^.*${sign.nameHi}`, 'i'), '')
      .replace(/शुभ\s*(रंग|अंक|समय|संख्या)[^.\n]*[.\n]?/gi, '')
      .replace(/https?:\/\/\S+/g, '')
      .trim();

    if (prediction.length < 30) {
      prediction = generateDailySignData(sign).prediction;
    } else if (prediction.length > 220) {
      prediction = prediction.substring(0, 215) + '...';
    }

    // Upay
    const upay = UPAY_BANK[Math.floor(Math.random() * UPAY_BANK.length)];

    return {
      signId: sign.id,
      signNameHi: sign.nameHi,
      signNameEn: sign.nameEn,
      symbol: sign.symbol,
      lord: sign.lord,
      element: sign.element,
      luckyColor: luckyColor,
      luckyNumber: luckyNumber,
      luckPercent: luckPercent,
      prediction: prediction,
      upay: upay
    };
  }

  // ══════════════════════════════════════════════════════════════════
  // 3. Built-In Algorithmic Daily Rashifal Generator (100% Offline)
  // ══════════════════════════════════════════════════════════════════
  function generateDailySignData(sign, dateObj = new Date()) {
    const daySeed = dateObj.getFullYear() * 10000 + (dateObj.getMonth() + 1) * 100 + dateObj.getDate();
    const signIndex = ZODIAC_SIGNS.findIndex(s => s.id === sign.id);
    const pseudoRandom = Math.abs(Math.sin(daySeed + signIndex * 13.37));

    const luckyNumber = Math.floor(pseudoRandom * 9) + 1;
    const luckyColor = LUCKY_COLORS[Math.floor(pseudoRandom * LUCKY_COLORS.length)];
    const luckPercent = 75 + Math.floor(pseudoRandom * 23); // 75% to 98%
    const upay = UPAY_BANK[(daySeed + signIndex) % UPAY_BANK.length];

    const predictions = [
      `आज का दिन आपके लिए आर्थिक व पारिवारिक रूप से बेहद शुभ रहेगा। कार्यक्षेत्र में नए अवसर प्राप्त होंगे और रुके हुए कार्य पूरे होंगे।`,
      `आज चंद्रमा की शुभ स्थिति से आत्मविश्वास में वृद्धि होगी। व्यापार में धन लाभ के योग हैं, मित्रों व सहकर्मियों का पूरा सहयोग मिलेगा।`,
      `आज पद-प्रतिष्ठा में वृद्धि होगी। किसी महत्वपूर्ण योजना पर काम शुरू कर सकते हैं। परिवार में सुख-शांति का वातावरण बना रहेगा।`,
      `आज का दिन मिलाजुला रहेगा। धैर्य और सूझबूझ से लिए गए फैसले लाभकारी साबित होंगे। स्वास्थ्य का विशेष ध्यान रखें।`,
      `आज भाग्य का भरपूर साथ मिलेगा। सोचे हुए काम समय पर पूरे होंगे और धन आगमन के नए स्रोत बनेंगे। यात्रा सुखद रहेगी।`
    ];

    const prediction = predictions[(daySeed + signIndex * 3) % predictions.length];

    return {
      signId: sign.id,
      signNameHi: sign.nameHi,
      signNameEn: sign.nameEn,
      symbol: sign.symbol,
      lord: sign.lord,
      element: sign.element,
      luckyColor: luckyColor,
      luckyNumber: luckyNumber,
      luckPercent: luckPercent,
      prediction: prediction,
      upay: upay
    };
  }

  // Generate All 12 Signs for Today
  function generateAllDailySigns(dateObj = new Date()) {
    const result = {};
    ZODIAC_SIGNS.forEach(sign => {
      result[sign.id] = generateDailySignData(sign, dateObj);
    });
    return result;
  }

  return {
    ZODIAC_SIGNS: ZODIAC_SIGNS,
    scrapeUrl: scrapeUrl,
    parseAstrologyText: parseAstrologyText,
    generateDailySignData: generateDailySignData,
    generateAllDailySigns: generateAllDailySigns
  };
})();
