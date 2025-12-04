import { useState } from 'react'
import { useContactForm } from '@/features/contact/hooks/useContactForm'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import { useLanguageStore } from '@/store/languageStore'

function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const { formData, errors, handleChange, handleSubmit, isSubmitting } = useContactForm()
  const { t } = useLanguageStore()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const success = await handleSubmit()
    if (success) {
      setSubmitted(true)
    }
  }

  if (submitted) {
    return (
      <div className="contact-page-success max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="success-container max-w-2xl mx-auto">
          <Card className="success-card">
            <div className="success-content text-center py-8">
              <div className="success-icon text-green-600 text-6xl mb-4">✓</div>
              <h2 className="success-title text-3xl font-bold mb-4">{t.contact.successTitle}</h2>
              <p className="success-message text-gray-600 mb-6">
                {t.contact.successMessage}
              </p>
              <Button onClick={() => setSubmitted(false)} className="send-another-button">
                {t.contact.sendAnother}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="contact-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="contact-container max-w-2xl mx-auto">
        <div className="contact-header text-center mb-12">
          <h1 className="contact-title text-4xl font-bold mb-4">{t.contact.title}</h1>
          <p className="contact-subtitle text-xl text-gray-600">
            {t.contact.subtitle}
          </p>
        </div>

        <Card className="contact-form-card">
          <form onSubmit={onSubmit} className="contact-form space-y-6">
            <Input
              label={t.contact.name}
              name="name"
              type="text"
              placeholder={t.contact.namePlaceholder}
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              required
              className="name-input"
            />

            <Input
              label={t.contact.email}
              name="email"
              type="email"
              placeholder={t.contact.emailPlaceholder}
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
              className="email-input"
            />

            <Textarea
              label={t.contact.message}
              name="message"
              placeholder={t.contact.messagePlaceholder}
              rows={6}
              value={formData.message}
              onChange={handleChange}
              error={errors.message}
              required
              className="message-textarea"
            />

            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="submit-button w-full"
            >
              {isSubmitting ? t.contact.sending : t.contact.send}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}

export default ContactPage
