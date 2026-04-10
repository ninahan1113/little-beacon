import { create } from 'zustand'
import { supabase } from './supabase'

const TASKS = [
  { id: 1, name: '刷牙洗脸', icon: '🪥', description: '早起第一件事，把小脸洗得干干净净，牙齿刷得亮晶晶！', gems: 10, color: '#a8e6cf' },
  { id: 2, name: '整理书包', icon: '🎒', description: '检查课本、文具都带齐了吗？整整齐齐放进书包里！', gems: 10, color: '#a8d8ea' },
  { id: 3, name: '认读汉字', icon: '📖', description: '今天来认识5个新的汉字朋友吧！大声读出来哦～', gems: 15, color: '#ffd3b6' },
  { id: 4, name: '跳绳500下', icon: '🤸', description: '跳起来！500下跳绳让身体变得棒棒的！可以分几次完成哦～', gems: 20, color: '#ffaaa5' },
]

const REWARDS = [
  { id: 1, name: '看动画片15分钟', icon: '📺', cost: 20, color: '#a8d8ea' },
  { id: 2, name: '公园野餐', icon: '🧺', cost: 200, color: '#a8e6cf' },
  { id: 3, name: '选一个小贴纸', icon: '⭐', cost: 10, color: '#ffd3b6' },
  { id: 4, name: '睡前多听一个故事', icon: '🌙', cost: 15, color: '#c4b5fd' },
]

const TASK_COLORS = ['#a8e6cf', '#a8d8ea', '#ffd3b6', '#ffaaa5', '#c4b5fd', '#fbbf24', '#f9a8d4', '#86efac']
const REWARD_COLORS = ['#a8d8ea', '#a8e6cf', '#ffd3b6', '#c4b5fd', '#ffaaa5', '#fbbf24', '#f9a8d4', '#86efac']

// ---- Persistence: Supabase (primary) + localStorage (fallback/cache) ----

const loadLocal = () => {
  try {
    const saved = localStorage.getItem('little-beacon-state')
    if (saved) return JSON.parse(saved)
  } catch {}
  return null
}

const saveLocal = (state) => {
  try {
    localStorage.setItem('little-beacon-state', JSON.stringify({
      tasks: state.tasks, rewards: state.rewards, gems: state.gems,
      submissions: state.submissions, completedToday: state.completedToday,
      redeemedRewards: state.redeemedRewards,
    }))
  } catch {}
}

const saveToCloud = async (state) => {
  saveLocal(state) // always cache locally
  try {
    await supabase.from('app_state').update({
      gems: state.gems,
      tasks: state.tasks,
      rewards: state.rewards,
      submissions: state.submissions,
      completed_today: state.completedToday,
      redeemed_rewards: state.redeemedRewards,
      updated_at: new Date().toISOString(),
    }).eq('id', 1)
  } catch (err) {
    console.warn('Cloud save failed, data cached locally:', err)
  }
}

const loadFromCloud = async () => {
  try {
    const { data, error } = await supabase
      .from('app_state')
      .select('*')
      .eq('id', 1)
      .single()
    if (error) throw error
    if (data) {
      return {
        gems: data.gems ?? 0,
        tasks: data.tasks ?? TASKS,
        rewards: data.rewards ?? REWARDS,
        submissions: data.submissions ?? [],
        completedToday: data.completed_today ?? [],
        redeemedRewards: data.redeemed_rewards ?? [],
      }
    }
  } catch (err) {
    console.warn('Cloud load failed, using local cache:', err)
  }
  return null
}

// Debounce cloud saves to avoid too many requests
let saveTimer = null
const debouncedSaveToCloud = (state) => {
  saveLocal(state)
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => saveToCloud(state), 500)
}

const local = loadLocal()

export const useStore = create((set, get) => ({
  // Data - start with local cache, cloud will override via initFromCloud
  tasks: local?.tasks ?? TASKS,
  rewards: local?.rewards ?? REWARDS,
  gems: local?.gems ?? 0,
  submissions: local?.submissions ?? [],
  completedToday: local?.completedToday ?? [],
  redeemedRewards: local?.redeemedRewards ?? [],
  cloudReady: false,

  // UI state
  currentView: 'kids',
  selectedTask: null,
  showConfetti: false,
  parentUnlocked: false,

  // Init: load from cloud on startup
  initFromCloud: async () => {
    const cloud = await loadFromCloud()
    if (cloud) {
      set({ ...cloud, cloudReady: true })
      saveLocal({ ...cloud }) // update local cache
    } else {
      set({ cloudReady: true })
    }
  },

  // Actions
  setView: (view) => set({ currentView: view }),
  selectTask: (task) => set({ selectedTask: task }),
  closeTask: () => set({ selectedTask: null }),

  submitTask: (taskId, photoUrl) => {
    set((state) => ({
      submissions: [...state.submissions, {
        id: Date.now(), taskId, photoUrl,
        timestamp: new Date().toISOString(), approved: false,
      }],
    }))
    setTimeout(() => debouncedSaveToCloud(get()), 0)
  },

  approveSubmission: (submissionId) => {
    set((state) => {
      const sub = state.submissions.find(s => s.id === submissionId)
      if (!sub || sub.approved) return state
      const task = state.tasks.find(t => t.id === sub.taskId)
      return {
        submissions: state.submissions.map(s =>
          s.id === submissionId ? { ...s, approved: true } : s
        ),
        gems: state.gems + (task?.gems ?? 0),
        completedToday: [...state.completedToday, sub.taskId],
        showConfetti: true,
      }
    })
    setTimeout(() => debouncedSaveToCloud(get()), 0)
    setTimeout(() => set({ showConfetti: false }), 4000)
  },

  redeemReward: (rewardId) => {
    set((state) => {
      const reward = state.rewards.find(r => r.id === rewardId)
      if (!reward || state.gems < reward.cost) return state
      return {
        gems: state.gems - reward.cost,
        redeemedRewards: [...state.redeemedRewards, {
          rewardId, timestamp: new Date().toISOString(),
        }],
      }
    })
    setTimeout(() => debouncedSaveToCloud(get()), 0)
  },

  addReward: ({ name, icon, cost }) => {
    set((state) => ({
      rewards: [...state.rewards, {
        id: Date.now(), name, icon,
        cost: Number(cost) || 10,
        color: REWARD_COLORS[state.rewards.length % REWARD_COLORS.length],
      }],
    }))
    setTimeout(() => debouncedSaveToCloud(get()), 0)
  },

  updateReward: (rewardId, updates) => {
    set((state) => ({
      rewards: state.rewards.map(r =>
        r.id === rewardId ? { ...r, ...updates, cost: Number(updates.cost) || r.cost } : r
      ),
    }))
    setTimeout(() => debouncedSaveToCloud(get()), 0)
  },

  deleteReward: (rewardId) => {
    set((state) => ({ rewards: state.rewards.filter(r => r.id !== rewardId) }))
    setTimeout(() => debouncedSaveToCloud(get()), 0)
  },

  addTask: ({ name, icon, description, gems }) => {
    set((state) => ({
      tasks: [...state.tasks, {
        id: Date.now(), name, icon, description,
        gems: Number(gems) || 10,
        color: TASK_COLORS[state.tasks.length % TASK_COLORS.length],
      }],
    }))
    setTimeout(() => debouncedSaveToCloud(get()), 0)
  },

  updateTask: (taskId, updates) => {
    set((state) => ({
      tasks: state.tasks.map(t =>
        t.id === taskId ? { ...t, ...updates, gems: Number(updates.gems) || t.gems } : t
      ),
    }))
    setTimeout(() => debouncedSaveToCloud(get()), 0)
  },

  deleteTask: (taskId) => {
    set((state) => ({
      tasks: state.tasks.filter(t => t.id !== taskId),
      submissions: state.submissions.filter(s => s.taskId !== taskId),
      completedToday: state.completedToday.filter(id => id !== taskId),
    }))
    setTimeout(() => debouncedSaveToCloud(get()), 0)
  },

  unlockParent: () => set({ parentUnlocked: true }),
  lockParent: () => set({ parentUnlocked: false, currentView: 'kids' }),

  resetDay: () => {
    set((state) => ({
      completedToday: [],
      submissions: state.submissions.filter(s => s.approved),
    }))
    setTimeout(() => debouncedSaveToCloud(get()), 0)
  },
}))

// Auto-init from cloud on app startup
useStore.getState().initFromCloud()
