import express from "express";
import Chat from "../models/chat.model.js";
import { protect } from "../middlewares/auth.middleware.js";

const chatRoutes = express.Router();
chatRoutes.use(protect);

// ── Start or find existing chat ───────────────────────────────────────────────
chatRoutes.post("/start", async (req, res) => {
    try {
        const { propertyId, sellerId, buyerId: providedBuyerId } = req.body;
        const buyerId = req.user.role === "seller" ? providedBuyerId : req.user._id;
        const finalSellerId = req.user.role === "seller" ? req.user._id : sellerId;

        if (!buyerId || !finalSellerId) {
            return res.status(400).json({ message: "Missing buyer or seller ID" });
        }

        let chat = await Chat.findOne({ buyer: buyerId, seller: finalSellerId });

        if (!chat) {
            chat = await Chat.create({ // ✅ Chat.create not chat.create
                property: propertyId,
                buyer: buyerId,
                seller: finalSellerId,
                messages: []
            });
        }

        const populatedChat = await Chat.findById(chat._id)
            .populate("buyer", "name email profilePic")
            .populate("seller", "name email profilePic")
            .populate("property", "title price images");

        res.status(200).json(populatedChat);
    } catch (error) {
        res.status(500).json({ message: "Failed to start chat", error });
    }
});

// ── Send a message ────────────────────────────────────────────────────────────
chatRoutes.post("/send", async (req, res) => {
    try {
        const { chatId, text, image } = req.body;
        const userId = req.user._id;

        const chat = await Chat.findById(chatId);
        if (!chat) return res.status(404).json({ message: "Chat not found" });

        if (chat.buyer.toString() !== userId.toString() &&
            chat.seller.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        const newMessage = { sender: userId, text, image, createdAt: new Date() };
        chat.messages.push(newMessage);
        await chat.save();

        const savedMessage = chat.messages[chat.messages.length - 1];
        res.status(200).json({ chat, newMessage: savedMessage });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

// ── Edit a message (WhatsApp-style) ──────────────────────────────────────────
chatRoutes.patch("/:chatId/message/:messageId", async (req, res) => {
    try {
        const userId = req.user._id;
        const { text } = req.body;

        const chat = await Chat.findById(req.params.chatId);
        if (!chat) return res.status(404).json({ message: "Chat not found" });

        const message = chat.messages.id(req.params.messageId);
        if (!message) return res.status(404).json({ message: "Message not found" });

        // Only sender can edit their message
        if (message.sender.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Not authorized to edit this message" });
        }

        message.text = text;
        message.edited = true; // ✅ mark as edited
        await chat.save();

        res.status(200).json({ message: "Message edited", updatedMessage: message });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

// ── Delete a message (for me OR everyone) ────────────────────────────────────
chatRoutes.delete("/:chatId/message/:messageId", async (req, res) => {
    try {
        const userId = req.user._id;
        const { deleteFor } = req.body; // "me" | "everyone"

        const chat = await Chat.findById(req.params.chatId);
        if (!chat) return res.status(404).json({ message: "Chat not found" });

        const message = chat.messages.id(req.params.messageId);
        if (!message) return res.status(404).json({ message: "Message not found" });

        if (deleteFor === "everyone") {
            // Only sender can delete for everyone
            if (message.sender.toString() !== userId.toString()) {
                return res.status(403).json({ message: "Only sender can delete for everyone" });
            }
            // Replace text with deleted marker — WhatsApp style
            message.text = null;
            message.image = null;
            message.deletedForEveryone = true;
        } else {
            // Delete for me — add userId to deletedFor array
            if (!message.deletedFor) message.deletedFor = [];
            if (!message.deletedFor.includes(userId)) {
                message.deletedFor.push(userId);
            }
        }

        await chat.save();
        res.status(200).json({ message: "Message deleted", chat });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

// ── Get all chats for current user ───────────────────────────────────────────
chatRoutes.get("/user", async (req, res) => {
    try {
        const userId = req.user._id;
        const chats = await Chat.find({ $or: [{ buyer: userId }, { seller: userId }] })
            .populate("buyer", "name email profilePic")
            .populate("seller", "name email profilePic")
            .populate("property", "title price images")
            .sort({ updatedAt: -1 });

        res.status(200).json(chats);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

// ── Get a single chat with messages ──────────────────────────────────────────
chatRoutes.get("/:chatId", async (req, res) => {
    try {
        const userId = req.user._id.toString();

        const chat = await Chat.findById(req.params.chatId)
            .populate("messages.sender", "name profilePic")
            .populate("buyer", "name email profilePic")
            .populate("seller", "name email profilePic")
            .populate("property", "title price images");

        if (!chat) return res.status(404).json({ message: "Chat not found" });

        // ✅ fix: toSting → toString
        if (chat.buyer._id.toString() !== userId && chat.seller._id.toString() !== userId) {
            return res.status(403).json({ message: "Not authorized" });
        }

        res.status(200).json({ chat });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

// ── Delete entire chat ────────────────────────────────────────────────────────
chatRoutes.delete("/:chatId", async (req, res) => { // ✅ fix: GET → DELETE
    try {
        const userId = req.user._id;
        const chat = await Chat.findById(req.params.chatId); // ✅ fix: chatId not id

        if (!chat) return res.status(404).json({ message: "Chat not found" });

        if (chat.buyer.toString() !== userId.toString() &&
            chat.seller.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        await Chat.findByIdAndDelete(req.params.chatId);
        res.status(200).json({ message: "Chat deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

export default chatRoutes;


// import express from "express";
// import Chat from "../models/chat.model.js";
// import { protect } from "../middlewares/auth.middleware.js";

// const chatRoutes = express.Router();

// chatRoutes.use(protect);

// // chatRoutes.post("/start", async (req, res) => {
// //     try {
// //         const { propertyId, sellerId, buyerId: providedBuyerId } = req.body;
// //         let buyerId, finalSellerId;
// //         if (req.user.role === "seller") {
// //             buyerId = providedBuyerId;
// //             finalSellerId = req.user._id;
// //         } else {
// //             buyerId = req.user._id;
// //             finalSellerId = sellerId;
// //         }

// //         if (!buyerId || !finalSellerId) {
// //             return res.status(400).json({
// //                 message: "Missing buyer or seller Id"
// //             })
// //         }

// //         // check fr an exisint chat ntw this buyer and seller
// //         let chat = await Chat.findOne({
// //             buyer: buyerId,
// //             seller: finalSellerId
// //         });

// //         if (!chat) {
// //             chat = await chat.create({
// //                 property: propertyId,
// //                 buyer: buyerId,
// //                 seller: finalSellerId,
// //                 messages: []
// //             });
// //         }

// //         chat = await Chat.findById(chat._id)
// //             .populate("buyer", "name email profilePic")
// //             .populate("seller", "name email profilePic")
// //             .populate("property", "title price images")

// //         res.status(200).json(chat);



// //     } catch (error) {
// //         res.status(500).json({ message: "Server error!!!!", error })
// //     }
// // })

// chatRoutes.post("/start", async (req, res) => {
//     try {
//         const { propertyId, sellerId, buyerId: providedBuyerId } = req.body;
//         const buyerId = req.user.role === "seller" ? providedBuyerId : req.user._id;
//         const finalSellerId = req.user.role === "seller" ? req.user._id : sellerId;

//         let chat = await Chat.findOne({ buyer: buyerId, seller: finalSellerId });

//         if (!chat) {
//             // FIX: Use Chat.create (Model), not chat.create (instance)
//             chat = await Chat.create({
//                 property: propertyId,
//                 buyer: buyerId,
//                 seller: finalSellerId,
//                 messages: []
//             });
//         }

//         const populatedChat = await Chat.findById(chat._id)
//             .populate("buyer", "name email profilePic")
//             .populate("seller", "name email profilePic")
//             .populate("property", "title price images")

//         res.status(200).json(populatedChat);
//     } catch (error) {
//         res.status(500).json({ message: "Failed to start chat", error });
//     }
// });

// chatRoutes.post("/send", async (req, res) => {
//     try {
//         const { chatId, text, image } = req.body;
//         const userId = req.user.id;

//         const chat = await Chat.findById(chatId);
//         if (!chat) return res.status(404).json({
//             message: "Chat not found"
//         });

//         // ensure  sender is part of this chat
//         if (chat.buyer.toString() !== userId && chat.seller.toString() != userId) {
//             return res.status(403).json({
//                 message: "Not authorized to send message in this chat"
//             });
//         }

//         const newMessage = {
//             sender: userId,
//             text,
//             image,
//             createdAt: new Date()
//         };

//         chat.messages.push(newMessage);
//         await chat.save();

//         const saveMessage = chat.messages[chat.messages.length - 1];
//         res.status(200).json({ chat, newMessage: saveMessage })
//     } catch (error) {
//         res.status(500).json({ message: "Server error!!!!", error })
//     }
// });

// // to get chats for user
// chatRoutes.get("/user", async (req, res) => {
//     try {
//         const userId = req.user._id;
//         const chats = await Chat.find({
//             $or: [{ buyer: userId }, { seller: userId }]
//         })
//             .populate("buyer", "name email profilePic")
//             .populate("seller", "name email profilePic")
//             .populate("property", "title price images")
//             .sort({ updatedAt: -1 });

//         // Return the array directly to match your frontend logic
//         res.status(200).json(chats);
//     } catch (error) {
//         res.status(500).json({ message: "Server error", error });
//     }
// });

// // get chat
// chatRoutes.get("/:chatId", async (req, res) => {
//     try {
//         const chat = await Chat.findById(req.params.chatId).populate(
//             "messages.sender",
//             "name profilePic"
//         );

//         if (!chat) return res.status(400).json({
//             message: "Chat not found"
//         })

//         const userId = req.user._id.toString();
//         if (chat.buyer.toSting() !== userId && chat.seller.toString() !== userId) {
//             return res.status(403).json({
//                 message: "You are not authorized"
//             })
//         }


//         res.status(200).json({ chat })

//     } catch (error) {
//         res.status(500).json({ message: "Server error!!!!", error })
//     }
// })


// // delete chat
// chatRoutes.get("/:id", async (req, res) => {
//     try {
//         const userId = req.user._id;
//         const chat = await Chat.findById(req.params.chatId);

//         if (!chat) return res.status(404).json({ message: "Chat not found" });

//         // now we ensure the user is part of the chat
//         if ((chat.buyer.toString() !== userId.toString() &&
//             chat.seller.toString() !== userId.toString())) {
//             return res.status(403).json({ message: "Not Authorized" })
//         }

//         await Chat.findByIdAndDelete(req.params.chatId);
//         res.status(200).json({ message: "Chat deleted successfuly" })
//     } catch (error) {
//         res.status(500).json({ message: "Server error!!!!", error })
//     }
// })

// // to delete a specific message from the chat
// chatRoutes.delete("/:chatId/message/:messageId", async (req, res) => {
//     try {
//         const userId = req.user._id;
//         const chat = await Chat.findById(req.params.chatId);

//         if (!chat) {
//             return res.status(404).json({
//                 message: "Chat not found"
//             });
//         }

//         const message = chat.messages.id(req.params.messageId);
//         if (!message) {
//             res.status(404).json({
//                 message: "Message not found"
//             });
//         }

//         // only sender can delete thier message
//         if (message.sender.toString() !== userId.toString()) {
//             return res.status(404).json({
//                 message: "Not Authorized to delete this message"
//             });
//         }

//         chat.messages.pull(req.params.messageId);
//         await chat.save();
//         res.status(200).json({ message: "Message deleted successfuly" })
//     } catch (error) {
//         res.status(500).json({ message: "Server error!!!!", error })
//     }
// })


// export default chatRoutes