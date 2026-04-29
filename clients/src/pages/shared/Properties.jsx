import React, { useEffect, useRef, useState } from 'react';
import Navbar from '../../components/common/Navbar';
import { propertiesStyles as s } from "../../assets/dummyStyles";
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContent';
import { HiAdjustments, HiFilter, HiSearch, HiViewGrid, HiViewList, HiX } from 'react-icons/hi';
import { API_URL } from '../../config';
import axios from 'axios';
import PropertyCard from '../../components/common/PropertyCard';

const Properties = () => {
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const location = useLocation();

    // State
    const [properties, setProperties] = useState([]);
    const [wishlistedIds, setWishlistedIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState("grid");
    const [error, setError] = useState();
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    const [filters, setFilters] = useState({
        city: "",
        propertyType: [],
        bhk: "",
        maxPrice: 100000000,
        amenities: [],
        furnishing: [],
        sort: "latest",
    });

    // Options
    const propertyTypes = [
        { label: "Flat", value: "flat" },
        { label: "Apartment", value: "apartment" },
        { label: "Studio", value: "studio" },
        { label: "Office", value: "office" },
        { label: "Plot", value: "plot" },
        { label: "Townhouse", value: "townhouse" },
        { label: "Independent House/Villa", value: "villa" },
        { label: "Penthouse", value: "penthouse" },
        { label: "Commercial", value: "commercial" },
    ];
    const bhkOptions = ["1", "2", "3", "4", "5+"];
    const furnishingOptions = [
        { label: "Furnished", value: "furnished" },
        { label: "Semi-Furnished", value: "semi-furnished" },
        { label: "Unfurnished", value: "unfurnished" },
    ];

    // --- 1. Fetching Logic ---

    const fetchProperties = async (currentFilters) => {
        try {
            setLoading(true);
            const params = new URLSearchParams();

            if (currentFilters.city) params.append("city", currentFilters.city);
            if (currentFilters.propertyType.length > 0)
                params.append("propertyType", currentFilters.propertyType.join(","));
            if (currentFilters.bhk) params.append("bhk", currentFilters.bhk);
            if (currentFilters.maxPrice)
                params.append("maxPrice", currentFilters.maxPrice);

            // Furnishing Filter Logic
            if (currentFilters.furnishing && currentFilters.furnishing.length > 0) {
                params.append("furnishing", currentFilters.furnishing.join(","));
            }

            if (currentFilters.sort) params.append("sort", currentFilters.sort);

            const res = await axios.get(`${API_URL}/property?${params.toString()}`);
            setProperties(res.data.properties);
            setError(null);
        } catch (err) {
            setError("Failed to load properties. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const fetchTimer = useRef(null);
    const debouncedFetch = (updatedFilters) => {
        if (fetchTimer.current) clearTimeout(fetchTimer.current);
        fetchTimer.current = setTimeout(() => {
            fetchProperties(updatedFilters);
        }, 500);
    };


    const applyFilters = () => {
        if (fetchTimer.current) clearTimeout(fetchTimer.current);
        fetchProperties(filters);
    };

    // --- 2. Event Handlers ---

    const handleCheckboxChange = (category, value) => {
        const current = [...(filters[category] || [])];
        const index = current.indexOf(value);
        if (index === -1) {
            current.push(value);
        } else {
            current.splice(index, 1);
        }
        const updatedFilters = { ...filters, [category]: current };
        setFilters(updatedFilters);
        fetchProperties(updatedFilters); // Immediate fetch on checkbox click
    };

    const handlePriceChange = (e) => {
        const value = parseInt(e.target.value);
        const updatedFilters = { ...filters, maxPrice: value };
        setFilters(updatedFilters);
        debouncedFetch(updatedFilters);
    };

    const handleBhkSelect = (value) => {
        const updatedFilters = {
            ...filters,
            bhk: filters.bhk === value ? "" : value,
        };
        setFilters(updatedFilters);
        fetchProperties(updatedFilters);
    };

    const resetFilters = () => {
        if (fetchTimer.current) clearTimeout(fetchTimer.current);
        const reset = {
            city: "",
            propertyType: [],
            bhk: "",
            maxPrice: 100000000,
            amenities: [],
            furnishing: [],
            sort: "latest",
        };
        setFilters(reset);
        navigate("/properties");
        fetchProperties(reset);
    };

    const handleSortChange = () => {

    }

    // to remove a wishlist
    const handleToggleWishlist = async (propertyId) => {
        try {
            const isWishlisted = wishlistedIds.includes(String(propertyId)); // Ensure string comparison

            if (isWishlisted) {
                // UI Update (Optimistic)
                setWishlistedIds((prev) => prev.filter((id) => id !== String(propertyId)));

                await axios.delete(`${API_URL}/wishlist/${propertyId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else {
                // UI Update (Optimistic)
                setWishlistedIds((prev) => [...prev, String(propertyId)]);

                await axios.post(`${API_URL}/wishlist/${propertyId}`, {}, { // Added empty body {}
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
        } catch (error) {
            console.error("Wishlist toggle failed", error);
            // Optional: Fetch wishlist again to revert UI on error
            fetchWishlist();
        }
    };


    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const initialFilters = {
            ...filters,
            city: queryParams.get("city") || "",
            propertyType: queryParams.get("type") ? [queryParams.get("type")] : [],
            bhk: queryParams.get("bhk") || ""
        };
        setFilters(initialFilters);
        fetchProperties(initialFilters);
    }, [location.search]);

    // --- 3. Render ---

    return (
        <section className={s.pageContainer}>
            <Navbar />
            <div className={s.container}>
                <div className={s.mobileFilterButtonWrapper}>
                    <button onClick={() => setShowMobileFilters(true)} className={s.mobileFilterButton}>
                        <HiFilter /> Show Filters & Search
                    </button>
                </div>

                <div className={s.layout}>
                    {/* Sidebar Filters */}
                    <aside className={`${s.sidebar} ${showMobileFilters ? s.sidebarVisible : s.sidebarHidden}`}>
                        <div className={s.sidebarHeader}>
                            <div className={s.sidebarTitleWrapper}>
                                <HiFilter className={s.sidebarTitleIcon} />
                                <h2 className={s.sidebarTitle}>Filters</h2>
                            </div>
                            <button onClick={resetFilters} className={s.resetButton}>Reset</button>
                        </div>

                        <div className={s.filtersScrollArea}>
                            {/* Location */}
                            <div className={s.filterSection}>
                                <label className={s.filterLabel}>Location</label>
                                <div className={s.searchInputWrapper}>
                                    <HiSearch className={s.searchIcon} />
                                    <input
                                        type="text"
                                        placeholder='Search by city...'
                                        value={filters.city}
                                        onChange={(e) => {
                                            const updated = { ...filters, city: e.target.value };
                                            setFilters(updated);
                                            debouncedFetch(updated);
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Price */}
                            <div className={s.filterSection}>
                                <div className={s.priceHeader}>
                                    <label className={s.filterLabel}>Price Range</label>
                                    <span className={s.priceValue}>
                                        {filters.maxPrice >= 10000000
                                            ? `$${(filters.maxPrice / 10000000).toFixed(2)} Cr`
                                            : `$${(filters.maxPrice / 100000).toFixed(1)} L`}
                                    </span>
                                </div>
                                <input
                                    type="range" min="100000" max="100000000" step="500000"
                                    value={filters.maxPrice}
                                    onChange={handlePriceChange}
                                    className={s.priceSlider}
                                />
                            </div>

                            {/* Property Type */}
                            <div className={s.filterSection}>
                                <label className={s.filterLabel}>Property Type</label>
                                <div className={s.checkboxGroup}>
                                    {propertyTypes.map((type) => (
                                        <label key={type.value} className={s.checkboxLabel}>
                                            <input
                                                type="checkbox"
                                                checked={filters.propertyType.includes(type.value)}
                                                onChange={() => handleCheckboxChange("propertyType", type.value)}
                                                className={s.checkbox}
                                            />
                                            {type.label}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* BHK */}
                            <div className={s.filterSection}>
                                <label className={s.filterLabel}>BHK (Bedrooms)</label>
                                <div className={s.bhkGroup}>
                                    {bhkOptions.map((option) => (
                                        <button
                                            key={option}
                                            onClick={() => handleBhkSelect(option)}
                                            className={`${s.bhkButton} ${filters.bhk === option ? s.bhkButtonActive : s.bhkButtonInactive}`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Furnishing Filter */}
                            <div className={s.filterSection}>
                                <label className={s.filterLabel}>Furnishing Status</label>
                                <div className={s.checkboxGroup}>
                                    {furnishingOptions.map((option) => (
                                        <label key={option.value} className={s.checkboxLabel}>
                                            <input
                                                type="checkbox"
                                                checked={filters.furnishing.includes(option.value)}
                                                onChange={() => handleCheckboxChange("furnishing", option.value)}
                                                className={s.checkbox}
                                            />
                                            {option.label}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main List */}
                    <main className={s.mainContent}>
                        <div className={s.contentHeader}>
                            <div>
                                <span className={s.resultCount}>
                                    Showing <strong>{loading ? "---" : properties.length}</strong> properties
                                </span>
                            </div>

                            <div className={s.headerControls}>
                                <div className={s.viewModeToggle}>
                                    <button
                                        onClick={() => setViewMode("grid")}
                                        className={`${s.viewModeButton} ${viewMode === "grid"
                                            ? s.viewModeActive
                                            : s.viewModeInactive
                                            }`}
                                    >
                                        <HiViewGrid size={20} />
                                    </button>
                                    <button
                                        onClick={() => setViewMode("list")}
                                        className={`${s.viewModeButton} ${viewMode === "list"
                                            ? s.viewModeActive
                                            : s.viewModeInactive
                                            }`}
                                    >
                                        <HiViewList size={20} />
                                    </button>
                                </div>

                                <div className={s.sortControl}>
                                    <span className={s.sortLabel}>
                                        Sort:
                                    </span>

                                    <select
                                        value={filters.sort}
                                        onChange={handleSortChange}
                                        className={s.sortSelect}
                                    >
                                        <option value="latest">Latest</option>
                                        <option value="priceLow">Price: Low to High</option>
                                        <option value="priceHigh">Price: High to Low</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* property grid */}
                        {loading ? (
                            <div className={s.skeletonGrid}>
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className={s.skeletonCard}>

                                    </div>
                                ))}
                            </div>
                        ) : error ? (
                            <div className={s.errorContainer}>
                                <HiX size={48} className={s.errorIcon} />
                                <h3 className={s.errorTitle}>{error}</h3>
                                <button
                                    onClick={applyFilters}
                                    className={s.errorButton}
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : properties.length === 0 ? (
                            <div className={s.emptyContainer}>
                                <div className={s.emptyIconWrapper}>
                                    <HiAdjustments size={32} className={s.emptyIcon} />
                                </div>
                                <h2 className={s.emptyTitle}>No Properties found</h2>
                                <p className={s.emptyText}>
                                    Broaden your search criteria
                                </p>

                                <button onClick={resetFilters} className={s.emptyButton}>
                                    Clear All
                                </button>
                            </div>
                        ) : (
                            <div className={`${s.propertyList} ${viewMode === "grid" ? s.propertyListGrid : s.propertyListList
                                }`}>
                                {properties.filter((p) => p).map((p) => (
                                    <PropertyCard
                                        key={p._id}
                                        property={p}
                                        isWishlisted={wishlistedIds.includes(String(p._id))}
                                        onToggleWishlist={handleToggleWishlist}
                                    />
                                ))}

                            </div>
                        )}
                    </main>
                </div>
            </div>

            {showMobileFilters && (
                <div onClick={() =>
                    setShowMobileFilters(false)}
                    className={s.mobileOverlay}
                />
            )}
        </section>
    );
};

export default Properties;






