import { createHashRouter } from 'react-router-dom'

import Main from '@/renderer/windows/main'
import Login from '@/renderer/windows/main/login'

const router = createHashRouter([
  { path: '/login', Component: Login },
  { path: '/', Component: Main },
])

export default router
