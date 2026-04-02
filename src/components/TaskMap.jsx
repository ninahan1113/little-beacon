import { useStore } from '../store'

export default function TaskMap() {
  const tasks = useStore(s => s.tasks)
  const selectTask = useStore(s => s.selectTask)
  const completedToday = useStore(s => s.completedToday)
  const submissions = useStore(s => s.submissions)

  const getTaskStatus = (taskId) => {
    if (completedToday.includes(taskId)) return 'completed'
    if (submissions.some(s => s.taskId === taskId && !s.approved)) return 'pending'
    return 'available'
  }

  return (
    <div className="px-4 pb-28 pt-6 overflow-hidden">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-gray-700 mb-1">今日闯关</h2>
          <p className="text-sm text-gray-400">完成任务收集能量宝石吧！</p>
        </div>

        {/* Scrollable task path */}
        <div className="overflow-x-auto scrollbar-hide pb-4">
          <div className="task-path flex items-center gap-6 px-8 min-w-max py-8">
            {tasks.map((task, i) => {
              const status = getTaskStatus(task.id)
              return (
                <button
                  key={task.id}
                  onClick={() => status !== 'completed' && selectTask(task)}
                  className="relative z-10 flex flex-col items-center gap-3 group"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {/* Level number badge */}
                  <div className="absolute -top-3 -right-1 w-6 h-6 rounded-full bg-purple-500 text-white text-xs font-bold flex items-center justify-center shadow-md z-10">
                    {i + 1}
                  </div>

                  {/* Icon circle */}
                  <div
                    className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl shadow-lg transition-all duration-300 ${
                      status === 'completed'
                        ? 'bg-green-100 border-2 border-green-300 scale-95 opacity-80'
                        : status === 'pending'
                        ? 'bg-yellow-50 border-2 border-yellow-300 animate-float'
                        : 'bg-white border-2 border-transparent hover:border-purple-200 hover:shadow-xl hover:scale-105 active:scale-95'
                    }`}
                    style={{
                      backgroundColor: status === 'available' ? task.color + '30' : undefined,
                    }}
                  >
                    {status === 'completed' ? '✅' : task.icon}
                  </div>

                  {/* Task name */}
                  <span className={`text-sm font-medium whitespace-nowrap ${
                    status === 'completed' ? 'text-green-500 line-through' :
                    status === 'pending' ? 'text-yellow-600' : 'text-gray-600'
                  }`}>
                    {task.name}
                  </span>

                  {/* Status label */}
                  {status === 'pending' && (
                    <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
                      等待审批
                    </span>
                  )}
                  {status === 'completed' && (
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                      +{task.gems} 💎
                    </span>
                  )}
                </button>
              )
            })}

            {/* End flag */}
            <div className="relative z-10 flex flex-col items-center gap-3">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-100 to-orange-100 flex items-center justify-center text-3xl shadow-lg border-2 border-yellow-200">
                🏆
              </div>
              <span className="text-sm font-medium text-yellow-600 whitespace-nowrap">全部完成!</span>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="mt-8 grid grid-cols-3 gap-3">
          {[
            { emoji: '🌈', text: '坚持就是胜利' },
            { emoji: '🌟', text: '你是最棒的' },
            { emoji: '🎯', text: '加油加油' },
          ].map((item, i) => (
            <div key={i} className="bg-white/60 rounded-2xl p-4 text-center">
              <div className="text-2xl mb-1">{item.emoji}</div>
              <div className="text-xs text-gray-400">{item.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
