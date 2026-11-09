import { Loader2 } from 'lucide-react'

export default function LoadingSpinner({
  message = 'Loading...',
  size = 'md', // 'sm' | 'md' | 'lg'
  fullPage = false,
}) {
  const pixelSizes = {
    sm: 18,
    md: 28,
    lg: 40,
  }

  const content = (
    <div className={`loading-spinner-container ${size}`}>
      <Loader2 className="animate-spin text-primary" size={pixelSizes[size] || 28} />
      {message && <p className="loading-spinner-msg">{message}</p>}
    </div>
  )

  if (fullPage) {
    return <div className="loading-spinner-fullpage">{content}</div>
  }

  return content
}

