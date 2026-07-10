'use client';

import React, { useState, useEffect, useRef } from 'react';
import { chatApi } from '@/lib/api/chat';
import { enrollmentsApi } from '@/lib/api/enrollments';
import { coursesApi } from '@/lib/api/courses';
import type { ChatSession, ChatMessage, Course } from '@nama/shared';
import { useSocket } from '@/components/providers/SocketProvider';
import styles from './ChatInbox.module.css';

export default function ChatInbox({ currentUserId, role }: { currentUserId: string; role: 'STUDENT' | 'TEACHER' }) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [teacherCourses, setTeacherCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { socket } = useSocket();

  // Attach socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data: { message: ChatMessage, session?: ChatSession } | ChatMessage) => {
      // Backend was updated to send { message, session }
      const message = 'message' in data ? data.message : data;
      const fullSession = 'session' in data ? data.session : undefined;
      
      setMessages(prev => {
        // Prevent duplicate messages
        if (prev.some(m => m.id === message.id)) return prev;
        
        // Re-sort just to be safe, though they should be chronological
        const newArr = [...prev, message].sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        return newArr;
      });
      
      // Update the session's latest message in the sidebar, or add if new
      setSessions(prevSessions => {
        const exists = prevSessions.some(s => s.id === message.sessionId);
        if (exists) {
          return prevSessions.map(session => {
            if (session.id === message.sessionId) {
              return {
                ...session,
                messages: [message, ...(session.messages || [])]
              };
            }
            return session;
          });
        } else if (fullSession) {
           fullSession.messages = [message];
           return [fullSession, ...prevSessions];
        }
        return prevSessions;
      });
    };

    const handleMessagesRead = (data: { sessionId: string, readByUserId: string }) => {
      if (data.readByUserId !== currentUserId) {
        setMessages(prev => prev.map(m => 
          m.senderId === currentUserId ? { ...m, isRead: true } : m
        ));
      }
      
      setSessions(prevSessions => prevSessions.map(session => {
        if (session.id === data.sessionId) {
          const updatedMessages = session.messages?.map(m => {
            if (data.readByUserId === currentUserId && m.senderId !== currentUserId) return { ...m, isRead: true };
            if (data.readByUserId !== currentUserId && m.senderId === currentUserId) return { ...m, isRead: true };
            return m;
          });
          return { ...session, messages: updatedMessages };
        }
        return session;
      }));
    };

    socket.on('new_message', handleNewMessage);
    socket.on('messages_read', handleMessagesRead);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('messages_read', handleMessagesRead);
    };
  }, [socket, currentUserId]);

  useEffect(() => {
    fetchInitialData();
  }, [role]);

  useEffect(() => {
    if (selectedSession) {
      if (socket) {
        socket.emit('join_room', selectedSession.id);
      }
      if (!selectedSession.id.startsWith('virtual_')) {
        fetchMessages(selectedSession.id);
      } else {
        setMessages([]);
      }
      return () => {
        if (socket) {
          socket.emit('leave_room', selectedSession.id);
        }
      };
    }
  }, [selectedSession, socket]);

  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg && lastMsg.senderId !== currentUserId && !lastMsg.isRead) {
        chatApi.markAsRead(selectedSession?.id || lastMsg.sessionId).catch(console.error);
      }
    }
    scrollToBottom();
  }, [messages, currentUserId, selectedSession]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const chatRes = await chatApi.getSessions();
      const dbSessions = chatRes.data?.sessions || [];

      if (role === 'STUDENT') {
        // Fetch enrollments
        const enrollRes = await enrollmentsApi.getMyCourses();
        const enrollments = enrollRes.data?.enrollments || [];
        
        // Merge enrollments with existing sessions
        const mergedSessions: ChatSession[] = enrollments.map(enr => {
          const course = enr.enrollment.course;
          if (!course) return null;
          const existingSession = dbSessions.find(s => s.courseId === course.id);
          if (existingSession) return existingSession;
          
          // Return a virtual session
          return {
            id: `virtual_${course.id}`,
            courseId: course.id,
            studentId: currentUserId,
            teacherId: course.teacherId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            course: { id: course.id, title: course.title },
            teacher: { id: course.teacherId, profile: course.teacher?.profile || null },
            messages: []
          } as ChatSession;
        }).filter(Boolean) as ChatSession[];

        setSessions(mergedSessions);
        if (mergedSessions.length > 0) {
          setSelectedSession(mergedSessions[0] || null);
        }
      } else {
        // Teacher flow
        setSessions(dbSessions);
        
        const coursesRes = await coursesApi.getMyCourses();
        const courses = coursesRes.data?.courses || [];
        setTeacherCourses(courses);
        
        if (courses.length > 0) {
          const firstCourseId = courses[0]?.id;
          if (firstCourseId) setSelectedCourseId(firstCourseId);
        }
      }
    } catch (err) {
      console.error('Failed to fetch chat data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (sessionId: string, silent = false) => {
    try {
      const res = await chatApi.getMessages(sessionId, 0, 100);
      const newMessages = res.data?.messages?.reverse() || [];
      
      setMessages(prev => {
        // Only update state if the messages actually changed (to prevent aggressive auto-scrolling)
        if (prev.length === newMessages.length && 
            prev[prev.length - 1]?.id === newMessages[newMessages.length - 1]?.id) {
          return prev;
        }
        return newMessages;
      });
    } catch (err) {
      if (!silent) console.error('Failed to fetch messages:', err);
    }
  };

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedSession) return;
    
    try {
      let activeSessionId = selectedSession.id;
      
      // Auto-create session if it's virtual
      if (activeSessionId.startsWith('virtual_')) {
        const res = await chatApi.createSession(
          currentUserId, 
          selectedSession.teacherId, 
          selectedSession.courseId
        );
        if (res.data?.session) {
          activeSessionId = res.data.session.id;
          setSelectedSession(res.data.session);
          
          // Update the virtual session in the list with the real one
          setSessions(prev => prev.map(s => s.id === selectedSession.id ? res.data!.session : s));
          
          // Join the newly created room
          if (socket) {
            socket.emit('join_room', activeSessionId);
          }
        }
      }

      // We only fire sendMessage API now. The socket event 'new_message' will update our UI 
      // automatically when the server broadcasts it.
      await chatApi.sendMessage(activeSessionId, newMessage);
      setNewMessage('');
      
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const getOtherUser = (session: ChatSession) => {
    return role === 'STUDENT' ? session.teacher : session.student;
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading chat...</div>;
  }

  // Filter sessions for Teacher based on selected course, and sort by latest message
  const filteredSessions = role === 'TEACHER' && selectedCourseId
    ? sessions.filter(s => s.courseId === selectedCourseId)
    : [...sessions];
    
  const displayedSessions = filteredSessions.sort((a, b) => {
    const aTime = a.messages?.[0]?.createdAt ? new Date(a.messages[0].createdAt).getTime() : 0;
    const bTime = b.messages?.[0]?.createdAt ? new Date(b.messages[0].createdAt).getTime() : 0;
    return bTime - aTime;
  });

  return (
    <div className={styles.container}>
      {/* Sidebar: Session List */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>Chats</h2>
          
          {role === 'TEACHER' && (
            <select
              className={styles.courseSelect}
              value={selectedCourseId}
              onChange={(e) => {
                setSelectedCourseId(e.target.value);
                setSelectedSession(null);
              }}
            >
              {teacherCourses.length === 0 && <option value="">No courses created yet</option>}
              {teacherCourses.map(c => {
                const hasUnread = sessions.some(s => 
                  s.courseId === c.id && 
                  s.messages?.[0] && 
                  !s.messages[0].isRead && 
                  s.messages[0].senderId !== currentUserId
                );
                return (
                  <option key={c.id} value={c.id}>
                    {hasUnread ? '🟢 ' : ''}{c.title}
                  </option>
                );
              })}
            </select>
          )}
        </div>
        
        <div className={`${styles.sessionList} custom-scrollbar`}>
          {displayedSessions.length === 0 ? (
            <div className={styles.emptyState}>
              {role === 'STUDENT' ? 'No courses purchased yet.' : 'No student messages for this course.'}
            </div>
          ) : (
            displayedSessions.map((session) => {
              const otherUser = getOtherUser(session);
              const latestMessage = session.messages?.[0];
              const isUnread = latestMessage && !latestMessage.isRead && latestMessage.senderId !== currentUserId;
              
              return (
                <div
                  key={session.id}
                  onClick={() => setSelectedSession(session)}
                  className={`${styles.sessionItem} ${selectedSession?.id === session.id ? styles.sessionItemActive : ''}`}
                >
                  {role === 'STUDENT' ? (
                    <>
                      <div className={styles.sessionHeader}>
                        <span className={`${styles.sessionTitle} ${isUnread ? styles.sessionTitleUnread : styles.sessionTitleRead}`}>
                          {session.course?.title}
                        </span>
                        {isUnread && <span className={styles.unreadDot}></span>}
                      </div>
                      <div className={styles.sessionSubtitle}>
                        {otherUser?.profile?.firstName} {otherUser?.profile?.lastName}
                      </div>
                    </>
                  ) : (
                    <div className={styles.sessionHeader}>
                      <span className={`${styles.sessionTitle} ${isUnread ? styles.sessionTitleUnread : styles.sessionTitleRead}`}>
                        {otherUser?.profile?.firstName} {otherUser?.profile?.lastName}
                      </span>
                      {isUnread && <span className={styles.unreadDot}></span>}
                    </div>
                  )}
                  <div className={`${styles.sessionLatestMessage} ${isUnread ? styles.sessionLatestMessageUnread : styles.sessionLatestMessageRead}`}>
                    {latestMessage?.content || 'No messages yet...'}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Area: Chat Window */}
      <div className={styles.mainArea}>
        {/* Chat Background Pattern */}
        <div className={styles.bgPattern}></div>

        {selectedSession ? (
          <>
            {/* Chat Header */}
            <div className={styles.chatHeader}>
              <h2 className={styles.chatHeaderTitle}>
                {role === 'STUDENT' ? selectedSession.course?.title : `${getOtherUser(selectedSession)?.profile?.firstName} ${getOtherUser(selectedSession)?.profile?.lastName}`}
              </h2>
              <span className={styles.chatHeaderSubtitle}>
                {role === 'STUDENT' 
                  ? `with ${getOtherUser(selectedSession)?.profile?.firstName} ${getOtherUser(selectedSession)?.profile?.lastName}`
                  : `Course: ${selectedSession.course?.title}`
                }
              </span>
            </div>
            
            {/* Messages Area */}
            <div className={`${styles.messagesArea} custom-scrollbar`} ref={messagesContainerRef}>
              {messages.length === 0 ? (
                <div className={styles.sayHelloContainer}>
                  <span className={styles.sayHelloBadge}>
                    Say hello to start the conversation!
                  </span>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isMe = msg.senderId === currentUserId;
                  const currentMsgDate = new Date(msg.createdAt).toLocaleDateString();
                  const prevMsgDate = index > 0 ? new Date(messages[index - 1]?.createdAt || 0).toLocaleDateString() : null;
                  const showDateSeparator = currentMsgDate !== prevMsgDate;
                  
                  let displayDate = '';
                  if (showDateSeparator) {
                    const msgDateObj = new Date(msg.createdAt);
                    const today = new Date();
                    const yesterday = new Date(today);
                    yesterday.setDate(yesterday.getDate() - 1);
                    
                    if (currentMsgDate === today.toLocaleDateString()) {
                      displayDate = 'Today';
                    } else if (currentMsgDate === yesterday.toLocaleDateString()) {
                      displayDate = 'Yesterday';
                    } else {
                      displayDate = msgDateObj.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                    }
                  }

                  return (
                    <React.Fragment key={msg.id}>
                      {showDateSeparator && (
                        <div className={styles.dateSeparator}>
                          <span className={styles.dateSeparatorText}>{displayDate}</span>
                        </div>
                      )}
                      <div className={`${styles.messageRow} ${isMe ? styles.messageRowMe : styles.messageRowThem}`}>
                      <div className={`${styles.messageBubble} ${isMe ? styles.messageBubbleMe : styles.messageBubbleThem}`}>
                        {/* Chat tail decorative element */}
                        <div className={`${styles.messageTail} ${isMe ? styles.messageTailMe : styles.messageTailThem}`}>
                           <svg viewBox="0 0 8 13" width="8" height="13" fill="currentColor">
                             {isMe ? <path d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z" /> : <path d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z" transform="scale(-1, 1) translate(-8, 0)" />}
                           </svg>
                        </div>
                        <p className={styles.messageContent}>{msg.content}</p>
                        <div className={styles.messageFooter}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {isMe && msg.isRead && (
                            <span className={styles.readReceipt}>
                              <svg viewBox="0 0 16 15" width="16" height="15" fill="currentColor">
                                <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z" />
                              </svg>
                            </span>
                          )}
                        </div>
                      </div>
                      </div>
                    </React.Fragment>
                  );
                })
              )}
            </div>
            
            {/* Input Area */}
            <div className={styles.inputArea}>
              <form onSubmit={handleSendMessage} className={styles.inputForm}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message"
                  className={styles.messageInput}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className={styles.sendButton}
                >
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" style={{ transform: 'rotate(45deg)' }}>
                    <path d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z" />
                  </svg>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className={styles.emptyStateMain}>
            <div className={styles.emptyStateIcon}>
              <svg viewBox="0 0 100 100" width="80" height="80" opacity="0.4" fill="currentColor">
                <path d="M50 0C22.4 0 0 22.4 0 50c0 10.9 3.5 21 9.4 29.1l-6 17.5 18-5.9C29.1 96.5 39.1 100 50 100c27.6 0 50-22.4 50-50S77.6 0 50 0zm0 91.7c-9.1 0-17.7-2.8-24.8-7.8l-1.8-1.2-10.7 3.5 3.6-10.4-1.3-1.9C9.2 66.8 6.2 58.7 6.2 50 6.2 25.8 25.8 6.2 50 6.2s43.8 19.6 43.8 43.8S74.2 91.7 50 91.7z" />
                <path d="M72.9 66.2c-1.1-2.9-2.3-3-3.1-3.1-.8-.1-1.8-.1-2.8-.1s-2.7.4-4.1 1.9c-1.4 1.5-5.5 5.4-5.5 13.1s5.7 15.2 6.5 16.2 11.1 16.9 26.8 23.6c3.7 1.6 6.6 2.5 8.9 3.2 3.8 1.2 7.2 1 9.9.6 3-.4 9.1-3.7 10.4-7.3 1.3-3.6 1.3-6.7.9-7.3-.4-.7-1.4-1.1-3.1-1.9z" transform="scale(0.7) translate(20, 20)"/>
              </svg>
            </div>
            <h2 className={styles.emptyStateTitle}>Nama Wellness Chat</h2>
            <p className={styles.emptyStateSubtitle}>Select a course conversation to view messages</p>
          </div>
        )}
      </div>
    </div>
  );
}
