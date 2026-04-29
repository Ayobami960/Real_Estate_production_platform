import { useState } from 'react'
import { resetPasswordStyles as s } from "../../assets/dummyStyles"
import Navbar from '../../components/common/Navbar'
import { Link, useNavigate, useParams } from 'react-router-dom';
import { HiEye, HiEyeOff } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { API_URL } from '../../config';
import axios from 'axios';
const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();
  const { token } = useParams();

  // to submit the new password
  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   if (password !== confirmPassword) {
  //     return toast.error("Passwords do not match");
  //   }

  //   setIsLoading(true);

  //   try {
  //     const res = await axios.post(`${API_URL}/auth/reset-password/${token}`, {
  //       password,
  //     });

  //     if (res.data.success) {
  //       toast.success("Password has been reset successfully.");
  //       setTimeout(() => {
  //         navigate("/login");
  //       }, 2000);
  //     }
  //   } catch (error) {
  //     console.error("Reset password error:", error);
  //     toast.error(
  //       error.response?.data?.message || "Password reset failed. Token may be invalid or expired."  // ✅ typos fixed
  //     );
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
        return toast.error("Passwords do not match");
    }

    setIsLoading(true);

    // ✅ 1. Check what token is being pulled from the URL
    console.log("Token from URL:", token);

    // ✅ 2. Check what's being sent to the backend
    console.log("Sending to backend:", {
        url: `${API_URL}/auth/reset-password/${token}`,
        password,
    });

    try {
        const res = await axios.post(`${API_URL}/auth/reset-password/${token}`, {
            password,
        });

        // ✅ 3. Check what the backend returned
        console.log("Backend response:", res.data);

        if (res.data.success) {
            toast.success("Password has been reset successfully.");
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        }
    } catch (error) {
        // ✅ 4. Full error breakdown
        console.log("Status code:", error.response?.status);
        console.log("Backend error message:", error.response?.data);
        console.log("Full error:", error);

        toast.error(
            error.response?.data?.message || "Password reset failed. Token may be invalid or expired."
        );
    } finally {
        setIsLoading(false);
    }
};


  return (
    <section className={s.container}>
      <Navbar />
      <div className={s.centerWrapper}>
        <div className={s.formCard}>
          <h2 className={s.title}>Reset Password</h2>
          <p className={s.subtitle}>Create a new password for your account</p>

          <form onSubmit={handleSubmit} className={s.form}>
            <div>

              <label className={s.label}>New Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder='**********'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            <div>

              <label className={s.label}>Confirm New Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="c"
                  placeholder='**********'
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={s.input}
                  style={{ paddingRight: "40px" }}

                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                  {showConfirmPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
                </button>

              </div>

            </div>


            <button
              className={s.submitButton}
              type='submit'
              disabled={isLoading}
            >
              {isLoading ? "Resetting..." : "Reset Password"} 
            </button>
          </form>


          <p className={s.footerText}>
            Back to{" "}
            <Link to="/login" className={s.link}>
              Login
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}

export default ResetPassword