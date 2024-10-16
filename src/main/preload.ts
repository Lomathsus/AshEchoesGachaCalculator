// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import type { IpcRendererEvent } from 'electron'
import { contextBridge, ipcRenderer } from 'electron'

// import type { services } from '@/main/services'
import { makeChannelName, services } from '@/main/services'

type Bridge = {
  [key in (typeof services)[number]['name']]: {
    [propName: string]: (...args: any[]) => void
  }
}
function createJsBridge(): any {
  const bridge: Bridge = {} as any
  services.forEach((service) => {
    bridge[service.name] = {}
    Object.keys(service.methods).forEach((fnName) => {
      bridge[service.name][fnName] = (...args) =>
        ipcRenderer.invoke(makeChannelName(service.name, fnName), ...args)
    })
  })

  return bridge
}

contextBridge.exposeInMainWorld('jsBridge', createJsBridge())

contextBridge.exposeInMainWorld('electron', {
  send: (channel: string, data?: any) => {
    ipcRenderer.send(channel, data)
  },
  on: (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.on(channel, (event: IpcRendererEvent, ...args: any[]) => callback(...args))
  },
  fetchGachaData: (...args) => ipcRenderer.invoke('fetch-gacha-data', ...args),
})
