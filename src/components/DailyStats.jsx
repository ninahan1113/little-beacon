import { useState, useMemo } from 'react'
import { useStore } from '../store'

const toDateStr = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

export default function DailyStats() {
  const submissions = useStore(s => s.submissions)
  const tasks = useStore(s => s.tasks)
  const redeemedRewards = useStore(s => s.redeemedRewards)
  const rewards = useStore(s => s.rewards)

  const today = new Date()
  const [selectedDate, setSelectedDate] = useState(toDateStr(today))

  // Build 7-day range centered on today
  const days = useMemo(() => {
    const result = []
    for (let i = -3; i <= 3; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() + i)
      result.push({ date: toDateStr(d), day: d.getDate(), weekday: WEEKDAYS[d.getDay()], isToday: i === 0 })
    }
    return result
  }, [])

  // Compute stats for selected date
  const stats = useMemo(() => {
    const approvedOnDate = submissions.filter(s =>
      s.approved && s.timestamp?.startsWith(selectedDate)
    )

    const gemsEarned = approvedOnDate.reduce((sum, s) => {
      const task = tasks.find(t => t.id === s.taskId)
      return sum + (task?.gems ?? 0)
    }, 0)

    const redeemedOnDate = redeemedRewards.filter(r => r.timestamp?.startsWith(selectedDate))
    const gemsSpent = redeemedOnDate.reduce((sum, r) => {
      const reward = rewards.find(rw => rw.id === r.rewardId)
      return sum + (reward?.cost ?? 0)
    }, 0)

    return {
      tasksCompleted: approvedOnDate.length,
      gemsEarned,
      gemsSpent,
      submissions: approvedOnDate,
      redeemed: redeemedOnDate,
    }
  }, [selectedDate, submissions, tasks, redeemedRewards, rewards])

  const isToday = selectedDate === toDateStr(today)

  const formatTime = (iso) => {
    const d = new Date(iso)
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  }

  // Count approved submissions per date for dot indicators
  const dateCounts = useMemo(() => {
    const counts = {}
    submissions.forEach(s => {
      if (s.approved && s.timestamp) {
        const date = s.timestamp.slice(0, 10)
        counts[date] = (counts[date] || 0) + 1
      }
    })
    return counts
  }, [submissions])

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-blue-600 flex items-center gap-1 mb-3">
        📅 每日记录
      </h3>

      {/* Date selector */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 -mx-1 px-1">
        {days.map(d => (
          <button
            key={d.date}
            onClick={() => setSelectedDate(d.date)}
            className={`flex flex-col items-center shrink-0 w-12 py-2 rounded-xl text-xs font-medium transition-all relative ${
              selectedDate === d.date
                ? 'bg-blue-500 text-white shadow-md shadow-blue-200'
                : d.isToday
                ? 'bg-blue-50 text-blue-600 border border-blue-200'
                : 'bg-white text-gray-500 border border-gray-100'
            }`}
          >
            <span className="text-[10px] opacity-80">{d.weekday}</span>
            <span className="text-base font-bold">{d.day}</span>
            {/* Activity dot */}
            {dateCounts[d.date] > 0 && (
              <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center ${
                selectedDate === d.date ? 'bg-white text-blue-500' : 'bg-green-500 text-white'
              }`}>
                {dateCounts[d.date]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-white rounded-xl p-3 text-center border border-green-100">
          <div className="text-lg font-bold text-green-600">{stats.tasksCompleted}</div>
          <div className="text-[10px] text-gray-400">完成任务</div>
        </div>
        <div className="bg-white rounded-xl p-3 text-center border border-purple-100">
          <div className="text-lg font-bold text-purple-600">+{stats.gemsEarned}</div>
          <div className="text-[10px] text-gray-400">获得宝石</div>
        </div>
        <div className="bg-white rounded-xl p-3 text-center border border-pink-100">
          <div className="text-lg font-bold text-pink-500">-{stats.gemsSpent}</div>
          <div className="text-[10px] text-gray-400">兑换花费</div>
        </div>
      </div>

      {/* Approved task list */}
      {stats.tasksCompleted > 0 ? (
        <div className="space-y-2">
          {stats.submissions.map(sub => {
            const task = tasks.find(t => t.id === sub.taskId)
            return (
              <div key={sub.id} className="bg-green-50 rounded-xl p-3 flex items-center gap-3">
                {/* Photo thumbnail or icon */}
                {sub.photoUrl ? (
                  <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                    <img src={sub.photoUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <span className="text-xl shrink-0">{task?.icon}</span>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-600 truncate">{task?.name}</div>
                  <div className="text-[10px] text-gray-400">{formatTime(sub.timestamp)}</div>
                </div>
                <span className="text-xs text-green-600 font-bold shrink-0">+{task?.gems}💎</span>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-300 text-xs">
          {isToday ? '今天还没有完成任务哦～' : '当天没有完成记录'}
        </div>
      )}

      {/* Redeemed rewards */}
      {stats.redeemed.length > 0 && (
        <div className="mt-3 space-y-1.5">
          <div className="text-xs text-pink-500 font-medium mb-1">🎁 兑换记录</div>
          {stats.redeemed.map((r, i) => {
            const reward = rewards.find(rw => rw.id === r.rewardId)
            return (
              <div key={i} className="bg-pink-50 rounded-lg px-3 py-2 flex items-center gap-2 text-xs">
                <span>{reward?.icon}</span>
                <span className="flex-1 text-gray-600">{reward?.name}</span>
                <span className="text-[10px] text-gray-400">{formatTime(r.timestamp)}</span>
                <span className="text-pink-500 font-medium">-{reward?.cost}💎</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
