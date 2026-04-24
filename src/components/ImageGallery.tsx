import { useState } from 'react'
import { motion } from 'framer-motion'
import { SmartImage } from './SmartImage'

interface ImageGalleryProps {
  images: string[]
  alt: string
  className?: string
}

export function ImageGallery({ images, alt, className = '' }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  if (images.length === 0) return null

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main image */}
      <motion.div
        key={selectedIndex}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--mist)] shadow-lg"
      >
        <SmartImage
          src={images[selectedIndex]}
          alt={alt}
          fetchPriority="high"
          decoding="async"
          maxWidth={1200}
          className="aspect-[4/3] w-full lg:aspect-auto lg:min-h-[420px]"
          imgClassName="object-cover"
        />
      </motion.div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                selectedIndex === index
                  ? 'border-[var(--forest)] shadow-md'
                  : 'border-[var(--border)] hover:border-[var(--forest)]/50'
              }`}
            >
              <SmartImage
                src={img}
                alt={`${alt} - ${index + 1}`}
                maxWidth={180}
                className="h-16 w-16"
                imgClassName="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
