import nodemailer from "nodemailer";

const requiredVars = ["SMTP_HOST", "SMTP_PORT", "EMAIL_USER", "EMAIL_PASS"];
const missing = requiredVars.filter((key) => !process.env[key]);

if (missing.length > 0) {
    console.error(`Missing required email env vars: ${missing.join(", ")}`);
}

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465, // true only for port 465
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendEmail = async (options) => {
    if (missing.length > 0) {
        throw new Error(`Cannot send email — missing env vars: ${missing.join(", ")}`);
    }

    try {
        const mailOptions = {
            from: `"Real Estate Platform" <${process.env.EMAIL_USER}>`,
            to: options.email,
            subject: options.subject,
            html: options.message,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully via Nodemailer", info.messageId);
        return info;
    } catch (error) {
        console.error("Nodemailer Email Error", error.message);
        throw new Error(error.message || "Could not send email via Nodemailer");
    }
};

export default sendEmail;

// const sendEmail = async (options) => {
//     try {
//         const BREVO_API_KEY = process.env.BREVO_API_KEY?.trim();
//         if (!BREVO_API_KEY) {
//             console.error("Missing BREVO_API_KEY  in the .env file");
//             throw new Error("Missing Email Api Key")
//         }
//         const data = {
//             sender: {
//                 name: "Real EState Platform",
//                 email: process.env.EMAIL_USER
//             },
//             to: [{ email: options.email }],
//             subject: options.subject,
//             htmlContent: options.message
//         };
//         const response = await fetch("https://api.brevo.com/v3/smtp/email", {
//             method: "POST",
//             headers: {
//                 "api-key": BREVO_API_KEY,
//                 "Content-Type": "application/json",
//                 "Accept": "application/json"
//             },
//             body: JSON.stringify(data),
//         });

//         const result = await response.json();

//         if(response.ok) {
//             console.log("Email sent successfully via Brevo", result.messageId);
//         } else {
//             console.error("Brevo Api Key Error", result);
//             throw new Error(result.message || "Could not send email via Brevo");
//         }
//     } catch (error) {
//          console.error("Brevo Email Error", error.message);
//             throw new Error(error.message || "Could not send email via Brevo");
//     }
// }


// export default sendEmail;
