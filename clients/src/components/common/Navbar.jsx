import React, { useState } from 'react'
import { navbarStyles as s } from "../../assets/dummyStyles"
import Logo from './Logo'
import { useAuth } from '../../context/AuthContent'
import { Link } from 'react-router-dom'
import { HiMenuAlt3, HiX } from 'react-icons/hi'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  const toggleMenu = () => setIsOpen(prev => !prev);
  const closeMenu = () => setIsOpen(false);

  // Build nav links based on auth state and role
  const navLinks = (
    <>
      {/* Unauthenticated — show public Browse link plus Login/Register */}
      {!user && (
        <>
          <Link to="/properties" className={s.navLink} onClick={closeMenu}>
            Browse Properties
          </Link>
          <Link to="/login" className={s.navLink} onClick={closeMenu}>
            Login
          </Link>
          <Link to="/register" className={s.navLink} onClick={closeMenu}>
            Register
          </Link>
        </>
      )}

      {/* Buyer */}
      {user?.role === "buyer" && (
        <>
          <Link to="/" className={s.navLink} onClick={closeMenu}>
            Home
          </Link>
          <Link to="/properties" className={s.navLink} onClick={closeMenu}>
            Properties
          </Link>
          <Link to="/wishlist" className={s.navLink} onClick={closeMenu}>
            Wishlist
          </Link>
          <Link to="/chat-messages" className={s.navLink} onClick={closeMenu}>
            Message
          </Link>
          <Link to="/contact" className={s.navLink} onClick={closeMenu}>
            Contact
          </Link>
        </>
      )}

      {/* Seller */}
      {user?.role === "seller" && (
        <Link to="/dashboard" className={s.navLink} onClick={closeMenu}>
          Dashboard
        </Link>
      )}

      {/* Admin */}
      {user?.role === "admin" && (
        <Link to="/admin-dashboard" className={s.navLink} onClick={closeMenu}>
          Admin Panel
        </Link>
      )}


    </>
  );

  return (
    <>
      <nav className={s.nav}>
        <div className={s.container}>
          <div className={s.grid}>
            {/* Logo */}
            <div className="justify-self-start">
              <Logo />
            </div>
            {/* Desktop menu */}
            <div className={s.desktopMenu}>
              {navLinks}
            </div>
            <div className={s.rightSection}>
              {/* {right} */}

              {user ? (
                <div className={s.userSection}>
                  <Link to="/profile" className='flex items-center'>
                    <img src={
                      user.profilePic ||
                      `https://ui-avatars.com/api/?name=${user.name}&background=0d6e59&color=fff`
                    }
                      alt="Profile"
                      className={s.avatar} />
                  </Link>
                  <button
                    onClick={logout}
                    className={s.logoutButton}
                  >Logout</button>
                </div>
              ) : null}

              {/* moblie toogle */}
              <div className={s.mobileToggle} onClick={toggleMenu}>
                {isOpen ? <HiX size={28} /> : <HiMenuAlt3 size={28} />}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className={s.backdrop} onClick={() => setIsOpen(false)}></div>

      <div className={s.drawer(isOpen)}>
        <div className={s.drawerHeader}>
          <Logo />

          <HiX
            size={28}
            onClick={() => setIsOpen(false)}
            className={s.drawerCloseIcon}
          />
        </div>

        <div className={s.drawerNavLinks}>{navLinks}</div>

        {user && (
          <div className={s.drawerUserSection}>
            <div className={s.drawerUserInfo}>
              <img src={
                user.profilePic ||
                `https://ui-avatars.com/api/?name=${user.name}&background=0d6e59&color=fff`
              }
                alt="Profile"
                className={s.drawerAvatar} />
            </div>
          </div>
        )}

        {user && (
          <>
            <div className={s.drawerUserName}>
              {user.name || ''}
            </div>
            <div className={s.drawerUserEmail}>
              {user.email || ''}
            </div>
          </>
        )}

      </div>
    </>
  );
};

export default Navbar;