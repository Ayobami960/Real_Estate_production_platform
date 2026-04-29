import { useState } from 'react'
import { loginStyles as s } from '../../assets/dummyStyles'
import Navbar from '../../components/common/Navbar'
import { useAuth } from '../../context/AuthContent';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiEye, HiEyeOff } from 'react-icons/hi';
import {
    sanitizeInput,
    validateEmail,
    validateLoginPassword,
} from '../../utils/helper';


// ─── Component ────────────────────────────────────────────────────────────────

const Login = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Track which fields have been touched so errors only show after interaction
    const [touched, setTouched] = useState({
        email: false,
        password: false,
    });

    // Brute-force login attempt tracker
    const [loginAttempts, setLoginAttempts] = useState(0);
    const [isLocked, setIsLocked] = useState(false);
    const MAX_ATTEMPTS = 5;
    const LOCKOUT_DURATION_MS = 60 * 1000; // 1 minute

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;

        // ── Injection guard ──────────────────────────────────────────
        const sanitized = sanitizeInput(value);
        if (sanitized === null) {
            toast.error("⚠️ Invalid characters detected. Input not allowed.");
            return;
        }

        setFormData((prev) => ({ ...prev, [name]: sanitized }));
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // ── Lockout check ────────────────────────────────────────────
        if (isLocked) {
            toast.error("Too many failed attempts. Please wait 1 minute before trying again.");
            return;
        }

        // Mark all fields as touched so every error shows on submit
        setTouched({ email: true, password: true });

        // ── Run all validators ───────────────────────────────────────
        const emailError = validateEmail(formData.email);
        const passwordError = validateLoginPassword(formData.password);

        if (emailError) { toast.error(emailError); return; }
        if (passwordError) { toast.error(passwordError); return; }

        setIsLoading(true);

        try {
            const result = await login(formData.email, formData.password);

            if (result.success) {
                // Reset attempt counter on success
                setLoginAttempts(0);
                toast.success("Login successful! Redirecting...");

                const storedUser = JSON.parse(
                    localStorage.getItem("user") || sessionStorage.getItem("user")
                );

                setTimeout(() => {
                    if (storedUser?.role === "admin") {
                        navigate("/admin-dashboard");
                    } else if (storedUser?.role === "seller") {
                        navigate("/dashboard");
                    } else {
                        navigate("/");
                    }
                }, 1000);

            } else {
                // ── Track failed attempts ────────────────────────────
                const newAttempts = loginAttempts + 1;
                setLoginAttempts(newAttempts);

                const remaining = MAX_ATTEMPTS - newAttempts;

                if (newAttempts >= MAX_ATTEMPTS) {
                    setIsLocked(true);
                    toast.error("Too many failed attempts. Account locked for 1 minute.");

                    // Auto-unlock after lockout duration
                    setTimeout(() => {
                        setIsLocked(false);
                        setLoginAttempts(0);
                        toast.success("You can try logging in again.");
                    }, LOCKOUT_DURATION_MS);
                } else {
                    toast.error(
                        `${result.message || "Invalid email or password."} ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`
                    );
                }
            }
        } catch (err) {
            toast.error("Something went wrong. Please try again.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    // Inline error helpers (shown beneath each field after the user touches it)
    const emailError = touched.email ? validateEmail(formData.email) : null;
    const passwordError = touched.password ? validateLoginPassword(formData.password) : null;

    const FieldError = ({ message }) =>
        message ? (
            <p style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "4px" }}>
                {message}
            </p>
        ) : null;

    return (
        <section className={s.pageContainer}>
            <Navbar />
            <div className={s.containerCenter}>
                <div className={s.card}>
                    <h2 className={s.title}>Welcome Back</h2>
                    <p className={s.subtitle}>
                        Please enter your details to sign in
                    </p>

                    {/* Lockout warning banner */}
                    {isLocked && (
                        <div style={{
                            background: "#fef2f2",
                            border: "1px solid #fca5a5",
                            borderRadius: "8px",
                            padding: "10px 14px",
                            marginBottom: "16px",
                            color: "#dc2626",
                            fontSize: "0.8rem",
                            textAlign: "center",
                        }}>
                            🔒 Account temporarily locked. Please wait 1 minute before trying again.
                        </div>
                    )}

                    {/* Attempts warning */}
                    {!isLocked && loginAttempts > 0 && loginAttempts < MAX_ATTEMPTS && (
                        <div style={{
                            background: "#fffbeb",
                            border: "1px solid #fcd34d",
                            borderRadius: "8px",
                            padding: "10px 14px",
                            marginBottom: "16px",
                            color: "#b45309",
                            fontSize: "0.8rem",
                            textAlign: "center",
                        }}>
                            ⚠️ {MAX_ATTEMPTS - loginAttempts} login attempt{MAX_ATTEMPTS - loginAttempts === 1 ? "" : "s"} remaining before lockout.
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className={s.form} noValidate>

                        {/* ── Email ── */}
                        <div>
                            <label className={s.label}>Email Address</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="email@gmail.com"
                                value={formData.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                maxLength={60}
                                autoComplete="email"
                                className={s.input}
                                disabled={isLocked}
                            />
                            <FieldError message={emailError} />
                        </div>

                        {/* ── Password ── */}
                        <div>
                            <div className={s.passwordHeader}>
                                <label className={s.label}>Password</label>
                                <Link to="/forgot-password" className={s.forgotLink}>
                                    Forgot Password
                                </Link>
                            </div>
                            <div style={{ position: "relative" }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="**********"
                                    value={formData.password}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    maxLength={64}
                                    autoComplete="current-password"
                                    className={s.input}
                                    style={{ paddingRight: "40px" }}
                                    disabled={isLocked}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: "absolute",
                                        right: "12px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        color: "#6b7280",
                                        display: "flex",
                                        alignItems: "center",
                                        padding: 0,
                                    }}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
                                </button>
                            </div>
                            <FieldError message={passwordError} />
                        </div>

                        <button
                            className={s.submitButton}
                            type="submit"
                            disabled={isLoading || isLocked}
                        >
                            {isLoading ? "Signing in..." : isLocked ? "🔒 Locked" : "Login"}
                        </button>
                    </form>

                    <p className={s.footerText}>
                        Don't have an account{" "}
                        <Link to="/register" className={s.forgotLink}>
                            Create an account
                        </Link>
                    </p>
                </div>
            </div>
        </section>
    );
};

export default Login;


// import { useState } from 'react'
// import { loginStyles as s } from '../../assets/dummyStyles'
// import Navbar from '../../components/common/Navbar'
// import { useAuth } from '../../context/AuthContent';
// import { Link, useNavigate } from 'react-router-dom';
// import toast from 'react-hot-toast';
// import { HiEye, HiEyeOff } from 'react-icons/hi';

// const Login = () => {
//     const [formData, setFormData] = useState({
//         email: "",
//         password: "",
//     });

//     const [isLoading, setIsLoading] = useState(false);
//     const [showPassword, setShowPassword] = useState(false);

//     const { login } = useAuth();
//     const navigate = useNavigate();


//     // to handlechange for nput value
//     const handleChange = (e) => {
//         setFormData({ ...formData, [e.target.name]: e.target.value });

//     }


//     // to submit the data to login
//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         // 1. Basic Validation check before hitting the DB
//         if (!formData.email || !formData.password) {
//             return toast.error("Please fill in all fields");
//         }

//         setIsLoading(true);

//         const result = await login(formData.email, formData.password);
//         if (result.success) {
//             const storedUser = JSON.parse(
//                 localStorage.getItem("user") || sessionStorage.getItem("user"),
//             );
//             if (storedUser?.role === "admin") {
//                 navigate("/admin-dashboard");
//             } else if (storedUser?.role === "seller") {
//                 navigate("/dashboard");
//             } else {
//                 navigate("/");
//             }
//         } else {
//             toast.error(result.message || "Failed to Login");
//         }

//         setIsLoading(false);
//     };

//     return (
//         <section className={s.pageContainer}>
//             <Navbar />
//             <div className={s.containerCenter}>
//                 <div className={s.card}>
//                     <h2 className={s.title}>Welcome Back</h2>
//                     <p className={s.subtitle}>
//                         Please enter your details to sign in
//                     </p>

//                     <form onSubmit={handleSubmit} className={s.form}>


//                         <div>
//                             <label className={s.label}>Email Address</label>
//                             <input
//                                 type="text"
//                                 name='email'
//                                 placeholder='email@gmail.com'
//                                 value={formData.email}
//                                 onChange={handleChange}
                                
//                                 className={s.input}
//                             />
//                         </div>

//                         <div>
//                             <div className={s.passwordHeader}>
//                             <label className={s.label}>Password</label>
//                            <Link to="/forgot-password" className={s.forgotLink}>Forgot Password</Link>
//                         </div>
//                          <div style={{ position: "relative" }}>
//                                 <input
//                                     type={showPassword ? "text" : "password"}
//                                     name="password"
//                                     placeholder='**********'
//                                     value={formData.password}
//                                     onChange={handleChange}
//                                     className={s.input}
//                                     style={{ paddingRight: "40px" }}
                                   
//                                 />

//                                 <button
//                                     type="button"
//                                     onClick={() => setShowPassword(!showPassword)}
//                                     style={{
//                                         position: "absolute",
//                                         right: "12px",
//                                         top: "50%",
//                                         transform: "translateY(-50%)",
//                                         background: "none",
//                                         border: "none",
//                                         cursor: "pointer",
//                                         color: "#6b7280",
//                                         display: "flex",
//                                         alignItems: "center",
//                                         padding: 0
//                                     }}
//                                 >
//                                     {showPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
//                                 </button>
//                             </div>
//                         </div>


//                         <button
//                             className={s.submitButton}
//                             type='submit'
//                             disabled={isLoading}
//                         >
//                             {isLoading ? "Login Account..." : "Login"}
//                         </button>
//                     </form>

//                     <p className={s.footerText}>
//                         Don't have an account {" "}
//                         <Link to="/register" className={s.forgotLink}>
//                             Create an account
//                         </Link>
//                     </p>
//                 </div>
//             </div>
//         </section>
//     )
// }

// export default Login