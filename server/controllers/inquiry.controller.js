import Inquiry from "../models/inquiry.model.js";
import Property from "../models/property.models.js";


export const sendInquiry = async (req, res) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                success: false,
                message: "Request body is required"
            });
        }

        const {propertyId, message} = req.body;

        if (!propertyId) {
            return res.status(400).json({
                success: false,
                message: "propertyId is required"
            });
        }
        const property = await Property.findById(propertyId).populate("seller");

       if (!property) {
            return res.status(404).json({
                success: false,
                message: "Property not found",
            });
        }

        const inquiry = await Inquiry.create({
            property: property._id,
            buyer: req.user._id,
            seller: property.seller._id,
            message
        });

         res.status(200).json({
            success: true,
            message: "Inquiry sent successfully",
            inquiry
        });
    } catch (error) {
         res.status(500).json({
            success: false,
            message: error.message || "Server error",
        });
    }
}


// seller view inquiries
export const getSellerInquiry = async (req, res) => {
    try {
        const inquiries = await Inquiry.find({
            seller: req.user._id
        })
        .populate("buyer", "name email phone")
        .populate("property", "title price images city")
        .sort({createdAt: -1})

         res.status(200).json({
            success: true,
            count: inquiries.length,
            inquiries
        });
    } catch (error) {
         res.status(500).json({
            success: false,
            message: error.message || "Server error",
        });
    }
}


// mark inquiries read
export const marksRead = async (req, res) => {
    try {
        const inquiry = await Inquiry.findById(req.params.id);
        if (!inquiry) {
            return res.status(404).json({
                success: false,
                message: "Inquiry not found",
            });
        }

        inquiry.isRead = true;
        await inquiry.save();


        res.status(200).json({
            success: true,
            message: "Marked as read"
        });

    } catch (error) {
          res.status(500).json({
            success: false,
            message: error.message || "Server error",
        });
    }
}