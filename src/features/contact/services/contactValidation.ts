import type { ContactForm } from '@/types'
import type { Translations } from '@/types/language'

export function validateContactForm(data: ContactForm, t: Translations): Partial<ContactForm> {
  const errors: Partial<ContactForm> = {}

  if (!data.name.trim()) {
    errors.name = t.validation.nameRequired
  } else if (data.name.trim().length < 2) {
    errors.name = t.validation.nameMinLength
  }

  if (!data.email.trim()) {
    errors.email = t.validation.emailRequired
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = t.validation.emailInvalid
  }

  if (!data.message.trim()) {
    errors.message = t.validation.messageRequired
  } else if (data.message.trim().length < 10) {
    errors.message = t.validation.messageMinLength
  }

  return errors
}
