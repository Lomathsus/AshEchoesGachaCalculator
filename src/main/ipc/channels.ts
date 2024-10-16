import { makeChannelName, services } from '@/main/services'

const channels: IPC.Channels[] = []
services.forEach((service) => {
  Object.keys(service.methods).forEach((fnName) => {
    channels.push(makeChannelName(service.name, fnName) as IPC.Channels)
  })
})

export default channels
