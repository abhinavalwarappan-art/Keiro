import {expect} from '@playwright/test'
export async function setup(page,lang={code:'en-US',en:'English',native:'English'},picker=false){
 await page.route('**/api/tts',r=>r.fulfill({status:503,body:'{}'}))
 await page.route('**/api/mic-diagnostics',r=>r.fulfill({status:204}))
 await page.route('**/api/chat',r=>r.fulfill({contentType:'text/event-stream',body:'data: '+JSON.stringify({text:'Audit response — '+lang.native})+'\ndata: [DONE]\n'}))
 if(picker){
  await page.goto('http://localhost:3101/onboarding?fresh=1')
  await page.getByLabel('Search languages').fill(lang.en)
  await page.getByRole('option').filter({hasText:lang.en}).first().click()
  await expect(page).toHaveURL(new RegExp('lang='+lang.code))
  await page.getByTestId('confirm-continue').click()
  await page.waitForURL(/\/(auth|chat)\?/);if(page.url().includes('/auth'))await page.getByTestId('guest-start').click()
  await page.waitForURL('**/chat**')
 }else await page.goto('http://localhost:3101/chat?'+new URLSearchParams({lang:lang.code,langName:lang.en,langNative:lang.native}))
 const dialog=page.getByRole('dialog')
 await dialog.locator('input[autocomplete="name"]').fill('Synthetic Audit Patient')
 await dialog.locator('input[inputmode="numeric"]').fill('01/01/1960')
 await dialog.locator('fieldset').first().locator('button').first().click()
 await dialog.locator('input[type="checkbox"]').check()
 await dialog.locator('button[type="submit"]').click()
 await expect(dialog).toBeHidden()
 await expect(page.locator('#chat-input')).toBeEnabled()
}
