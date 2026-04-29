import express from "express";
import { authorize, protect } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";
import { getSellerInquiry, marksRead, sendInquiry } from "../controllers/inquiry.controller.js";

const inquiryRoutes = express.Router();

inquiryRoutes.post("/", protect, authorize("buyer"), sendInquiry);
inquiryRoutes.get("/seller", protect, authorize("seller"), getSellerInquiry);
inquiryRoutes.patch("/:id/read", protect, marksRead);





export default inquiryRoutes;