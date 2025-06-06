import { memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { Container } from "react-bootstrap";
import {
  FaUser,
  FaShoppingCart,
  FaUserCircle,
  FaCog,
  FaSignOutAlt,
  FaBook,
  FaSearch,
  FaChevronDown,
  FaBars,
} from "react-icons/fa";

import NavBar, { NavBarMobile } from "../NavBar";
import Search from "../Search";

import authApi from "../../../api/authApi";
import { logout } from "../../../redux/actions/auth";
import { destroy } from "../../../redux/actions/cart";

import styles from "./Header.module.css";

function Header() {
  console.log("header Render");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth);
  const cart = useSelector((state) => state.cart);

  const handleLogout = async () => {
    const resultLogout = await authApi.logout();
    console.log(resultLogout);
    dispatch(logout());
    dispatch(destroy());
    const token = localStorage.getItem("accessToken");
    if (token) {
      localStorage.removeItem("accessToken");
    }
    navigate({ pathname: "/" });
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerMain}>
        <Container>
          <div className={styles.headerContent}>
            {/* Mobile Menu Button */}
            <div className={styles.mobileMenuBtn}>
              <NavBarMobile />
            </div>

            {/* Logo */}
            <div className={styles.logo}>
              <Link to="/" className={styles.logoLink}>
                <div className={styles.logoIcon}>
                  <FaBook />
                </div>
                <h1 className={styles.logoText}>BookStore</h1>
              </Link>
            </div>

            {/* Search Bar - Desktop */}
            <div className={styles.searchDesktop}>
              <div className={styles.searchWrapper}>
                <Search />
              </div>
            </div>

            {/* Navigation - Desktop */}
            <div className={styles.navDesktop}>
              <NavBar />
            </div>

            {/* Right Actions */}
            <div className={styles.headerActions}>
              {/* Account */}
              <div className={styles.accountSection}>
                {currentUser.email && currentUser.fullName ? (
                  <div className={styles.userAccount}>
                    <div className={styles.userInfo}>
                      <div className={styles.userAvatar}>
                        {currentUser?.avatar?.url ? (
                          <img
                            src={currentUser.avatar.url}
                            alt={currentUser.fullName}
                          />
                        ) : (
                          <FaUserCircle />
                        )}
                      </div>
                      <div className={styles.userDetails}>
                        <span className={styles.userName}>
                          {currentUser.fullName}
                        </span>
                        <span className={styles.userRole}>
                          {currentUser.role > 0
                            ? "Quản trị viên"
                            : "Khách hàng"}
                        </span>
                      </div>
                      <FaChevronDown className={styles.dropdownIcon} />
                    </div>

                    <div className={styles.userDropdown}>
                      <div className={styles.dropdownHeader}>
                        <div className={styles.dropdownAvatar}>
                          {currentUser?.avatar?.url ? (
                            <img
                              src={currentUser.avatar.url}
                              alt={currentUser.fullName}
                            />
                          ) : (
                            <FaUserCircle />
                          )}
                        </div>
                        <div className={styles.dropdownUserInfo}>
                          <span className={styles.dropdownUserName}>
                            {currentUser.fullName}
                          </span>
                          <span className={styles.dropdownUserEmail}>
                            {currentUser.email}
                          </span>
                        </div>
                      </div>

                      <div className={styles.dropdownDivider}></div>

                      <div className={styles.dropdownItems}>
                        {currentUser.role === 0 && (
                          <Link to="/tai-khoan" className={styles.dropdownItem}>
                            <FaUser className={styles.dropdownItemIcon} />
                            <span>Tài khoản của tôi</span>
                          </Link>
                        )}
                        {currentUser.role > 0 && (
                          <Link to="/admin" className={styles.dropdownItem}>
                            <FaCog className={styles.dropdownItemIcon} />
                            <span>Quản lý BookStore</span>
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className={styles.dropdownItem}
                        >
                          <FaSignOutAlt className={styles.dropdownItemIcon} />
                          <span>Đăng xuất</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link to="/dang-nhap" className={styles.loginBtn}>
                    <FaUser className={styles.actionIcon} />
                    <span className={styles.actionText}>Đăng nhập</span>
                  </Link>
                )}
              </div>

              {/* Cart */}
              <div className={styles.cartSection}>
                <Link to="/gio-hang" className={styles.cartBtn}>
                  <div className={styles.cartIcon}>
                    <FaShoppingCart />
                    {cart.list.length > 0 && (
                      <span className={styles.cartBadge}>
                        {cart.list.length}
                      </span>
                    )}
                  </div>
                  <span className={styles.actionText}>Giỏ hàng</span>
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Mobile Search */}
      <div className={styles.searchMobile}>
        <Container>
          <div className={styles.mobileSearchWrapper}>
            <Search />
          </div>
        </Container>
      </div>
    </header>
  );
}

export default memo(Header);
