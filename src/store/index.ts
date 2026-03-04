import { create } from 'zustand'

interface UIState {
    sidebarOpen: boolean
    setSidebarOpen: (open: boolean) => void
    toggleSidebar: () => void
}

export const useUIStore = create<UIState>((set) => ({
    sidebarOpen: true,
    setSidebarOpen: (open) => set({ sidebarOpen: open }),
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}))

interface TimerState {
    isRunning: boolean
    timeLeft: number
    mode: 'work' | 'break' | 'longBreak'
    sessionsCompleted: number
    currentSubjectId: string | null
    currentTaskId: string | null
    setIsRunning: (running: boolean) => void
    setTimeLeft: (time: number) => void
    setMode: (mode: 'work' | 'break' | 'longBreak') => void
    incrementSessions: () => void
    setCurrentSubjectId: (id: string | null) => void
    setCurrentTaskId: (id: string | null) => void
    tick: () => void
    reset: (duration: number) => void
}

export const useTimerStore = create<TimerState>((set) => ({
    isRunning: false,
    timeLeft: 25 * 60,
    mode: 'work',
    sessionsCompleted: 0,
    currentSubjectId: null,
    currentTaskId: null,
    setIsRunning: (running) => set({ isRunning: running }),
    setTimeLeft: (time) => set({ timeLeft: time }),
    setMode: (mode) => set({ mode }),
    incrementSessions: () => set((state) => ({ sessionsCompleted: state.sessionsCompleted + 1 })),
    setCurrentSubjectId: (id) => set({ currentSubjectId: id }),
    setCurrentTaskId: (id) => set({ currentTaskId: id }),
    tick: () => set((state) => ({ timeLeft: Math.max(0, state.timeLeft - 1) })),
    reset: (duration) => set({ timeLeft: duration, isRunning: false }),
}))
