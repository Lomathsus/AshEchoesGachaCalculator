// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import type { IpcRendererEvent } from 'electron'
import { contextBridge, ipcRenderer } from 'electron'

import type { JsBridgeApi } from '@/renderer/global'

const bridge: Omit<JsBridgeApi, 'axios'> = {
  fetch: {
    getGachaData: (params) => ipcRenderer.invoke('fetch.getGachaData', params),
  },
}
const axios: JsBridgeApi['axios'] = {
  get: (params) => ipcRenderer.invoke('axios.get', params),
  post: (params) => ipcRenderer.invoke('axios.post', params),
}

contextBridge.exposeInMainWorld('jsBridge', bridge)
contextBridge.exposeInMainWorld('axios', axios)

contextBridge.exposeInMainWorld('electron', {
  send: (channel: string, data?: any) => {
    ipcRenderer.send(channel, data)
  },
  on: (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.on(channel, (event: IpcRendererEvent, ...args: any[]) => callback(...args))
  },
})
