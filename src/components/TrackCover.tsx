import { coverUrl } from '../lib/coverUrl'

type Props = {
  seed: string
  title: string
  size?: number
}

export function TrackCover({ seed, title, size = 56 }: Props) {
  return (
    <img
      className="track-cover"
      src={coverUrl(seed, size)}
      alt={`Album art for ${title}`}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
    />
  )
}
