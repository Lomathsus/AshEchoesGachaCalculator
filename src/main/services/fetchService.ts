import axios from 'axios'
import fs from 'fs'

import { getDataPath } from '@/main/utils/saveCookies'

import { baseBody, characterBody, memoryTraceBody } from '../constant'

const fetchService = {
  name: 'fetch',
  methods: {
    // async fetchGachaData(params: { dateRange: [number, number]; type: string; cookie: string }) {
    //   const cookiePath = getDataPath('cookies.json') // 使用动态路径
    //   fs.readFile(cookiePath, 'utf-8', async (err, data) => {
    //     if (err || !data) {
    //       console.log('cookie.json 文件不存在或读取失败')
    //     } else {
    //       const body = {
    //         ...baseBody,
    //         ...(params.type === 'memoryTrace' ? memoryTraceBody : characterBody),
    //         startTime: params.dateRange[0],
    //         endTime: params.dateRange[1],
    //       }
    //       const response = await axios.post('https://comm.ams.game.qq.com/ide/', body, {
    //         headers: {
    //           accept: 'application/json, text/plain, */*',
    //           'accept-language': 'zh-CN,zh;q=0.9',
    //           origin: 'https://seed.qq.com',
    //           priority: 'u=1, i',
    //           referer: 'https://seed.qq.com/',
    //           'content-type': 'application/x-www-form-urlencoded',
    //           Host: 'comm.ams.game.qq.com',
    //           Connection: 'keep-alive',
    //           Cookie: params.cookie,
    //         },
    //       })
    //
    //       return JSON.parse(
    //         JSON.stringify({
    //           data: response.data.jData.data,
    //           code: response.status,
    //         })
    //       )
    //     }
    //   })
    // },
  },
} as const

export { fetchService }
