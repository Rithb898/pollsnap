type BrandLogoProps = {
  className?: string
  imageClassName?: string
  textClassName?: string
  showText?: boolean
}

export function BrandLogo({
  className = "",
  imageClassName = "h-10 w-auto",
  textClassName = "",
  showText = true,
}: BrandLogoProps) {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`.trim()}>
      <img
        src="/logo.png"
        alt="PollSnap"
        className={`block object-contain ${imageClassName}`.trim()}
      />
      {showText && <span className={textClassName}>PollSnap</span>}
    </div>
  )
}
