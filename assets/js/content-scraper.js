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
  // 1. High-Precision Web Page Fetcher
  // ══════════════════════════════════════════════════════════════════
  async function fetchWithTimeout(url, timeoutMs = 8500) {
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
        const response = await fetchWithTimeout(gateway, 8500);
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

    // 1. Direct fetch if user entered a specific sign page (e.g. mesh-kal-ka-rashifal.asp)
    const specificSign = ZODIAC_SIGNS.find(s => url.includes(s.astroSlug) || url.includes(s.id) || url.toLowerCase().includes(s.nameEn.toLowerCase()));
    if (specificSign) {
      const content = await fetchCleanContent(url);
      if (content && content.length > 300) {
        const parsed = parseAstroSageSignContent(content, specificSign);
        if (parsed && parsed.prediction && parsed.prediction.length > 25) {
          results[specificSign.id] = parsed;
        }
      }
    }

    // 2. Fetch remaining signs in small batches of 2 with pause to prevent proxy dropouts
    for (let i = 0; i < ZODIAC_SIGNS.length; i += 2) {
      const chunk = ZODIAC_SIGNS.slice(i, i + 2);
      await Promise.all(chunk.map(async (sign) => {
        if (results[sign.id] && results[sign.id].isScraped) return;

        const signUrl = `https://www.astrosage.com/rashifal/${sign.astroSlug}-${prefix}`;
        try {
          const content = await fetchCleanContent(signUrl);
          if (content && content.length > 300) {
            const parsed = parseAstroSageSignContent(content, sign);
            if (parsed && parsed.prediction && parsed.prediction.length > 25) {
              results[sign.id] = parsed;
            }
          }
        } catch (e) {
          console.warn(`Could not scrape ${sign.id}:`, e);
        }
      }));
      await new Promise(r => setTimeout(r, 200));
    }

    // 3. Ensure all 12 signs have full, rich predictions (no 1-sentence fallbacks!)
    ZODIAC_SIGNS.forEach(sign => {
      if (!results[sign.id] || !results[sign.id].prediction || results[sign.id].prediction.length < 25) {
        results[sign.id] = generateDailySignData(sign, new Date(), 'detailed');
      }
    });

    const scrapedCount = Object.values(results).filter(s => s && s.prediction).length;
    if (scrapedCount === 0) {
      throw new Error('AstroSage से डेटा फेच नहीं हो सका (नेटवर्क/प्रॉक्सी समस्या)। कृपया लिंक जांचें या "📋 पेस्ट टेक्स्ट" का उपयोग करें।');
    }

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
      upay = '';
    }

    // Extract Exact Prediction
    const dateMatch = text.match(/(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)[^\n\r]*\n+([\s\S]+?)(?=(उपाय|##|\*\*कल का दिन|\n\n\n\n|$))/i) ||
                      text.match(/\*\*(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)[^\*]+\*\*\s*\n+([\s\S]+?)(?=(\*\*उपाय|उपाय|##|\n\n\n|$))/i);
    if (dateMatch && dateMatch[2]) {
      prediction = dateMatch[2].replace(/[\*\_]/g, ' ').replace(/\s+/g, ' ').trim();
    } else {
      const signMatch = text.match(new RegExp(`(${sign.nameHi}|${sign.nameEn})[\\s\\S]{1,800}?(?=(उपाय|##|\n\n\n|$))`, 'i'));
      if (signMatch) {
        prediction = signMatch[0].replace(/[\*\_]/g, ' ').replace(/\s+/g, ' ').trim();
      }
    }

    // Extract Star Ratings from AstroSage HTML/Markdown (Counting star2.gif filled stars)
    function countStars(category, fallbackVal) {
      const reg = new RegExp(`\\*\\*${category}:?\\*\\*([\\s\\S]*?)(?=(\\*\\*|$|\\n\\n))`, 'i');
      const m = text.match(reg);
      if (!m) return fallbackVal;
      const block = m[1];
      const filledMatches = block.match(/star2\.gif/g);
      if (filledMatches && filledMatches.length > 0) return filledMatches.length;
      const unicodeFilled = block.match(/★/g);
      if (unicodeFilled && unicodeFilled.length > 0) return unicodeFilled.length;
      return fallbackVal;
    }

    const daySeed = new Date().getFullYear() * 10000 + (new Date().getMonth() + 1) * 100 + new Date().getDate();
    const signIndex = ZODIAC_SIGNS.findIndex(s => s.id === sign.id);
    const ratings = {
      health: countStars('स्वास्थ्य', 2 + ((daySeed + signIndex * 3) % 4)),
      wealth: countStars('धन-सम्पत्ति', 3 + ((daySeed + signIndex * 5) % 3)),
      family: countStars('परिवार', 2 + ((daySeed + signIndex * 7) % 4)),
      love: countStars('प्रेम आदि', 3 + ((daySeed + signIndex * 2) % 3)),
      business: countStars('व्यवसाय', 2 + ((daySeed + signIndex * 4) % 4)),
      marriage: countStars('वैवाहिक जीवन', 3 + ((daySeed + signIndex * 6) % 3))
    };

    const luckyColor = LUCKY_COLORS[Math.floor(Math.random() * LUCKY_COLORS.length)];
    const luckyNumber = Math.floor(Math.random() * 9) + 1;
    const luckPercent = Math.floor(Math.random() * 22) + 76;

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
      upay: upay,
      ratings: ratings,
      isScraped: true
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
      return await scrapeAstroSage(astroSageUrl);
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

    // Clean Prediction Text & Smart Complete Sentence Extraction
    let prediction = snippet
      .replace(new RegExp(`^.*${sign.nameHi}`, 'i'), '')
      .replace(/शुभ\s*(रंग|अंक|समय|संख्या)[^.\n]*[.\n]?/gi, '')
      .replace(/उपाय[:\s\-]+[^\.\n]+[.\n]?/gi, '')
      .replace(/https?:\/\/\S+/g, '')
      .trim();

    // Sentence-aware extraction (No broken sentences!)
    const rawSentences = prediction.split(/(?<=[।\.!\?])/).map(s => s.trim()).filter(s => s.length > 5);
    if (rawSentences.length > 0) {
      let combined = '';
      for (const sent of rawSentences) {
        if ((combined + ' ' + sent).trim().length <= 165) {
          combined = (combined + ' ' + sent).trim();
        } else {
          break;
        }
      }
      if (combined.length > 25) {
        if (!combined.endsWith('।') && !combined.endsWith('.')) combined += '।';
        prediction = combined;
      }
    }

    if (prediction.length < 25) {
      prediction = generateDailySignData(sign).prediction;
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
  // 5. Built-In Algorithmic Daily Rashifal Generator (Multi-Length)
  // ══════════════════════════════════════════════════════════════════
  function generateDailySignData(sign, dateObj = new Date(), lengthMode = 'detailed') {
    const daySeed = dateObj.getFullYear() * 10000 + (dateObj.getMonth() + 1) * 100 + dateObj.getDate();
    const signIndex = ZODIAC_SIGNS.findIndex(s => s.id === sign.id);
    const pseudoRandom = Math.abs(Math.sin(daySeed + signIndex * 13.37));

    const luckyNumber = Math.floor(pseudoRandom * 9) + 1;
    const luckyColor = LUCKY_COLORS[Math.floor(pseudoRandom * LUCKY_COLORS.length)];
    const luckPercent = 75 + Math.floor(pseudoRandom * 23);
    const upay = UPAY_BANK[(daySeed + signIndex) % UPAY_BANK.length];

    // Career & Business Sentences
    const careers = [
      `कार्यक्षेत्र में आज आपके मान-सम्मान व प्रभाव में वृद्धि होगी। उच्च अधिकारियों व सहकर्मियों का पूर्ण सहयोग प्राप्त होगा।`,
      `व्यापार और नौकरी में नए लाभदायक अवसर सामने आएंगे। सोची हुई योजनाओं को आज गति मिलेगी और सफलता सुनिश्चित होगी।`,
      `नौकरीपेशा लोगों के लिए पदोन्नति अथवा वेतन वृद्धि के अच्छे संकेत हैं। व्यावसायिक यात्रा लाभकारी रहेगी।`,
      `कार्यक्षेत्र में आपकी कार्यकुशलता और सूझबूझ की सराहना होगी। किसी बड़े प्रोजेक्ट की नई जिम्मेदारी मिल सकती है।`
    ];

    // Finance & Wealth Sentences
    const finances = [
      `आर्थिक दृष्टिकोण से दिन बेहद शुभ है। रुका हुआ धन वापस मिलेगा और आय के नए स्रोत विकसित होंगे।`,
      `वित्तीय मामलों में अप्रत्याशित लाभ के योग बन रहे हैं। निवेश के लिए समय अनुकूल है और बचत में वृद्धि होगी।`,
      `धन आगमन निरंतर बना रहेगा। किसी पुराने कर्ज या देनदारी से मुक्ति मिलने की प्रबल संभावना है।`
    ];

    // Family & Personal Sentences
    const families = [
      `पारिवारिक जीवन में सुख-शांति और आनंद का वातावरण बना रहेगा। जीवनसाथी के साथ संबंधों में मधुरता बढ़ेगी।`,
      `घर-परिवार में किसी मांगलिक कार्य की योजना बन सकती है। मित्रों और संबंधियों से शुभ समाचार प्राप्त होगा।`,
      `रिश्तों में आपसी विश्वास और प्रेम बढ़ेगा। परिवार के वरिष्ठ सदस्यों का आशीर्वाद आपके आत्मविश्वास को बढ़ाएगा।`
    ];

    // Health & Advice Sentences
    const healths = [
      `स्वास्थ्य उत्तम रहेगा। मानसिक शांति और सकारात्मक ऊर्जा बनी रहेगी, दिनभर स्फूर्ति का अनुभव करेंगे।`,
      `सेहत अच्छी रहेगी, फिर भी खानपान और दिनचर्या में संतुलन बनाए रखें। योग-प्राणायाम करना लाभकारी रहेगा।`
    ];

    const c = careers[(daySeed + signIndex * 2) % careers.length];
    const f = finances[(daySeed + signIndex * 3) % finances.length];
    const fam = families[(daySeed + signIndex * 5) % families.length];
    const h = healths[(daySeed + signIndex * 7) % healths.length];

    let prediction = '';
    if (lengthMode === 'short') {
      prediction = `${c} ${f}`;
    } else if (lengthMode === 'medium') {
      prediction = `${c} ${f} ${fam}`;
    } else { // 'detailed' / 'full' - Fills the video card richly
      prediction = `${c} ${f} ${fam} ${h}`;
    }

    const ratings = {
      health: Math.min(5, Math.max(3, 3 + ((daySeed + signIndex * 3) % 3))),
      wealth: Math.min(5, Math.max(3, 4 + ((daySeed + signIndex * 5) % 2))),
      family: Math.min(5, Math.max(3, 3 + ((daySeed + signIndex * 7) % 3))),
      love: Math.min(5, Math.max(2, 3 + ((daySeed + signIndex * 2) % 3))),
      business: Math.min(5, Math.max(3, 4 + ((daySeed + signIndex * 4) % 2))),
      marriage: Math.min(5, Math.max(3, 3 + ((daySeed + signIndex * 6) % 3)))
    };

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
      upay: upay,
      ratings: ratings
    };
  }

  // Generate All 12 Signs for Given Date & Length Mode
  function generateAllDailySigns(dateObj = new Date(), lengthMode = 'detailed') {
    const result = {};
    ZODIAC_SIGNS.forEach(sign => {
      result[sign.id] = generateDailySignData(sign, dateObj, lengthMode);
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
