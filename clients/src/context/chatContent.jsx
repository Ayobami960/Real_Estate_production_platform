import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthContent";
import { io } from "socket.io-client";
import { API_URL } from "../config";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const { user } = useAuth();

    const [socket, setSocket] = useState(null);
    const [activeChat, setActiveChat] = useState(null);
    const [notifications, setNotifications] = useState([]); // ✅ fix: [] not null
    const activeChatRef = useRef(null);

    useEffect(() => {
        activeChatRef.current = activeChat;
    }, [activeChat]);

    // Reset state on user change
    useEffect(() => {
        setActiveChat(null);
        setNotifications([]);
    }, [user]);

    // Socket connection
    useEffect(() => {
        if (user) {
            const newSocket = io(API_URL, {
                transports: ["websocket"],
                reconnection: true,
            });

            setSocket(newSocket);

            newSocket.on("receiveMessage", (data) => {
                // Only add notification if not in active chat
                if (activeChatRef.current?._id !== data.chatId) {
                    setNotifications((prev) => [...prev, data]);
                }
            });

            // Listen for message edits
            newSocket.on("messageEdited", (data) => {
                // Handled in ChatMessages component via socket
            });

            // Listen for message deletions
            newSocket.on("messageDeleted", (data) => {
                // Handled in ChatMessages component via socket
            });

            return () => newSocket.close();
        }
    }, [user]);

    const joinChat = (chatId) => {
        if (socket) socket.emit("joinChat", chatId);
    };

    const sendMessage = (chatId, messageObj) => {
        if (socket && user) {
            socket.emit("sendMessage", { ...messageObj, chatId });
        }
    };

    const emitEditMessage = (chatId, messageId, newText) => {
        if (socket) {
            socket.emit("editMessage", { chatId, messageId, newText });
        }
    };

    const emitDeleteMessage = (chatId, messageId, deleteFor) => {
        if (socket) {
            socket.emit("deleteMessage", { chatId, messageId, deleteFor });
        }
    };

    return (
        <ChatContext.Provider value={{
            socket,
            activeChat,
            setActiveChat,
            joinChat,
            sendMessage,
            emitEditMessage,
            emitDeleteMessage,
            notifications,
            setNotifications,
        }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => useContext(ChatContext);


// import { createContext, useContext, useEffect, useRef, useState } from "react";
// import { useAuth } from "./AuthContent";
// import {io} from "socket.io-client";
// import { API_URL } from "../config";

// const ChatContext = createContext();

// export const ChatProvider = ({children}) => {
//     const {user} = useAuth();

//     const [socket, setSocket] = useState(null);
//     const [activeChat, setActiveChat] = useState(null);
//     const [notifications, setNotifications] = useState(null);
//     const activeChatRef = useRef(null);

//     useEffect(() => {
//         activeChatRef.current = activeChat;
//     }, [activeChat]);

//     useEffect(() => {
//         setActiveChat(null);
//         setNotifications([]);
//     }, [user])

//     useEffect(() => {
//         if(user){
//             const newSocket = io(API_URL);

//             setSocket(newSocket);

//             newSocket.on("receiveMessage", (data) => {
//                 if(activeChatRef.current?._id !== data.chatId){
//                     setNotifications((prev) => [...prev, data])

//                 }
//             });

//             return () => newSocket.close();
//         }
//     },[user]);

//     // to join a chat
//     const joinChat = (chatId) => {
//         if (socket) {
//             socket.emit("joinChat", chatId);
//         }
//     };

//     // const sendMessage = (
//     //     chatId,
//     //     text,
//     //     messageId = null,
//     //     createdAt = new Date(),
//     //     image = null
//     //   )  => {
//     //     if(socket && user) {
//     //         const messageData = {
//     //             chatId,
//     //             sender: user._id,
//     //             text,
//     //             image,
//     //             createdAt,
//     //             _id: messageId   
//     //         };

//     //         socket.emit("sendMessage", messageData);
//     //         return messageData;
//     //     }
//     //     return null;
//     // }


//     const sendMessage = (chatId, messageObj) => {
//     if (socket && user) {
//         // Just emit the full message object saved from the DB
//         const messageData = {
//             ...messageObj,
//             chatId: chatId
//         };
//         socket.emit("sendMessage", messageData);
//     }
// };


//     return (
//         <ChatContext.Provider value={{
//             socket,
//             activeChat,
//             setActiveChat,
//             joinChat,
//             sendMessage,
//             notifications,
//             setNotifications,
//             }}>
//             {children}
//         </ChatContext.Provider>
//     )
// }

// export const useChat = () => useContext(ChatContext);