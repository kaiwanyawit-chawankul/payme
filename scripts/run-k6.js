import { spawn, execSync } from 'node:child_process';
import http from 'node:http';
import process from 'node:process';

const DEV_URL = 'http://localhost:5173';
const SERVER_CMD = 'npx';
const SERVER_ARGS = ['vite', '--host', 'localhost', '--port', '5173'];

function waitForServer(url, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + timeoutMs;

    const check = () => {
      const req = http.get(url, (res) => {
        res.destroy();
        resolve();
      });

      req.on('error', (error) => {
        if (Date.now() > deadline) {
          reject(new Error(`Server did not start within ${timeoutMs}ms: ${error.message}`));
        } else {
          setTimeout(check, 200);
        }
      });
    };

    check();
  });
}

async function run() {
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
    viteProcess.kill();
  }
}

run();
