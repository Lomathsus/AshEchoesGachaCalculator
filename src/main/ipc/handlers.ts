import { ipcMain } from 'electron'

import { makeChannelName, services } from '@/main/services'

type ApiFunction = (...args: any[]) => any

export default function registerIpcHandle(): void {
  services.forEach((service) => {
    Object.entries(service.methods).forEach(([apiName, apiFn]: [string, ApiFunction]) => {
      ipcMain.handle(makeChannelName(service.name, apiName), (event, ...args) => apiFn(...args))
    })
  })
}
