import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { SearchBar } from './SearchBar'
import { SmartImage } from './SmartImage'
import { CATEGORY_LABELS } from '../data/categoryLabels'
import { useSiteData } from '../hooks/useSiteData'
import type { DestinationCategory, Region } from '../types'

// Hero rotation images array
const heroImages = [
  '/images/hero-rotation/image1.jpg',
  '/images/hero-rotation/image2.jpg',
  '/images/hero-rotation/image3.jpg',
  '/images/hero-rotation/image4.jpg',
  '/images/hero-rotation/image5.jpg',
  '/images/hero-rotation/image6.jpg',
  '/images/hero-rotation/image7.jpg',
]

const featureRegionSlugs = [
  'sofia-grad',
  'plovdiv',
  'varna',
  'veliko-tarnovo',
  'smolyan',
  'burgas',
]

const categoryOrder: DestinationCategory[] = [
  'cave',
  'eco_trail',
  'waterfall',
  'monastery',
  'museum',
  'monument',
  'reservoir_lake_view',
  'resort',
  'natural',
  'historical',
]

const categoryTone: Record<DestinationCategory, string> = {
  monument: 'from-[#f4d58d] to-[#8f6b2f]',
  cave: 'from-[#b8c6db] to-[#4b5f77]',
  eco_trail: 'from-[#a7d7a9] to-[#2d6a4f]',
  waterfall: 'from-[#9bd8ee] to-[#1f5973]',
  monastery: 'from-[#e7c7a0] to-[#8a4f2d]',
  museum: 'from-[#d8c6ff] to-[#5a4a8f]',
  historical: 'from-[#f0c987] to-[#8b5e34]',
  natural: 'from-[#b7e4c7] to-[#1b5e3c]',
  reservoir_lake_view: 'from-[#a8dadc] to-[#2b6777]',
  resort: 'from-[#ffd6a5] to-[#b5651d]',
}

export function MobileHomeExperience() {
  const [showAllCategories, setShowAllCategories] = useState(false)
  const [currentHeroImage, setCurrentHeroImage] = useState('')
  const { regions, allDestinations } = useSiteData()

  // Random hero image selection on component mount
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * heroImages.length)
    setCurrentHeroImage(heroImages[randomIndex])
  }, [])
  const featuredRegions = featureRegionSlugs
    .map((slug) => regions.find((region) => region.slug === slug))
    .filter((region): region is Region => Boolean(region))
  const featuredDestinations = allDestinations.slice(0, 6)
  const categoryCounts = categoryOrder.map((category) => ({
    category,
    label: CATEGORY_LABELS[category],
    count: allDestinations.filter((destination) => destination.category === category)
      .length,
  }))
  
  // Show only first 6 categories by default, rest on demand
  const visibleCategories = showAllCategories ? categoryCounts : categoryCounts.slice(0, 6)

  return (
    <div className="bg-[var(--bg)]">
      <section 
          className="relative isolate min-h-[500px] lg:min-h-[600px] overflow-hidden pb-4 pt-16 lg:pb-0 lg:pt-20"
          style={{
            backgroundImage: `url(${currentHeroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: 'brightness(1.2) saturate(1.1)',
            transition: 'all 1s ease'
          }}
        >
        {/* Enhanced gradient overlays for better text readability */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-transparent via-transparent to-[var(--forest)]/20" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(0,0,0,0.1),rgba(0,0,0,0.3)_50%,rgba(0,0,0,0.5)_100%)]" />
        
        {/* Desktop specific gradient for text readability */}
        <div className="hidden lg:absolute lg:inset-0 lg:-z-10 lg:bg-gradient-to-r lg:from-black/30 lg:via-black/20 lg:to-transparent" />
        
        {/* Animated ambient orbs */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-[var(--sky)]/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-[var(--sand)]/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        {/* All content positioned ON TOP of the image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 flex min-h-[400px] flex-col justify-end lg:min-h-[500px] lg:max-w-7xl lg:flex-row lg:items-center lg:justify-between lg:gap-12 xl:gap-16 lg:mx-auto"
        >
          {/* Left column - Text content directly on image */}
          <div className="flex flex-col justify-center lg:flex-1 lg:pr-8 px-4 lg:px-0">
            {/* Enhanced badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-fit rounded-full border border-white/50 bg-black/30 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur-md shadow-[0_8px_20px_rgba(0,0,0,0.3)]"
            >
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                Пътеводител за България
              </span>
            </motion.div>
            
            {/* Enhanced heading */}
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-6 font-display text-[3.2rem] lg:text-[4.5rem] xl:text-[5rem] font-black leading-[0.9] text-white drop-shadow-2xl"
            >
              Откривай
              <br />
              <span className="text-white">
                места по-лесно
              </span>
            </motion.h1>
            
            {/* Enhanced description */}
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-6 text-lg lg:text-xl leading-relaxed text-white font-semibold drop-shadow-xl"
            >
              Области, категории и подбрани места в структура, направена за
              телефон.
            </motion.p>
          </div>

          {/* Right column - Search and stats directly on image */}
          <div className="flex flex-col justify-center lg:flex-1 lg:max-w-md px-4 lg:px-0">
            {/* Enhanced search bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-8 lg:mt-0 group"
            >
              <div className="relative rounded-[1.5rem] border border-white/70 bg-white/20 p-4 shadow-[0_32px_80px_rgba(0,0,0,0.2)] backdrop-blur-2xl transition-all duration-300 hover:bg-white/30 hover:shadow-[0_40px_100px_rgba(0,0,0,0.3)]">
                <div className="absolute inset-0 rounded-[1.5rem] bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <SearchBar className="relative z-10 w-full" />
              </div>
            </motion.div>

            {/* Enhanced stats cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-6 lg:mt-8 grid grid-cols-3 gap-3"
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="group relative"
              >
                <Link
                  to="/regions"
                  className="block rounded-2xl border border-white/60 bg-gradient-to-br from-white/25 to-white/15 px-3 py-4 text-center text-white backdrop-blur-md transition-all duration-300 hover:from-white/35 hover:to-white/25 hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)]"
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-transparent to-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10 block font-display text-2xl font-black drop-shadow-xl">28</span>
                  <span className="relative z-10 mt-1 block text-[11px] font-bold text-white uppercase tracking-[0.05em]">области</span>
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="group relative"
              >
                <Link
                  to="/destinations"
                  className="block rounded-2xl border border-white/60 bg-gradient-to-br from-white/25 to-white/15 px-3 py-4 text-center text-white backdrop-blur-md transition-all duration-300 hover:from-white/35 hover:to-white/25 hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)]"
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-transparent to-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10 block font-display text-2xl font-black drop-shadow-xl">
                    {allDestinations.length}
                  </span>
                  <span className="relative z-10 mt-1 block text-[11px] font-bold text-white uppercase tracking-[0.05em]">места</span>
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="group relative"
              >
                <a
                  href="#mobile-regions"
                  className="block rounded-2xl border border-white/60 bg-gradient-to-br from-white/25 to-white/15 px-3 py-4 text-center text-white backdrop-blur-md transition-all duration-300 hover:from-white/35 hover:to-white/25 hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)]"
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-transparent to-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10 block font-display text-xl font-black drop-shadow-xl">области</span>
                  <span className="relative z-10 mt-1 block text-[11px] font-bold text-white uppercase tracking-[0.05em]">директория</span>
                </a>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      <section className="py-6">
        <div className="mx-auto max-w-md">
          <div className="flex items-end justify-between gap-4 px-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--forest)]">
                Категории
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-[var(--forest-deep)]">
                Избери преживяване
              </h2>
            </div>
                      </div>
          <div className="mt-4 grid grid-cols-2 gap-3 px-4">
            {visibleCategories.map((item, index) => (
              <Link
                key={item.category}
                to={`/destinations?category=${item.category}`}
                className={`relative min-h-32 overflow-hidden rounded-[1.25rem] bg-gradient-to-br ${categoryTone[item.category]} p-4 text-white shadow-[0_16px_38px_rgba(15,61,46,0.12)] transition-all duration-500 active:scale-[0.97] hover:scale-[1.02]`}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: showAllCategories && index >= 6 ? 'slideUp 0.5s ease-out forwards' : undefined
                }}
              >
                <span className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/20" />
                <div className="relative z-10">
                  <span className="inline-block text-[10px] font-semibold uppercase tracking-[0.1em] text-white/80 bg-white/10 px-2 py-1 rounded-full backdrop-blur-sm">
                    {item.count} места
                  </span>
                  <span className="relative mt-3 block font-display text-lg font-semibold leading-tight">
                    {item.label}
                  </span>
                  <span className="relative mt-2 inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1.5 text-[10px] font-semibold backdrop-blur">
                    <span className="w-1 h-1 bg-white rounded-full"></span>
                    разгледай
                  </span>
                </div>
              </Link>
            ))}
          </div>
          
          {/* More categories button */}
          {categoryCounts.length > 6 && (
            <div className="mt-4 px-4">
              <button
                onClick={() => setShowAllCategories(!showAllCategories)}
                className="group relative w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-xs font-bold text-[var(--ink-soft)] transition-all duration-300 hover:bg-gradient-to-r hover:from-[var(--mist)] hover:to-white hover:text-[var(--forest-deep)] hover:scale-[1.02] hover:shadow-[0_8px_20px_rgba(15,61,46,0.12)]"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {showAllCategories ? 'По-малко категории' : 'Още категории'}
                  <svg 
                    className={`w-4 h-4 transition-transform duration-300 ${showAllCategories ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
                
                {/* Hover glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[var(--forest)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </div>
          )}
        </div>
      </section>

      <section id="mobile-regions" className="py-6">
        <div className="mx-auto max-w-md px-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--forest)]">
                Области
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-[var(--forest-deep)]">
                Избери област
              </h2>
            </div>
            <Link to="/regions" className="text-sm font-semibold text-[var(--forest)]">
              всички
            </Link>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
            Подредени като удобни карти за докосване, без тежка карта на малък
            екран.
          </p>
        </div>

        <div className="mt-4 flex gap-4 overflow-x-auto px-4 pb-4 [scroll-snap-type:x_mandatory]">
          {featuredRegions.map((region, index) => (
            <Link
              key={region.id}
              to={`/region/${region.slug}`}
              className="group relative h-80 min-w-[85%] overflow-hidden rounded-[2rem] bg-gradient-to-br from-[var(--forest-deep)] to-[var(--forest)] shadow-[0_24px_60px_rgba(15,61,46,0.25)] transition-all duration-500 ease-out hover:scale-[1.02] hover:shadow-[0_32px_80px_rgba(15,61,46,0.35)] [scroll-snap-align:start]"
              style={{
                animationDelay: `${index * 150}ms`
              }}
            >
              {/* Enhanced image with overlay effects */}
              <SmartImage
                src={region.bannerImage}
                alt={region.name}
                loading="lazy"
                decoding="async"
                maxWidth={720}
                className="absolute inset-0 h-full w-full transition-transform duration-700 group-hover:scale-110"
                imgClassName="object-cover"
              />
              
              {/* Multi-layered gradient overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--forest-deep)]/95 via-[var(--forest-deep)]/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-br from-transparent/50 via-transparent to-[var(--forest)]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Shimmer effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-shimmer" />
              
              {/* Enhanced badge with animation */}
              <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-white/20 backdrop-blur-md px-4 py-2 text-xs font-bold text-white shadow-[0_8px_20px_rgba(0,0,0,0.2)] transition-all duration-300 group-hover:scale-110 group-hover:bg-white/30">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                  {region.destinations.length} места
                </span>
              </div>
              
              {/* Content with enhanced typography */}
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <div className="space-y-3">
                  <h3 className="font-display text-3xl font-bold leading-tight drop-shadow-lg transition-transform duration-300 group-hover:translate-x-1">
                    {region.name}
                  </h3>
                  <p className="line-clamp-2 text-sm leading-relaxed text-white/85 drop-shadow transition-all duration-300 group-hover:text-white/95">
                    {region.description}
                  </p>
                </div>
                
                {/* Enhanced button with hover effects */}
                <div className="mt-6 flex items-center gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/90 backdrop-blur-sm px-5 py-2.5 text-xs font-bold text-[var(--forest-deep)] shadow-[0_12px_24px_rgba(0,0,0,0.15)] transition-all duration-300 group-hover:bg-white group-hover:scale-105 group-hover:shadow-[0_16px_32px_rgba(0,0,0,0.2)]">
                    <span className="transition-transform duration-300 group-hover:translate-x-0.5">Отвори областта</span>
                    <svg className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
              
              {/* Decorative corner elements */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </Link>
          ))}
        </div>

              </section>

      <section className="px-4 py-6">
        <div className="mx-auto max-w-md">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--forest)]">
                Подбрано
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-[var(--forest-deep)]">
                Места за старт
              </h2>
            </div>
            <Link to="/destinations" className="text-sm font-semibold text-[var(--forest)]">
              още
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {featuredDestinations.map((destination) => (
              <Link
                key={destination.id}
                to={`/destination/${destination.id}`}
                className="grid grid-cols-[6rem_1fr] gap-3 rounded-[1.25rem] border border-[var(--border)] bg-white/88 p-2 shadow-[0_14px_32px_rgba(15,61,46,0.06)] transition active:scale-[0.99]"
              >
                <SmartImage
                  src={destination.image}
                  alt={destination.name}
                  loading="lazy"
                  decoding="async"
                  maxWidth={360}
                  className="aspect-square overflow-hidden rounded-[1rem]"
                  imgClassName="object-cover"
                />
                <div className="min-w-0 py-1 pr-1">
                  <p className="truncate text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--forest)]">
                    {CATEGORY_LABELS[destination.category]}
                  </p>
                  <h3 className="mt-1 line-clamp-2 font-display text-lg font-semibold leading-tight text-[var(--forest-deep)]">
                    {destination.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[var(--muted)]">
                    {destination.shortDescription}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
