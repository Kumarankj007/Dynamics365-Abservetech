"use client"
import Loader from '../hooks/Loader'
import { useMounted } from '../hooks/useMounted'
import React from 'react'

const MountedProvider = ({ children }: { children: React.ReactNode }) => {
  const mounted = useMounted()
  if (!mounted) return <Loader />
  return children
}

export default MountedProvider