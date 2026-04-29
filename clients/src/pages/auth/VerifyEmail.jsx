import { useState } from 'react'
import { verifyEmailStyles as s } from "../../assets/dummyStyles"
import Navbar from '../../components/common/Navbar'
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config';
import toast from 'react-hot-toast';
const VerifyEmail = () => {
    const [code, setCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    // to get email passed from register page
    const emailFromState = location.state?.email || "";
    const [email, setEmail] = useState(emailFromState);


    // to submit the code
   const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code || !email) {
        return toast.error("Please fill in all fields");
    }
    setIsLoading(true);

    try {
        const res = await axios.post(`${API_URL}/auth/verify-email`, {
            email,
            code,
        });
        if (res.data.success) {
            toast.success("Registration successful! Redirecting to login...");
            setTimeout(() => navigate("/login"), 2000);
        }
    } catch (error) {
        toast.error(error.response?.data?.message || "Verification Failed. Please try again.");
    } finally {
        setIsLoading(false);
    }
};
    return (
        <section className={s.pageContainer}>
            <Navbar />
            <div className={s.containerCenter}>
                <div className={s.card}>
                    <h2 className={s.title}>Verify Your Email</h2>
                    <p className={s.subtitle}>
                        Enter the 6-digit code sent to your email
                    </p>

                    <form onSubmit={handleSubmit} className={s.form}>
                        {!emailFromState && (
                            <div>
                                <label className={s.label}>Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder='email@gmail.com'
                                    className={s.input}
                                />
                            </div>
                        )}

                        <div>
                                <label className={s.label}>Verification Code</label>
                                <input
                                    type="text"
                                    maxLength="6"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    placeholder='191945'
                                    className={s.codeInput}
                                />
                            </div>

                        

                        <button
                            className={s.submitButton}
                            type='submit'
                            disabled={isLoading}
                        >
                            {isLoading ? "Verifying..." : "Verify Email"}
                        </button>
                    </form>


                </div>
            </div>
        </section>
    )
}

export default VerifyEmail