const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { chromium } = require('playwright');

const repoRoot = path.resolve(__dirname, '..');
const profileDir = path.join(repoRoot, 'data', 'itjuzi', 'profile');
const stateDir = path.join(repoRoot, 'data', 'itjuzi', 'state');
const configPath = path.join(repoRoot, '.itjuzi-scraper.json');
const exampleConfigPath = path.join(repoRoot, '.itjuzi-scraper.example.json');
const defaultEdgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function loadConfig() {
  const source = fs.existsSync(configPath) ? configPath : exampleConfigPath;
  if (!fs.existsSync(source)) {
    throw new Error('Missing .itjuzi-scraper.json and .itjuzi-scraper.example.json');
  }
  return JSON.parse(fs.readFileSync(source, 'utf8').replace(/^\uFEFF/, ''));
}

function waitForEnter(prompt) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(prompt, () => {
    rl.close();
    resolve();
  }));
}

(async () => {
  ensureDir(profileDir);
  ensureDir(stateDir);
  const config = loadConfig();
  const edgePath = config.edgePath || defaultEdgePath;
  const startUrl = config.loginUrl || config.seedUrls?.[0] || 'https://www.itjuzi.com/';

  const context = await chromium.launchPersistentContext(profileDir, {
    executablePath: edgePath,
    headless: false,
    viewport: { width: 1440, height: 960 },
    args: ['--disable-blink-features=AutomationControlled']
  });

  const page = context.pages()[0] || await context.newPage();
  await page.goto(startUrl, { waitUntil: 'domcontentloaded' });

  console.log('IT桔子登录窗口已打开。');
  console.log('请在这个专用 Edge profile 中完成登录，并导航到你常看的 IT 桔子融资/AI 页面。');
  console.log('完成后回到终端按回车，我会保留登录态供后续增量抓取复用。');

  await waitForEnter('登录完成后按回车继续... ');

  const meta = {
    updatedAt: new Date().toISOString(),
    profileDir,
    startUrl,
    lastVisibleUrl: page.url()
  };
  fs.writeFileSync(path.join(stateDir, 'session-meta.json'), JSON.stringify(meta, null, 2), 'utf8');

  await context.close();
  console.log('登录态已保存在 data/itjuzi/profile');
})();



