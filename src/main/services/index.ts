import exampleService from './expamle-service'
import fetchService from './fetch'

export const services = [exampleService, fetchService]

export function makeChannelName(name: string, fnName: string) {
  return `${name}.${fnName}`
}
