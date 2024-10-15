import { session } from 'electron'
import fs from 'fs'
import path from 'path'

import { assetsPath } from './runtime'

function getDataPath(subPath: string) {
  return path.join(assetsPath, 'data', subPath)
}

function saveSpecificCookiesAsJson(cookieName: string) {
  const cookiePath = getDataPath('cookies.json') // 使用动态路径
  session.defaultSession.cookies
    .get({})
    .then((cookies) => {
      const specificCookies = cookies.filter((cookie) => cookie.name === cookieName)
      fs.mkdirSync(path.dirname(cookiePath), { recursive: true }) // 确保目录存在
      fs.writeFileSync(cookiePath, JSON.stringify(specificCookies, null, 2))
      console.log('Specific cookies have been saved as JSON:', cookiePath)
    })
    .catch((error) => {
      console.error('Failed to get cookies:', error)
    })
}

// 读取 Cookies 的函数
const readCookiesFromFile = () => {
  const savePath = getDataPath('cookies.json')
  if (fs.existsSync(savePath)) {
    const rawData = fs.readFileSync(savePath, 'utf8')
    return Promise.resolve(JSON.parse(rawData))
  } else {
    return Promise.resolve([])
  }
}

export { getDataPath, saveSpecificCookiesAsJson, readCookiesFromFile }
