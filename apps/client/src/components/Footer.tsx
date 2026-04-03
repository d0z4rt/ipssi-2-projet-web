import { Gamepad2, Twitter, Github, Youtube } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router-dom'
export const Footer: React.FC = () => {
  return (
    <footer className="bg-darkBg border-t border-gray-800 pt-12 pb-8 mt-auto relative overflow-hidden">
      {/* Subtle top gradient accent */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent/50 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Gamepad2 className="w-6 h-6 text-accent" />
              <span className="font-orbitron font-bold text-xl tracking-wider text-white">
                Game<span className="text-accent">Critiq</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm max-w-md mb-6 leading-relaxed">
              The ultimate destination for gamers to discover, review, and
              discuss the latest and greatest in video games. Join our community
              today.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer noopener"
                title="Twitter"
                aria-label="Twitter"
                className="text-gray-400 hover:text-accent transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer noopener"
                title="GitHub"
                aria-label="GitHub"
                className="text-gray-400 hover:text-accent transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer noopener"
                title="YouTube"
                aria-label="YouTube"
                className="text-gray-400 hover:text-accent transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-orbitron font-semibold text-white mb-4">
              Platform
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/games"
                  className="text-gray-400 hover:text-accent transition-colors"
                >
                  Browse Games
                </Link>
              </li>
              <li>
                <Link
                  to="/games"
                  className="text-gray-400 hover:text-accent transition-colors"
                >
                  Trending
                </Link>
              </li>
              <li>
                <Link
                  to="/games"
                  className="text-gray-400 hover:text-accent transition-colors"
                >
                  Top Rated
                </Link>
              </li>
              <li>
                <Link
                  to="/games"
                  className="text-gray-400 hover:text-accent transition-colors"
                >
                  New Releases
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-orbitron font-semibold text-white mb-4">
              Legal
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/legal"
                  className="text-gray-400 hover:text-accent transition-colors"
                >
                  Legal
                </Link>
              </li>
              <li>
                <Link
                  to="/terms-of-service"
                  className="text-gray-400 hover:text-accent transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy-policy"
                  className="text-gray-400 hover:text-accent transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/cookie-policy"
                  className="text-gray-400 hover:text-accent transition-colors"
                >
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/contact-us"
                  className="text-gray-400 hover:text-accent transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} GameCritiq. All rights reserved.
          </p>
          <p className="text-gray-600 text-xs flex items-center gap-1">
            Made with <span className="text-red-500">♥</span> for gamers
          </p>
        </div>
      </div>
    </footer>
  )
}
