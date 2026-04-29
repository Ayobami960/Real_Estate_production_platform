import Inquiry from "../models/inquiry.model.js";
import Property from "../models/property.models.js";
import User from "../models/user.model.js"


// view all users
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.status(200).json({
            success: true,
            count: users.length,
            users
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Server error",
        });
    }
}

// Block a particular user
export const blockUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        user.isBlocked = !user.isBlocked
        await user.save();

        res.status(200).json({
            success: true,
            message: user.isBlocked ? "User Blocked" : "User Unblocked",
            isBlocked: user.isBlocked
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Server error",
        });
    }
}


// to delete a particular user
export const deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "User deleted successfully!",
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Server error",
        });
    }
}

// view all properties
export const getAllProperties = async (req, res) => {
    try {
        const properties = await Property.find().populate("seller", "name email");
        res.status(200).json({
            success: true,
            count: properties.length,
            properties
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Server error",
        });
    }
}



// delete a particular porperty
export const deletePorperty = async (req, res) => {
    try {
        await Property.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Property deleted successfully!",
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Server error",
        });
    }
}


export const getAllInquiries = async (req, res) => {
    try {
        const inquiries = await Inquiry.find()
        .populate("buyer", "name, email")
        .populate("seller", "name, email")
        .populate("property", "title price")
        .sort({ createdAt: -1 });


        res.status(200).json({
            success: true,
            count: inquiries.length,
            inquiries
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Server error",
        }); 
    }
}

// Dashboard analytics
export const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalProperties = await Property.countDocuments();

        const activeListings = await Property.countDocuments({
            status: "sale"
        });

        const soldProperties = await Property.countDocuments({
            status: "sold"
        })

        res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                totalProperties,
                activeListings,
                soldProperties,
            }
        })

    } catch (error) {
        
    }
}


// to get pending seller account
export const getPendingSellers = async (req, res) => {
    try {
        const pendingSellers = await User.find({
            role: "seller",
            isApproved: false
        }).select("-password");

        // if you are a seller you get approval from the admin panel
        res.status(200).json({
            success: true,
            count: pendingSellers.length,
            pendingSellers
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Server error",
        }); 
    }
}



// to get approve seller account
export const approveSellers = async (req, res) => {
    try {
        const seller = await User.findById(req.params.id); 

        if (!seller || seller.role !== "seller") { 
            return res.status(400).json({           
                success: false,
                message: "Seller not found or user is not a seller" 
            });
        }

        seller.isApproved = true;
        await seller.save();

        res.status(200).json({
            success: true,
            message: "Seller approved successfully",
            seller
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Server error",
        });
    }
};