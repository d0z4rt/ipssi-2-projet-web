import React from 'react'
import { Routes, Route } from 'react-router-dom'

import { Footer } from './src/components/Footer'
import { Navbar } from './src/components/Navbar'
import { Admin } from './src/pages/Admin'
import { Dashboard } from './src/pages/Dashboard'
import { GameDetails } from './src/pages/GameDetails'
import { Games } from './src/pages/Games'
import { Home } from './src/pages/Home'
import { Login } from './src/pages/Login'
import { Register } from './src/pages/Register'
export function App() {
  return (
    <div className="flex flex-col min-h-screen bg-darkBg text-gray-200 font-inter">
      <Navbar />

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/games" element={<Games />} />
          <Route path="/games/:id" element={<GameDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}
