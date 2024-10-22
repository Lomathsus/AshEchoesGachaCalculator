import { Button, Flex, Image } from 'antd'
import React from 'react'

import { Container, Stack } from '@mui/system'

import seedIcon from '@/renderer/assets/images/白荆科技.png'

export default function Login() {
  return (
    <Container className="h-full bg-gray-600 ">
      <Flex className="pt-[20%]" vertical justify="center" align="center">
        <Image preview={false} src={seedIcon} width={200} />
        <Button
          className="text-neutral-600"
          ghost
          onClick={() => {
            window.electron.send('open-auth-window')
          }}
        >
          登录授权
        </Button>
      </Flex>
    </Container>
  )
}
