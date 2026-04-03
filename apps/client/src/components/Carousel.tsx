import { ChevronLeft, ChevronRight } from 'lucide-react'
import React, { useRef } from 'react'
import { Link } from 'react-router-dom'

type CarouselProps = {
  title: string
  seeMoreLink?: string
  seeMoreLabel?: string
  previousLabel: string
  nextLabel: string
  trackClassName: string
  children: React.ReactNode
}

export const Carousel: React.FC<CarouselProps> = ({
  title,
  seeMoreLink,
  seeMoreLabel = 'Voir plus',
  previousLabel,
  nextLabel,
  trackClassName,
  children
}) => {
  const ref = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (!ref.current) {
      return
    }

    const { scrollLeft, clientWidth } = ref.current
    const firstItem = ref.current.querySelector<HTMLElement>(
      '[data-carousel-item="true"]'
    )

    let scrollStep = clientWidth

    if (firstItem) {
      const styles = window.getComputedStyle(ref.current)
      const gapValue = Number.parseFloat(styles.gap || styles.columnGap || '0')
      const itemWidth =
        firstItem.offsetWidth + (Number.isNaN(gapValue) ? 0 : gapValue)
      const visibleItems = Math.max(1, Math.floor(clientWidth / itemWidth))
      scrollStep = itemWidth * visibleItems
    }

    const scrollTo =
      direction === 'left' ? scrollLeft - scrollStep : scrollLeft + scrollStep

    ref.current.scrollTo({
      left: scrollTo,
      behavior: 'smooth'
    })
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-2">
        <h2 className="text-xl font-bold text-white uppercase tracking-wider">
          {title}
        </h2>
        {seeMoreLink && (
          <Link
            to={seeMoreLink}
            className="text-sm text-blue-400 hover:underline flex items-center"
          >
            {seeMoreLabel} <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        )}
      </div>

      <div className="relative group/carousel">
        <button
          onClick={() => scroll('left')}
          title={previousLabel}
          aria-label={previousLabel}
          className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-10 bg-gray-900/80 border border-gray-700 text-white p-2 rounded-full opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-gray-800"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div ref={ref} className={trackClassName}>
          {children}
        </div>

        <button
          onClick={() => scroll('right')}
          title={nextLabel}
          aria-label={nextLabel}
          className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-10 bg-gray-900/80 border border-gray-700 text-white p-2 rounded-full opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-gray-800"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  )
}
