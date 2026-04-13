'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { UserProfile, FamilyType } from '@/types'
import { getDefaultProfile } from '@/lib/profile'

interface ProfileContextValue {
  profile: UserProfile
  setProfile: (p: UserProfile) => void
  isLoaded: boolean
}

const ProfileContext = createContext<ProfileContextValue>({
  profile: getDefaultProfile(),
  setProfile: () => {},
  isLoaded: false,
})

const STORAGE_KEY = 'navi5'

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile>(getDefaultProfile())
  const [isLoaded, setIsLoaded] = useState(false)

  // localStorage から復元
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const d = JSON.parse(raw)
        if (d.i && d.f) {
          setProfileState({ income: d.i, family: d.f as FamilyType, pref: d.p })
        }
      }
    } catch {}
    setIsLoaded(true)
  }, [])

  const setProfile = (p: UserProfile) => {
    setProfileState(p)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        i: p.income, f: p.family, p: p.pref, ts: Date.now()
      }))
    } catch {}
  }

  return (
    <ProfileContext.Provider value={{ profile, setProfile, isLoaded }}>
      {children}
    </ProfileContext.Provider>
  )
}

export const useProfile = () => useContext(ProfileContext)
