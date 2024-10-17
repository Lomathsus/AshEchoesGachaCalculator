import type { services } from '@/main/services'

// 类型辅助函数
type ExtractService<T> = T extends { name: infer N; methods: infer M }
  ? N extends string
    ? { [K in N]: M }
    : never
  : never
// 这个实用工具类型将联合类型转换为交集类型
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
  ? I
  : never
type CombinedServices<T extends readonly any[]> = UnionToIntersection<ExtractService<T[number]>>

type CombinedServiceType = CombinedServices<typeof services>

export type JsBridgeApi = CombinedServiceType

export interface ElectronAPI {
  send: (channel: string, data?: any) => void
  on: (channel: string, callback: (...args: any[]) => void) => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    jsBridge: Omit<JsBridgeApi, 'axios'>
    axios: JsBridgeApi['axios']
  }
}
