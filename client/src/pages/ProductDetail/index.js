import React, { useEffect, useState } from "react";
import {
  Col,
  Container,
  Row,
  Badge,
  Button,
  Breadcrumb,
  NavLink,
  Card,
} from "react-bootstrap";
import {
  AiOutlineMinus,
  AiOutlinePlus,
  AiOutlineShoppingCart,
  AiOutlineHeart,
  AiOutlineShareAlt,
} from "react-icons/ai";
import { BsShieldCheck, BsTruck, BsArrowRepeat } from "react-icons/bs";
import { toast } from "react-toastify";

import DetailedBookInfo from "../../components/Shop/DetailedBookInfo";
import Loading from "../../components/Loading";

import { useNavigate, useParams } from "react-router-dom";
import bookApi from "../../api/bookApi";
import userApi from "../../api/userApi";
import { addToCart } from "../../redux/actions/cart";
import { useDispatch, useSelector } from "react-redux";
import format from "../../helper/format";
import styles from "./ProductDetail.module.css";
import { useBook } from "../../contexts/BookContext";

export default function ProductDetail() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const params = useParams();
  const { slug } = params;

  const cartData = useSelector((state) => state.cart);
  const currentUser = useSelector((state) => state.auth);
  const { shouldRefresh, lastUpdateTime } = useBook();

  const [bookData, setBookData] = useState({});
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const addToCart = async () => {
      try {
        const { list } = cartData;
        const newList = list.map((item) => {
          return { product: item.product._id, quantity: item.quantity };
        });
        await userApi.updateCart(currentUser.userId, { cart: newList });
      } catch (error) {
        console.log(error);
      }
    };
    if (currentUser && currentUser.userId) {
      addToCart();
    }
  }, [cartData, currentUser]);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        const res = await bookApi.getBySlug(slug);
        setLoading(false);
        setBookData(res.data);
      } catch (error) {
        setLoading(false);
        console.log(error);
      }
    };
    fetchBook();
  }, [slug, shouldRefresh, lastUpdateTime]);

  const decQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const incQuantity = () => {
    if (quantity < bookData.quantity) {
      setQuantity(parseInt(quantity + 1));
    } else {
      toast.info(`Chỉ còn ${bookData.quantity} cuốn trong kho!`, {
        autoClose: 2000,
      });
    }
  };

  const handleChange = (e) => {
    const newQuantity = parseInt(e.target.value);
    if (newQuantity) {
      if (newQuantity > bookData.quantity) {
        toast.info(`Chỉ còn ${bookData.quantity} cuốn trong kho!`, {
          autoClose: 2000,
        });
        setQuantity(bookData.quantity);
      } else {
        setQuantity(newQuantity);
      }
    } else {
      setQuantity("");
    }
  };

  const handleAddToCart = () => {
    if (currentUser && currentUser.userId) {
      if (quantity > bookData.quantity) {
        toast.error(`Chỉ còn ${bookData.quantity} cuốn trong kho!`, {
          autoClose: 2000,
        });
        setQuantity(bookData.quantity);
        return;
      }

      const {
        _id: productId,
        name,
        imageUrl,
        slug,
        price,
        discount,
      } = bookData;
      let newPrice = price;
      if (discount > 0) {
        newPrice = price - (price * discount) / 100;
      }
      const action = addToCart({
        quantity,
        productId,
        name,
        imageUrl,
        slug,
        price: newPrice,
        totalPriceItem: newPrice * quantity,
        product: {
          _id: productId,
          name,
          imageUrl,
          slug,
          price: newPrice,
          quantity: bookData.quantity
        }
      });
      dispatch(action);
      toast.success("Thêm sản phẩm vào giỏ hàng thành công!", {
        autoClose: 2000,
      });
    } else {
      toast.info("Vui lòng đăng nhập để thực hiện!", { autoClose: 2000 });
    }
  };

  const handleBuyNow = () => {
    if (currentUser && currentUser.userId) {
      if (quantity > bookData.quantity) {
        toast.error(`Chỉ còn ${bookData.quantity} cuốn trong kho!`, {
          autoClose: 2000,
        });
        setQuantity(bookData.quantity);
        return;
      }

      const {
        _id: productId,
        name,
        imageUrl,
        slug,
        price,
        discount,
      } = bookData;
      let newPrice = price;
      if (discount > 0) {
        newPrice = price - (price * discount) / 100;
      }
      const action = addToCart({
        quantity,
        productId,
        name,
        imageUrl,
        slug,
        price: newPrice,
        totalPriceItem: newPrice * quantity,
        product: {
          _id: productId,
          name,
          imageUrl,
          slug,
          price: newPrice,
          quantity: bookData.quantity
        }
      });
      dispatch(action);
      navigate({ pathname: "/gio-hang" });
    } else {
      toast.info("Vui lòng đăng nhập để thực hiện!", { autoClose: 2000 });
    }
  };

  const toggleFavorite = () => {
    if (currentUser && currentUser.userId) {
      setIsFavorite(!isFavorite);
      toast.success(
        isFavorite ? "Đã xóa khỏi yêu thích!" : "Đã thêm vào yêu thích!",
        { autoClose: 2000 }
      );
    } else {
      toast.info("Vui lòng đăng nhập để thực hiện!", { autoClose: 2000 });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: bookData.name,
        text: `Xem sách "${bookData.name}" tại BookStore`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Đã sao chép link!", { autoClose: 2000 });
    }
  };

  const calculateDiscount = () => {
    if (bookData.discount > 0) {
      return bookData.price - (bookData.price * bookData.discount) / 100;
    }
    return bookData.price;
  };

  const renderStars = (rating = 4.5) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <span key={i} className={styles.starFull}>
            ★
          </span>
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <span key={i} className={styles.starHalf}>
            ☆
          </span>
        );
      } else {
        stars.push(
          <span key={i} className={styles.starEmpty}>
            ☆
          </span>
        );
      }
    }
    return stars;
  };

  return (
    <div className={styles.productDetailPage}>
      <Container>
        {!loading ? (
          <>
            {/* Breadcrumb */}
            <div className={styles.breadcrumbSection}>
              <Breadcrumb className={styles.breadcrumb}>
                <Breadcrumb.Item linkAs={NavLink} linkProps={{ to: "/" }}>
                  <span className={styles.breadcrumbIcon}>🏠</span>
                  Trang chủ
                </Breadcrumb.Item>
                <Breadcrumb.Item
                  linkAs={NavLink}
                  linkProps={{ to: "/san-pham" }}
                >
                  <span className={styles.breadcrumbIcon}>📚</span>
                  Sản phẩm
                </Breadcrumb.Item>
                <Breadcrumb.Item active>{bookData.name}</Breadcrumb.Item>
              </Breadcrumb>
            </div>

            <Row className={styles.productBriefing}>
              {/* Product Image */}
              <Col xl={5} lg={6} md={6} xs={12}>
                <div className={styles.imageSection}>
                  <div className={styles.mainImageContainer}>
                    {bookData.discount > 0 && (
                      <div className={styles.discountBadge}>
                        -{bookData.discount}%
                      </div>
                    )}
                    {imageLoading && (
                      <div className={styles.imagePlaceholder}>
                        <div className={styles.loadingSpinner}></div>
                      </div>
                    )}
                    <img
                      src={bookData && bookData.imageUrl}
                      alt={bookData.name}
                      className={styles.mainImage}
                      onLoad={() => setImageLoading(false)}
                      style={{ display: imageLoading ? "none" : "block" }}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className={styles.imageActions}>
                    {/* <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={toggleFavorite}
                      className={`${styles.actionBtn} ${
                        isFavorite ? styles.favoriteActive : ""
                      }`}
                    >
                      <AiOutlineHeart />
                    </Button> */}
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={handleShare}
                      className={styles.actionBtn}
                    >
                      <AiOutlineShareAlt />
                    </Button>
                  </div>
                </div>
              </Col>

              {/* Product Info */}
              <Col xl={7} lg={6} md={6} xs={12}>
                <div className={styles.productInfo}>
                  <div className={styles.productHeader}>
                    <h1 className={styles.productTitle}>
                      {bookData && bookData.name}
                    </h1>

                    {/* Rating */}
                    <div className={styles.ratingSection}>
                      <div className={styles.stars}>{renderStars(4.5)}</div>
                      <span className={styles.ratingText}>
                        (4.5/5 - 123 đánh giá)
                      </span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className={styles.priceSection}>
                    <div className={styles.currentPrice}>
                      {format.formatPrice(calculateDiscount())}
                    </div>
                    {bookData.discount > 0 && (
                      <div className={styles.priceDetails}>
                        <span className={styles.oldPrice}>
                          {format.formatPrice(bookData.price)}
                        </span>
                        <Badge bg="danger" className={styles.savingsBadge}>
                          Tiết kiệm{" "}
                          {format.formatPrice(
                            bookData.price - calculateDiscount()
                          )}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className={styles.productDetails}>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Tác giả:</span>
                      <span className={styles.detailValue}>
                        {bookData &&
                          format.arrayToString(bookData?.author || [])}
                      </span>
                    </div>

                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Nhà xuất bản:</span>
                      <span className={styles.detailValue}>
                        {bookData && bookData.publisher?.name} -{" "}
                        {bookData && bookData.year}
                      </span>
                    </div>

                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Thể loại:</span>
                      <span className={styles.detailValue}>
                        {bookData.genre?.map((g, index) => (
                          <Badge
                            key={g._id}
                            bg="secondary"
                            className={styles.genreBadge}
                          >
                            {g.name}
                          </Badge>
                        ))}
                      </span>
                    </div>

                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Số lượng:</span>
                      <span className={styles.detailValue}>
                        {bookData.quantity || 0} cuốn
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className={styles.description}>
                    <h4>Mô tả sản phẩm</h4>
                    <div
                      className={styles.descriptionContent}
                      dangerouslySetInnerHTML={{
                        __html: bookData?.description,
                      }}
                    />
                  </div>

                  {/* Quantity & Actions */}
                  <div className={styles.purchaseSection}>
                    <div className={styles.quantitySection}>
                      <span className={styles.quantityLabel}>Số lượng:</span>
                      {bookData.quantity > 0 ? (
                        <div className={styles.quantityControls}>
                          <button
                            className={styles.quantityBtn}
                            onClick={decQuantity}
                          >
                            <AiOutlineMinus />
                          </button>
                          <input
                            type="text"
                            className={styles.quantityInput}
                            value={quantity}
                            onChange={handleChange}
                          />
                          <button
                            className={styles.quantityBtn}
                            onClick={incQuantity}
                          >
                            <AiOutlinePlus />
                          </button>
                        </div>
                      ) : (
                        <span className={styles.outOfStock}>Hết hàng</span>
                      )}
                    </div>

                    <div className={styles.actionButtons}>
                      <Button
                        className={`${styles.addToCartBtn} ${bookData.quantity === 0 ? styles.disabledBtn : ''}`}
                        onClick={handleAddToCart}
                        size="lg"
                        disabled={bookData.quantity === 0}
                      >
                        <AiOutlineShoppingCart className={styles.btnIcon} />
                        Thêm vào giỏ hàng
                      </Button>
                      <Button
                        className={`${styles.buyNowBtn} ${bookData.quantity === 0 ? styles.disabledBtn : ''}`}
                        onClick={handleBuyNow}
                        size="lg"
                        disabled={bookData.quantity === 0}
                      >
                        Mua ngay
                      </Button>
                    </div>
                  </div>

                  {/* Guarantees */}
                  <div className={styles.guarantees}>
                    <div className={styles.guaranteeItem}>
                      <BsTruck className={styles.guaranteeIcon} />
                      <span>Miễn phí vận chuyển</span>
                    </div>
                    <div className={styles.guaranteeItem}>
                      <BsArrowRepeat className={styles.guaranteeIcon} />
                      <span>Đổi trả trong 30 ngày</span>
                    </div>
                    <div className={styles.guaranteeItem}>
                      <BsShieldCheck className={styles.guaranteeIcon} />
                      <span>Bảo hành chính hãng</span>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>

            {/* Detailed Info */}
            <div className={styles.detailedInfoSection}>
              <DetailedBookInfo data={bookData} />
            </div>
          </>
        ) : (
          <div className={styles.loadingContainer}>
            <Loading />
          </div>
        )}
      </Container>
    </div>
  );
}
