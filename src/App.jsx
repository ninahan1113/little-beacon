import Confetti from 'react-confetti'
import { useStore } from './store'
import TopBar from './components/TopBar'
import BottomNav from './components/BottomNav'
import TaskMap from './components/TaskMap'
import TaskModal from './components/TaskModal'
import ParentLogin from './components/ParentLogin'
import ParentView from './components/ParentView'
import RewardsStore from './components/RewardsStore'

function App() {
  const currentView = useStore(s => s.currentView)
  const showConfetti = useStore(s => s.showConfetti)

  return (
    <div className="min-h-dvh relative">
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={300}
          colors={['#a78bfa', '#f9a8d4', '#a8e6cf', '#ffd3b6', '#a8d8ea', '#fbbf24']}
        />
      )}

      <TopBar />

      <main>
        {currentView === 'kids' && <TaskMap />}
        {currentView === 'parentLogin' && <ParentLogin />}
        {currentView === 'parents' && <ParentView />}
        {currentView === 'rewards' && <RewardsStore />}
      </main>

      <TaskModal />
      <BottomNav />
    </div>
  )
}

export default App
