import { axiosService } from '@/main/services/axiosService'

import { fetchService } from './fetchService'

export function makeChannelName(name: string, fnName: string) {
  return `${name}.${fnName}`
}

export const services = [fetchService, axiosService]
