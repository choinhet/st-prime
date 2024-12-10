import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: [
        ['html'],
        ['list', { printSteps: true }]
    ],
    timeout: 60000,
    expect: {
        timeout: process.env.CI ? 60000 : 10000
    },
    use: {
        baseURL: 'http://localhost:8501',
        trace: 'on-first-retry',
        headless: true,
        launchOptions: {
            logger: {
                isEnabled: (name) => name !== 'api',
                log: (name, message) => {
                    if (name !== 'api') {
                        console.log(`[${name}] ${message}`);
                    }
                }
            }
        }
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
    webServer: [
        {
            command: 'npm run dev',
            url: 'http://localhost:5173',
            reuseExistingServer: !process.env.CI,
            stdout: 'pipe',
            stderr: 'pipe',
            timeout: 120000,
        },
        {
            command: 'uv run streamlit run ../tests/test_root.py',
            url: 'http://localhost:8501',
            reuseExistingServer: !process.env.CI,
            stdout: 'ignore',
            stderr: 'ignore',
            timeout: 120000,
        }
    ],
}); 