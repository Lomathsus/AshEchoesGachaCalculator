export interface ElectronAPI {
  send: (channel: string, data?: any) => void
  on: (channel: string, callback: (...args: any[]) => void) => void
  readCookies: () => Promise<any[]>
}

declare global {
  interface Window {
    electron: ElectronAPI
  }
}
