// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
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
