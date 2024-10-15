import { ipcMain } from 'electron'

import { makeChannelName, services } from '@/main/services'
import { readCookiesFromFile } from '@/main/utils/saveCookies'

type ApiFunction = (...args: any[]) => any

export default (): void => {
  ipcMain.handle('read-cookies-json', () => readCookiesFromFile())

  services.forEach((service) => {
    Object.entries(service.methods).forEach(([apiName, apiFn]: [string, ApiFunction]) => {
      ipcMain.handle(makeChannelName(service.name, apiName), (ev, ...args) => apiFn(...args))
    })
  })
}
