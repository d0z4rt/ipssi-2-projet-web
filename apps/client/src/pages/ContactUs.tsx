import { AlertCircle, CheckCircle2, Loader2, Mail, Send } from 'lucide-react'
import React, { useState } from 'react'

import { ContactRequest, contactService } from '../services/api'
import { formFieldClassName } from '../styles/form'

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error'

const initialForm: ContactRequest = {
  firstName: '',
  lastName: '',
  email: '',
  subject: '',
  category: 'support',
  message: '',
  acceptedPolicy: false
}

export const ContactUs: React.FC = () => {
  const [form, setForm] = useState<ContactRequest>(initialForm)
  const [status, setStatus] = useState<SubmitStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = event.target
    if (type === 'checkbox') {
      const checked = (event.target as HTMLInputElement).checked
      setForm((prev) => ({
        ...prev,
        [name]: checked
      }))
      return
    }

    setForm((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCategoryChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      category: event.target.value as ContactRequest['category']
    }))
  }

  const validateForm = () => {
    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.email.trim() ||
      !form.subject.trim() ||
      !form.message.trim()
    ) {
      setErrorMessage('Please complete all required fields.')
      return false
    }

    if (!form.acceptedPolicy) {
      setErrorMessage('You must accept the policy notice to send this form.')
      return false
    }

    return true
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')

    if (!validateForm()) {
      setStatus('error')
      return
    }

    try {
      setStatus('submitting')
      const payload: ContactRequest = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        category: form.category,
        message: form.message.trim(),
        acceptedPolicy: form.acceptedPolicy
      }

      await contactService.submit(payload)
      setStatus('success')
    } catch (error) {
      // oxlint-disable-next-line no-console
      console.error('Failed to submit contact form', error)
      setStatus('error')
      setErrorMessage(
        'Unable to send your message right now. Please try again in a moment.'
      )
    }
  }

  return (
    <div className="pt-24 pb-20 min-h-screen max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-orbitron font-bold text-white mb-3">
        Contact Us
      </h1>
      <p className="text-gray-400 mb-10">
        Need help, want to report a bug, or discuss a partnership? Send us a
        message and we will get back to you.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-cardBg border border-gray-800 rounded-xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  First name *
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  maxLength={80}
                  value={form.firstName}
                  onChange={handleChange}
                  className={formFieldClassName}
                  placeholder="Alex"
                />
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Last name *
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  maxLength={80}
                  value={form.lastName}
                  onChange={handleChange}
                  className={formFieldClassName}
                  placeholder="Martin"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                maxLength={160}
                value={form.email}
                onChange={handleChange}
                className={formFieldClassName}
                placeholder="alex@example.com"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  value={form.category}
                  onChange={handleCategoryChange}
                  className={formFieldClassName}
                >
                  <option value="support">Support</option>
                  <option value="bug-report">Bug report</option>
                  <option value="business">Business inquiry</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Subject *
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  required
                  maxLength={120}
                  value={form.subject}
                  onChange={handleChange}
                  className={formFieldClassName}
                  placeholder="I need help with my review"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={7}
                minLength={20}
                maxLength={2000}
                value={form.message}
                onChange={handleChange}
                className={formFieldClassName}
                placeholder="Please describe your request with as much detail as possible."
              />
              <p className="text-xs text-gray-500 mt-2">
                {form.message.length}/2000 characters
              </p>
            </div>

            <div className="flex items-start gap-3">
              <input
                id="acceptedPolicy"
                name="acceptedPolicy"
                type="checkbox"
                checked={form.acceptedPolicy}
                onChange={handleChange}
                className="mt-1 h-4 w-4 rounded border-gray-700 bg-darkBg text-accent focus:ring-accent"
              />
              <label htmlFor="acceptedPolicy" className="text-sm text-gray-300">
                I agree that my message and contact information can be processed
                for support and follow-up purposes. *
              </label>
            </div>

            {status === 'error' && errorMessage && (
              <div className="p-4 rounded-lg border border-red-500/40 bg-red-500/10 text-red-300 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm">{errorMessage}</p>
              </div>
            )}

            {status === 'success' && (
              <div className="p-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm">
                  Message sent successfully. Our team will review your request.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent text-darkBg font-bold rounded-lg hover:bg-accent/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(0,212,255,0.3)]"
            >
              {status === 'submitting' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send message
                </>
              )}
            </button>
          </form>
        </div>

        <aside className="bg-cardBg border border-gray-800 rounded-xl p-6 sm:p-8 h-fit space-y-6">
          <div>
            <h2 className="text-xl font-orbitron text-white mb-2">
              Need a hand?
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              Select the right category in the form so your request reaches the
              correct team quickly.
            </p>
          </div>

          <div className="space-y-3 text-sm text-gray-300">
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-accent" />
              support@gamecritiq.local
            </p>
            <p>Response target: 24 to 72 hours (project environment).</p>
          </div>

          <div className="rounded-lg border border-gray-700 bg-darkBg p-4 text-sm text-gray-400 leading-relaxed">
            For urgent moderation issues, use category "Support" and include
            links or usernames involved.
          </div>
        </aside>
      </div>
    </div>
  )
}
