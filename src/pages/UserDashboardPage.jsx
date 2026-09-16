import './UserDashboardPage.css'
import VideoPlayer from '../components/VideoPlayer'
import { useUserAuth } from '../hooks/useUserAuth'

export default function UserDashboardPage() {
  const { session } = useUserAuth()

  return (
    <div className="dashboard">
      <section className="dashboard__welcome">
        <p className="dashboard__greeting">Welcome back</p>
        <h1>ITS {session?.its}</h1>
        <p className="dashboard__sub">Your access is active. The session below is available only to authorized members.</p>
      </section>

      <VideoPlayer />
    </div>
  )
}
