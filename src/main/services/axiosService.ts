import type { AxiosRequestConfig } from 'axios'

import service from '@/main/utils/request'

interface StandardResponse<R> {
  code: number
  data: R
  headers?: any
  msg?: string
  status?: string
}

const axiosService = {
  name: 'axios',
  methods: {
    get: <Res = any, T = any>(
      url: string,
      params?: T,
      config?: AxiosRequestConfig
    ): Promise<StandardResponse<Res>> => {
      return service({
        url,
        method: 'get',
        params,
        ...config,
      })
    },
    post: <Res = any, T = any>(
      url: string,
      params?: T,
      config?: AxiosRequestConfig<T>
    ): Promise<StandardResponse<Res>> => {
      return service({
        url,
        method: 'post',
        data: params,
        ...config,
      })
    },
  },
} as const

export { axiosService }
