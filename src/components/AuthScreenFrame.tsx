import type { ReactNode } from 'react'
import { CuePointLogo } from './CuePointLogo'

export function AuthScreenFrame({ children }: { children: ReactNode }) {
  return (
    <div className="login-page">
      <div className="login-logo-above">
        <CuePointLogo variant="hero" />
      </div>
      <div className="login-card-wrap">
        <div className="login-card">{children}</div>
      </div>
    </div>
  )
}
