import { createHashRouter } from 'react-router-dom'

import Main from '@/renderer/windows/main/gacha'
import Login from '@/renderer/windows/main/gacha/login'

const router = createHashRouter([
  { path: '/login', Component: Login },
  { path: '/', Component: Main },
])

export default router
