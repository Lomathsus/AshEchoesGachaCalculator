import axios from 'axios'

import { baseBody, characterBody, memoryTraceBody } from '../constant'

const fetchService = {
  name: 'fetch',
  methods: {
    async fetchGachaData(params: { dateRange: [number, number]; type: string; cookie: string }) {
      console.log(baseBody)
      const body = {
        ...baseBody,
        ...(params.type === 'memoryTrace' ? memoryTraceBody : characterBody),
        startTime: params.dateRange[0],
        endTime: params.dateRange[1],
      }
      const response = await axios.post('https://comm.ams.game.qq.com/ide/', body, {
        headers: {
          accept: 'application/json, text/plain, */*',
          'accept-language': 'zh-CN,zh;q=0.9',
          origin: 'https://seed.qq.com',
          priority: 'u=1, i',
          referer: 'https://seed.qq.com/',
          'content-type': 'application/x-www-form-urlencoded',
          Host: 'comm.ams.game.qq.com',
          Connection: 'keep-alive',
          Cookie: params.cookie,
        },
      })

      return JSON.parse(
        JSON.stringify({
          data: response.data.jData.data,
          code: response.status,
        })
      )
    },
  },
}

export default fetchService
