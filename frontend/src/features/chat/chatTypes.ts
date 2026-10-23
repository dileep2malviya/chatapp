interface ChatMessage {
  user: string
  message: string
}

interface ChatHistory {
  user: string
  message: string
}

interface ChatSidebarInterface {
  users: string[]
  selectedUser: string | null
  onSelectUser: (user: string) => void
  openSidebar: boolean
  setOpenSidebar: (open: boolean) => void
}

export type { ChatMessage, ChatHistory, ChatSidebarInterface }