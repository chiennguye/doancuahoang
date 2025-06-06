import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import {
  FaPaperPlane,
  FaFacebookF,
  FaYoutube,
  FaInstagram,
  FaTwitter,
  FaBook,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
  FaArrowRight,
  FaHeart,
  FaShoppingBag,
  FaInfoCircle,
  FaShieldAlt,
  FaTruck,
} from "react-icons/fa";

import genreApi from "../../../api/genreApi";
import styles from "./Footer.module.css";

function Footer() {
  const [genres, setGenres] = useState([]);
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const { data } = await genreApi.getAll({ page: 1, limit: 6 });
        setGenres(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchGenres();
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsSubscribing(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubscribing(false);
      setEmail("");
      // Add success notification here
    }, 1000);
  };

  return (
    <footer className={styles.footer}>
      {/* Main Footer */}
      <div className={styles.footerMain}>
        <Container>
          <Row className="g-4">
            {/* Company Info */}
            <Col lg={3} md={6} sm={12}>
              <div className={styles.footerSection}>
                <div className={styles.brandSection}>
                  <Link to="/" className={styles.brandLink}>
                    <div className={styles.brandIcon}>
                      <FaBook />
                    </div>
                    <h2 className={styles.brandName}>BookStore</h2>
                  </Link>
                  <p className={styles.brandDescription}>
                    Cửa hàng sách trực tuyến hàng đầu Việt Nam với hàng nghìn
                    đầu sách đa dạng và chất lượng cao.
                  </p>
                </div>

                <div className={styles.contactInfo}>
                  <div className={styles.contactItem}>
                    <FaMapMarkerAlt className={styles.contactIcon} />
                    <span>
                      Số 1, ngõ 45, phố Hoàng Quốc Việt, phường Nghĩa Tân, quận Cầu Giấy, Hà Nội
                    </span>
                  </div>
                  <div className={styles.contactItem}>
                    <FaEnvelope className={styles.contactIcon} />
                    <span>bookstore@gmail.com</span>
                  </div>
                  <div className={styles.contactItem}>
                    <FaPhone className={styles.contactIcon} />
                    <span>(+84) 123 456 789</span>
                  </div>
                </div>

                <div className={styles.socialSection}>
                  <h4 className={styles.sectionTitle}>Kết nối với chúng tôi</h4>
                  <div className={styles.socialLinks}>
                    <a
                      href="#"
                      className={styles.socialLink}
                      aria-label="Facebook"
                    >
                      <FaFacebookF />
                    </a>
                    <a
                      href="#"
                      className={styles.socialLink}
                      aria-label="Youtube"
                    >
                      <FaYoutube />
                    </a>
                    <a
                      href="#"
                      className={styles.socialLink}
                      aria-label="Instagram"
                    >
                      <FaInstagram />
                    </a>
                    <a
                      href="#"
                      className={styles.socialLink}
                      aria-label="Twitter"
                    >
                      <FaTwitter />
                    </a>
                  </div>
                </div>
              </div>
            </Col>

            {/* Quick Links - Products */}
            <Col lg={2} md={3} sm={6} xs={6}>
              <div className={styles.footerSection}>
                <h4 className={styles.sectionTitle}>
                  <FaShoppingBag className={styles.titleIcon} />
                  Sản phẩm
                </h4>
                <ul className={styles.linkList}>
                  {genres.map((genre) => (
                    <li key={genre._id}>
                      <Link
                        to={`/san-pham/the-loai/${genre.slug}`}
                        className={styles.footerLink}
                      >
                        <FaArrowRight className={styles.linkIcon} />
                        {genre.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </Col>

            {/* Navigation */}
            <Col lg={2} md={3} sm={6} xs={6}>
              <div className={styles.footerSection}>
                <h4 className={styles.sectionTitle}>
                  <FaInfoCircle className={styles.titleIcon} />
                  Danh mục
                </h4>
                <ul className={styles.linkList}>
                  <li>
                    <Link to="/" className={styles.footerLink}>
                      <FaArrowRight className={styles.linkIcon} />
                      Trang chủ
                    </Link>
                  </li>
                  <li>
                    <Link to="/gioi-thieu" className={styles.footerLink}>
                      <FaArrowRight className={styles.linkIcon} />
                      Giới thiệu
                    </Link>
                  </li>
                  <li>
                    <Link to="/lien-he" className={styles.footerLink}>
                      <FaArrowRight className={styles.linkIcon} />
                      Liên hệ
                    </Link>
                  </li>
                  <li>
                    <Link to="/san-pham" className={styles.footerLink}>
                      <FaArrowRight className={styles.linkIcon} />
                      Sản phẩm
                    </Link>
                  </li>
                </ul>
              </div>
            </Col>

            {/* Policies */}
            <Col lg={2} md={6} sm={6} xs={6}>
              <div className={styles.footerSection}>
                <h4 className={styles.sectionTitle}>
                  <FaShieldAlt className={styles.titleIcon} />
                  Chính sách
                </h4>
                <ul className={styles.linkList}>
                  <li>
                    <Link
                      to="/chinh-sach-doi-tra"
                      className={styles.footerLink}
                    >
                      <FaArrowRight className={styles.linkIcon} />
                      Chính sách đổi trả
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/chinh-sach-van-chuyen"
                      className={styles.footerLink}
                    >
                      <FaArrowRight className={styles.linkIcon} />
                      <FaTruck className={styles.linkExtraIcon} />
                      Chính sách vận chuyển
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/chinh-sach-bao-mat"
                      className={styles.footerLink}
                    >
                      <FaArrowRight className={styles.linkIcon} />
                      Chính sách bảo mật
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/dieu-khoan-su-dung"
                      className={styles.footerLink}
                    >
                      <FaArrowRight className={styles.linkIcon} />
                      Điều khoản sử dụng
                    </Link>
                  </li>
                </ul>
              </div>
            </Col>

            {/* Newsletter */}
            <Col lg={3} md={6} sm={12}>
              <div className={styles.footerSection}>
                <h4 className={styles.sectionTitle}>
                  <FaEnvelope className={styles.titleIcon} />
                  Đăng ký nhận tin
                </h4>
                <p className={styles.newsletterDescription}>
                  Nhận thông tin về sách mới, khuyến mãi và tin tức từ
                  BookStore.
                </p>

                <form
                  onSubmit={handleSubscribe}
                  className={styles.newsletterForm}
                >
                  <div className={styles.inputGroup}>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Nhập email của bạn..."
                      className={styles.emailInput}
                      required
                    />
                    <button
                      type="submit"
                      className={styles.subscribeBtn}
                      disabled={isSubscribing}
                    >
                      {isSubscribing ? (
                        <div className={styles.loadingSpinner}></div>
                      ) : (
                        <FaPaperPlane />
                      )}
                    </button>
                  </div>
                </form>

                <div className={styles.newsletterBenefits}>
                  <div className={styles.benefit}>
                    <FaHeart className={styles.benefitIcon} />
                    <span>Ưu đãi độc quyền</span>
                  </div>
                  <div className={styles.benefit}>
                    <FaBook className={styles.benefitIcon} />
                    <span>Sách mới nhất</span>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Footer Bottom */}
      <div className={styles.footerBottom}>
        <Container>
          <div className={styles.bottomContent}>
            <div className={styles.copyright}>
              <p>
                &copy; 2024 BookStore. Made with{" "}
                <FaHeart className={styles.heartIcon} /> in Vietnam
              </p>
            </div>
            <div className={styles.bottomLinks}>
              <Link to="/privacy" className={styles.bottomLink}>
                Quyền riêng tư
              </Link>
              <Link to="/terms" className={styles.bottomLink}>
                Điều khoản
              </Link>
              <Link to="/sitemap" className={styles.bottomLink}>
                Sơ đồ trang
              </Link>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
}

export default Footer;
