import type { services } from '@/main/services'

type AddPrefix<T extends string, Prefix extends string> = `${Prefix}.${T}`

// 获取单个服务的方法前缀后的名称
type PrefixedMethods<Service> = Service extends { name: infer N; methods: infer M }
  ? N extends string
    ? keyof M extends string
      ? AddPrefix<keyof M, N>
      : never
    : never
  : never

// 将所有服务的方法前缀名称联合起来
type CombinePrefixedMethods<Services extends any[]> = {
  [K in keyof Services]: PrefixedMethods<Services[K]>
}[number]

// 类型联合
type AllCombinedPrefixedMethods = CombinePrefixedMethods<typeof services>

declare global {
  namespace IPC {
    type Channels = AllCombinedPrefixedMethods
  }
}
