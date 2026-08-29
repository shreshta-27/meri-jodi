import { useState, useEffect, useRef } from 'react'
import { Search, Send, ArrowLeft } from 'lucide-react'
import { io } from 'socket.io-client'
import Navbar from '../Components/Navbar'
import Footer from '../Components/Footer'
import { getConversations, getConversationHistory } from '../api/messageApi'
import { getProfileById } from '../api/matchingApi'
import { getMyProfile } from '../api/profileApi'

const COLORS = {
  primary: '#852231',
  primaryHover: '#6b1b27',
  sidebarBg: '#F5F3F3',
  mainBg: '#ffffff',
  textDark: '#640515',
  textMuted: '#6b5d60',
  borderTone: '#DDC0BF',
}

export default function Chatapp() {
  const [searchQuery, setSearchQuery] = useState('')
  const [conversations, setConversations] = useState([])
  const [activeChat, setActiveChat] = useState(null)
  const [activeProfile, setActiveProfile] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [socket, setSocket] = useState(null)
  const [typingProfiles, setTypingProfiles] = useState({})
  const [myProfileId, setMyProfileId] = useState(null)
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Fetch conversations and own profile
  useEffect(() => {
    let cancelled = false
    const fetchInitial = async () => {
      try {
        const [convos, myProfile] = await Promise.all([
          getConversations(),
          getMyProfile(),
        ])
        if (!cancelled) {
          setConversations(Array.isArray(convos) ? convos : [])
          if (myProfile?._id) setMyProfileId(myProfile._id)
          setLoading(false)
        }
      } catch (err) {
        console.error('Failed to fetch initial data:', err)
        if (!cancelled) setLoading(false)
      }
    }
    fetchInitial()
    return () => { cancelled = true }
  }, [])

  // Setup Socket.io
  useEffect(() => {
    const setupSocket = () => {
      const token = localStorage.getItem('token')
      if (!token) return
      const SOCKET_URL = import.meta.env.VITE_API_BASE_URL
        ? import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '')
        : 'http://localhost:5000'

      const s = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
      })

      s.on('connect', () => console.log('Socket connected'))
      s.on('new_message', (message) => {
        setMessages((prev) => {
          const exists = prev.some((m) => m._id === message._id)
          return exists ? prev : [...prev, message]
        })
      })
      s.on('new_message_notification', (data) => {
        // Refresh conversations list
        getConversations().then((data) => {
          if (Array.isArray(data)) setConversations(data)
        }).catch(() => {})
      })
      s.on('user_typing', (data) => {
        setTypingProfiles((prev) => ({ ...prev, [data.profileId]: data.isTyping }))
      })
      s.on('messages_read', (data) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.receiverProfileId === data.readBy ? { ...m, isRead: true } : m
          )
        )
      })

      setSocket(s)
      return () => {
        s.disconnect()
      }
    }
    setupSocket()
  }, [myProfileId])

  // Load conversation when active chat changes
  useEffect(() => {
    if (!activeChat) return

    const fetchMessages = async () => {
      try {
        const data = await getConversationHistory(activeChat)
        setMessages(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Failed to fetch messages:', err)
        setMessages([])
      }
    }
    fetchMessages()

    // Fetch active profile details
    getProfileById(activeChat).then(setActiveProfile).catch(() => setActiveProfile(null))

    // Join socket room
    if (socket) {
      socket.emit('join_conversation', activeChat)
      socket.emit('mark_read', { senderProfileId: activeChat })
    }

    return () => {
      if (socket) {
        socket.emit('leave_conversation')
      }
    }
  }, [activeChat, socket])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !socket || !activeChat) return

    socket.emit('send_message', {
      receiverProfileId: activeChat,
      content: newMessage.trim(),
    }, (response) => {
      if (response?.success) {
        setMessages((prev) => [...prev, response.message])
      } else if (response?.error) {
        alert(response.error)
      }
    })

    setNewMessage('')
  }

  const handleTyping = (isTyping) => {
    if (!socket || !activeChat) return
    socket.emit('typing', { receiverProfileId: activeChat, isTyping })

    if (isTyping) {
      clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing', { receiverProfileId: activeChat, isTyping: false })
      }, 2000)
    }
  }

  const filteredConversations = conversations.filter((conv) => {
    const name = conv.lastMessage?.senderProfileId?.name || ''
    return name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const getChatPartnerName = () => {
    return activeProfile?.name || 'Chat Partner'
  }

  const getChatPartnerPhoto = () => {
    return activeProfile?.photos?.find((p) => p.isPrimary)?.url || activeProfile?.photos?.[0]?.url || null
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center font-sans antialiased">
        <div
          className="w-full max-w-7xl h-[800px] rounded-2xl overflow-hidden flex border shadow-sm"
          style={{ borderColor: COLORS.borderTone }}
        >
          {/* Sidebar */}
          <aside
            className={`${activeChat ? 'hidden md:flex' : 'flex'} w-full md:w-[340px] flex-col border-r shrink-0`}
            style={{ backgroundColor: COLORS.sidebarBg, borderColor: COLORS.borderTone }}
          >
            <div className="p-6 border-b" style={{ borderColor: COLORS.borderTone }}>
              <h1 className="text-2xl font-serif font-bold mb-4 tracking-tight" style={{ color: COLORS.textDark }}>
                Conversations
              </h1>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search messages"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-[#DDC0BF] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-rose-900/20 focus:border-rose-900 transition-all placeholder:text-gray-400"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto divide-y" style={{ borderColor: COLORS.borderTone }}>
              {loading ? (
                <div className="p-8 text-center text-xs opacity-50">Loading conversations...</div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-xs opacity-50">No conversations found</div>
              ) : (
                filteredConversations.map((conv) => {
                  const partnerId = conv._id
                  const msg = conv.lastMessage
                  return (
                    <div
                      key={partnerId}
                      onClick={() => setActiveChat(partnerId)}
                      className={`flex gap-3 p-4 items-start cursor-pointer transition-colors relative border-b border-[#DDC0BF] ${activeChat === partnerId ? 'bg-white/80' : 'hover:bg-white/40'}`}
                    >
                      {activeChat === partnerId && (
                        <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: COLORS.primary }} />
                      )}
                      <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-gray-100 bg-gray-200" />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                          <h2 className="text-sm font-semibold text-gray-900 truncate">Chat Partner</h2>
                          <span className="text-[11px] font-medium text-gray-800 shrink-0 ml-2">
                            {msg?.createdAt ? new Date(msg.createdAt).toLocaleDateString() : ''}
                          </span>
                        </div>
                        <p className="text-xs truncate font-medium leading-relaxed" style={{ color: COLORS.textMuted }}>
                          {msg?.content || 'No messages yet'}
                        </p>
                        {conv.unreadCount > 0 && (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold text-white mt-1"
                            style={{ backgroundColor: COLORS.primary }}>
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </aside>

          {/* Chat Area */}
          <main
            className={`${!activeChat ? 'hidden md:flex' : 'flex'} flex-1 flex-col`}
            style={{ backgroundColor: COLORS.mainBg }}
          >
            {!activeChat ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <h2 className="text-3xl font-serif font-bold mb-3 tracking-tight" style={{ color: COLORS.primary }}>
                  Your Eternal Connections
                </h2>
                <p className="text-sm leading-relaxed mb-6 font-medium max-w-sm" style={{ color: COLORS.textMuted }}>
                  Select a conversation from the list to start chatting with your matches.
                </p>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: COLORS.borderTone, backgroundColor: COLORS.sidebarBg }}>
                  <button onClick={() => setActiveChat(null)} className="md:hidden p-1">
                    <ArrowLeft className="w-5 h-5" style={{ color: COLORS.primary }} />
                  </button>
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 shrink-0">
                    {getChatPartnerPhoto() && <img src={getChatPartnerPhoto()} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm" style={{ color: COLORS.textDark }}>
                      {getChatPartnerName()}
                    </h3>
                    {typingProfiles[activeChat] && (
                      <p className="text-xs" style={{ color: COLORS.primary }}>typing...</p>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-sm opacity-50 mt-10">No messages yet. Start the conversation!</div>
                  ) : (
                    [...messages].reverse().map((msg) => {
                      const senderId = typeof msg.senderProfileId === 'object' ? msg.senderProfileId._id : msg.senderProfileId
                      const isMine = myProfileId ? senderId === myProfileId : false
                      return (
                        <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${isMine ? 'bg-[#852231] text-white rounded-br-md' : 'bg-gray-100 text-gray-800 rounded-bl-md'}`}
                          >
                            <p className="text-sm">{msg.content}</p>
                            <p className="text-[10px] mt-1 opacity-60">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      )
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-3" style={{ borderColor: COLORS.borderTone }}>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value)
                      handleTyping(true)
                    }}
                    onBlur={() => handleTyping(false)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2.5 rounded-full border focus:outline-none focus:ring-1 text-sm"
                    style={{ borderColor: COLORS.borderTone }}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white disabled:opacity-50"
                    style={{ backgroundColor: COLORS.primary }}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            )}
          </main>
        </div>
      </div>
      <Footer />
    </>
  )
}
