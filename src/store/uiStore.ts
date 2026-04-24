import { create } from 'zustand'

interface UIState {
  isDarkMode: boolean
  isSidebarCollapsed: boolean
  isSandboxOpen: boolean
  workflowName: string
  toggleDarkMode: () => void
  toggleSidebar: () => void
  setIsSandboxOpen: (open: boolean) => void
  setWorkflowName: (name: string) => void
}

export const useUiStore = create<UIState>()((set) => ({
  isDarkMode: false,
  isSidebarCollapsed: false,
  isSandboxOpen: false,
  workflowName: 'Untitled Workflow',
  toggleDarkMode: () => set(s => ({ isDarkMode: !s.isDarkMode })),
  toggleSidebar: () => set(s => ({ isSidebarCollapsed: !s.isSidebarCollapsed })),
  setIsSandboxOpen: (open) => set({ isSandboxOpen: open }),
  setWorkflowName: (name) => set({ workflowName: name }),
}))
