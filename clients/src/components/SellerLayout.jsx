import { useState } from "react"
import {sellerLayoutStyles as s} from "../assets/dummyStyles"
import { useAuth } from "../context/AuthContent"
import SellerSidebar from "./SellerSidebar"
import { Outlet, useLocation } from "react-router-dom"
import PendingApproved from "../pages/seller/PendingApproved"
import DashboardNavbar from "./DashboardNavbar"

const SellerLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const {user} = useAuth();
    const location = useLocation();

    // allow access to public route for seller
    const isPubicDashboardRoute = ['/contact', 'profile'].includes(
        location.pathname,
    )
  return (
     <div className={s.container}> 
            <SellerSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />
            <div className={s.contentWrapper}>  
                <DashboardNavbar onMenuClick={() => setIsSidebarOpen(true)} />
                <main className={s.main}>  
                    {user?.isApproved || isPubicDashboardRoute ? (
                        <Outlet/>
                    ): (
                        <PendingApproved/>
                    )}
                </main>
            </div>
        </div>
  )
}

export default SellerLayout