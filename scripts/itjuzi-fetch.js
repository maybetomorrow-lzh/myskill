const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { chromium } = require('playwright');

const repoRoot = path.resolve(__dirname, '..');
const profileDir = path.join(repoRoot, 'data', 'itjuzi', 'profile');
const rawDir = path.join(repoRoot, 'data', 'itjuzi', 'raw');
const parsedDir = path.join(repoRoot, 'data', 'itjuzi', 'parsed');
const stateDir = path.join(repoRoot, 'data', 'itjuzi', 'state');
const configPath = path.join(repoRoot, '.itjuzi-scraper.json');
const exampleConfigPath = path.join(repoRoot, '.itjuzi-scraper.example.json');
const defaultEdgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function loadJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function saveJson(filePath, value) {
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2), 'utf8');
}

function loadConfig() {
  const source = fs.existsSync(configPath) ? configPath : exampleConfigPath;
  if (!fs.existsSync(source)) {
    throw new Error('Missing .itjuzi-scraper.json and .itjuzi-scraper.example.json');
  }
  return JSON.parse(fs.readFileSync(source, 'utf8').replace(/^\uFEFF/, ''));
}

function normalizeUrl(base, href) {
  try {
    return new URL(href, base).toString();
  } catch {
    return null;
  }
}

function slugFor(url) {
  return crypto.createHash('sha1').update(url).digest('hex').slice(0, 12);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {};
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = args[i + 1];
      if (!next || next.startsWith('--')) {
        parsed[key] = true;
      } else {
        parsed[key] = next;
        i += 1;
      }
    }
  }
  return parsed;
}

function compilePatterns(patterns) {
  return (patterns || []).map((pattern) => new RegExp(pattern, 'i'));
}

function isRelevant(text, keywords) {
  const haystack = (text || '').toLowerCase();
  return (keywords || []).some((keyword) => haystack.includes(String(keyword).toLowerCase()));
}

function firstMatch(text, regexes) {
  for (const regex of regexes) {
    const match = text.match(regex);
    if (match) return match[0];
  }
  return '';
}

function extractFields(text) {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  const company = firstMatch(cleaned, [
    /([\u4e00-\u9fa5A-Za-z0-9·()（）\-]{2,40})(完成|获|宣布完成)[^。]{0,30}(轮|融资)/,
    /([\u4e00-\u9fa5A-Za-z0-9·()（）\-]{2,40})[^。]{0,15}(融资)/
  ]);
  const round = firstMatch(cleaned, [
    /天使\+?轮/, /种子轮/, /Pre-A\+?轮/, /A\+?轮/, /Pre-B\+?轮/, /B\+?轮/, /Pre-C\+?轮/, /C\+?轮/, /D\+?轮/, /战略融资/, /并购/, /IPO/
  ]);
  const amount = firstMatch(cleaned, [
    /[近超约]?\d+(?:\.\d+)?\s*(?:亿|万)?(?:美元|人民币|元)/,
    /数千万(?:美元|人民币|元)/,
    /数亿(?:美元|人民币|元)/
  ]);
  const date = firstMatch(cleaned, [
    /20\d{2}[年\/-]\d{1,2}[月\/-]\d{1,2}日?/,
    /\d{1,2}月\d{1,2}日/
  ]);
  return {
    companyHint: company,
    round,
    amount,
    dateHint: date
  };
}

(async () => {
  ensureDir(profileDir);
  ensureDir(rawDir);
  ensureDir(parsedDir);
  ensureDir(stateDir);

  const config = loadConfig();
  const args = parseArgs();
  const edgePath = config.edgePath || defaultEdgePath;
  const seedUrls = config.seedUrls || [];
  const linkPatterns = compilePatterns(config.eventUrlPatterns || ['\/investevent\/']);
  const keywords = config.aiKeywords || [];
  const limit = Number(args.limit || config.detailLimit || 20);
  const statePath = path.join(stateDir, 'crawl-state.json');
  const state = loadJson(statePath, { seenUrls: {}, lastRunAt: null });

  const context = await chromium.launchPersistentContext(profileDir, {
    executablePath: edgePath,
    headless: config.headless ?? true,
    viewport: { width: 1440, height: 960 },
    args: ['--disable-blink-features=AutomationControlled']
  });

  const page = context.pages()[0] || await context.newPage();
  const discovered = [];
  const visitedSeedUrls = [];

  async function extractSeedLinks(currentPage) {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        await currentPage.waitForLoadState('domcontentloaded');
        await currentPage.waitForTimeout(1500);
        return await currentPage.evaluate(() => Array.from(document.querySelectorAll('a[href]')).map((node) => ({
          href: node.href,
          text: (node.textContent || '').trim()
        })));
      } catch (error) {
        if (attempt === 2) throw error;
        await currentPage.waitForTimeout(1000);
      }
    }
    return [];
  }

  for (const seedUrl of seedUrls) {
    await page.goto(seedUrl, { waitUntil: 'domcontentloaded' });
    const resolvedSeedUrl = page.url();
    visitedSeedUrls.push(resolvedSeedUrl);

    const links = await extractSeedLinks(page);

    for (const link of links) {
      const normalized = normalizeUrl(resolvedSeedUrl, link.href);
      if (!normalized) continue;
      if (!linkPatterns.some((pattern) => pattern.test(normalized))) continue;
      discovered.push({ url: normalized, anchorText: link.text, sourceUrl: resolvedSeedUrl });
    }
  }

  const deduped = [];
  const seenLocal = new Set();
  for (const item of discovered) {
    if (seenLocal.has(item.url)) continue;
    seenLocal.add(item.url);
    deduped.push(item);
  }

  const pending = deduped.filter((item) => !state.seenUrls[item.url]).slice(0, limit);
  const results = [];

  for (const item of pending) {
    await page.goto(item.url, { waitUntil: 'domcontentloaded' });
    const title = await page.title();
    const bodyText = await page.locator('body').innerText();
    const html = await page.content();
    const slug = slugFor(item.url);
    const extracted = extractFields(`${title} ${bodyText}`);
    const record = {
      fetchedAt: new Date().toISOString(),
      url: item.url,
      sourceUrl: item.sourceUrl,
      title,
      anchorText: item.anchorText,
      isAiRelevant: isRelevant(`${title} ${bodyText}`, keywords),
      ...extracted
    };

    fs.writeFileSync(path.join(rawDir, `${slug}.html`), html, 'utf8');
    saveJson(path.join(parsedDir, `${slug}.json`), record);
    state.seenUrls[item.url] = {
      fetchedAt: record.fetchedAt,
      slug,
      isAiRelevant: record.isAiRelevant
    };
    results.push(record);
  }

  state.lastRunAt = new Date().toISOString();
  saveJson(statePath, state);
  saveJson(path.join(parsedDir, 'latest-run.json'), {
    generatedAt: new Date().toISOString(),
    visitedSeedUrls,
    discoveredCount: deduped.length,
    fetchedCount: results.length,
    aiRelevantCount: results.filter((item) => item.isAiRelevant).length,
    results
  });

  await context.close();

  console.log(`Visited seed pages: ${visitedSeedUrls.length}`);
  console.log(`Discovered candidate links: ${deduped.length}`);
  console.log(`Fetched new detail pages: ${results.length}`);
  console.log(`AI-relevant candidates: ${results.filter((item) => item.isAiRelevant).length}`);
  console.log('Output: data/itjuzi/parsed/latest-run.json');
})();




