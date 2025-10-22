import { create } from 'zustand'
import type { Profile } from '@/types'

interface ProfileState {
  profile: Profile | null
  isLoading: boolean
  error: string | null
  setProfile: (profile: Profile) => void
  updateProfile: (updates: Partial<Profile>) => void
  clearProfile: () => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: {
    name: 'John Doe',
    title: 'Full Stack Developer',
    bio: 'Passionate developer with experience in modern web technologies. Building beautiful and functional applications.',
    email: 'john.doe@example.com',
    social: {
      github: 'https://github.com/johndoe',
      linkedin: 'https://linkedin.com/in/johndoe',
      twitter: 'https://twitter.com/johndoe',
    },
  },
  isLoading: false,
  error: null,
  setProfile: (profile) => set({ profile }),
  updateProfile: (updates) =>
    set((state) => ({
      profile: state.profile ? { ...state.profile, ...updates } : null,
    })),
  clearProfile: () => set({ profile: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}))
