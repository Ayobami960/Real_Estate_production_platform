import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContent';
import Navbar from '../../components/common/Navbar';
import axios from 'axios';
import { API_URL } from '../../config';
import { toast } from 'react-hot-toast';
import { propertyDetailsStyles as s } from "../../assets/dummyStyles"
import { HiBadgeCheck, HiCalendar, HiChatAlt, HiChevronLeft, HiChevronRight, HiCollection, HiHeart, HiLocationMarker, HiOutlineHeart, HiOutlineHome, HiOutlineUserGroup, HiOutlineViewGrid, HiX } from 'react-icons/hi';
import PropertyCard from '../../components/common/PropertyCard';

const PropertyDetails = () => {
    const { id } = useParams();
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [property, setProperty] = useState(null);
    const [similarProperties, setSimilarProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [inquiry, setInquiry] = useState({
        name: "",
        email: "",
        phone: "",
        message: "",
    });
    const [inquiryStatus, setInquiryStatus] = useState({
        loading: false,
        success: false,
        error: null,
    });
    const [isInWishlist, setIsInWishlist] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setLoading(true)
                const res = await axios.get(`${API_URL}/property/${id}`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                setProperty(res.data.property);
                setSimilarProperties(res.data.similarProperties || []);

                if (user && user.role === "buyer") {
                    const wishRes = await axios.get(`${API_URL}/wishlist`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    const found = wishRes.data.some((item) => item.property?._id === id);
                    setIsInWishlist(found);
                }
                setLoading(false);
            } catch (error) {
                setError("Failed to load property details.");
                setLoading(false);
                toast.error("Could not fetch property details.");
            }
        };

        fetchDetails();
    }, [id, user, token]);

    // Fixed Wishlist Toggle with Toast
    const handleWishlistToggle = async () => {
        if (!user) {
            toast("Please login to manage wishlist");
            return navigate("/login");
        }

        try {
            if (isInWishlist) {
                await axios.delete(`${API_URL}/wishlist/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setIsInWishlist(false);
                toast.success('Removed from wishlist');
            } else {
                await axios.post(
                    `${API_URL}/wishlist/${id}`, // Fixed URL: removed extra /api/ if your config already handles it
                    {},
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setIsInWishlist(true);
                toast.success('Added to wishlist!');
            }
        } catch (error) {
            toast.error('Failed to update wishlist.');
            console.error(error);
        }
    }

    // Fixed Inquiry Submit with Toast
    const handleInquirySubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            toast.error("Log in required");
            return navigate("/login");
        }

        if (user.role !== "buyer") {
            return toast.error("Only buyers can send inquiries");
        }

        if (!inquiry.message.trim()) {
            return toast.error("Please enter a message");
        }

        setInquiryStatus({ ...inquiryStatus, loading: true });

        try {
            await axios.post(`${API_URL}/inquiries`, {
                propertyId: id,
                message: inquiry.message,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setInquiryStatus({ loading: false, success: true, error: null });
            setInquiry({ ...inquiry, message: "" }); // Clear the message field
            toast.success("Inquiry sent successfully!");
        } catch (error) {
            setInquiryStatus({ loading: false, success: false, error: "Failed to send" });
            toast.error(error.response?.data?.message || "Failed to send inquiry");
        }
    }

    // to start a chat
    const handleChatStart = async () => {
        if (!user) return navigate("/login");
        if (user.role !== "buyer") {
            return toast.error("Only buyer can chat with sellers");
        }
        try {
            const res = await axios.post(
                `${API_URL}/chat/start`,
                {
                    propertyId: id,
                    sellerId: property.seller._id,
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                },
            );
            const chat = res.data;
            await axios.post(
                `${API_URL}/chat/send`, {
                chatId: chat._id,
                text: `Interested in property "${property.title}" - let's discuss!`,
                image: property.images[0]
            },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            navigate("/chat-messages", { state: { chat } });
        } catch (error) {
            console.error("Error starting chat:", error)
            toast.error(error.response?.data?.message || "Failed to send chat");
        }
    };


    const [lightboxIndex, setLightboxIndex] = useState(null);

    if (loading) {
        return (
            <div className='loader-full-page'>
                <div className='loader'></div>
            </div>
        );
    };


    if (error || !property) {
        return (
            <div
                className='container'
                style={{ padding: "4rem", textAlign: "center" }}
            >
                {error || "Property not found"}
            </div>
        )
    }


    // const formattedPrice = new Intl.NumberFormat("en-IN", {
    //     style: "currency",
    //     currency: "INR",
    //     maximumFractionDigits: 0,
    // }).format(property.price);

    const formattedPrice = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(property.price);



    const openLightbox = (index) => setLightboxIndex(index);
    const closeLightbox = () => setLightboxIndex(null);
    const nextImage = () =>
        setLightboxIndex((prev) => (prev + 1) % property.images.length);
    const prevImage = () =>
        setLightboxIndex(
            (prev) => (prev - 1 + property.images.length) % property.images.length,
        ); // open an imae in a box and go to next or previous one

    return (
        <section className={s.pageContainer}>
            <Navbar />
            <main className={s.mainContainer}>
                <nav className={s.breadcrumbs}>
                    <Link to="/" className={s.breadcrumbLink}>
                        Home
                    </Link>
                    <HiChevronRight />
                    <Link to="/properties" className={s.breadcrumbLink}>
                        Listings
                    </Link>
                    <HiChevronRight className=' ' />
                    <span className={s.breadcrumbCurrent}>{property.title}</span>
                </nav>

                <div className={s.galleryContainer}>
                    <div
                        className={s.galleryGrid}
                        style={{
                            gridAutoColumns:
                                property.images.length > 1 ? "repeat(4, 1fr)" : "1fr",
                            gridTemplateRows:
                                property.images.length > 1 ? "repeat(2, 180px" : "400px"
                        }}
                    >
                        <div
                            className={s.galleryMainItem(property.images.length > 1)}
                            onClick={() => openLightbox(0)}>
                            <img src={property.images[0]}
                                alt="property image"
                                className={s.galleryImage}
                            />
                        </div>

                        {property.images.slice(1).map((img, idx) => (
                            <div
                                key={idx + 1}
                                className={s.galleryItem}
                                onClick={() => openLightbox(idx + 1)}
                            >
                                <img src={img} alt="property image" className={s.galleryImage} />

                                {idx === 3 && property.images.length > 5 && (
                                    <div className={s.galleryMoreOverlay}>
                                        +{property.images.length - 5}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className={s.mobileSliderContainer}>
                        <div className={s.mobileSliderTrack}>
                            {property.images.map((img, idx) => (
                                <div key={idx} className={s.mobileSlide} onClick={() => openLightbox(idx)}>
                                    <img src={img} alt="images" className={s.mobileSlideImage} />
                                    <div className={s.mobileSlideCounter}>
                                        {idx + 1} / {property.images.length}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* lightox model */}
                {lightboxIndex !== null && (
                    <div className={s.lightboxOverlay} onClick={closeLightbox}>
                        <button onClick={closeLightbox} className={s.lightboxCloseBtn}>
                            <HiX size={24} className={s.lightboxCloseIcon} />
                        </button>


                        <div onClick={(e) => e.stopPropagation()} className={s.lightboxContent}>
                            <img src={property.images[lightboxIndex]}
                                alt="images"
                                className={s.lightboxImage}
                            />

                            {property.images.length > 1 && (
                                <>
                                    <button onClick={prevImage} className={s.lightboxPrevBtn}>
                                        <HiChevronLeft size={30} />
                                    </button>
                                    <button onClick={prevImage} className={s.lightboxNextBtn}>
                                        <HiChevronRight size={30} />
                                    </button>
                                </>
                            )}

                            <div className={s.lightboxCounter}>
                                {lightboxIndex + 1} / {property.images.length}
                            </div>
                        </div>
                    </div>
                )}

                {/* main content */}
                <div className={s.detailsLayout}>
                    <div className={s.infoColumn}>
                        <div className={s.infoHeader}>
                            <div className={s.titleWrapper}>
                                <div className={s.badgeWrapper}>
                                    <span className={s.premiumBadge}>Premium Listing</span>
                                </div>
                                <h1 className={s.propertyTitle}>
                                    {property.title}
                                </h1>

                                <p className={s.propertyLocation}>
                                    <HiLocationMarker className={s.locationIcon} />
                                    <span className={s.locationText}>
                                        {property.area}, {property.city}, India
                                    </span>
                                </p>
                            </div>

                            <div className={s.actionButtons}>
                                {(!user || user.role === "buyer") && (
                                    <button
                                        onClick={handleWishlistToggle}
                                        className={s.wishlistButton(isInWishlist)}
                                    >
                                        {isInWishlist ? (
                                            <HiHeart size={26} fill='#ef4444' />
                                        ) : (
                                            <HiOutlineHeart size={26} />
                                        )}

                                    </button>
                                )}
                            </div>
                        </div>

                        {/* quick stats */}
                        <div className={s.statsGrid}>

                            {[
                                {
                                    label: "Bedrooms",
                                    value: property.bhk || 0,
                                    icon: HiOutlineHome,
                                },
                                {
                                    label: "Bathrooms",
                                    value:
                                        property.bathrooms ||
                                        Math.max(1, (parseInt(property.bhk) || 1) - 1),
                                    icon: HiOutlineUserGroup,
                                },
                                {
                                    label: "Furnishing",
                                    value: property.furnishing || "N/A",
                                    icon: HiCollection,
                                },
                                {
                                    label: "Living Area",
                                    value: `${property.areaSize} sqft`,
                                    icon: HiOutlineViewGrid,
                                },
                                {
                                    label: "Type",
                                    value: property.propertyType,
                                    icon: HiCalendar,
                                },
                            ].map((stat, i) => (
                                <div key={i} className={s.statCard}>
                                    {stat.icon && <stat.icon size={18} className={s.statIcon} />}
                                    <div className={s.statValue}>{stat.value}</div>
                                    <div className={s.statLabel}>{stat.label}</div>

                                </div>
                            ))}
                        </div>

                        <div className={s.descriptionSection}>
                            <h3 className={s.sectionTitle}>Description</h3>
                            <p className={s.descriptionText}>
                                {property.description ||
                                    "No description available for this property."}
                            </p>
                        </div>

                        <div className={s.amenitiesSection}>
                            <h3 className={s.sectionTitle}>Amenities</h3>
                            <div className={s.amenitiesGrid}>
                                {(property.amenities?.length
                                    ? property.amenities
                                    : ["Parking", "Security", "Water Supply", "Power Backup"]
                                ).map((amn, i) => (
                                    <div key={i} className={s.amenityItem}>
                                        <HiBadgeCheck size={18} className={s.amenityIcon} />
                                        <span className={s.amenityText}>{amn}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className={s.sidebarColumn}>
                        <div className={s.priceCard}
                            style={{
                                background: "var(--primary)"
                            }}
                        >
                            <div className={s.priceCardLabel}>
                                {property.status?.toLowerCase() === "rent"
                                    ? "Rental Details"
                                    : "Listing Price"}
                            </div>

                            <div className={s.priceCardValue}>
                                {property.status?.toLowerCase() === "rent"
                                    ? `$${Number(property.price).toLocaleString("en-IN")}`
                                    : formattedPrice}
                                {property.status?.toLowerCase() === "rent" && (
                                    <span className={s.priceCardPeriod}> /month</span>
                                )}
                            </div>

                            {property.status?.toLowerCase() === "rent" && (
                                <div className={s.rentDetails}>
                                    <div className={s.rentDetailRow}>
                                        <span className={s.rentDetailLabel}>
                                            Security Deposite
                                        </span>

                                        <span className={s.rentDetailValue}>
                                            $
                                            {Number(property.securityDeposit || 0).toLocaleString(
                                                "en-IN",
                                            )}
                                        </span>
                                    </div>

                                    <div className={s.rentDetailRow}>
                                        <span className={s.rentDetailLabel}>Maintenance</span>
                                        <span className={s.rentDetailValue}>
                                            $
                                            {Number(property.securityDeposit || 0).toLocaleString(
                                                "en-IN",
                                            )}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className={s.priceCardAvailability}>
                                Available for{" "}
                                {property.status?.toLowerCase() === "rent" ? "Rent" : "Sale"}
                            </div>
                        </div>

                        {/* seller  & contact*/}
                        <div className={s.sellerCard}>
                            <div className={s.sellerInfo}>
                                <div className={s.sellerAvatar}>
                                    <img
                                        src={
                                            property.seller?.profilePic ||
                                            `https://ui-avatars.com/api/?name=${property.seller?.name || "Seller"}&background=0d6e59&color=fff`
                                        }
                                        alt="Agent"
                                        className={s.sellerAvatarImage}
                                    />
                                </div>
                                <div className={s.sellerDetails}>
                                    <div className={s.sellerNameLink}>
                                        <h4 className={s.sellerName}>
                                            {property.seller?.name || "Seller"}
                                        </h4>
                                    </div>
                                    <div className={s.sellerVerifiedBadge}>
                                        <HiBadgeCheck className={s.verifiedIcon} /> Verified Seller
                                    </div>
                                </div>
                            </div>

                            <div className={s.chatButtonWrapper}>
                                <button className={s.chatButton} onClick={handleChatStart}>
                                    <HiChatAlt /> Chat
                                </button>
                            </div>

                            {/* Inquiry Form */}
                            <h4 className={s.inquiryFormTitle}>Inquire</h4>
                            <form onSubmit={handleInquirySubmit}>
                                {user?.role === "buyer" ? (
                                    <>
                                        <textarea
                                            placeholder="Your Message..."
                                            value={inquiry.message}
                                            onChange={(e) =>
                                                setInquiry({ ...inquiry, message: e.target.value })
                                            }
                                            className={s.inquiryTextarea}
                                            required
                                        />
                                        <button
                                            type="submit"
                                            className={s.inquirySubmitButton}
                                            disabled={inquiryStatus.loading}
                                        >
                                            {inquiryStatus.loading ? "Sending..." : "Send Inquiry"}
                                        </button>
                                        {inquiryStatus.success && (
                                            <p className={s.inquirySuccessMessage}>Inquiry sent!</p>
                                        )}
                                    </>
                                ) : (
                                    <div className={s.inquiryDisabledMessage}>
                                        <p className={s.inquiryDisabledText}>
                                            {user
                                                ? "Only buyers can send inquiries."
                                                : "Please login as a buyer to send inquiries."}
                                        </p>
                                        {!user && (
                                            <Link to="/login" className={s.inquiryLoginButton}>
                                                Login
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>

                </div>

                <div className={s.additionalDetails}>
                    <h3 className={s.detailsTitle}>Property Details</h3>
                    <div className={s.detailsGrid}>
                        {[
                            {
                                label: "Property ID",
                                value: property._id.slice(-8).toUpperCase(),
                            },
                            {
                                label: "Added On",
                                value: new Date(property.createdAt).toLocaleDateString(),
                            },
                            { label: "Property Type", value: property.propertyType },
                            { label: "Status", value: `For ${property.status}` },
                        ].map((detail, i) => (
                            <div key={i} className={s.detailRow}>
                                <span className={s.detailValue}>{detail.label}</span>
                                <span className={s.detailValue}>{detail.value}</span>

                            </div>
                        ))}
                    </div>
                </div>

                <div className={s.similarSection}>
                    <div className={s.similarHeader}>
                        <div>
                            <h2 className={s.similarTitle}>Similar Properties</h2>
                            <p className={s.similarSubtitle}>
                                Listings you might like in {property.city}
                            </p>
                        </div>
                        <Link to="/properties" className={s.similarAllLink}>
                            All Listings <HiChevronRight />
                        </Link>
                    </div>
                    <div className={s.similarGrid}>
                        {similarProperties.length > 0 ? (
                            similarProperties.slice(0, 3).map((p) =>
                                <PropertyCard
                                    key={p._id}
                                    property={p}
                                />)
                        ) : (
                            <div className={s.similarEmptyState}>
                                No similar properties found in this location
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </section>
    )
}

export default PropertyDetails