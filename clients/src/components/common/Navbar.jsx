import React, { useState } from 'react'
import { navbarStyles as s } from "../../assets/dummyStyles"
import Logo from './Logo'
import { useAuth } from '../../context/AuthContent'
import { Link } from 'react-router-dom'
import { HiMenuAlt3, HiOutlineLogout, HiX } from 'react-icons/hi'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  const toggleMenu = () => setIsOpen(prev => !prev);
  const closeMenu = () => setIsOpen(false);

  // Build nav links based on auth state and role
  const navLinks = (linkClass) => (
    <>
      {!user && (
        <>
          <Link to="/properties" className={linkClass} onClick={closeMenu}>
            Browse Properties
          </Link>
          <Link to="/login" className={linkClass} onClick={closeMenu}>
            Login
          </Link>
          <Link to="/register" className={linkClass} onClick={closeMenu}>
            Register
          </Link>
        </>
      )}

      {user?.role === "buyer" && (
        <>
          <Link to="/" className={linkClass} onClick={closeMenu}>
            Home
          </Link>
          <Link to="/properties" className={linkClass} onClick={closeMenu}>
            Properties
          </Link>
          <Link to="/wishlist" className={linkClass} onClick={closeMenu}>
            Wishlist
          </Link>
          <Link to="/chat-messages" className={linkClass} onClick={closeMenu}>
            Message
          </Link>
          <Link to="/contact" className={linkClass} onClick={closeMenu}>
            Contact
          </Link>
        </>
      )}

      {user?.role === "seller" && (
        <Link to="/dashboard" className={linkClass} onClick={closeMenu}>
          Dashboard
        </Link>
      )}

      {user?.role === "admin" && (
        <Link to="/admin-dashboard" className={linkClass} onClick={closeMenu}>
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
              {navLinks(s.navLink)}
            </div>
            <div className={s.rightSection}>
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

              {/* mobile toggle — always the hamburger icon */}
              <div className={s.mobileToggle} onClick={toggleMenu}>
                <HiMenuAlt3 size={22} />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* backdrop */}
      <div className={s.backdrop(isOpen)} onClick={closeMenu}></div>

      {/* dropdown panel */}
      <div className={s.dropdown(isOpen)}>
        <div className={s.dropdownInner}>

          <div className={s.drawerHeader}>
            <Logo />

            <HiX
              size={28}
              onClick={() => setIsOpen(false)}
              className={s.drawerCloseIcon}
            />
          </div>
          <div className={s.dropdownNavLinks}>
            {navLinks(s.dropdownLink)}
          </div>

          {user && (
            <>
              <div className={s.dropdownDivider}></div>
              <div className={s.dropdownUserSection}>
                <div className={s.dropdownUserInfo}>
                  <img src={
                    user.profilePic ||
                    `https://ui-avatars.com/api/?name=${user.name}&background=0d6e59&color=fff`
                  }
                    alt="Profile"
                    className={s.dropdownAvatar} />
                  <div>
                    <div className={s.dropdownUserName}>{user.name || ''}</div>
                    <div className={s.dropdownUserEmail}>{user.email || ''}</div>
                  </div>
                </div>

                <button onClick={logout} className={s.dropdownLogoutIcon}>
                  <HiOutlineLogout size={20} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
