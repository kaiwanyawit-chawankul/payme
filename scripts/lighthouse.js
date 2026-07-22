import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import lighthouse from 'lighthouse';
import chromeLauncher from 'chrome-launcher';

const __filename = fileURLToPath(import.meta.url);
const __dirname = new URL('.', import.meta.url).pathname;

async function runLighthouse() {
  const server = await import('http-server');
  const { createServer } = server;
  const httpServer = createServer({ root: `${__dirname}/../dist`, cors: true });
  const serverInstance = httpServer.listen(4173);

  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless=new', '--no-sandbox'] });
  const runnerResult = await lighthouse('http://127.0.0.1:4173', {
    port: chrome.port,
    output: 'html',
    logLevel: 'info'
  });

  const reportHtml = runnerResult.report;
  const reportPath = `${__dirname}/../reports/lighthouse-report.html`;
  fs.mkdirSync(`${__dirname}/../reports`, { recursive: true });
  fs.writeFileSync(reportPath, reportHtml);
  console.log(`Lighthouse report saved to ${reportPath}`);

  await chrome.kill();
  serverInstance.close();
}

runLighthouse().catch((error) => {
  console.error(error);
  process.exit(1);
});
