import { useAsyncEffect } from 'ahooks'

export default function AuthCheck() {
  useAsyncEffect(async () => {
    const cookies = await window.electron.readCookies()
    console.log(cookies)
  }, [])
}
