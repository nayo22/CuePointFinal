type Props = {
  variant?: 'hero' | 'header'
  className?: string
}

export function CuePointLogo({ variant = 'hero', className = '' }: Props) {
  const cls =
    variant === 'header'
      ? `cuepoint-logo cuepoint-logo--header ${className}`.trim()
      : `cuepoint-logo cuepoint-logo--hero ${className}`.trim()
  return (
    <img
      src="/cuepoint-logo.png"
      alt="CuePoint"
      className={cls}
      decoding="async"
    />
  )
}
