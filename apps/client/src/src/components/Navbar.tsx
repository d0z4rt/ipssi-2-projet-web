import { AnimatePresence, motion } from 'framer-motion'
import { Gamepad2, LogOut, Menu, X } from 'lucide-react'
import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const handleLogout = () => {
    logout()
    navigate('/')
    setIsOpen(false)
  }
  const navLinks = [
    {
      name: 'Home',
      path: '/'
    },
    {
      name: 'Games',
      path: '/games'
    }
  ]

  if (isAuthenticated) {
    navLinks.push({
      name: 'Dashboard',
      path: '/dashboard'
    })
    if (user?.role === 'admin') {
      navLinks.push({
        name: 'Admin',
        path: '/admin'
      })
    } else if (user?.role === 'curator') {
      navLinks.push({
        name: 'Curator',
        path: '/dashboard'
      })
    }
  }
  const isActive = (path: string) => location.pathname === path
  return (
    <nav className="fixed top-0 w-full z-50 glass-panel border-b-0 border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors">
              <Gamepad2 className="w-6 h-6 text-accent" />
            </div>
            <span className="font-orbitron font-bold text-xl tracking-wider text-white">
              Game<span className="text-accent">Critiq</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-sm font-medium transition-colors hover:text-accent ${isActive(link.path) ? 'text-accent' : 'text-gray-300'}`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-4 border-l border-gray-700 pl-6">
              {isAuthenticated ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center border border-secondary/50">
                      <span className="text-secondary font-bold text-sm">
                        {user?.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-200">
                      {user?.username}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider bg-gray-800 text-gray-400">
                      {user?.role}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 rounded-md bg-accent text-darkBg text-sm font-bold hover:bg-accent/90 transition-colors shadow-[0_0_15px_rgba(0,212,255,0.3)] hover:shadow-[0_0_20px_rgba(0,212,255,0.5)]"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white focus:outline-none"
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{
              opacity: 0,
              height: 0
            }}
            animate={{
              opacity: 1,
              height: 'auto'
            }}
            exit={{
              opacity: 0,
              height: 0
            }}
            className="md:hidden glass-panel border-t border-gray-800"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${isActive(link.path) ? 'bg-accent/10 text-accent' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
                >
                  {link.name}
                </Link>
              ))}

              <div className="pt-4 pb-2 border-t border-gray-800 mt-4">
                {isAuthenticated ? (
                  <div className="px-3">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center border border-secondary/50">
                        <span className="text-secondary font-bold text-lg">
                          {user?.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="text-base font-medium text-white">
                          {user?.username}
                        </div>
                        <div className="text-sm font-medium text-gray-400">
                          {user?.email}
                        </div>
                        <div className="mt-1 inline-flex rounded bg-gray-800 px-2 py-0.5 text-[10px] uppercase tracking-wider text-gray-400">
                          {user?.role}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-red-400/10 transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 px-3">
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="block text-center px-4 py-2 rounded-md border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors"
                    >
                      Log in
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsOpen(false)}
                      className="block text-center px-4 py-2 rounded-md bg-accent text-darkBg font-bold hover:bg-accent/90 transition-colors"
                    >
                      Sign up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
