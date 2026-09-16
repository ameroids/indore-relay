import { Link } from 'react-router-dom'
import './NotFoundPage.css'
import Brand from '../components/Brand'

export default function NotFoundPage() {
  return (
    <div className="not-found">
      <Brand size="md" />
      <h1>Page not found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <Link to="/login" className="not-found__link">
        Back to login
      </Link>
    </div>
  )
}
