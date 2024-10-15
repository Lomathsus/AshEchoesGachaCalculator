// 开发环境动态调整路径
import { app } from 'electron'
import path from 'path'

const isDevelopment = process.env.NODE_ENV === 'development'

const isProduction = process.env.NODE_ENV === 'production'

const assetsPath = app.isPackaged
  ? path.join(process.resourcesPath, 'assets')
  : path.join(__dirname, 'assets')

export { assetsPath }
