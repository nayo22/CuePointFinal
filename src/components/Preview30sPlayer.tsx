import { useRef, useState } from 'react'

type Props = {
  trackTitle: string
  previewUrl?: string
}

export function Preview30sPlayer({ trackTitle, previewUrl }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)

  function toggle() {
    const el = audioRef.current
    if (!el) return
    if (playing) {
      el.pause()
      setPlaying(false)
    } else {
      void el.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
    }
  }

  if (previewUrl) {
    return (
      <div className="preview-30" aria-label={`Preview for ${trackTitle}`}>
        <audio
          ref={audioRef}
          src={previewUrl}
          preload="metadata"
          onEnded={() => setPlaying(false)}
        />
        <button type="button" className="preview-play btn btn-ghost" onClick={toggle}>
          {playing ? '❚❚' : '▶'}
        </button>
        <div className="preview-body">
          <div className="preview-wave" aria-hidden />
          <p className="mono preview-time">Vista previa (~30 s)</p>
        </div>
      </div>
    )
  }

  return (
    <div className="preview-30" aria-label={`Preview placeholder for ${trackTitle}`}>
      <button type="button" className="preview-play btn btn-ghost" disabled>
        ▶
      </button>
      <div className="preview-body">
        <div className="preview-wave" aria-hidden />
        <div className="preview-progress">
          <span className="preview-progress-fill" />
        </div>
        <span className="mono preview-time">Sin vista previa para este tema</span>
      </div>
    </div>
  )
}
