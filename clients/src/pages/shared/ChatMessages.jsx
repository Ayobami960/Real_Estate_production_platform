import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContent';
import { useChat } from '../../context/chatContent';
import { chatMessagesStyles as s } from '../../assets/dummyStyles';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config';
import Navbar from '../../components/common/Navbar';
import {
    HiOutlineChatAlt2,
    HiOutlineTrash,
    HiPaperAirplane,
    HiChevronLeft,
    HiOutlinePencilAlt,
    HiOutlineCheck,
    HiOutlineX,
} from 'react-icons/hi';

// ── Inline styles (only what can't be done with Tailwind classNames) ──────────
const inlineSt = {
    chatBg: {
        position: 'absolute',
        inset: 0,
        opacity: 0.04,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        pointerEvents: 'none',
    },
    bubbleWrapper: (isOwn) => ({
        display: 'flex',
        justifyContent: isOwn ? 'flex-end' : 'flex-start',
        marginBottom: '4px',
        position: 'relative',
    }),
    editInput: {
        background: 'none',
        border: 'none',
        outline: 'none',
        width: '100%',
        fontSize: '0.9rem',
        fontFamily: 'inherit',
        resize: 'none',
        lineHeight: 1.5,
        color: 'inherit',
    },
    editActions: {
        display: 'flex',
        gap: '4px',
        marginTop: '4px',
        justifyContent: 'flex-end',
    },
    editBtn: (color) => ({
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: color,
        padding: '4px 6px',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        gap: '2px',
        fontSize: '0.75rem',
        fontFamily: 'inherit',
    }),
    bubbleActions: (isOwn) => ({
        position: 'absolute',
        top: '4px',
        ...(isOwn ? { left: '-96px' } : { right: '-44px' }),
        display: 'flex',
        gap: '4px',
        opacity: 0,
        transition: 'opacity 0.2s',
        background: '#fff',
        borderRadius: '8px',
        padding: '3px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        zIndex: 10,
    }),
    bubbleActionBtn: (color) => ({
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: color || '#54656f',
        padding: '4px',
        display: 'flex',
        alignItems: 'center',
        borderRadius: '4px',
    }),

    // ── Delete modal ──────────────────────────────────────────────────────────
    modalOverlay: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(4px)',
        zIndex: 3000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
    },
    modalBox: {
        background: '#fff',
        borderRadius: '16px',
        padding: '28px 24px 20px',
        width: '100%',
        maxWidth: '360px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        animation: 'modalPop 0.2s ease',
    },
    modalIcon: {
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        background: '#fef2f2',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '4px',
        alignSelf: 'center',
    },
    modalTitle: {
        fontSize: '1.05rem',
        fontWeight: 700,
        color: '#111b21',
        textAlign: 'center',
        margin: 0,
    },
    modalSubtitle: {
        fontSize: '0.825rem',
        color: '#8696a0',
        textAlign: 'center',
        margin: '0 0 8px',
        lineHeight: 1.5,
    },
    modalDivider: {
        height: '1px',
        background: '#f0f2f5',
        margin: '4px 0',
    },
    modalBtn: (variant) => ({
        width: '100%',
        padding: '12px',
        borderRadius: '10px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: 600,
        fontFamily: 'inherit',
        transition: 'background 0.15s',
        ...(variant === 'danger'
            ? { background: '#fef2f2', color: '#ef4444' }
            : variant === 'warning'
            ? { background: '#fff7ed', color: '#f59e0b' }
            : { background: '#f0f2f5', color: '#54656f' }),
    }),
};

// ── Helper ────────────────────────────────────────────────────────────────────
const getChatPartner = (chat, userId) => {
    if (!chat || !userId) return null;
    const buyerId = (chat.buyer?._id || chat.buyer)?.toString();
    return userId.toString() === buyerId ? chat.seller : chat.buyer;
};

// ── Delete Modal Component ────────────────────────────────────────────────────
const DeleteMessageModal = ({ isOwn, onDeleteForMe, onDeleteForEveryone, onClose }) => (
    <div style={inlineSt.modalOverlay} onClick={onClose}>
        <div style={inlineSt.modalBox} onClick={(e) => e.stopPropagation()}>
            {/* Icon */}
            <div style={inlineSt.modalIcon}>
                <HiOutlineTrash size={22} color="#ef4444" />
            </div>

            {/* Title */}
            <p style={inlineSt.modalTitle}>Delete Message</p>
            <p style={inlineSt.modalSubtitle}>
                {isOwn
                    ? 'Choose how you want to delete this message.'
                    : 'This message will be removed from your view only.'}
            </p>

            <div style={inlineSt.modalDivider} />

            {/* Delete for everyone — only sender can do this */}
            {isOwn && (
                <button
                    style={inlineSt.modalBtn('danger')}
                    onClick={onDeleteForEveryone}
                >
                    🗑 Delete for Everyone
                </button>
            )}

            {/* Delete for me */}
            <button
                style={inlineSt.modalBtn('warning')}
                onClick={onDeleteForMe}
            >
                🙈 Delete for Me
            </button>

            {/* Cancel */}
            <button
                style={inlineSt.modalBtn('cancel')}
                onClick={onClose}
            >
                Cancel
            </button>
        </div>
    </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const ChatMessages = () => {
    const { user, token } = useAuth();
    const location = useLocation();
    const {
        socket, activeChat, setActiveChat,
        joinChat, sendMessage, emitEditMessage, emitDeleteMessage,
    } = useChat();

    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState('');

    // ✅ Modal state instead of context menu
    const [deleteModal, setDeleteModal] = useState(null); // { messageId, isOwn }

    const messagesEndRef = useRef(null);
    const userId = user?._id?.toString();

    const scrollToBottom = () =>
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    // ── Fetch conversations ───────────────────────────────────────────────────
    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const res = await axios.get(`${API_URL}/chat/user`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const fetched = Array.isArray(res.data) ? res.data : [];
                setConversations(fetched);
                if (location.state?.chat) {
                    const existing = fetched.find(c => c._id === location.state.chat._id);
                    setActiveChat(existing || location.state.chat);
                }
            } catch (err) {
                console.error('Fetch conversations error:', err);
                setConversations([]);
            } finally {
                setLoading(false);
            }
        };
        if (token) fetchConversations();
    }, [token, location.state, setActiveChat]);

    // ── Fetch messages when chat selected ────────────────────────────────────
    useEffect(() => {
        if (!activeChat?._id) return;
        const fetchMessages = async () => {
            try {
                const res = await axios.get(`${API_URL}/chat/${activeChat._id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const msgs = res.data.chat?.messages || res.data.messages || [];
                setMessages(Array.isArray(msgs) ? msgs : []);
                joinChat(activeChat._id);
            } catch (err) {
                console.error('Fetch messages error:', err);
                setMessages([]);
            }
        };
        fetchMessages();
    }, [activeChat?._id, token, joinChat]);

    // ── Socket listeners ──────────────────────────────────────────────────────
    useEffect(() => {
        if (!socket) return;
        const onReceive = (data) => {
            if (activeChat && data.chatId === activeChat._id)
                setMessages(prev => [...prev, data]);
            setConversations(prev => prev.map(c =>
                c._id === data.chatId
                    ? { ...c, messages: [...(c.messages || []), data] }
                    : c
            ));
        };
        const onEdited = ({ chatId, messageId, newText }) => {
            if (activeChat?._id === chatId)
                setMessages(prev => prev.map(m =>
                    (m._id || m.id) === messageId ? { ...m, text: newText, edited: true } : m
                ));
        };
        const onDeleted = ({ chatId, messageId, deleteFor }) => {
            if (activeChat?._id === chatId)
                setMessages(prev => prev.map(m => {
                    if ((m._id || m.id) !== messageId) return m;
                    if (deleteFor === 'everyone')
                        return { ...m, text: null, image: null, deletedForEveryone: true };
                    return { ...m, deletedFor: [...(m.deletedFor || []), userId] };
                }));
        };
        socket.on('receiveMessage', onReceive);
        socket.on('messageEdited', onEdited);
        socket.on('messageDeleted', onDeleted);
        return () => {
            socket.off('receiveMessage', onReceive);
            socket.off('messageEdited', onEdited);
            socket.off('messageDeleted', onDeleted);
        };
    }, [socket, activeChat, userId]);

    useEffect(() => { scrollToBottom(); }, [messages]);

    // ── Send ──────────────────────────────────────────────────────────────────
    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeChat) return;
        const text = newMessage.trim();
        setNewMessage('');
        try {
            const res = await axios.post(
                `${API_URL}/chat/send`,
                { chatId: activeChat._id, text },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const saved = res.data.newMessage || res.data;
            setMessages(prev => [...prev, saved]);
            sendMessage(activeChat._id, saved);
        } catch (err) { console.error('Send error:', err); }
    };

    // ── Edit ──────────────────────────────────────────────────────────────────
    const handleEditSave = async (messageId) => {
        if (!editText.trim()) return;
        try {
            await axios.patch(
                `${API_URL}/chat/${activeChat._id}/message/${messageId}`,
                { text: editText },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessages(prev => prev.map(m =>
                (m._id || m.id) === messageId ? { ...m, text: editText, edited: true } : m
            ));
            emitEditMessage(activeChat._id, messageId, editText);
            setEditingId(null);
            setEditText('');
        } catch (err) { console.error('Edit error:', err); }
    };

    // ── Delete message ────────────────────────────────────────────────────────
    const handleDeleteMessage = async (deleteFor) => {
        if (!deleteModal) return;
        const { messageId } = deleteModal;
        try {
            await axios.delete(
                `${API_URL}/chat/${activeChat._id}/message/${messageId}`,
                { headers: { Authorization: `Bearer ${token}` }, data: { deleteFor } }
            );
            setMessages(prev => prev.map(m => {
                if ((m._id || m.id) !== messageId) return m;
                if (deleteFor === 'everyone')
                    return { ...m, text: null, image: null, deletedForEveryone: true };
                return { ...m, deletedFor: [...(m.deletedFor || []), userId] };
            }));
            emitDeleteMessage(activeChat._id, messageId, deleteFor);
        } catch (err) { console.error('Delete error:', err); }
        finally { setDeleteModal(null); }
    };

    // ── Delete chat ───────────────────────────────────────────────────────────
    const handleDeleteChat = async (e, chatId) => {
        e.stopPropagation();
        if (!window.confirm('Delete this conversation?')) return;
        try {
            await axios.delete(`${API_URL}/chat/${chatId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setConversations(prev => prev.filter(c => c._id !== chatId));
            if (activeChat?._id === chatId) setActiveChat(null);
        } catch (err) { console.error('Delete chat error:', err); }
    };

    // ── Render ────────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className={s.loaderFullPage}>
                <div className={s.loader}></div>
            </div>
        );
    }

    const partner = activeChat ? getChatPartner(activeChat, userId) : null;
    const isSeller = user?.role === 'seller';

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
                @keyframes modalPop {
                    from { opacity: 0; transform: scale(0.92) translateY(8px); }
                    to   { opacity: 1; transform: scale(1)    translateY(0);   }
                }
                .conv-item-group:hover .del-chat-btn { opacity: 1 !important; }
                .msg-wrapper:hover .msg-actions      { opacity: 1 !important; }
                ::-webkit-scrollbar       { width: 5px; }
                ::-webkit-scrollbar-thumb { background: #c1c9d0; border-radius: 10px; }
            `}</style>

            {/* ── Page shell ── */}
            <div className={`${s.chatContainer} ${isSeller ? s.chatContainerSeller : s.chatContainerNonSeller}`}>
                {!isSeller && <Navbar />}

                {/* ── Chat wrapper ── */}
                <div className={s.chatWrapper}>

                    {/*  SIDEBAR  */}
                    <div className={`${s.sidebar} ${activeChat ? s.sidebarHidden : ''}`}>
                        <div className={s.sidebarHeader}>
                            <h2 className={s.sidebarTitle}>Messages</h2>
                            <span style={{ fontSize: '0.75rem', color: '#8696a0' }}>
                                {conversations.length} chats
                            </span>
                        </div>

                        <div className={s.sidebarContent}>
                            {conversations.length === 0 ? (
                                <div className={s.emptyConversations}>
                                    <HiOutlineChatAlt2 className={s.emptyIcon} />
                                    <p>No conversations yet</p>
                                </div>
                            ) : conversations.map(chat => {
                                const p = getChatPartner(chat, userId);
                                const lastMsg = chat.messages?.[chat.messages.length - 1];
                                const isActive = activeChat?._id === chat._id;
                                return (
                                    <div
                                        key={chat._id}
                                        className={`conv-item-group ${s.conversationItem} ${isActive ? s.conversationItemActive : ''}`}
                                        onClick={() => setActiveChat(chat)}
                                    >
                                        <div className={s.avatar}>
                                            {p?.profilePic
                                                ? <img src={p.profilePic} className={s.avatarImg} alt="" />
                                                : p?.name?.charAt(0)?.toUpperCase() || '?'}
                                        </div>
                                        <div className={s.conversationInfo}>
                                            <div className={s.conversationName}>{p?.name || 'Unknown'}</div>
                                            <div className={s.conversationPreview}>
                                                {lastMsg?.deletedForEveryone
                                                    ? '🚫 This message was deleted'
                                                    : lastMsg?.text || 'Started a conversation'}
                                            </div>
                                        </div>
                                        <button
                                            className={`del-chat-btn ${s.deleteChatButton}`}
                                            onClick={(e) => handleDeleteChat(e, chat._id)}
                                        >
                                            <HiOutlineTrash size={16} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/*  CHAT AREA  */}
                    {activeChat ? (
                        <div className={s.chatArea}>
                            <div style={inlineSt.chatBg} />

                            {/* Header */}
                            <div className={s.chatHeader}>
                                <div className={s.chatHeaderLeft}>
                                    <button className={s.backButton} onClick={() => setActiveChat(null)}>
                                        <HiChevronLeft size={22} />
                                    </button>
                                    <div className={s.avatar}>
                                        {partner?.profilePic
                                            ? <img src={partner.profilePic} className={s.avatarImg} alt="" />
                                            : partner?.name?.charAt(0)?.toUpperCase() || '?'}
                                    </div>
                                    <div className={s.chatPartnerName}>
                                        {partner?.name || 'Unknown'}
                                    </div>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className={s.messagesArea}>
                                {messages.map((msg, idx) => {
                                    const senderId = (msg.sender?._id || msg.sender)?.toString();
                                    const isOwn = senderId === userId;
                                    const isDeleted = !!msg.deletedForEveryone;
                                    const isDeletedForMe = msg.deletedFor?.map(String).includes(userId);
                                    const isEditing = editingId === (msg._id || msg.id);

                                    if (isDeletedForMe && !isDeleted) return null;

                                    return (
                                        <div
                                            key={msg._id || idx}
                                            className="msg-wrapper"
                                            style={inlineSt.bubbleWrapper(isOwn)}
                                        >
                                            <div
                                                className={`${s.messageBubble} ${isOwn ? s.messageOwn : s.messageOther}`}
                                                style={isDeleted ? { fontStyle: 'italic', opacity: 0.7 } : {}}
                                            >
                                                {/* Image */}
                                                {msg.image && !isDeleted && (
                                                    <div className={s.messageImageWrapper}>
                                                        <img src={msg.image} alt="ref" className={s.messageImage} />
                                                    </div>
                                                )}

                                                {/* Text or edit */}
                                                {isEditing ? (
                                                    <>
                                                        <textarea
                                                            style={inlineSt.editInput}
                                                            value={editText}
                                                            onChange={(e) => setEditText(e.target.value)}
                                                            autoFocus rows={2}
                                                        />
                                                        <div style={inlineSt.editActions}>
                                                            <button style={inlineSt.editBtn('#ef4444')} onClick={() => setEditingId(null)}>
                                                                <HiOutlineX size={13} /> Cancel
                                                            </button>
                                                            <button style={inlineSt.editBtn('#00a884')} onClick={() => handleEditSave(msg._id || msg.id)}>
                                                                <HiOutlineCheck size={13} /> Save
                                                            </button>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className={s.messageContent}>
                                                        <span className={s.messageText}>
                                                            {isDeleted ? '🚫 This message was deleted' : msg.text}
                                                            {msg.edited && !isDeleted && (
                                                                <span style={{ fontSize: '0.62rem', opacity: 0.6, marginLeft: '4px' }}>
                                                                    (edited)
                                                                </span>
                                                            )}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Timestamp */}
                                                <span className={s.messageTime}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], {
                                                        hour: '2-digit', minute: '2-digit',
                                                    })}
                                                </span>

                                                {/* ── Hover actions — own message ── */}
                                                {!isDeleted && !isEditing && isOwn && (
                                                    <div className="msg-actions" style={inlineSt.bubbleActions(true)}>
                                                        <button
                                                            style={inlineSt.bubbleActionBtn('#54656f')}
                                                            title="Edit"
                                                            onClick={() => { setEditingId(msg._id || msg.id); setEditText(msg.text); }}
                                                        >
                                                            <HiOutlinePencilAlt size={14} />
                                                        </button>
                                                        <button
                                                            style={inlineSt.bubbleActionBtn('#ef4444')}
                                                            title="Delete"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                // ✅ Open modal instead of context menu
                                                                setDeleteModal({ messageId: msg._id || msg.id, isOwn: true });
                                                            }}
                                                        >
                                                            <HiOutlineTrash size={14} />
                                                        </button>
                                                    </div>
                                                )}

                                                {/* ── Hover actions — other person's message ── */}
                                                {!isDeleted && !isEditing && !isOwn && (
                                                    <div className="msg-actions" style={inlineSt.bubbleActions(false)}>
                                                        <button
                                                            style={inlineSt.bubbleActionBtn('#ef4444')}
                                                            title="Delete for me"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                // ✅ Open modal
                                                                setDeleteModal({ messageId: msg._id || msg.id, isOwn: false });
                                                            }}
                                                        >
                                                            <HiOutlineTrash size={14} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <form className={s.messageForm} onSubmit={handleSend}>
                                <input
                                    type="text"
                                    className={s.messageInput}
                                    placeholder="Type a message…"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <button type="submit" className={s.sendButton}>
                                    <HiPaperAirplane className={s.sendIcon} size={20} />
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className={s.noChatSelected}>
                            <HiOutlineChatAlt2 className={s.noChatIcon} />
                            <h3 className={s.noChatTitle}>Your Messages</h3>
                            <p>Select a conversation to start chatting</p>
                        </div>
                    )}
                </div>
            </div>

            {/*  DELETE MESSAGE MODAL  */}
            {deleteModal && (
                <DeleteMessageModal
                    isOwn={deleteModal.isOwn}
                    onDeleteForMe={() => handleDeleteMessage('me')}
                    onDeleteForEveryone={() => handleDeleteMessage('everyone')}
                    onClose={() => setDeleteModal(null)}
                />
            )}
        </>
    );
};

export default ChatMessages;