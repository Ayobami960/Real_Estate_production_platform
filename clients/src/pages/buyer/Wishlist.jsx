import { useEffect, useState } from "react";
import { wishlistStyles as s } from "../../assets/dummyStyles";
import Navbar from "../../components/common/Navbar";
import { useAuth } from "../../context/AuthContent";
import axios from "axios";
import { API_URL } from "../../config";
import toast from "react-hot-toast";
import { HiHeart, HiTrash } from "react-icons/hi";
import { Link } from "react-router-dom";
import PropertyCard from "../../components/common/PropertyCard";

const Wishlist = () => {
    const { token } = useAuth();
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    // const [error, setError] = ("")


    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        try {
            const res = await axios.get(`${API_URL}/wishlist`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWishlistItems(res.data);
            setLoading(false)
        } catch (error) {
            toast.error("Failed to load wishlist");
            setLoading(false);
        }
    }

    //  to remove property fom wishlist
    const removeFromWishlist = async (propertyId) => {
        if (!propertyId) {
            toast.error("Invalid Property ID");
            return;
        }
        try {
            await axios.delete(`${API_URL}/wishlist/${propertyId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setWishlistItems((prev) => prev.filter(
                (item) => item.property && item.property._id !== propertyId
            ),
            );
        } catch (error) {
            toast.error("Failed to remove from wishlist")
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
        <div className={s.pageContainer}>
            <Navbar />

            <main className={s.mainContainer}>
                <div className={s.headingWrapper}>
                    <h1 className={s.heading}>
                        Your Wishlist
                    </h1>
                    <p className={s.subheading}>
                        Properties you`ve saved for later.
                    </p>
                </div>

                {wishlistItems.length === 0 ? (
                    <div className={s.emptyCard}>
                        <div className={s.emptyIconWrapper}>
                            <HiHeart size={40} />
                        </div>
                        <h2 className={s.emptyTitle}>Your Wishlist is empty</h2>
                        <p className={s.emptyText}>
                            Start exploring properties and save your favorites!
                        </p>

                        <Link to="/" className={s.browseButton}>
                            Browse Properties
                        </Link>
                    </div>
                ) : (
                    <div className={s.gridContainer}>
                        {wishlistItems.filter((item) => item.property).map((item) => (
                            <PropertyCard key={item._id} property={item.property}
                                renderActions={() => (
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            removeFromWishlist(item.property._id)
                                        }}
                                        className={s.removeButton}

                                    >
                                        <HiTrash size={38} /> Remove From Wishlist
                                    </button>
                                )}

                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}

export default Wishlist