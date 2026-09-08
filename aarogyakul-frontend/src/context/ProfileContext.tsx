import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { MemberResponse, FamilyResponse } from '../types/api'
import { useAuth } from '../hooks/useAuth'
import { getMyFamily } from '../api/family'
import { demoGetMyFamily, isDemoMode } from '../demo/demoApi'
import { MEMBER_RAJESH_ID } from '../demo/demoData'

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

/** Returns whether the family record for the current authenticated user is still loading. */
export function isFamilyLoading(userId: string | undefined, loadedUserId: string | null) {
  return Boolean(userId && loadedUserId !== userId)
}

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user, isDemo } = useAuth()
  const [family, setFamily] = useState<FamilyResponse | null>(null)
  const [activeProfile, setActiveProfileState] = useState<MemberResponse | null>(null)
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null)
  const loading = isFamilyLoading(user?.id, loadedUserId)

  const fetchFamily = useCallback(async (): Promise<FamilyResponse | null> => {
    if (isDemoMode()) return demoGetMyFamily()
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
      setLoadedUserId(null)
      return
    }

    setFamily(null)
    setActiveProfileState(null)
    const f = await fetchFamily()
    setFamily(f)
    if (f) {
      if (isDemo) {
        // Auto-select Rajesh Sharma in demo mode, or fall back to storage
        const savedId = localStorage.getItem(STORAGE_KEY) || MEMBER_RAJESH_ID
        const found = f.members.find((m) => m.memberId === savedId)
        if (found) {
          setActiveProfileState(found)
          localStorage.setItem(STORAGE_KEY, found.memberId)
        }
      } else {
        const savedId = localStorage.getItem(STORAGE_KEY)
        if (savedId) {
          const found = f.members.find((m) => m.memberId === savedId)
          if (found) setActiveProfileState(found)
        }
      }
    }
    setLoadedUserId(user.id)
  }, [user, fetchFamily, isDemo])

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
