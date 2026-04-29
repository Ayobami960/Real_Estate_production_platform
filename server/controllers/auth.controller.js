import User from "../models/user.model.js";
import bcrypt from "bcryptjs"
import sendEmail from "../utils/sendEmail.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";


export const registerController = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(401).json({
                message: "User alrealy exists"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            isApproved: role === "seller" ? false : true,
            verificationToken
        })

        try {
            await sendEmail({
                email,
                subject: "Verify Your Email. Real Estate Platform",
                message: `<p>Your email verfication code is <strong>${verificationToken}</strong></p><p>Please enter this code on the verification page to activate your account</p>`
            })
        } catch (emailError) {
            return res.status(500).json({ message: "Failed to send verification email", error: emailError.message })
        }

        res.status(200).json({
            message: "User registered, Please check your emailfor the verification code.",
            user: {
                email: user.email,
                name: user.name,
                role: user.role
            }
        })
    } catch (error) {
        res.status(500).json({ message: "Server error!!!!", error })

    }
}



// login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        if (!user.isVerified) {
            return res.status(403).json({
                message: "Please verify your email or contact support"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        if (user.isBlocked) {
            return res.status(403).json({
                message: "Your account has been blocked by an admin. Please contact support."
            });
        }

        // token
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET_KEY, {
            expiresIn: "3d"
        });

        res.status(200).json({
            message: "Login successful",
            token,
            user
        });
    } catch (error) {
        res.status(500).json({ message: "Server error!!!!", error })
    }
}

// get profile
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(400).json({
                message: "User not found",
                success: false
            });
        }

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({ message: "Server error!!!!", error })
    }
}


// verify the email


export const verifyEmail = async (req, res) => {
    try {
        const { email, code } = req.body;
        if (!email || !code) {
            return res.status(400).json({
                message: "Email and code are required.",
                success: false
            });
        }

        const user = await User.findOne({email});

        if(!user) {
            return res.status(400).json({
                message: "User not found",
                success: false
            });
        }

        if (user.isVerified){
            return res.status(400).json({
                message: "Email alreadly verified.",
                success: true
            });
        }

        if (user.verificationToken !== code){
            return res.status(400).json({
                message: "invalid verfication code.",
                success: false
            });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();
        res.status(200).json({
             message: "Email verified successfully.",
             success: true
        })
    } catch (error) {
        res.status(500).json({ 
            message: "Server error!!!!", error,
            success: true
        })
    }
}

// forget password

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "No user found with that email address" });
        }

        const resetToken = crypto.randomBytes(20).toString("hex");
        const resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 mins

        user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
        user.resetPasswordExpire = resetPasswordExpire;
        await user.save();

        const clientUrl = "https://real-estate-production-platform.vercel.app";
        const resetUrl = `${clientUrl}/reset-password/${resetToken}`;
        const message = `
            <h2>Password Reset Request</h2>
            <p>You requested a password reset. Please click on the link below to reset your password:</p>
            <a href="${resetUrl}" clicktracking="off">${resetUrl}</a>
            <p>This link will expire in 15 minutes.</p>
        `;

        try {
            await sendEmail({
                email: user.email,
                subject: "Password Reset - Real Estate Platform",
                message,
            });
            res.status(200).json({ message: "Password reset email sent", success: true });
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            return res.status(500).json({ message: "Could not send email", success: false });
        }
    } catch (err) {
         res.status(500).json({ message: "Server error!!!!", err })
    }
};


// now to reset it (password)
export const resetPassword = async (req, res) => {
    try {
        const {token} = req.params;
        const {password} = req.body;
        const resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: {$gt: Date.now()},
        });

        if(!user) {
             return res.status(400).json({
                message: "Invalud or expired password reset token",
                success: false
            });
        }

        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({
            message: "Password updated successfully",
            success: true,
        });

    } catch (error) {
         res.status(500).json({ message: "Server error!!!!", error })
    }
}