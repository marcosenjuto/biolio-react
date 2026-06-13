import { useState, ChangeEvent } from 'react'
import type { ContactForm } from '@/types'
import { validateContactForm } from '@/features/contact/services/contactValidation'
import { submitContactForm } from '@/features/contact/services/contactService'
import { useLanguageStore } from '@/store/languageStore'

export function useContactForm() {
  const { t } = useLanguageStore()
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    message: '',
  })

  const [errors, setErrors] = useState<Partial<ContactForm>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    
    // Clear error for this field when user starts typing
    if (errors[name as keyof ContactForm]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (): Promise<boolean> => {
    // Validate form
    const validationErrors = validateContactForm(formData, t)
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return false
    }

    // Submit form
    setIsSubmitting(true)
    try {
      await submitContactForm(formData)
      
      // Reset form on success
      setFormData({
        name: '',
        email: '',
        message: '',
      })
      setErrors({})
      
      return true
    } catch (error) {
      setErrors({
        message: error instanceof Error ? error.message : 'Failed to send message. Please try again.',
      })
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
  }
}
