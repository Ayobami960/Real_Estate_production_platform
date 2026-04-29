import { useState } from 'react'
import { registerStyles as s } from '../../assets/dummyStyles'
import Navbar from '../../components/common/Navbar'
import { useAuth } from '../../context/AuthContent';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiEye, HiEyeOff } from 'react-icons/hi';

const Register = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "buyer",
    });

    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    // const handleChange = (e) => {
    //     // Clean and simple state update
    //     setFormData({ ...formData, [e.target.name]: e.target.value });
    // }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });

    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. Basic Validation check before hitting the DB
        if (!formData.name || !formData.email || !formData.password) {
            return toast.error("Please fill in all fields");
        }

        setIsLoading(true);

        try {
            const result = await register(formData);

            if (result.success) {
                toast.success("Registration successful!");

                // Using a slight delay so the user can actually see the success toast
                setTimeout(() => {
                    navigate("/verify-email", { state: { email: formData.email } });
                }, 1500);
            } else {
                // Backend returned a specific error (e.g., "Email already exists")
                toast.error(result.message || "Failed to Register");
            }
        } catch (err) {
            // Unexpected error (Network failure, etc.)
            toast.error("Something went wrong. Please try again.", err);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <section className={s.pageWrapper}>
            <Navbar />
            <div className={s.container}>
                <div className={s.formCard}>
                    <h2 className={s.heading}>Create Account</h2>
                    <p className={s.subheading}>
                        Join our community to find or list properties
                    </p>

                    <form onSubmit={handleSubmit} className={s.form}>
                        <div>
                            <label className={s.label}>Full Name</label>
                            <input
                                type="text"
                                name='name'
                                placeholder='John Doe'
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className={s.input}
                            />
                        </div>

                        <div>
                            <label className={s.label}>Email Address</label>
                            <input
                                type="text"
                                name='email'
                                placeholder='email@gmail.com'
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className={s.input}
                            />
                        </div>

                        <div>
                            <label className={s.label}>Password</label>
                            <div style={{ position: "relative" }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder='**********'
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={s.input}
                                    style={{ paddingRight: "40px" }}
                                    required
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
                                        padding: 0
                                    }}
                                >
                                    {showPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className='block mb-3 font-medium'>Select Role</label>
                            <div className={s.roleContainer}>
                                <label
                                    className={`${s.roleLabelBase} ${formData.role === "buyer"
                                        ? s.roleLabelActive
                                        : s.roleLabelInactive
                                        }`}
                                >
                                    <input
                                        type='radio'
                                        name='role'
                                        value="buyer"
                                        checked={formData.role === "buyer"}
                                        onChange={handleChange}
                                        className={s.hiddenRadio}
                                    />
                                    Buyer
                                </label>


                                <label
                                    className={`${s.roleLabelBase} ${formData.role === "seller"
                                        ? s.roleLabelActive
                                        : s.roleLabelInactive
                                        }`}
                                >
                                    <input
                                        type='radio'
                                        name='role'
                                        value="seller"
                                        checked={formData.role === "seller"}
                                        onChange={handleChange}
                                        className={s.hiddenRadio}
                                    />
                                    Seller
                                </label>


                            </div>
                        </div>
                        <button
                            className={s.submitButton}
                            type='submit'
                            disabled={isLoading}
                        >
                            {isLoading ? "Creating Account..." : "Create Account"}
                        </button>
                    </form>

                    <p className={s.footerText}>
                        Already have an account {" "}
                        <Link to="/login" className={s.loginLink}>
                            Login here
                        </Link>
                    </p>
                </div>
            </div>
        </section>
    )
}

export default Register