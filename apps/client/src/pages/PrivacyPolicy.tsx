import React from 'react'
import { Link } from 'react-router-dom'

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="pt-24 pb-20 min-h-screen max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-orbitron font-bold text-white mb-3">
        Privacy Policy
      </h1>
      <p className="text-gray-400 mb-10">Effective date: March 31, 2026.</p>

      <div className="bg-cardBg border border-gray-800 rounded-xl p-6 sm:p-8 space-y-8 text-gray-300 leading-relaxed">
        <section>
          <h2 className="text-xl font-orbitron text-white mb-2">
            1. Data We Collect
          </h2>
          <p>
            We may collect account information (username, email), basic usage
            data (pages viewed, interactions), and support messages submitted
            via the contact form.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-orbitron text-white mb-2">
            2. How We Use Data
          </h2>
          <p>
            Data is used to operate the platform, improve user experience,
            moderate content, and respond to support requests.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-orbitron text-white mb-2">
            3. Data Retention and Security
          </h2>
          <p>
            We retain data only as needed for platform operation in this project
            context. Reasonable technical and organizational measures are
            applied to protect stored information.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-orbitron text-white mb-2">
            4. Your Rights
          </h2>
          <p>
            You can request access, correction, or deletion of your data by
            sending a request through the{' '}
            <Link
              to="/contact-us"
              className="text-accent hover:underline underline-offset-4"
            >
              Contact Us page
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  )
}
