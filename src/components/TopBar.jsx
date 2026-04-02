import { useStore } from '../store'

export default function TopBar() {
  const gems = useStore(s => s.gems)
  const currentView = useStore(s => s.currentView)
  const setView = useStore(s => s.setView)
  const parentUnlocked = useStore(s => s.parentUnlocked)

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-mint/30 px-4 py-3 safe-top">
      <div className="max-w-lg mx-auto flex items-center justify-between">
        {/* App name */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏮</span>
          <div className="leading-tight">
            <h1 className="text-base font-bold text-gray-800 m-0">小灯塔</h1>
            <p className="text-[10px] text-gray-400 m-0">小学大闯关</p>
          </div>
        </div>

        {/* Gem counter */}
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-purple-50 to-pink-50 px-3 py-1.5 rounded-full border border-purple-100">
          <span className="text-lg animate-gem-pulse">💎</span>
          <span className="font-bold text-purple-600 text-lg tabular-nums">{gems}</span>
        </div>

        {/* Parent mode toggle */}
        {!parentUnlocked && (
          <button
            onClick={() => setView('parentLogin')}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm text-gray-400 hover:bg-gray-200 transition-colors"
            title="家长入口"
          >
            🔒
          </button>
        )}
        {parentUnlocked && (
          <button
            onClick={() => useStore.getState().lockParent()}
            className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-sm hover:bg-pink-200 transition-colors"
            title="退出家长模式"
          >
            👋
          </button>
        )}
      </div>
    </header>
  )
}
