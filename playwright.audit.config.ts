import { defineConfig } from '@playwright/test'
import original from './playwright.config'
export default defineConfig({
 ...original,
 webServer: undefined,
 retries: 0,
 workers: 2,
 use: {...original.use, baseURL:'http://localhost:3101'},
 reporter: [['list'],['json',{outputFile:'artifacts/prelaunch-2026-09-08/e2e.json'}]],
})
