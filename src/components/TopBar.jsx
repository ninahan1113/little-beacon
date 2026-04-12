import { useStore } from '../store'

export default function TopBar() {
  const gems = useStore(s => s.gems)
  const setView = useStore(s => s.setView)
  const parentUnlocked = useStore(s => s.parentUnlocked)
  const streakDays = useStore(s => s.streakDays)
  const streakMilestone = useStore(s => s.streakMilestone)

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-mint/30 px-4 py-3 safe-top">
      <div className="max-w-lg mx-auto flex items-center justify-between">
        {/* App name + streak */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏮</span>
          <div className="leading-tight">
            <h1 className="text-base font-bold text-gray-800 m-0">小灯塔</h1>
            <p className="text-[10px] text-gray-400 m-0">小学大闯关</p>
          </div>
        </div>

        {/* Streak badge */}
        {streakDays > 0 && (
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-bold transition-all ${
            streakDays >= 14 ? 'bg-gradient-to-r from-red-100 to-orange-100 text-red-600 border border-red-200' :
            streakDays >= 7 ? 'bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-600 border border-orange-200' :
            streakDays >= 3 ? 'bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-600 border border-amber-200' :
            'bg-gray-50 text-gray-500 border border-gray-200'
          }`}>
            <span className={streakDays >= 3 ? 'animate-bounce-slow' : ''}>🔥</span>
            <span className="tabular-nums">{streakDays}</span>
          </div>
        )}

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

      {/* Streak milestone celebration banner */}
      {streakMilestone && (
        <div className="max-w-lg mx-auto mt-2 animate-pop-in">
          <div className="bg-gradient-to-r from-orange-400 to-red-400 text-white rounded-xl px-4 py-2.5 text-center shadow-lg shadow-orange-200">
            <div className="text-lg font-bold">
              🎉 连续打卡 {streakMilestone.days} 天！
            </div>
            <div className="text-xs opacity-90 mt-0.5">
              太厉害了！奖励 {streakMilestone.bonus} 颗额外宝石 💎
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
