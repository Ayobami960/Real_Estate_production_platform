import express from "express";
import { authorize, protect } from "../middlewares/auth.middleware.js";
import { approveSellers, blockUser, deletePorperty, deleteUser, getAllInquiries, getAllProperties, getAllUsers, getDashboardStats, getPendingSellers } from "../controllers/admin.controller.js";

const adminRoutes = express.Router();
adminRoutes.use(protect, authorize("admin"));

adminRoutes.get("/users", getAllUsers);
adminRoutes.patch("/users/:id/block", blockUser);

adminRoutes.delete("/users/:id", deleteUser);
adminRoutes.get("/properties", getAllProperties);

adminRoutes.delete("/properties/id", deletePorperty);
adminRoutes.get("/inquiries", getAllInquiries);

adminRoutes.get("/stats", getDashboardStats);

adminRoutes.get("/pending-sellers", getPendingSellers);
adminRoutes.patch("/approve-sellers/:id", approveSellers);



export default adminRoutes;