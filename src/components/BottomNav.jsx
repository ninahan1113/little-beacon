import { useStore } from '../store'

const tabs = [
  { id: 'kids', label: '闯关地图', icon: '🗺️' },
  { id: 'rewards', label: '树屋商店', icon: '🏡' },
]

const parentTabs = [
  { id: 'parents', label: '审批中心', icon: '📋' },
  { id: 'kids', label: '闯关地图', icon: '🗺️' },
  { id: 'rewards', label: '树屋商店', icon: '🏡' },
]

export default function BottomNav() {
  const currentView = useStore(s => s.currentView)
  const setView = useStore(s => s.setView)
  const parentUnlocked = useStore(s => s.parentUnlocked)
  const submissions = useStore(s => s.submissions)

  const pendingCount = submissions.filter(s => !s.approved).length
  const navTabs = parentUnlocked ? parentTabs : tabs

  if (currentView === 'parentLogin') return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-gray-100 safe-bottom">
      <div className="max-w-lg mx-auto flex">
        {navTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 pt-3 transition-colors relative ${
              currentView === tab.id
                ? 'text-purple-600'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <span className="text-xl">{tab.icon}</span>
            <span className="text-[11px] font-medium">{tab.label}</span>
            {tab.id === 'parents' && pendingCount > 0 && (
              <span className="absolute top-1.5 right-1/2 translate-x-5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>
    </nav>
  )
}
