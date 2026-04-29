import { useState } from 'react'
import { loginStyles as s } from '../../assets/dummyStyles'
import Navbar from '../../components/common/Navbar'
import { useAuth } from '../../context/AuthContent';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiEye, HiEyeOff } from 'react-icons/hi';

const Login = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();


    // to handlechange for nput value
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });

    }


    // to submit the data to login
    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. Basic Validation check before hitting the DB
        if (!formData.email || !formData.password) {
            return toast.error("Please fill in all fields");
        }

        setIsLoading(true);

        const result = await login(formData.email, formData.password);
        if (result.success) {
            const storedUser = JSON.parse(
                localStorage.getItem("user") || sessionStorage.getItem("user"),
            );
            if (storedUser?.role === "admin") {
                navigate("/admin-dashboard");
            } else if (storedUser?.role === "seller") {
                navigate("/dashboard");
            } else {
                navigate("/");
            }
        } else {
            toast.error(result.message || "Failed to Login");
        }

        setIsLoading(false);
    };

    return (
        <section className={s.pageContainer}>
            <Navbar />
            <div className={s.containerCenter}>
                <div className={s.card}>
                    <h2 className={s.title}>Welcome Back</h2>
                    <p className={s.subtitle}>
                        Please enter your details to sign in
                    </p>

                    <form onSubmit={handleSubmit} className={s.form}>


                        <div>
                            <label className={s.label}>Email Address</label>
                            <input
                                type="text"
                                name='email'
                                placeholder='email@gmail.com'
                                value={formData.email}
                                onChange={handleChange}
                                
                                className={s.input}
                            />
                        </div>

                        <div>
                            <div className={s.passwordHeader}>
                            <label className={s.label}>Password</label>
                           <Link to="/forgot-password" className={s.forgotLink}>Forgot Password</Link>
                        </div>
                         <div style={{ position: "relative" }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder='**********'
                                    value={formData.password}
                                    onChange={handleChange}
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
                                        padding: 0
                                    }}
                                >
                                    {showPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
                                </button>
                            </div>
                        </div>


                        <button
                            className={s.submitButton}
                            type='submit'
                            disabled={isLoading}
                        >
                            {isLoading ? "Login Account..." : "Login"}
                        </button>
                    </form>

                    <p className={s.footerText}>
                        Don't have an account {" "}
                        <Link to="/register" className={s.forgotLink}>
                            Create an account
                        </Link>
                    </p>
                </div>
            </div>
        </section>
    )
}

export default Login