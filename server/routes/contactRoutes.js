import express from "express";
import { authorize, protect } from "../middlewares/auth.middleware.js";
import { createContact, getAllContacts } from "../controllers/contact.controller.js";

const contactRoutes = express.Router();

contactRoutes.post("/",  createContact);
contactRoutes.get("/", protect, authorize("admin"), getAllContacts);

export default contactRoutes;