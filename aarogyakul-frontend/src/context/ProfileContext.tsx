import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { MemberResponse, FamilyResponse } from '../types/api'
import { useAuth } from '../hooks/useAuth'
import { getMyFamily } from '../api/family'

interface ProfileContextValue {
  activeProfile: MemberResponse | null
  family: FamilyResponse | null
  loading: boolean
  setActiveProfile: (member: MemberResponse) => void
  clearProfile: () => void
  reloadFamily: () => Promise<void>
}

const ProfileContext = createContext<ProfileContextValue>(null!)

export function useProfile() {
  return useContext(ProfileContext)
}

const STORAGE_KEY = 'aarogyakul_active_profile_id'

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [family, setFamily] = useState<FamilyResponse | null>(null)
  const [activeProfile, setActiveProfileState] = useState<MemberResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchFamily = useCallback(async (): Promise<FamilyResponse | null> => {
    try {
      return await getMyFamily()
    } catch {
      return null
    }
  }, [])

  const loadFamily = useCallback(async () => {
    if (!user) {
      setFamily(null)
      setActiveProfileState(null)
      setLoading(false)
      return
    }
    const f = await fetchFamily()
    setFamily(f)
    if (f) {
      const savedId = localStorage.getItem(STORAGE_KEY)
      if (savedId) {
        const found = f.members.find((m) => m.memberId === savedId)
        if (found) setActiveProfileState(found)
      }
    }
    setLoading(false)
  }, [user, fetchFamily])

  useEffect(() => {
    void loadFamily()
  }, [loadFamily])

  useEffect(() => {
    if (!user) {
      localStorage.removeItem(STORAGE_KEY)
      setActiveProfileState(null)
      setFamily(null)
    }
  }, [user])

  const setActiveProfile = useCallback((member: MemberResponse) => {
    setActiveProfileState(member)
    localStorage.setItem(STORAGE_KEY, member.memberId)
  }, [])

  const clearProfile = useCallback(() => {
    setActiveProfileState(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const reloadFamily = useCallback(async () => {
    if (!user) return
    const f = await fetchFamily()
    if (f) {
      setFamily(f)
      const currentId = localStorage.getItem(STORAGE_KEY)
      if (currentId) {
        const updated = f.members.find((m) => m.memberId === currentId)
        if (updated) setActiveProfileState(updated)
      }
    }
  }, [user, fetchFamily])

  return (
    <ProfileContext.Provider value={{ activeProfile, family, loading, setActiveProfile, clearProfile, reloadFamily }}>
      {children}
    </ProfileContext.Provider>
  )
}
