import axios from 'axios'
import fs from 'fs'

import { baseBody, characterBody, memoryTraceBody } from '@/main/constant'
import { getDataPath } from '@/main/utils/saveCookies'

const fetchService = {
  name: 'fetch',
  methods: {
    getGachaData: async (params: { dateRange: [number, number]; type: string }) => {
      const cookiePath = getDataPath('cookies.json') // 使用动态路径
      try {
        const json = fs.readFileSync(cookiePath, 'utf-8')
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
            Cookie: JSON.parse(json)
              .map((item: any) => `${item.name}=${item.value}`)
              .join(';'),
          },
        })

        return JSON.parse(
          JSON.stringify({
            data: response.data.jData.data,
            code: response.status,
          })
        )
      } catch (err) {
        console.error('读取文件时发生错误:', err)
      }
    },
  },
} as const

export { fetchService }
