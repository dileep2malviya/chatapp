"use client"
import ChatSidebar from '@/features/chat/components/ChatSidebar'
import { useState } from 'react'

const ChatApp = () => {

  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [messages, setMessages] = useState<string[]>([])
  const [inputMessage, setInputMessage] = useState<string>('')
  const [users, setUsers] = useState<string[]>([])
  const [isTyping, setIsTyping] = useState<boolean>(false)
  const [chatHistory, setChatHistory] = useState<{ user: string; message: string }[]>([])
  const [tyingTimeOut, setTyingTimeOut] = useState<NodeJS.Timeout | null>(null)
  const [openSidebar, setOpenSidebar] = useState<boolean>(false)

  return (
    <div className="chat-app min-h-screen flex bg-gray-900 text-white relative overflow-hidden">
      <ChatSidebar
        users={users}
        selectedUser={selectedUser}
        onSelectUser={setSelectedUser}
        openSidebar={openSidebar}
        setOpenSidebar={setOpenSidebar}
      />
    </div>
  )
}

export default ChatApp