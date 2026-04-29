import express from "express";
import { authorize, protect } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";
import { addProperty, deleteProperty, getAllProperties, getMyProperties, getPropertyCounts, getPropertyDetails, getSellerDashboard, updateProperty, updatePropertyStatus } from "../controllers/property.controller.js";

const propertyRoutes = express.Router();

propertyRoutes.get("/", getAllProperties);
propertyRoutes.post("/", protect, authorize("seller"), upload.array("images", 10), addProperty);
propertyRoutes.get("/my", protect, authorize("seller"), getMyProperties);
propertyRoutes.put("/:id", protect, authorize("seller"), upload.array("images", 10), updateProperty);


propertyRoutes.delete("/:id", protect, authorize("seller"), deleteProperty);
propertyRoutes.patch("/:id/status", protect, authorize("seller"), updatePropertyStatus);

propertyRoutes.get("/counts",  getPropertyCounts);
propertyRoutes.get("/:id",  getPropertyDetails);
propertyRoutes.get("/seller/dashboard", protect, authorize("seller"), getSellerDashboard);





export default propertyRoutes;