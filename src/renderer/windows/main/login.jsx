import React from 'react'

export default function Login() {
  return (
    <>
      <button
        onClick={() => {
          window.electron.send('open-auth-window')
        }}
      >
        Open Auth Window
      </button>
    </>
  )
}
