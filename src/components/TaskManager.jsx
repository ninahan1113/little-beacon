import { useState } from 'react'
import { useStore } from '../store'

const ICON_OPTIONS = ['🪥', '🎒', '📖', '🤸', '✏️', '🎨', '🎹', '🧹', '🥗', '💤', '📝', '🏃', '🧮', '🌱', '👕', '🍎']

export default function TaskManager() {
  const tasks = useStore(s => s.tasks)
  const addTask = useStore(s => s.addTask)
  const updateTask = useStore(s => s.updateTask)
  const deleteTask = useStore(s => s.deleteTask)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ name: '', icon: '📝', description: '', gems: 10 })
  const [confirmDelete, setConfirmDelete] = useState(null)

  const resetForm = () => {
    setForm({ name: '', icon: '📝', description: '', gems: 10 })
    setShowForm(false)
    setEditingId(null)
  }

  const handleEdit = (task) => {
    setForm({ name: task.name, icon: task.icon, description: task.description, gems: task.gems })
    setEditingId(task.id)
    setShowForm(true)
  }

  const handleSave = () => {
    if (!form.name.trim()) return
    if (editingId) {
      updateTask(editingId, form)
    } else {
      addTask(form)
    }
    resetForm()
  }

  const handleDelete = (taskId) => {
    deleteTask(taskId)
    setConfirmDelete(null)
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-purple-600 flex items-center gap-1">
          ⚙️ 任务管理
        </h3>
        {!showForm && (
          <button
            onClick={() => { resetForm(); setShowForm(true) }}
            className="text-xs bg-purple-500 text-white px-3 py-1.5 rounded-full font-medium hover:bg-purple-600 transition-colors active:scale-95"
          >
            + 添加任务
          </button>
        )}
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-purple-100 mb-4 animate-slide-up">
          <h4 className="text-sm font-bold text-gray-700 mb-3">
            {editingId ? '编辑任务' : '新建任务'}
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
                      ? 'bg-purple-100 border-2 border-purple-400 scale-110'
                      : 'bg-gray-50 border border-gray-200 hover:border-purple-200'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div className="mb-3">
            <label className="text-xs text-gray-500 mb-1 block">任务名称</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="例如：练习写字"
              maxLength={10}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100 transition-all"
            />
          </div>

          {/* Description */}
          <div className="mb-3">
            <label className="text-xs text-gray-500 mb-1 block">任务描述</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="简单描述一下任务内容～"
              maxLength={50}
              rows={2}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100 transition-all resize-none"
            />
          </div>

          {/* Gems */}
          <div className="mb-4">
            <label className="text-xs text-gray-500 mb-1 block">奖励宝石 💎</label>
            <div className="flex items-center gap-2">
              {[5, 10, 15, 20, 30].map(g => (
                <button
                  key={g}
                  onClick={() => setForm(f => ({ ...f, gems: g }))}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    form.gems === g
                      ? 'bg-purple-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-purple-50'
                  }`}
                >
                  {g}
                </button>
              ))}
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
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md hover:opacity-90 active:scale-98'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {editingId ? '保存修改' : '添加任务'}
            </button>
          </div>
        </div>
      )}

      {/* Task list */}
      <div className="space-y-2">
        {tasks.map(task => (
          <div
            key={task.id}
            className="bg-white rounded-xl p-3 flex items-center gap-3 shadow-sm border border-gray-100"
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0"
              style={{ backgroundColor: task.color + '40' }}
            >
              {task.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-700 truncate">{task.name}</div>
              <div className="text-xs text-purple-500">+{task.gems} 💎</div>
            </div>
            <div className="flex gap-1.5 shrink-0">
              <button
                onClick={() => handleEdit(task)}
                className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-sm hover:bg-purple-50 transition-colors"
                title="编辑"
              >
                ✏️
              </button>
              {confirmDelete === task.id ? (
                <button
                  onClick={() => handleDelete(task.id)}
                  className="px-2 h-8 rounded-lg bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition-colors"
                >
                  确认
                </button>
              ) : (
                <button
                  onClick={() => setConfirmDelete(task.id)}
                  className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-sm hover:bg-red-50 transition-colors"
                  title="删除"
                >
                  🗑️
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-8 text-gray-400 text-sm">
          还没有任务，点击上方"添加任务"创建吧！
        </div>
      )}
    </div>
  )
}
