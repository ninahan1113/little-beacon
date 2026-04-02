import { useStore } from '../store'
import DailyStats from './DailyStats'
import TaskManager from './TaskManager'
import RewardManager from './RewardManager'

export default function ParentView() {
  const tasks = useStore(s => s.tasks)
  const submissions = useStore(s => s.submissions)
  const approveSubmission = useStore(s => s.approveSubmission)
  const gems = useStore(s => s.gems)

  const pending = submissions.filter(s => !s.approved)
  const approved = submissions.filter(s => s.approved)

  const getTask = (taskId) => tasks.find(t => t.id === taskId)

  const formatTime = (iso) => {
    const d = new Date(iso)
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  }

  return (
    <div className="px-4 pb-28 pt-6">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-700 mb-1">📋 审批中心</h2>
          <p className="text-sm text-gray-400">宝贝当前拥有 <span className="text-purple-600 font-bold">{gems}</span> 💎</p>
        </div>

        {/* Pending submissions */}
        {pending.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">😴</div>
            <p className="text-gray-400">暂无待审批的任务</p>
            <p className="text-sm text-gray-300 mt-1">等宝贝完成闯关后这里会有通知哦～</p>
          </div>
        ) : (
          <div className="space-y-4 mb-8">
            <h3 className="text-sm font-semibold text-orange-500 flex items-center gap-1">
              ⏳ 待审批 ({pending.length})
            </h3>
            {pending.map(sub => {
              const task = getTask(sub.taskId)
              return (
                <div
                  key={sub.id}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-orange-100 animate-slide-up"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{task?.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-gray-700">{task?.name}</h4>
                        <span className="text-xs text-gray-400">{formatTime(sub.timestamp)}</span>
                      </div>
                      <p className="text-xs text-purple-500 mb-3">奖励 +{task?.gems} 💎</p>

                      {/* Photo */}
                      {sub.photoUrl && (
                        <div className="rounded-xl overflow-hidden mb-3">
                          <img src={sub.photoUrl} alt="打卡照片" className="w-full h-40 object-cover" />
                        </div>
                      )}

                      <button
                        onClick={() => approveSubmission(sub.id)}
                        className="w-full bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold py-3 rounded-xl text-sm hover:opacity-90 transition-opacity active:scale-98 shadow-md shadow-green-200"
                      >
                        👍 点赞批准 (+{task?.gems}💎)
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Approved history */}
        {approved.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-green-500 flex items-center gap-1 mb-3">
              ✅ 已批准 ({approved.length})
            </h3>
            <div className="space-y-2">
              {approved.slice().reverse().map(sub => {
                const task = getTask(sub.taskId)
                return (
                  <div key={sub.id} className="bg-green-50 rounded-xl p-3 flex items-center gap-3">
                    <span className="text-xl">{task?.icon}</span>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-600">{task?.name}</span>
                    </div>
                    <span className="text-xs text-green-600 font-medium">+{task?.gems}💎</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
        {/* Daily stats */}
        <DailyStats />

        {/* Task management */}
        <TaskManager />

        {/* Reward management */}
        <RewardManager />
      </div>
    </div>
  )
}
