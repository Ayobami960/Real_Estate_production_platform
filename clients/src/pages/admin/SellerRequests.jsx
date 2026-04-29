import { useEffect, useState } from 'react'
import { sellerRequestsStyles as s } from '../../assets/dummyStyles'
import { useAuth } from '../../context/AuthContent';
import axios from 'axios';
import { API_URL } from '../../config';
import toast from 'react-hot-toast';
import { HiOutlineCheckCircle, HiOutlineClock, HiOutlineMail, HiOutlinePhone } from 'react-icons/hi';

const SellerRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();

    // to fetch the request
    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const res = await axios.get(`${API_URL}/admin/pending-sellers`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.data.success) {
                    setRequests(res.data.pendingSellers);
                }
                setLoading(false);
            } catch (err) {
                toast.error("Faild to load seller requests:", err);
                setLoading(false);
            }
        }
        fetchRequests();
    }, [token]);

    // to approve  a seller
    const handleApprove = async (id) => {
        try {
            const res = await axios.patch(
                `${API_URL}/admin/approve-sellers/${id}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } },
            );

            if (res.data.success) {
                setRequests(requests.filter((req) => req._id !== id));
                toast.success("Seller approved successfully!")
            }

        } catch (err) {
            toast.error("Faild to approved seller:", err);
        }
    };


    if (loading) {
        return (
            <div className={s.loaderFullPage}>
                <div className={s.loader}></div>
            </div>
        )
    }
    return (
        <section className={s.container}>
            <div className={s.headerContainer}>
                <h1 className={s.pageTitle}>Seller Verification</h1>
                <p className={s.pageSubtitle}>
                    Review and approve new seller registration requests.
                </p>
            </div>

            <div className={s.card}>
                <div className={s.cardInner}>
                    <h2 className={s.sectionTitle}>
                        Pending Requests ({requests.length})
                    </h2>

                    {requests.length === 0 ? (
                        <div className={s.emptyState}>
                            <HiOutlineCheckCircle size={48} className={s.emptyStateIcon} />
                            <p>No Pending seller requests at the moment.</p>
                        </div>
                    ) : (
                        <div className={s.requestGrid}>
                            {requests.map((request) => (
                                <div key={request._id} className={s.requestCard}>
                                    <div className={s.requestHeader}>
                                        <div className={s.avatar}>
                                            {request.name.charAt(0).toUpperCase()}
                                        </div>

                                        <div>
                                            <div className={s.requestName}>
                                                {request.name}
                                            </div>
                                            <div className={s.requestDate}>
                                                <HiOutlineClock /> Joined{" "}
                                                {new Date(request.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>

                                    <div className={s.contactInfo}>
                                        <div className={s.contactItem}>
                                            <HiOutlineMail size={18} className="text-primary"/> {" "}
                                            {request.email}
                                        </div>
                                        {request.phone && (
                                            <div className={s.contactItem}>
                                                <HiOutlinePhone size={18} className='text-primary'/>{" "}
                                                {request.phone}
                                            </div>
                                        )}
                                    </div>

                                    <button onClick={() => handleApprove(request._id)} className={s.approveButton}>
                                        <HiOutlineCheckCircle size={20}/>
                                        Approve Seller
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}

export default SellerRequests