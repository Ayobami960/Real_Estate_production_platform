import { useEffect, useState } from 'react';
import { myInquiriesStyles as s } from '../../assets/dummyStyles';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config';
import toast from 'react-hot-toast';
import Navbar from '../../components/common/Navbar';
import { useAuth } from '../../context/AuthContent';
import { HiCalendar, HiChatAlt2, HiCheckCircle, HiExternalLink, HiHome, HiMail, HiOutlineChatAlt2, HiUser } from 'react-icons/hi';

const MyInquiries = () => {
    const { user, token } = useAuth();
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    // 1. ADD ERROR STATE HERE
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchInquiries = async () => {
            if (!user || !token) return;
            try {
                // Reset error state before trying a new fetch
                setError(null);
                const endpoint = user?.role === "seller" ? "seller" : "my";
                const res = await axios.get(`${API_URL}/inquiries/${endpoint}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setInquiries(res.data.inquiries || []);
            } catch (err) {
                console.error("Error fetching inquiries:", err);
                // 2. SET ERROR STATE ON FAILURE
                setError(err);
                toast.error("Failed to load inquiries.");
            } finally {
                setLoading(false);
            }
        };
        fetchInquiries();
    }, [user, token]);

    const markAsRead = async (id) => {
        try {
            await axios.patch(`${API_URL}/inquiries/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setInquiries(inquiries.map((inq) =>
                inq._id === id ? { ...inq, isRead: true } : inq
            ));
        } catch (err) {
            console.error("Failed to mark read:", err);
        }
    };

    const handleStartChat = async (inq) => {
        try {
            const res = await axios.post(
                `${API_URL}/chat/start`,
                {
                    propertyId: inq.property?._id,
                    buyerId: inq.buyer?._id,
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            navigate("/chat-message", { state: { chat: res.data } });
        } catch (err) {
            console.error("Error starting chat:", err);
            toast.error("Failed to start chat. Please try again.");
        }
    };

    // 3. HANDLING LOADING STATE
    if (loading) {
        return (
            <div className={s.loaderFullPage}>
                <div className={s.loader}></div>
            </div>
        );
    }

    // 4. HANDLING ERROR STATE
    if (error) {
        return (
            <div className={user?.role !== "seller" ? s.bgBgAltMinH : s.bgTransparentMinH}>
                {user?.role !== "seller" && <Navbar />}
                <div className={s.containerPy12TextCenter}>
                    <div className={s.cardPremiumPy16Px8}>
                        <p className="text-red-500 mb-4">Something went wrong while loading inquiries.</p>
                        <button
                            onClick={() => window.location.reload()}
                            className={s.btnPrimary}
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const isSeller = user?.role === "seller";

    return (
        <div className={user?.role !== "seller" ? s.bgBgAltMinH : s.bgTransparentHAuto}>
            {user?.role !== "seller" && <Navbar />}
            <div className={`${s.containerFadeIn} ${user?.role !== "seller" ? s.py12Pt12 : s.pt0}`}>

                <div className={s.mb12}>
                    <h1 className={s.heading}>
                        {isSeller ? "Customer Inquiries" : "My Inquiries"}
                    </h1>
                    <p className={s.textMuted}>
                        {isSeller
                            ? "Review and respond to tinterest in your properties"
                            : "Track the status of your property inquiries."}
                    </p>
                </div>
                {inquiries.length === 0 ? (
                    <div className={s.cardPremiumPy24Px8TextCenter}>
                        <div className={s.iconContainer}>
                            <HiOutlineChatAlt2 size={40} />
                        </div>

                        <h2 className={s.mb12}>
                            No inquiries {isSeller ? "received" : "rent"}
                        </h2>
                        <p className={s.textMutedMb8}>
                            {isSeller ?
                                "You haven't received and inquires yet. Better listings get more attention!"
                                : "You haven't contacted and sellers yet. Interested in a peroperty? Send an inquiry"}
                        </p>

                        <Link to="/" className={s.btnPrimary}>
                            {isSeller ? "Improve My Listings" : "Discover Properties"}
                        </Link>
                    </div>
                ) : (
                    <div className={s.flexColGap6}>
                        {inquiries.map((inq) => (
                            <div key={inq._id} className={s.inquiryCard}>
                                <div className={s.inquiryMain}>
                                    <div className={s.iconWrapper}>
                                        <HiHome className={s.iconSize} />
                                    </div>
                                    <div className={s.flex1}>
                                        <div className={s.titleRow}>
                                            <h3 className={s.titleText}>{inq.property?.title}</h3>
                                            <span
                                                className={`${s.badge} ${inq.isRead ? s.badgeRead : s.badgeNew
                                                    }`}
                                            >
                                                {innerHeight.isRead ? "READ" : "NEW"}
                                            </span>
                                        </div>

                                        {isSeller && (
                                            <div className={s.buyerInfo}>
                                                <div className={s.infoItem}>
                                                    <HiUser className={s.textMutedSmall} />{" "}
                                                    <span className={s.fontSemibold}>
                                                        {inq.buyer?.name}
                                                    </span>
                                                </div>

                                                <div className={s.infoItem}>
                                                    <HiMail className={s.textMutedSmall} />{" "}
                                                    {inq.buyer?.email}
                                                </div>

                                                <div className={s.infoItem}>
                                                    <HiMail className={s.textMutedSmall} />{" "}
                                                    {inq.buyer?.phone || "No phone provided"}
                                                </div>
                                            </div>
                                        )}

                                        <p className={s.message}>{inq.message}</p>
                                        <div className={s.meta}>
                                            <div className={s.flexItemsCenterGap2}>
                                                <HiCalendar size={16} />{" "}
                                                {isSeller ? "Received" : "Sent"} on {" "}
                                                {new Date(inq.createdAt).toLocaleDateString()}
                                            </div>

                                            {isSeller && (
                                                <div className={s.flexItemsCenterGap2}>
                                                    <HiCheckCircle size={16} />{" "}
                                                    {inq.isRead ? "Seller viewed" : "Waiting for seller"}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className={s.actions}>
                                    <Link
                                        to={`/property/${inq.property?._id}`}
                                        className={s.btnOutline}
                                    >
                                        View Property <HiExternalLink />
                                    </Link>

                                    {isSeller && !inq.isRead && (
                                        <button
                                            onClick={() => markAsRead(inq._id)}
                                            className={s.btnPrimaryWhitespaceNowrap}
                                        >
                                            Mark As Read
                                        </button>
                                    )}
                                    {isSeller && (
                                        <button onClick={() => handleStartChat(inq)}
                                        className={s.btnMessage}
                                        >
                                            <HiChatAlt2/> Message
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
};

export default MyInquiries;