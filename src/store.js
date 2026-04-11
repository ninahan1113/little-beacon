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

// ---- Helpers ----

const todayStr = () => new Date().toISOString().slice(0, 10) // "2026-04-10"

const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

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
      redeemedRewards: state.redeemedRewards, lastActiveDate: state.lastActiveDate,
      parentPin: state.parentPin,
    }))
  } catch {}
}

// Track whether we're currently saving to avoid sync overwriting local changes
let isSaving = false

const saveToCloud = async (state) => {
  saveLocal(state)
  isSaving = true
  try {
    await supabase.from('app_state').update({
      gems: state.gems,
      tasks: state.tasks,
      rewards: state.rewards,
      submissions: state.submissions,
      completed_today: state.completedToday,
      redeemed_rewards: state.redeemedRewards,
      last_active_date: state.lastActiveDate,
      parent_pin: state.parentPin,
      updated_at: new Date().toISOString(),
    }).eq('id', 1)
  } catch (err) {
    console.warn('Cloud save failed, data cached locally:', err)
  }
  isSaving = false
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
        lastActiveDate: data.last_active_date ?? todayStr(),
        parentPin: data.parent_pin ?? '1234',
        _updatedAt: data.updated_at ?? null,
      }
    }
  } catch (err) {
    console.warn('Cloud load failed, using local cache:', err)
  }
  return null
}

// Debounce cloud saves
let saveTimer = null
const debouncedSaveToCloud = (state) => {
  saveLocal(state)
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => saveToCloud(state), 500)
}

// Auto daily reset + cleanup old submissions (keep 7 days)
const applyDailyReset = (data) => {
  const today = todayStr()
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString()

  // Clean old approved submissions (older than 7 days) to prevent infinite growth
  const cleanedSubmissions = data.submissions.filter(s => {
    if (s.approved && s.timestamp < sevenDaysAgo) return false // drop old approved
    return true // keep pending + recent approved
  })

  if (data.lastActiveDate && data.lastActiveDate !== today) {
    return {
      ...data,
      completedToday: [],
      submissions: cleanedSubmissions.filter(s => !s.approved), // keep only pending on new day
      lastActiveDate: today,
    }
  }
  return { ...data, submissions: cleanedSubmissions, lastActiveDate: today }
}

// P0 Fix #3: Merge strategy - combine local pending changes with cloud data
const mergeStates = (local, cloud) => {
  if (!cloud) return local
  if (!local) return cloud

  // Merge submissions: combine both, deduplicate by id
  const allSubs = [...cloud.submissions]
  const cloudSubIds = new Set(cloud.submissions.map(s => s.id))
  for (const localSub of local.submissions) {
    if (!cloudSubIds.has(localSub.id)) {
      allSubs.push(localSub) // local-only submission, keep it
    }
  }

  // For gems/tasks/rewards - trust cloud as source of truth
  // But if cloud submission was approved and local wasn't, use cloud version
  return {
    gems: cloud.gems,
    tasks: cloud.tasks,
    rewards: cloud.rewards,
    submissions: allSubs,
    completedToday: [...new Set([...cloud.completedToday, ...local.completedToday])],
    redeemedRewards: cloud.redeemedRewards,
    lastActiveDate: cloud.lastActiveDate,
    parentPin: cloud.parentPin ?? local.parentPin ?? '1234',
  }
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
  lastActiveDate: local?.lastActiveDate ?? todayStr(),
  parentPin: local?.parentPin ?? '1234',
  cloudReady: false,

  // UI state
  currentView: 'kids',
  selectedTask: null,
  showConfetti: false,
  parentUnlocked: false,

  // Init: load from cloud on startup, apply daily reset
  initFromCloud: async () => {
    const cloud = await loadFromCloud()
    const localData = get()
    const merged = cloud ? mergeStates(localData, cloud) : localData
    const withReset = applyDailyReset(merged)
    set({ ...withReset, cloudReady: true })
    saveLocal(withReset)
    // If daily reset happened, push to cloud
    if (withReset.lastActiveDate !== merged.lastActiveDate ||
        withReset.completedToday.length !== merged.completedToday.length) {
      saveToCloud(withReset)
    }
  },

  // Sync: pull latest, merge, apply daily reset - skip if we're saving
  syncFromCloud: async () => {
    if (isSaving) return // don't overwrite during a save
    const cloud = await loadFromCloud()
    if (cloud) {
      const localData = get()
      const merged = mergeStates(localData, cloud)
      const withReset = applyDailyReset(merged)
      set(withReset)
      saveLocal(withReset)
    }
  },

  // Actions
  setView: (view) => set({ currentView: view }),
  selectTask: (task) => set({ selectedTask: task }),
  closeTask: () => set({ selectedTask: null }),

  submitTask: (taskId, photoUrl) => {
    set((state) => ({
      submissions: [...state.submissions, {
        id: genId(), taskId, photoUrl,
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

  rejectSubmission: (submissionId) => {
    set((state) => ({
      submissions: state.submissions.filter(s => s.id !== submissionId),
    }))
    setTimeout(() => debouncedSaveToCloud(get()), 0)
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
        id: genId(), name, icon,
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
        id: genId(), name, icon, description,
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

  setParentPin: (newPin) => {
    set({ parentPin: newPin })
    setTimeout(() => debouncedSaveToCloud(get()), 0)
  },

  unlockParent: () => set({ parentUnlocked: true }),
  lockParent: () => set({ parentUnlocked: false, currentView: 'kids' }),

  resetDay: () => {
    set((state) => ({
      completedToday: [],
      submissions: state.submissions.filter(s => !s.approved),
      lastActiveDate: todayStr(),
    }))
    setTimeout(() => debouncedSaveToCloud(get()), 0)
  },
}))

// Auto-init from cloud on app startup
useStore.getState().initFromCloud()

// Supabase Realtime: subscribe to changes on app_state table
// This replaces the 5-second polling with instant push updates
supabase
  .channel('app_state_changes')
  .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'app_state' }, () => {
    // Only sync if we didn't just save (avoid echo)
    if (!isSaving) {
      useStore.getState().syncFromCloud()
    }
  })
  .subscribe()

// Fallback: sync when user switches back to the app/tab (in case realtime missed)
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    useStore.getState().syncFromCloud()
  }
})
