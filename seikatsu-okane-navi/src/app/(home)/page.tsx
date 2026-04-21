'use client'
import { useEffect } from 'react'

export default function Home() {
  useEffect(() => {
    window.location.href = '/index.html'
  }, [])
  return <div>読み込み中...</div>
}
