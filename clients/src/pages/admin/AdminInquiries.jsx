import { useEffect, useState } from "react";
import { adminInquiriesStyles as s } from "../../assets/dummyStyles";
import { useAuth } from "../../context/AuthContent";
import axios from "axios";
import { API_URL } from "../../config";
import toast from "react-hot-toast";
import { HiOutlineChatAlt2, HiOutlineCalendar, HiOutlineAnnotation } from "react-icons/hi";

const AdminInquiries = () => {
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token } = useAuth();

    // to fetch the inquires raised by buyer to seller
    useEffect(() => {
        const fetchInquiries = async () => {
            if (!token) return;
            setLoading(true);
            try {
                const res = await axios.get(`${API_URL}/admin/inquiries`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log("inquiries response:", res.data);
                if (res.data.success) {
                    setInquiries(res.data.inquiries);
                }
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch inquiries:", error);
                // toast.error("Failed to fetch inquiries"); 
                setError("Failed to load inquiries.");
                setLoading(false)
            }
        }
        fetchInquiries();
    }, [token])

    if (loading) {
        return (
            <div className={s.loaderFullPage}>
                <div className={s.loader}></div>
            </div>
        )
    }


    // ✅ Error state with retry button
    if (error) {
        return (
            <div className={s.emptyState}>
                <p>{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="btn btn-primary mt-4"

                >
                    Retry
                </button>
            </div>
        )
    }

    return (
        <>
            <div className={s.headerContainer}>
                <h1 className={s.headerTitle}>Platform Inquiries</h1> 
                <p className={s.headerSubtitle}>
                    Review communication between buyers and sellers
                </p>
            </div>



            <div className={s.listContainer}>
                {inquiries.map((inquiry) => (
                    <div key={inquiry._id} className={s.inquiryCard}>
                        <div className={s.cardTopSection}>
                            <div className={s.propertyInfoWrapper}>
                                <div className={s.propertyIconWrapper}>
                                    <HiOutlineChatAlt2 size={22} />
                                </div>
                                <div className={s.propertyTextWrapper}>
                                    <p className={s.propertyTitle}>
                                        {inquiry.property?.title || "Property Unavailable"}
                                    </p>
                                    <p className={s.propertyId}>ID: {inquiry.property?._id || "—"}</p>
                                </div>
                            </div>
                            <div className={s.dateWrapper}>
                                <HiOutlineCalendar className={s.dateIcon} />
                                {new Date(inquiry.createdAt).toLocaleDateString()}
                            </div>
                        </div>

                        <div className={s.detailsGrid}>
                            <div className={s.detailCard}>
                                <p className={s.detailLabel}>Buyer Details</p>
                                <p className={s.detailName}>{inquiry.buyer?.name}</p>
                                <p className={s.detailEmail}>{inquiry.buyer?.email}</p>
                            </div>
                            <div className={s.detailCard}>
                                <p className={s.detailLabel}>Seller Details</p>
                                <p className={s.detailName}>{inquiry.seller?.name}</p>
                                <p className={s.detailEmail}>{inquiry.seller?.email}</p>
                            </div>
                        </div>

                        <div className={s.messageContainer}>
                            <p className={s.messageHeader}>
                                <HiOutlineAnnotation /> Message</p>
                            <p className={s.messageText}>"{inquiry.message}"</p>
                        </div>
                    </div>
                ))}


                {inquiries.length === 0 && (
                    <div className={s.emptyState}>
                        <div className={s.emptyIconWrapper}>
                            <HiOutlineChatAlt2 size={48} className="mx-auto" />
                        </div>
                        <h2 >No inquiries found</h2>
                        <p className={s.emptyText}>
                            There are no inquires recorded on the platform yet.
                        </p>
                    </div>
                )}
            </div>

        </>
    )
}

export default AdminInquiries