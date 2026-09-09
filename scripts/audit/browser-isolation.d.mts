import type { BrowserContext } from '@playwright/test'
export function isolateBrowser(context: BrowserContext, options?: {signedIn?:boolean}): Promise<void>
export const auditSession: {access_token:string;[key:string]:unknown}
