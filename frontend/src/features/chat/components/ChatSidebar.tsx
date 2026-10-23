import { MessageCircle, Plus, X } from "lucide-react"
import { ChatSidebarInterface } from "../chatTypes"
import { useState } from "react"
const ChatSidebar = ({ users, selectedUser, onSelectUser, openSidebar, setOpenSidebar }: ChatSidebarInterface) => {
    const [searchQuery, setSearchQuery] = useState<string>('')
  return (
    <aside className={`fixed z-20 sm:static top-0 left-0 h-screen w-80 bg-gray-900 border-r border-gray-700 transform ${
        openSidebar ? "translate-x-0" : "-translate-x-full"
      } sm:translate-x-0 transition-transform duration-300 flex flex-col`}>

      <div className="p-6 border-b border-gray-700 flex justify-between">
        <div className="sm:hidden flex justify-end mb-0">
          <button
           className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            onClick={() => setOpenSidebar(false)}
          >
            <X className="w-5 h-5 text-gray-300" />
          </button>
        </div>
          
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 justify-between rounded-full">
                    <MessageCircle className="w-5 h-5 text-white" />
                </div>
            </div>
            <h2 className="text-xl font-bold text-white">
                Messages
            </h2>
        </div>

        <button 
            className={`p-2.5 rounded-lg transition-colors ${
              openSidebar
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
            onClick={() => setOpenSidebar(!openSidebar)}
            >
          {openSidebar ? (
              <X className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
        </button>
      </div>
    </aside>
  )
}

export default ChatSidebar