import { useState } from 'react'
import { useStore } from '../store'

const ICON_OPTIONS = ['📺', '🧺', '⭐', '🌙', '🎮', '🍦', '🎪', '🏊', '🛝', '🎁', '🧸', '🎂', '🍕', '🎡', '🚗', '🌈']

export default function RewardManager() {
  const rewards = useStore(s => s.rewards)
  const addReward = useStore(s => s.addReward)
  const updateReward = useStore(s => s.updateReward)
  const deleteReward = useStore(s => s.deleteReward)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ name: '', icon: '🎁', cost: 20 })
  const [confirmDelete, setConfirmDelete] = useState(null)

  const resetForm = () => {
    setForm({ name: '', icon: '🎁', cost: 20 })
    setShowForm(false)
    setEditingId(null)
  }

  const handleEdit = (reward) => {
    setForm({ name: reward.name, icon: reward.icon, cost: reward.cost })
    setEditingId(reward.id)
    setShowForm(true)
  }

  const handleSave = () => {
    if (!form.name.trim()) return
    if (editingId) {
      updateReward(editingId, form)
    } else {
      addReward(form)
    }
    resetForm()
  }

  const handleDelete = (rewardId) => {
    deleteReward(rewardId)
    setConfirmDelete(null)
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-pink-600 flex items-center gap-1">
          🏡 奖励管理
        </h3>
        {!showForm && (
          <button
            onClick={() => { resetForm(); setShowForm(true) }}
            className="text-xs bg-pink-500 text-white px-3 py-1.5 rounded-full font-medium hover:bg-pink-600 transition-colors active:scale-95"
          >
            + 添加奖励
          </button>
        )}
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-pink-100 mb-4 animate-slide-up">
          <h4 className="text-sm font-bold text-gray-700 mb-3">
            {editingId ? '编辑奖励' : '新建奖励'}
          </h4>

          {/* Icon picker */}
          <div className="mb-3">
            <label className="text-xs text-gray-500 mb-1.5 block">选择图标</label>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map(icon => (
                <button
                  key={icon}
                  onClick={() => setForm(f => ({ ...f, icon }))}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all ${
                    form.icon === icon
                      ? 'bg-pink-100 border-2 border-pink-400 scale-110'
                      : 'bg-gray-50 border border-gray-200 hover:border-pink-200'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div className="mb-3">
            <label className="text-xs text-gray-500 mb-1 block">奖励名称</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="例如：去游乐场"
              maxLength={12}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all"
            />
          </div>

          {/* Cost */}
          <div className="mb-4">
            <label className="text-xs text-gray-500 mb-1 block">兑换花费 💎</label>
            <div className="flex items-center gap-2 flex-wrap">
              {[10, 20, 50, 100, 200].map(c => (
                <button
                  key={c}
                  onClick={() => setForm(f => ({ ...f, cost: c }))}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    form.cost === c
                      ? 'bg-pink-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-pink-50'
                  }`}
                >
                  {c}
                </button>
              ))}
              <input
                type="number"
                value={form.cost}
                onChange={e => setForm(f => ({ ...f, cost: Number(e.target.value) || 0 }))}
                className="w-16 px-2 py-1.5 rounded-lg border border-gray-200 text-sm text-center focus:outline-none focus:border-pink-300"
                min={1}
                max={9999}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={resetForm}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={!form.name.trim()}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                form.name.trim()
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md hover:opacity-90 active:scale-98'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {editingId ? '保存修改' : '添加奖励'}
            </button>
          </div>
        </div>
      )}

      {/* Reward list */}
      <div className="space-y-2">
        {rewards.map(reward => (
          <div
            key={reward.id}
            className="bg-white rounded-xl p-3 flex items-center gap-3 shadow-sm border border-gray-100"
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0"
              style={{ backgroundColor: reward.color + '40' }}
            >
              {reward.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-700 truncate">{reward.name}</div>
              <div className="text-xs text-pink-500">{reward.cost} 💎</div>
            </div>
            <div className="flex gap-1.5 shrink-0">
              <button
                onClick={() => handleEdit(reward)}
                className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-sm hover:bg-pink-50 transition-colors"
              >
                ✏️
              </button>
              {confirmDelete === reward.id ? (
                <button
                  onClick={() => handleDelete(reward.id)}
                  className="px-2 h-8 rounded-lg bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition-colors"
                >
                  确认
                </button>
              ) : (
                <button
                  onClick={() => setConfirmDelete(reward.id)}
                  className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-sm hover:bg-red-50 transition-colors"
                >
                  🗑️
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {rewards.length === 0 && (
        <div className="text-center py-8 text-gray-400 text-sm">
          还没有奖励，点击上方"添加奖励"创建吧！
        </div>
      )}
    </div>
  )
}
