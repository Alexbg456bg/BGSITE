type BrandMarkProps = {
  className?: string
}

export function BrandMark({ className = '' }: BrandMarkProps) {
  return (
    <span
      className={`relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-[1.1rem] bg-[linear-gradient(145deg,#1d5a45_0%,#123f31_48%,#245a72_100%)] shadow-[0_12px_24px_rgba(15,61,46,0.24)] ring-1 ring-white/24 ${className}`}
      aria-hidden
    >
      <span className="absolute inset-x-1.5 top-1.5 h-3.5 rounded-full bg-white/12 blur-[3px]" />
      <span className="absolute -right-2 -top-2 h-7 w-7 rounded-full bg-[var(--sand)]/28 blur-[1px]" />
      <svg
        viewBox="0 0 64 64"
        className="relative h-[1.9rem] w-[1.9rem]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M47.8 17.2a6.2 6.2 0 1 1-7.6-6 5.4 5.4 0 1 0 7.6 6Z"
          fill="#F3D48B"
        />
        <path
          d="M11.5 44.5C18.5 37 23.5 29 28.5 21.5C31.2 27 34.3 31.6 38.3 36.3C40.8 39.3 43 41.9 46 44.5"
          stroke="#F8FBF7"
          strokeWidth="4.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M21 44C24.6 39.7 27.7 35.6 31 31.3C33.3 34.4 35.8 37.5 39.2 41.3"
          stroke="#DCEEE3"
          strokeWidth="3.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.92"
        />
        <path
          d="M30.8 23.5C28.6 28.9 28.2 35 30 40.8C31 44.1 32.7 47 35.7 50.5"
          stroke="#8ED0C7"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M16.5 49.5C21.7 46.4 27 44.8 32 44.8C36.9 44.8 42.2 46.4 47.4 49.5"
          stroke="#F8FBF7"
          strokeWidth="3.3"
          strokeLinecap="round"
          opacity="0.88"
        />
      </svg>
    </span>
  )
}
