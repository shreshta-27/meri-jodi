import { useState, useEffect, useRef } from 'react'
import { Search, Send, ArrowLeft, User } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
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
  const [searchParams] = useSearchParams()
  const initialTargetProfileId = searchParams.get('profileId') || searchParams.get('userId')

  const [searchQuery, setSearchQuery] = useState('')
  const [conversations, setConversations] = useState([])
  const [activeChat, setActiveChat] = useState(initialTargetProfileId || null)
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

  // Fetch initial conversations and own profile
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
        console.error('Failed to fetch initial chat data:', err)
        if (!cancelled) setLoading(false)
      }
    }
    fetchInitial()
    return () => { cancelled = true }
  }, [])

  // If initial target profile passed in query param, fetch their profile details
  useEffect(() => {
    if (initialTargetProfileId) {
      setActiveChat(initialTargetProfileId)
      getProfileById(initialTargetProfileId)
        .then(setActiveProfile)
        .catch(() => {})
    }
  }, [initialTargetProfileId])

  // Setup Socket.io
  useEffect(() => {
    const setupSocket = () => {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token')
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
      s.on('new_message_notification', () => {
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

    getProfileById(activeChat).then(setActiveProfile).catch(() => {})

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
    const name = conv.partnerName || conv.partner?.name || conv.partner?.userId?.name || ''
    return name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const getChatPartnerName = () => {
    return activeProfile?.name || activeProfile?.userId?.name || 'Chat Partner'
  }

  const getChatPartnerPhoto = () => {
    return activeProfile?.photos?.find((p) => p.isPrimary)?.url || activeProfile?.photos?.[0]?.url || null
  }

  return (
    <div className="min-h-screen bg-[#FBF9F9] flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div
          className="w-full h-[650px] sm:h-[750px] rounded-3xl overflow-hidden flex border border-[#FFE4E8] shadow-sm bg-white"
        >
          {/* Sidebar */}
          <aside
            className={`${activeChat ? 'hidden md:flex' : 'flex'} w-full md:w-[340px] flex-col border-r border-[#FFE4E8] shrink-0 bg-[#FFF9FA]`}
          >
            <div className="p-5 border-b border-[#FFE4E8]">
              <h1 className="text-xl font-serif font-bold text-[#640515] mb-3">
                Messages
              </h1>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#842029]"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
              {loading ? (
                <div className="p-8 text-center text-xs text-gray-400">Loading messages...</div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-400">No active conversations found</div>
              ) : (
                filteredConversations.map((conv) => {
                  const partnerId = conv._id
                  const partnerName = conv.partnerName || conv.partner?.name || conv.partner?.userId?.name || 'Member'
                  const partnerPhoto =
                    conv.partnerPhotos?.find((p) => p.isPrimary)?.url ||
                    conv.partnerPhotos?.[0]?.url ||
                    conv.partner?.photos?.find((p) => p.isPrimary)?.url ||
                    conv.partner?.photos?.[0]?.url
                  const msg = conv.lastMessage

                  return (
                    <div
                      key={partnerId}
                      onClick={() => setActiveChat(partnerId)}
                      className={`flex gap-3 p-4 items-start cursor-pointer transition-colors relative ${activeChat === partnerId ? 'bg-[#FFF0F2]' : 'hover:bg-gray-50'}`}
                    >
                      {activeChat === partnerId && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#842029]" />
                      )}
                      <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 border border-gray-200 bg-gray-100 flex items-center justify-center">
                        {partnerPhoto ? (
                          <img src={partnerPhoto} alt={partnerName} className="w-full h-full object-cover" />
                        ) : (
                          <User size={18} className="text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <h2 className="text-xs sm:text-sm font-bold text-gray-900 truncate">{partnerName}</h2>
                          <span className="text-[10px] text-gray-400 shrink-0 ml-2">
                            {msg?.createdAt ? new Date(msg.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ''}
                          </span>
                        </div>
                        <p className="text-xs truncate text-gray-500">
                          {msg?.content || 'No messages yet'}
                        </p>
                        {conv.unreadCount > 0 && (
                          <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white bg-[#842029] mt-1">
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
            className={`${!activeChat ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-white`}
          >
            {!activeChat ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-[#FFF0F2] text-[#842029] flex items-center justify-center mb-4">
                  <User size={28} />
                </div>
                <h2 className="text-2xl font-serif font-bold text-[#640515] mb-2">
                  Direct Messages
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 max-w-sm">
                  Select a match from the conversation list to start communicating securely.
                </p>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-[#FFE4E8] bg-[#FFF9FA]">
                  <button onClick={() => setActiveChat(null)} className="md:hidden p-1 text-gray-600">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 shrink-0 border border-gray-200 flex items-center justify-center">
                    {getChatPartnerPhoto() ? (
                      <img src={getChatPartnerPhoto()} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User size={18} className="text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 font-serif">
                      {getChatPartnerName()}
                    </h3>
                    {typingProfiles[activeChat] ? (
                      <p className="text-[11px] text-[#842029] font-medium animate-pulse">typing...</p>
                    ) : (
                      <p className="text-[11px] text-emerald-600 font-medium">Online</p>
                    )}
                  </div>
                </div>

                {/* Messages Feed */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
                  {messages.length === 0 ? (
                    <div className="text-center text-xs text-gray-400 mt-12">
                      No messages yet. Say hello to begin your conversation!
                    </div>
                  ) : (
                    [...messages].reverse().map((msg) => {
                      const senderId = typeof msg.senderProfileId === 'object' ? msg.senderProfileId._id : msg.senderProfileId
                      const isMine = myProfileId ? senderId === myProfileId : false
                      return (
                        <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-2xs ${
                              isMine
                                ? 'bg-[#842029] text-white rounded-br-xs'
                                : 'bg-gray-100 text-gray-800 rounded-bl-xs'
                            }`}
                          >
                            <p className="text-xs sm:text-sm leading-relaxed">{msg.content}</p>
                            <p className="text-[9px] mt-1 text-right opacity-70">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      )
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input Box */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value)
                      handleTyping(true)
                    }}
                    onBlur={() => handleTyping(false)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2.5 rounded-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#842029] text-xs sm:text-sm outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-[#842029] hover:bg-[#6b1b27] disabled:opacity-40 transition-colors shadow-xs"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            )}
          </main>
        </div>
      </main>
      <Footer />
    </div>
  )
}
