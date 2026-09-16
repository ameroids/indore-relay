import './Brand.css'
import { APP_NAME } from '../config/appConfig'

export default function Brand({ size = 'md' }) {
  return (
    <div className={`brand brand--${size}`}>
      <svg className="brand__mark" viewBox="0 0 40 40" aria-hidden="true">
        <circle cx="20" cy="23" r="4.2" fill="currentColor" />
        <path
          d="M11 17.5a12.7 12.7 0 0 1 18 0"
          stroke="currentColor"
          strokeWidth="2.4"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M5.5 11.5a20.5 20.5 0 0 1 29 0"
          stroke="currentColor"
          strokeWidth="2.4"
          fill="none"
          strokeLinecap="round"
          opacity="0.45"
        />
      </svg>
      <span className="brand__name">{APP_NAME}</span>
    </div>
  )
}
