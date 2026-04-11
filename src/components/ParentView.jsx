import { useState } from 'react'
import { useStore } from '../store'
import { playCelebration } from '../sounds'
import DailyStats from './DailyStats'
import TaskManager from './TaskManager'
import RewardManager from './RewardManager'

export default function ParentView() {
  const tasks = useStore(s => s.tasks)
  const submissions = useStore(s => s.submissions)
  const approveSubmission = useStore(s => s.approveSubmission)
  const rejectSubmission = useStore(s => s.rejectSubmission)
  const gems = useStore(s => s.gems)
  const parentPin = useStore(s => s.parentPin)
  const setParentPin = useStore(s => s.setParentPin)

  const [showPinChange, setShowPinChange] = useState(false)
  const [newPin, setNewPin] = useState('')
  const [pinSaved, setPinSaved] = useState(false)

  const pending = submissions.filter(s => !s.approved && !s.rejected)

  const getTask = (taskId) => tasks.find(t => t.id === taskId)

  const formatTime = (iso) => {
    const d = new Date(iso)
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  }

  const handlePinSave = () => {
    if (newPin.length === 4) {
      setParentPin(newPin)
      setNewPin('')
      setPinSaved(true)
      setTimeout(() => setPinSaved(false), 2000)
    }
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

                      <div className="flex gap-2">
                        <button
                          onClick={() => rejectSubmission(sub.id)}
                          className="flex-1 bg-gray-100 text-gray-600 font-bold py-3 rounded-xl text-sm hover:bg-red-50 hover:text-red-500 transition-colors active:scale-98"
                        >
                          ✋ 退回重做
                        </button>
                        <button
                          onClick={() => { approveSubmission(sub.id); playCelebration() }}
                          className="flex-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold py-3 rounded-xl text-sm hover:opacity-90 transition-opacity active:scale-98 shadow-md shadow-green-200"
                        >
                          👍 批准 (+{task?.gems}💎)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Daily stats (includes approved history) */}
        <DailyStats />

        {/* Task management */}
        <TaskManager />

        {/* Reward management */}
        <RewardManager />

        {/* Password settings */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-500 flex items-center gap-1">
              🔒 密码设置
            </h3>
            {!showPinChange && (
              <button
                onClick={() => setShowPinChange(true)}
                className="text-xs bg-gray-200 text-gray-600 px-3 py-1.5 rounded-full font-medium hover:bg-gray-300 transition-colors"
              >
                修改密码
              </button>
            )}
          </div>

          {showPinChange && (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-slide-up">
              <p className="text-xs text-gray-500 mb-2">当前密码：{parentPin}</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  value={newPin}
                  onChange={e => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="输入4位新密码"
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm text-center tracking-widest focus:outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100"
                />
                <button
                  onClick={handlePinSave}
                  disabled={newPin.length !== 4}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    newPin.length === 4
                      ? 'bg-purple-500 text-white hover:bg-purple-600'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  保存
                </button>
                <button
                  onClick={() => { setShowPinChange(false); setNewPin('') }}
                  className="px-3 py-2 rounded-xl text-sm text-gray-500 bg-gray-100 hover:bg-gray-200"
                >
                  取消
                </button>
              </div>
              {pinSaved && (
                <p className="text-green-500 text-xs mt-2 animate-pop-in">✅ 密码已更新！</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
