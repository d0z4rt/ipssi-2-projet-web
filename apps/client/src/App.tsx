import { Routes, Route } from 'react-router-dom'

import { Footer } from './src/components/Footer'
import { Navbar } from './src/components/Navbar'
import { Admin } from './src/pages/Admin'
import { ContactUs } from './src/pages/ContactUs'
import { CookiePolicy } from './src/pages/CookiePolicy'
import { Dashboard } from './src/pages/Dashboard'
import { GameDetails } from './src/pages/GameDetails'
import { Games } from './src/pages/Games'
import { Home } from './src/pages/Home'
import { Legal } from './src/pages/Legal'
import { Login } from './src/pages/Login'
import { PrivacyPolicy } from './src/pages/PrivacyPolicy'
import { Register } from './src/pages/Register'
import { TermsOfService } from './src/pages/TermsOfService'
export function App() {
  return (
    <div className="flex flex-col min-h-screen bg-darkBg text-gray-200 font-inter">
      <Navbar />

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/games" element={<Games />} />
          <Route path="/games/:slug" element={<GameDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />
          <Route path="/contact-us" element={<ContactUs />} />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}
