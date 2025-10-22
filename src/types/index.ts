export interface Project {
  id: string
  title: string
  description: string
  technologies: string[]
  imageUrl?: string
  demoUrl?: string
  githubUrl?: string
  featured: boolean
}

export interface Profile {
  name: string
  title: string
  bio: string
  avatar?: string
  email: string
  social: {
    github?: string
    linkedin?: string
    twitter?: string
    website?: string
  }
}

export interface ContactForm {
  name: string
  email: string
  message: string
}
