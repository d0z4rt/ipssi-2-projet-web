import React from 'react'
import { Link } from 'react-router-dom'

export const Legal: React.FC = () => {
  return (
    <div className="pt-24 pb-20 min-h-screen max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-orbitron font-bold text-white mb-3">
        Legal
      </h1>
      <p className="text-gray-400 mb-10">
        This section groups the key legal and compliance documents for
        GameCritiq. Last update: March 31, 2026.
      </p>

      <div className="bg-cardBg border border-gray-800 rounded-xl p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-xl font-orbitron text-white mb-2">
            Available Documents
          </h2>
          <p className="text-gray-300">
            You can consult the following pages to understand how the platform
            works, how your data is handled, and how cookies are used.
          </p>
        </div>

        <ul className="space-y-3 text-gray-300">
          <li>
            <Link
              to="/terms-of-service"
              className="text-accent hover:underline underline-offset-4"
            >
              Terms of Service
            </Link>{' '}
            - Rules for using GameCritiq and community standards.
          </li>
          <li>
            <Link
              to="/privacy-policy"
              className="text-accent hover:underline underline-offset-4"
            >
              Privacy Policy
            </Link>{' '}
            - What data we collect and why.
          </li>
          <li>
            <Link
              to="/cookie-policy"
              className="text-accent hover:underline underline-offset-4"
            >
              Cookie Policy
            </Link>{' '}
            - What cookies are used for and how to control them.
          </li>
          <li>
            <Link
              to="/contact-us"
              className="text-accent hover:underline underline-offset-4"
            >
              Contact Us
            </Link>{' '}
            - Ask legal or support questions.
          </li>
        </ul>

        <p className="text-sm text-gray-500">
          These pages are provided for an educational project and are meant to
          reflect realistic platform practices.
        </p>
      </div>
    </div>
  )
}
