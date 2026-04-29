import { useState } from 'react'
import { registerStyles as s } from '../../assets/dummyStyles'
import Navbar from '../../components/common/Navbar'
import { useAuth } from '../../context/AuthContent';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiEye, HiEyeOff } from 'react-icons/hi';

// ── All validation & security logic lives in helper.js ──────────────────────
import {
    sanitizeInput,
    validateName,
    validateEmail,
    validateRegisterPassword,
    passwordStrengthRules,
} from '../../utils/helper';

// ─── Reusable inline field error ─────────────────────────────────────────────
const FieldError = ({ message }) =>
    message ? (
        <p style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "4px" }}>
            {message}
        </p>
    ) : null;

// ─── Component ────────────────────────────────────────────────────────────────
const Register = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "buyer",
    });

    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Track touched fields — errors only appear after the user has interacted
    const [touched, setTouched] = useState({
        name: false,
        email: false,
        password: false,
    });

    const { register } = useAuth();
    const navigate = useNavigate();

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleChange = (e) => {
        const { name, value } = e.target;

        const sanitized = sanitizeInput(value);
        if (sanitized === null) {
            toast.error("⚠️ Invalid characters detected. Input not allowed.");
            return; // Drop the malicious keystroke
        }

        setFormData((prev) => ({ ...prev, [name]: sanitized }));
    };

    const handleBlur = (e) => {
        setTouched((prev) => ({ ...prev, [e.target.name]: true }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Show all inline errors immediately
        setTouched({ name: true, email: true, password: true });

        // Trim name and email at submit time (not on keystroke — that blocks spaces)
        const trimmedData = {
            ...formData,
            name: formData.name.trim(),
            email: formData.email.trim(),
        };

        const nameError     = validateName(trimmedData.name);
        const emailError    = validateEmail(trimmedData.email);
        const passwordError = validateRegisterPassword(trimmedData.password);

        if (nameError)     { toast.error(nameError);     return; }
        if (emailError)    { toast.error(emailError);    return; }
        if (passwordError) { toast.error(passwordError); return; }

        setIsLoading(true);

        try {
            const result = await register(trimmedData);

            if (result.success) {
                toast.success("Registration successful!");
                setTimeout(() => {
                    navigate("/verify-email", { state: { email: trimmedData.email } });
                }, 1500);
            } else {
                toast.error(result.message || "Failed to register. Please try again.");
            }
        } catch (err) {
            toast.error("Something went wrong. Please try again.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    // ── Inline error values (only active after field is touched) ──────────────
    const nameError     = touched.name     ? validateName(formData.name)                 : null;
    const emailError    = touched.email    ? validateEmail(formData.email)               : null;
    const passwordError = touched.password ? validateRegisterPassword(formData.password) : null;

    return (
        <section className={s.pageWrapper}>
            <Navbar />
            <div className={s.container}>
                <div className={s.formCard}>
                    <h2 className={s.heading}>Create Account</h2>
                    <p className={s.subheading}>
                        Join our community to find or list properties
                    </p>

                    <form onSubmit={handleSubmit} className={s.form} noValidate>

                        {/* ── Full Name ── */}
                        <div>
                            <label className={s.label}>Full Name</label>
                            <input
                                type="text"
                                name="name"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                maxLength={35}
                                autoComplete="name"
                                className={s.input}
                            />
                            <FieldError message={nameError} />
                            <p style={{ fontSize: "0.7rem", color: "#9ca3af", marginTop: "2px" }}>
                                {formData.name.trimStart().length}/35 characters
                            </p>
                        </div>

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
                                maxLength={65}
                                autoComplete="email"
                                className={s.input}
                            />
                            <FieldError message={emailError} />
                        </div>

                        {/* ── Password ── */}
                        <div>
                            <label className={s.label}>Password</label>
                            <div style={{ position: "relative" }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="**********"
                                    value={formData.password}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    maxLength={64}
                                    autoComplete="new-password"
                                    className={s.input}
                                    style={{ paddingRight: "40px" }}
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

                            {/* Live password strength checklist */}
                            {formData.password && (
                                <ul style={{
                                    fontSize: "0.7rem",
                                    marginTop: "6px",
                                    paddingLeft: "1rem",
                                    lineHeight: "1.6",
                                    listStyle: "none",
                                }}>
                                    {passwordStrengthRules.map(({ label, test }) => {
                                        const passed = test(formData.password);
                                        return (
                                            <li key={label} style={{ color: passed ? "#22c55e" : "#ef4444" }}>
                                                {passed ? "✓" : "✗"} {label}
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>

                        {/* ── Role ── */}
                        <div>
                            <label className="block mb-3 font-medium">Select Role</label>
                            <div className={s.roleContainer}>
                                {["buyer", "seller"].map((role) => (
                                    <label
                                        key={role}
                                        className={`${s.roleLabelBase} ${
                                            formData.role === role
                                                ? s.roleLabelActive
                                                : s.roleLabelInactive
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="role"
                                            value={role}
                                            checked={formData.role === role}
                                            onChange={handleChange}
                                            className={s.hiddenRadio}
                                        />
                                        {role.charAt(0).toUpperCase() + role.slice(1)}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <button
                            className={s.submitButton}
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? "Creating Account..." : "Create Account"}
                        </button>
                    </form>

                    <p className={s.footerText}>
                        Already have an account{" "}
                        <Link to="/login" className={s.loginLink}>
                            Login here
                        </Link>
                    </p>
                </div>
            </div>
        </section>
    );
};

export default Register;


// import { useState } from 'react'
// import { registerStyles as s } from '../../assets/dummyStyles'
// import Navbar from '../../components/common/Navbar'
// import { useAuth } from '../../context/AuthContent';
// import { Link, useNavigate } from 'react-router-dom';
// import toast from 'react-hot-toast';
// import { HiEye, HiEyeOff } from 'react-icons/hi';

// const Register = () => {
//     const [formData, setFormData] = useState({
//         name: "",
//         email: "",
//         password: "",
//         role: "buyer",
//     });

//     const [isLoading, setIsLoading] = useState(false);
//     const [showPassword, setShowPassword] = useState(false);

//     const { register } = useAuth();
//     const navigate = useNavigate();

//     // const handleChange = (e) => {
//     //     // Clean and simple state update
//     //     setFormData({ ...formData, [e.target.name]: e.target.value });
//     // }

//     const handleChange = (e) => {
//         setFormData({ ...formData, [e.target.name]: e.target.value });

//     }

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         // 1. Basic Validation check before hitting the DB
//         if (!formData.name || !formData.email || !formData.password) {
//             return toast.error("Please fill in all fields");
//         }

//         setIsLoading(true);

//         try {
//             const result = await register(formData);

//             if (result.success) {
//                 toast.success("Registration successful!");

//                 // Using a slight delay so the user can actually see the success toast
//                 setTimeout(() => {
//                     navigate("/verify-email", { state: { email: formData.email } });
//                 }, 1500);
//             } else {
//                 // Backend returned a specific error (e.g., "Email already exists")
//                 toast.error(result.message || "Failed to Register");
//             }
//         } catch (err) {
//             // Unexpected error (Network failure, etc.)
//             toast.error("Something went wrong. Please try again.", err);
//         } finally {
//             setIsLoading(false);
//         }
//     }

//     return (
//         <section className={s.pageWrapper}>
//             <Navbar />
//             <div className={s.container}>
//                 <div className={s.formCard}>
//                     <h2 className={s.heading}>Create Account</h2>
//                     <p className={s.subheading}>
//                         Join our community to find or list properties
//                     </p>

//                     <form onSubmit={handleSubmit} className={s.form}>
//                         <div>
//                             <label className={s.label}>Full Name</label>
//                             <input
//                                 type="text"
//                                 name='name'
//                                 placeholder='John Doe'
//                                 value={formData.name}
//                                 onChange={handleChange}
//                                 required
//                                 className={s.input}
//                             />
//                         </div>

//                         <div>
//                             <label className={s.label}>Email Address</label>
//                             <input
//                                 type="text"
//                                 name='email'
//                                 placeholder='email@gmail.com'
//                                 value={formData.email}
//                                 onChange={handleChange}
//                                 required
//                                 className={s.input}
//                             />
//                         </div>

//                         <div>
//                             <label className={s.label}>Password</label>
//                             <div style={{ position: "relative" }}>
//                                 <input
//                                     type={showPassword ? "text" : "password"}
//                                     name="password"
//                                     placeholder='**********'
//                                     value={formData.password}
//                                     onChange={handleChange}
//                                     className={s.input}
//                                     style={{ paddingRight: "40px" }}
//                                     required
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

//                         <div>
//                             <label className='block mb-3 font-medium'>Select Role</label>
//                             <div className={s.roleContainer}>
//                                 <label
//                                     className={`${s.roleLabelBase} ${formData.role === "buyer"
//                                         ? s.roleLabelActive
//                                         : s.roleLabelInactive
//                                         }`}
//                                 >
//                                     <input
//                                         type='radio'
//                                         name='role'
//                                         value="buyer"
//                                         checked={formData.role === "buyer"}
//                                         onChange={handleChange}
//                                         className={s.hiddenRadio}
//                                     />
//                                     Buyer
//                                 </label>


//                                 <label
//                                     className={`${s.roleLabelBase} ${formData.role === "seller"
//                                         ? s.roleLabelActive
//                                         : s.roleLabelInactive
//                                         }`}
//                                 >
//                                     <input
//                                         type='radio'
//                                         name='role'
//                                         value="seller"
//                                         checked={formData.role === "seller"}
//                                         onChange={handleChange}
//                                         className={s.hiddenRadio}
//                                     />
//                                     Seller
//                                 </label>


//                             </div>
//                         </div>
//                         <button
//                             className={s.submitButton}
//                             type='submit'
//                             disabled={isLoading}
//                         >
//                             {isLoading ? "Creating Account..." : "Create Account"}
//                         </button>
//                     </form>

//                     <p className={s.footerText}>
//                         Already have an account {" "}
//                         <Link to="/login" className={s.loginLink}>
//                             Login here
//                         </Link>
//                     </p>
//                 </div>
//             </div>
//         </section>
//     )
// }

// export default Register