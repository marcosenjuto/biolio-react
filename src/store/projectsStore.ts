import { create } from 'zustand'
import type { Project } from '@/types'

interface ProjectsState {
  projects: Project[]
  isLoading: boolean
  error: string | null
  addProject: (project: Project) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void
  setProjects: (projects: Project[]) => void
  getFeaturedProjects: () => Project[]
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
}

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  projects: [
    {
      id: '1',
      title: 'E-Commerce Platform',
      description: 'A modern e-commerce solution with real-time inventory management.',
      technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
      featured: true,
      imageUrl: 'https://via.placeholder.com/400x300',
      demoUrl: 'https://example.com',
      githubUrl: 'https://github.com/example',
    },
    {
      id: '2',
      title: 'Task Management App',
      description: 'Collaborative task management with real-time updates.',
      technologies: ['React', 'TypeScript', 'Firebase'],
      featured: true,
      imageUrl: 'https://via.placeholder.com/400x300',
      githubUrl: 'https://github.com/example',
    },
    {
      id: '3',
      title: 'Weather Dashboard',
      description: 'Real-time weather information with beautiful visualizations.',
      technologies: ['React', 'Chart.js', 'OpenWeather API'],
      featured: false,
      imageUrl: 'https://via.placeholder.com/400x300',
      demoUrl: 'https://example.com',
    },
  ],
  isLoading: false,
  error: null,
  addProject: (project) =>
    set((state) => ({ projects: [...state.projects, project] })),
  updateProject: (id, updates) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),
  deleteProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
    })),
  setProjects: (projects) => set({ projects }),
  getFeaturedProjects: () => get().projects.filter((p) => p.featured),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}))
