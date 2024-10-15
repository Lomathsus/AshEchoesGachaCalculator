// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import type { IpcRendererEvent } from 'electron'
import { contextBridge, ipcRenderer } from 'electron'

import { makeChannelName, services } from './services'

interface Bridge {
  [serviceName: string]: {
    [methodName: string]: (...args: any[]) => any
  }
}

function createJsBridge(): any {
  const bridge: Bridge = {}

  services.forEach((service) => {
    bridge[service.name] = {} as any
    Object.keys(service.methods).forEach((fnName) => {
      bridge[service.name][fnName] = (...args) =>
        ipcRenderer.invoke(makeChannelName(service.name, fnName), ...args)
    })
  })

  return bridge
}

contextBridge.exposeInMainWorld('jsBridge', createJsBridge())
// 安全地暴露 ipcRenderer API 给渲染进程

contextBridge.exposeInMainWorld('electron', {
  send: (channel: string, data?: any) => {
    ipcRenderer.send(channel, data)
  },
  on: (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.on(channel, (event: IpcRendererEvent, ...args: any[]) => callback(...args))
  },

  readCookies: () => ipcRenderer.invoke('read-cookies-json'),
})
