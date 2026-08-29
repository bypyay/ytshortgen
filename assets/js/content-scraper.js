/**
 * ══════════════════════════════════════════════════════════════════
 * AI YOUTUBE SHORTS STUDIO — ADVANCED CONTENT SCRAPER & ASTROSAGE BOT
 * High-speed scraping via Jina AI Gateway & Cloudflare Bypasser
 * Supports AstroSage, AajTak, Dainik Bhaskar, AmarUjala, Jagran, Webdunia
 * ══════════════════════════════════════════════════════════════════
 */

const ContentScraper = (function() {
  'use strict';

  // 12 Zodiac Signs Master Dictionary with all Sanskrit/Hindi synonyms
  const ZODIAC_SIGNS = [
    { id: 'aries', nameHi: 'मेष', nameEn: 'Aries', symbol: '♈', lord: 'मंगल', element: 'अग्नि', astroSlug: 'mesh', patterns: ['मेष', 'Mesh', 'Aries'] },
    { id: 'taurus', nameHi: 'वृषभ', nameEn: 'Taurus', symbol: '♉', lord: 'शुक्र', element: 'पृथ्वी', astroSlug: 'vrishabha', patterns: ['वृषभ', 'वृष', 'Vrishabh', 'Vrishabha', 'Taurus'] },
    { id: 'gemini', nameHi: 'मिथुन', nameEn: 'Gemini', symbol: '♊', lord: 'बुध', element: 'वायु', astroSlug: 'mithun', patterns: ['मिथुन', 'Mithun', 'Gemini'] },
    { id: 'cancer', nameHi: 'कर्क', nameEn: 'Cancer', symbol: '♋', lord: 'चंद्रमा', element: 'जल', astroSlug: 'karka', patterns: ['कर्क', 'Kark', 'Karka', 'Cancer'] },
    { id: 'leo', nameHi: 'सिंह', nameEn: 'Leo', symbol: '♌', lord: 'सूर्य', element: 'अग्नि', astroSlug: 'simha', patterns: ['सिंह', 'सिंघ', 'Simha', 'Leo'] },
    { id: 'virgo', nameHi: 'कन्या', nameEn: 'Virgo', symbol: '♍', lord: 'बुध', element: 'पृथ्वी', astroSlug: 'kanya', patterns: ['कन्या', 'Kanya', 'Virgo'] },
    { id: 'libra', nameHi: 'तुला', nameEn: 'Libra', symbol: '♎', lord: 'शुक्र', element: 'वायु', astroSlug: 'tula', patterns: ['तुला', 'Tula', 'Libra'] },
    { id: 'scorpio', nameHi: 'वृश्चिक', nameEn: 'Scorpio', symbol: '♏', lord: 'मंगल', element: 'जल', astroSlug: 'vrishchika', patterns: ['वृश्चिक', 'Vrishchik', 'Vrishchika', 'Scorpio'] },
    { id: 'sagittarius', nameHi: 'धनु', nameEn: 'Sagittarius', symbol: '♐', lord: 'बृहस्पति', element: 'अग्नि', astroSlug: 'dhanu', patterns: ['धनु', 'Dhanu', 'Sagittarius'] },
    { id: 'capricorn', nameHi: 'मकर', nameEn: 'Capricorn', symbol: '♑', lord: 'शनि', element: 'पृथ्वी', astroSlug: 'makara', patterns: ['मकर', 'Makar', 'Makara', 'Capricorn'] },
    { id: 'aquarius', nameHi: 'कुंभ', nameEn: 'Aquarius', symbol: '♒', lord: 'शनि', element: 'वायु', astroSlug: 'kumbha', patterns: ['कुंभ', 'कुम्भ', 'Kumbh', 'Kumbha', 'Aquarius'] },
    { id: 'pisces', nameHi: 'मीन', nameEn: 'Pisces', symbol: '♓', lord: 'बृहस्पति', element: 'जल', astroSlug: 'meena', patterns: ['मीन', 'Meen', 'Meena', 'Pisces'] }
  ];

  // Popular Pre-configured Sources
  const POPULAR_SOURCES = [
    { name: '🕉️ AstroSage (कल का राशिफल)', url: 'https://www.astrosage.com/rashifal/kal-ka-rashifal.asp' },
    { name: '🌟 AstroSage (आज का राशिफल)', url: 'https://www.astrosage.com/rashifal/aaj-ka-rashifal.asp' },
    { name: '🔴 Aaj Tak Rashifal', url: 'https://www.aajtak.in/astrology/rashifal' },
    { name: '🟡 Amar Ujala', url: 'https://www.amarujala.com/astrology/rashifal' },
    { name: '🔵 Live Hindustan', url: 'https://www.livehindustan.com/astrology/rashifal/' },
    { name: '🟢 Webdunia Hindi', url: 'https://hindi.webdunia.com/astrology' },
    { name: '🟣 Dainik Jagran', url: 'https://www.jagran.com/astrology/rashifal.html' }
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

  const LUCKY_COLORS = ['लाल (Red)', 'पीला (Yellow)', 'सुनहरा (Gold)', 'हरा (Green)', 'सफेद (White)', 'नारंगी (Orange)', 'गुलाबी (Pink)', 'केसरिया (Saffron)', 'आसमानी (Sky Blue)'];

  // ══════════════════════════════════════════════════════════════════
  // 1. High-Precision Web Page Fetcher (With Strict 4.5s Timeout)
  // ══════════════════════════════════════════════════════════════════
  async function fetchWithTimeout(url, timeoutMs = 4500) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { 'Accept': 'text/plain, text/html, application/json' }
      });
      clearTimeout(id);
      return response;
    } catch (e) {
      clearTimeout(id);
      throw e;
    }
  }

  async function fetchCleanContent(targetUrl) {
    if (!targetUrl || !targetUrl.startsWith('http')) return null;

    const proxyGateways = [
      `https://r.jina.ai/${targetUrl}`,
      `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
      targetUrl
    ];

    for (const gateway of proxyGateways) {
      try {
        const response = await fetchWithTimeout(gateway, 4500);
        if (response.ok) {
          const text = await response.text();
          if (text && text.length > 150) {
            return text;
          }
        }
      } catch (e) {
        console.warn('Scraper Gateway attempt failed:', gateway);
      }
    }
    return null;
  }

  // ══════════════════════════════════════════════════════════════════
  // 2. Dedicated AstroSage Multi-Sign Crawler
  // ══════════════════════════════════════════════════════════════════
  async function scrapeAstroSage(url) {
    const isTomorrow = url.includes('kal-ka-rashifal') || url.includes('kal');
    const prefix = isTomorrow ? 'kal-ka-rashifal.asp' : 'aaj-ka-rashifal.asp';

    const results = {};
    const fetchPromises = ZODIAC_SIGNS.map(async (sign) => {
      const signUrl = `https://www.astrosage.com/rashifal/${sign.astroSlug}-${prefix}`;
      try {
        const content = await fetchCleanContent(signUrl);
        if (content) {
          results[sign.id] = parseAstroSageSignContent(content, sign);
          return;
        }
      } catch (e) {}

      // Algorithmic Fallback if offline/timeout
      results[sign.id] = generateDailySignData(sign);
    });

    await Promise.allSettled(fetchPromises);
    return results;
  }

  function parseAstroSageSignContent(text, sign) {
    let prediction = '';
    let upay = '';

    // Extract Upay
    const upayMatch = text.match(/\*\*उपाय\s*:?[\-–]*\*\*\s*([^\n\r]+)/i) ||
                      text.match(/उपाय\s*:?[\-–]+\s*([^\n\r]+)/i) ||
                      text.match(/उपाय[:\s\-]+([^\n\r]+)/i);
    if (upayMatch && upayMatch[1]) {
      upay = upayMatch[1].replace(/[\*\_]/g, '').trim();
    } else {
      upay = UPAY_BANK[Math.floor(Math.random() * UPAY_BANK.length)];
    }

    // Extract Prediction
    const dateMatch = text.match(/\*\*(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)[^\*]+\*\*\s*\n+([\s\S]+?)(?=(\*\*उपाय|##|\n\n\n|$))/i);
    if (dateMatch && dateMatch[2]) {
      prediction = dateMatch[2].replace(/[\*\_]/g, ' ').replace(/\n+/g, ' ').trim();
    } else {
      // Find sign section
      const signMatch = text.match(new RegExp(`(${sign.nameHi}|${sign.nameEn})[\\s\\S]{1,600}?(?=(उपाय|##|\n\n\n|$))`, 'i'));
      if (signMatch) {
        prediction = signMatch[0].replace(/[\*\_]/g, ' ').replace(/\n+/g, ' ').trim();
      }
    }

    if (!prediction || prediction.length < 30) {
      prediction = generateDailySignData(sign).prediction;
    } else if (prediction.length > 230) {
      prediction = prediction.substring(0, 225) + '...';
    }

    const luckyColor = LUCKY_COLORS[Math.floor(Math.random() * LUCKY_COLORS.length)];
    const luckyNumber = Math.floor(Math.random() * 9) + 1;
    const luckPercent = Math.floor(Math.random() * 22) + 76; // 76% - 98%

    return {
      id: sign.id,
      signId: sign.id,
      nameHi: sign.nameHi,
      signNameHi: sign.nameHi,
      nameEn: sign.nameEn,
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
  // 3. Multi-Source Scraping Controller
  // ══════════════════════════════════════════════════════════════════
  async function scrapeMultipleUrls(urlsArray) {
    const validUrls = urlsArray.filter(u => u && u.trim().startsWith('http'));
    if (validUrls.length === 0) {
      throw new Error('कृपया कम से कम एक वैध वेबसाइट लिंक (URL) दर्ज करें।');
    }

    // Check if any URL is AstroSage
    const astroSageUrl = validUrls.find(u => u.includes('astrosage.com'));
    if (astroSageUrl) {
      try {
        const astroData = await scrapeAstroSage(astroSageUrl);
        if (Object.keys(astroData).length >= 12) {
          return astroData;
        }
      } catch (e) {
        console.warn('Direct AstroSage crawl error:', e);
      }
    }

    // Generic Multi-Source Crawl
    let combinedText = '';
    for (const url of validUrls) {
      const content = await fetchCleanContent(url.trim());
      if (content) {
        combinedText += '\n' + content;
      }
    }

    if (!combinedText || combinedText.length < 100) {
      throw new Error('दिए गए किसी भी लिंक से डेटा प्राप्त नहीं हो सका। कृपया लिंक जांचें या इन-बिल्ट डेली राशिफल का उपयोग करें।');
    }

    return parseAstrologyText(combinedText);
  }

  // ══════════════════════════════════════════════════════════════════
  // 4. Intelligent Text & Zodiac Sign Parser
  // ══════════════════════════════════════════════════════════════════
  function parseAstrologyText(rawText) {
    const results = {};
    const fullText = rawText.replace(/[\*\_]/g, ' ').replace(/\s+/g, ' ');

    ZODIAC_SIGNS.forEach(sign => {
      let matchedSnippet = '';

      for (const patternName of sign.patterns) {
        const regex = new RegExp(`${patternName}[\\s\\S]{1,550}?(?=(मेष|वृषभ|वृष|मिथुन|कर्क|सिंह|कन्या|तुला|वृश्चिक|धनु|मकर|कुंभ|कुम्भ|मीन|Aries|Taurus|Gemini|##|$))`, 'i');
        const match = fullText.match(regex);
        if (match && match[0].length > 40) {
          matchedSnippet = match[0].trim();
          break;
        }
      }

      if (matchedSnippet) {
        results[sign.id] = cleanZodiacSnippet(matchedSnippet, sign);
      } else {
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
    const numMatch = snippet.match(/शुभ\s*(अंक|संख्या)[:\s\-]*(\d+)/i);
    if (numMatch && numMatch[2]) luckyNumber = parseInt(numMatch[2], 10);

    // Extract Bhagya %
    let luckPercent = Math.floor(Math.random() * 24) + 75; // 75% - 98%
    const luckMatch = snippet.match(/भाग्य[:\s\-]*(\d+)%/i);
    if (luckMatch && luckMatch[1]) luckPercent = parseInt(luckMatch[1], 10);

    // Extract Upay
    let upay = '';
    const upayMatch = snippet.match(/उपाय[:\s\-]+([^\.\n]+)/i);
    if (upayMatch && upayMatch[1] && upayMatch[1].length > 10) {
      upay = upayMatch[1].trim();
    } else {
      upay = UPAY_BANK[Math.floor(Math.random() * UPAY_BANK.length)];
    }

    // Clean Prediction Text
    let prediction = snippet
      .replace(new RegExp(`^.*${sign.nameHi}`, 'i'), '')
      .replace(/शुभ\s*(रंग|अंक|समय|संख्या)[^.\n]*[.\n]?/gi, '')
      .replace(/उपाय[:\s\-]+[^\.\n]+[.\n]?/gi, '')
      .replace(/https?:\/\/\S+/g, '')
      .trim();

    if (prediction.length < 30) {
      prediction = generateDailySignData(sign).prediction;
    } else if (prediction.length > 220) {
      prediction = prediction.substring(0, 215) + '...';
    }

    return {
      id: sign.id,
      signId: sign.id,
      nameHi: sign.nameHi,
      signNameHi: sign.nameHi,
      nameEn: sign.nameEn,
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
  // 5. Built-In Algorithmic Daily Rashifal Generator (100% Offline)
  // ══════════════════════════════════════════════════════════════════
  function generateDailySignData(sign, dateObj = new Date()) {
    const daySeed = dateObj.getFullYear() * 10000 + (dateObj.getMonth() + 1) * 100 + dateObj.getDate();
    const signIndex = ZODIAC_SIGNS.findIndex(s => s.id === sign.id);
    const pseudoRandom = Math.abs(Math.sin(daySeed + signIndex * 13.37));

    const luckyNumber = Math.floor(pseudoRandom * 9) + 1;
    const luckyColor = LUCKY_COLORS[Math.floor(pseudoRandom * LUCKY_COLORS.length)];
    const luckPercent = 75 + Math.floor(pseudoRandom * 23);
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
      id: sign.id,
      signId: sign.id,
      nameHi: sign.nameHi,
      signNameHi: sign.nameHi,
      nameEn: sign.nameEn,
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
    POPULAR_SOURCES: POPULAR_SOURCES,
    fetchCleanContent: fetchCleanContent,
    scrapeAstroSage: scrapeAstroSage,
    scrapeMultipleUrls: scrapeMultipleUrls,
    parseAstrologyText: parseAstrologyText,
    generateDailySignData: generateDailySignData,
    generateAllDailySigns: generateAllDailySigns
  };
})();

// Attach globally
if (typeof window !== 'undefined') {
  window.ContentScraper = ContentScraper;
}
