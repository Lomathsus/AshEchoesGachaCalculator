/** axios封装
 * 请求拦截、相应拦截、错误统一处理
 */
import axios from 'axios'
import { cloneDeep } from 'lodash'
import { compile, parse } from 'path-to-regexp'

const service = axios.create()

// 异常拦截处理器
const errorHandler = (error: any) => {
  if (error.response) {
    const { data } = error.response
    if (data) {
      const { config } = error
      setTimeout(() => {
        console.error({
          message: error.response.status + ' ' + error.response.statusText,
          description: config.url + ' ' + (data.msg || data.message || '接口请求失败！'),
        })
      }, 500)
    }
  }
  return Promise.reject(error)
}

// 请求拦截器
service.interceptors.request.use((config) => {
  // 处理动态 url，将 url 中的 :id 替换为对应的参数
  const method = config.method || 'GET'
  let url = config.url || ''
  const opt = ['GET', 'DELETE'].includes(method.toUpperCase()) ? 'params' : 'data'
  const originData = config[opt]
  let cloneData = null
  if (Object.prototype.toString.call(originData) !== '[object FormData]') {
    cloneData = cloneDeep(originData)
  } else {
    cloneData = originData
  }
  try {
    let domain = ''
    const urlMatch = url.match(/[a-zA-z]+:\/\/[^/]*/)
    if (urlMatch) {
      domain = urlMatch[0]
      url = url.slice(domain.length)
    }

    const match = parse(url)
    url = compile(url)(originData)
    match.tokens.forEach((item) => {
      if (item.type === 'param' && item.name in cloneData) {
        delete cloneData[item.name]
      }
    })

    url = domain + url
  } catch (err) {
    console.log(err)
  }

  config.url = url
  config[opt] = cloneData

  return config
}, errorHandler)

// 响应拦截器
service.interceptors.response.use((res) => {
  // 单独对文件进行处理
  const { responseType } = res.config

  if (responseType === 'blob') {
    return {
      data: res.data,
      headers: res.headers,
      code: res.status,
    }
  } else if (
    (res.headers['content-type'] &&
      ['text/plain', 'application/octet-stream'].indexOf(res.headers['content-type']) !== -1) ||
    res.headers['content-disposition']
  ) {
    return {
      data: res.data,
      headers: res.headers,
      code: res.status,
    }
  } else {
    return res.data
  }
}, errorHandler)

export default service
