import { spawn, execSync } from 'node:child_process';
import http from 'node:http';
import process from 'node:process';

const STAGE_URL = process.env.STAGE_URL;
const DEV_URL = 'http://127.0.0.1:5173';
const SERVER_CMD = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const SERVER_ARGS = ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '5173'];

function waitForServer(url, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + timeoutMs;

    const check = () => {
      const req = http.get(url, (res) => {
        res.resume();
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 500) {
          resolve();
          return;
        }

        reject(new Error(`Server responded with status ${res.statusCode}`));
      });

      req.on('error', (error) => {
        if (Date.now() > deadline) {
          reject(new Error(`Server did not start within ${timeoutMs}ms: ${error.message}`));
        } else {
          setTimeout(check, 500);
        }
      });
    };

    check();
  });
}

async function run() {
  if (STAGE_URL) {
    console.log(`Using deployed stage URL: ${STAGE_URL}`);
    try {
      execSync('k6 run k6/performance.js', { stdio: 'inherit', shell: true });
    } catch (error) {
      console.error('Failed to run k6 performance test against STAGE_URL:', error.message);
      process.exitCode = 1;
    }
    return;
  }

  const viteProcess = spawn(SERVER_CMD, SERVER_ARGS, {
    shell: true,
    stdio: 'inherit'
  });

  try {
    await waitForServer(DEV_URL);
    console.log('Vite dev server is running, starting k6...');
    execSync('k6 run k6/performance.js', { stdio: 'inherit', shell: true });
  } catch (error) {
    console.error('Failed to run k6 performance test:', error.message);
    process.exitCode = 1;
  } finally {
    if (!viteProcess.killed) {
      viteProcess.kill();
    }
  }
}

run();
