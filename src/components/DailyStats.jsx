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
    const approvedOnDate = submissions.filter(s => {
      if (!s.approved) return false
      return s.timestamp.startsWith(selectedDate)
    })

    const gemsEarned = approvedOnDate.reduce((sum, s) => {
      const task = tasks.find(t => t.id === s.taskId)
      return sum + (task?.gems ?? 0)
    }, 0)

    const redeemedOnDate = redeemedRewards.filter(r => r.timestamp.startsWith(selectedDate))
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

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-blue-600 flex items-center gap-1 mb-3">
        📅 每日统计
      </h3>

      {/* Date selector - horizontal scroll */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 -mx-1 px-1">
        {days.map(d => (
          <button
            key={d.date}
            onClick={() => setSelectedDate(d.date)}
            className={`flex flex-col items-center shrink-0 w-12 py-2 rounded-xl text-xs font-medium transition-all ${
              selectedDate === d.date
                ? 'bg-blue-500 text-white shadow-md shadow-blue-200'
                : d.isToday
                ? 'bg-blue-50 text-blue-600 border border-blue-200'
                : 'bg-white text-gray-500 border border-gray-100'
            }`}
          >
            <span className="text-[10px] opacity-80">{d.weekday}</span>
            <span className="text-base font-bold">{d.day}</span>
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

      {/* Detail list */}
      {stats.tasksCompleted > 0 ? (
        <div className="space-y-1.5">
          {stats.submissions.map(sub => {
            const task = tasks.find(t => t.id === sub.taskId)
            const time = new Date(sub.timestamp)
            const timeStr = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`
            return (
              <div key={sub.id} className="bg-white rounded-lg px-3 py-2 flex items-center gap-2 text-xs border border-gray-50">
                <span>{task?.icon}</span>
                <span className="flex-1 text-gray-600">{task?.name}</span>
                <span className="text-gray-400">{timeStr}</span>
                <span className="text-green-500 font-medium">+{task?.gems}💎</span>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-300 text-xs">
          {isToday ? '今天还没有完成任务哦～' : '当天没有完成记录'}
        </div>
      )}
    </div>
  )
}
