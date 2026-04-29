import User from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";

export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");

        res.status(200).json({
            success: true,
            error: false,
            user
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Server error!!!!" || error,
            error: true,
            success: false
        })
    }
}


// to get puglic profile

export const getPublicProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("name profilePic role createdAt");
        if (!user) {
            return res.status(400).json({
                message: "User not found",
                success: false
            });
        }
        res.status(200).json({
            success: true,
            error: false,
            user
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Server error!!!!" || error,
            error: true,
            success: false
        })
    }
}


// update a profile
export const updateProfile = async (req, res) => {
    try {
        const {name, phone, address, removeProfilePic} = req.body;
        const user = await User.findById(req.user._id);
        
        if (!user) {
            return res.status(400).json({
                message: "User not found",
                success: false
            });
        }

        // image handleing
        if(req.file) {
            const result = await uploadToCloudinary(req.file.buffer, "profiles");
            user.profilePic = result.secure_url;
        } else if (removeProfilePic === "true") {
            user.profilePic = null;
        }

        if (name !== undefined) user.name = name;
        if (phone !== undefined) user.phone = phone;
        if (address !== undefined) user.address = address;

        const updatedUser = await user.save();

        res.status(200).json({
            message: "Profie Updated",
            success: true,
            error: false,
            user: updatedUser
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Server error!!!!" || error,
            error: true,
            success: false
        })
    }
}
