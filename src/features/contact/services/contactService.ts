import type { ContactForm } from '@/types'

export async function submitContactForm(data: ContactForm): Promise<void> {
  // Simulate API call
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate successful submission
      console.log('Contact form submitted:', data)
      
      // In a real app, you would make an API call here:
      // const response = await fetch('/api/contact', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data),
      // })
      
      // Randomly simulate success or failure for demo purposes
      const success = Math.random() > 0.1 // 90% success rate
      
      if (success) {
        resolve()
      } else {
        reject(new Error('Failed to send message. Please try again.'))
      }
    }, 1500)
  })
}
