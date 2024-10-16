import axios from 'axios'
import { ipcMain } from 'electron'
import fs from 'fs'

import { baseBody, characterBody, memoryTraceBody } from '@/main/constant'
import { makeChannelName, services } from '@/main/services'
import { getDataPath } from '@/main/utils/saveCookies'

type ApiFunction = (...args: any[]) => any

export default function registerIpcHandle(): void {
  services.forEach((service) => {
    Object.entries(service.methods).forEach(([apiName, apiFn]: [string, ApiFunction]) => {
      ipcMain.handle(makeChannelName(service.name, apiName), (event, ...args) => apiFn(...args))
    })
  })
}
