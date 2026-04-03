import React from 'react'
import { Link } from 'react-router-dom'

export const TermsOfService: React.FC = () => {
  return (
    <div className="pt-24 pb-20 min-h-screen max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-orbitron font-bold text-white mb-3">
        Terms of Service
      </h1>
      <p className="text-gray-400 mb-10">Effective date: March 31, 2026.</p>

      <div className="bg-cardBg border border-gray-800 rounded-xl p-6 sm:p-8 space-y-8 text-gray-300 leading-relaxed">
        <section>
          <h2 className="text-xl font-orbitron text-white mb-2">
            1. Use of the Platform
          </h2>
          <p>
            GameCritiq is a community platform where users can discover games,
            share reviews, and interact with other players. You agree to use the
            platform in good faith and in compliance with applicable laws.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-orbitron text-white mb-2">
            2. Accounts and Responsibilities
          </h2>
          <p>
            You are responsible for the accuracy of your account information and
            for maintaining the confidentiality of your login credentials.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-orbitron text-white mb-2">
            3. User Content
          </h2>
          <p>
            Reviews and comments must remain respectful. Harassment, hate
            speech, spam, and illegal content are prohibited. We may remove
            content that violates these rules.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-orbitron text-white mb-2">
            4. Service Availability
          </h2>
          <p>
            As this is a student project environment, service interruptions,
            updates, and temporary issues may occur without prior notice.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-orbitron text-white mb-2">5. Contact</h2>
          <p>
            For any legal or moderation request, please use the{' '}
            <Link
              to="/contact-us"
              className="text-accent hover:underline underline-offset-4"
            >
              Contact Us form
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  )
}
