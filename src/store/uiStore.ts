import { create } from 'zustand'

interface UIState {
  isDarkMode: boolean
  isSidebarCollapsed: boolean
  workflowName: string
  toggleDarkMode: () => void
  toggleSidebar: () => void
  setWorkflowName: (name: string) => void
}

export const useUIStore = create<UIState>()((set) => ({
  isDarkMode: false,
  isSidebarCollapsed: false,
  workflowName: 'Untitled Workflow',
  toggleDarkMode: () => set(s => ({ isDarkMode: !s.isDarkMode })),
  toggleSidebar: () => set(s => ({ isSidebarCollapsed: !s.isSidebarCollapsed })),
  setWorkflowName: (name) => set({ workflowName: name }),
}))
