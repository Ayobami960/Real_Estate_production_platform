import express from "express";
import authRouter from "./authRoutes.js";
import userRouter from "./userRoutes.js";
import propertyRoutes from "./propertyRoutes.js";
import inquiryRoutes from "./inquiryRoutes.js";
import wishlistRoutes from "./wishlistRoutes.js";
import contactRoutes from "./contactRoutes.js";
import adminRoutes from "./adminRoutes.js";
import chatRoutes from "./chatRoutes.js";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/property", propertyRoutes);
router.use("/inquiries", inquiryRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/contact", contactRoutes);
router.use("/admin", adminRoutes);
router.use("/chat", chatRoutes);


export default router;