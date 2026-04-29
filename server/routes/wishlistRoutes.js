import express from "express";
import {  protect } from "../middlewares/auth.middleware.js";
import { addWishlist, getWishlist, removeWishlist } from "../controllers/wishlist.controller.js";

const wishlistRoutes = express.Router();

wishlistRoutes.post("/:propertyId", protect,  addWishlist);
wishlistRoutes.get("/", protect, getWishlist);
wishlistRoutes.delete("/:propertyId", protect, removeWishlist);





export default wishlistRoutes;