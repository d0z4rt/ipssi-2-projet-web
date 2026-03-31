import React from 'react'

export const CookiePolicy: React.FC = () => {
  return (
    <div className="pt-24 pb-20 min-h-screen max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-orbitron font-bold text-white mb-3">
        Cookie Policy
      </h1>
      <p className="text-gray-400 mb-10">Effective date: March 31, 2026.</p>

      <div className="bg-cardBg border border-gray-800 rounded-xl p-6 sm:p-8 space-y-8 text-gray-300 leading-relaxed">
        <section>
          <h2 className="text-xl font-orbitron text-white mb-2">
            1. What Are Cookies
          </h2>
          <p>
            Cookies are small text files stored on your device to help websites
            remember information between visits.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-orbitron text-white mb-2">
            2. Cookies We Use
          </h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              Essential cookies to keep the site functional (session,
              authentication).
            </li>
            <li>
              Preference cookies to remember interface choices when available.
            </li>
            <li>
              Basic analytics cookies in development environments to understand
              feature usage.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-orbitron text-white mb-2">
            3. Managing Cookies
          </h2>
          <p>
            You can control or delete cookies from your browser settings.
            Disabling some cookies may impact login and personalization
            features.
          </p>
        </section>
      </div>
    </div>
  )
}
