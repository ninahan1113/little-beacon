import { create } from 'zustand'

const TASKS = [
  {
    id: 1,
    name: '刷牙洗脸',
    icon: '🪥',
    description: '早起第一件事，把小脸洗得干干净净，牙齿刷得亮晶晶！',
    gems: 10,
    color: '#a8e6cf',
  },
  {
    id: 2,
    name: '整理书包',
    icon: '🎒',
    description: '检查课本、文具都带齐了吗？整整齐齐放进书包里！',
    gems: 10,
    color: '#a8d8ea',
  },
  {
    id: 3,
    name: '认读汉字',
    icon: '📖',
    description: '今天来认识5个新的汉字朋友吧！大声读出来哦～',
    gems: 15,
    color: '#ffd3b6',
  },
  {
    id: 4,
    name: '跳绳500下',
    icon: '🤸',
    description: '跳起来！500下跳绳让身体变得棒棒的！可以分几次完成哦～',
    gems: 20,
    color: '#ffaaa5',
  },
]

const REWARDS = [
  { id: 1, name: '看动画片15分钟', icon: '📺', cost: 20, color: '#a8d8ea' },
  { id: 2, name: '公园野餐', icon: '🧺', cost: 200, color: '#a8e6cf' },
  { id: 3, name: '选一个小贴纸', icon: '⭐', cost: 10, color: '#ffd3b6' },
  { id: 4, name: '睡前多听一个故事', icon: '🌙', cost: 15, color: '#c4b5fd' },
]

const loadState = () => {
  try {
    const saved = localStorage.getItem('little-beacon-state')
    if (saved) return JSON.parse(saved)
  } catch {}
  return null
}

const TASK_COLORS = ['#a8e6cf', '#a8d8ea', '#ffd3b6', '#ffaaa5', '#c4b5fd', '#fbbf24', '#f9a8d4', '#86efac']

const REWARD_COLORS = ['#a8d8ea', '#a8e6cf', '#ffd3b6', '#c4b5fd', '#ffaaa5', '#fbbf24', '#f9a8d4', '#86efac']

const saveState = (state) => {
  try {
    localStorage.setItem('little-beacon-state', JSON.stringify({
      tasks: state.tasks,
      rewards: state.rewards,
      gems: state.gems,
      submissions: state.submissions,
      completedToday: state.completedToday,
      redeemedRewards: state.redeemedRewards,
    }))
  } catch {}
}

const saved = loadState()

export const useStore = create((set, get) => ({
  // Data
  tasks: saved?.tasks ?? TASKS,
  rewards: saved?.rewards ?? REWARDS,
  gems: saved?.gems ?? 0,
  submissions: saved?.submissions ?? [],
  completedToday: saved?.completedToday ?? [],
  redeemedRewards: saved?.redeemedRewards ?? [],

  // UI state
  currentView: 'kids', // 'kids' | 'parents' | 'rewards'
  selectedTask: null,
  showConfetti: false,
  parentUnlocked: false,

  // Actions
  setView: (view) => set({ currentView: view }),
  selectTask: (task) => set({ selectedTask: task }),
  closeTask: () => set({ selectedTask: null }),

  submitTask: (taskId, photoUrl) => {
    set((state) => {
      const newState = {
        submissions: [...state.submissions, {
          id: Date.now(),
          taskId,
          photoUrl,
          timestamp: new Date().toISOString(),
          approved: false,
        }],
      }
      setTimeout(() => saveState(get()), 0)
      return newState
    })
  },

  approveSubmission: (submissionId) => {
    set((state) => {
      const sub = state.submissions.find(s => s.id === submissionId)
      if (!sub || sub.approved) return state
      const task = state.tasks.find(t => t.id === sub.taskId)
      const newState = {
        submissions: state.submissions.map(s =>
          s.id === submissionId ? { ...s, approved: true } : s
        ),
        gems: state.gems + (task?.gems ?? 0),
        completedToday: [...state.completedToday, sub.taskId],
        showConfetti: true,
      }
      setTimeout(() => saveState(get()), 0)
      return newState
    })
    setTimeout(() => set({ showConfetti: false }), 4000)
  },

  redeemReward: (rewardId) => {
    set((state) => {
      const reward = state.rewards.find(r => r.id === rewardId)
      if (!reward || state.gems < reward.cost) return state
      const newState = {
        gems: state.gems - reward.cost,
        redeemedRewards: [...state.redeemedRewards, {
          rewardId,
          timestamp: new Date().toISOString(),
        }],
      }
      setTimeout(() => saveState(get()), 0)
      return newState
    })
  },

  addReward: ({ name, icon, cost }) => {
    set((state) => {
      const newReward = {
        id: Date.now(),
        name,
        icon,
        cost: Number(cost) || 10,
        color: REWARD_COLORS[state.rewards.length % REWARD_COLORS.length],
      }
      const newState = { rewards: [...state.rewards, newReward] }
      setTimeout(() => saveState(get()), 0)
      return newState
    })
  },

  updateReward: (rewardId, updates) => {
    set((state) => {
      const newState = {
        rewards: state.rewards.map(r =>
          r.id === rewardId ? { ...r, ...updates, cost: Number(updates.cost) || r.cost } : r
        ),
      }
      setTimeout(() => saveState(get()), 0)
      return newState
    })
  },

  deleteReward: (rewardId) => {
    set((state) => {
      const newState = { rewards: state.rewards.filter(r => r.id !== rewardId) }
      setTimeout(() => saveState(get()), 0)
      return newState
    })
  },

  addTask: ({ name, icon, description, gems }) => {
    set((state) => {
      const newTask = {
        id: Date.now(),
        name,
        icon,
        description,
        gems: Number(gems) || 10,
        color: TASK_COLORS[state.tasks.length % TASK_COLORS.length],
      }
      const newState = { tasks: [...state.tasks, newTask] }
      setTimeout(() => saveState(get()), 0)
      return newState
    })
  },

  updateTask: (taskId, updates) => {
    set((state) => {
      const newState = {
        tasks: state.tasks.map(t =>
          t.id === taskId ? { ...t, ...updates, gems: Number(updates.gems) || t.gems } : t
        ),
      }
      setTimeout(() => saveState(get()), 0)
      return newState
    })
  },

  deleteTask: (taskId) => {
    set((state) => {
      const newState = {
        tasks: state.tasks.filter(t => t.id !== taskId),
        submissions: state.submissions.filter(s => s.taskId !== taskId),
        completedToday: state.completedToday.filter(id => id !== taskId),
      }
      setTimeout(() => saveState(get()), 0)
      return newState
    })
  },

  unlockParent: () => set({ parentUnlocked: true }),
  lockParent: () => set({ parentUnlocked: false, currentView: 'kids' }),

  resetDay: () => {
    set((state) => {
      const newState = {
        completedToday: [],
        submissions: state.submissions.filter(s => s.approved),
      }
      setTimeout(() => saveState(get()), 0)
      return newState
    })
  },
}))
