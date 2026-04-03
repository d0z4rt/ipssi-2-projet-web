import { Routes, Route } from 'react-router-dom'

import { Footer } from './components/Footer'
import { Navbar } from './components/Navbar'
import { Admin } from './pages/Admin'
import { ContactUs } from './pages/ContactUs'
import { CookiePolicy } from './pages/CookiePolicy'
import { Dashboard } from './pages/Dashboard'
import { GameDetails } from './pages/GameDetails'
import { Games } from './pages/Games'
import { Home } from './pages/Home'
import { Legal } from './pages/Legal'
import { Login } from './pages/Login'
import { PrivacyPolicy } from './pages/PrivacyPolicy'
import { Register } from './pages/Register'
import { TermsOfService } from './pages/TermsOfService'
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
