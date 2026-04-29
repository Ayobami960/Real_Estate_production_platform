import { useState } from 'react'
import { forgotPasswordStyles as s } from '../../assets/dummyStyles'
import Navbar from '../../components/common/Navbar'
import { useAuth } from '../../context/AuthContent';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiEye, HiEyeOff } from 'react-icons/hi';
import axios from 'axios';
import { API_URL } from '../../config';

const ForgotPassword = () => {
     const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);

   
    const navigate = useNavigate()

    // to submit the data to login
   const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
        return toast.error("Please enter your email address");
    }

    setIsLoading(true);

    try {
        const res = await axios.post(`${API_URL}/auth/forgot-password`, {
            email,
        });

        if (res.data.success) {
            toast.success("Password reset link has been sent to your email.");
        }
    } catch (error) {
        toast.error(error.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
        setIsLoading(false); 
    }
};

    return (
        <section className={s.container}>
            <Navbar />
            <div className={s.centerWrapper}>
                <div className={s.formCard}>
                    <h2 className={s.title}>Forgot Password</h2>
                    <p className={s.subtitle}>
                        Enter your email address to receive a password reset link
                    </p>

                    <form onSubmit={handleSubmit} className={s.form}>


                        <div>
                            <label className={s.label}>Email Address</label>
                            <input
                                type="email"
                                placeholder='email@gmail.com'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={s.input}
                            />
                        </div>

                      

                        <button
                            className={s.submitButton}
                            type='submit'
                            disabled={isLoading}
                        >
                            {isLoading ? "Sending Link..." : "Send Rest Link"}
                        </button>
                    </form>

                     <p className={s.footerText}>
                        Remembered your password {" "}
                        <Link to="/login" className={s.link}>
                           Back to Login
                        </Link>
                    </p>
                </div>
            </div>
        </section>
    )
}

export default ForgotPassword